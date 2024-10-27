import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendCodeDto } from '@app/common';
import { EmitMessageDto } from './dto/emit-message.dto';
import { SocketGateway } from './gateways/socket-io.gateway';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { SendEmailForFeedViolatingDto } from './dto/send-email-for-feed-violating.dto';
import { SendEmailForUserViolatingDto } from './dto/send-email-for-user-violating.dto';

@Injectable()
export class NotificationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly socketGateway: SocketGateway,
  ) {}

  private transporter: nodemailer.Transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: this.configService.get('SMTP_USER'),
      pass: this.configService.get('SMTP_PASSWORD'),
    },
  });

  async sendEmail(subject: string, html: string, email: string) {
    await this.transporter.sendMail({
      from: this.configService.get('SMTP_USER'),
      to: email,
      subject: subject,
      html: html,
    });
    return;
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

    await this.sendEmail(subject, html, email);
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

    await this.sendEmail(subject, html, email);
  }

  async sendCodeToSignInAsAdmin({ email, code }: SendCodeDto) {
    console.log('send email successfully');

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

    await this.sendEmail(subject, html, email);
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

    await this.sendEmail(subject, html, email);
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

    await this.sendEmail(subject, html, email);
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

    await this.sendEmail(subject, html, email);
  }

  async sendEmailForFeedViolating({
    fullname,
    email,
    numberOfViolating,
    reason,
    feedId,
  }: SendEmailForFeedViolatingDto) {
    let actionMessage = '';
    let reasonText = '';
    let warningMessage = '';

    // Xử lý số lần vi phạm
    if (numberOfViolating === 1) {
      actionMessage =
        'This is a <strong style="color: #FFA500;">warning</strong> regarding your recent activity.';
      warningMessage =
        'If you violate again, your account will be <strong>suspended for 10 days</strong>.';
    } else if (numberOfViolating === 2) {
      actionMessage =
        'Your account has been <strong style="color: #FF4500;">suspended for 10 days</strong> due to repeated violations.';
      warningMessage =
        'If you violate again, your account will be <strong>suspended for 20 days</strong>.';
    } else if (numberOfViolating === 3) {
      actionMessage =
        'Your account has been <strong style="color: #FF4500;">suspended for 20 days</strong> due to repeated violations.';
      warningMessage =
        'If you violate again, your account will be <strong>permanently deleted</strong>.';
    } else if (numberOfViolating > 3) {
      actionMessage =
        'Your account has been <strong style="color: #FF0000;">permanently deleted</strong> due to excessive violations.';
      warningMessage =
        'There is no further action as your account has been deleted.';
    }

    // Xử lý các lý do vi phạm
    if (reason['sensitive_image'] > 0) {
      reasonText += `<li>Sensitive images: <strong>${reason['sensitive_image']} times</strong></li>`;
    }
    if (reason['inappropriate_words'] > 0) {
      reasonText += `<li>Inappropriate language: <strong>${reason['inappropriate_words']} times</strong></li>`;
    }

    const subject = 'Notification Regarding Your Account Activity';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="text-align: center; color: #FF0000;">Action Required: Feed Violation</h2>
        <p>Hello <strong>${fullname}</strong>,</p>
        <p>This email is to inform you that your feed (ID: <strong>${feedId}</strong>) has violated our community guidelines.</p>
        <p>The following issues were detected:</p>
        <ul style="color: #FF4500;">
          ${reasonText || '<li>No specific details provided.</li>'}
        </ul>
        <p style="font-size: 16px; color: #333;">${actionMessage}</p>
        <p style="font-size: 14px; color: #FF0000;">${warningMessage}</p>
        <hr>
        <p style="font-size: 14px; color: #333;">
          Please be aware that we apply penalties based on the number of violations you commit. The penalty structure is as follows:
        </p>
        <ul style="font-size: 14px; color: #333;">
          <li><strong>First violation</strong>: Warning</li>
          <li><strong>Second violation</strong>: Account suspension for 10 days</li>
          <li><strong>Third violation</strong>: Account suspension for 20 days</li>
          <li><strong>More than three violations</strong>: Permanent account deletion</li>
        </ul>
        <p>If you believe this is a mistake, please contact our support team immediately.</p>
        <p>Thank you for your understanding and cooperation.</p>
        <p>Best regards,</p>
        <p>The Support Team</p>
      </div>
    `;

    await this.sendEmail(subject, html, email);
  }

  async sendEmailForUserViolating({
    fullname,
    email,
    numberOfViolating,
    reason,
  }: SendEmailForUserViolatingDto) {
    let actionMessage = '';
    let reasonText = '';
    let warningMessage = '';

    // Xử lý số lần vi phạm
    if (numberOfViolating === 1) {
      actionMessage =
        'This is a <strong style="color: #FFA500;">warning</strong> regarding your recent activity.';
      warningMessage =
        'If you violate again, your account will be <strong>suspended for 10 days</strong>.';
    } else if (numberOfViolating === 2) {
      actionMessage =
        'Your account has been <strong style="color: #FF4500;">suspended for 10 days</strong> due to repeated violations.';
      warningMessage =
        'If you violate again, your account will be <strong>suspended for 20 days</strong>.';
    } else if (numberOfViolating === 3) {
      actionMessage =
        'Your account has been <strong style="color: #FF4500;">suspended for 20 days</strong> due to repeated violations.';
      warningMessage =
        'If you violate again, your account will be <strong>permanently deleted</strong>.';
    } else if (numberOfViolating > 3) {
      actionMessage =
        'Your account has been <strong style="color: #FF0000;">permanently deleted</strong> due to excessive violations.';
      warningMessage =
        'There is no further action as your account has been deleted.';
    }

    // Xử lý các lý do vi phạm
    if (reason['post_inappropriate_feeds'] > 0) {
      reasonText += `<li>Posting inappropriate feeds: <strong>${reason['post_inappropriate_feeds']} times</strong></li>`;
    }
    if (reason['offend_others'] > 0) {
      reasonText += `<li>Offending others: <strong>${reason['offend_others']} times</strong></li>`;
    }

    const subject = 'Notification Regarding Your Account Activity';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="text-align: center; color: #FF0000;">Action Required: User Violation</h2>
        <p>Hello <strong>${fullname}</strong>,</p>
        <p>This email is to inform you that your account has violated our community guidelines.</p>
        <p>The following issues were detected:</p>
        <ul style="color: #FF4500;">
          ${reasonText || '<li>No specific details provided.</li>'}
        </ul>
        <p style="font-size: 16px; color: #333;">${actionMessage}</p>
        <p style="font-size: 14px; color: #FF0000;">${warningMessage}</p>
        <hr>
        <p style="font-size: 14px; color: #333;">
          Please be aware that we apply penalties based on the number of violations you commit. The penalty structure is as follows:
        </p>
        <ul style="font-size: 14px; color: #333;">
          <li><strong>First violation</strong>: Warning</li>
          <li><strong>Second violation</strong>: Account suspension for 10 days</li>
          <li><strong>Third violation</strong>: Account suspension for 20 days</li>
          <li><strong>More than three violations</strong>: Permanent account deletion</li>
        </ul>
        <p>If you believe this is a mistake, please contact our support team immediately.</p>
        <p>Thank you for your understanding and cooperation.</p>
        <p>Best regards,</p>
        <p>The Support Team</p>
      </div>
    `;

    await this.sendEmail(subject, html, email);
  }

  async sendMessageToAllClientBySocketIo({ name, payload }: EmitMessageDto) {
    this.socketGateway.sendMessageToAllClient(name, payload);
  }
}
