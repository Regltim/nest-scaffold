import {
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Redis } from 'ioredis';
import { ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    @Inject('REDIS_CLIENT') private redis: Redis,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. 检查 @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // 2. 检查 Redis 动态白名单
    const request = context.switchToHttp().getRequest();
    const path = request.path;
    const isDynamicWhite = await this.redis.sismember('auth:whitelist', path);
    if (isDynamicWhite) return true;

    // 3. ✅ 新增：检查 Token 黑名单 (实现安全退出)
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
    if (token) {
      const isBlacklisted = await this.redis.get(`blacklist:${token}`);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token 已失效，请重新登录');
      }
    }

    // 4. 执行默认 JWT 校验
    return super.canActivate(context) as Promise<boolean>;
  }
}
