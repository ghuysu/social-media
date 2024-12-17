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
import { GetMoreReportsDto } from './dto/get-more-reports.dto';
import { GetAdminListDto } from './dto/get-admin-list.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { RefreshTokenDto } from './dto/refreshtoken.dto';

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

  private isValidMongoId(id: string): boolean {
    return Types.ObjectId.isValid(id);
  }

  private async sendMessageToAuthService(message: string, dto: any) {
    const result = await lastValueFrom(
      this.authService.send(message, dto).pipe(
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

  private async sendMessageToUserService(message: string, dto: any) {
    const result = await lastValueFrom(
      this.userService.send(message, dto).pipe(
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

  private async sendMessageToFeedService(message: string, dto: any) {
    const result = await lastValueFrom(
      this.feedService.send(message, dto).pipe(
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

  private async sendMessageToMessageService(message: string, dto: any) {
    const result = await lastValueFrom(
      this.messageService.send(message, dto).pipe(
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

  private async sendMessageToReportingService(message: string, dto: any) {
    const result = await lastValueFrom(
      this.reportingService.send(message, dto).pipe(
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

  private async sendMessageToStatisticService(message: string, dto: any) {
    const result = await lastValueFrom(
      this.statisticService.send(message, dto).pipe(
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

  //sign up
  async checkEmail(dto: CheckEmailDto) {
    return this.sendMessageToAuthService('check_email_for_sign_up', dto);
  }

  async checkCodeForSignUp(dto: CreateNormalUserDto) {
    return this.sendMessageToAuthService('check_code_for_sign_up', dto);
  }

  //sign in
  async signinAsUser(dto: SignInDto) {
    return this.sendMessageToAuthService('sign_in_as_user', dto);
  }

  async signinAsAdmin(dto: SignInDto) {
    return this.sendMessageToAuthService('sign_in_as_admin', dto);
  }

  async checkCodeToSignInAsAdmin(dto: CheckCodeDto) {
    return this.sendMessageToAuthService('check_code_to_sign_in_as_admin', dto);
  }

  //refresh token
  async refreshUserAccessToken(dto: RefreshTokenDto) {
    return this.sendMessageToAuthService('refresh_user_access_token', dto);
  }

  async refreshAdminAccessToken(dto: RefreshTokenDto) {
    return this.sendMessageToAuthService('refresh_admin_access_token', dto);
  }

  //change password
  async checkEmailForChangePassword(dto: CheckEmailDto) {
    return this.sendMessageToAuthService(
      'check_email_for_change_password',
      dto,
    );
  }

  async checkCodeForChangePassword(dto: ChangePasswordDto) {
    return this.sendMessageToAuthService('change_password', dto);
  }

  //google authentication
  async signInGoogle(token: string) {
    return this.sendMessageToAuthService('sign_in_google', { token });
  }

  //user
  async getUser(userPayload: TokenPayloadInterface) {
    return this.sendMessageToUserService('get_user', userPayload);
  }

  async getAllUsers(page: number) {
    return this.sendMessageToUserService('get_all_users', { page });
  }

  async changeBirthday(
    userPayload: TokenPayloadInterface,
    dto: ChangeBirthdayDto,
  ) {
    return this.sendMessageToUserService('change_birthday', {
      birthdayPayload: dto,
      userPayload,
    });
  }

  async changeFullname(
    userPayload: TokenPayloadInterface,
    dto: ChangeFullnameDto,
  ) {
    return this.sendMessageToUserService('change_fullname', {
      fullnamePayload: dto,
      userPayload,
    });
  }

  async changeCountry(
    userPayload: TokenPayloadInterface,
    dto: ChangeCountryDto,
  ) {
    return this.sendMessageToUserService('change_country', {
      countryPayload: dto,
      userPayload,
    });
  }

  async changeEmail(userPayload: TokenPayloadInterface, dto: ChangeEmailDto) {
    return this.sendMessageToUserService('change_email', {
      emailPayload: dto,
      userPayload,
    });
  }

  async checkCodeToChangeEmail(
    userPayload: TokenPayloadInterface,
    dto: CheckCodeToChangeEmailDto,
  ) {
    return this.sendMessageToUserService('check_code_to_change_email', {
      payload: dto,
      userPayload,
    });
  }

  async changeProfileImage(
    userPayload: TokenPayloadInterface,
    file: Express.Multer.File,
  ) {
    return this.sendMessageToUserService('change_profile_image', {
      image: file.buffer,
      originalname: file.originalname,
      userPayload,
    });
  }

  async getStrangerInfor(userId) {
    const infor: GetStrangerInforInterface | null =
      await this.sendMessageToUserService('get_stranger_infor', { userId });
    return infor;
  }

  async sendInvite(
    userPayload: TokenPayloadInterface,
    { userId }: SendInviteDto,
  ) {
    return this.sendMessageToUserService('send_invite', {
      payload: { userId },
      userPayload,
    });
  }

  async removeInvite(userPayload: TokenPayloadInterface, dto: RemoveInviteDto) {
    return this.sendMessageToUserService('remove_invite', {
      payload: dto,
      userPayload,
    });
  }

  async acceptInvite(userPayload: TokenPayloadInterface, dto: AcceptInviteDto) {
    return this.sendMessageToUserService('accept_invite', {
      payload: dto,
      userPayload,
    });
  }

  async deleteFriend(userPayload: TokenPayloadInterface, dto: DeleteFriendDto) {
    return this.sendMessageToUserService('delete_friend', {
      payload: dto,
      userPayload,
    });
  }

  async checkDeleteAccount(userPayload: TokenPayloadInterface) {
    return this.sendMessageToUserService('check_delete_account', {
      userPayload,
    });
  }

  async deleteAccount(
    userPayload: TokenPayloadInterface,
    dto: DeleteAccountDto,
  ) {
    return this.sendMessageToMessageService('delete_account', {
      userPayload,
      payload: dto,
    });
  }

  //feed
  async createFeed(
    userPayload: TokenPayloadInterface,
    dto: CreateFeedDto,
    image: Express.Multer.File,
  ) {
    return this.sendMessageToFeedService('create_feed', {
      payload: {
        ...dto,
        image: image.buffer,
        originalname: image.originalname,
      },
      userPayload,
    });
  }

  async updateFeed(
    userPayload: TokenPayloadInterface,
    dto: UpdateFeedDto,
    feedId: string,
  ) {
    return this.sendMessageToFeedService('update_feed', {
      payload: { ...dto, feedId },
      userPayload,
    });
  }

  async deleteFeed(userPayload: TokenPayloadInterface, feedId: string) {
    return this.sendMessageToFeedService('delete_feed', {
      payload: { feedId },
      userPayload,
    });
  }

  async reactFeed(
    userPayload: TokenPayloadInterface,
    dto: ReactFeedDto,
    feedId: string,
  ) {
    return this.sendMessageToFeedService('react_feed', {
      payload: { ...dto, feedId },
      userPayload,
    });
  }

  async getEveryoneFeeds(
    userPayload: TokenPayloadInterface,
    payload: GetEveryoneFeedsDto,
  ) {
    return this.sendMessageToFeedService('get_everyone_feeds', {
      userPayload,
      payload,
    });
  }

  async getAllFeeds(page: number) {
    return this.sendMessageToFeedService('get_all_feeds', {
      page,
    });
  }

  async getCertainUserFeeds(
    userPayload: TokenPayloadInterface,
    dto: GetCertainUserFeedsDto,
    userId: string,
  ) {
    return this.sendMessageToFeedService('get_certain_user_feeds', {
      payload: { ...dto, userId },
      userPayload,
    });
  }

  //message
  async createMessage(
    userPayload: TokenPayloadInterface,
    dto: CreateMessageDto,
  ) {
    return this.sendMessageToMessageService('create_message', {
      payload: dto,
      userPayload,
    });
  }

  async readMessages(userPayload: TokenPayloadInterface, dto: ReadMessageDto) {
    return this.sendMessageToMessageService('read_messages', {
      payload: dto,
      userPayload,
    });
  }

  async getAllConversations(userPayload: TokenPayloadInterface) {
    return this.sendMessageToMessageService('get_all_conversations', {
      userPayload,
    });
  }

  async getCertainFriendConversation(
    userPayload: TokenPayloadInterface,
    dto: GetCertainFriendConversationDto,
    friendId: Types.ObjectId,
  ) {
    return this.sendMessageToMessageService('get_certain_friend_conversation', {
      userPayload,
      payload: {
        ...dto,
        friendId: friendId.toString(),
      },
    });
  }

  //statistic
  async getStatisticInfor() {
    return this.sendMessageToStatisticService('get_statistic_infor', {});
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
    const userInfor: UserDocument = await this.sendMessageToUserService(
      getUserInforMessage,
      { searchValue },
    );

    const feedList: Types.ObjectId[] = await this.sendMessageToFeedService(
      'get_feed_list_by_admin',
      {
        userId: userInfor._id,
      },
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
    return this.sendMessageToFeedService('get_feed_by_admin', {
      feedId,
    });
  }

  //report
  async reportUser(userPayload, userId: Types.ObjectId, reason: number) {
    return this.sendMessageToReportingService('report_user', {
      userPayload,
      payload: { reportedUserId: userId, reason },
    });
  }

  async reportFeed(userPayload, feedId: Types.ObjectId, reason: number) {
    return this.sendMessageToReportingService('report_feed', {
      userPayload,
      payload: { reportedFeedId: feedId, reason },
    });
  }

  async getReports() {
    return this.sendMessageToReportingService('get_reports', {});
  }

  async getMoreUserReports(dto: GetMoreReportsDto) {
    return this.sendMessageToReportingService('get_more_user_reports', dto);
  }

  async getMoreFeedReports(dto: GetMoreReportsDto) {
    return this.sendMessageToReportingService('get_more_feed_reports', dto);
  }

  async getProcessedReports() {
    return this.sendMessageToReportingService('get_processed_reports', {});
  }

  async getMoreProcessedUserReports(dto: GetMoreReportsDto) {
    return this.sendMessageToReportingService(
      'get_more_processed_user_reports',
      dto,
    );
  }

  async getMoreProcessedFeedReports(dto: GetMoreReportsDto) {
    return this.sendMessageToReportingService(
      'get_more_processed_feed_reports',
      dto,
    );
  }

  async processFeedReport(userPayload: TokenPayloadInterface, dto) {
    return this.sendMessageToReportingService('process_feed_report', {
      userPayload,
      payload: dto,
    });
  }

  async processUserReport(userPayload: TokenPayloadInterface, dto) {
    return this.sendMessageToReportingService('process_user_report', {
      userPayload,
      payload: dto,
    });
  }

  //root admin
  async createAdminAccount(
    { userId }: TokenPayloadInterface,
    dto: CreateAdminDto,
  ) {
    return this.sendMessageToAuthService('create_new_admin_account', {
      adminId: userId,
      ...dto,
    });
  }

  async getAdminList(
    { userId }: TokenPayloadInterface,
    { page }: GetAdminListDto,
  ) {
    return this.sendMessageToUserService('get_admin_list', { userId, page });
  }
}
