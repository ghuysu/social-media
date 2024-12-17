import {
  ALL_ROLE,
  ChangeBirthdayDto,
  ChangeCountryDto,
  ChangeEmailDto,
  ChangeFullnameDto,
  ChangePasswordDto,
  CheckCodeToChangeEmailDto,
  CheckEmailDto,
  CreateNormalUserDto,
  DeleteFriendDto,
  GetStrangerInforDto,
  NORMAL_USER_ROLE,
  RemoveInviteDto,
  SendInviteDto,
  SignInDto,
  TokenPayloadInterface,
  CheckCodeDto,
  AcceptInviteDto,
  CreateMessageDto,
  ReadMessageDto,
  GetCertainFriendConversationDto,
  CreateFeedDto,
  GetCertainUserFeedsDto,
  GetEveryoneFeedsDto,
  ReactFeedDto,
  UpdateFeedDto,
  GetCertainConversationParamDto,
  DeleteAccountDto,
  ADMIN_ROLE,
  GetFeedByAdminDto,
  ROOT_ADMIN_ROLE,
} from '@app/common';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';
import { ApiKeyGuard } from './guards/api-key.guard';
import { JwtGuard } from './guards/jwt.guard';
import { User } from './decorators/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { RoleGuard } from './guards/role.guard';
import { Roles } from './decorators/role.decorator';
import { GetUserInforByAdminInterface } from './interfaces/get_user_infor_by_admin.interface';
import { TypeInterface } from './interfaces/type.interface';
import { UserIdDto } from './dto/userId.dto';
import { UserReportDto } from './dto/user-report.dto';
import { FeedReportDto } from './dto/feed-report.dto';
import { FeedIdDto } from './dto/feedId.dto';
import { GetMoreReportsDto } from './dto/get-more-reports.dto';
import { ReportIdDto } from './dto/reportId.dto';
import { ProcessReportDto } from './dto/processReport.dto';
import { GetAdminListDto } from './dto/get-admin-list.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { PageDto } from './dto/page.dto';
import { RefreshTokenDto } from './dto/refreshtoken.dto';

