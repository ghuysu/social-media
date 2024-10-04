import {
  AbstractRepository,
  MESSAGE_DOCUMENT,
  MessageDocument,
} from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';

@Injectable()
export class MessageRepository extends AbstractRepository<MessageDocument> {
  protected readonly logger = new Logger(MessageRepository.name);

  constructor(
    @InjectModel(MESSAGE_DOCUMENT)
    private readonly messageModel: Model<MessageDocument>,
  ) {
    super(messageModel);
  }

  async getAllConversationMessages(
    filterQuery: FilterQuery<MessageDocument>,
    populate?: Array<{
      path: string;
      select?: string;
      populate?: any;
    }>,
  ): Promise<MessageDocument[]> {
    const feeds = await this.model
      .find(filterQuery)
      .limit(500)
      .sort({ createdAt: -1 })
      .populate(populate)
      .lean<MessageDocument[]>();

    return feeds;
  }

  async getMessages(
    filterQuery: FilterQuery<MessageDocument>,
    skip: number,
    populate?: Array<{
      path: string;
      select?: string;
      populate?: any;
    }>,
  ): Promise<MessageDocument[]> {
    const messages = await this.model
      .find(filterQuery)
      .skip(skip)
      .limit(50)
      .sort({ createdAt: -1 })
      .populate(populate)
      .lean<MessageDocument[]>();

    return messages;
  }

  async updateMany(
    filterQuery: FilterQuery<MessageDocument>,
    updateQuery: UpdateQuery<MessageDocument>,
  ): Promise<any> {
    await this.model.updateMany(filterQuery, updateQuery, {
      upsert: false,
    });
  }
}
