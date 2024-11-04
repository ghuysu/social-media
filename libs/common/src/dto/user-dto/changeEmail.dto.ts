import { IsString } from 'class-validator';

export class ChangeEmailDto {
  @IsString()
  newEmail: string;
}
