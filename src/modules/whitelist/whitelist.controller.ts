import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WhitelistService } from './whitelist.service';
import {
  CreateWhitelistDto,
  DeleteWhitelistDto,
  UpdateWhitelistDto,
} from './whitelist.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('白名单管理')
@ApiBearerAuth()
@UseGuards(RolesGuard) // 啟用角色守衛
@Controller('whitelist')
export class WhitelistController {
  constructor(private readonly whitelistService: WhitelistService) {}

  @Get()
  @Roles('admin') // 只有 admin 角色可以查看
  @ApiOperation({ summary: '获取白名单所有路径' })
  async findAll() {
    return this.whitelistService.findAll();
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: '添加接口白名单' })
  async create(@Body() dto: CreateWhitelistDto) {
    return this.whitelistService.create(dto);
  }

  @Delete()
  @Roles('admin')
  @ApiOperation({ summary: '删除接口白名单' })
  async remove(@Body() dto: DeleteWhitelistDto) {
    return this.whitelistService.remove(dto.path);
  }

  @Put()
  @Roles('admin')
  @ApiOperation({ summary: '修改接口白名单' })
  async update(@Body() dto: UpdateWhitelistDto) {
    return this.whitelistService.update(dto);
  }
}
