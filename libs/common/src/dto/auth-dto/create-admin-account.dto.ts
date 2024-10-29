import { IsEmail, IsString } from 'class-validator';
import { IsValidBirthday } from '../../validators/IsValidBirthday.validator';

export class CreateAdminAccountDto {
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
