import { IsMongoId, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateMessageDto {
  @IsMongoId()
  receiverId: Types.ObjectId;

  @IsString()
  content: string;

  @IsMongoId()
  @IsOptional()
  feedId: Types.ObjectId;
}
