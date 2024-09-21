import { Logger, NotFoundException } from '@nestjs/common';
import { AbstractDocument } from './abstract.schema';
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger;

  constructor(protected readonly model: Model<TDocument>) {}

  async create(document: Partial<Omit<TDocument, '_id'>>): Promise<TDocument> {
    const createDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });

    return (await createDocument.save()).toJSON() as unknown as TDocument;
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

    if (populate) {
      query = query.populate(populate);
    }

    const document = await query.lean<TDocument>(true);

    if (!document) {
      this.logger.warn('Document was not found with filterQuery', filterQuery);
      throw new NotFoundException('Document was not found');
    }
    return document;
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

    if (populate) {
      query = query.populate(populate);
    }

    const document = await query.lean<TDocument>(true);

    return document;
  }
}
