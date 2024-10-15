import { DeleteAccountDto, TokenPayloadInterface } from '@app/common';

export interface DeleteAccountInterface {
  userPayload: TokenPayloadInterface;

  payload: DeleteAccountDto;
}
