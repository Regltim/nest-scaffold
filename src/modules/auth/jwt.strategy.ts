import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    // 注入 UserService 用于查询用户信息
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  /**
   * 验证 Token 并注入用户信息
   * payload 是 Token 解码后的数据 { sub: 1, username: 'admin', ... }
   */
  async validate(payload: any) {
    const user = await this.userService.repo().findOne({
      where: { id: payload.sub },
      relations: ['roles'],
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在或已失效');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('用户已被禁用');
    }

    // 2. 返回的数据会被自动挂载到 req.user
    // 这样 RolesGuard 里的 request.user.roles 就有值了
    return {
      userId: user.id,
      username: user.username,
      roles: user.roles, // 👈 把 Entity 里的角色数组传出去
    };
  }
}
