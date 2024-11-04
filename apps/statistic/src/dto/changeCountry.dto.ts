import { IsString } from 'class-validator';

export class ChangeCountryDto {
  @IsString()
  newCountry: string;

  @IsString()
  oldCountry: string;
}
