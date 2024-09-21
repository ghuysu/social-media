import { SendInviteDto, TokenPayloadInterface } from '@app/common';

export interface SendInviteInterface {
  payload: SendInviteDto;
  userPayload: TokenPayloadInterface;
}
