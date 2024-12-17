import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
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

  @IsOptional()
  @IsString()
  @IsValidBirthday()
  birthday: string;

  @IsOptional()
  @IsString()
  country: string;
}
