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

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private jwtService: JwtService,
    @Inject('REDIS_CLIENT') private redis: Redis,
    private config: ConfigService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findByUsername(username);
    if (!user) return null;
    const isMatch = await bcrypt.compare(pass, user.password);
    if (user && isMatch) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * ✅ 升级：返回标准 OAuth2 响应结构
   */
  async login(user: any) {
    const payload = {
      username: user.username,
      sub: user.id,
      // 可以在这里把角色放进 Token，这样 Guard 校验时不用查库 (可选)
      // roles: user.roles?.map(r => r.code) || []
    };

    // 假设过期时间是 7 天 (秒数)
    const expiresIn = 60 * 60 * 24 * 7;

    return {
      access_token: this.jwtService.sign(payload),
      token_type: 'Bearer', // 👈 标准字段
      expires_in: expiresIn, // 👈 标准字段 (秒)
      // refresh_token: '...' // 如果以后做了刷新Token，放在这里
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
    // 设置 Token 黑名单，时间与有效期一致
    await this.redis.set(`blacklist:${token}`, 'true', 'EX', 604800);
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
