import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';

@ApiTags('系统监控')
// @ApiBearerAuth() // 👈 2. 注释掉全局的 BearerAuth (可选，为了文档好看)
@UseGuards(RolesGuard)
@Controller('system/monitor')
export class MonitorController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get('health')
  @HealthCheck()
  @Roles('admin')
  @ApiOperation({ summary: '应用健康检查' })
  check() {
    return this.health.check([
      () => this.db.pingCheck('database', { timeout: 300 }),
    ]);
  }

  @Get('server')
  @ApiBearerAuth() // 👈 5. 这个接口依然需要鉴权
  @Roles('admin') // 👈 6. 依然需要 admin 角色
  @ApiOperation({ summary: '获取服务器信息' })
  getServerInfo() {
    return {
      cpu: process.cpuUsage(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      cwd: process.cwd(),
    };
  }
}
