import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument, UserDocument, FeedDocument } from '@app/common';
import {
  REACTION_DOCUMENT,
  USER_DOCUMENT,
  FEED_DOCUMENT,
} from '../constants/schema';
import { SchemaTypes, Types } from 'mongoose';

@Schema({ versionKey: false, collection: REACTION_DOCUMENT })
export class ReactionDocument extends AbstractDocument {
  @Prop({ required: true, type: SchemaTypes.ObjectId, ref: USER_DOCUMENT })
  userId: Types.ObjectId | UserDocument;

  @Prop({ required: true, type: SchemaTypes.ObjectId, ref: FEED_DOCUMENT })
  feedId: Types.ObjectId | FeedDocument;

  @Prop({
    required: true,
    type: String,
    enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'],
  })
  icon: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const ReactionSchema = SchemaFactory.createForClass(ReactionDocument);
