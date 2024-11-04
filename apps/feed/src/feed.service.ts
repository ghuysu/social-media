import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FeedRepository } from './repositories/feed.repository';
import { ReactionRepository } from './repositories/reaction.repository';
import {
  AWS_S3_SERVICE,
  createTTL,
  FeedDocument,
  GetEveryoneFeedsDto,
  MESSAGE_SERVICE,
  NOTIFICATION_SERVICE,
  ReactionDocument,
  REPORTING_SERVICE,
  STATISTIC_SERVICE,
  TokenPayloadInterface,
  USER_SERVICE,
  UserDocument,
} from '@app/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { lastValueFrom, map } from 'rxjs';
import { DeleteReactionsAndFeedsDto } from './dto/deleteReactionsAndFeeds.dto';
import { Types } from 'mongoose';

@Injectable()
export class FeedService {
  constructor(
    private readonly feedRepository: FeedRepository,
    private readonly reactionRepository: ReactionRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy,
    @Inject(AWS_S3_SERVICE)
    private readonly awss3Client: ClientProxy,
    @Inject(USER_SERVICE)
    private readonly userClient: ClientProxy,
    @Inject(MESSAGE_SERVICE)
    private readonly messageClient: ClientProxy,
    @Inject(STATISTIC_SERVICE)
    private readonly statisticClient: ClientProxy,
    @Inject(REPORTING_SERVICE)
    private readonly reportingClient: ClientProxy,
    private readonly configService: ConfigService,
  ) {}

  private createImageNameFromOriginalname(originalname: string): string {
    const timestamp = new Date().getTime();
    return `${timestamp}_${originalname.split('.').shift()}`;
  }

  async createFeed(
    { userId, email, role }: TokenPayloadInterface,
    { description, visibility, originalname, image },
  ) {
    const user = await lastValueFrom(
      this.userClient.send('get_user', { userId, email, role }).pipe(
        map((response) => {
          if (response.error) {
            throw new NotFoundException('Resource not found');
          }
          return response.metadata;
        }),
      ),
    );

    //create new image name
    const newImageName = this.createImageNameFromOriginalname(originalname);

    //upload image to s3
    this.awss3Client.emit('upload_image', {
      image,
      imageName: newImageName,
    });

    //get url
    const imageUrl = `https://${this.configService.get('BUCKET_NAME')}.s3.${this.configService.get(
      'AWSS3_REGION',
    )}.amazonaws.com/${newImageName}`;

    //create feed
    const feed = await this.feedRepository.create(
      {
        description,
        visibility,
        imageUrl,
        userId,
      },
      [{ path: 'userId', select: '_id profileImageUrl fullname' }],
    );

    //update redis
    let redisFeeds: FeedDocument[] = await this.cacheManager.get(
      `feed:${userId}`,
    );
    if (!redisFeeds) {
      redisFeeds = await this.feedRepository.find({ userId }, [
        { path: 'userId', select: '_id profileImageUrl fullname' },
        {
          path: 'reactions',
          populate: [
            { path: 'userId', select: '_id profileImageUrl fullname' },
          ],
        },
      ]);

      if (!redisFeeds) {
        redisFeeds = [];
        redisFeeds.push(feed);
      }
    }

    redisFeeds.push(feed);

    this.cacheManager.set(`feed:${userId}`, redisFeeds, {
      ttl: createTTL(60 * 60 * 24 * 30, 60 * 6 * 24),
    });

    //emit feed for friends
    const emitPayload = {
      userId: user.friendList.map((f) => f._id.toString()),
      metadata: feed,
    };

    this.notificationClient.emit('emit_message', {
      name: 'create_feed',
      payload: emitPayload,
    });

    //update feed statistic
    this.statisticClient.emit('created_feed', {});

    //return feed
    return feed;
  }

