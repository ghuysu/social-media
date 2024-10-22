import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class FeedIdDto {
  @IsMongoId()
  feedId: Types.ObjectId;
}
