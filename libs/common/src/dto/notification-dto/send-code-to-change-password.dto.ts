import { IsEmail, IsNumber } from 'class-validator';

export class SendCodeToChangePasswordDto {
  @IsEmail()
  email: string;

  @IsNumber()
  code: string;
}
