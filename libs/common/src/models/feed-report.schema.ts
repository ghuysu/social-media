import { SchemaTypes, Types } from 'mongoose';
import { AbstractDocument } from '../database';
import { FEED_REPORT_DOCUMENT } from '../constants';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum FeedReportStatus {
  Pending = 'pending',
  Processed = 'processed',
}

export enum FeedReportReason {
  SensitiveImage = 'sensitive_image',
  InappropriateWords = 'inappropriate_words',
}

@Schema({
  versionKey: false,
  timestamps: true,
  collection: FEED_REPORT_DOCUMENT,
})
export class FeedReportDocument extends AbstractDocument {
  @Prop({ type: [SchemaTypes.ObjectId], required: true })
  reporterId: Types.ObjectId[];

  @Prop({ type: SchemaTypes.ObjectId, required: true })
  reportedFeedId: Types.ObjectId;

  @Prop({ type: [String], enum: FeedReportReason, required: true })
  reason: string[];

  @Prop({
    type: String,
    enum: FeedReportStatus,
    default: FeedReportStatus.Pending,
  })
  status: string;

  @Prop({ type: Boolean, default: false })
  isViolating: boolean;
}

export const FeedReportSchema =
  SchemaFactory.createForClass(FeedReportDocument);
