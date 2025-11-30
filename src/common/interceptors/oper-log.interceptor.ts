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
import { AppRequest } from '../interfaces/app-request.interface';

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
    const request = ctx.getRequest<AppRequest>();
    const handler = context.getHandler();

    const title = this.reflector.get(LOG_KEY_TITLE, handler);
    const businessType = this.reflector.get(LOG_KEY_TYPE, handler);

    // 如果没有配置 @Log 装饰器，则不记录日志
    if (!title) {
      return next.handle();
    }

    // 获取开始时间，用于计算耗时（可选优化）
    // const startTime = Date.now();

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
    req: AppRequest,
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
      log.operName = user ? user.username : '未知/未登录';
      log.status = status;
      log.errorMsg = errorMsg;

      // --- 1. 参数精简与脱敏处理 ---
      const requestData: any = {};

      // 只有当对象不为空时才放入日志
      if (params && Object.keys(params).length > 0) {
        requestData.params = params;
      }
      if (query && Object.keys(query).length > 0) {
        requestData.query = query;
      }
      if (body && Object.keys(body).length > 0) {
        // 深拷贝 body 以免修改原始请求对象
        requestData.body = this.maskSensitiveData(
          JSON.parse(JSON.stringify(body)),
        );
      }

      // 如果没有任何参数，记录为空字符串或特定的标识，而不是 "{}"
      log.operParam =
        Object.keys(requestData).length > 0
          ? JSON.stringify(requestData).substring(0, 2000)
          : '';

      // --- 2. 结果处理 ---
      if (jsonResult) {
        // 如果是 Buffer (文件流)，不记录具体内容
        if (Buffer.isBuffer(jsonResult)) {
          log.jsonResult = '[Binary Data]';
        } else {
          // 同样对返回结果中的敏感数据进行脱敏（可选，视需求而定）
          const cleanResult = this.maskSensitiveData(
            JSON.parse(JSON.stringify(jsonResult)),
          );
          log.jsonResult = JSON.stringify(cleanResult).substring(0, 2000);
        }
      }

      await this.logRepo.save(log);
    } catch (e) {
      this.logger.error('操作日志写入失败', e);
    }
  }

  /**
   * 敏感数据脱敏处理
   * 递归遍历对象，将敏感字段替换为 ******
   */
  private maskSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.maskSensitiveData(item));
    }

    const sensitiveKeys = [
      'password',
      'oldPass',
      'newPass',
      'token',
      'accessToken',
    ];

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        if (sensitiveKeys.includes(key)) {
          data[key] = '******';
        } else if (typeof data[key] === 'object') {
          data[key] = this.maskSensitiveData(data[key]);
        }
      }
    }

    return data;
  }
}
