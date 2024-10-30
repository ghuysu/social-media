import {
  AbstractRepository,
  STATISTIC_DOCUMENT,
  StatisticDocument,
} from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class StatisticRepository extends AbstractRepository<StatisticDocument> {
  protected readonly logger = new Logger(StatisticRepository.name);

  constructor(
    @InjectModel(STATISTIC_DOCUMENT)
    private readonly statisticModel: Model<StatisticDocument>,
  ) {
    super(statisticModel);
  }

  async findAll(): Promise<StatisticDocument[]> {
    const query = this.statisticModel.find().sort({ createdAt: -1 });

    const documents = await query.lean<StatisticDocument[]>(true);

    return documents;
  }
}
