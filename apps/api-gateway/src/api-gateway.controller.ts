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
import {
  CreateFeedDto,
  ReactFeedDto,
  UpdateFeedDto,
} from '@app/common/dto/feed-dto';

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
  @Get(':userId')
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
  async getEveryoneFeeds(@User() userPayload: TokenPayloadInterface) {
    return this.apiGatewayService.getEveryoneFeeds(userPayload);
  }

  @UseGuards(RoleGuard)
  @UseGuards(JwtGuard)
  @UseGuards(ApiKeyGuard)
  @Roles(NORMAL_USER_ROLE)
  @Get('feed/certain/:userId')
  async getCertainUserFeeds(
    @User() userPayload: TokenPayloadInterface,
    @Param('userId') userId: string,
  ) {
    return this.apiGatewayService.getCertainUserFeeds(userPayload, userId);
  }
}
