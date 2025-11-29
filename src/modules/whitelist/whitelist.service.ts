import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { CreateWhitelistDto, UpdateWhitelistDto } from './whitelist.dto';

const WHITELIST_KEY = 'auth:whitelist';

@Injectable()
export class WhitelistService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  /**
   * 查詢所有白名單
   */
  async findAll() {
    const list = await this.redis.smembers(WHITELIST_KEY);
    return list;
  }

  /**
   * 新增白名單
   */
  async create(dto: CreateWhitelistDto) {
    // sadd 返回 1 表示新增成功，0 表示已存在
    const result = await this.redis.sadd(WHITELIST_KEY, dto.path);
    if (result === 0) {
      throw new BadRequestException('該路徑已存在於白名單中');
    }
    return { msg: '添加成功', path: dto.path };
  }

  /**
   * 刪除白名單
   */
  async remove(path: string) {
    const result = await this.redis.srem(WHITELIST_KEY, path);
    if (result === 0) {
      throw new BadRequestException('白名單中找不到該路徑');
    }
    return { msg: '刪除成功' };
  }

  /**
   * 修改白名單 (原子操作：刪舊+增新)
   */
  async update(dto: UpdateWhitelistDto) {
    // 使用 pipeline (管道) 或 multi (事務) 保證原子性
    // 這裡簡單使用 multi
    const pipeline = this.redis.multi();

    // 1. 刪除舊的
    pipeline.srem(WHITELIST_KEY, dto.oldPath);
    // 2. 添加新的
    pipeline.sadd(WHITELIST_KEY, dto.newPath);

    const results = await pipeline.exec();

    // results[0][1] 是 srem 的結果
    if (results[0][1] === 0) {
      throw new BadRequestException('舊路徑不存在，無法修改');
    }

    return { msg: '修改成功', from: dto.oldPath, to: dto.newPath };
  }
}
