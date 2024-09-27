import {
  BadRequestException,
  ConflictException,
  Controller,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { FeedService } from './feed.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateFeedInterface } from './interfaces/create-feed.interface';
import { UpdateFeedInterface } from './interfaces/update-feed.interface';
import { DeleteFeedInterface } from './interfaces/delete-feed.interface';

@Controller()
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

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

  @MessagePattern('create_feed')
  async createFeed(@Payload() { userPayload, payload }: CreateFeedInterface) {
    try {
      const result = await this.feedService.createFeed(userPayload, payload);
      return {
        status: HttpStatus.CREATED,
        message: 'Create feed successfully.',
        metadata: result,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('update_feed')
  async updateFeed(@Payload() { userPayload, payload }: UpdateFeedInterface) {
    try {
      const result = await this.feedService.updateFeed(userPayload, payload);
      return {
        status: HttpStatus.OK,
        message: 'Updated feed successfully.',
        metadata: result,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('delete_feed')
  async deleteFeed(@Payload() { userPayload, payload }: DeleteFeedInterface) {
    try {
      await this.feedService.deleteFeed(userPayload, payload);
      return {
        status: HttpStatus.OK,
        message: 'Deleted feed successfully.',
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('react_feed')
  async reactFeed() {}

  @MessagePattern('get_everyone_feeds')
  async getEveryoneFeeds() {}

  @MessagePattern('get_certain_user_feeds')
  async getCertainUserFeeds() {}
}
