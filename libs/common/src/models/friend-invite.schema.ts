import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument, UserDocument } from '@app/common';

import { FRIEND_INVITE_DOCUMENT, USER_DOCUMENT } from '../constants/schema';
import { SchemaTypes, Types } from 'mongoose';

export enum FriendInviteStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Rejected = 'rejected',
}

@Schema({ versionKey: false, collection: FRIEND_INVITE_DOCUMENT })
export class FriendInviteDocument extends AbstractDocument {
  @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
    ref: USER_DOCUMENT,
    index: true,
  })
  sender: Types.ObjectId | UserDocument;

  @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
    ref: USER_DOCUMENT,
    index: true,
  })
  receiver: Types.ObjectId | UserDocument;

  @Prop({
    type: String,
    enum: FriendInviteStatus,
    default: FriendInviteStatus.Pending,
    index: true,
  })
  status: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const FriendInviteSchema =
  SchemaFactory.createForClass(FriendInviteDocument);
