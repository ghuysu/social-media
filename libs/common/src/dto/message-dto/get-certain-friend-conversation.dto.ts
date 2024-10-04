import { IsNumber, Min } from 'class-validator';

export class GetCertainFriendConversationDto {
  @IsNumber()
  @Min(0)
  skip: number;
}
