import { ApiProperty } from '@nestjs/swagger';
import { BasePageDto } from '../../common/dto/base-page.dto';
import {
  QueryAction,
  QueryType,
} from '../../common/decorators/query-type.decorator';
import {
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

// 分页查询 DTO
export class UserPageDto extends BasePageDto {
  @ApiProperty({ description: '用户名(模糊搜索)', required: false })
  @QueryType(QueryAction.LIKE) // 自动生成 where username LIKE %val%
  username?: string;

  @ApiProperty({ description: '邮箱(模糊搜索)', required: false })
  @QueryType(QueryAction.LIKE) // 自动生成 where email LIKE %val%
  email?: string;

  @ApiProperty({ description: '状态(精确匹配)', required: false })
  @QueryType(QueryAction.EQUAL) // 自动生成 where isActive = val
  isActive?: boolean;
}

export class CreateUserDto {
  /** 用户名 */
  @IsString()
  @IsNotEmpty()
  username: string;

  /** 密码 */
  @IsString()
  @IsNotEmpty()
  password: string;

  /** 昵称 */
  @IsString()
  @IsOptional()
  nickname?: string;

  /** 邮箱 */
  @IsEmail()
  @IsOptional()
  email?: string;
}

export class ChangePasswordDto {
  /** 用户ID */
  @IsInt()
  userId: number;

  /** 旧密码 */
  @IsString()
  @IsNotEmpty()
  oldPass: string;

  /** 新密码 */
  @IsString()
  @IsNotEmpty()
  newPass: string;
}

export class AssignRolesDto {
  /** 角色ID数组 */
  @IsArray()
  @IsInt({ each: true }) // 检查数组中每个元素都是整数
  roleIds: number[];
}
