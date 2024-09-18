import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { ConfigModule } from '@nestjs/config';
import * as joi from 'joi';
import { SocketGateway } from './gateways/socket-io.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: joi.object({
        PORT: joi.number().required(),
        GOOGLE_OAUTH_CLIENT_ID: joi.string().required(),
        GOOGLE_OAUTH_CLIENT_SECRET: joi.string().required(),
        GOOGLE_OAUTH_REFRESH_TOKEN: joi.string().required(),
        SMTP_USER: joi.string().required(),
        SOCKET_PORT: joi.number().required(),
      }),
    }),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, SocketGateway],
})
export class NotificationModule {}
