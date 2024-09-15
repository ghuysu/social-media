import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import {
  AWS_S3_SERVICE,
  DatabaseModule,
  LoggerModule,
  NOTIFICATION_SERVICE,
  USER_DOCUMENT,
} from '@app/common';
import { UserSchema } from '@app/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as joi from 'joi';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

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
      }),
    }),
    DatabaseModule.forFeature([{ name: USER_DOCUMENT, schema: UserSchema }]),
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
  controllers: [UserController],
  providers: [UserService, UserRepository],
})
export class UserModule {}
