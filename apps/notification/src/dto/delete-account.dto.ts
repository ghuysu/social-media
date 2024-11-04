import { IsEmail } from 'class-validator';

export class DeleteAccountDto {
  @IsEmail()
  email: string;
}
