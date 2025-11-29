import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. 获取目标接口上标记的 roles
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 2. 如果接口没加 @Roles 装饰器，则直接放行
    if (!requiredRoles) {
      return true;
    }

    // 3. 获取 Request 对象（经过 JwtAuthGuard 解析后的）
    const { user } = context.switchToHttp().getRequest();

    // ⚠️ 关键点：JWT 解析出来的 user 对象里必须包含 roles 字段
    // 如果 user 不存在或者没有 roles，说明可能没登录或者 Token 里没带角色信息
    if (!user || !user.roles) {
      // 这里我们可以简单处理：如果用户没有角色信息，拒绝访问
      return false;
    }

    // 4. 判断用户拥有的角色中，是否包含接口要求的任意一个角色
    // 假设 user.roles 是一个字符串数组 ['admin'] 或者是对象数组 [{name: 'admin'}]，请根据实际情况调整
    // 这里假设 user.roles 是简单的字符串数组，或者我们在 JWT Strategy 里处理成了字符串数组
    return requiredRoles.some((role) => {
      // 如果 roles 是对象数组 (TypeORM 查询出来的默认结构)，需要取 code 或 name
      if (typeof user.roles[0] === 'object') {
        return user.roles.some((r) => r.code === role || r.name === role);
      }
      // 如果 roles 已经是字符串数组
      return user.roles.includes(role);
    });
  }
}