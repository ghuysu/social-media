import { IsString } from 'class-validator';

export class SignInGoogleDto {
  @IsString()
  token: string;
}
