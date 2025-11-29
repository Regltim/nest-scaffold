import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  SwaggerLoginDto,
} from './auth.dto';
import { AppRequest } from '../../common/interfaces/app-request.interface'; // 👈 引入

@ApiTags('认证模块')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  // ✅ 使用 AppRequest
  async login(@Body() dto: LoginDto, @Request() req: AppRequest) {
    const user = await this.authService.validateUser(
      dto.username,
      dto.password,
    );
    if (!user) throw new Error('账号或密码错误');
    return this.authService.login(req, user);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  // ✅ 使用 AppRequest，可以直接点出 req.user.userId
  async getProfile(@Request() req: AppRequest) {
    return this.authService.getProfile(req.user.userId);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: '退出登录' })
  async logout(@Headers('authorization') auth: string) {
    if (auth) {
      const token = auth.replace('Bearer ', '');
      return this.authService.logout(token);
    }
    return { msg: '退出成功' };
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: '邮箱验证码重置密码' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.email, dto.code, dto.newPass);
  }

  @Public()
  @Post('swagger/login')
  @ApiOperation({ summary: 'Swagger文档登录接口' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @UseInterceptors(FileInterceptor(''))
  // ✅ 使用 AppRequest
  async swaggerLogin(@Body() dto: SwaggerLoginDto, @Request() req: AppRequest) {
    const user = await this.authService.validateUser(
      dto.username,
      dto.password,
    );
    if (!user) throw new Error('账号或密码错误');
    return this.authService.login(req, user);
  }
}
