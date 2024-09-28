import { IsNumber } from 'class-validator';

export class GetEveryoneFeedsDto {
  @IsNumber()
  skip: number;
}
