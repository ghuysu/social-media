import { UserDocument } from '@app/common';

export interface AdminCodeInterface {
  admin: UserDocument;
  code: string;
}
