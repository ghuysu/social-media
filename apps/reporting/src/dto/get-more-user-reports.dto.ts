import { IsNumber, Min } from 'class-validator';

export class GetMoreUserReportsDto {
  @IsNumber()
  @Min(0)
  skip: number;
}
