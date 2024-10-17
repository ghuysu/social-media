import { Module } from '@nestjs/common';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';
import {
  USER_REPORT_DOCUMENT,
  FEED_REPORT_DOCUMENT,
  LoggerModule,
  DatabaseModule,
  USER_SERVICE,
  FEED_SERVICE,
  UserReportSchema,
  FeedReportSchema,
} from '@app/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as joi from 'joi';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { FeedReportRepository } from './repositories/feed-report.repository';
import { UserReportRepository } from './repositories/user-report.repository';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    LoggerModule,
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: joi.object({
        MONGODB_URI: joi.string().required(),
        PORT: joi.number().required(),
        USER_HOST: joi.string().required(),
        USER_PORT: joi.number().required(),
        FEED_HOST: joi.string().required(),
        FEED_PORT: joi.number().required(),
        REDIS_PASSWORD: joi.string().required(),
        REDIS_HOST: joi.string().required(),
        REDIS_PORT: joi.number().required(),
      }),
    }),
    DatabaseModule.forFeature([
      { name: USER_REPORT_DOCUMENT, schema: UserReportSchema },
      { name: FEED_REPORT_DOCUMENT, schema: FeedReportSchema },
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
    ClientsModule.registerAsync([
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
    ]),
  ],
  controllers: [ReportingController],
  providers: [ReportingService, UserReportRepository, FeedReportRepository],
})
export class ReportingModule {}
