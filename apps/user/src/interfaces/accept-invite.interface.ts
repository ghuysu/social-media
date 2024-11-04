import { AcceptInviteDto, TokenPayloadInterface } from '@app/common';

export interface RemoveInviteInterface {
  payload: AcceptInviteDto;
  userPayload: TokenPayloadInterface;
}
