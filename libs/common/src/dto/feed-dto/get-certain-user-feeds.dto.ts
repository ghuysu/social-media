import { IsNumber, Min } from 'class-validator';

export class GetCertainUserFeedsDto {
  @IsNumber()
  @Min(0)
  skip: number;
}
