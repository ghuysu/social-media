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
  MESSAGE_SERVICE,
  NOTIFICATION_SERVICE,
  REACTION_DOCUMENT,
  ReactionSchema,
  REPORTING_SERVICE,
  STATISTIC_SERVICE,
  USER_DOCUMENT,
  USER_SERVICE,
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
        USER_HOST: joi.string().required(),
        USER_PORT: joi.number().required(),
        STATISTIC_HOST: joi.string().required(),
        STATISTIC_PORT: joi.number().required(),
        MESSAGE_HOST: joi.string().required(),
        MESSAGE_PORT: joi.number().required(),
        REPORTING_HOST: joi.string().required(),
        REPORTING_PORT: joi.number().required(),
        REDIS_HOST: joi.string().required(),
        REDIS_PORT: joi.number().required(),
        BUCKET_NAME: joi.string().required(),
        AWSS3_REGION: joi.string().required(),
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
      {
        name: USER_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('USER_HOST'),
            port: configService.get('USER_PORT'),
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
      {
        name: REPORTING_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('REPORTING_HOST'),
            port: configService.get('REPORTING_PORT'),
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