  async updateFeed(
    { userId, email, role }: TokenPayloadInterface,
    { feedId, description, visibility },
  ) {
    //update feed
    let updatedFeed;
    try {
      updatedFeed = await this.feedRepository.findOneAndUpdate(
        { _id: feedId, userId },
        { description, visibility },
        [
          { path: 'userId', select: '_id profileImageUrl fullname' },
          {
            path: 'reactions',
            populate: [
              { path: 'userId', select: '_id profileImageUrl fullname' },
            ],
          },
        ],
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Not Found Resource');
      }
      throw new InternalServerErrorException('Something is wrong');
    }

    //update redis
    let redisFeeds: FeedDocument[] = await this.cacheManager.get(
      `feed:${userId}`,
    );

    if (!redisFeeds) {
      redisFeeds = await this.feedRepository.find({ userId }, [
        { path: 'userId', select: '_id profileImageUrl fullname' },
        {
          path: 'reactions',
          populate: [
            { path: 'userId', select: '_id profileImageUrl fullname' },
          ],
        },
      ]);
    }

    redisFeeds.forEach((f, index) => {
      if (f._id.toString() === feedId.toString()) {
        redisFeeds[index] = updatedFeed;
      }
    });

    this.cacheManager.set(`feed:${userId}`, redisFeeds, {
      ttl: createTTL(60 * 60 * 24 * 30, 60 * 6 * 24),
    });

    //emit feed for friends
    const user = await lastValueFrom(
      this.userClient.send('get_user', { userId, email, role }).pipe(
        map((response) => {
          if (response.error) {
            throw new NotFoundException('Resource not found');
          }
          return response.metadata;
        }),
      ),
    );

    const emitPayload = {
      userId: user.friendList.map((f) => f._id.toString()),
      metadata: updatedFeed,
    };

    console.log(emitPayload);

    this.notificationClient.emit('emit_message', {
      name: 'update_feed',
      payload: emitPayload,
    });

    //return feed
    return updatedFeed;
  }

  async deleteFeed({ userId, email, role }: TokenPayloadInterface, { feedId }) {
    //delete feed and relational reactions
    const [deletedFeed] = await Promise.all([
      this.feedRepository.findOneAndDelete({ _id: feedId }),
      this.reactionRepository.findOneAndDelete({ feedId }),
    ]);

    if (!deletedFeed) {
      throw new NotFoundException('Resource not found');
    }

    //delete image in s3
    const imageName = deletedFeed.imageUrl.split('/').pop();

    this.awss3Client.emit('delete_image', {
      imageName: imageName,
    });

    //update redis
    let redisFeeds: FeedDocument[] = await this.cacheManager.get(
      `feed:${userId}`,
    );

    if (!redisFeeds) {
      redisFeeds = await this.feedRepository.find({ userId }, [
        { path: 'userId', select: '_id profileImageUrl fullname' },
        {
          path: 'reactions',
          populate: [
            { path: 'userId', select: '_id profileImageUrl fullname' },
          ],
        },
      ]);
    } else {
      redisFeeds = redisFeeds.filter(
        (f) => f._id.toString() !== feedId.toString(),
      );
    }

    this.cacheManager.set(`feed:${userId}`, redisFeeds, {
      ttl: createTTL(60 * 60 * 24 * 30, 60 * 6 * 24),
    });

    //emit feed for friends
    const user = await lastValueFrom(
      this.userClient.send('get_user', { userId, email, role }).pipe(
        map((response) => {
          if (response.error) {
            throw new NotFoundException('Resource not found');
          }
          return response.metadata;
        }),
      ),
    );

    const emitPayload = {
      userId: user.friendList.map((f) => f._id.toString()),
      metadata: { feedId: deletedFeed._id },
    };

    this.notificationClient.emit('emit_message', {
      name: 'delete_feed',
      payload: emitPayload,
    });

    //update feed statistic
    this.statisticClient.emit('deleted_feed', {});

    //delete feed reports
    this.reportingClient.emit('delete_feed_reports', { feedId });
  }

