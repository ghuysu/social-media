import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { ApiKeyGuard } from './guards/api-key.guard';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  const configService = app.get(ConfigService);
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.enableCors();
  app.useGlobalGuards(new ApiKeyGuard(app.get(ConfigService)));
  await app.listen(configService.get('PORT'));
}
bootstrap();
