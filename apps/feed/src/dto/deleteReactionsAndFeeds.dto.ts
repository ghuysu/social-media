import { IsArray, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class DeleteReactionsAndFeedsDto {
  @IsMongoId()
  userId: Types.ObjectId;

  @IsMongoId({ each: true })
  @IsArray()
  friendList: Types.ObjectId[];
}
