import { IsString, IsIn } from 'class-validator';

export class TypeInterface {
  @IsString()
  @IsIn(['email', 'id'], {
    message: 'Type must be either "email" or "id".',
  })
  type: string;
}
