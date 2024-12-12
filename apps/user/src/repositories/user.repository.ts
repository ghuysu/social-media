import { AbstractRepository, USER_DOCUMENT } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { UserDocument } from '@app/common';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserRepository extends AbstractRepository<UserDocument> {
  protected readonly logger = new Logger(UserRepository.name);

  constructor(
    @InjectModel(USER_DOCUMENT)
    private readonly userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }

  async updateMany(
    filterQuery: FilterQuery<UserDocument>,
    updateQuery: UpdateQuery<UserDocument>,
    populate?: Array<{
      path: string;
      select?: string;
      populate?: any;
    }>,
  ): Promise<UserDocument[]> {
    // Thực hiện cập nhật nhiều bản ghi
    const result = await this.model.updateMany(filterQuery, updateQuery);

    // Nếu không có tài liệu nào được cập nhật
    if (result.modifiedCount === 0) {
      return [];
    }

    // Truy vấn lại các bản ghi đã cập nhật
    let query = this.model.find(filterQuery);

    // Nếu cần populate, thực hiện populate
    if (populate) {
      query = query.populate(populate);
    }

    // Lấy danh sách các bản ghi cập nhật
    const updatedDocuments = await query.lean<UserDocument[]>(true);

    return updatedDocuments;
  }

  async getBaseOnPage(
    filterQuery: FilterQuery<UserDocument>,
    page: number,
    populate?: Array<{
      path: string;
      select?: string;
      populate?: any;
    }>,
  ) {
    return await this.userModel
      .find(filterQuery)
      .skip(30 * (page - 1))
      .limit(30)
      .populate(populate)
      .lean<UserDocument[]>();
  }
}
