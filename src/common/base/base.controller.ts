import { Body, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { BaseService } from './base.service';
import { BaseEntity } from './base.entity';
import { ApiOperation } from '@nestjs/swagger';
import { BasePageDto } from '../dto/base-page.dto';

export abstract class BaseController<T extends BaseEntity> {
  constructor(protected readonly service: BaseService<T>) {}

  @Post()
  @ApiOperation({ summary: '新增' })
  async create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除' })
  async remove(@Param('id') id: string) {
    // ✅ 修改类型为 string
    return this.service.remove(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新' })
  async update(@Param('id') id: string, @Body() dto: any) {
    // ✅ 修改类型为 string
    return this.service.update(id, dto);
  }

  @Get('page')
  @ApiOperation({ summary: '分页查询' })
  async page(@Query() query: BasePageDto) {
    return this.service.page(query);
  }

  @Get('list')
  @ApiOperation({ summary: '列表查询(不分页)' })
  async list() {
    return this.service.list();
  }

  @Get(':id')
  @ApiOperation({ summary: '查询详情' })
  async findOne(@Param('id') id: string) {
    // ✅ 修改类型为 string
    return this.service.findOne(id);
  }
}
