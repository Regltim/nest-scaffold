import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { DATA_SCOPE_KEY } from '../decorators/data-scope.decorator';
import { UserService } from '../../modules/user/user.service';

@Injectable()
export class DataScopeInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService, // 用于查用户详情
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const handler = context.getHandler();
    const meta = this.reflector.get(DATA_SCOPE_KEY, handler);
    if (!meta) return next.handle(); // 没加装饰器，放行

    const request = context.switchToHttp().getRequest();
    const { user } = request;
    if (!user || !user.userId) return next.handle();

    // Admin 不受限
    if (user.username === 'admin') return next.handle();

    // 获取用户完整信息（含角色、部门、自定义部门权限）
    const userInfo = await this.userService.findUserWithRolesAndDepts(
      user.userId,
    );
    const { deptAlias, userAlias } = meta;
    let sqlParts = [];

    for (const role of userInfo.roles) {
      const ds = role.dataScope;
      if (ds === '1') {
        // 全部数据
        sqlParts = []; // 清空条件，看所有
        break;
      } else if (ds === '2') {
        // 自定
        const deptIds = role.depts.map((d) => d.id).join(',');
        if (deptIds) sqlParts.push(`${deptAlias}.id IN (${deptIds})`);
      } else if (ds === '3') {
        // 本部门
        if (userInfo.deptId)
          sqlParts.push(`${deptAlias}.id = ${userInfo.deptId}`);
      } else if (ds === '4') {
        // 本部门及以下
        // 简化版：暂同本部门。实际需配合 ancestors 字段做 LIKE 查询
        if (userInfo.deptId)
          sqlParts.push(`${deptAlias}.id = ${userInfo.deptId}`);
      } else if (ds === '5') {
        // 仅本人
        sqlParts.push(`${userAlias}.id = ${userInfo.id}`);
      }
    }

    // 注入 SQL 到 query 中，供 Service 使用
    if (sqlParts.length > 0) {
      request.query.dataScopeSql = `(${sqlParts.join(' OR ')})`;
    } else {
      // 没有任何权限，生成 1=0
      request.query.dataScopeSql = '1=0';
    }

    return next.handle();
  }
}
