import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument, UserDocument, ReactionDocument } from '@app/common';

import {
  USER_DOCUMENT,
  REACTION_DOCUMENT,
  FEED_DOCUMENT,
} from '../constants/schema';

import { SchemaTypes, Types } from 'mongoose';

@Schema({ versionKey: false, collection: FEED_DOCUMENT })
export class FeedDocument extends AbstractDocument {
  @Prop({ required: false, type: String, default: '' })
  description: string;

  @Prop({ required: true, type: String })
  imageUrl: string;

  @Prop({ required: true, type: [SchemaTypes.ObjectId], ref: USER_DOCUMENT })
  visibility: Types.ObjectId[];

  @Prop({ required: true, type: SchemaTypes.ObjectId, ref: USER_DOCUMENT })
  userId: Types.ObjectId | UserDocument;

  @Prop({
    type: [SchemaTypes.ObjectId],
    ref: REACTION_DOCUMENT,
    default: [],
  })
  reactions: Types.ObjectId[] | ReactionDocument[];

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const FeedSchema = SchemaFactory.createForClass(FeedDocument);
