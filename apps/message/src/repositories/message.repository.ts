import {
  AbstractRepository,
  MESSAGE_DOCUMENT,
  MessageDocument,
} from '@app/common';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
    const messages = await this.model
      .find(filterQuery)
      .limit(500)
      .sort({ createdAt: -1 })
      .populate(populate)
      .lean<MessageDocument[]>();

    return messages.reverse();
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
    populate?: Array<{
      path: string;
      select?: string;
      populate?: any;
    }>,
  ): Promise<MessageDocument[]> {
    let query = this.model.updateMany(filterQuery, updateQuery, {
      new: true,
    });

    if (!query) {
      this.logger.warn('Document was not found with filterQuery', filterQuery);
      throw new NotFoundException('Document was not found');
    }

    if (populate) {
      query = query.populate(populate);
    }

    const document = await query.lean<MessageDocument[]>(true);

    return document;
  }

  async deleteMany(
    filterQuery: FilterQuery<MessageDocument>,
    populate?: Array<{
      path: string;
      select?: string;
      populate?: any;
    }>,
  ): Promise<MessageDocument[]> {
    let query = this.model.deleteMany(filterQuery);

    if (!query) {
      this.logger.warn('Document was not found with filterQuery', filterQuery);
      throw new NotFoundException('Document was not found');
    }

    if (populate) {
      query = query.populate(populate);
    }

    const document = await query.lean<MessageDocument[]>(true);

    return document;
  }
}