  async getEveryoneFeeds(
    { userId, email, role }: TokenPayloadInterface,
    { skip }: GetEveryoneFeedsDto,
  ) {
    console.log(skip);
    //get friend list
    let user: UserDocument = await this.cacheManager.get(`user:${email}`);

    if (!user) {
      user = await lastValueFrom(
        this.userClient.send('get_user', { userId, email, role }).pipe(
          map((response) => {
            if (response.error) {
              throw new NotFoundException('Resource not found');
            }
            return response.metadata;
          }),
        ),
      );
    }

    const friendList: string[] = user.friendList.map((f) => f._id.toString());

    //get friend feeds
    const feeds = await this.feedRepository.searchFeeds(
      {
        $or: [
          {
            userId: { $in: friendList },
            visibility: { $elemMatch: { $eq: userId } },
          },
          { userId: userId },
        ],
      },
      skip,
      [
        { path: 'userId', select: '_id profileImageUrl fullname' },
        {
          path: 'reactions',
          populate: [
            { path: 'userId', select: '_id profileImageUrl fullname' },
          ],
        },
      ],
    );

    const filteredFeeds = feeds.map((f) => {
      if (f.userId._id.toString() !== userId.toString()) {
        const feed = {
          _id: f._id,
          description: f.description,
          imageUrl: f.imageUrl,
          userId: f.userId,
          createdAt: f.createdAt,
          reactions: [],
        };

        f.reactions.forEach((r) => {
          if (r.userId._id.toString() === userId.toString()) {
            feed.reactions.push(r);
          }
        });

        return feed;
      }
      return f;
    });

    return filteredFeeds;
  }

  async getCertainUserFeeds(
    { userId, email, role },
    { skip, userId: friendId },
  ) {
    //get friend list
    let user: UserDocument = await this.cacheManager.get(`user:${email}`);

    if (!user) {
      user = await lastValueFrom(
        this.userClient.send('get_user', { userId, email, role }).pipe(
          map((response) => {
            if (response.error) {
              throw new NotFoundException('Resource not found');
            }
            return response.metadata;
          }),
        ),
      );
    }

    const friendList: string[] = user.friendList.map((f) => f._id.toString());

    //check if they are friends or not
    const isFriends = friendList.some((f) => f === friendId);
    const isYou = userId === friendId;

    if (!isFriends && !isYou) {
      throw new BadRequestException('Invalid resource');
    }

    //get feeds
    let feeds: FeedDocument[];

    if (isFriends) {
      feeds = await this.feedRepository.searchFeeds(
        {
          userId: friendId,
          visibility: { $elemMatch: { $eq: userId } },
        },
        skip,
        [
          { path: 'userId', select: '_id profileImageUrl fullname' },
          {
            path: 'reactions',
            populate: [
              { path: 'userId', select: '_id profileImageUrl fullname' },
            ],
          },
        ],
        '_id description imageUrl userId reactions createdAt',
      );

      feeds = feeds.map((feed) => {
        feed.reactions = feed.reactions
          .map((r) => {
            if (r.userId._id.toString() === userId.toString()) {
              return r;
            } else {
              return null;
            }
          })
          .filter((r: ReactionDocument) => r !== null);

        return feed;
      });
    } else if (isYou) {
      feeds = await this.feedRepository.searchFeeds(
        {
          userId: userId,
        },
        skip,
        [
          { path: 'userId', select: '_id profileImageUrl fullname' },
          {
            path: 'reactions',
            populate: [
              { path: 'userId', select: '_id profileImageUrl fullname' },
            ],
          },
        ],
      );
    }

    //return feeds
    return feeds;
  }

