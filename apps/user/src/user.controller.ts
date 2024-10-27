import { UserService } from './user.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { GetStrangerInforDto, TokenPayloadInterface } from '@app/common';
import {
  // Body,
  Controller,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ChangeBirthdayInterface } from './interfaces/change-birthday.interface';
import { ChangeFullnameInterface } from './interfaces/change-fullname.interface';
import { ChangeCountryInterface } from './interfaces/change-country.interface';
import { ChangeEmailInterface } from './interfaces/change-email.interface';
import { CheckCodeToChangeEmailInterface } from './interfaces/check-code-to-change-email.interface';
import { ChangeProfileImageInterface } from './interfaces/change-profile-image.interface';
import { SendInviteInterface } from './interfaces/send-invite.interface';
import { RemoveInviteInterface } from './interfaces/remove-invite.interface';
import { DeleteFriendInterface } from './interfaces/delete-friend.interface';
import { DeleteAccountInterface } from './interfaces/delete-account.interface';
import { GetUserInforByAdminWithIdInterface } from './interfaces/get-user-infor-by-admin-with-id.interface';
import { GetUserInforByAdminWithEmailInterface } from './interfaces/get-user-infor-by-admin-with-email.interface';
import { GetListOfUserInforDto } from './dto/get-list-of-user-infor.dto';
import { UpdateUserForFeedViolatingDto } from './dto/update-user-for-feed-violating.dto';
import { UpdateUserForUserViolatingDto } from './dto/update-user-for-user-violating.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('get_user')
  async getUser(@Payload() userPayload: TokenPayloadInterface) {
    try {
      const account = await this.userService.getUser(userPayload);
      return {
        status: HttpStatus.OK,
        message: 'Get user information successfully.',
        metadata: account,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('change_birthday')
  async changeBirthday(
    @Payload()
    { birthdayPayload, userPayload }: ChangeBirthdayInterface,
  ) {
    try {
      const account = await this.userService.changeBirthday(
        userPayload,
        birthdayPayload,
      );
      return {
        status: HttpStatus.OK,
        message: 'Changed birthday successfully.',
        metadata: account,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('change_fullname')
  async changeFullname(
    @Payload()
    { fullnamePayload, userPayload }: ChangeFullnameInterface,
  ) {
    try {
      const account = await this.userService.changeFullname(
        userPayload,
        fullnamePayload,
      );
      return {
        status: HttpStatus.OK,
        message: 'Changed fullname successfully.',
        metadata: account,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('change_country')
  async changeCountry(
    @Payload()
    { countryPayload, userPayload }: ChangeCountryInterface,
  ) {
    try {
      const account = await this.userService.changeCountry(
        userPayload,
        countryPayload,
      );
      return {
        status: HttpStatus.OK,
        message: 'Changed country successfully.',
        metadata: account,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('change_email')
  async changeEmail(
    @Payload()
    { emailPayload, userPayload }: ChangeEmailInterface,
  ) {
    try {
      await this.userService.changeEmail(userPayload, emailPayload);
      return {
        status: HttpStatus.OK,
        message: 'Sent code to change email successfully.',
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('check_code_to_change_email')
  async checkCodeToChangeEmail(
    @Payload()
    { payload, userPayload }: CheckCodeToChangeEmailInterface,
  ) {
    try {
      const result = await this.userService.checkCodeToChangeEmail(
        userPayload,
        payload,
      );
      return {
        status: HttpStatus.OK,
        message: 'Changed email successfully.',
        metadata: result,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('change_profile_image')
  async changeProfileImage(
    @Payload()
    { image, originalname, userPayload }: ChangeProfileImageInterface,
  ) {
    try {
      const accountInfor = await this.userService.changeProfileImage(
        userPayload,
        image,
        originalname,
      );
      return {
        status: HttpStatus.OK,
        message: 'Changed profile image successfully.',
        metadata: accountInfor,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('get_stranger_infor')
  async getStrangerInfor(@Payload() { userId }: GetStrangerInforDto) {
    try {
      const accountInfor = await this.userService.getStrangerInfor(userId);
      return {
        status: HttpStatus.OK,
        message: 'Get stranger information successfully.',
        metadata: accountInfor,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('send_invite')
  async sendInvtie(@Payload() { payload, userPayload }: SendInviteInterface) {
    try {
      const result = await this.userService.sendInvite(userPayload, payload);
      return {
        status: HttpStatus.OK,
        message: 'Sent invite successfully.',
        metadata: result,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('remove_invite')
  async removeInvtie(
    @Payload() { payload, userPayload }: RemoveInviteInterface,
  ) {
    try {
      const result = await this.userService.removeInvite(userPayload, payload);
      return {
        status: HttpStatus.OK,
        message: 'Remove invite successfully.',
        metadata: result,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('accept_invite')
  async acceptInvtie(
    @Payload() { payload, userPayload }: RemoveInviteInterface,
  ) {
    try {
      const result = await this.userService.acceptInvite(userPayload, payload);
      return {
        status: HttpStatus.OK,
        message: 'Accepted invite successfully.',
        metadata: result,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('delete_friend')
  async deleteFriend(
    @Payload() { payload, userPayload }: DeleteFriendInterface,
  ) {
    try {
      const result = await this.userService.deleteFriend(userPayload, payload);
      return {
        status: HttpStatus.OK,
        message: 'Delete friend successfully.',
        metadata: result,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('check_delete_account')
  async checkDeleteFriend(
    @Payload('userPayload') userPayload: TokenPayloadInterface,
  ) {
    try {
      const result =
        await this.userService.checkEmailToDeleteAccount(userPayload);
      return {
        status: HttpStatus.OK,
        message: 'Sent code to delete account successfully.',
        metadata: result,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('delete_account')
  async deleteAccount(
    @Payload() { userPayload, payload }: DeleteAccountInterface,
  ) {
    try {
      await this.userService.deleteAccount(userPayload, payload);
      return {
        status: HttpStatus.OK,
        message: 'Delete account successfully.',
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  //admin
  @MessagePattern('get_user_infor_by_admin_with_id')
  async getUserInforByAdminWithId(
    @Payload() { searchValue: userId }: GetUserInforByAdminWithIdInterface,
  ) {
    try {
      const result = await this.userService.getUserInforByAdminWithId(userId);
      return result;
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('get_user_infor_by_admin_with_email')
  async getUserInforByAdminWithEmail(
    @Payload() { searchValue: email }: GetUserInforByAdminWithEmailInterface,
  ) {
    try {
      const result = await this.userService.getUserInforByAdminWithEmail(email);
      return result;
    } catch (error) {
      return this.handleError(error);
    }
  }

  @MessagePattern('get_list_of_user_infor')
  async getListOfUserInfor(@Payload() dto: GetListOfUserInforDto) {
    return await this.userService.getListOfUserInfor(dto);
  }

  @EventPattern('feed_violating')
  async updateUserForFeedViolating(
    @Payload() dto: UpdateUserForFeedViolatingDto,
  ) {
    await this.userService.updateUserForFeedViolating(dto);
  }

  @EventPattern('user_violating')
  async updateUserForUserViolating(
    @Payload() dto: UpdateUserForUserViolatingDto,
  ) {
    await this.userService.updateUserForUserViolating(dto);
  }

  private handleError(error: any) {
    console.log(error);
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
