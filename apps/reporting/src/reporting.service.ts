import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserReportRepository } from './repositories/user-report.repository';
import { FeedReportRepository } from './repositories/feed-report.repository';

import {
  FEED_SERVICE,
  FeedReportStatus,
  USER_SERVICE,
  UserDocument,
  UserReportReason,
  UserReportStatus,
} from '@app/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class ReportingService {
  constructor(
    private readonly userReportRepository: UserReportRepository,
    private readonly feedReportRepository: FeedReportRepository,
    @Inject(FEED_SERVICE)
    private readonly feedClient: ClientProxy,
    @Inject(USER_SERVICE)
    private readonly userClient: ClientProxy,
  ) {}

  async reportUser({ userId }, { reportedUserId, reason: userReason }) {
    if (userId.toString() === reportedUserId.toString()) {
      throw new BadRequestException('Conflict request');
    }

    const reasonConverter = [
      UserReportReason.PostInappropriateFeeds,
      UserReportReason.OffendOthers,
    ];

    //check user is existing or not
    const reportedUser: UserDocument = await lastValueFrom(
      this.userClient
        .send('get_stranger_infor', { userId: reportedUserId })
        .pipe(
          map((response) => {
            if (response.error) {
              throw new NotFoundException('User not found');
            }
            return response.metadata;
          }),
        ),
    );

    if (reportedUser.role !== 'normal_user') {
      throw new BadRequestException('No permissions allowed');
    }

    //check user is reported before or not
    const report = await this.userReportRepository.findOne({
      reportedUserId,
      status: FeedReportStatus.Pending,
    });

    //if not, create a new one
    if (!report) {
      const realReason = {
        [UserReportReason.PostInappropriateFeeds]: 0,
        [UserReportReason.OffendOthers]: 0,
      };
      realReason[reasonConverter[userReason]] = 1;

      await this.userReportRepository.create({
        reportedUserId,
        reporterId: [userId],
        reason: realReason,
      });
      return;
    }

    //just report 1 time
    if (report.reporterId.some((id) => id.toString() === userId.toString())) {
      return;
    }

    //if be reported, update record
    //check if user have 10 users report, update report statistic
    if (report.reporterId.length === 9) {
      await this.userReportRepository.findOneAndUpdate(
        {
          reportedUserId,
          status: FeedReportStatus.Pending,
        },
        {
          $push: { reporterId: userId },
          status: UserReportStatus.ReadyToProcessing,
          $inc: { [`reason.${reasonConverter[userReason]}`]: 1 },
        },
      );

      return;
    }

    await this.userReportRepository.findOneAndUpdate(
      {
        reportedUserId,
        status: FeedReportStatus.Pending,
      },
      {
        $push: { reporterId: userId },
        $inc: { [`reason.${reasonConverter[userReason]}`]: 1 },
      },
    );
  }
}
