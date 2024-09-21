import { AbstractRepository, USER_DOCUMENT } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { UserDocument } from '@app/common';
import { Model } from 'mongoose';
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
}
