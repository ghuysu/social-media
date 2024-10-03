import { ReadMessageDto, TokenPayloadInterface } from '@app/common';

export interface ReadMessageInterface {
  userPayload: TokenPayloadInterface;

  payload: ReadMessageDto;
}
