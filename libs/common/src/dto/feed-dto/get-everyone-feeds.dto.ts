import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetEveryoneFeedsDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  skip: number;
}
