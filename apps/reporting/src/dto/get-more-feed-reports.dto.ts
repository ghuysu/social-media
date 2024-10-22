import { IsNumber, Min } from 'class-validator';

export class GetMoreFeedReportsDto {
  @IsNumber()
  @Min(0)
  skip: number;
}
