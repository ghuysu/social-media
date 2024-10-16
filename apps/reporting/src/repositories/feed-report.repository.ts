import {
  AbstractRepository,
  FEED_REPORT_DOCUMENT,
  FeedReportDocument,
} from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class FeedReportRepository extends AbstractRepository<FeedReportDocument> {
  protected readonly logger = new Logger(FeedReportRepository.name);

  constructor(
    @InjectModel(FEED_REPORT_DOCUMENT)
    private readonly feedReportModel: Model<FeedReportDocument>,
  ) {
    super(feedReportModel);
  }
}
