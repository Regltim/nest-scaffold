import { Equal, FindOptionsWhere, In, Like } from 'typeorm';
import 'reflect-metadata';
import {
  QUERY_TYPE_KEY,
  QueryAction,
} from '../decorators/query-type.decorator';

/**
 * 自动构建 TypeORM 查询条件
 * 遍历 DTO 对象，检查属性上的 @QueryType 装饰器，自动生成 where 对象
 */
export function buildQueryWhere<T>(dto: any): FindOptionsWhere<T> {
  const where: any = {};

  // 遍历 DTO 的所有属性
  Object.keys(dto).forEach((key) => {
    const value = dto[key];

    // 如果值为空，跳过 (0 和 false 是有效值，null/undefined/'' 跳过)
    if (value === undefined || value === null || value === '') {
      return;
    }

    // 获取该属性上的装饰器元数据
    const action = Reflect.getMetadata(QUERY_TYPE_KEY, dto, key);

    if (action) {
      switch (action) {
        case QueryAction.LIKE:
          where[key] = Like(`%${value}%`);
          break;
        case QueryAction.EQUAL:
          where[key] = Equal(value);
          break;
        case QueryAction.IN:
          // 如果传过来是逗号分隔字符串 '1,2,3'，自动转数组
          const valArray = typeof value === 'string' ? value.split(',') : value;
          where[key] = In(valArray);
          break;
      }
    }
  });

  return where;
}
