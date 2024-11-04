import { CheckCodeToChangeEmailDto, TokenPayloadInterface } from '@app/common';

export interface CheckCodeToChangeEmailInterface {
  payload: CheckCodeToChangeEmailDto;
  userPayload: TokenPayloadInterface;
}
