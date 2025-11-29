import { SetMetadata } from '@nestjs/common';

export const LOG_KEY_TITLE = 'system:log_title';
export const LOG_KEY_TYPE = 'system:log_type';

// 定义业务类型枚举
export enum BusinessType {
  OTHER = 'OTHER',
  INSERT = 'INSERT', // 新增
  UPDATE = 'UPDATE', // 修改
  DELETE = 'DELETE', // 删除
  GRANT = 'GRANT', // 授权
  EXPORT = 'EXPORT', // 导出
  CLEAN = 'CLEAN', // 清空
}

/**
 * 操作日志装饰器
 * @param title 模块名称 (如: 用户管理)
 * @param businessType 业务类型 (如: BusinessType.INSERT)
 */
export const Log = (
  title: string,
  businessType: BusinessType = BusinessType.OTHER,
) => {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    SetMetadata(LOG_KEY_TITLE, title)(target, propertyKey, descriptor);
    SetMetadata(LOG_KEY_TYPE, businessType)(target, propertyKey, descriptor);
  };
};