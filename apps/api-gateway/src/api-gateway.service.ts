import {
  AUTH_SERVICE,
  ChangeBirthdayDto,
  ChangeCountryDto,
  ChangeEmailDto,
  ChangeFullnameDto,
  ChangePasswordDto,
  CheckCodeToChangeEmailDto,
  CheckEmailDto,
  CreateNormalUserDto,
  GoogleSignInDto,
  SignInDto,
  TokenPayloadInterface,
  USER_SERVICE,
} from '@app/common';
import { CheckCodeDto } from '@app/common/dto/auth-dto/check-code.dto';
import {
  BadRequestException,
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
    @Inject(USER_SERVICE) private readonly userService: ClientProxy,
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
  async checkEmail(dto: CheckEmailDto) {
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

  async checkCodeForSignUp(dto: CreateNormalUserDto) {
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
  async signinAsUser(dto: SignInDto) {
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

  async signinAsAdmin(dto: SignInDto) {
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

  async checkCodeToSignInAsAdmin(dto: CheckCodeDto) {
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
  async checkEmailForChangePassword(dto: CheckEmailDto) {
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

  async checkCodeForChangePassword(dto: ChangePasswordDto) {
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

  //user
  async getUser(userPayload: TokenPayloadInterface) {
    const result = await lastValueFrom(
      this.userService.send('get_user', userPayload).pipe(
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

  async changeBirthday(
    userPayload: TokenPayloadInterface,
    dto: ChangeBirthdayDto,
  ) {
    const result = await lastValueFrom(
      this.userService
        .send('change_birthday', { birthdayPayload: dto, userPayload })
        .pipe(
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

  async changeFullname(
    userPayload: TokenPayloadInterface,
    dto: ChangeFullnameDto,
  ) {
    const result = await lastValueFrom(
      this.userService
        .send('change_fullname', { fullnamePayload: dto, userPayload })
        .pipe(
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

  async changeCountry(
    userPayload: TokenPayloadInterface,
    dto: ChangeCountryDto,
  ) {
    const result = await lastValueFrom(
      this.userService
        .send('change_country', { countryPayload: dto, userPayload })
        .pipe(
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

  async changeEmail(userPayload: TokenPayloadInterface, dto: ChangeEmailDto) {
    const result = await lastValueFrom(
      this.userService
        .send('change_email', { emailPayload: dto, userPayload })
        .pipe(
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

  async checkCodeToChangeEmail(
    userPayload: TokenPayloadInterface,
    dto: CheckCodeToChangeEmailDto,
  ) {
    const result = await lastValueFrom(
      this.userService
        .send('check_code_to_change_email', { payload: dto, userPayload })
        .pipe(
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

  async changeProfileImage(
    userPayload: TokenPayloadInterface,
    file: Express.Multer.File,
  ) {
    const result = await lastValueFrom(
      this.userService
        .send('change_profile_image', {
          image: file.buffer,
          originalname: file.originalname,
          userPayload,
        })
        .pipe(
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
