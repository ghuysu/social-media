import {
  ChangePasswordDto,
  CheckEmailDto,
  CreateNormalUserDto,
  GoogleSignInDto,
  SignInDto,
} from '@app/common';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';
import { CheckCodeDto } from '@app/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { GoogleSignInInforInterface } from './interfaces/google-sign-in-infor.interface';
import { ApiKeyGuard } from './guards/api-key.guard';

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
    const signInUser: GoogleSignInDto = req.user;

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
}
