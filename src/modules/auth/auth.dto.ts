import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  /** 用户名 */
  @IsString()
  @IsNotEmpty()
  username: string;

  /** 密码 */
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterDto extends LoginDto {
  /** 昵称 (可选) */
  @IsString()
  @IsOptional()
  nickname?: string;
}

export class ResetPasswordDto {
  /** 邮箱 */
  @IsEmail()
  email: string;

  /** 验证码 */
  @IsString()
  code: string;

  /** 新密码 */
  @IsString()
  newPass: string;
}

export class SwaggerLoginDto {
  /** 用户名 */
  @IsString()
  username: string;
  /** 密码 */
  @IsString()
  password: string;
  // Swagger 可能会传其他字段，但我们只验证这两个
}
