import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginLog } from './login-log.entity';
import { UAParser } from 'ua-parser-js';
import { AppRequest } from '../../../common/interfaces/app-request.interface'; // 👈 引入

@Injectable()
export class LoginLogService {
  constructor(
    @InjectRepository(LoginLog)
    private readonly loginLogRepo: Repository<LoginLog>,
  ) {}

  /**
   * 记录登录日志
   */
  async create(
    req: AppRequest,
    username: string,
    status: number,
    message: string,
  ) {
    // 👈 指定类型
    // 现在 req.headers 和 req.ip 都有了类型提示
    const userAgent = req.headers['user-agent'];
    const parser = new UAParser(userAgent);
    const ua = parser.getResult();

    const log = new LoginLog();
    log.username = username;
    // 获取 IP，兼容反向代理
    log.ip =
      req.ip || (req.headers['x-forwarded-for'] as string) || '127.0.0.1';

    // 拼接浏览器信息
    log.browser =
      `${ua.browser.name || 'Unknown'} ${ua.browser.version || ''}`.trim();

    // 拼接操作系统信息
    log.os = `${ua.os.name || 'Unknown'} ${ua.os.version || ''}`.trim();

    log.status = status;
    log.message = message;
    log.loginTime = new Date();

    log.location = '未知';

    return this.loginLogRepo.save(log);
  }

  /**
   * 查询列表
   */
  async list(page: number, limit: number, username?: string) {
    const query = this.loginLogRepo.createQueryBuilder('log');
    if (username) {
      query.where('log.username LIKE :name', { name: `%${username}%` });
    }
    query.orderBy('log.loginTime', 'DESC');
    query.skip((page - 1) * limit).take(limit);

    const [list, total] = await query.getManyAndCount();
    return { list, total, page, limit };
  }
}
