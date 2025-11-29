import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginLog } from './login-log.entity';
// ✅ 修正 1: 使用具体的导入，或者默认导入
import { UAParser } from 'ua-parser-js';

@Injectable()
export class LoginLogService {
  constructor(
    @InjectRepository(LoginLog)
    private readonly loginLogRepo: Repository<LoginLog>,
  ) {}

  /**
   * 记录登录日志
   */
  async create(req: any, username: string, status: number, message: string) {
    // 获取 User-Agent 字符串
    const userAgent = req.headers['user-agent'];

    // ✅ 修正 2: 使用 new 关键字实例化，并调用 getResult()
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
