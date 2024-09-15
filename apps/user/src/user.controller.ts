import { UserService } from './user.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TokenPayloadInterface } from '@app/common';
import {
  // Body,
  Controller,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('get_user')
  async getUser(@Payload() userPayload: TokenPayloadInterface) {
    try {
      const account = await this.userService.getUser(userPayload);
      return {
        status: HttpStatus.OK,
        message: 'Get user information successfully.',
        metadata: account,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error instanceof ConflictException) {
      return {
        statusCode: HttpStatus.CONFLICT,
        message: error.message,
        error: 'Conflict',
      };
    }

    if (error instanceof NotFoundException) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: error.message,
        error: 'Not Found',
      };
    }

    if (error instanceof BadRequestException) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
        error: 'Bad Request',
      };
    }

    if (error instanceof UnauthorizedException) {
      return {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: error.message,
        error: 'Unauthorized',
      };
    }

    if (error instanceof InternalServerErrorException) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred',
        error: 'Internal Server Error',
      };
    }

    // Default case for other errors
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      error: 'Internal Server Error',
    };
  }
}
