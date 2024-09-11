import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { AWS_S3_SERVICE, NOTIFICATION_SERVICE } from '@app/common/constants';
import { ClientProxy } from '@nestjs/microservices';
import {
  ChangePasswordDto,
  CheckEmailDto,
  CreateNormalUserDto,
  createTTL,
} from '@app/common';
import * as argon2 from 'argon2';
import * as Jimp from 'jimp';
import { ConfigService } from '@nestjs/config';
import { SignInDto } from '@app/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './interfaces/token-payload.interface';
import { CheckCodeDto } from '@app/common/dto/auth-dto/check-code.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AdminCodeInterface } from './interfaces/admin-code.interface';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationService: ClientProxy,
    @Inject(AWS_S3_SERVICE)
    private readonly awss3Service: ClientProxy,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  createImageNameFromFullname(fullname: string): string {
    let imageName = fullname.split(' ').join('_');
    //get current time
    const timestamp = new Date().getTime();
    imageName = `default_${timestamp}_${imageName}`;
    return imageName;
  }

  isValidBirthday(birthday: string): boolean {
    // Regex để kiểm tra định dạng dd/mm/yyyy
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;

    // Kiểm tra nếu chuỗi birthday khớp với regex
    const match = birthday.match(regex);
    if (!match) {
      return false;
    }

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    // Kiểm tra các giá trị ngày, tháng, năm có hợp lệ không
    if (
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31 ||
      year < 1900 ||
      year >= new Date().getFullYear()
    ) {
      return false;
    }

    // Kiểm tra số ngày trong tháng
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day > daysInMonth) {
      return false;
    }

    return true;
  }

  async createDefaultProfileImage(fullname: string): Promise<Buffer> {
    // Lấy chữ cái đầu tiên của tên và họ
    const firstnameLetter = fullname.split(' ')[0].charAt(0).toUpperCase();
    const lastnameLetter = fullname.split(' ')[1].charAt(0).toUpperCase();
    const name = `${firstnameLetter} ${lastnameLetter}`;

    // Tạo ảnh mới với kích thước 100x100 và nền đen
    const image = new Jimp(100, 100, '#000000');

    // Tải font chữ
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

    // Vị trí của văn bản trong ảnh
    const textPosition = {
      text: name,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    };

    // Thêm văn bản vào ảnh
    image.print(font, 0, 0, textPosition, 100, 100);

    // Trả về Buffer thay vì lưu file
    const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

    return buffer;
  }

  //sign up
  async checkEmailForSignUp({ email }) {
    //check if email has been registered or not
    const registeredEmail = await this.authRepository.findOne({
      email: email,
      role: 'normal_user',
    });

    //throw error if existed
    if (registeredEmail) {
      throw new ConflictException('Existed Resource');
    }

    //create a 6-digit validation code
    const code = Math.floor(100000 + Math.random() * 900000);

    //hash code
    const hashedCode = await argon2.hash(code.toString(), {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 4,
      parallelism: 2,
      secret: Buffer.from(this.configService.get('ARGON2_SERCET')),
    });

    //send event to notification service to send code
    //to this email if not existed
    this.notificationService.emit('send_code_to_check_email', {
      email,
      code,
    });

    //save code in redis and ttl is 5p
    this.cacheManager.set(
      `sign_up_code:${email}`,
      hashedCode,
      createTTL(60 * 5 * 1000, 0),
    );
  }

  async checkCodeForSignUp({
    code,
    email,
    fullname,
    password,
    birthday,
    country,
  }: CreateNormalUserDto) {
    const id = `sign_up_code:${email}`;
    //get code from redis
    const correctCode: string = await this.cacheManager.get(id);

    //if not found throw bad request
    if (!correctCode) {
      throw new BadRequestException('Expired Resource');
    }

    //compare code
    const isCorrectCode = await argon2.verify(correctCode, code.toString(), {
      secret: Buffer.from(this.configService.get('ARGON2_SERCET')),
    });

    //if found check code is correct or not
    if (!isCorrectCode) {
      throw new BadRequestException('Incorrect Resource');
    }

    //remove code if correct
    await this.cacheManager.del(id);

    //hash password
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // Tăng số lượng bộ nhớ được sử dụng (64MB)
      timeCost: 4, // Tăng số lần lặp lại
      parallelism: 2, // Số luồng đồng thời,
      secret: Buffer.from(this.configService.get('ARGON2_SERCET')),
    });

    //create default profile image
    const image = await this.createDefaultProfileImage(fullname);

    //upload to awss3 to get url
    const imageName = this.createImageNameFromFullname(fullname);
    this.awss3Service.emit('upload_image', {
      image,
      imageName,
    });
    const profileImageUrl = `https://${this.configService.get('BUCKET_NAME')}.s3.${this.configService.get(
      'AWSS3_REGION',
    )}.amazonaws.com/${imageName}`;

    //create new account
    const newUser = {
      email,
      fullname,
      password: hashedPassword,
      birthday,
      country,
      profileImageUrl,
    };
    const user = await this.authRepository.create(newUser);
    delete user.password;
    delete user.role;

    //save user in redis and ttl is 7 days
    await this.cacheManager.set(
      `user:${user.email}`,
      user,
      createTTL(60 * 60 * 24 * 7, 60 * 60 * 24),
    );
  }

  //change password
  async checkEmailForChangePassword({ email }: CheckEmailDto) {
    //check if email has been registered or not
    const registeredEmail = await this.authRepository.findOne({ email: email });

    //throw error if existed
    if (!registeredEmail) {
      throw new NotFoundException('Not Found Resource');
    }

    //create a 6-digit validation code
    const code = Math.floor(100000 + Math.random() * 900000);

    //hash code
    const hashedCode = await argon2.hash(code.toString(), {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 4,
      parallelism: 2,
      secret: Buffer.from(this.configService.get('ARGON2_SERCET')),
    });

    //send event to notification service to send code
    //to this email if not existed
    this.notificationService.emit('send_code_to_change_password', {
      email,
      code,
    });

    //save code in redis and ttl is 5p
    this.cacheManager.set(`change_password_code:${email}`, hashedCode, {
      ttl: createTTL(60 * 5, 0),
    });
  }

  async checkCodeForChangePassword({
    code,
    email,
    password,
  }: ChangePasswordDto) {
    const id = `change_password_code:${email}`;

    //get code from redis
    const correctCode: string = await this.cacheManager.get(id);

    //if not found throw bad request
    if (!correctCode) {
      throw new BadRequestException('Expired Resource');
    }

    //compare code
    const isCorrectCode = await argon2.verify(correctCode, code.toString(), {
      secret: Buffer.from(this.configService.get('ARGON2_SERCET')),
    });

    //if found check code is correct or not
    if (!isCorrectCode) {
      throw new BadRequestException('Incorrect Resource');
    }

    //remove code if correct
    await this.cacheManager.del(id);

    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // Tăng số lượng bộ nhớ được sử dụng (64MB)
      timeCost: 4, // Tăng số lần lặp lại
      parallelism: 2, // Số luồng đồng thời,
      secret: Buffer.from(this.configService.get('ARGON2_SERCET')),
    });

    try {
      await this.authRepository.findOneAndUpdate(
        { email },
        { password: hashedPassword },
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Not Found Resource');
      }
      throw new InternalServerErrorException('Something is wrong');
    }
  }

  //sign in
  async signInAsNormalUser({ email, password }: SignInDto) {
    //find user by email
    const user = await this.authRepository.findOne({
      email,
      role: 'normal_user',
    });

    //if user doesn't exist
    if (!user) {
      throw new UnauthorizedException('Not found credentials');
    }

    //check password is correct or not
    const isCorrectPassword = await argon2.verify(user.password, password, {
      secret: Buffer.from(this.configService.get('ARGON2_SERCET')),
    });

    if (!isCorrectPassword) {
      throw new UnauthorizedException('Incorrect credentials');
    }

    //delete sensitive properties
    delete user.password;
    delete user.role;

    //create sign-in token
    const tokenPayload: TokenPayload = {
      userId: user._id,
    };

    const signInToken = await this.jwtService.signAsync(tokenPayload);

    return {
      user,
      signInToken,
    };
  }

  async signInAsAdmin({ email, password }: SignInDto) {
    //find admin by email
    const admin = await this.authRepository.findOne({
      email,
      $or: [{ role: 'admin' }, { role: 'root_admin' }],
    });

    //if admin doesn't exist
    if (!admin) {
      throw new UnauthorizedException('Not found credentials');
    }

    //check password is correct or not
    const isCorrectPassword = await argon2.verify(admin.password, password, {
      secret: Buffer.from(this.configService.get('ARGON2_SERCET')),
    });

    if (!isCorrectPassword) {
      throw new UnauthorizedException('Incorrect credentials');
    }

    //delete sensitive properties
    delete admin.password;

    //create a 6-digit validation code
    const code = Math.floor(100000 + Math.random() * 900000);

    //hash code
    const hashedCode = await argon2.hash(code.toString(), {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 4,
      parallelism: 2,
      secret: Buffer.from(this.configService.get('ARGON2_SERCET')),
    });

    //send event to notification service to send code
    //to this email
    this.notificationService.emit('send_code_to_sign_in_as_admin', {
      email,
      code,
    });

    const redisRecord: AdminCodeInterface = { code: hashedCode, admin };
    //save code in redis and ttl is 5p
    this.cacheManager.set(
      `admin_sign_in_code:${email}`,
      redisRecord,
      createTTL(60 * 5, 0),
    );
  }

  async checkCodeToSignInAsAdmin({ email, code }: CheckCodeDto) {
    const id = `admin_sign_in_code:${email}`;

    //get code from redis
    const record: AdminCodeInterface = await this.cacheManager.get(id);

    //if not found throw bad request
    if (!record) {
      throw new BadRequestException('Expired Resource');
    }

    const { code: correctCode, admin }: AdminCodeInterface = record;

    //compare code
    const isCorrectCode = await argon2.verify(correctCode, code.toString(), {
      secret: Buffer.from(this.configService.get('ARGON2_SERCET')),
    });

    //if found check code is correct or not
    if (!isCorrectCode) {
      throw new BadRequestException('Incorrect Resource');
    }

    //remove code if correct
    await this.cacheManager.del(id);

    //save admin record to redis
    await this.cacheManager.set(
      `admin:${admin.email}`,
      admin,
      createTTL(60 * 60 * 24 * 7, 60 * 60 * 24),
    );

    //create sign-in token
    const tokenPayload: TokenPayload = {
      userId: admin._id,
    };

    const signInToken = await this.jwtService.signAsync(tokenPayload, {
      secret: this.configService.get('JWT_SECRET_ADMIN'),
      expiresIn: this.configService.get('JWT_EXPIRATION_ADMIN'),
    });

    return { admin, signInToken };
  }
}
