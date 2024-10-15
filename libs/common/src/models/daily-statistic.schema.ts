import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';
import { DAILY_STATISTIC_DOCUMENT } from '../constants/schema';

@Schema({ versionKey: false, collection: DAILY_STATISTIC_DOCUMENT })
export class DailyStatisticDocument extends AbstractDocument {
  @Prop({ type: Number, default: 0 })
  newUsers: number;

  @Prop({ type: Number, default: 0 })
  newFeeds: number;

  @Prop({ type: Number, default: 0 })
  newFriends: number;

  @Prop({ type: Number, default: 0 })
  deletedUsers: number;

  @Prop({ type: Number, default: 0 })
  deletedFriends: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const DailyStatisticSchema = SchemaFactory.createForClass(
  DailyStatisticDocument,
);
