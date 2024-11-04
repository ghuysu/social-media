import { Transform } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class GetAdminListDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  page: number;
}
