import { IsEmail, IsNumber } from 'class-validator';

export class SendCodeDto {
  @IsEmail()
  email: string;

  @IsNumber()
  code: string;
}
