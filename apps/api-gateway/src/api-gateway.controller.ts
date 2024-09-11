import {
  ChangePasswordDto,
  CheckEmailDto,
  CreateNormalUserDto,
  SignInDto,
} from '@app/common';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';
import { CheckCodeDto } from '@app/common/dto/auth-dto/check-code.dto';

@Controller('api')
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  //sign up
  @Post('user/check')
  @HttpCode(HttpStatus.OK)
  async checkEmail(@Body() dto: CheckEmailDto) {
    return this.apiGatewayService.checkEmail(dto);
  }

  @Post('user/sign-up')
  @HttpCode(HttpStatus.CREATED)
  async checkCodeForSignUp(@Body() dto: CreateNormalUserDto) {
    console.log(dto);
    return this.apiGatewayService.checkCodeForSignUp(dto);
  }

  //change password
  @Post('password/check')
  @HttpCode(HttpStatus.OK)
  async checkEmailForChangePassword(@Body() dto: CheckEmailDto) {
    return this.apiGatewayService.checkEmailForChangePassword(dto);
  }

  @Patch('password')
  @HttpCode(HttpStatus.OK)
  async checkCodeForChangePassword(@Body() dto: ChangePasswordDto) {
    return this.apiGatewayService.checkCodeForChangePassword(dto);
  }

  //sign in
  @Post('user/sign-in')
  @HttpCode(HttpStatus.OK)
  async signinAsUser(@Body() dto: SignInDto) {
    return this.apiGatewayService.signinAsUser(dto);
  }

  @Post('admin/sign-in')
  @HttpCode(HttpStatus.OK)
  async signinAsAdmin(@Body() dto: SignInDto) {
    return this.apiGatewayService.signinAsAdmin(dto);
  }

  @Post('admin/check')
  @HttpCode(HttpStatus.OK)
  async checkCodeToSignInAsAdmin(@Body() dto: CheckCodeDto) {
    return this.apiGatewayService.checkCodeToSignInAsAdmin(dto);
  }
}
