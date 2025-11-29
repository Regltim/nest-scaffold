import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// 创建字典类型
export class CreateDictTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;
}

// 创建字典数据
export class CreateDictDataDto {
  @IsString()
  @IsNotEmpty()
  dictType: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsInt()
  @IsOptional()
  sort?: number;
}
