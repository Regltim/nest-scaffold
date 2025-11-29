import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendEmailDto {
  /** 接收邮箱 */
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
