import {
  AUTH_SERVICE,
  ChangePasswordDto,
  CheckEmailDto,
  CreateNormalUserDto,
  GoogleSignInDto,
  SignInDto,
} from '@app/common';
import { CheckCodeDto } from '@app/common/dto/auth-dto/check-code.dto';
import {
  BadRequestException,
  Body,
  ConflictException,
  ForbiddenException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class ApiGatewayService {
  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: ClientProxy,
  ) {}

  throwErrorBasedOnStatusCode(statusCode: number, message: string) {
    switch (statusCode) {
      case 400:
        throw new BadRequestException(message);
      case 401:
        throw new UnauthorizedException(message);
      case 403:
        throw new ForbiddenException(message);
      case 404:
        throw new NotFoundException(message);
      case 409:
        throw new ConflictException(message);
      case 500:
        throw new InternalServerErrorException(message);
      default:
        throw new HttpException(message, statusCode);
    }
  }

  //sign up
  async checkEmail(@Body() dto: CheckEmailDto) {
    const result = await lastValueFrom(
      this.authService.send('check_email_for_sign_up', dto).pipe(
        map((response) => {
          if (response.error) {
            this.throwErrorBasedOnStatusCode(
              response.statusCode,
              response.message,
            );
          }
          return response;
        }),
      ),
    );

    return result;
  }

  async checkCodeForSignUp(@Body() dto: CreateNormalUserDto) {
    const result = await lastValueFrom(
      this.authService.send('check_code_for_sign_up', dto).pipe(
        map((response) => {
          if (response.error) {
            this.throwErrorBasedOnStatusCode(
              response.statusCode,
              response.message,
            );
          }
          return response;
        }),
      ),
    );

    return result;
  }

  //sign in
  async signinAsUser(@Body() dto: SignInDto) {
    const result = await lastValueFrom(
      this.authService.send('sign_in_as_user', dto).pipe(
        map((response) => {
          if (response.error) {
            this.throwErrorBasedOnStatusCode(
              response.statusCode,
              response.message,
            );
          }
          return response;
        }),
      ),
    );

    return result;
  }

  async signinAsAdmin(@Body() dto: SignInDto) {
    const result = await lastValueFrom(
      this.authService.send('sign_in_as_admin', dto).pipe(
        map((response) => {
          if (response.error) {
            this.throwErrorBasedOnStatusCode(
              response.statusCode,
              response.message,
            );
          }
          return response;
        }),
      ),
    );

    return result;
  }

  async checkCodeToSignInAsAdmin(@Body() dto: CheckCodeDto) {
    const result = await lastValueFrom(
      this.authService.send('check_code_to_sign_in_as_admin', dto).pipe(
        map((response) => {
          if (response.error) {
            this.throwErrorBasedOnStatusCode(
              response.statusCode,
              response.message,
            );
          }
          return response;
        }),
      ),
    );

    return result;
  }

  //change password
  async checkEmailForChangePassword(@Body() dto: CheckEmailDto) {
    const result = await lastValueFrom(
      this.authService.send('check_email_for_change_password', dto).pipe(
        map((response) => {
          if (response.error) {
            this.throwErrorBasedOnStatusCode(
              response.statusCode,
              response.message,
            );
          }
          return response;
        }),
      ),
    );

    return result;
  }

  async checkCodeForChangePassword(@Body() dto: ChangePasswordDto) {
    const result = await lastValueFrom(
      this.authService.send('change_password', dto).pipe(
        map((response) => {
          if (response.error) {
            this.throwErrorBasedOnStatusCode(
              response.statusCode,
              response.message,
            );
          }
          return response;
        }),
      ),
    );

    return result;
  }

  //google authentication
  async handleGoogleRedirect(user: GoogleSignInDto) {
    const result = await lastValueFrom(
      this.authService.send('google_redirect', user).pipe(
        map((response) => {
          if (response.error) {
            this.throwErrorBasedOnStatusCode(
              response.statusCode,
              response.message,
            );
          }
          return response;
        }),
      ),
    );

    return result;
  }
}
