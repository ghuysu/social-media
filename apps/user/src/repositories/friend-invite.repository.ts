import { AbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { FRIEND_INVITE_DOCUMENT } from '@app/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { FriendInviteDocument } from '@app/common';

@Injectable()
export class FriendInviteRepository extends AbstractRepository<FriendInviteDocument> {
  protected readonly logger = new Logger(FriendInviteRepository.name);

  constructor(
    @InjectModel(FRIEND_INVITE_DOCUMENT)
    private readonly userModel: Model<FriendInviteDocument>,
  ) {
    super(userModel);
  }
}
