import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class GetCertainUserFeedsDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  skip: number;
}
