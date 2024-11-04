import { IsArray, IsMongoId, IsNotEmpty } from 'class-validator';

export class GetListOfUserInforDto {
  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  userIdList: string[];
}
