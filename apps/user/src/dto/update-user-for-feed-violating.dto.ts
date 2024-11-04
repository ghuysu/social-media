import { FeedReportReason } from '@app/common';
import { IsEmail, IsEnum, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateUserForFeedViolatingDto {
  @IsMongoId()
  userId: Types.ObjectId;

  @IsEmail()
  email: string;

  @IsMongoId()
  feedId: Types.ObjectId;

  @IsEnum(FeedReportReason)
  reason: object;
}
