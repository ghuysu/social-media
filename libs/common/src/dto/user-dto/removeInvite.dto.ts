import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class RemoveInviteDto {
  @IsMongoId()
  inviteId: Types.ObjectId;
}
