import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument, FriendInviteDocument } from '@app/common';
import { FRIEND_INVITE_DOCUMENT, USER_DOCUMENT } from '../constants/schema';
import { SchemaTypes, Types } from 'mongoose';

@Schema({ versionKey: false, collection: USER_DOCUMENT })
export class UserDocument extends AbstractDocument {
  @Prop({ required: true, type: String, index: true })
  email: string;

  @Prop({ type: String })
  password: string;

  @Prop({ required: true, type: String })
  fullname: string;

  @Prop({ type: String })
  birthday: string;

  @Prop({ type: String, required: true })
  profileImageUrl: string;

  @Prop({ type: [SchemaTypes.ObjectId], ref: USER_DOCUMENT, default: [] })
  friendList: Types.ObjectId[] | UserDocument[];

  @Prop({
    type: [SchemaTypes.ObjectId],
    ref: FRIEND_INVITE_DOCUMENT,
    default: [],
  })
  friendInvites: Types.ObjectId[] | FriendInviteDocument[];

  @Prop({ type: String })
  country: string;

  @Prop({ type: Boolean, default: false })
  isSignedInByGoogle: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({
    type: String,
    enum: ['normal_user', 'admin', 'root_admin'],
    default: 'normal_user',
    index: true,
  })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);
