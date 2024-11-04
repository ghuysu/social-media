import { GetEveryoneFeedsDto, TokenPayloadInterface } from '@app/common';

export interface GetEveryoneFeedsInterface {
  userPayload: TokenPayloadInterface;
  payload: GetEveryoneFeedsDto;
}
