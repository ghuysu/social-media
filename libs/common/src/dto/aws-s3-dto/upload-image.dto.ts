import { IsString } from 'class-validator';

export class UploadImageDto {
  image: Buffer;

  @IsString()
  imageName: string;
}
