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
  GoogleSignInDto,
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
  CreateAdminAccountDto,
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
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { GoogleSignInInforInterface } from './interfaces/google-sign-in-infor.interface';
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

@Controller('api')
export class ApiGatewayController {
  constructor(
    private readonly apiGatewayService: ApiGatewayService,
    private readonly configService: ConfigService,
  ) {}

  //sign up
  @UseGuards(ApiKeyGuard)
  @Post('user/check')
  @HttpCode(HttpStatus.OK)
  async checkEmail(@Body() dto: CheckEmailDto) {
    return this.apiGatewayService.checkEmail(dto);
  }

  @UseGuards(ApiKeyGuard)
  @Post('user/sign-up')
  @HttpCode(HttpStatus.CREATED)
  async checkCodeForSignUp(@Body() dto: CreateNormalUserDto) {
    console.log(dto);
    return this.apiGatewayService.checkCodeForSignUp(dto);
  }

  //change password
  @UseGuards(ApiKeyGuard)
  @Post('password/check')
  @HttpCode(HttpStatus.OK)
  async checkEmailForChangePassword(@Body() dto: CheckEmailDto) {
    return this.apiGatewayService.checkEmailForChangePassword(dto);
  }

  @UseGuards(ApiKeyGuard)
  @Patch('password')
  @HttpCode(HttpStatus.OK)
  async checkCodeForChangePassword(@Body() dto: ChangePasswordDto) {
    return this.apiGatewayService.checkCodeForChangePassword(dto);
  }

  //sign in
  @UseGuards(ApiKeyGuard)
  @Post('user/sign-in')
  @HttpCode(HttpStatus.OK)
  async signinAsUser(@Body() dto: SignInDto) {
    return this.apiGatewayService.signinAsUser(dto);
  }

  @UseGuards(ApiKeyGuard)
  @Post('admin/sign-in')
  @HttpCode(HttpStatus.OK)
  async signinAsAdmin(@Body() dto: SignInDto) {
    return this.apiGatewayService.signinAsAdmin(dto);
  }

  @UseGuards(ApiKeyGuard)
  @Post('admin/check')
  @HttpCode(HttpStatus.OK)
  async checkCodeToSignInAsAdmin(@Body() dto: CheckCodeDto) {
    return this.apiGatewayService.checkCodeToSignInAsAdmin(dto);
  }

  //google authentication
  @Get('user/google/sign-in')
  @UseGuards(AuthGuard('google'))
  googleSignIn() {}

  @Get('user/google/redirect')
  @UseGuards(AuthGuard('google'))
  @HttpCode(HttpStatus.OK)
  async handleRedirect(@Req() req: Request, @Res() res) {
    const signInUser: GoogleSignInDto = req.user as GoogleSignInDto;

    // Lấy thông tin người dùng và token từ dịch vụ
    const { signInToken, user }: GoogleSignInInforInterface =
      await this.apiGatewayService.handleGoogleRedirect(signInUser);

    // URL chuyển hướng phía client
    const url = this.configService.get('CLIENT_REDIRECT_URL');

    // Tạo base URL với các thông tin bắt buộc
    let redirectUrl =
      `${url}?sign_in_token=${signInToken}` +
      `&_id=${user._id}` +
      `&email=${user.email}` +
      `&fullname=${encodeURIComponent(user.fullname)}` +
      `&profile_image_url=${encodeURIComponent(user.profileImageUrl)}` +
      `&friendList=${JSON.stringify(user.friendList)}` +
      `&friendInvites=${JSON.stringify(user.friendInvites)}` +
      `&isSignedInByGoogle=${user.isSignedInByGoogle}` +
      `&createdAt=${user.createdAt}`;

    // Kiểm tra xem có trường birthday không, nếu có thì thêm vào URL
    if (user.birthday) {
      redirectUrl += `&birthday=${user.birthday}`;
    }

    // Kiểm tra xem có trường country không, nếu có thì thêm vào URL
    if (user.country) {
      redirectUrl += `&country=${encodeURIComponent(user.country)}`;
    }

    // Redirect về URL đã xây dựng
    res.redirect(redirectUrl);
  }

