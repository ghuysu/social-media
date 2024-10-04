import { IsNumber, Min } from 'class-validator';

export class GetEveryoneFeedsDto {
  @IsNumber()
  @Min(0)
  skip: number;
}
