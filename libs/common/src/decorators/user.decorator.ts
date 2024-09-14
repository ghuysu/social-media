import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDocument } from '../models';

export const User = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const user: UserDocument = context.switchToHttp().getRequest().user;
    return user;
  },
);
