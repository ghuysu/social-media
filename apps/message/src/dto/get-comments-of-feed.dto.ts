import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class GetCommentsOfFeedDto {
  @IsMongoId()
  feedId: Types.ObjectId;
}
