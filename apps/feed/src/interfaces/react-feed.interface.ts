import { TokenPayloadInterface } from '@app/common';

export interface ReactFeedInterface {
  userPayload: TokenPayloadInterface;

  payload: {
    feedId: string;
    icon: string;
  };
}
