import { TokenPayloadInterface } from '@app/common';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

class PayloadDto {
  @IsNumber()
  @IsNotEmpty()
  reason: number;

  @IsMongoId()
  @IsNotEmpty()
  reportedFeedId: Types.ObjectId;
}

export class ReportFeedDto {
  @IsObject()
  @IsNotEmpty()
  userPayload: TokenPayloadInterface;

  @ValidateNested()
  @Type(() => PayloadDto)
  @IsNotEmpty()
  payload: PayloadDto;
}
