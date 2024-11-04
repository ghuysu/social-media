import { AbstractRepository, FriendInviteDocument } from '@app/common';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FRIEND_INVITE_DOCUMENT } from '@app/common';
import { FilterQuery, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class FriendInviteRepository extends AbstractRepository<FriendInviteDocument> {
  protected readonly logger = new Logger(FriendInviteRepository.name);

  constructor(
    @InjectModel(FRIEND_INVITE_DOCUMENT)
    private readonly userModel: Model<FriendInviteDocument>,
  ) {
    super(userModel);
  }

  async deleteMany(
    filterQuery: FilterQuery<FriendInviteDocument>,
    populate?: Array<{
      path: string;
      select?: string;
      populate?: any;
    }>,
  ): Promise<FriendInviteDocument[]> {
    let query = this.model.deleteMany(filterQuery);

    if (!query) {
      this.logger.warn('Document was not found with filterQuery', filterQuery);
      throw new NotFoundException('Document was not found');
    }

    if (populate) {
      query = query.populate(populate);
    }

    const document = await query.lean<FriendInviteDocument[]>(true);

    return document;
  }
}
