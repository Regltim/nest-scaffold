import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DictService } from './dict.service';
import { CreateDictTypeDto, UpdateDictTypeDto } from './dict.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { BusinessType, Log } from '../../../common/decorators/log.decorator';

@ApiTags('字典-类型管理')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('system/dict/type') // 路由前缀区分
export class DictTypeController {
  constructor(private readonly dictService: DictService) {}

  @Post()
  @Roles('admin')
  @Log('新增字典类型', BusinessType.INSERT)
  @ApiOperation({ summary: '新增字典类型' })
  async create(@Body() dto: CreateDictTypeDto) {
    return this.dictService.createType(dto);
  }

  @Put()
  @Roles('admin')
  @Log('修改字典类型', BusinessType.UPDATE)
  @ApiOperation({ summary: '修改字典类型' })
  async update(@Body() dto: UpdateDictTypeDto) {
    return this.dictService.updateType(dto);
  }

  @Delete(':id')
  @Roles('admin')
  @Log('删除字典类型', BusinessType.DELETE)
  @ApiOperation({ summary: '删除字典类型' })
  async delete(@Param('id') id: string) {
    return this.dictService.deleteType(id);
  }

  @Get('list')
  @Roles('admin')
  @ApiOperation({ summary: '获取所有字典类型' })
  async list() {
    return this.dictService.listType();
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: '获取字典类型详情' })
  async get(@Param('id') id: string) {
    return this.dictService.getType(id);
  }
}
