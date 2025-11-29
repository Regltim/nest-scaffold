import {
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Redis } from 'ioredis';

@ApiTags('系统监控')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('system/online')
export class OnlineController {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  @Get('list')
  @Roles('admin')
  @ApiOperation({ summary: '获取在线用户列表' })
  async list() {
    // 1. 扫描所有 online_token:*
    const keys = await this.redis.keys('online_token:*');
    const list = [];

    for (const key of keys) {
      const value = await this.redis.get(key);
      if (value) {
        const data = JSON.parse(value);
        // 返回 token 的 key 方便前端强退 (去掉前缀以便识别，或者直接传 token)
        data.token = key.replace('online_token:', '');
        list.push(data);
      }
    }
    return list;
  }

  @Delete(':token')
  @Roles('admin')
  @ApiOperation({ summary: '强退用户' })
  async forceLogout(@Param('token') token: string) {
    // 1. 加入黑名单
    await this.redis.set(`blacklist:${token}`, 'true', 'EX', 604800);
    // 2. 移除在线状态
    await this.redis.del(`online_token:${token}`);
    return { msg: '强退成功' };
  }
}
