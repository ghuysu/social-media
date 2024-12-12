import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class PageDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  page: number;
}
