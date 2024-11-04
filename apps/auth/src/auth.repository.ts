import { AbstractRepository, USER_DOCUMENT } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { UserDocument } from '@app/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AuthRepository extends AbstractRepository<UserDocument> {
  protected readonly logger = new Logger(AuthRepository.name);

  constructor(
    @InjectModel(USER_DOCUMENT)
    private readonly userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }
}
