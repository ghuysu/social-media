import { CreateMessageDto, TokenPayloadInterface } from '@app/common';

export interface CreateMessageInterface {
  userPayload: TokenPayloadInterface;
  payload: CreateMessageDto;
}
