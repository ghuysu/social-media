import { TokenPayloadInterface } from '@app/common';

export interface GetCertainFriendConversationInterface {
  userPayload: TokenPayloadInterface;

  payload: {
    skip: number;
    friendId: string;
  };
}
