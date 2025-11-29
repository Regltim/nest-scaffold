import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Redis } from 'ioredis';

@Injectable()
export class EmailService {
  private transporter;

  constructor(
    private config: ConfigService,
    @Inject('REDIS_CLIENT') private redis: Redis,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('MAIL_HOST'),
      port: 465,
      secure: true,
      auth: {
        user: this.config.get('MAIL_USER'),
        pass: this.config.get('MAIL_PASS'),
      },
    });
  }

  async sendCode(email: string) {
    const code = Math.random().toString().slice(-6);
    // 存入 Redis，5分钟过期
    await this.redis.set(`captcha:${email}`, code, 'EX', 300);

    await this.transporter.sendMail({
      from: this.config.get('MAIL_FROM'),
      to: email,
      subject: '验证码',
      html: `您的验证码是: <b>${code}</b>`,
    });
    return { msg: '发送成功' };
  }
}
