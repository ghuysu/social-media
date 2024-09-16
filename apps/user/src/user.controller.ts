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
import { ChangeBirthdayInterface } from './interfaces/change-birthday.interface';
import { ChangeFullnameInterface } from './interfaces/change-fullname.interface';
import { ChangeCountryInterface } from './interfaces/change-country.interface';
import { ChangeEmailInterface } from './interfaces/change-email.interface';
import { CheckCodeToChangeEmailInterface } from './interfaces/check-code-to-change-email.interface';

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

  @MessagePattern('change_birthday')
  async changeBirthday(
    @Payload()
    { birthdayPayload, userPayload }: ChangeBirthdayInterface,
  ) {
    try {
      const account = await this.userService.changeBirthday(
        userPayload,
        birthdayPayload,
      );
      return {
        status: HttpStatus.OK,
        message: 'Changed birthday successfully.',
        metadata: account,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('change_fullname')
  async changeFullname(
    @Payload()
    { fullnamePayload, userPayload }: ChangeFullnameInterface,
  ) {
    try {
      const account = await this.userService.changeFullname(
        userPayload,
        fullnamePayload,
      );
      return {
        status: HttpStatus.OK,
        message: 'Changed fullname successfully.',
        metadata: account,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('change_country')
  async changeCountry(
    @Payload()
    { countryPayload, userPayload }: ChangeCountryInterface,
  ) {
    try {
      const account = await this.userService.changeCountry(
        userPayload,
        countryPayload,
      );
      return {
        status: HttpStatus.OK,
        message: 'Changed country successfully.',
        metadata: account,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('change_email')
  async changeEmail(
    @Payload()
    { emailPayload, userPayload }: ChangeEmailInterface,
  ) {
    try {
      await this.userService.changeEmail(userPayload, emailPayload);
      return {
        status: HttpStatus.OK,
        message: 'Sent code to change email successfully.',
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('check_code_to_change_email')
  async checkCodeToChangeEmail(
    @Payload()
    { payload, userPayload }: CheckCodeToChangeEmailInterface,
  ) {
    try {
      const result = await this.userService.checkCodeToChangeEmail(
        userPayload,
        payload,
      );
      return {
        status: HttpStatus.OK,
        message: 'Changed email successfully.',
        metadata: result,
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