  //user
  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Get('user')
  async getUser(@User() userPayload: TokenPayloadInterface) {
    return this.apiGatewayService.getUser(userPayload);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Patch('user/birthday')
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
  @Patch('user/fullname')
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
  @Patch('user/country')
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
  @Post('user/email')
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
  @Patch('user/email/check')
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
  @Patch('user/profile-image')
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
  @Get('user/:userId')
  async getStrangerInfor(@Param() { userId }: GetStrangerInforDto) {
    return this.apiGatewayService.getStrangerInfor(userId);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Patch('user/invite/add')
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
  @Delete('user/invite/remove/:inviteId')
  async sentInvite(
    @User() userPayload: TokenPayloadInterface,
    @Param() dto: RemoveInviteDto,
  ) {
    return this.apiGatewayService.removeInvite(userPayload, dto);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Patch('user/invite/accept/:inviteId')
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
  @Delete('user/friend/delete/:friendId')
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
  @Post('user/delete/check')
  async checkDeleteAccount(@User() userPayload: TokenPayloadInterface) {
    return this.apiGatewayService.checkDeleteAccount(userPayload);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Delete('user')
  async deleteAccount(
    @User() userPayload: TokenPayloadInterface,
    @Body() dto: DeleteAccountDto,
  ) {
    return this.apiGatewayService.deleteAccount(userPayload, dto);
  }

  //feed
  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Post('feed')
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
  @Patch('feed/:feedId')
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
  @Delete('feed/:feedId')
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
  @Post('feed/reaction/:feedId')
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
  @Get('feed/everyone')
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
  @Get('feed/certain/:userId')
  async getCertainUserFeeds(
    @User() userPayload: TokenPayloadInterface,
    @Query() dto: GetCertainUserFeedsDto,
    @Param('userId') userId: string,
  ) {
    return this.apiGatewayService.getCertainUserFeeds(userPayload, dto, userId);
  }

  //message
  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Post('message')
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
  @Patch('message/read')
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
  @Get('message/all')
  async getAllConversations(@User() userPayload: TokenPayloadInterface) {
    return this.apiGatewayService.getAllConversations(userPayload);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Get('message/certain/:friendId')
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
  @Get('statistic')
  async getStatisticInfor() {
    console.log('here');
    return this.apiGatewayService.getStatisticInfor();
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(...ADMIN_ROLE)
  @Get('admin/user/infor/:searchValue')
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
  @Get('admin/feed/:feedId')
  async getFeedByAdmin(@Param() dto: GetFeedByAdminDto) {
    return this.apiGatewayService.getFeedByAdmin(dto);
  }

  //reporting
  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Post('report/user/:userId')
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
  @Post('report/feed/:feedId')
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
  @Get('report/all')
  async getReports() {
    return this.apiGatewayService.getReports();
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(...ADMIN_ROLE)
  @Get('report/user')
  async getMoreUserReports(@Query() dto: GetMoreReportsDto) {
    return this.apiGatewayService.getMoreUserReports(dto);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(...ADMIN_ROLE)
  @Get('report/feed')
  async getMoreFeedReports(@Query() dto: GetMoreReportsDto) {
    return this.apiGatewayService.getMoreFeedReports(dto);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(...ADMIN_ROLE)
  @Get('report/processed/all')
  async getProcessedReports() {
    return this.apiGatewayService.getProcessedReports();
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(...ADMIN_ROLE)
  @Get('report/processed/user')
  async getMoreProcessedUserReports(@Query() dto: GetMoreReportsDto) {
    return this.apiGatewayService.getMoreProcessedUserReports(dto);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(...ADMIN_ROLE)
  @Get('report/processed/feed')
  async getMoreProcessedFeedReports(@Query() dto: GetMoreReportsDto) {
    return this.apiGatewayService.getMoreProcessedFeedReports(dto);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(...ADMIN_ROLE)
  @HttpCode(HttpStatus.OK)
  @Post('report/feed/process/:reportId')
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
  @Post('report/user/process/:reportId')
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
  @Post('admin/account/create')
  async createAdminAccount(@Body() dto: CreateAdminAccountDto) {
    return this.apiGatewayService.createAdminAccount(dto);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(ROOT_ADMIN_ROLE)
  @HttpCode(HttpStatus.OK)
  @Get('admin/account')
  async getAdminList(
    @Query() dto: GetAdminListDto,
    @User() userPayload: TokenPayloadInterface,
  ) {
    return this.apiGatewayService.getAdminList(userPayload, dto);
  }
}
