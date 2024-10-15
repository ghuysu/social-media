import {
  AbstractRepository,
  DAILY_STATISTIC_DOCUMENT,
  DailyStatisticDocument,
} from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class DailyStatisticRepository extends AbstractRepository<DailyStatisticDocument> {
  protected readonly logger = new Logger(DailyStatisticRepository.name);

  constructor(
    @InjectModel(DAILY_STATISTIC_DOCUMENT)
    private readonly dailyStatisticModel: Model<DailyStatisticDocument>,
  ) {
    super(dailyStatisticModel);
  }
}
