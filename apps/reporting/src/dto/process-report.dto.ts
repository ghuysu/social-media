import { IsBoolean, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';
import { TokenPayloadInterface } from '@app/common';

class ReportDto {
  @IsMongoId()
  reportId: Types.ObjectId;

  @IsBoolean()
  isViolating: boolean;
}

export class ProcessReportDto {
  userPayload: TokenPayloadInterface;

  payload: ReportDto;
}
