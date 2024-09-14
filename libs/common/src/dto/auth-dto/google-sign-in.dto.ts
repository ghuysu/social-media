import { IsEmail, IsString, IsUrl } from 'class-validator';

export class GoogleSignInDto {
  @IsEmail()
  email: string;

  @IsString()
  fullname: string;

  @IsUrl()
  profileImageUrl: string;
}
