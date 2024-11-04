import { IsEmail, IsNumber } from 'class-validator';

export class CheckCodeToChangeEmailDto {
  @IsEmail()
  newEmail: string;

  @IsNumber()
  code: number;
}
