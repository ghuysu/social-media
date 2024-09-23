import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles = ['normal_user', 'admin', 'root_admin'];

    const enteredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    const isValidRoles: boolean = enteredRoles.every((r) =>
      validRoles.includes(r),
    );

    if (!isValidRoles) {
      throw new InternalServerErrorException('Incorrect Roles');
    }

    if (!enteredRoles) {
      return true;
    }

    const user = context.switchToHttp().getRequest().user;

    if (!user) {
      return false;
    }

    const role: string = user.role;

    const isCorrectRole: boolean = enteredRoles.some((r) => r === role);

    if (!isCorrectRole) {
      throw new ForbiddenException('Unreachable Request');
    }

    return true;
  }
}
