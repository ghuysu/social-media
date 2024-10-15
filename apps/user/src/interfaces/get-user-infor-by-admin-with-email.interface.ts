import { IsEmail } from 'class-validator';

export class GetUserInforByAdminWithEmailInterface {
  @IsEmail()
  searchValue: string;
}
