import {
  AbstractRepository,
  REACTION_DOCUMENT,
  ReactionDocument,
} from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ReactionRepository extends AbstractRepository<ReactionDocument> {
  protected readonly logger = new Logger(ReactionRepository.name);

  constructor(
    @InjectModel(REACTION_DOCUMENT)
    private readonly reactionModel: Model<ReactionDocument>,
  ) {
    super(reactionModel);
  }
}
