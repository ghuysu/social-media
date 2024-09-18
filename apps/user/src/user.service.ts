import {
  AWS_S3_SERVICE,
  ChangeBirthdayDto,
  ChangeCountryDto,
  ChangeEmailDto,
  ChangeFullnameDto,
  CheckCodeToChangeEmailDto,
  createTTL,
  NOTIFICATION_SERVICE,
  TokenPayloadInterface,
  UserDocument,
} from '@app/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { UserRepository } from './user.repository';
import { ClientProxy } from '@nestjs/microservices';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as Jimp from 'jimp';
import { ChangeEmailPayloadInterface } from './interfaces/change-email-payload.interface';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy,
    @Inject(AWS_S3_SERVICE)
    private readonly awss3Client: ClientProxy,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  private createImageNameFromOriginalname(originalname: string): string {
    const timestamp = new Date().getTime();
    return `${timestamp}_${originalname.split('.').shift()}`;
  }

  private createDefaultImageNameFromFullname(fullname: string): string {
    let imageName = fullname.split(' ').join('_');
    //get current time
    const timestamp = new Date().getTime();
    imageName = `default_${timestamp}_${imageName}`;
    return imageName;
  }

  private async createDefaultProfileImage(fullname: string): Promise<Buffer> {
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

  async getUser({ email, userId, role }: TokenPayloadInterface) {
    let needToSaveIntoRedis = false;

    // Generate key based on role
    const cacheKey = `${role === 'normal_user' ? 'user' : 'admin'}:${email}`;

    //get from redis
    // Get from Redis
    let account: UserDocument = await this.cacheManager.get(cacheKey);

    //if redis don't have, check from db
    if (!account) {
      needToSaveIntoRedis = true;

      if (role === 'normal_user') {
        account = await this.userRepository.findOne(
          {
            _id: userId,
          },
          [{ path: 'friendList', select: '_id fullname profileImageUrl' }],
        );
      } else {
        account = await this.userRepository.findOne({
          _id: userId,
        });
      }

      if (!account) {
        throw new NotFoundException(`Resources not found`);
      }

      // Remove sensitive data
      delete account.password;
    }

    // Set into Redis if necessary
    if (needToSaveIntoRedis) {
      await this.cacheManager.set(cacheKey, account, {
        ttl: createTTL(60 * 60 * 24 * 7, 60 * 60 * 24),
      });
    }

    //return
    return account;
  }

  async changeBirthday(
    { email, userId, role }: TokenPayloadInterface,
    { birthday }: ChangeBirthdayDto,
  ) {
    //update infor in db
    let updatedUser;

    try {
      updatedUser = await this.userRepository.findOneAndUpdate(
        { _id: userId },
        { birthday: birthday },
        [{ path: 'friendList', select: '_id fullname profileImageUrl' }],
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Not Found Resource');
      }
      throw new InternalServerErrorException('Something is wrong');
    }

    //delete sensetive data
    delete updatedUser.password;

    // Generate key based on role
    const cacheKey = `${role === 'normal_user' ? 'user' : 'admin'}:${email}`;

    //update cache
    await this.cacheManager.set(cacheKey, updatedUser, {
      ttl: createTTL(60 * 60 * 24 * 7, 60 * 60 * 24),
    });

    //return
    return updatedUser;
  }

  async changeFullname(
    { email, userId }: TokenPayloadInterface,
    { fullname }: ChangeFullnameDto,
  ) {
    //get redis infor
    let infor: UserDocument = await this.cacheManager.get(`user:${email}`);

    if (!infor) {
      infor = await this.userRepository.findOne({ _id: userId });
    }

    if (!infor) {
      throw new NotFoundException('Not Found Resource');
    }

    //check image is default or not
    const imageName = infor.profileImageUrl.split('/').pop();
    const isDefaultImage = imageName.startsWith('default');

    //if default image, create new default image base on new fullname
    if (isDefaultImage) {
      //delete old image
      this.awss3Client.emit('delete_image', {
        imageName: imageName,
      });

      //create new default image
      const newImageName = this.createDefaultImageNameFromFullname(fullname);

      const image = await this.createDefaultProfileImage(fullname);

      //upload new default image
      this.awss3Client.emit('upload_image', {
        image,
        imageName: newImageName,
      });

      const profileImageUrl = `https://${this.configService.get('BUCKET_NAME')}.s3.${this.configService.get(
        'AWSS3_REGION',
      )}.amazonaws.com/${newImageName}`;

      infor.profileImageUrl = profileImageUrl;
    }

    //update infor in db
    let updatedUser;

    try {
      updatedUser = await this.userRepository.findOneAndUpdate(
        { _id: userId },
        { fullname: fullname, profileImageUrl: infor.profileImageUrl },
        [{ path: 'friendList', select: '_id fullname profileImageUrl' }],
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Not Found Resource');
      }
      throw new InternalServerErrorException('Something is wrong');
    }

    //delete sensetive data
    delete updatedUser.password;

    //update cache
    await this.cacheManager.set(`user:${email}`, updatedUser, {
      ttl: createTTL(60 * 60 * 24 * 7, 60 * 60 * 24),
    });

    //emit message to all client
    this.notificationClient.emit('emit_message', {
      name: 'change_fullname',
      payload: {
        userId: updatedUser._id.toHexString(),
        metadata: {
          fullname: updatedUser.fullname,
          profileImageUrl: updatedUser.profileImageUrl,
        },
      },
    });

    //return
    return updatedUser;
  }

  async changeCountry(
    { email, userId, role }: TokenPayloadInterface,
    { country }: ChangeCountryDto,
  ) {
    //update infor in db
    let updatedUser;

    try {
      updatedUser = await this.userRepository.findOneAndUpdate(
        { _id: userId },
        { country: country },
        [{ path: 'friendList', select: '_id fullname profileImageUrl' }],
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Not Found Resource');
      }
      throw new InternalServerErrorException('Something is wrong');
    }
    //delete sensetive data
    delete updatedUser.password;

    // Generate key based on role
    const cacheKey = `${role === 'normal_user' ? 'user' : 'admin'}:${email}`;

    //update cache
    await this.cacheManager.set(cacheKey, updatedUser, {
      ttl: createTTL(60 * 60 * 24 * 7, 60 * 60 * 24),
    });

    //return
    return updatedUser;
  }

  async changeProfileImage(
    { email, userId, role }: TokenPayloadInterface,
    image: Buffer,
    originalname: string,
  ) {
    // Generate key based on role
    const cacheKey = `${role === 'normal_user' ? 'user' : 'admin'}:${email}`;

    //get redis infor
    let infor: UserDocument = await this.cacheManager.get(cacheKey);

    if (!infor) {
      infor = await this.userRepository.findOne({ _id: userId });
    }

    if (!infor) {
      throw new NotFoundException('Not Found Resource');
    }

    //delete prev image
    const prevImageName: string = infor.profileImageUrl.split('/').pop();
    console.log(prevImageName);

    this.awss3Client.emit('delete_image', {
      imageName: prevImageName,
    });

    //upload new image
    const imageName = this.createImageNameFromOriginalname(originalname);
    console.log(imageName);

    this.awss3Client.emit('upload_image', {
      image,
      imageName,
    });

    const profileImageUrl = `https://${this.configService.get('BUCKET_NAME')}.s3.${this.configService.get(
      'AWSS3_REGION',
    )}.amazonaws.com/${imageName}`;

    //update db
    let updatedUser;

    try {
      updatedUser = await this.userRepository.findOneAndUpdate(
        { _id: userId },
        { profileImageUrl: profileImageUrl },
        [{ path: 'friendList', select: '_id fullname profileImageUrl' }],
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Not Found Resource');
      }
      throw new InternalServerErrorException('Something is wrong');
    }

    //remove sensitive infor
    delete updatedUser.password;

    //update redis
    this.cacheManager.set(cacheKey, updatedUser, {
      ttl: createTTL(60 * 60 * 24 * 7, 60 * 60 * 24),
    });

    //emit message to all client
    this.notificationClient.emit('emit_message', {
      name: 'change_profile_image',
      payload: {
        userId: updatedUser._id.toHexString(),
        metadata: {
          profileImageUrl: updatedUser.profileImageUrl,
        },
      },
    });

    return updatedUser;
  }

  async changeEmail(
    { email }: TokenPayloadInterface,
    { newEmail }: ChangeEmailDto,
  ) {
    //check email is registered or not
    //get from redis
    let registeredUser: UserDocument = await this.cacheManager.get(
      `user:${newEmail}`,
    );

    if (!registeredUser) {
      registeredUser = await this.userRepository.findOne(
        {
          email: newEmail,
          role: 'normal_user',
        },
        [{ path: 'friendList', select: '_id fullname profileImageUrl' }],
      );
    }

    //if true throw error
    if (registeredUser) {
      delete registeredUser.password;
      await this.cacheManager.set(
        `user:${registeredUser.email}`,
        registeredUser,
        {
          ttl: createTTL(60 * 60 * 24 * 7, 60 * 60 * 24),
        },
      );

      throw new ConflictException('Duplicate Resource');
    }

    //create code
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
    this.notificationClient.emit('send_code_to_change_email', {
      email: newEmail,
      code,
    });

    //save code in redis and ttl is 5p
    this.cacheManager.set(
      `change_email_code:${email}`,
      { code: hashedCode, newEmail, oldEmail: email },
      {
        ttl: createTTL(60 * 5, 0),
      },
    );
  }

  async checkCodeToChangeEmail(
    { email, userId }: TokenPayloadInterface,
    { code, newEmail }: CheckCodeToChangeEmailDto,
  ) {
    //check code in redis
    const infor: ChangeEmailPayloadInterface = await this.cacheManager.get(
      `change_email_code:${email}`,
    );

    //if can't get code throw expired code exception
    if (!infor) {
      throw new BadRequestException('Expired Resource');
    }

    //if incorrect throw incorrect exception
    const { code: correctCode, newEmail: _newEmail, oldEmail } = infor;

    const isCorrectCode = await argon2.verify(
      correctCode.toString(),
      code.toString(),
      {
        secret: Buffer.from(this.configService.get('ARGON2_SERCET')),
      },
    );

    if (!isCorrectCode || (_newEmail !== newEmail && oldEmail !== email)) {
      throw new BadRequestException('Incorrect Resource');
    }

    //delete code cache
    this.cacheManager.del(`change_email_code:${email}`);

    //if true update db
    let updatedUser;
    try {
      updatedUser = await this.userRepository.findOneAndUpdate(
        { _id: userId },
        { email: newEmail },
        [{ path: 'friendList', select: '_id fullname profileImageUrl' }],
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Not Found Resource');
      }
      throw new InternalServerErrorException('Something is wrong');
    }

    //delete sensitive infor
    delete updatedUser.password;

    //save update into redis
    this.cacheManager.del(`user:${email}`);
    this.cacheManager.set(`user:${updatedUser.email}`, updatedUser, {
      ttl: createTTL(60 * 60 * 24 * 7, 60 * 60 * 24),
    });

    //create new sign in token
    const tokenPayload: TokenPayloadInterface = {
      userId: updatedUser._id,
      email: updatedUser.email,
      role: updatedUser.role,
    };

    const signInToken = await this.jwtService.signAsync(tokenPayload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: `${this.configService.get('JWT_EXPIRATION_USER')}s`,
    });

    // Prepend 'Bearer ' to the token
    const bearerToken = `Bearer ${signInToken}`;

    //return infor
    return {
      user: updatedUser,
      signInToken: bearerToken,
    };
  }
}
