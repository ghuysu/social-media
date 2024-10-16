import { SchemaTypes, Types } from 'mongoose';
import { AbstractDocument } from '../database';
import { USER_REPORT_DOCUMENT } from '../constants';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum UserReportStatus {
  Pending = 'pending',
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
  @Prop({ type: [SchemaTypes.ObjectId], required: true })
  reporterId: Types.ObjectId[];

  @Prop({ type: SchemaTypes.ObjectId, required: true })
  reportedUserId: Types.ObjectId;

  @Prop({ type: [String], enum: UserReportReason, required: true })
  reason: string[];

  @Prop({
    type: String,
    enum: UserReportStatus,
    default: UserReportStatus.Pending,
  })
  status: string;

  @Prop({ type: Boolean, default: false })
  isViolating: boolean;
}

export const UserReportSchema =
  SchemaFactory.createForClass(UserReportDocument);
