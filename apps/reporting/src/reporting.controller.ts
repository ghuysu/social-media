import {
  BadRequestException,
  ConflictException,
  Controller,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { ReportUserDto } from './dto/reportUser.dto';
import { ReportFeedDto } from './dto/reportFeed.dto';
import { UserIdDto } from './dto/userId.dto';
import { FeedIdDto } from './dto/feedId.dto';
import { GetMoreUserReportsDto } from './dto/get-more-user-reports.dto';
import { GetMoreFeedReportsDto } from './dto/get-more-feed-reports.dto';
import { ProcessReportDto } from './dto/process-report.dto';

@Controller()
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  private handleError(error: any) {
    if (error instanceof ConflictException) {
      return {
        statusCode: HttpStatus.CONFLICT,
        message: error.message,
        error: 'Conflict',
      };
    }

    if (error instanceof NotFoundException) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: error.message,
        error: 'Not Found',
      };
    }

    if (error instanceof BadRequestException) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
        error: 'Bad Request',
      };
    }

    if (error instanceof UnauthorizedException) {
      return {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: error.message,
        error: 'Unauthorized',
      };
    }

    if (error instanceof InternalServerErrorException) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
        error: 'Internal Server Error',
      };
    }

    // Default case for other errors
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: error.message,
      error: 'Internal Server Error',
    };
  }

  @MessagePattern('report_feed')
  async reportFeed(@Payload() { userPayload, payload }: ReportFeedDto) {
    try {
      await this.reportingService.reportFeed(userPayload, payload);
      return {
        status: HttpStatus.CREATED,
        message: 'Report feed successfully.',
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('report_user')
  async reportUser(@Payload() { userPayload, payload }: ReportUserDto) {
    try {
      await this.reportingService.reportUser(userPayload, payload);
      return {
        status: HttpStatus.CREATED,
        message: 'Report user successfully.',
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('get_reports')
  async getFeports() {
    try {
      const result = await this.reportingService.getReports();
      return {
        status: HttpStatus.OK,
        message: 'Get reports successfully.',
        metadata: result,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @EventPattern('delete_user_reports')
  async deleteUserReport(@Payload() { userId }: UserIdDto) {
    this.reportingService.deleteUserReport(userId);
  }

  @EventPattern('delete_feed_reports')
  async deleteFeedReport(@Payload() { feedId }: FeedIdDto) {
    this.reportingService.deleteFeedReport(feedId);
  }

  @MessagePattern('get_more_user_reports')
  async getMoreUserReports(@Payload() dto: GetMoreUserReportsDto) {
    const result = await this.reportingService.getMoreUserReports(dto);
    return {
      status: HttpStatus.OK,
      message: 'Get more user reports successfully.',
      metadata: result,
    };
  }

  @MessagePattern('get_more_feed_reports')
  async getMoreFeedReports(@Payload() dto: GetMoreFeedReportsDto) {
    const result = await this.reportingService.getMoreFeedReports(dto);
    return {
      status: HttpStatus.OK,
      message: 'Get more feed reports successfully.',
      metadata: result,
    };
  }

  @MessagePattern('get_processed_reports')
  async getProcessedReports() {
    const result = await this.reportingService.getProcessedReports();
    return {
      status: HttpStatus.OK,
      message: 'Get more processed feed reports successfully.',
      metadata: result,
    };
  }

  @MessagePattern('get_more_processed_user_reports')
  async getMoreProcessedUserReports(@Payload() dto: GetMoreUserReportsDto) {
    const result = await this.reportingService.getMoreUserProcessedReports(dto);
    return {
      status: HttpStatus.OK,
      message: 'Get more processed user reports successfully.',
      metadata: result,
    };
  }

  @MessagePattern('get_more_processed_feed_reports')
  async getMoreProcessedFeedReports(@Payload() dto: GetMoreFeedReportsDto) {
    const result = await this.reportingService.getMoreFeedProcessedReports(dto);
    return {
      status: HttpStatus.OK,
      message: 'Get more processed feed reports successfully.',
      metadata: result,
    };
  }

  @MessagePattern('process_feed_report')
  async processFeedReport(
    @Payload() { userPayload, payload }: ProcessReportDto,
  ) {
    try {
      await this.reportingService.processFeedReport(userPayload, payload);
      return {
        status: HttpStatus.OK,
        message: 'Processed feed report successfully.',
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('process_user_report')
  async processUserReport(
    @Payload() { userPayload, payload }: ProcessReportDto,
  ) {
    try {
      await this.reportingService.processUserReport(userPayload, payload);
      return {
        status: HttpStatus.OK,
        message: 'Processed user report successfully.',
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
}
