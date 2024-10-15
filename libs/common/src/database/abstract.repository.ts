import { Logger, NotFoundException } from '@nestjs/common';
import { AbstractDocument } from './abstract.schema';
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger;

  constructor(protected readonly model: Model<TDocument>) {}

  async create(
    document: Partial<Omit<TDocument, '_id'>>,
    populate?: Array<{
      path: string;
      select?: string;
      populate?: any;
    }>,
  ): Promise<TDocument> {
    const createDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });

    const savedDocument = await createDocument.save();

    // Nếu không cần populate, trả về tài liệu đã lưu
    if (!populate) {
      return savedDocument.toJSON() as unknown as TDocument;
    }

    // Thực hiện truy vấn lại với populate
    let query = this.model.findById(savedDocument._id);
    query = query.populate(populate);

    const populatedDocument = await query.lean<TDocument>(true);

    return populatedDocument;
  }

  async findOne(
    filterQuery: FilterQuery<TDocument>,
    populate?: Array<{
      path: string;
      select?: string;
      populate?: any; // Thêm thuộc tính này để hỗ trợ populate lồng nhau
    }>,
  ): Promise<TDocument> {
    let query = this.model.findOne(filterQuery);

    if (populate) {
      query = query.populate(populate);
    }

    const document = await query.lean<TDocument>(true);

    return document;
  }

  async find(
    filterQuery: FilterQuery<TDocument>,
    populate?: Array<{
      path: string;
      select?: string;
      populate?: any; // Thêm thuộc tính này để hỗ trợ populate lồng nhau
    }>,
  ): Promise<TDocument[]> {
    let query = this.model.find(filterQuery);

    if (populate) {
      query = query.populate(populate);
    }

    const documents = await query.lean<TDocument[]>(true);

    return documents;
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    updateQuery: UpdateQuery<TDocument>,
    populate?: Array<{
      path: string;
      select?: string;
      populate?: any; // Thêm thuộc tính này để hỗ trợ populate lồng nhau
    }>,
  ): Promise<TDocument> {
    let query = this.model.findOneAndUpdate(filterQuery, updateQuery, {
      new: true,
    });

    if (!query) {
      this.logger.warn('Document was not found with filterQuery', filterQuery);
      throw new NotFoundException('Document was not found');
    }

    if (populate) {
      query = query.populate(populate);
    }

    const document = await query.lean<TDocument>(true);

    return document;
  }

  async updateOne(
    filterQuery: FilterQuery<TDocument>,
    updateQuery: UpdateQuery<TDocument>,
  ): Promise<void> {
    const result = await this.model.updateOne(filterQuery, updateQuery);

    if (result.matchedCount === 0) {
      this.logger.warn('No document found with filterQuery', filterQuery);
      throw new NotFoundException('Document was not found');
    }
  }

  async findOneAndDelete(
    filterQuery: FilterQuery<TDocument>,
    populate?: Array<{
      path: string;
      select?: string;
      populate?: any; // Thêm thuộc tính này để hỗ trợ populate lồng nhau
    }>,
  ): Promise<TDocument> {
    let query = this.model.findOneAndDelete(filterQuery);

    if (!query) {
      this.logger.warn('Document was not found with filterQuery', filterQuery);
      throw new NotFoundException('Document was not found');
    }

    if (populate) {
      query = query.populate(populate);
    }

    const document = await query.lean<TDocument>(true);

    return document;
  }
}
