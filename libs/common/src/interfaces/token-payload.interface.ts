import { Types } from 'mongoose';

export interface TokenPayloadInterface {
  userId: Types.ObjectId;
  email: string;
  role: string;
}
