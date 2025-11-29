import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseController } from '../../common/base/base.controller';
import { Role } from './role.entity';
import { RoleService } from './role.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AssignPermissionsDto, CreateRoleDto } from './rbac.dto';

@ApiTags('角色管理')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('roles')
export class RoleController extends BaseController<Role> {
  constructor(private readonly roleService: RoleService) {
    super(roleService);
  }

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
    @Param('id') id: string,
    @Body() dto: AssignPermissionsDto,
  ) {
    // ✅ id: string
    return this.roleService.assignPermissions(id, dto.permissionIds);
  }

  @Get(':id/permissions')
  @Roles('admin')
  @ApiOperation({ summary: '获取角色的权限ID列表' })
  async getRolePermissions(@Param('id') id: string) {
    // ✅ id: string
    return this.roleService.getRolePermissions(id);
  }

  @Post(':id/data-scope')
  @Roles('admin')
  @ApiOperation({ summary: '分配数据权限' })
  @ApiBody({
    schema: { example: { dataScope: '2', deptIds: ['uuid1', 'uuid2'] } },
  })
  async assignDataScope(@Param('id') id: string, @Body() body: any) {
    // ✅ id: string
    return this.roleService.assignDataScope(id, body.dataScope, body.deptIds);
  }
}
