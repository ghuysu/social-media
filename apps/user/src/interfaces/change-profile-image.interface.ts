import { TokenPayloadInterface } from '@app/common';

export interface ChangeProfileImageInterface {
  userPayload: TokenPayloadInterface;
  image: Buffer;
  originalname: string;
}
