import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FeedRepository } from './repositories/feed.repository';
import { ReactionRepository } from './repositories/reaction.repository';
import {
  AWS_S3_SERVICE,
  createTTL,
  FeedDocument,
  NOTIFICATION_SERVICE,
  TokenPayloadInterface,
} from '@app/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';

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
    const updatedFeed = await this.feedRepository.findOneAndUpdate(
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

    if (!updatedFeed) {
      throw new NotFoundException('Resource not found');
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
}
