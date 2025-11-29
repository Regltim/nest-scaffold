import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseController } from '../../../common/base/base.controller';
import { Dept } from './dept.entity';
import { DeptService } from './dept.service';
import { CreateDeptDto } from './dept.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@ApiTags('部门管理')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('system/dept')
export class DeptController extends BaseController<Dept> {
  constructor(private readonly deptService: DeptService) {
    super(deptService);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: '新增部门' })
  async create(@Body() dto: CreateDeptDto) {
    return super.create(dto);
  }

  @Get('tree')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000)
  @ApiOperation({ summary: '获取部门树(带缓存)' })
  async getTree() {
    return this.deptService.findTree();
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: '删除部门' })
  async remove(@Param('id') id: string) {
    // ✅ id: string
    return this.deptService.remove(id);
  }
}
