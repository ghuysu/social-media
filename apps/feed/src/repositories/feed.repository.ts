import { AbstractRepository, FEED_DOCUMENT, FeedDocument } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';

@Injectable()
export class FeedRepository extends AbstractRepository<FeedDocument> {
  protected readonly logger = new Logger(FeedRepository.name);

  constructor(
    @InjectModel(FEED_DOCUMENT)
    private readonly feedModel: Model<FeedDocument>,
  ) {
    super(feedModel);
  }

  async searchFeeds(
    filterQuery: FilterQuery<FeedDocument>,
    skip: number,
    populate?: Array<{
      path: string;
      select?: string;
      populate?: any;
    }>,
    select?: string,
  ): Promise<FeedDocument[]> {
    const feeds = await this.model
      .find(filterQuery)
      .select(select)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(30)
      .populate(populate)
      .lean<FeedDocument[]>();

    return feeds;
  }

  async deleteMany(
    filterQuery: FilterQuery<FeedDocument>,
    populate?: Array<{
      path: string;
      select?: string;
      populate?: any;
    }>,
  ): Promise<FeedDocument[]> {
    // Tìm kiếm các tài liệu trước khi xóa
    let query = this.model.find(filterQuery);

    // Nếu có populate
    if (populate) {
      query = query.populate(populate);
    }

    // Lấy danh sách các tài liệu sẽ bị xóa
    const documentsToDelete = await query.lean<FeedDocument[]>(true);

    if (documentsToDelete.length === 0) {
      return [];
    }

    // Xóa các tài liệu
    await this.model.deleteMany(filterQuery);

    // Trả về danh sách tài liệu đã xóa
    return documentsToDelete;
  }

  async updateMany(
    filterQuery: FilterQuery<FeedDocument>,
    updateQuery: UpdateQuery<FeedDocument>,
    populate?: Array<{
      path: string;
      select?: string;
      populate?: any;
    }>,
  ): Promise<FeedDocument[]> {
    // Cập nhật các tài liệu
    const result = await this.model.updateMany(filterQuery, updateQuery);

    // Kiểm tra xem có tài liệu nào được cập nhật không
    if (result.modifiedCount === 0) {
      return [];
    }

    // Truy vấn lại các tài liệu đã cập nhật
    let query = this.model.find(filterQuery);

    // Nếu có populate
    if (populate) {
      query = query.populate(populate);
    }

    // Lấy danh sách tài liệu đã cập nhật
    const updatedDocuments = await query.lean<FeedDocument[]>(true);

    return updatedDocuments;
  }

  async getBaseOnPage(
    filterQuery: FilterQuery<FeedDocument>,
    page: number,
    populate?: Array<{
      path: string;
      select?: string;
      populate?: any;
    }>,
  ): Promise<FeedDocument[]> {
    const result = await this.model
      .find(filterQuery)
      .skip((page - 1) * 30)
      .limit(30)
      .populate(populate)
      .lean<FeedDocument[]>();

    return result;
  }
}
