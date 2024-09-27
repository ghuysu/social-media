import { TokenPayloadInterface } from '@app/common';

export interface DeleteFeedInterface {
  userPayload: TokenPayloadInterface;
  payload: {
    feedId: string;
  };
}
