import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
@Injectable()
export class MailService {
  private resend: Resend;


  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get('EMAIL_TOKEN')); 

  }

  async sendUserCredentials(email: string, password: string, firstName: string): Promise<void> {
    const mailOptions = {
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Welcome - Your Account Details',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Our Learning Platform!</h2>
          <p>Hello ${firstName},</p>
          <p>Your account has been created successfully. Here are your login details:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
          </div>
          <p>Best regards,<br>LMS SOLUTION</p>
        </div>
      `,
    };

    try {
      await this.resend.emails.send(mailOptions);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }
}