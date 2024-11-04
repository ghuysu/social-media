import { IsMongoId, IsNumber, Min } from 'class-validator';
import { Types } from 'mongoose';

export class GetAdminListDto {
  @IsMongoId()
  userId: Types.ObjectId;

  @IsNumber()
  @Min(0)
  page: number;
}
