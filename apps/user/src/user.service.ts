import {
  ChangeBirthdayDto,
  ChangeCountryDto,
  ChangeFullnameDto,
  createTTL,
  NOTIFICATION_SERVICE,
  TokenPayloadInterface,
  UserDocument,
} from '@app/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { UserRepository } from './user.repository';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy,
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
    const updatedUser = await this.userRepository.findOneAndUpdate(
      { _id: userId },
      { birthday: birthday },
      [{ path: 'friendList', select: '_id fullname profileImageUrl' }],
    );

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
      name: 'change_birthday',
      payload: {
        clientId: updatedUser._id.toHexString(),
        metadata: {
          birthday: updatedUser.birthday,
        },
      },
    });

    //return
    return updatedUser;
  }

  async changeFullname(
    { email, userId, role }: TokenPayloadInterface,
    { fullname }: ChangeFullnameDto,
  ) {
    //update infor in db
    const updatedUser = await this.userRepository.findOneAndUpdate(
      { _id: userId },
      { fullname: fullname },
      [{ path: 'friendList', select: '_id fullname profileImageUrl' }],
    );

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
    const updatedUser = await this.userRepository.findOneAndUpdate(
      { _id: userId },
      { country: country },
      [{ path: 'friendList', select: '_id fullname profileImageUrl' }],
    );

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
      name: 'change_country',
      payload: {
        clientId: updatedUser._id.toHexString(),
        metadata: {
          country: updatedUser.country,
        },
      },
    });

    //return
    return updatedUser;
  }

  async changeProfileImageUrl() {}

  async changeEmail() {}
}
