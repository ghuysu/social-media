import {
  AUTH_SERVICE,
  ChangeBirthdayDto,
  ChangeCountryDto,
  ChangeEmailDto,
  ChangeFullnameDto,
  ChangePasswordDto,
  CheckCodeToChangeEmailDto,
  CheckEmailDto,
  CreateMessageDto,
  CreateNormalUserDto,
  DeleteAccountDto,
  DeleteFriendDto,
  FEED_SERVICE,
  GoogleSignInDto,
  MESSAGE_SERVICE,
  ReadMessageDto,
  RemoveInviteDto,
  REPORTING_SERVICE,
  SendInviteDto,
  SignInDto,
  STATISTIC_SERVICE,
  TokenPayloadInterface,
  USER_SERVICE,
  UserDocument,
} from '@app/common';
import { CheckCodeDto } from '@app/common/dto/auth-dto/check-code.dto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, map } from 'rxjs';
import { GetStrangerInforInterface } from './interfaces/get-stranger-infor.interface';
import { AcceptInviteDto } from '@app/common';
import {
  CreateFeedDto,
  GetCertainUserFeedsDto,
  GetEveryoneFeedsDto,
  GetFeedByAdminDto,
  ReactFeedDto,
  UpdateFeedDto,
} from '@app/common/dto/feed-dto';
import { GetCertainFriendConversationDto } from '@app/common/dto/message-dto/get-certain-friend-conversation.dto';
import { Types } from 'mongoose';
import { GetUserInforByAdminInterface } from './interfaces/get_user_infor_by_admin.interface';

@Injectable()
export class ApiGatewayService {
  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: ClientProxy,
    @Inject(USER_SERVICE) private readonly userService: ClientProxy,
    @Inject(FEED_SERVICE) private readonly feedService: ClientProxy,
    @Inject(MESSAGE_SERVICE) private readonly messageService: ClientProxy,
    @Inject(STATISTIC_SERVICE) private readonly statisticService: ClientProxy,
    @Inject(REPORTING_SERVICE) private readonly reportingService: ClientProxy,
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

