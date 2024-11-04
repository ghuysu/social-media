import { TokenPayloadInterface } from '@app/common';

export interface CreateFeedInterface {
  userPayload: TokenPayloadInterface;
  payload: {
    description: string;
    visibility: Array<string>;
    image: Buffer;
    originalname: string;
  };
}
