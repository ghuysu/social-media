import { IsEnum } from 'class-validator';

export enum ReactionIconEnum {
  LIKE = 'like',
  LOVE = 'love',
  HAHA = 'haha',
  WOW = 'wow',
  SAD = 'sad',
  ANGRY = 'angry',
}

export class ReactFeedDto {
  @IsEnum(ReactionIconEnum, { message: 'Invalid Icon Type' })
  icon: string;
}
