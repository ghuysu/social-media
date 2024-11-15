import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class DeleteAccountDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  code: number;
}
