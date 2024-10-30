import {
  AbstractRepository,
  USER_REPORT_DOCUMENT,
  UserReportDocument,
} from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class UserReportRepository extends AbstractRepository<UserReportDocument> {
  protected readonly logger = new Logger(UserReportRepository.name);

  constructor(
    @InjectModel(USER_REPORT_DOCUMENT)
    private readonly userReportModel: Model<UserReportDocument>,
  ) {
    super(userReportModel);
  }

  async findAllByAscendingCreatedTime(
    filterQuery: FilterQuery<UserReportDocument>,
    skip: number,
    select: number,
  ): Promise<UserReportDocument[]> {
    return await this.userReportModel
      .find(filterQuery)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(select)
      .lean<UserReportDocument[]>(true);
  }

  async findAllByDescendingUpdatedTime(
    filterQuery: FilterQuery<UserReportDocument>,
    skip: number,
    select: number,
  ): Promise<UserReportDocument[]> {
    return await this.userReportModel
      .find(filterQuery)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(select)
      .lean<UserReportDocument[]>(true);
  }

  async deleteMany(filterQuery: FilterQuery<UserReportDocument>) {
    return await this.userReportModel.deleteMany(filterQuery);
  }
}
