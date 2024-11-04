import {
  AbstractRepository,
  REACTION_DOCUMENT,
  ReactionDocument,
} from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class ReactionRepository extends AbstractRepository<ReactionDocument> {
  protected readonly logger = new Logger(ReactionRepository.name);

  constructor(
    @InjectModel(REACTION_DOCUMENT)
    private readonly reactionModel: Model<ReactionDocument>,
  ) {
    super(reactionModel);
  }

  async deleteMany(
    filterQuery: FilterQuery<ReactionDocument>,
    populate?: Array<{
      path: string;
      select?: string;
      populate?: any;
    }>,
  ): Promise<ReactionDocument[]> {
    // Tìm kiếm các tài liệu trước khi xóa
    let query = this.model.find(filterQuery);

    // Nếu có populate
    if (populate) {
      query = query.populate(populate);
    }

    // Lấy danh sách các tài liệu sẽ bị xóa
    const documentsToDelete = await query.lean<ReactionDocument[]>(true);

    if (documentsToDelete.length === 0) {
      return [];
    }

    // Xóa các tài liệu
    await this.model.deleteMany(filterQuery);

    // Trả về danh sách tài liệu đã xóa
    return documentsToDelete;
  }
}
