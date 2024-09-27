import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as joi from 'joi';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  AUTH_SERVICE,
  USER_SERVICE,
  LoggerModule,
  FEED_SERVICE,
} from '@app/common';
import { ApiGatewayService } from './api-gateway.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: joi.object({
        PORT: joi.string().required(),
        AUTH_HOST: joi.string().required(),
        AUTH_PORT: joi.number().required(),
        USER_HOST: joi.string().required(),
        USER_PORT: joi.number().required(),
        FEED_HOST: joi.string().required(),
        FEED_PORT: joi.number().required(),
        API_KEY: joi.string().required(),
        GOOGLE_CLIENT_ID: joi.string().required(),
        GOOGLE_SECRET: joi.string().required(),
        GOOGLE_REDIRECT: joi.string().required(),
        CLIENT_REDIRECT: joi.string().required(),
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('AUTH_HOST'),
            port: configService.get('AUTH_PORT'),
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
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService, GoogleStrategy, JwtStrategy],
})
export class ApiGatewayModule {}
