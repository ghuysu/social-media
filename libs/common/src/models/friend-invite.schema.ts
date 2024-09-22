import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument, UserDocument } from '@app/common';
import { SchemaTypes, Types } from 'mongoose';

export enum FriendInviteStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Rejected = 'rejected',
}

@Schema({ versionKey: false, collection: 'friendInvites' })
export class FriendInviteDocument extends AbstractDocument {
  @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
    ref: 'users',
    index: true,
  })
  sender: Types.ObjectId | UserDocument;

  @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
    ref: 'users',
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
