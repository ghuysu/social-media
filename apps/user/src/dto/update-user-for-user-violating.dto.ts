import { UserReportReason } from '@app/common';
import { IsEnum, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateUserForUserViolatingDto {
  @IsMongoId()
  userId: Types.ObjectId;

  @IsEnum(UserReportReason)
  reason: object;
}
