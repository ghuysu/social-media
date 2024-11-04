import { Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { DeleteImageDto, UploadImageDto } from '@app/common';

@Injectable()
export class AwsS3Service {
  constructor(private readonly configService: ConfigService) {}

  private readonly s3Client = new S3Client({
    region: this.configService.get('AWSS3_REGION'),
    endpoint: `https://s3.${this.configService.get('AWSS3_REGION')}.amazonaws.com`,
    credentials: {
      accessKeyId: this.configService.get('AWSS3_ACCESS_KEY'),
      secretAccessKey: this.configService.get('AWSS3_SECRET_ACCESS_KEY'),
    },
  });

  async uploadImage({ image, imageName }: UploadImageDto) {
    const buffer = Buffer.from(image);
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.configService.get('BUCKET_NAME'),
        Key: imageName,
        Body: buffer,
        ContentType: 'image/*',
      }),
    );
  }

  async deleteImage({ imageName }: DeleteImageDto) {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.configService.get('BUCKET_NAME'),
        Key: imageName,
      }),
    );
  }
}
