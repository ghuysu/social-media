import { IsIn, IsString } from 'class-validator';

export class NewReportDto {
  @IsString()
  @IsIn(['user', 'feed'])
  type: string;
}