  async reactFeed({ userId }: TokenPayloadInterface, { feedId, icon }) {
    //get feed
    const feed: FeedDocument = await this.feedRepository.findOne(
      { _id: feedId },
      [
        { path: 'userId', select: '_id profileImageUrl fullname' },
        {
          path: 'reactions',
          populate: [
            { path: 'userId', select: '_id profileImageUrl fullname' },
          ],
        },
      ],
    );

    if (!feed) {
      throw new NotFoundException('Not found resource');
    }

    //check reaction is already existing or not
    let positionReaction: number;

    const isExistingReaction = feed.reactions.some((r, index) => {
      if (r.userId._id.toString() === userId.toString()) {
        positionReaction = index;
        return true;
      } else {
        return false;
      }
    });

    let reaction: ReactionDocument;

    //if existing, update more icon
    if (isExistingReaction) {
      const currentReactions: ReactionDocument[] =
        feed.reactions as ReactionDocument[];

      const isExistingIcon: boolean = currentReactions[
        positionReaction
      ].icon.some((i) => i === icon);

      if (isExistingIcon) {
        throw new BadRequestException('Existing resource');
      } else {
        reaction = await this.reactionRepository.findOneAndUpdate(
          {
            _id: feed.reactions[positionReaction]._id,
          },
          {
            $push: { icon: icon },
          },
          [{ path: 'userId', select: '_id profileImageUrl fullname' }],
        );
      }
    }
    //if not, create new reaction
    else {
      reaction = await this.reactionRepository.create(
        {
          userId,
          icon: [icon],
          feedId,
        },
        [{ path: 'userId', select: '_id profileImageUrl fullname' }],
      );

      await this.feedRepository.findOneAndUpdate(
        { _id: feedId },
        { $push: { reactions: reaction._id } },
      );
    }

    //update feed
    if (isExistingReaction) {
      feed.reactions = feed.reactions.map((r) => {
        if (r._id === reaction._id) {
          r = reaction;
        }
        return r;
      });
    } else {
      feed.reactions = feed.reactions as ReactionDocument[];
      feed.reactions.push(reaction);
    }

    //update redis
    let cacheFeeds: FeedDocument[] = await this.cacheManager.get(
      `feed:${feed.userId._id}`,
    );

    if (!cacheFeeds) {
      cacheFeeds = await this.feedRepository.find({ userId: feed.userId._id }, [
        { path: 'userId', select: '_id profileImageUrl fullname' },
        {
          path: 'reactions',
          populate: [
            { path: 'userId', select: '_id profileImageUrl fullname' },
          ],
        },
      ]);
    } else {
      cacheFeeds = cacheFeeds.map((f) => {
        if (f._id.toString() === feed._id.toString()) {
          f = feed;
        }
        return f;
      });
    }

    this.cacheManager.set(`feed:${feed.userId._id}`, cacheFeeds, {
      ttl: createTTL(60 * 60 * 24 * 30, 60 * 6 * 24),
    });

    //filter feed
    const filterFeed = {
      _id: feed._id,
      description: feed.description,
      imageUrl: feed.imageUrl,
      userId: feed.userId,
      createdAt: feed.createdAt,
      reactions: [reaction],
    };

    //emit reaction for owner
    const emitPayload = {
      userId: feed.userId._id.toString(),
      metadata: feed,
    };

    console.log(emitPayload);

    this.notificationClient.emit('emit_message', {
      name: 'react_feed',
      payload: emitPayload,
    });

    //return feed
    return filterFeed;
  }

  async deleteRelationalFeedsAndReactions({
    userId,
    friendList,
  }: DeleteReactionsAndFeedsDto) {
    //delete feeds in db
    const deletedFeeds: FeedDocument[] = await this.feedRepository.deleteMany({
      userId: userId.toString(),
    });

    this.statisticClient.emit('deleted_feed', { number: deletedFeeds.length });

    //delete friend's reactions in db
    for (const feed of deletedFeeds) {
      //delete image in s3
      const imageName = feed.imageUrl.split('/').pop();

      this.awss3Client.emit('delete_image', {
        imageName: imageName,
      });

      //delete reactions of feed
      await this.reactionRepository.deleteMany({
        _id: { $in: feed.reactions },
      });

      //delete feed reports
      this.reportingClient.emit('delete_feed_reports', { feedId: feed._id });
    }

    //delete user's reactions in db
    const deletedReactions: ReactionDocument[] =
      await this.reactionRepository.deleteMany({
        userId: userId,
      });

    const deletedReactionIds: string[] = deletedReactions.map((r) =>
      r._id.toString(),
    );

    //update friend's feeds in db
    await this.feedRepository.updateMany(
      {
        reactions: { $in: deletedReactionIds },
      },
      {
        $pull: { reactions: { $in: deletedReactionIds } },
      },
    );

    //delete friend's feeds in redis
    for (const friend of friendList) {
      this.cacheManager.del(`feed:${friend.toString()}`);
    }

    //delete feeds in redis
    this.cacheManager.del(`feed:${userId.toString()}`);
  }

