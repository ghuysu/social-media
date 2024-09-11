import { Module } from '@nestjs/common';
import { AwsS3Controller } from './aws-s3.controller';
import { AwsS3Service } from './aws-s3.service';
import { ConfigModule } from '@nestjs/config';
import * as joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: joi.object({
        PORT: joi.number().required(),
        AWSS3_ACCESS_KEY: joi.string().required(),
        AWSS3_SECRET_ACCESS_KEY: joi.string().required(),
        BUCKET_NAME: joi.string().required(),
        AWSS3_REGION: joi.string().required(),
      }),
    }),
  ],
  controllers: [AwsS3Controller],
  providers: [AwsS3Service],
})
export class AwsS3Module {}
