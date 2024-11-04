import { Transform } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class GetMoreReportsDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  skip: number;
}
