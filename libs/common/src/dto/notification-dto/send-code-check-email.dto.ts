import { IsEmail, IsNumber } from 'class-validator';

export class SendCodeCheckEmailDto {
  @IsEmail()
  email: string;

  @IsNumber()
  code: string;
}
