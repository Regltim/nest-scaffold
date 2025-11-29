import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DictService } from './dict.service';
import { CreateDictDataDto, CreateDictTypeDto } from './dict.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { BusinessType, Log } from '../../../common/decorators/log.decorator';

@ApiTags('数据字典')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('dict')
export class DictController {
  constructor(private readonly dictService: DictService) {}

  @Post('type')
  @Roles('admin')
  @Log('新增字典类型', BusinessType.INSERT)
  @ApiOperation({ summary: '新增字典类型' })
  async createType(@Body() dto: CreateDictTypeDto) {
    return this.dictService.createType(dto);
  }

  @Get('type/list')
  @Roles('admin')
  @ApiOperation({ summary: '获取字典类型列表' })
  async listType() {
    return this.dictService.listType();
  }

  @Post('data')
  @Roles('admin')
  @Log('新增字典数据', BusinessType.INSERT)
  @ApiOperation({ summary: '新增字典数据' })
  async createData(@Body() dto: CreateDictDataDto) {
    return this.dictService.createData(dto);
  }

  @Get('data/type/:type')
  @ApiOperation({ summary: '根据类型获取字典数据(下拉框用)' })
  async getDataByType(@Param('type') type: string) {
    return this.dictService.getDataByType(type);
  }
}
