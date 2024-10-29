import { IsEmail, IsMongoId, IsString } from 'class-validator';
import { IsValidBirthday } from '../../validators/IsValidBirthday.validator';
import { Types } from 'mongoose';

export class CreateAdminAccountDto {
  @IsMongoId()
  adminId: Types.ObjectId;

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
