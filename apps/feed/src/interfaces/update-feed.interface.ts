import { TokenPayloadInterface } from '@app/common';

export interface UpdateFeedInterface {
  userPayload: TokenPayloadInterface;
  payload: {
    feedId: string;
    description: string;
    visibility: string[];
  };
}
