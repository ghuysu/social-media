import { IsNumber } from 'class-validator';

export class GetCertainUserFeedsDto {
  @IsNumber()
  skip: number;
}
