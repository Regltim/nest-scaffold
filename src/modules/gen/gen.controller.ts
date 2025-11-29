import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express'; // 👈 引入 express response
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
  @ApiOperation({ summary: '生成代码预览 (JSON)' })
  async preview(@Param('tableName') tableName: string) {
    return this.genService.generate(tableName);
  }

  /**
   * ✅ 新增：下載 Zip 包
   */
  @Get('download/:tableName')
  @Roles('admin')
  @ApiOperation({ summary: '下载代码生成包 (Zip)' })
  async download(@Param('tableName') tableName: string, @Res() res: Response) {
    const buffer = await this.genService.downloadCode(tableName);

    // 设置响应头，告诉浏览器这是一个要下载的文件
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename=${tableName}.zip`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }
}
