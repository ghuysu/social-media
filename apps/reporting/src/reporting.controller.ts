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
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReportUserDto } from './dto/reportUser.dto';
import { ReportFeedDto } from './dto/reportFeed.dto';

@Controller()
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  private handleError(error: any) {
    console.log(error);
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
        status: HttpStatus.OK,
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
        status: HttpStatus.OK,
        message: 'Report user successfully.',
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('get_reports')
  async getFeports() {}
}
