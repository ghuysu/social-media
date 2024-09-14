import { UserDocument } from '@app/common';

export interface GoogleSignInInforInterface {
  signInToken: string;
  user: UserDocument;
}
