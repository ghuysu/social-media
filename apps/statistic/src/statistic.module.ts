import { Module } from '@nestjs/common';
import { StatisticController } from './statistic.controller';
import { StatisticService } from './statistic.service';
import {
  STATISTIC_DOCUMENT,
  StatisticSchema,
  DatabaseModule,
  LoggerModule,
} from '@app/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as joi from 'joi';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { StatisticRepository } from './repositories/statistic.repository';

@Module({
  imports: [
    LoggerModule,
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: joi.object({
        MONGODB_URI: joi.string().required(),
        PORT: joi.number().required(),
        REDIS_PASSWORD: joi.string().required(),
        REDIS_HOST: joi.string().required(),
        REDIS_PORT: joi.number().required(),
      }),
    }),
    DatabaseModule.forFeature([
      { name: STATISTIC_DOCUMENT, schema: StatisticSchema },
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
  controllers: [StatisticController],
  providers: [StatisticService, StatisticRepository],
})
export class StatisticModule {}
