import { IsString } from 'class-validator';

export class GetUserInforByAdminInterface {
  @IsString()
  searchValue: string;
}
