import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BasePageDto } from '../../../common/dto/base-page.dto';

// --- 字典类型 ---

export class CreateDictTypeDto {
  @ApiProperty({ description: '字典名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '字典类型' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: '状态', required: false })
  @IsOptional()
  status?: boolean;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateDictTypeDto extends PartialType(CreateDictTypeDto) {
  @ApiProperty({ description: 'ID' })
  @IsString()
  @IsNotEmpty()
  id: string;
}

// --- 字典数据 ---

export class CreateDictDataDto {
  @ApiProperty({ description: '字典类型' })
  @IsString()
  @IsNotEmpty()
  dictType: string;

  @ApiProperty({ description: '字典标签' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ description: '字典键值' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({ description: '排序', required: false })
  @IsOptional()
  @IsInt()
  sort?: number;

  @ApiProperty({ description: '状态', required: false })
  @IsOptional()
  status?: boolean;

  @ApiProperty({ description: '是否默认', required: false })
  @IsOptional()
  isDefault?: boolean;
}

export class UpdateDictDataDto extends PartialType(CreateDictDataDto) {
  @ApiProperty({ description: 'ID' })
  @IsString()
  @IsNotEmpty()
  id: string;
}

// 分页查询 DTO
export class DictDataPageDto extends BasePageDto {
  @ApiProperty({ description: '字典类型', required: false })
  @IsOptional()
  @IsString()
  dictType?: string;

  @ApiProperty({ description: '字典标签(模糊)', required: false })
  @IsOptional()
  @IsString()
  label?: string;
}
