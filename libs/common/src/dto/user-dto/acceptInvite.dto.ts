import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class AcceptInviteDto {
  @IsMongoId()
  inviteId: Types.ObjectId;
}