  async getStrangerInfor(userId) {
    const infor: GetStrangerInforInterface | null = await lastValueFrom(
      this.userService.send('get_stranger_infor', { userId }).pipe(
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

    return infor;
  }

  async sendInvite(
    userPayload: TokenPayloadInterface,
    { userId }: SendInviteDto,
  ) {
    const result = await lastValueFrom(
      this.userService
        .send('send_invite', {
          payload: { userId },
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

  async removeInvite(userPayload: TokenPayloadInterface, dto: RemoveInviteDto) {
    const result = await lastValueFrom(
      this.userService
        .send('remove_invite', {
          payload: dto,
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

  async acceptInvite(userPayload: TokenPayloadInterface, dto: AcceptInviteDto) {
    const result = await lastValueFrom(
      this.userService
        .send('accept_invite', {
          payload: dto,
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

  async deleteFriend(userPayload: TokenPayloadInterface, dto: DeleteFriendDto) {
    const result = await lastValueFrom(
      this.userService
        .send('delete_friend', {
          payload: dto,
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

  //feed
  async createFeed(
    userPayload: TokenPayloadInterface,
    dto: CreateFeedDto,
    image: Express.Multer.File,
  ) {
    const result = await lastValueFrom(
      this.feedService
        .send('create_feed', {
          payload: {
            ...dto,
            image: image.buffer,
            originalname: image.originalname,
          },
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

  async updateFeed(
    userPayload: TokenPayloadInterface,
    dto: UpdateFeedDto,
    feedId: string,
  ) {
    const result = await lastValueFrom(
      this.feedService
        .send('update_feed', {
          payload: { ...dto, feedId },
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

  async deleteFeed(userPayload: TokenPayloadInterface, feedId: string) {
    const result = await lastValueFrom(
      this.feedService
        .send('delete_feed', {
          payload: { feedId },
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

  async reactFeed(
    userPayload: TokenPayloadInterface,
    dto: ReactFeedDto,
    feedId: string,
  ) {
    const result = await lastValueFrom(
      this.feedService
        .send('react_feed', {
          payload: { ...dto, feedId },
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

  async getEveryoneFeeds(
    userPayload: TokenPayloadInterface,
    payload: GetEveryoneFeedsDto,
  ) {
    console.log(payload);
    const result = await lastValueFrom(
      this.feedService
        .send('get_everyone_feeds', {
          userPayload,
          payload,
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

  async getCertainUserFeeds(
    userPayload: TokenPayloadInterface,
    dto: GetCertainUserFeedsDto,
    userId: string,
  ) {
    const result = await lastValueFrom(
      this.feedService
        .send('get_certain_user_feeds', {
          payload: { ...dto, userId },
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

  //message
  async createMessage(
    userPayload: TokenPayloadInterface,
    dto: CreateMessageDto,
  ) {
    const result = await lastValueFrom(
      this.messageService
        .send('create_message', {
          payload: dto,
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

  async readMessages(userPayload: TokenPayloadInterface, dto: ReadMessageDto) {
    const result = await lastValueFrom(
      this.messageService
        .send('read_messages', {
          payload: dto,
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

  async getAllConversations(userPayload: TokenPayloadInterface) {
    const result = await lastValueFrom(
      this.messageService
        .send('get_all_conversations', {
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

  async getCertainFriendConversation(
    userPayload: TokenPayloadInterface,
    dto: GetCertainFriendConversationDto,
    friendId: Types.ObjectId,
  ) {
    const result = await lastValueFrom(
      this.messageService
        .send('get_certain_friend_conversation', {
          userPayload,
          payload: {
            ...dto,
            friendId: friendId.toString(),
          },
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

  async checkDeleteAccount(userPayload: TokenPayloadInterface) {
    const result = await lastValueFrom(
      this.userService
        .send('check_delete_account', {
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

  async deleteAccount(
    userPayload: TokenPayloadInterface,
    dto: DeleteAccountDto,
  ) {
    const result = await lastValueFrom(
      this.userService
        .send('delete_account', {
          userPayload,
          payload: dto,
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

  //statistic
  async getStatisticInfor() {
    const result = await lastValueFrom(
      this.statisticService.send('get_statistic_infor', {}).pipe(
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

  //admin
  async getUserInforByAdmin(
    { searchValue }: GetUserInforByAdminInterface,
    type: string,
  ) {
    //check type
    let getUserInforMessage: string = 'get_user_infor_by_admin_with_email';

    if (type === 'id') {
      if (!this.isValidMongoId(searchValue)) {
        throw new BadRequestException('Invalid Id');
      }
      getUserInforMessage = 'get_user_infor_by_admin_with_id';
    }

    //check type
    const userInfor: UserDocument = await lastValueFrom(
      this.userService
        .send(getUserInforMessage, {
          searchValue,
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

    const feedList: Types.ObjectId[] = await lastValueFrom(
      this.feedService
        .send('get_feed_list_by_admin', {
          userId: userInfor._id,
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

    return {
      status: HttpStatus.OK,
      message: 'Get user information successfully.',
      metadata: {
        ...userInfor,
        feedList,
      },
    };
  }

  async getFeedByAdmin({ feedId }: GetFeedByAdminDto) {
    const result = await lastValueFrom(
      this.feedService
        .send('get_feed_by_admin', {
          feedId,
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

    return {
      status: HttpStatus.OK,
      message: 'Get feed successfully.',
      metadata: result,
    };
  }

  isValidMongoId(id: string): boolean {
    return Types.ObjectId.isValid(id);
  }

  //report
  async reportUser(userPayload, userId: Types.ObjectId, reason: number) {
    const result = await lastValueFrom(
      this.reportingService
        .send('report_user', {
          userPayload,
          payload: { reportedUserId: userId, reason },
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
