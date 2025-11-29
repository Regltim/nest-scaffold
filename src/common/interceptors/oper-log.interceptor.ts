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
import { AppRequest } from '../interfaces/app-request.interface'; // 👈 1. 引入接口

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
    const request = ctx.getRequest<AppRequest>(); // 👈 2. 使用 AppRequest
    const handler = context.getHandler();

    const title = this.reflector.get(LOG_KEY_TITLE, handler);
    const businessType = this.reflector.get(LOG_KEY_TYPE, handler);

    if (!title) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((data) => {
        this.saveLog(request, title, businessType, 0, null, data);
      }),
      catchError((err) => {
        this.saveLog(request, title, businessType, 1, err.message, null);
        return throwError(() => err);
      }),
    );
  }

  private async saveLog(
    req: AppRequest, // 👈 3. 指定类型
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
      log.method = method;
      log.requestMethod = req.route ? req.route.path : originalUrl;
      log.operUrl = originalUrl;
      log.operIp =
        ip || (req.headers['x-forwarded-for'] as string) || '127.0.0.1';

      // ✅ 现在 user 有了类型提示
      log.operName = user ? user.username : '未知/未登录';

      const paramData = { body, query, params };
      log.operParam = JSON.stringify(paramData).substring(0, 2000);

      if (jsonResult) {
        log.jsonResult = JSON.stringify(jsonResult).substring(0, 2000);
      }

      log.status = status;
      log.errorMsg = errorMsg;

      await this.logRepo.save(log);
    } catch (e) {
      this.logger.error('操作日志写入失败', e);
    }
  }
}
