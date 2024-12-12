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
  STATISTIC_SERVICE,
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
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

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
    @Inject(STATISTIC_SERVICE)
    private readonly statisticClient: ClientProxy,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
    if (report.reporterId.length === 1) {
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

      //update report statistics
      this.statisticClient.emit('new_report', { type: 'user' });

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
    if (report.reporterId.length === 1) {
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

      //update report statistics
      this.statisticClient.emit('new_report', { type: 'feed' });
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
      this.userReportRepository.findAllByAscendingCreatedTime(
        {
          status: UserReportStatus.ReadyToProcessing,
        },
        0,
        20,
      ),
      //get 20 feed reports
      this.feedReportRepository.findAllByAscendingCreatedTime(
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

    //get report statistics
    const reportStatistics = await this.cacheManager.get('report_statistics');

    return {
      numberOfUserReports: reportStatistics['user'],
      numberOfFeedReports: reportStatistics['feed'],
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
    const userReports =
      await this.userReportRepository.findAllByAscendingCreatedTime(
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

        report.reporterId = inforList;
        report.reportedUserId = reportedUser;

        return report;
      }),
    );

    return returnedUserReports;
  }

  async getMoreFeedReports({ skip }: GetMoreFeedReportsDto) {
    const feedReports =
      await this.feedReportRepository.findAllByAscendingCreatedTime(
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

  async getProcessedReports() {
    const [userReports, feedReports] = await Promise.all([
      //get 20 user reports
      this.userReportRepository.findAllByDescendingUpdatedTime(
        {
          status: UserReportStatus.Processed,
        },
        0,
        20,
      ),
      //get 20 feed reports
      this.feedReportRepository.findAllByDescendingUpdatedTime(
        {
          status: FeedReportStatus.Processed,
        },
        0,
        20,
      ),
    ]);

    return {
      userReports,
      feedReports,
    };
  }

  async getMoreUserProcessedReports({ skip }: GetMoreUserReportsDto) {
    const userReports =
      await this.userReportRepository.findAllByDescendingUpdatedTime(
        {
          status: UserReportStatus.Processed,
        },
        skip,
        20,
      );

    return userReports;
  }

  async getMoreFeedProcessedReports({ skip }: GetMoreFeedReportsDto) {
    const feedReports =
      await this.feedReportRepository.findAllByDescendingUpdatedTime(
        {
          status: FeedReportStatus.Processed,
        },
        skip,
        20,
      );

    return feedReports;
  }

  async deleteUserReport(userId: Types.ObjectId | string) {
    this.notificationClient.emit('emit_message', {
      name: 'delete_user_report',
      payload: {
        userReportId: userId,
      },
    });

    const { deletedCount } = await this.userReportRepository.deleteMany({
      reportedUserId: userId,
    });

    // update feed report statistics
    this.statisticClient.emit('processed_report', {
      type: 'user',
      number: deletedCount,
    });
  }

  async deleteFeedReport(feedId: Types.ObjectId | string) {
    this.notificationClient.emit('emit_message', {
      name: 'delete_feed_report',
      payload: {
        feedReportId: feedId,
      },
    });

    const { deletedCount } = await this.feedReportRepository.deleteMany({
      reportedFeedId: feedId,
    });

    // update feed report statistics
    this.statisticClient.emit('processed_report', {
      type: 'feed',
      number: deletedCount,
    });
  }

  async processFeedReport({ userId }, { reportId, isViolating }) {
    //check report is existing or not
    const report = await this.feedReportRepository.findOne({ _id: reportId });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    //check report is processed or not
    if (report.status === FeedReportStatus.Processed) {
      const result = report.isViolating ? 'VIOLATING' : 'NOT VIOLATING';
      throw new BadRequestException(
        `Report was processed with result is ${result} by #${report.processedAdminId} admin`,
      );
    }

    //check report is ready for processing or not
    if (report.status === FeedReportStatus.Pending) {
      throw new BadRequestException('Report is not ready for processing');
    }

    //check isValidation is true or false
    if (!isViolating) {
      //if false, close report
      await this.feedReportRepository.findOneAndUpdate(
        {
          _id: reportId,
        },
        {
          status: FeedReportStatus.Processed,
          processedAdminId: userId,
          isViolating: false,
        },
      );
      return;
    }

    //if true, close report, delete feed, send email, update user violating
    //close report
    await this.feedReportRepository.findOneAndUpdate(
      {
        _id: reportId,
      },
      {
        status: FeedReportStatus.Processed,
        processedAdminId: userId,
        isViolating: true,
      },
    );

    // get feed
    const feedInfor: FeedDocument = await lastValueFrom(
      this.feedClient
        .send('get_certain_feed', {
          feedId: report.reportedFeedId,
        })
        .pipe(
          map((response) => {
            if (response.error) {
              throw new NotFoundException('Feed not found');
            }
            return response;
          }),
        ),
    );

    //delete feed
    this.feedClient.emit('delete_feed_for_feed_violating', {
      userPayload: {
        userId: feedInfor.userId['_id'],
        email: feedInfor.userId['email'],
        role: feedInfor.userId['role'],
      },
      payload: {
        feedId: feedInfor._id,
      },
    });

    // //update user violating
    this.userClient.emit('feed_violating', {
      userId: feedInfor.userId['_id'],
      email: feedInfor.userId['email'],
      feedId: feedInfor._id,
      reason: report.reason,
    });

    // //emit infor
    this.notificationClient.emit('emit_message', {
      name: 'processed_feed_report',
      payload: {
        reportId,
      },
    });

    // update feed report statistics
    this.statisticClient.emit('processed_report', { type: 'feed', number: 1 });
  }

  async processUserReport({ userId }, { reportId, isViolating }) {
    //check report is existing or not
    const report = await this.userReportRepository.findOne({ _id: reportId });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    //check report is processed or not
    if (report.status === UserReportStatus.Processed) {
      const result = report.isViolating ? 'VIOLATING' : 'NOT VIOLATING';
      throw new BadRequestException(
        `Report was processed with result is ${result} by #${report.processedAdminId} admin`,
      );
    }

    //check report is ready for processing or not
    if (report.status === UserReportStatus.Pending) {
      throw new BadRequestException('Report is not ready for processing');
    }

    //check isViolating is true or false
    if (!isViolating) {
      //if false, close report
      await this.userReportRepository.findOneAndUpdate(
        {
          _id: reportId,
        },
        {
          status: UserReportStatus.Processed,
          processedAdminId: userId,
          isViolating: false,
        },
      );
      return;
    }

    //if true, close report, delete feed, send email, update user violating
    //close report
    await this.userReportRepository.findOneAndUpdate(
      {
        _id: reportId,
      },
      {
        status: UserReportStatus.Processed,
        processedAdminId: userId,
        isViolating: true,
      },
    );

    // //update user violating
    this.userClient.emit('user_violating', {
      userId: report.reportedUserId,
      reason: report.reason,
    });

    // //emit infor
    this.notificationClient.emit('emit_message', {
      name: 'processed_user_report',
      payload: {
        reportId,
      },
    });

    // update feed report statistics
    this.statisticClient.emit('processed_report', { type: 'user', number: 1 });
  }
}
