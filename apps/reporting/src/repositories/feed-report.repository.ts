import {
  AbstractRepository,
  FEED_REPORT_DOCUMENT,
  FeedReportDocument,
} from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class FeedReportRepository extends AbstractRepository<FeedReportDocument> {
  protected readonly logger = new Logger(FeedReportRepository.name);

  constructor(
    @InjectModel(FEED_REPORT_DOCUMENT)
    private readonly feedReportModel: Model<FeedReportDocument>,
  ) {
    super(feedReportModel);
  }

  async findAllByAscendingCreatedTime(
    filterQuery: FilterQuery<FeedReportDocument>,
    skip: number,
    select: number,
  ): Promise<FeedReportDocument[]> {
    return await this.feedReportModel
      .find(filterQuery)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(select)
      .lean<FeedReportDocument[]>(true);
  }

  async findAllByDescendingUpdatedTime(
    filterQuery: FilterQuery<FeedReportDocument>,
    skip: number,
    select: number,
  ): Promise<FeedReportDocument[]> {
    return await this.feedReportModel
      .find(filterQuery)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(select)
      .lean<FeedReportDocument[]>(true);
  }

  async deleteMany(filterQuery: FilterQuery<FeedReportDocument>) {
    return await this.feedReportModel.deleteMany(filterQuery);
  }
}
