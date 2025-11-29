import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DictService } from './dict.service';
import {
  CreateDictDataDto,
  DictDataPageDto,
  UpdateDictDataDto,
} from './dict.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { BusinessType, Log } from '../../../common/decorators/log.decorator';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@ApiTags('字典-数据管理')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('system/dict/data')
export class DictDataController {
  constructor(private readonly dictService: DictService) {}

  @Post()
  @Roles('admin')
  @Log('新增字典数据', BusinessType.INSERT)
  @ApiOperation({ summary: '新增字典数据' })
  async create(@Body() dto: CreateDictDataDto) {
    return this.dictService.createData(dto);
  }

  @Put()
  @Roles('admin')
  @Log('修改字典数据', BusinessType.UPDATE)
  @ApiOperation({ summary: '修改字典数据' })
  async update(@Body() dto: UpdateDictDataDto) {
    return this.dictService.updateData(dto);
  }

  @Delete(':id')
  @Roles('admin')
  @Log('删除字典数据', BusinessType.DELETE)
  @ApiOperation({ summary: '删除字典数据' })
  async delete(@Param('id') id: string) {
    return this.dictService.deleteData(id);
  }

  @Get('page')
  @Roles('admin')
  @ApiOperation({ summary: '分页获取字典数据' })
  async page(@Query() dto: DictDataPageDto) {
    return this.dictService.pageData(dto);
  }

  /**
   * 公共接口：根据类型获取数据 (用于前端下拉框)
   * 建议开启缓存
   */
  @Get('type/:type')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000)
  @ApiOperation({ summary: '根据类型获取数据(下拉框用)' })
  async getDataByType(@Param('type') type: string) {
    return this.dictService.getDataByType(type);
  }
}
