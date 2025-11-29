import { SetMetadata } from '@nestjs/common';

// 定义 Key 常量
export const ROLES_KEY = 'roles';

// 导出装饰器函数 @Roles('admin', 'user')
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
