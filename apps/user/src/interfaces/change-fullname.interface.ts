import { ChangeFullnameDto, TokenPayloadInterface } from '@app/common';

export interface ChangeFullnameInterface {
  fullnamePayload: ChangeFullnameDto;
  userPayload: TokenPayloadInterface;
}
