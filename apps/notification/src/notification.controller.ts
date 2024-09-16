import { Controller } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import {
  SendCodeCheckEmailDto,
  SendCodeToChangePasswordDto,
} from '@app/common';
import { EmitMessageDto } from './dto/emit-message.dto';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern('send_code_to_check_email')
  async sendCodeToCheckEmail(@Payload() dto: SendCodeCheckEmailDto) {
    this.notificationService.sendCodeToCheckEmail(dto);
  }

  @EventPattern('send_code_to_change_password')
  async sendCodeToChangePassword(@Payload() dto: SendCodeToChangePasswordDto) {
    this.notificationService.sendCodeToChangePassword(dto);
  }

  @EventPattern('send_code_to_sign_in_as_admin')
  async sendCodeToSignInAsAdmin(@Payload() dto: SendCodeToChangePasswordDto) {
    this.notificationService.sendCodeToSignInAsAdmin(dto);
  }

  @EventPattern('emit_message')
  async sendMessageToAllClientBySocketIo(@Payload() dto: EmitMessageDto) {
    this.notificationService.sendMessageToAllClientBySocketIo(dto);
  }
}
