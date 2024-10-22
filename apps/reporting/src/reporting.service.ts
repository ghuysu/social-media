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
  FeedDocument,
  FeedReportReason,
  FeedReportStatus,
  NOTIFICATION_SERVICE,
  USER_SERVICE,
  UserDocument,
  UserReportReason,
  UserReportStatus,
} from '@app/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, map } from 'rxjs';
import { Types } from 'mongoose';
import { GetMoreUserReportsDto } from './dto/get-more-user-reports.dto';
import { GetMoreFeedReportsDto } from './dto/get-more-feed-reports.dto';

@Injectable()
export class ReportingService {
  constructor(
    private readonly userReportRepository: UserReportRepository,
    private readonly feedReportRepository: FeedReportRepository,
    @Inject(FEED_SERVICE)
    private readonly feedClient: ClientProxy,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy,
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
              throw new NotFoundException('Resource not found');
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
      status: UserReportStatus.Pending,
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
          status: UserReportStatus.Pending,
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
        status: UserReportStatus.Pending,
      },
      {
        $push: { reporterId: userId },
        $inc: { [`reason.${reasonConverter[userReason]}`]: 1 },
      },
    );
  }

  async reportFeed({ userId }, { reportedFeedId, reason: userReason }) {
    const reasonConverter = [
      FeedReportReason.SensitiveImage,
      FeedReportReason.InappropriateWords,
    ];

    //check feed is existing or not
    const reportedFeed: FeedDocument = await lastValueFrom(
      this.feedClient.send('get_simple_feed', { feedId: reportedFeedId }).pipe(
        map((response) => {
          if (response.error) {
            throw new NotFoundException('Resource not found');
          }
          return response;
        }),
      ),
    );

    if (reportedFeed.userId.toString() === userId.toString()) {
      throw new BadRequestException('Conflict request');
    }

    //check feed is reported before or not
    const report = await this.feedReportRepository.findOne({
      reportedFeedId,
      status: FeedReportStatus.Pending,
    });

    //if not, create a new one
    if (!report) {
      const realReason = {
        [FeedReportReason.SensitiveImage]: 0,
        [FeedReportReason.InappropriateWords]: 0,
      };
      realReason[reasonConverter[userReason]] = 1;

      await this.feedReportRepository.create({
        reportedFeedId,
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
      await this.feedReportRepository.findOneAndUpdate(
        {
          reportedFeedId,
          status: FeedReportStatus.Pending,
        },
        {
          $push: { reporterId: userId },
          status: FeedReportStatus.ReadyToProcessing,
          $inc: { [`reason.${reasonConverter[userReason]}`]: 1 },
        },
      );

      return;
    }

    await this.feedReportRepository.findOneAndUpdate(
      {
        reportedFeedId,
        status: FeedReportStatus.Pending,
      },
      {
        $push: { reporterId: userId },
        $inc: { [`reason.${reasonConverter[userReason]}`]: 1 },
      },
    );
  }

  async getReports() {
    const [userReports, feedReports] = await Promise.all([
      //get 20 user reports
      this.userReportRepository.findAll(
        {
          status: UserReportStatus.ReadyToProcessing,
        },
        0,
        20,
      ),
      //get 20 feed reports
      this.feedReportRepository.findAll(
        {
          status: FeedReportStatus.ReadyToProcessing,
        },
        0,
        20,
      ),
    ]);

    //get infor's users
    const returnedUserReports = await Promise.all(
      userReports.map(async (report) => {
        const [inforList, reportedUser] = await Promise.all([
          this.getListOfUserInfor([...report.reporterId]),
          this.getUserInforByAdminId(report.reportedUserId),
        ]);

        report.reporterId = inforList;
        report.reportedUserId = reportedUser;

        return report;
      }),
    );

    const returnedFeedReports = await Promise.all(
      feedReports.map(async (report) => {
        const [inforList, reportedFeed] = await Promise.all([
          this.getListOfUserInfor([...report.reporterId]),
          this.getFeedByAdmin(report.reportedFeedId),
        ]);

        report.reporterId = inforList;
        report.reportedFeedId = reportedFeed;

        return report;
      }),
    );

    return {
      userReports: returnedUserReports,
      feedReports: returnedFeedReports,
    };
  }

  async getListOfUserInfor(userIdList: Types.ObjectId[] | string[]) {
    return await lastValueFrom(
      this.userClient
        .send('get_list_of_user_infor', {
          userIdList,
        })
        .pipe(
          map((response) => {
            return response;
          }),
        ),
    );
  }

  async getUserInforByAdminId(searchValue: Types.ObjectId | string) {
    return await lastValueFrom(
      this.userClient
        .send('get_user_infor_by_admin_with_id', {
          searchValue,
        })
        .pipe(
          map((response) => {
            if (response.error) {
              return null;
            }
            return response;
          }),
        ),
    );
  }

  async getFeedByAdmin(searchValue: Types.ObjectId | string) {
    return await lastValueFrom(
      this.feedClient
        .send('get_feed_by_admin', {
          feedId: searchValue,
        })
        .pipe(
          map((response) => {
            if (response.error) {
              return null;
            }
            return response;
          }),
        ),
    );
  }

  async getMoreUserReports({ skip }: GetMoreUserReportsDto) {
    const userReports = await this.userReportRepository.findAll(
      {
        status: UserReportStatus.ReadyToProcessing,
      },
      skip,
      20,
    );

    const returnedUserReports = await Promise.all(
      userReports.map(async (report) => {
        const [inforList, reportedUser] = await Promise.all([
          this.getListOfUserInfor([...report.reporterId]),
          this.getUserInforByAdminId(report.reportedUserId),
        ]);

        console.log({ inforList, reportedUser });

        report.reporterId = inforList;
        report.reportedUserId = reportedUser;

        return report;
      }),
    );

    return returnedUserReports;
  }

  async getMoreFeedReports({ skip }: GetMoreFeedReportsDto) {
    const feedReports = await this.feedReportRepository.findAll(
      {
        status: FeedReportStatus.ReadyToProcessing,
      },
      skip,
      20,
    );

    const returnedFeedReports = await Promise.all(
      feedReports.map(async (report) => {
        const [inforList, reportedFeed] = await Promise.all([
          this.getListOfUserInfor([...report.reporterId]),
          this.getFeedByAdmin(report.reportedFeedId),
        ]);

        report.reporterId = inforList;
        report.reportedFeedId = reportedFeed;

        return report;
      }),
    );

    return returnedFeedReports;
  }

  async deleteUserReport(userId: Types.ObjectId | string) {
    this.notificationClient.emit('emit_message', {
      name: 'delete_user_report',
      payload: {
        userReportId: userId,
      },
    });

    await this.userReportRepository.deleteMany({
      reportedUserId: userId,
    });
  }

  async deleteFeedReport(feedId: Types.ObjectId | string) {
    this.notificationClient.emit('emit_message', {
      name: 'delete_feed_report',
      payload: {
        feedReportId: feedId,
      },
    });

    await this.feedReportRepository.deleteMany({
      reportedFeedId: feedId,
    });
  }
}
