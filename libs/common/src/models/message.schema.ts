import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument, UserDocument, FeedDocument } from '@app/common';

import {
  USER_DOCUMENT,
  MESSAGE_DOCUMENT,
  FEED_DOCUMENT,
} from '../constants/schema';

import { SchemaTypes, Types } from 'mongoose';

@Schema({ versionKey: false, collection: MESSAGE_DOCUMENT })
export class MessageDocument extends AbstractDocument {
  @Prop({ required: true, type: SchemaTypes.ObjectId, ref: USER_DOCUMENT })
  senderId: Types.ObjectId | UserDocument;

  @Prop({ required: true, type: SchemaTypes.ObjectId, ref: USER_DOCUMENT })
  receiverId: Types.ObjectId | UserDocument;

  @Prop({ required: false, type: SchemaTypes.ObjectId, ref: FEED_DOCUMENT })
  feedId: Types.ObjectId | FeedDocument;

  @Prop({ required: true, type: String })
  content: string;

  @Prop({ type: Boolean, default: false })
  isRead: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(MessageDocument);
