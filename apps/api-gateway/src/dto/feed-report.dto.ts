import { IsIn, IsNumber } from 'class-validator';

export class FeedReportDto {
  @IsNumber()
  @IsIn([0, 1])
  reason: number;
}
