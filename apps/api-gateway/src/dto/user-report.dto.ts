import { IsIn, IsNumber } from 'class-validator';

export class UserReportDto {
  @IsNumber()
  @IsIn([0, 1])
  reason: number;
}
