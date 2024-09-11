import { IsEmail, IsNumber } from 'class-validator';

export class CheckCodeDto {
  @IsNumber()
  code: number;

  @IsEmail()
  email: string;
}
