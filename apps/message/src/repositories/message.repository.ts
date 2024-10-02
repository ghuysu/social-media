import {
  AbstractRepository,
  MESSAGE_DOCUMENT,
  MessageDocument,
} from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

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
    select?: string,
  ): Promise<MessageDocument[]> {
    const feeds = await this.model
      .find(filterQuery)
      .select(select)
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
    select?: string,
  ): Promise<MessageDocument[]> {
    const feeds = await this.model
      .find(filterQuery)
      .select(select)
      .skip(skip)
      .limit(50)
      .sort({ createdAt: -1 })
      .populate(populate)
      .lean<MessageDocument[]>();

    return feeds;
  }
}
