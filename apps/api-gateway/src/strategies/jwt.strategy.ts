import { BannedPayloadDto, TokenPayloadInterface } from '@app/common';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: TokenPayloadInterface) {
    console.log(payload);
    //check user is normal user or not
    if (payload.role !== 'normal_user') return payload;

    //check normal user is banned or not
    const bannedPayload: BannedPayloadDto = await this.cacheManager.get(
      `banned_user:${payload.email}`,
    );
    if (bannedPayload) {
      if (new Date() < new Date(bannedPayload.expirationTime)) {
        throw new ForbiddenException(
          `User has been banned for ${bannedPayload.numberOfBannedDays} days and will expire at ${bannedPayload.expirationTime.toLocaleString()}`,
        );
      }
      return payload;
    }

    //check normal user's email is in banned email list
    const bannedEmailList: string[] =
      await this.cacheManager.get('banned_email_list');
    if (!bannedEmailList) {
      return payload;
    }
    if (bannedEmailList.some((email) => email === payload.email)) {
      throw new ForbiddenException('Email has been banned');
    }

    return payload;
  }
}
