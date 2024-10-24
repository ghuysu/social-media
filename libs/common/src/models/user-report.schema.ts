import { SchemaTypes, Types } from 'mongoose';
import { AbstractDocument } from '../database';
import { USER_REPORT_DOCUMENT } from '../constants';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum UserReportStatus {
  Pending = 'pending',
  ReadyToProcessing = 'ready_for_processing',
  Processed = 'processed',
}

export enum UserReportReason {
  PostInappropriateFeeds = 'post_inappropriate_feeds',
  OffendOthers = 'offend_others',
}

@Schema({
  versionKey: false,
  timestamps: true,
  collection: USER_REPORT_DOCUMENT,
})
export class UserReportDocument extends AbstractDocument {
  @Prop({ type: [SchemaTypes.ObjectId], required: true, index: true })
  reporterId: Types.ObjectId[];

  @Prop({ type: SchemaTypes.ObjectId, required: true, index: true })
  reportedUserId: Types.ObjectId;

  @Prop({ type: Object, required: true })
  reason: {
    [key in UserReportReason]: number;
  };

  @Prop({
    type: String,
    enum: UserReportStatus,
    default: UserReportStatus.Pending,
    index: true,
  })
  status: string;

  @Prop({ type: SchemaTypes.ObjectId, index: true })
  processedAdminId: Types.ObjectId;

  @Prop({ type: Boolean })
  isViolating: boolean;
}

export const UserReportSchema =
  SchemaFactory.createForClass(UserReportDocument);
