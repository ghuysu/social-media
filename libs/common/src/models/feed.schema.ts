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
  @Prop({ required: true, type: String })
  description: string;

  @Prop({ required: true, type: String })
  imageUrl: string;

  @Prop({ required: true, type: [SchemaTypes.ObjectId], ref: USER_DOCUMENT })
  visibility: Types.ObjectId[];

  @Prop({ required: true, type: SchemaTypes.ObjectId, ref: USER_DOCUMENT })
  userId: Types.ObjectId | UserDocument;

  @Prop({
    type: {
      like: { type: Number, default: 0 },
      love: { type: Number, default: 0 },
      haha: { type: Number, default: 0 },
      wow: { type: Number, default: 0 },
      sad: { type: Number, default: 0 },
      angry: { type: Number, default: 0 },
    },
  })
  reactionStatistic: {
    like: number;
    love: number;
    haha: number;
    wow: number;
    sad: number;
    angry: number;
  };

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
