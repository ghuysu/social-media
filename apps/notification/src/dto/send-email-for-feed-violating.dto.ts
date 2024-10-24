import { FeedReportReason } from '@app/common';
import {
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { Types } from 'mongoose';

export class SendEmailForFeedViolatingDto {
  @IsEmail()
  email: string;

  @IsString()
  fullname: string;

  @IsMongoId()
  feedId: Types.ObjectId;

  @IsEnum(FeedReportReason)
  reason: object;

  @IsNumber()
  @Min(1)
  numberOfViolating: number;
}
