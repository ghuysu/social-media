import { IsValidBirthday } from '../../validators/IsValidBirthday.validator';
import { IsString } from 'class-validator';

export class ChangeBirthdayDto {
  @IsString()
  @IsValidBirthday()
  birthday: string;
}
