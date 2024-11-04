import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class GetFeedByAdminDto {
  @IsMongoId()
  feedId: Types.ObjectId;
}
