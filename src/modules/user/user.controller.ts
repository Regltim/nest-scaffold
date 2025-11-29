import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { BaseController } from '../../common/base/base.controller';
import { User } from './user.entity';
import { UserService } from './user.service';
import {
  AssignRolesDto,
  ChangePasswordDto,
  CreateUserDto,
  UserPageDto,
} from './user.dto'; // 👈 引入新DTO
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { BusinessType, Log } from '../../common/decorators/log.decorator';
import { ExcelService } from '../../modules/global/excel.service';
import { AuthService } from '../auth/auth.service';

@ApiTags('用户管理')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('users')
export class UserController extends BaseController<User> {
  constructor(
    private readonly userService: UserService,
    private readonly excelService: ExcelService,
    private readonly authService: AuthService,
  ) {
    super(userService);
  }

  @Post()
  @Roles('admin')
  @Log('新增用户', BusinessType.INSERT)
  @ApiOperation({ summary: '新增用户' })
  async create(@Body() dto: CreateUserDto) {
    // 👈 替换 any
    return super.create(dto);
  }

  @Get('page')
  @ApiOperation({ summary: '分页获取用户列表' })
  async page(@Query() query: UserPageDto) {
    return this.userService.page(query);
  }

  @Get('list')
  @ApiExcludeEndpoint()
  async list(): Promise<User[]> {
    throw new NotFoundException('请使用分页接口');
  }

  @Post(':id/roles')
  @Roles('admin')
  @Log('分配角色', BusinessType.GRANT)
  @ApiOperation({ summary: '给用户分配角色' })
  async setRoles(@Param('id') id: number, @Body() dto: AssignRolesDto) {
    // 👈 替换 any
    return this.userService.setRoles(id, dto.roleIds);
  }

  @Get('export')
  @Roles('admin')
  @Log('导出用户', BusinessType.EXPORT)
  @ApiOperation({ summary: '导出用户列表' })
  async export(@Res() res: Response) {
    const users = await this.userService.list();
    const columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: '用户名', key: 'username', width: 20 },
      { header: '昵称', key: 'nickname', width: 20 },
      { header: '邮箱', key: 'email', width: 25 },
      { header: '创建时间', key: 'createdAt', width: 25 },
      { header: '状态', key: 'isActive', width: 10 },
    ];
    await this.excelService.export(res, users, columns, '用户列表');
  }

  @Post('password/change')
  @Log('修改密码', BusinessType.UPDATE)
  @ApiOperation({ summary: '修改密码' })
  async changePassword(@Body() dto: ChangePasswordDto) {
    // 👈 替换 any
    return this.authService.changePassword(
      dto.userId,
      dto.oldPass,
      dto.newPass,
    );
  }
}