  async getFeedListByAdmin(userId: Types.ObjectId) {
    const feedList: FeedDocument[] = await this.feedRepository.find({
      userId,
    });

    const feedIdList: Types.ObjectId[] = feedList.map((feed) => feed._id);

    return feedIdList;
  }

  async getFeedByAdmin(feedId: Types.ObjectId) {
    const feed = await this.feedRepository.findOne({ _id: feedId }, [
      { path: 'userId', select: '_id profileImageUrl fullname' },
      {
        path: 'reactions',
        populate: [{ path: 'userId', select: '_id profileImageUrl fullname' }],
      },
    ]);

    if (!feed) {
      throw new NotFoundException('Feed not found');
    }

    const comments = await lastValueFrom(
      this.messageClient.send('get_comments_of_feed', { feedId }).pipe(
        map((response) => {
          if (response.error) {
            throw new NotFoundException('Resource not found');
          }
          return response;
        }),
      ),
    );

    return {
      ...feed,
      comments,
    };
  }

  async getSimpleFeed(feedId: Types.ObjectId) {
    const feed = await this.feedRepository.findOne({ _id: feedId });
    if (!feed) {
      throw new NotFoundException('Feed not found');
    }

    return feed;
  }

  async getCertainFeed(feedId: Types.ObjectId) {
    const feed = await this.feedRepository.findOne({ _id: feedId }, [
      { path: 'userId', select: '_id role email' },
    ]);
    if (!feed) {
      throw new NotFoundException('Feed not found');
    }

    return feed;
  }

  async deleteFeedForFeedViolating(
    { userId, email, role }: TokenPayloadInterface,
    { feedId },
  ) {
    //delete feed and relational reactions
    const [deletedFeed] = await Promise.all([
      this.feedRepository.findOneAndDelete({ _id: feedId }),
      this.reactionRepository.findOneAndDelete({ feedId }),
    ]);

    if (!deletedFeed) {
      throw new NotFoundException('Resource not found');
    }

    //delete image in s3
    const imageName = deletedFeed.imageUrl.split('/').pop();

    this.awss3Client.emit('delete_image', {
      imageName: imageName,
    });

    //update redis
    let redisFeeds: FeedDocument[] = await this.cacheManager.get(
      `feed:${userId}`,
    );

    if (!redisFeeds) {
      redisFeeds = await this.feedRepository.find({ userId }, [
        { path: 'userId', select: '_id profileImageUrl fullname' },
        {
          path: 'reactions',
          populate: [
            { path: 'userId', select: '_id profileImageUrl fullname' },
          ],
        },
      ]);
    } else {
      redisFeeds = redisFeeds.filter(
        (f) => f._id.toString() !== feedId.toString(),
      );
    }

    this.cacheManager.set(`feed:${userId}`, redisFeeds, {
      ttl: createTTL(60 * 60 * 24 * 30, 60 * 6 * 24),
    });

    //emit feed for friends
    const user = await lastValueFrom(
      this.userClient.send('get_user', { userId, email, role }).pipe(
        map((response) => {
          if (response.error) {
            throw new NotFoundException('Resource not found');
          }
          return response.metadata;
        }),
      ),
    );

    const emitPayload = {
      userId: user.friendList.map((f) => f._id.toString()),
      metadata: { feedId: deletedFeed._id },
    };

    this.notificationClient.emit('emit_message', {
      name: 'delete_feed',
      payload: emitPayload,
    });

    //update feed statistic
    this.statisticClient.emit('deleted_feed', {});
  }
}
