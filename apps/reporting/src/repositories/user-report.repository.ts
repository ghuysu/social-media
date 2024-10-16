import {
  AbstractRepository,
  USER_REPORT_DOCUMENT,
  UserReportDocument,
} from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserReportRepository extends AbstractRepository<UserReportDocument> {
  protected readonly logger = new Logger(UserReportRepository.name);

  constructor(
    @InjectModel(USER_REPORT_DOCUMENT)
    private readonly userReportModel: Model<UserReportDocument>,
  ) {
    super(userReportModel);
  }
}
