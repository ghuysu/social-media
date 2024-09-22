import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class DeleteFriendDto {
  @IsMongoId()
  friendId: Types.ObjectId;
}
