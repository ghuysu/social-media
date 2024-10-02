import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  CreateMessageDto,
  createTTL,
  MessageDocument,
  NOTIFICATION_SERVICE,
  TokenPayloadInterface,
  USER_SERVICE,
  UserDocument,
} from '@app/common';
import { ClientProxy } from '@nestjs/microservices';
import { MessageRepository } from './repositories/message.repository';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class MessageService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy,
    @Inject(USER_SERVICE)
    private readonly userClient: ClientProxy,
    private readonly messageRepository: MessageRepository,
  ) {}

  async createMessage(
    { userId, email, role }: TokenPayloadInterface,
    { receiverId, content, feedId }: CreateMessageDto,
  ) {
    //check if receiver is friend or not
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

    const isFriends = user.friendList.some(
      (f) => f._id.toString() === receiverId.toString(),
    );

    if (!isFriends) {
      throw new BadRequestException('No relational request');
    }

    //create new message
    const payload: Partial<MessageDocument> = {
      senderId: userId,
      receiverId: receiverId,
      content: content,
    };

    if (feedId) {
      payload.feedId = feedId;
    }

    const message = await this.messageRepository.create(payload, [
      { path: 'senderId', select: '_id fullname profileImageUrl' },
      { path: 'receiverId', select: '_id fullname profileImageUrl' },
      { path: 'feedId', select: '_id description imageUrl' },
    ]);

    //update redis
    let userIdFirst: boolean = true;

    let conversation: MessageDocument[] = await this.cacheManager.get(
      `conversation:${userId.toString()}:${receiverId.toString()}`,
    );

    if (!conversation) {
      userIdFirst = false;

      conversation = await this.cacheManager.get(
        `conversation:${receiverId.toString()}:${userId.toString()}`,
      );
    }

    if (!conversation) {
      conversation = await this.messageRepository.getAllConversationMessages(
        {
          $or: [
            {
              senderId: userId,
              receiverId: receiverId,
            },
            {
              senderId: receiverId,
              receiverId: userId,
            },
          ],
        },
        [
          { path: 'senderId', select: '_id fullname profileImageUrl' },
          { path: 'receiverId', select: '_id fullname profileImageUrl' },
          { path: 'feedId', select: '_id description imageUrl' },
        ],
      );

      this.cacheManager.set(
        `conversation:${userId.toString()}:${receiverId.toString()}`,
        conversation,
        {
          ttl: createTTL(60 * 60 * 24 * 360, 60 * 60 * 24 * 30),
        },
      );
    } else {
      conversation.push(message);

      if (userIdFirst) {
        this.cacheManager.set(
          `conversation:${userId.toString()}:${receiverId.toString()}`,
          conversation,
          {
            ttl: createTTL(60 * 60 * 24 * 360, 60 * 60 * 24 * 30),
          },
        );
      } else {
        this.cacheManager.set(
          `conversation:${receiverId.toString()}:${userId.toString()}`,
          conversation,
          {
            ttl: createTTL(60 * 60 * 24 * 360, 60 * 60 * 24 * 30),
          },
        );
      }
    }

    //emit message for receiver
    const emitPayload = {
      userId: receiverId,
      payload: message,
    };

    this.notificationClient.emit('emit_message', {
      name: 'send_message',
      payload: emitPayload,
    });

    //return message
    return message;
  }
}
