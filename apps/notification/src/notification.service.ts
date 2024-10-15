import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendCodeDto } from '@app/common';
import { EmitMessageDto } from './dto/emit-message.dto';
import { SocketGateway } from './gateways/socket-io.gateway';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class NotificationService {
  private accessToken: string;
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly socketGateway: SocketGateway,
  ) {
    this.initializeOAuth2Client();
  }

  private async initializeOAuth2Client() {
    const myOAuth2Client = new OAuth2Client(
      this.configService.get('GOOGLE_OAUTH_CLIENT_ID'),
      this.configService.get('GOOGLE_OAUTH_CLIENT_SECRET'),
    );

    myOAuth2Client.setCredentials({
      refresh_token: this.configService.get('GOOGLE_OAUTH_REFRESH_TOKEN'),
    });

    // Lấy accessToken và khởi tạo transporter sau khi accessToken đã được lấy
    const accessTokenResponse = await myOAuth2Client.getAccessToken();
    this.accessToken = accessTokenResponse.token;

    // Khởi tạo transporter
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: this.configService.get('SMTP_USER'),
        clientId: this.configService.get('GOOGLE_OAUTH_CLIENT_ID'),
        clientSecret: this.configService.get('GOOGLE_OAUTH_CLIENT_SECRET'),
        refreshToken: this.configService.get('GOOGLE_OAUTH_REFRESH_TOKEN'),
        accessToken: this.accessToken, // Truyền accessToken đã lấy được
      },
    });
  }

  async sendCodeToCheckEmail({ email, code }: SendCodeDto) {
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

  async sendCodeToChangePassword({ email, code }: SendCodeDto) {
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

  async sendCodeToSignInAsAdmin({ email, code }: SendCodeDto) {
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

  async sendCodeToChangeEmail({ email, code }: SendCodeDto) {
    const subject = 'Change Your Email';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="text-align: center; color: #4CAF50;">Change Your Email</h2>
        <p>Hello,</p>
        <p>Thank you for being with us. To confirm that you want to change your email, please use the verification code below:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 24px; font-weight: bold; color: #333; background-color: #f0f0f0; padding: 10px 20px; border-radius: 5px;">${code}</span>
        </div>
        <p>Please enter this code to complete your changing verification.</p>
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

  async sendCodeToDeleteAccount({ email, code }: SendCodeDto) {
    const subject = 'Account Deletion Confirmation Code';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="text-align: center; color: #FF0000;">Confirm Account Deletion</h2>
        <p>Hello,</p>
        <p>We received a request to delete the account associated with <strong>${email}</strong>. To confirm that you want to proceed with deleting your account, please use the verification code below:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 24px; font-weight: bold; color: #333; background-color: #f0f0f0; padding: 10px 20px; border-radius: 5px;">${code}</span>
        </div>
        <p>Please enter this code to complete the deletion process. If you did not request this, you can safely ignore this email or contact our support team for assistance.</p>
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

  async sendEmailForDeleteAccount({ email }: DeleteAccountDto) {
    const subject = 'Your Account Has Been Deleted';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="text-align: center; color: #FF0000;">Account Deletion Confirmation</h2>
        <p>Hello,</p>
        <p>We're sorry to see you go. This email is to confirm that your account associated with <strong>${email}</strong> has been permanently deleted from our system.</p>
        <p>If you did not request to delete your account or believe this was a mistake, please contact our support team immediately for assistance.</p>
        <p>Once again, thank you for being a part of our community.</p>
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
