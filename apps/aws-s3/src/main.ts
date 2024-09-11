import { NestFactory } from '@nestjs/core';
import { AwsS3Module } from './aws-s3.module';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AwsS3Module);
  const configService = app.get(ConfigService);
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: configService.get('PORT'),
    },
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  await app.startAllMicroservices();
}
bootstrap();
