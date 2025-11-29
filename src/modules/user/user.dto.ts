import { ApiProperty } from '@nestjs/swagger';
import { BasePageDto } from '../../common/dto/base-page.dto';
import {
  QueryAction,
  QueryType,
} from '../../common/decorators/query-type.decorator';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UserPageDto extends BasePageDto {
  @ApiProperty({ description: '用户名(模糊搜索)', required: false })
  @QueryType(QueryAction.LIKE)
  username?: string;

  @ApiProperty({ description: '邮箱(模糊搜索)', required: false })
  @QueryType(QueryAction.LIKE)
  email?: string;

  @ApiProperty({ description: '状态(精确匹配)', required: false })
  @QueryType(QueryAction.EQUAL)
  isActive?: boolean;
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  nickname?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}

export class ChangePasswordDto {
  @IsString() // ✅ 修改：UserId 是 string
  userId: string;

  @IsString()
  @IsNotEmpty()
  oldPass: string;

  @IsString()
  @IsNotEmpty()
  newPass: string;
}

export class AssignRolesDto {
  @IsArray()
  @IsString({ each: true }) // ✅ 修改：RoleIds 是 string 数组
  roleIds: string[];
}
