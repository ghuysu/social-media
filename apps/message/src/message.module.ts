import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { MessageRepository } from './repositories/message.repository';
import {
  DatabaseModule,
  FEED_DOCUMENT,
  FeedSchema,
  LoggerModule,
  MESSAGE_DOCUMENT,
  MessageSchema,
  NOTIFICATION_SERVICE,
  USER_DOCUMENT,
  USER_SERVICE,
  UserSchema,
} from '@app/common';
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
        USER_HOST: joi.string().required(),
        USER_PORT: joi.number().required(),
        REDIS_PASSWORD: joi.string().required(),
        REDIS_HOST: joi.string().required(),
        REDIS_PORT: joi.number().required(),
      }),
    }),
    DatabaseModule.forFeature([
      { name: USER_DOCUMENT, schema: UserSchema },
      { name: FEED_DOCUMENT, schema: FeedSchema },
      { name: MESSAGE_DOCUMENT, schema: MessageSchema },
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
  controllers: [MessageController],
  providers: [MessageService, MessageRepository],
})
export class MessageModule {}
