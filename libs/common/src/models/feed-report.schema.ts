import { SchemaTypes, Types } from 'mongoose';
import { AbstractDocument } from '../database';
import { FEED_REPORT_DOCUMENT } from '../constants';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum FeedReportStatus {
  Pending = 'pending',
  ReadyToProcessing = 'ready_for_processing',
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
  @Prop({ type: [SchemaTypes.ObjectId], required: true, index: true })
  reporterId: Types.ObjectId[];

  @Prop({ type: SchemaTypes.ObjectId, required: true, index: true })
  reportedFeedId: Types.ObjectId;

  @Prop({ type: Object, required: true })
  reason: {
    [key in FeedReportReason]: number;
  };

  @Prop({
    type: String,
    enum: FeedReportStatus,
    default: FeedReportStatus.Pending,
    index: true,
  })
  status: string;

  @Prop({ type: SchemaTypes.ObjectId, index: true })
  processedAdminId: Types.ObjectId;

  @Prop({ type: Boolean })
  isViolating: boolean;
}

export const FeedReportSchema =
  SchemaFactory.createForClass(FeedReportDocument);
