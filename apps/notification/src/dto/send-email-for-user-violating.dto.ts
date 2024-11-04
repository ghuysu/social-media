import { UserReportReason } from '@app/common';
import { IsEmail, IsEnum, IsNumber, IsString, Min } from 'class-validator';

export class SendEmailForUserViolatingDto {
  @IsEmail()
  email: string;

  @IsString()
  fullname: string;

  @IsEnum(UserReportReason)
  reason: object;

  @IsNumber()
  @Min(1)
  numberOfViolating: number;
}
