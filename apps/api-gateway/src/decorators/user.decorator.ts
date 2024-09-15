import { UserDocument } from '@app/common';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const user: UserDocument = context.switchToHttp().getRequest().user;
    return user;
  },
);
