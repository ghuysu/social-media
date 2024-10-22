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
  ReadMessageDto,
  TokenPayloadInterface,
  USER_SERVICE,
  UserDocument,
} from '@app/common';
import { ClientProxy } from '@nestjs/microservices';
import { MessageRepository } from './repositories/message.repository';
import { lastValueFrom, map } from 'rxjs';
import { DeleteMessagesForDeleteAccountDto } from './dto/delete-messages-for-delete-account.dto';
import { GetCommentsOfFeedDto } from './dto/get-comments-of-feed.dto';

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
      //redis just save 500 newest messages
      if (conversation.length > 500) {
        conversation = conversation.slice(0, 500);
      }

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
      metadata: message,
    };

    this.notificationClient.emit('emit_message', {
      name: 'send_message',
      payload: emitPayload,
    });

    //return message
    return message;
  }

  async readMessages(
    { userId }: TokenPayloadInterface,
    { messageIds }: ReadMessageDto,
  ) {
    //update db
    await this.messageRepository.updateMany(
      {
        _id: { $in: messageIds },
        receiverId: userId.toString(),
      },
      { $set: { isRead: true } },
    );

    const updatedMessage: MessageDocument =
      await this.messageRepository.findOne({ _id: messageIds[0] });
    console.log(updatedMessage);

    //update redis
    let userIdFirst: boolean = true;
    const senderId: string = updatedMessage.senderId.toString();

    let conversation: MessageDocument[] = await this.cacheManager.get(
      `conversation:${userId.toString()}:${senderId}`,
    );

    if (!conversation) {
      userIdFirst = false;

      conversation = await this.cacheManager.get(
        `conversation:${senderId}:${userId.toString()}`,
      );
    }

    if (!conversation) {
      conversation = await this.messageRepository.getAllConversationMessages(
        {
          $or: [
            {
              senderId: userId,
              receiverId: senderId,
            },
            {
              senderId: senderId,
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
        `conversation:${userId.toString()}:${senderId.toString()}`,
        conversation,
        {
          ttl: createTTL(60 * 60 * 24 * 360, 60 * 60 * 24 * 30),
        },
      );
    } else {
      conversation = conversation.map((message) => {
        if (messageIds.includes(message._id)) {
          message.isRead = true;
        }
        return message;
      });

      if (userIdFirst) {
        this.cacheManager.set(
          `conversation:${userId.toString()}:${senderId.toString()}`,
          conversation,
          {
            ttl: createTTL(60 * 60 * 24 * 360, 60 * 60 * 24 * 30),
          },
        );
      } else {
        this.cacheManager.set(
          `conversation:${senderId.toString()}:${userId.toString()}`,
          conversation,
          {
            ttl: createTTL(60 * 60 * 24 * 360, 60 * 60 * 24 * 30),
          },
        );
      }
    }

    //emit read message
    const emitPayload = {
      userId: senderId,
      metadata: { messageIds },
    };

    this.notificationClient.emit('emit_message', {
      name: 'read_messages',
      payload: emitPayload,
    });
  }

  async getAllConversations({ userId, email, role }: TokenPayloadInterface) {
    //get friendList
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

    const friendList: Partial<UserDocument>[] =
      user.friendList as Partial<UserDocument>[];

    //get friend messages
    //loop through friend list and get each friends messages
    const friendConversations = [];

    for (const friend of friendList) {
      //get conversation
      let userIdFirst: boolean = true;

      let conversation: MessageDocument[] = await this.cacheManager.get(
        `conversation:${userId.toString()}:${friend._id.toString()}`,
      );

      if (!conversation) {
        userIdFirst = false;

        conversation = await this.cacheManager.get(
          `conversation:${friend._id.toString()}:${userId.toString()}`,
        );
      }

      if (!conversation) {
        conversation = await this.messageRepository.getAllConversationMessages(
          {
            $or: [
              {
                senderId: userId.toString(),
                receiverId: friend._id.toString(),
              },
              {
                senderId: friend._id.toString(),
                receiverId: userId.toString(),
              },
            ],
          },
          [
            { path: 'senderId', select: '_id fullname profileImageUrl' },
            { path: 'receiverId', select: '_id fullname profileImageUrl' },
            { path: 'feedId', select: '_id description imageUrl' },
          ],
        );

        //update redis if conversation is not caching
        if (userIdFirst) {
          this.cacheManager.set(
            `conversation:${userId.toString()}:${friend._id.toString()}`,
            conversation,
            {
              ttl: createTTL(60 * 60 * 24 * 360, 60 * 60 * 24 * 30),
            },
          );
        } else {
          this.cacheManager.set(
            `conversation:${friend._id.toString()}:${userId.toString()}`,
            conversation,
            {
              ttl: createTTL(60 * 60 * 24 * 360, 60 * 60 * 24 * 30),
            },
          );
        }
      }

      //get 50 messages or less and reverse it
      if (conversation.length < 50) {
        conversation = conversation.reverse();
      } else if (conversation.length >= 50) {
        conversation = conversation.slice(50).reverse();
      }

      const friendConversation = {
        friendId: friend._id.toString(),
        conversation: conversation,
      };

      friendConversations.push(friendConversation);
    }

    //return all messages
    return friendConversations;
  }

  async getCertainFriendConversation(
    { userId, email, role }: TokenPayloadInterface,
    { skip, friendId },
  ) {
    //get friendList
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

    const friendList: Partial<UserDocument>[] =
      user.friendList as Partial<UserDocument>[];

    //check they are friends or not
    const isFriends: boolean = friendList.some(
      (friend) => friend._id.toString() === friendId.toString(),
    );

    if (!isFriends) {
      throw new BadRequestException('No relational request');
    }

    //get conversation
    //if skip > 450, get messages from db
    //if skip <= 450 get message from db
    let conversation: MessageDocument[];

    if (skip > 450) {
      conversation = await this.messageRepository.getMessages(
        {
          $or: [
            {
              senderId: userId.toString(),
              receiverId: friendId.toString(),
            },
            {
              senderId: friendId.toString(),
              receiverId: userId.toString(),
            },
          ],
        },
        skip,
        [
          { path: 'senderId', select: '_id fullname profileImageUrl' },
          { path: 'receiverId', select: '_id fullname profileImageUrl' },
          { path: 'feedId', select: '_id description imageUrl' },
        ],
      );

      conversation.reverse();
    } else {
      let userIdFirst: boolean = true;

      conversation = await this.cacheManager.get(
        `conversation:${userId.toString()}:${friendId.toString()}`,
      );

      if (!conversation) {
        userIdFirst = false;

        conversation = await this.cacheManager.get(
          `conversation:${friendId.toString()}:${userId.toString()}`,
        );
      }

      if (!conversation) {
        conversation = await this.messageRepository.getAllConversationMessages(
          {
            $or: [
              {
                senderId: userId.toString(),
                receiverId: friendId.toString(),
              },
              {
                senderId: friendId.toString(),
                receiverId: userId.toString(),
              },
            ],
          },
          [
            { path: 'senderId', select: '_id fullname profileImageUrl' },
            { path: 'receiverId', select: '_id fullname profileImageUrl' },
            { path: 'feedId', select: '_id description imageUrl' },
          ],
        );

        //update redis if conversation is not caching
        if (userIdFirst) {
          this.cacheManager.set(
            `conversation:${userId.toString()}:${friendId.toString()}`,
            conversation,
            {
              ttl: createTTL(60 * 60 * 24 * 360, 60 * 60 * 24 * 30),
            },
          );
        } else {
          this.cacheManager.set(
            `conversation:${friendId.toString()}:${userId.toString()}`,
            conversation,
            {
              ttl: createTTL(60 * 60 * 24 * 360, 60 * 60 * 24 * 30),
            },
          );
        }
      }

      conversation = conversation.slice(skip, skip + 50).reverse();
    }

    return conversation;
  }

  async deleteAllMessagesForDeleteAccount({
    userId,
    friendList,
  }: DeleteMessagesForDeleteAccountDto) {
    //delete user's messages
    await this.messageRepository.deleteMany({
      $or: [
        {
          receiverId: userId.toString(),
        },
        {
          senderId: userId.toString(),
        },
      ],
    });

    //delete friend's conversations in redis
    for (const friend of friendList) {
      this.cacheManager.del(
        `conversation:${userId.toString()}:${friend.toString()}`,
      );
      this.cacheManager.del(
        `conversation:${friend.toString()}:${userId.toString()}`,
      );
    }
  }

  async getCommentsOfFeed({ feedId }: GetCommentsOfFeedDto) {
    const comments = await this.messageRepository.find({ feedId }, [
      { path: 'senderId', select: '_id email fullname profileImageUrl' },
    ]);

    return comments.map((comment) => {
      return {
        _id: comment._id,
        sender: comment.senderId,
        content: comment.content,
        createdAt: comment.createdAt,
      };
    });
  }

  async getCommentsOfUser({ userId }) {
    let comments = await this.messageRepository.find(
      {
        senderId: userId,
        feedId: { $exists: true, $ne: null },
      },
      [
        {
          path: 'feedId',
          select: '_id description imageUrl createdAt',
        },
        {
          path: 'receiverId',
          select: '_id email fullname profileImageUrl',
        },
      ],
    );

    comments = comments.map((comment) => {
      delete comment.isRead;
      return comment;
    });

    return comments;
  }
}
