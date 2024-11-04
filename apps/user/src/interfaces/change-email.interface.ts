import { ChangeEmailDto, TokenPayloadInterface } from '@app/common';

export interface ChangeEmailInterface {
  emailPayload: ChangeEmailDto;
  userPayload: TokenPayloadInterface;
}
