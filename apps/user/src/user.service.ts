import {
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
import { ChangeEmailPayloadInterface } from './interfaces/change-email-payload.interface';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

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
    { email, userId, role }: TokenPayloadInterface,
    { fullname }: ChangeFullnameDto,
  ) {
    //update infor in db
    let updatedUser;

    try {
      updatedUser = await this.userRepository.findOneAndUpdate(
        { _id: userId },
        { fullname: fullname },
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

    //emit message to all client
    this.notificationClient.emit('emit_message', {
      name: 'change_fullname',
      payload: {
        clientId: updatedUser._id.toHexString(),
        metadata: {
          fullname: updatedUser.fullname,
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

  async changeProfileImageUrl() {}

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
