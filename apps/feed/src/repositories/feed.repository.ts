import { AbstractRepository, FEED_DOCUMENT, FeedDocument } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class FeedRepository extends AbstractRepository<FeedDocument> {
  protected readonly logger = new Logger(FeedRepository.name);

  constructor(
    @InjectModel(FEED_DOCUMENT)
    private readonly feedModel: Model<FeedDocument>,
  ) {
    super(feedModel);
  }
}
