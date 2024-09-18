import { Controller } from '@nestjs/common';
import { AwsS3Service } from './aws-s3.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { DeleteImageDto, UploadImageDto } from '@app/common';

@Controller()
export class AwsS3Controller {
  constructor(private readonly awsS3Service: AwsS3Service) {}

  @EventPattern('upload_image')
  async uploadImage(@Payload() dto: UploadImageDto) {
    return this.awsS3Service.uploadImage(dto);
  }

  @EventPattern('delete_image')
  async deleteImage(@Payload() dto: DeleteImageDto) {
    return this.awsS3Service.deleteImage(dto);
  }
}
