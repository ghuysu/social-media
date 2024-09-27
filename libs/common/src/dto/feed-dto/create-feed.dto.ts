import {
  ArrayNotEmpty,
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateFeedDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  visibility: Types.ObjectId;
}
