import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class SendInviteDto {
  @IsMongoId()
  userId: Types.ObjectId;
}
