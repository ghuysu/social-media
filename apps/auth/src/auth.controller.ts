import {
  Body,
  Controller,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  CheckEmailDto,
  CreateAdminAccountDto,
} from '@app/common';
import { CreateNormalUserDto } from '@app/common';
import { SignInDto } from '@app/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CheckCodeDto } from '@app/common';
import { GoogleSignInDto } from '@app/common';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //sign up
  @MessagePattern('check_email_for_sign_up')
  async checkEmailForSignUp(@Body() dto: CheckEmailDto) {
    try {
      await this.authService.checkEmailForSignUp(dto);
      return {
        status: HttpStatus.OK,
        message: 'Verification code sent successfully.',
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('check_code_for_sign_up')
  async checkCodeForSignUp(@Body() dto: CreateNormalUserDto) {
    try {
      await this.authService.checkCodeForSignUp(dto);
      return {
        status: HttpStatus.OK,
        message: 'Created user successfully',
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  //change password
  @MessagePattern('check_email_for_change_password')
  async checkEmailForChangePassword(@Body() dto: CheckEmailDto) {
    try {
      await this.authService.checkEmailForChangePassword(dto);
      return {
        status: HttpStatus.OK,
        message: 'Verification code sent successfully.',
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('change_password')
  async changePassword(@Body() dto: ChangePasswordDto) {
    try {
      await this.authService.checkCodeForChangePassword(dto);
      return {
        status: HttpStatus.OK,
        message: 'Change password successfully.',
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  //sign in
  @MessagePattern('sign_in_as_user')
  async signinAsUser(@Body() dto: SignInDto) {
    try {
      console.log(dto);
      const data = await this.authService.signInAsNormalUser(dto);
      console.log(data);
      return {
        status: HttpStatus.OK,
        message: 'Signed in as normal user successfully.',
        metadata: data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('sign_in_as_admin')
  async signinAsAdmin(@Body() dto: SignInDto) {
    try {
      await this.authService.signInAsAdmin(dto);
      return {
        status: HttpStatus.OK,
        message: 'Send code to sign in as admin successfully.',
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('check_code_to_sign_in_as_admin')
  async checkCodeToSignInAsAdmin(@Body() dto: CheckCodeDto) {
    try {
      const result = await this.authService.checkCodeToSignInAsAdmin(dto);
      return {
        status: HttpStatus.OK,
        message: 'Sign in as admin successfully.',
        metadata: result,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  //Google authentication
  @MessagePattern('google_redirect')
  async handleRedirect(user: GoogleSignInDto) {
    try {
      const result = await this.authService.googleSignIn(user);
      return result;
    } catch (error) {
      return this.handleError(error);
    }
  }

  //root admin
  @MessagePattern('create_new_admin_account')
  async createNewAdminAccount(@Payload() dto: CreateAdminAccountDto) {
    try {
      const result = await this.authService.createAdminAccount(dto);
      return {
        status: HttpStatus.OK,
        message: 'Created admin account successfully.',
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
        message: error.message,
        error: 'Internal Server Error',
      };
    }

    // Default case for other errors
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: error.message,
      error: 'Internal Server Error',
    };
  }
}
