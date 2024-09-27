import { Module } from '@nestjs/common';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { FeedRepository } from './repositories/feed.repository';
import {
  AWS_S3_SERVICE,
  DatabaseModule,
  FEED_DOCUMENT,
  FeedSchema,
  LoggerModule,
  NOTIFICATION_SERVICE,
  REACTION_DOCUMENT,
  ReactionSchema,
  USER_DOCUMENT,
  UserSchema,
} from '@app/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as joi from 'joi';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { ReactionRepository } from './repositories/reaction.repository';

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
        REDIS_HOST: joi.string().required(),
        REDIS_PORT: joi.number().required(),
        BUCKET_NAME: joi.string().required(),
        AWSS3_REGION: joi.string().required(),
        ARGON2_SERCET: joi.string().required(),
      }),
    }),
    DatabaseModule.forFeature([
      { name: USER_DOCUMENT, schema: UserSchema },
      { name: FEED_DOCUMENT, schema: FeedSchema },
      { name: REACTION_DOCUMENT, schema: ReactionSchema },
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
  controllers: [FeedController],
  providers: [FeedService, FeedRepository, ReactionRepository],
})
export class FeedModule {}
