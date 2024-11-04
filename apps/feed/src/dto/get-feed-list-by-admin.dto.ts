import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class GetFeedListByAdminDto {
  @IsMongoId()
  userId: Types.ObjectId;
}
