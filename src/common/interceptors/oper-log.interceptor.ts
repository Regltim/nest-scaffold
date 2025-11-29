import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OperLog } from '../../modules/system/log/oper-log.entity';
import { LOG_KEY_TITLE, LOG_KEY_TYPE } from '../decorators/log.decorator';
import { Request } from 'express';

@Injectable()
export class OperLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(OperLogInterceptor.name);

  constructor(
    private reflector: Reflector,
    @InjectRepository(OperLog)
    private readonly logRepo: Repository<OperLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const handler = context.getHandler();

    // 1. 获取装饰器上的元数据
    const title = this.reflector.get(LOG_KEY_TITLE, handler);
    const businessType = this.reflector.get(LOG_KEY_TYPE, handler);

    // 如果接口没有加 @Log 装饰器，直接放行，不记录日志
    if (!title) {
      return next.handle();
    }

    // 2. 正常执行请求
    return next.handle().pipe(
      tap((data) => {
        // 请求成功：记录日志 (状态 0)
        this.saveLog(request, title, businessType, 0, null, data);
      }),
      catchError((err) => {
        // 请求失败：记录日志 (状态 1)
        this.saveLog(request, title, businessType, 1, err.message, null);
        // 继续抛出错误，让全局异常过滤器处理
        return throwError(() => err);
      }),
    );
  }

  /**
   * 异步保存日志到数据库
   */
  private async saveLog(
    req: any,
    title: string,
    bType: string,
    status: number,
    errorMsg: string,
    jsonResult: any,
  ) {
    try {
      const { method, originalUrl, body, query, params, ip, user } = req;

      const log = new OperLog();
      log.title = title;
      log.businessType = bType;
      log.method = method; // 记录 HTTP 方法，如 POST
      log.requestMethod = req.route ? req.route.path : originalUrl; // 记录路由路径
      log.operUrl = originalUrl;

      // 获取 IP (兼容反向代理)
      log.operIp =
        ip || (req.headers['x-forwarded-for'] as string) || '127.0.0.1';

      // 获取操作人 (如果未登录则显示未知)
      log.operName = user ? user.username : '未知/未登录';

      // 记录请求参数 (截取前2000字符防止过长)
      const paramData = { body, query, params };
      log.operParam = JSON.stringify(paramData).substring(0, 2000);

      // 记录返回结果 (截取前2000字符)
      if (jsonResult) {
        log.jsonResult = JSON.stringify(jsonResult).substring(0, 2000);
      }

      log.status = status;
      log.errorMsg = errorMsg;

      // 保存
      await this.logRepo.save(log);
    } catch (e) {
      this.logger.error('操作日志写入失败', e);
    }
  }
}