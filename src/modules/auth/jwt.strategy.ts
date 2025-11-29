import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // 这里返回的对象，就是 Controller 里 @Request() req.user 的内容
    // 也是 RolesGuard 里 context.switchToHttp().getRequest().user 的内容
    return {
      userId: payload.sub,
      username: payload.username,
      // 👇 假设 Payload 里存了 roles，或者你需要在这里查数据库获取 roles
      roles: payload.roles || [],
    };
  }
}
