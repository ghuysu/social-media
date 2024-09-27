import { IsArray, IsMongoId, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateFeedDto {
  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  visibility: Types.ObjectId;
}
