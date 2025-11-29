import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}

export class AssignPermissionsDto {
  @IsArray()
  @IsString({ each: true }) // ✅ 修改：PermissionIds 是 string 数组
  permissionIds: string[];
}

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsIn(['menu', 'button'])
  type: string;

  @IsOptional()
  @IsString() // ✅ 修改：ParentId 是 string
  parentId?: string;

  @IsOptional()
  @IsInt()
  sort?: number;
}
