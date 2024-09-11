import { IsEmail, IsNumber, IsString, IsStrongPassword } from 'class-validator';
import { IsValidBirthday } from '../../validators/IsValidBirthday.validator';

export class CreateNormalUserDto {
  @IsNumber()
  code: number;

  @IsEmail()
  email: string;

  @IsString()
  fullname: string;

  @IsString()
  @IsStrongPassword()
  password: string;

  @IsString()
  @IsValidBirthday()
  birthday: string;

  @IsString()
  country: string;
}
