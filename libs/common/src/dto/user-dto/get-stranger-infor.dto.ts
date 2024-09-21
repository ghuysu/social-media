import { Types } from 'mongoose';
import { IsMongoId } from 'class-validator';

export class GetStrangerInforDto {
  @IsMongoId()
  userId: Types.ObjectId;
}
