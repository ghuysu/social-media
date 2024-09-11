import { AbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { UserDocument } from '@app/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserRepository extends AbstractRepository<UserDocument> {
  protected readonly logger = new Logger(UserRepository.name);

  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }
}
