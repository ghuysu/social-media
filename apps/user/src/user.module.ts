import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './repositories/user.repository';
import {
  AWS_S3_SERVICE,
  DatabaseModule,
  FEED_SERVICE,
  FRIEND_INVITE_DOCUMENT,
  LoggerModule,
  MESSAGE_SERVICE,
  NOTIFICATION_SERVICE,
  STATISTIC_SERVICE,
  USER_DOCUMENT,
} from '@app/common';
import { UserSchema } from '@app/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as joi from 'joi';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { JwtModule } from '@nestjs/jwt';
import { FriendInviteSchema } from '@app/common';
import { FriendInviteRepository } from './repositories/friend-invite.repository';

@Module({
  imports: [
    LoggerModule,
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: joi.object({
        MONGODB_URI: joi.string().required(),
        TCP_PORT: joi.number().required(),
        NOTIFICATION_HOST: joi.string().required(),
        NOTIFICATION_PORT: joi.number().required(),
        AWS_S3_HOST: joi.string().required(),
        AWS_S3_PORT: joi.number().required(),
        FEED_HOST: joi.string().required(),
        FEED_PORT: joi.number().required(),
        MESSAGE_HOST: joi.string().required(),
        MESSAGE_PORT: joi.number().required(),
        STATISTIC_HOST: joi.string().required(),
        STATISTIC_PORT: joi.number().required(),
        REDIS_HOST: joi.string().required(),
        REDIS_PORT: joi.number().required(),
        BUCKET_NAME: joi.string().required(),
        AWSS3_REGION: joi.string().required(),
        ARGON2_SERCET: joi.string().required(),
        JWT_SECRET: joi.string().required(),
        JWT_EXPIRATION_USER: joi.string().required(),
      }),
    }),
    JwtModule.register({
      global: true,
    }),
    DatabaseModule.forFeature([
      { name: USER_DOCUMENT, schema: UserSchema },
      { name: FRIEND_INVITE_DOCUMENT, schema: FriendInviteSchema },
    ]),
    ClientsModule.registerAsync([
      {
        name: NOTIFICATION_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('NOTIFICATION_HOST'),
            port: configService.get('NOTIFICATION_PORT'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: AWS_S3_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('AWS_S3_HOST'),
            port: configService.get('AWS_S3_PORT'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: FEED_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('FEED_HOST'),
            port: configService.get('FEED_PORT'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: MESSAGE_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('MESSAGE_HOST'),
            port: configService.get('MESSAGE_PORT'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: STATISTIC_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('STATISTIC_HOST'),
            port: configService.get('STATISTIC_PORT'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        password: configService.get('REDIS_PASSWORD'),
      }),
    }),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, FriendInviteRepository],
})
export class UserModule {}
