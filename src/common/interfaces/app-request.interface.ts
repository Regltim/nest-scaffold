import { Request } from 'express';
import { Role } from '../../modules/rbac/role.entity';

export interface AppRequest extends Request {
  // 扩展 user 对象，使其包含我们在 JwtStrategy 中注入的字段
  user?: {
    userId: string;
    username: string;
    roles: Role[];
    [key: string]: any; // 允许其他可能的扩展字段
  };
}
