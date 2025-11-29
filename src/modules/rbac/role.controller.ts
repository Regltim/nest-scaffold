import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseController } from '../../common/base/base.controller';
import { Role } from './role.entity';
import { RoleService } from './role.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AssignPermissionsDto, CreateRoleDto } from './rbac.dto'; // 👈

@ApiTags('角色管理')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('roles')
export class RoleController extends BaseController<Role> {
  constructor(private readonly roleService: RoleService) {
    super(roleService);
  }

  // 显式声明创建接口使用 DTO
  @Post()
  @Roles('admin')
  @ApiOperation({ summary: '新增角色' })
  async create(@Body() dto: CreateRoleDto) {
    return super.create(dto);
  }

  @Post(':id/permissions')
  @Roles('admin')
  @ApiOperation({ summary: '给角色分配权限' })
  async assignPermissions(
    @Param('id') id: number,
    @Body() dto: AssignPermissionsDto,
  ) {
    return this.roleService.assignPermissions(id, dto.permissionIds);
  }

  @Get(':id/permissions')
  @Roles('admin')
  @ApiOperation({ summary: '获取角色的权限ID列表' })
  async getRolePermissions(@Param('id') id: number) {
    return this.roleService.getRolePermissions(id);
  }
}
