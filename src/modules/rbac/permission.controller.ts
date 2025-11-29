import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseController } from '../../common/base/base.controller';
import { Permission } from './permission.entity';
import { PermissionService } from './permission.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreatePermissionDto } from './rbac.dto'; // 👈

@ApiTags('权限(菜单)管理')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('permissions')
export class PermissionController extends BaseController<Permission> {
  constructor(private readonly permService: PermissionService) {
    super(permService);
  }

  @Get('tree')
  @Roles('admin')
  @ApiOperation({ summary: '获取权限菜单树' })
  async getTree() {
    return this.permService.findTree();
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: '新增权限/菜单' })
  async create(@Body() dto: CreatePermissionDto) {
    // 👈 替换 any
    return super.create(dto);
  }
}
