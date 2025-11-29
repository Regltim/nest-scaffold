import { SetMetadata } from '@nestjs/common';

export const DATA_SCOPE_KEY = 'common:data_scope';

/**
 * 自动注入数据权限 SQL
 * @param deptAlias 部门表别名 (默认 dept)
 * @param userAlias 用户表别名 (默认 user)
 */
export const DataScope = (deptAlias = 'dept', userAlias = 'user') => {
  return SetMetadata(DATA_SCOPE_KEY, { deptAlias, userAlias });
};
