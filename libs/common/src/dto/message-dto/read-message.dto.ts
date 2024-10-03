import { ArrayNotEmpty, IsArray, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class ReadMessageDto {
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayNotEmpty()
  messageIds: Types.ObjectId[];
}
