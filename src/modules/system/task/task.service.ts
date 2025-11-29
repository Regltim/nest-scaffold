import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { OperLog } from '../log/oper-log.entity';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    @InjectRepository(OperLog)
    private readonly logRepo: Repository<OperLog>,
  ) {}

  /**
   * 每天凌晨 3 点清理 30 天前的操作日志
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleCleanLogs() {
    this.logger.log('开始执行定时任务: 清理旧日志...');

    // 计算 30 天前的日期
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.logRepo.delete({
      createdAt: LessThan(thirtyDaysAgo),
    });

    this.logger.log(`清理完成: 删除了 ${result.affected} 条旧日志`);
  }

  // 你可以在这里添加更多任务，比如清理上传目录的临时文件
}
