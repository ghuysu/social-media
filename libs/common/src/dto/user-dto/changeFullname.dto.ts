import { IsString } from 'class-validator';

export class ChangeFullnameDto {
  @IsString()
  fullname: string;
}
