import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDeptDto {
  @ApiProperty({ description: '部门名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '父级ID', required: false })
  @IsOptional()
  @IsString() // ✅ 修改：UUID 是字符串
  parentId?: string;

  @ApiProperty({ description: '排序', required: false })
  @IsOptional()
  @IsInt()
  sort?: number;

  @ApiProperty({ description: '负责人', required: false })
  @IsOptional()
  @IsString()
  leader?: string;

  @ApiProperty({ description: '联系电话', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: '邮箱', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: '状态', required: false })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
