import { TokenPayloadInterface } from '@app/common';

export class GetCertainUserFeedsInterface {
  userPayload: TokenPayloadInterface;
  payload: {
    userId: string;
    skip: number;
  };
}
