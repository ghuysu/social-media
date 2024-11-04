import { IsValidBirthday } from '@app/common';
import { IsEmail, IsString } from 'class-validator';

export class CreateAdminDto {
  @IsEmail()
  email: string;

  @IsString()
  fullname: string;

  @IsString()
  @IsValidBirthday()
  birthday: string;

  @IsString()
  country: string;
}
