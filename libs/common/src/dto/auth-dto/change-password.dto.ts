import { IsEmail, IsNumber, IsStrongPassword } from 'class-validator';

export class ChangePasswordDto {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  @IsNumber()
  code: number;
}
