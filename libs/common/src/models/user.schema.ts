import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument, FriendInviteDocument } from '@app/common';
import { SchemaTypes, Types } from 'mongoose';

@Schema({ versionKey: false, collection: 'users' })
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

  @Prop({ type: [SchemaTypes.ObjectId], ref: 'users', default: [] })
  friendList: Types.ObjectId[] | UserDocument[];

  @Prop({ type: [SchemaTypes.ObjectId], ref: 'friendInvites', default: [] })
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
