import { IsString } from 'class-validator';

export class ChangeCountryDto {
  @IsString()
  country: string;
}
