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
  reportedUserId: Types.ObjectId;
}

export class ReportUserDto {
  @IsObject()
  @IsNotEmpty()
  userPayload: TokenPayloadInterface;

  @ValidateNested()
  @Type(() => PayloadDto)
  @IsNotEmpty()
  payload: PayloadDto;
}
