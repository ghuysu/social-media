import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import {
  AWS_S3_SERVICE,
  CreateAdminAccountDto,
  NOTIFICATION_SERVICE,
  STATISTIC_SERVICE,
} from '@app/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ChangePasswordDto,
  CheckEmailDto,
  CreateNormalUserDto,
  createTTL,
  UserDocument,
} from '@app/common';
import * as argon2 from 'argon2';
import * as Jimp from 'jimp';
import { ConfigService } from '@nestjs/config';
import { SignInDto } from '@app/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayloadInterface } from '@app/common';
import { CheckCodeDto } from '@app/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AdminCodeInterface } from './interfaces/admin-code.interface';
import { Cache } from 'cache-manager';
import { SignInGoogleDto } from './dto/sign-in-google.dto';
import firebase from 'firebase-admin';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationService: ClientProxy,
    @Inject(AWS_S3_SERVICE)
    private readonly awss3Service: ClientProxy,
    @Inject(STATISTIC_SERVICE)
    private readonly statisticService: ClientProxy,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private firebaseClient = firebase.initializeApp({
    credential: firebase.credential.cert({
      projectId: this.configService.get('FIREBASE_PROJECT_ID'),
      privateKey: this.configService.get<string>('FIREBASE_PRIVATE_KEY'),
      clientEmail: this.configService.get('FIREBASE_CLIENT_EMAIL'),
    }),
  });

  private createImageNameFromFullname(fullname: string): string {
    let imageName = fullname.split(' ').join('_');
    //get current time
    const timestamp = new Date().getTime();
    imageName = `default_${timestamp}_${imageName}`;
    return imageName;
  }

  private async createDefaultProfileImage(fullname: string): Promise<Buffer> {
    // Lấy chữ cái đầu tiên của tên và họ
    let name: string;

    if (fullname.includes(' ')) {
      const firstnameLetter = fullname.split(' ')[0].charAt(0).toUpperCase();
      const lastnameLetter = fullname.split(' ')[1].charAt(0).toUpperCase();
      name = `${firstnameLetter} ${lastnameLetter}`;
    } else {
      name = fullname.charAt(0).toUpperCase();
    }

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

  private async generateUserAccessToken(
    payload: TokenPayloadInterface,
  ): Promise<string> {
    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET_ACCESS_TOKEN'),
      // expiresIn: `${this.configService.get('JWT_EXPIRATION_ACCESS_TOKEN_USER')}s`,
      expiresIn: `${60}s`,
    });
    return `Bearer ${token}`;
  }

  private async generateUserRefreshToken(
    payload: TokenPayloadInterface,
  ): Promise<string> {
    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET_REFRESH_TOKEN'),
      // expiresIn: `${this.configService.get('JWT_EXPIRATION_REFRESH_TOKEN_USER')}s`,
      expiresIn: `${300}s`,
    });

    //check user have cached refresh tokens yet or not
    const cachedRefreshTokens = await this.cacheManager.get<string[]>(
      `refresh-token:${payload.email}`,
    );

    //save refreshToken into redis
    if (!cachedRefreshTokens) {
      this.cacheManager.set(`refresh-token:${payload.email}`, [token], {
        ttl: 0,
      });
    } else {
      this.cacheManager.set(
        `refresh-token:${payload.email}`,
        [...cachedRefreshTokens, token],
        {
          ttl: 0,
        },
      );
    }

    return `Bearer ${token}`;
  }

  private async generateAdminAccessToken(
    payload: TokenPayloadInterface,
  ): Promise<string> {
    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET_ACCESS_TOKEN'),
      // expiresIn: `${this.configService.get('JWT_EXPIRATION_ACCESS_TOKEN_ADMIN')}s`,
      expiresIn: `${60}s`,
    });
    return `Bearer ${token}`;
  }

  private async generateAdminRefreshToken(
    payload: TokenPayloadInterface,
  ): Promise<string> {
    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET_REFRESH_TOKEN'),
      // expiresIn: `${this.configService.get('JWT_EXPIRATION_REFRESH_TOKEN_ADMIN')}s`,
      expiresIn: `${300}s`,
    });

    //save refreshToken into redis
    this.cacheManager.set(`refresh-token:${payload.email}`, token, {
      ttl:
        this.configService.get<number>('JWT_EXPIRATION_ACCESS_TOKEN_ADMIN') +
        1000,
    });

    return `Bearer ${token}`;
  }

  private async deleteExpiredRefreshToken(email: string, token: string) {
    const expiredRefreshToken = token.split(' ')[1];

    const cachedRefreshTokens = await this.cacheManager.get<string[]>(
      `refresh-token:${email}`,
    );

    const filteredRefreshTokens = cachedRefreshTokens.filter(
      (token) => token !== expiredRefreshToken,
    );

    this.cacheManager.set(`refresh-token:${email}`, filteredRefreshTokens, {
      ttl: 0,
    });
  }

  async decodeUserRefreshToken(token: string) {
    let decodePayload: TokenPayloadInterface;
    try {
      const refreshToken = token.split(' ')[1];

      //check refreshToken is real refresh token or not
      decodePayload = this.jwtService.decode(refreshToken);

      if (
        !decodePayload ||
        !decodePayload?.email ||
        !decodePayload?.role ||
        decodePayload?.role !== 'normal_user'
      ) {
        throw new UnauthorizedException('Incorrect refresh token');
      }

      //check sent refresh token is cached or not
      const cachedRefreshTokens = await this.cacheManager.get<string[]>(
        `refresh-token:${decodePayload.email}`,
      );

      if (!cachedRefreshTokens.includes(refreshToken)) {
        throw new UnauthorizedException('Incorrect refresh token');
      }

      //verify refreshToken
      const payload: TokenPayloadInterface = await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret: this.configService.get<string>('JWT_SECRET_REFRESH_TOKEN'),
        },
      );
      //create new accessToken
      const accessToken = await this.generateUserAccessToken({
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      });

      return accessToken;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        await this.deleteExpiredRefreshToken(decodePayload.email, token);
        throw new UnauthorizedException('Refresh token has expired');
      }
      if (error.message === 'Incorrect refresh token') {
        throw new UnauthorizedException('Incorrect refresh token');
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async decodeAdminRefreshToken(token: string) {
    try {
      const refreshToken = token.split(' ')[1];

      //check refreshToken is real refresh token or not
      const decodePayload: TokenPayloadInterface =
        this.jwtService.decode(refreshToken);

      if (
        !decodePayload ||
        !decodePayload?.email ||
        !decodePayload?.role ||
        (decodePayload?.role !== 'admin' &&
          decodePayload?.role !== 'root_admin')
      ) {
        throw new UnauthorizedException('Incorrect refresh token');
      }

      const realRefreshToken = await this.cacheManager.get<string>(
        `refresh-token:${decodePayload.email}`,
      );

      if (realRefreshToken !== refreshToken) {
        throw new UnauthorizedException('Incorrect refresh token');
      }

      //verify refreshToken
      const payload: TokenPayloadInterface = await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret: this.configService.get<string>('JWT_SECRET_REFRESH_TOKEN'),
        },
      );

      //create new accessToken
      const accessToken = await this.generateAdminAccessToken({
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      });

      return accessToken;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token has expired');
      }
      if (error.message === 'Incorrect refresh token') {
        throw new UnauthorizedException('Incorrect refresh token');
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  //sign up
  async checkEmailForSignUp({ email }) {
    //check if email is in banned list or not
    const bannedList: string[] =
      await this.cacheManager.get('banned_email_list');

    if (bannedList.includes(email)) {
      throw new ForbiddenException('Banned resource');
    }

    //check if email is registered or not
    const registeredUser = await this.authRepository.findOne({
      email,
    });

    //throw error if existed
    if (registeredUser) {
      throw new ConflictException('Existed Resource');
    }

    //create a 6-digit validation code
    const code = Math.floor(100000 + Math.random() * 900000 - 1);

    //hash code
    const hashedCode = await argon2.hash(code.toString(), {
      type: argon2.argon2id,
      memoryCost: 2 ** 10,
      timeCost: 2,
      parallelism: 1,
      secret: Buffer.from(this.configService.get('ARGON2_SERCET')),
    });

    //send event to notification service to send code
    //to this email if not existed
    this.notificationService.emit('send_code_to_check_email', {
      email,
      code,
    });

    //save code in redis and ttl is 5p
    await this.cacheManager.set(`sign_up_code:${email}`, hashedCode, {
      ttl: createTTL(60 * 5, 0),
    });
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
      memoryCost: 2 ** 10,
      timeCost: 2,
      parallelism: 1,
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

    if (!birthday) {
      delete newUser.birthday;
    }
    if (!country) {
      delete newUser.country;
    }

    const user = await this.authRepository.create(newUser);
    delete user.password;

    //save user in redis and ttl is 30 days
    await this.cacheManager.set(`user:${user.email}`, user, {
      ttl: createTTL(60 * 60 * 24 * 30, 60 * 60 * 24),
    });

    //generate accesstoken and refreshtoken
    const payload: TokenPayloadInterface = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };
    const accessToken = await this.generateUserAccessToken(payload);
    const refreshToken = await this.generateUserRefreshToken(payload);

    //update user statistic
    this.statisticService.emit('created_user', {});

    //update country statistic
    if (!country) this.statisticService.emit('country', { country: country });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  //change password
  async checkEmailForChangePassword({ email }: CheckEmailDto) {
    let needToSaveIntoRedis = false;
    let isAdmin = false;
    //get from redis
    let registeredUser: UserDocument = await this.cacheManager.get(
      `user:${email}`,
    );

    if (!registeredUser) {
      isAdmin = true;
      registeredUser = await this.cacheManager.get(`admin:${email}`);
    }

    if (!registeredUser) {
      needToSaveIntoRedis = true;

      registeredUser = await this.authRepository.findOne(
        {
          email,
        },
        [
          { path: 'friendList', select: '_id fullname profileImageUrl' },
          {
            path: 'friendInvites',
            select: '_id sender receiver createdAt',
            populate: [
              {
                path: 'sender',
                select: '_id fullname profileImageUrl',
              },
              {
                path: 'receiver',
                select: '_id fullname profileImageUrl',
              },
            ],
          },
        ],
      );
    }

    //throw error if existed
    if (!registeredUser) {
      throw new NotFoundException('Not Found Resource');
    }

    isAdmin = registeredUser.role === 'normal_user' ? false : true;

    //create a 6-digit validation code
    const code = Math.floor(100000 + Math.random() * 900000);

    //hash code
    const hashedCode = await argon2.hash(code.toString(), {
      type: argon2.argon2id,
      memoryCost: 2 ** 10,
      timeCost: 2,
      parallelism: 1,
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

    //save into redis if needed
    if (needToSaveIntoRedis) {
      if (isAdmin) {
        delete registeredUser.password;

        await this.cacheManager.set(
          `admin:${registeredUser.email}`,
          registeredUser,
          {
            ttl: createTTL(60 * 60 * 24 * 30, 60 * 60 * 24),
          },
        );
      } else {
        delete registeredUser.password;

        await this.cacheManager.set(
          `user:${registeredUser.email}`,
          registeredUser,
          {
            ttl: createTTL(60 * 60 * 24 * 7, 60 * 60 * 24),
          },
        );
      }
    }
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
      memoryCost: 2 ** 10,
      timeCost: 2,
      parallelism: 1,
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
    // find user by email
    const user = await this.authRepository.findOne(
      {
        email,
        role: 'normal_user',
      },
      [
        { path: 'friendList', select: '_id fullname profileImageUrl' },
        {
          path: 'friendInvites',
          select: '_id sender receiver createdAt',
          populate: [
            {
              path: 'sender',
              select: '_id fullname profileImageUrl',
            },
            {
              path: 'receiver',
              select: '_id fullname profileImageUrl',
            },
          ],
        },
      ],
    );

    // if user doesn't exist
    if (!user) {
      throw new UnauthorizedException('Not found credentials');
    }

    if (user.isSignedInByGoogle) {
      throw new BadRequestException('Please login with Google');
    }

    // check password is correct or not
    const isCorrectPassword = await argon2.verify(user.password, password, {
      secret: Buffer.from(this.configService.get('ARGON2_SERCET')),
    });

    if (!isCorrectPassword) {
      throw new UnauthorizedException('Incorrect credentials');
    }

    // delete sensitive properties
    delete user.password;

    // create sign-in token
    const tokenPayload: TokenPayloadInterface = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.generateUserAccessToken(tokenPayload);
    const refreshToken = await this.generateUserRefreshToken(tokenPayload);

    await this.cacheManager.set(`user:${user.email}`, user, {
      ttl: createTTL(60 * 60 * 24 * 30, 60 * 60 * 24),
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async signInAsAdmin({ email, password }: SignInDto) {
    //find admin by email
    const admin = await this.authRepository.findOne(
      {
        email,
        $or: [{ role: 'admin' }, { role: 'root_admin' }],
      },
      [
        { path: 'friendList', select: '_id fullname profileImageUrl' },
        {
          path: 'friendInvites',
          select: '_id sender receiver createdAt',
          populate: [
            {
              path: 'sender',
              select: '_id fullname profileImageUrl',
            },
            {
              path: 'receiver',
              select: '_id fullname profileImageUrl',
            },
          ],
        },
      ],
    );

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
      memoryCost: 2 ** 10,
      timeCost: 2,
      parallelism: 1,
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
    this.cacheManager.set(`admin_sign_in_code:${email}`, redisRecord, {
      ttl: createTTL(60 * 5, 0),
    });
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
    await this.cacheManager.set(`admin:${admin.email}`, admin, {
      ttl: createTTL(60 * 60 * 24 * 7, 60 * 60 * 24),
    });

    //create sign-in token
    const tokenPayload: TokenPayloadInterface = {
      userId: admin._id,
      email: admin.email,
      role: admin.role,
    };

    const accessToken = await this.generateAdminAccessToken(tokenPayload);
    const refreshToken = await this.generateAdminRefreshToken(tokenPayload);

    return { admin, accessToken, refreshToken };
  }

  private async decodeGoogleAccessToken(token: string) {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`,
    );

    if (!response.ok) {
      throw new BadRequestException('Failed to verify resource');
    }

    const payload = await response.json();

    return payload;
  }

  private async decodeGoogleIdToken(token: string) {
    try {
      const payload = await this.firebaseClient.auth().verifyIdToken(token);
      return payload;
    } catch (error) {
      throw new BadRequestException('Failed to verify resource');
    }
  }

  async signInGoogle({ token }: SignInGoogleDto) {
    const { email, name, picture } = token.startsWith('ya29.')
      ? await this.decodeGoogleAccessToken(token)
      : await this.decodeGoogleIdToken(token);

    //check if email is in banned list or not
    const bannedList: string[] =
      await this.cacheManager.get('banned_email_list');

    if (bannedList.includes(email)) {
      throw new ForbiddenException('Banned resource');
    }

    //check if email is registered as admin or not
    let registeredUser = await this.authRepository.findOne({ email }, [
      { path: 'friendList', select: '_id fullname profileImageUrl' },
      {
        path: 'friendInvites',
        select: '_id sender receiver createdAt',
        populate: [
          {
            path: 'sender',
            select: '_id fullname profileImageUrl',
          },
          {
            path: 'receiver',
            select: '_id fullname profileImageUrl',
          },
        ],
      },
    ]);

    //if account is not existed, sign up
    if (!registeredUser) {
      registeredUser = await this.authRepository.create({
        email,
        fullname: name,
        profileImageUrl: picture,
        isSignedInByGoogle: true,
      });
    }

    //create sign-in token
    const tokenPayload: TokenPayloadInterface = {
      userId: registeredUser._id,
      email: registeredUser.email,
      role: registeredUser.role,
    };

    //generate accessToken and refreshToken
    let accessToken;
    let refreshToken;

    if (registeredUser.role === 'normal_user') {
      accessToken = await this.generateUserAccessToken(tokenPayload);
      refreshToken = await this.generateUserRefreshToken(tokenPayload);
    } else {
      accessToken = await this.generateAdminAccessToken(tokenPayload);
      refreshToken = await this.generateAdminRefreshToken(tokenPayload);
    }

    //delete sensitive information
    delete registeredUser.password;

    //save to redis
    this.cacheManager.set(`user:${email}`, registeredUser, {
      ttl: createTTL(60 * 60 * 24 * 30, 60 * 60 * 24),
    });

    //return user information and sign in token
    return {
      user: registeredUser,
      accessToken,
      refreshToken,
    };
  }

  //admin
  async createAdminAccount({
    adminId,
    email,
    fullname,
    birthday,
    country,
  }: CreateAdminAccountDto) {
    //check email
    const usedEmail = await this.authRepository.findOne({ email });
    if (usedEmail) {
      throw new ConflictException('Used resource');
    }
    //default password
    const defaultPassword = 'Abcxyz-123';
    //hash password
    const hashedPassword = await argon2.hash(defaultPassword, {
      type: argon2.argon2id,
      memoryCost: 2 ** 10,
      timeCost: 2,
      parallelism: 1,
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
    const newAdmin = {
      email,
      fullname,
      password: hashedPassword,
      birthday,
      country,
      profileImageUrl,
      role: 'admin',
    };

    const admin = await this.authRepository.create(newAdmin);
    delete admin.password;

    //save user in redis and ttl is 30 days
    await this.cacheManager.set(`admin:${admin.email}`, admin, {
      ttl: createTTL(60 * 60 * 24 * 30, 60 * 60 * 24),
    });

    //notify admin about new admin
    this.notificationService.emit('emit_message', {
      name: 'new_admin',
      payload: {
        rootAdminId: adminId,
        newAdminId: admin._id,
      },
    });

    return { ...admin, defaultPassword: defaultPassword };
  }
}
