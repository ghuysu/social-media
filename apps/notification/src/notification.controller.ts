import { Controller } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { SendCodeDto } from '@app/common';
import { EmitMessageDto } from './dto/emit-message.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern('send_code_to_check_email')
  async sendCodeToCheckEmail(@Payload() dto: SendCodeDto) {
    this.notificationService.sendCodeToCheckEmail(dto);
  }

  @EventPattern('send_code_to_change_password')
  async sendCodeToChangePassword(@Payload() dto: SendCodeDto) {
    this.notificationService.sendCodeToChangePassword(dto);
  }

  @EventPattern('send_code_to_sign_in_as_admin')
  async sendCodeToSignInAsAdmin(@Payload() dto: SendCodeDto) {
    this.notificationService.sendCodeToSignInAsAdmin(dto);
  }

  @EventPattern('send_code_to_change_email')
  async sendCodeToChangeEmail(@Payload() dto: SendCodeDto) {
    this.notificationService.sendCodeToChangeEmail(dto);
  }

  @EventPattern('send_code_to_delete_account')
  async sendCodeToDeleteAccount(@Payload() dto: SendCodeDto) {
    this.notificationService.sendCodeToDeleteAccount(dto);
  }

  @EventPattern('emit_message')
  async sendMessageToAllClientBySocketIo(@Payload() dto: EmitMessageDto) {
    console.log(dto);
    this.notificationService.sendMessageToAllClientBySocketIo(dto);
  }

  @EventPattern('send_email_for_delete_account')
  async sendMessageForDeleteAccount(@Payload() dto: DeleteAccountDto) {
    this.notificationService.sendEmailForDeleteAccount(dto);
  }
}