@Controller('api')
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  //sign up
  @UseGuards(ApiKeyGuard)
  @Post('auth/users/checking')
  @HttpCode(HttpStatus.OK)
  async checkEmail(@Body() dto: CheckEmailDto) {
    return this.apiGatewayService.checkEmail(dto);
  }

  @UseGuards(ApiKeyGuard)
  @Post('auth/users/sign-up')
  @HttpCode(HttpStatus.CREATED)
  async checkCodeForSignUp(@Body() dto: CreateNormalUserDto) {
    return this.apiGatewayService.checkCodeForSignUp(dto);
  }

  //change password
  @UseGuards(ApiKeyGuard)
  @Post('auth/password')
  @HttpCode(HttpStatus.OK)
  async checkEmailForChangePassword(@Body() dto: CheckEmailDto) {
    return this.apiGatewayService.checkEmailForChangePassword(dto);
  }

  @UseGuards(ApiKeyGuard)
  @Patch('auth/password')
  @HttpCode(HttpStatus.OK)
  async checkCodeForChangePassword(@Body() dto: ChangePasswordDto) {
    return this.apiGatewayService.checkCodeForChangePassword(dto);
  }

  //sign in
  @UseGuards(ApiKeyGuard)
  @Post('auth/users/sign-in')
  @HttpCode(HttpStatus.OK)
  async signinAsUser(@Body() dto: SignInDto) {
    return this.apiGatewayService.signinAsUser(dto);
  }

  @UseGuards(ApiKeyGuard)
  @Post('auth/admins/sign-in')
  @HttpCode(HttpStatus.OK)
  async signinAsAdmin(@Body() dto: SignInDto) {
    return this.apiGatewayService.signinAsAdmin(dto);
  }

  @UseGuards(ApiKeyGuard)
  @Post('auth/admins/checking')
  @HttpCode(HttpStatus.OK)
  async checkCodeToSignInAsAdmin(@Body() dto: CheckCodeDto) {
    return this.apiGatewayService.checkCodeToSignInAsAdmin(dto);
  }

  //refresh token
  @UseGuards(ApiKeyGuard)
  @Post('auth/users/refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshUserAccessToken(@Body() dto: RefreshTokenDto) {
    return this.apiGatewayService.refreshUserAccessToken(dto);
  }

  @UseGuards(ApiKeyGuard)
  @Post('auth/admins/refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshAdminAccessToken(@Body() dto: RefreshTokenDto) {
    return this.apiGatewayService.refreshAdminAccessToken(dto);
  }

  //google authentication
  @Post('auth/sign-in/google')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyGuard)
  async signInGoogle(@Body('token') token: string) {
    return this.apiGatewayService.signInGoogle(token);
  }

  //user
  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(...ALL_ROLE)
  @Get('users')
  async getUser(@User() userPayload: TokenPayloadInterface) {
    return this.apiGatewayService.getUser(userPayload);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(...ADMIN_ROLE)
  @Get('admins/users')
  async getAllUsers(@Query() { page }: PageDto) {
    return this.apiGatewayService.getAllUsers(page);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Patch('users/birthday')
  async changeBirthday(
    @User() userPayload: TokenPayloadInterface,
    @Body() dto: ChangeBirthdayDto,
  ) {
    return this.apiGatewayService.changeBirthday(userPayload, dto);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Patch('users/fullname')
  async changeFullname(
    @User() userPayload: TokenPayloadInterface,
    @Body() dto: ChangeFullnameDto,
  ) {
    return this.apiGatewayService.changeFullname(userPayload, dto);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Patch('users/country')
  async changeCountry(
    @User() userPayload: TokenPayloadInterface,
    @Body() dto: ChangeCountryDto,
  ) {
    return this.apiGatewayService.changeCountry(userPayload, dto);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Post('users/email')
  async changeEmail(
    @User() userPayload: TokenPayloadInterface,
    @Body() dto: ChangeEmailDto,
  ) {
    return this.apiGatewayService.changeEmail(userPayload, dto);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Patch('users/email/checking')
  async checkCodeToChangeEmail(
    @User() userPayload: TokenPayloadInterface,
    @Body() dto: CheckCodeToChangeEmailDto,
  ) {
    return this.apiGatewayService.checkCodeToChangeEmail(userPayload, dto);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(...ALL_ROLE)
  @Patch('users/profile-image')
  @UseInterceptors(FileInterceptor('file'))
  async changeProfileImage(
    @User() userPayload: TokenPayloadInterface,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png)$/,
        })
        .addMaxSizeValidator({
          maxSize: 10000000,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.apiGatewayService.changeProfileImage(userPayload, file);
  }

  @UseGuards(ApiKeyGuard)
  @Get('users/:userId')
  async getStrangerInfor(@Param() { userId }: GetStrangerInforDto) {
    return this.apiGatewayService.getStrangerInfor(userId);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Patch('users/invite/add')
  @HttpCode(HttpStatus.OK)
  async sendInvite(
    @User() userPayload: TokenPayloadInterface,
    @Body() dto: SendInviteDto,
  ) {
    return this.apiGatewayService.sendInvite(userPayload, dto);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Delete('users/invite/remove/:inviteId')
  async removeInvite(
    @User() userPayload: TokenPayloadInterface,
    @Param() dto: RemoveInviteDto,
  ) {
    return this.apiGatewayService.removeInvite(userPayload, dto);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Patch('users/invite/accept/:inviteId')
  async acceptInvite(
    @User() userPayload: TokenPayloadInterface,
    @Param() dto: AcceptInviteDto,
  ) {
    return this.apiGatewayService.acceptInvite(userPayload, dto);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Delete('users/friend/:friendId')
  async deleteFriend(
    @User() userPayload: TokenPayloadInterface,
    @Param() dto: DeleteFriendDto,
  ) {
    return this.apiGatewayService.deleteFriend(userPayload, dto);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Post('users/deleting/checking')
  async checkDeleteAccount(@User() userPayload: TokenPayloadInterface) {
    return this.apiGatewayService.checkDeleteAccount(userPayload);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Delete('users/deleting')
  async deleteAccount(
    @User() userPayload: TokenPayloadInterface,
    @Query() dto: DeleteAccountDto,
  ) {
    return this.apiGatewayService.deleteAccount(userPayload, dto);
  }

  //feed
  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Post('feeds')
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.CREATED)
  async createFeed(
    @User() userPayload: TokenPayloadInterface,
    @Body() dto: CreateFeedDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png)$/,
        })
        .addMaxSizeValidator({
          maxSize: 10000000,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    image: Express.Multer.File,
  ) {
    return this.apiGatewayService.createFeed(userPayload, dto, image);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Patch('feeds/:feedId')
  async updateFeed(
    @User() userPayload: TokenPayloadInterface,
    @Param('feedId') feedId: string,
    @Body() dto: UpdateFeedDto,
  ) {
    return this.apiGatewayService.updateFeed(userPayload, dto, feedId);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Delete('feeds/:feedId')
  async deleteFeed(
    @User() userPayload: TokenPayloadInterface,
    @Param('feedId') feedId: string,
  ) {
    return this.apiGatewayService.deleteFeed(userPayload, feedId);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Post('feeds/reaction/:feedId')
  @HttpCode(HttpStatus.OK)
  async reactFeed(
    @User() userPayload: TokenPayloadInterface,
    @Param('feedId') feedId: string,
    @Body() dto: ReactFeedDto,
  ) {
    return this.apiGatewayService.reactFeed(userPayload, dto, feedId);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Get('feeds/everyone')
  async getEveryoneFeeds(
    @User() userPayload: TokenPayloadInterface,
    @Query() dto: GetEveryoneFeedsDto,
  ) {
    return this.apiGatewayService.getEveryoneFeeds(userPayload, dto);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Get('feeds/certain/:userId')
  async getCertainUserFeeds(
    @User() userPayload: TokenPayloadInterface,
    @Query() dto: GetCertainUserFeedsDto,
    @Param('userId') userId: string,
  ) {
    return this.apiGatewayService.getCertainUserFeeds(userPayload, dto, userId);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(...ADMIN_ROLE)
  @Get('admins/feed')
  async getAllFeeds(@Query() { page }: PageDto) {
    return this.apiGatewayService.getAllFeeds(page);
  }

  //message
  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Post('messages')
  @HttpCode(HttpStatus.CREATED)
  async createMessage(
    @User() userPayload: TokenPayloadInterface,
    @Body() dto: CreateMessageDto,
  ) {
    return this.apiGatewayService.createMessage(userPayload, dto);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Patch('messages/reading')
  async readMessages(
    @User() userPayload: TokenPayloadInterface,
    @Body() dto: ReadMessageDto,
  ) {
    return this.apiGatewayService.readMessages(userPayload, dto);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Get('messages/all')
  async getAllConversations(@User() userPayload: TokenPayloadInterface) {
    return this.apiGatewayService.getAllConversations(userPayload);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Get('messages/certain/:friendId')
  async getCertainFriendConversation(
    @User() userPayload: TokenPayloadInterface,
    @Query() dto: GetCertainFriendConversationDto,
    @Param() { friendId }: GetCertainConversationParamDto,
  ) {
    return this.apiGatewayService.getCertainFriendConversation(
      userPayload,
      dto,
      friendId,
    );
  }

  //admin
  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(...ADMIN_ROLE)
  @Get('statistics')
  async getStatisticInfor() {
    return this.apiGatewayService.getStatisticInfor();
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(...ADMIN_ROLE)
  @Get('admins/users/infor/:searchValue')
  async getUserInforByAdmin(
    @Param() dto: GetUserInforByAdminInterface,
    @Query() { type }: TypeInterface,
  ) {
    return this.apiGatewayService.getUserInforByAdmin(dto, type);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(...ADMIN_ROLE)
  @Get('admins/feeds/:feedId')
  async getFeedByAdmin(@Param() dto: GetFeedByAdminDto) {
    return this.apiGatewayService.getFeedByAdmin(dto);
  }

  //reporting
  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Post('reports/users/:userId')
  async reportUser(
    @User() userPayload: TokenPayloadInterface,
    @Param() { userId }: UserIdDto,
    @Body() { reason }: UserReportDto,
  ) {
    return this.apiGatewayService.reportUser(userPayload, userId, reason);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Post('reports/feeds/:feedId')
  async reportFeed(
    @User() userPayload: TokenPayloadInterface,
    @Param() { feedId }: FeedIdDto,
    @Body() { reason }: FeedReportDto,
  ) {
    return this.apiGatewayService.reportFeed(userPayload, feedId, reason);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(...ADMIN_ROLE)
  @Get('reports/all')
  async getReports() {
    return this.apiGatewayService.getReports();
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(...ADMIN_ROLE)
  @Get('reports/users')
  async getMoreUserReports(@Query() dto: GetMoreReportsDto) {
    return this.apiGatewayService.getMoreUserReports(dto);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(...ADMIN_ROLE)
  @Get('reports/feeds')
  async getMoreFeedReports(@Query() dto: GetMoreReportsDto) {
    return this.apiGatewayService.getMoreFeedReports(dto);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(...ADMIN_ROLE)
  @Get('reports/processed/all')
  async getProcessedReports() {
    return this.apiGatewayService.getProcessedReports();
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(...ADMIN_ROLE)
  @Get('reports/users/processed')
  async getMoreProcessedUserReports(@Query() dto: GetMoreReportsDto) {
    return this.apiGatewayService.getMoreProcessedUserReports(dto);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(...ADMIN_ROLE)
  @Get('reports/feeds/processed')
  async getMoreProcessedFeedReports(@Query() dto: GetMoreReportsDto) {
    return this.apiGatewayService.getMoreProcessedFeedReports(dto);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(...ADMIN_ROLE)
  @HttpCode(HttpStatus.OK)
  @Post('reports/feeds/process/:reportId')
  async processFeedReport(
    @User() userPayload: TokenPayloadInterface,
    @Param() { reportId }: ReportIdDto,
    @Body() { isViolating }: ProcessReportDto,
  ) {
    return this.apiGatewayService.processFeedReport(userPayload, {
      reportId,
      isViolating,
    });
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(...ADMIN_ROLE)
  @HttpCode(HttpStatus.OK)
  @Post('reports/users/process/:reportId')
  async processUserReport(
    @User() userPayload: TokenPayloadInterface,
    @Param() { reportId }: ReportIdDto,
    @Body() { isViolating }: ProcessReportDto,
  ) {
    return this.apiGatewayService.processUserReport(userPayload, {
      reportId,
      isViolating,
    });
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(ROOT_ADMIN_ROLE)
  @HttpCode(HttpStatus.CREATED)
  @Post('auth/admins/sign-up')
  async createAdminAccount(
    @User() userPayload: TokenPayloadInterface,
    @Body() dto: CreateAdminDto,
  ) {
    return this.apiGatewayService.createAdminAccount(userPayload, dto);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(ROOT_ADMIN_ROLE)
  @HttpCode(HttpStatus.OK)
  @Get('admins/list')
  async getAdminList(
    @Query() dto: GetAdminListDto,
    @User() userPayload: TokenPayloadInterface,
  ) {
    return this.apiGatewayService.getAdminList(userPayload, dto);
  }
}
