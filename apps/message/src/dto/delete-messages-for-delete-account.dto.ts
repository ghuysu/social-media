import { IsArray, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class DeleteMessagesForDeleteAccountDto {
  @IsMongoId()
  userId: Types.ObjectId;

  @IsArray()
  @IsMongoId({ each: true })
  friendList: Types.ObjectId[];
}
