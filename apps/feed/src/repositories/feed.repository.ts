import { AbstractRepository, FEED_DOCUMENT, FeedDocument } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class FeedRepository extends AbstractRepository<FeedDocument> {
  protected readonly logger = new Logger(FeedRepository.name);

  constructor(
    @InjectModel(FEED_DOCUMENT)
    private readonly feedModel: Model<FeedDocument>,
  ) {
    super(feedModel);
  }

  async searchFeeds(
    filterQuery: FilterQuery<FeedDocument>,
    skip: number,
    populate?: Array<{
      path: string;
      select?: string;
      populate?: any;
    }>,
    select?: string,
  ): Promise<FeedDocument[]> {
    const feeds = await this.model
      .find(filterQuery)
      .select(select)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(30)
      .populate(populate)
      .lean<FeedDocument[]>();

    return feeds;
  }
}
