import { DeleteFriendDto, TokenPayloadInterface } from '@app/common';

export interface DeleteFriendInterface {
  payload: DeleteFriendDto;
  userPayload: TokenPayloadInterface;
}
