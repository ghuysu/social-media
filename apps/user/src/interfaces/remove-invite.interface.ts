import { RemoveInviteDto, TokenPayloadInterface } from '@app/common';

export interface RemoveInviteInterface {
  payload: RemoveInviteDto;
  userPayload: TokenPayloadInterface;
}
