import { IsBoolean } from 'class-validator';

export class ProcessReportDto {
  @IsBoolean()
  isViolating: boolean;
}
