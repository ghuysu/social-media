import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class UserIdDto {
  @IsMongoId()
  userId: Types.ObjectId;
}
