import { Request } from 'express';
import { Role } from '../../modules/rbac/role.entity';

export interface AppRequest extends Request {
  // 扩展 user 对象，使其包含我们在 JwtStrategy 中注入的字段
  user?: {
    userId: number; // 如果你之前改成了 UUID，这里请改为 string
    username: string;
    roles: Role[];
    [key: string]: any; // 允许其他可能的扩展字段
  };
}
