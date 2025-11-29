import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

// --- 角色相关 ---
export class CreateRoleDto {
  /** 角色名称 */
  @IsString()
  @IsNotEmpty()
  name: string;

  /** 角色编码 (唯一) */
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class AssignPermissionsDto {
  /** 权限ID数组 */
  @IsArray()
  @IsInt({ each: true })
  permissionIds: number[];
}

// --- 权限相关 ---
export class CreatePermissionDto {
  /** 权限名称/菜单标题 */
  @IsString()
  @IsNotEmpty()
  name: string;

  /** 权限标识 (如 user:list) */
  @IsString()
  @IsNotEmpty()
  code: string;

  /** 类型: menu 或 button */
  @IsIn(['menu', 'button'])
  type: string;

  /** 父级ID (顶级填 null) */
  @IsOptional()
  @IsInt()
  parentId?: number;

  /** 排序 (越小越靠前) */
  @IsOptional()
  @IsInt()
  sort?: number;
}
