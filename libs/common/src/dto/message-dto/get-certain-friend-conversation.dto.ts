import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class GetCertainFriendConversationDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  skip: number;
}
