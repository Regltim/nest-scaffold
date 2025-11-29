import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GenService } from './gen.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('代码生成')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('gen')
export class GenController {
  constructor(private readonly genService: GenService) {}

  @Get('table/list')
  @Roles('admin')
  @ApiOperation({ summary: '获取数据库表列表' })
  async listTables() {
    return this.genService.listTables();
  }

  @Get('preview/:tableName')
  @Roles('admin')
  @ApiOperation({ summary: '生成代码预览' })
  async preview(@Param('tableName') tableName: string) {
    return this.genService.generate(tableName);
  }
}
