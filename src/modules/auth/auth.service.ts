import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { LoginLogService } from '../system/log/login-log.service';
import { AppRequest } from '../../common/interfaces/app-request.interface'; // 👈 引入

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private jwtService: JwtService,
    @Inject('REDIS_CLIENT') private redis: Redis,
    private config: ConfigService,
    private loginLogService: LoginLogService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findByUsername(username);
    if (!user) return null;
    const isMatch = await bcrypt.compare(pass, user.password);
    if (user && isMatch) {
      delete user.password;
      return user;
    }
    return null;
  }

  /**
   * 登录
   */
  async login(req: AppRequest, user: any) {
    // 👈 指定 req 类型
    if (!user) {
      this.loginLogService.create(
        req,
        user?.username || '未知',
        0,
        '账号或密码错误',
      );
      throw new Error('账号或密码错误');
    }

    this.loginLogService.create(req, user.username, 1, '登录成功');
    const payload = {
      username: user.username,
      sub: user.id,
    };

    const expiresIn = 604800;
    const token = this.jwtService.sign(payload);

    await this.redis.set(
      `online_token:${token}`,
      JSON.stringify({
        id: user.id,
        username: user.username,
        ip: req.ip,
        loginTime: new Date(),
      }),
      'EX',
      expiresIn,
    );
    return {
      access_token: token,
      token_type: 'Bearer',
      expires_in: expiresIn,
    };
  }

  async register(createUserDto: any) {
    const exist = await this.userService.findByUsername(createUserDto.username);
    if (exist) throw new BadRequestException('用户已存在');
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    return await this.userService.create({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  async getProfile(userId: number) {
    return this.userService.findProfile(userId);
  }

  async logout(token: string) {
    await this.redis.set(`blacklist:${token}`, 'true', 'EX', 604800);
    await this.redis.del(`online_token:${token}`);
    return { msg: '退出成功' };
  }

  async changePassword(userId: number, oldPass: string, newPass: string) {
    const user = await this.userService.findOne(userId);
    const userWithPass = await this.userService.findByUsername(user.username);

    const isMatch = await bcrypt.compare(oldPass, userWithPass.password);
    if (!isMatch) throw new BadRequestException('旧密码错误');

    const hashedPassword = await bcrypt.hash(newPass, 10);
    await this.userService.update(userId, { password: hashedPassword });
    return { msg: '密码修改成功' };
  }

  async resetPassword(email: string, code: string, newPass: string) {
    const cacheCode = await this.redis.get(`captcha:email:${email}`);
    if (!cacheCode || cacheCode !== code) {
      throw new BadRequestException('验证码错误或已过期');
    }

    const user = await this.userService.repo().findOne({ where: { email } });
    if (!user) throw new BadRequestException('该邮箱未绑定账号');

    const hashedPassword = await bcrypt.hash(newPass, 10);
    await this.userService.update(user.id, { password: hashedPassword });
    await this.redis.del(`captcha:email:${email}`);
    return { msg: '密码重置成功' };
  }
}
