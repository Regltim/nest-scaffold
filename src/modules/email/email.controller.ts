import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from './email.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SendEmailDto } from './email.dto'; // 👈

@ApiTags('邮件服务')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @ApiOperation({ summary: '发送验证码' })
  async send(@Body() dto: SendEmailDto) {
    // 👈 替换 any
    return this.emailService.sendCode(dto.email);
  }
}
