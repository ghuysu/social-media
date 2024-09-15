import { createTTL, TokenPayloadInterface, UserDocument } from '@app/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
}
