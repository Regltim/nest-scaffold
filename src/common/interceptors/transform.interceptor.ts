import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { KEEP_KEY } from '../decorators/keep.decorator';

export interface Response<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T> | T
> {
  // 注入 Reflector 用于读取装饰器元数据
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T> | T> {
    // 1. 检查是否加了 @Keep() 装饰器
    const keep = this.reflector.getAllAndOverride<boolean>(KEEP_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2. 如果加了 @Keep，直接返回原始数据
    if (keep) {
      return next.handle();
    }

    // 3. 否则进行统一包装
    return next.handle().pipe(
      map((data) => ({
        code: 200,
        message: 'success',
        data: data || null,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
