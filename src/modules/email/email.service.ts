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
    // 1. 优先读取配置文件的端口，默认 465
    const port = this.config.get<number>('MAIL_PORT', 465);

    // 2. 动态判断 secure
    // 126邮箱：25端口用 secure:false, 465端口用 secure:true
    const secure = port === 465;

    this.transporter = nodemailer.createTransport({
      host: this.config.get('MAIL_HOST'),
      port: port,
      secure: secure,
      auth: {
        user: this.config.get('MAIL_USER'),
        pass: this.config.get('MAIL_PASS'),
      },
    });
  }

  async sendCode(email: string) {
    const code = Math.random().toString().slice(-6);
    // 存入 Redis，5分钟过期
    await this.redis.set(`captcha:email:${email}`, code, 'EX', 300);

    await this.transporter.sendMail({
      from: this.config.get('MAIL_FROM'),
      to: email,
      subject: '【Nest Admin】验证码',
      html: `<p>您的验证码是：<strong>${code}</strong></p><p>5分钟内有效。</p>`,
    });
    return { msg: '发送成功' };
  }
}
