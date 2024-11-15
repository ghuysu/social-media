import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import {
  DatabaseModule,
  FRIEND_INVITE_DOCUMENT,
  FriendInviteSchema,
  LoggerModule,
  STATISTIC_SERVICE,
  USER_DOCUMENT,
} from '@app/common';
import { UserSchema } from '@app/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as joi from 'joi';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AWS_S3_SERVICE, NOTIFICATION_SERVICE } from '@app/common';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { OAuth2Client } from 'google-auth-library';

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
        STATISTIC_HOST: joi.string().required(),
        STATISTIC_PORT: joi.number().required(),
        REDIS_HOST: joi.string().required(),
        REDIS_PORT: joi.number().required(),
        BUCKET_NAME: joi.string().required(),
        AWSS3_REGION: joi.string().required(),
        ARGON2_SERCET: joi.string().required(),
        JWT_SECRET: joi.string().required(),
        JWT_EXPIRATION_USER: joi.string().required(),
        JWT_EXPIRATION_ADMIN: joi.string().required(),
        GOOGLE_CLIENT_ID: joi.string().required(),
        FIREBASE_PROJECT_ID: joi.string().required(),
        FIREBASE_PRIVATE_KEY: joi.string().required(),
        FIREBASE_CLIENT_EMAIL: joi.string().required(),
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
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    {
      provide: OAuth2Client,
      useFactory: (configService: ConfigService) => {
        return new OAuth2Client(configService.get('GOOGLE_CLIENT_ID'));
      },
      inject: [ConfigService],
    },
  ],
})
export class AuthModule {}
