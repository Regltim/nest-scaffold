import 'reflect-metadata';

// 定义查询类型枚举
export enum QueryAction {
  EQUAL = 'EQUAL', // 精确查询 (=)
  LIKE = 'LIKE', // 模糊查询 (LIKE %val%)
  IN = 'IN', // 包含查询 (IN (...))
}

export const QUERY_TYPE_KEY = 'custom:query_type';

// ✅ 修复：显式定义为 PropertyDecorator，并使用 Reflect 直接操作
export const QueryType = (action: QueryAction): PropertyDecorator => {
  return (target: object, propertyKey: string | symbol) => {
    Reflect.defineMetadata(QUERY_TYPE_KEY, action, target, propertyKey);
  };
};
