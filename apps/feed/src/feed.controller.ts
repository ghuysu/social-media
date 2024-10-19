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
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { CreateFeedInterface } from './interfaces/create-feed.interface';
import { UpdateFeedInterface } from './interfaces/update-feed.interface';
import { DeleteFeedInterface } from './interfaces/delete-feed.interface';
import { GetEveryoneFeedsInterface } from './interfaces/get-everyone-feeds.interface';
import { GetCertainUserFeedsInterface } from './interfaces/get-certain-user-feeds.interface';
import { ReactFeedInterface } from './interfaces/react-feed.interface';
import { DeleteReactionsAndFeedsDto } from './dto/deleteReactionsAndFeeds.dto';
import { GetFeedListByAdminDto } from './dto/get-feed-list-by-admin.dto';
import { GetFeedByAdminDto } from '@app/common';

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
      console.log({ here: payload });
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
  async reactFeed(@Payload() { userPayload, payload }: ReactFeedInterface) {
    try {
      const feed = await this.feedService.reactFeed(userPayload, payload);
      return {
        status: HttpStatus.OK,
        message: 'Reacted feed successfully.',
        metadata: feed,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('get_everyone_feeds')
  async getEveryoneFeeds(
    @Payload() { userPayload, payload }: GetEveryoneFeedsInterface,
  ) {
    try {
      console.log(payload);
      const result = await this.feedService.getEveryoneFeeds(
        userPayload,
        payload,
      );
      return {
        status: HttpStatus.OK,
        message: 'Get everyone feeds successfully.',
        metadata: result,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('get_certain_user_feeds')
  async getCertainUserFeeds(
    @Payload() { userPayload, payload }: GetCertainUserFeedsInterface,
  ) {
    try {
      const result = await this.feedService.getCertainUserFeeds(
        userPayload,
        payload,
      );
      return {
        status: HttpStatus.OK,
        message: 'Get certain user feeds successfully.',
        metadata: result,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @EventPattern('delete_feeds_and_reactions_for_delete_account')
  async deleteRelationalFeedsAndReactions(
    @Payload() dto: DeleteReactionsAndFeedsDto,
  ) {
    try {
      await this.feedService.deleteRelationalFeedsAndReactions(dto);
    } catch (error) {
      console.error(error);
    }
  }

  @MessagePattern('get_feed_list_by_admin')
  async getFeedListByAdmin(@Payload() { userId }: GetFeedListByAdminDto) {
    try {
      const result = await this.feedService.getFeedListByAdmin(userId);
      return result;
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('get_feed_by_admin')
  async getFeedByAdmin(@Payload() { feedId }: GetFeedByAdminDto) {
    try {
      const result = await this.feedService.getFeedByAdmin(feedId);
      return result;
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('get_simple_feed')
  async getSimpleFeed(@Payload() { feedId }: GetFeedByAdminDto) {
    try {
      const result = await this.feedService.getSimpleFeed(feedId);
      return result;
    } catch (error) {
      return this.handleError(error);
    }
  }
}
