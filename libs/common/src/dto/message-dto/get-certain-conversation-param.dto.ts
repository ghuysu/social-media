import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class GetCertainConversationParamDto {
  @IsMongoId()
  friendId: Types.ObjectId;
}
