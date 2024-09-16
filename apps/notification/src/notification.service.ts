import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import {
  SendCodeCheckEmailDto,
  SendCodeToChangePasswordDto,
} from '@app/common';
import { EmitMessageDto } from './dto/emit-message.dto';
import { SocketGateway } from './gateways/socket-io.gateway';

@Injectable()
export class NotificationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly socketGateway: SocketGateway,
  ) {}

  private readonly transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: this.configService.get('SMTP_USER'),
      clientId: this.configService.get('GOOGLE_OAUTH_CLIENT_ID'),
      clientSecret: this.configService.get('GOOGLE_OAUTH_CLIENT_SECRET'),
      refreshToken: this.configService.get('GOOGLE_OAUTH_REFRESH_TOKEN'),
    },
  });

  async sendCodeToCheckEmail({ email, code }: SendCodeCheckEmailDto) {
    const subject = 'Verify Your Email Address';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="text-align: center; color: #4CAF50;">Verify Your Email Address</h2>
        <p>Hello,</p>
        <p>Thank you for registering with us. To confirm that this email address belongs to you, please use the verification code below:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 24px; font-weight: bold; color: #333; background-color: #f0f0f0; padding: 10px 20px; border-radius: 5px;">${code}</span>
        </div>
        <p>Please enter this code to complete your account verification.</p>
        <p>If you did not request this, you can safely ignore this email or contact our support team.</p>
        <p>Best regards,</p>
        <p>The Support Team</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.configService.get('SMTP_USER'),
      to: email,
      subject,
      html,
    });
  }

  async sendCodeToChangePassword({ email, code }: SendCodeToChangePasswordDto) {
    const subject = 'Change Your Password';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="text-align: center; color: #4CAF50;">Change Your Password</h2>
        <p>Hello,</p>
        <p>Thank you for being with us. To confirm that you want to change your password, please use the verification code below:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 24px; font-weight: bold; color: #333; background-color: #f0f0f0; padding: 10px 20px; border-radius: 5px;">${code}</span>
        </div>
        <p>Please enter this code to complete your changing password verification.</p>
        <p>If you did not request this, you can safely ignore this email or contact our support team.</p>
        <p>Best regards,</p>
        <p>The Support Team</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.configService.get('SMTP_USER'),
      to: email,
      subject,
      html,
    });
  }

  async sendCodeToSignInAsAdmin({ email, code }: SendCodeToChangePasswordDto) {
    const subject = 'Sign In As Admin';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="text-align: center; color: #4CAF50;">Sign In As Admin</h2>
        <p>Hello,</p>
        <p>Thank you for being with us. To confirm that you want to sign in your account, please use the verification code below:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 24px; font-weight: bold; color: #333; background-color: #f0f0f0; padding: 10px 20px; border-radius: 5px;">${code}</span>
        </div>
        <p>Please enter this code to complete your sign in verification.</p>
        <p>If you did not request this, you can safely ignore this email or contact our support team.</p>
        <p>Best regards,</p>
        <p>The Support Team</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.configService.get('SMTP_USER'),
      to: email,
      subject,
      html,
    });
  }

  async sendMessageToAllClientBySocketIo({ name, payload }: EmitMessageDto) {
    this.socketGateway.sendMessageToAllClient(name, payload);
  }
}
