import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SyncService } from './sync.service';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('系统初始化')
@Controller('system/sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Public() // 👈 关键：公开接口，无需登录即可调用，解决 403 死循环
  @Post('api')
  @ApiOperation({ summary: '一键扫描接口并入库(自动赋权给Admin)' })
  async syncApi() {
    return this.syncService.syncApiToDb();
  }
}
