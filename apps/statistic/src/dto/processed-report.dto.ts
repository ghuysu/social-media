import { IsIn, IsNumber, IsString, Min } from 'class-validator';

export class ProcessedReportDto {
  @IsString()
  @IsIn(['user', 'feed'])
  type: string;

  @IsNumber()
  @Min(0)
  number: number;
}
