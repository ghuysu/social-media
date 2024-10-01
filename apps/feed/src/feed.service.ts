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
  NOTIFICATION_SERVICE,
  ReactionDocument,
  TokenPayloadInterface,
  USER_SERVICE,
  UserDocument,
} from '@app/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { lastValueFrom, map } from 'rxjs';

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
    private readonly configService: ConfigService,
  ) {}

  private createImageNameFromOriginalname(originalname: string): string {
    const timestamp = new Date().getTime();
    return `${timestamp}_${originalname.split('.').shift()}`;
  }

  async createFeed(
    { userId }: TokenPayloadInterface,
    { description, visibility, originalname, image },
  ) {
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

    this.cacheManager.set(`feed:${userId}`, redisFeeds, {
      ttl: createTTL(60 * 60 * 24 * 30, 60 * 6 * 24),
    });

    //return feed
    return feed;
  }

  async updateFeed(
    { userId }: TokenPayloadInterface,
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

    //return feed
    return updatedFeed;
  }

  async deleteFeed({ userId }: TokenPayloadInterface, { feedId }) {
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
  }

  async getEveryoneFeeds(
    { userId, email, role }: TokenPayloadInterface,
    { skip }: GetEveryoneFeedsDto,
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

    //return feed
    return filterFeed;
  }
}
