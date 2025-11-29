import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class BasePageDto {
  @ApiProperty({ description: '当前页码 (默认1)', default: 1, required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page: number = 1;

  @ApiProperty({
    description: '每页条数 (默认10)',
    default: 10,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit: number = 10;

  @ApiProperty({
    description: '开始时间 (格式: YYYY-MM-DD HH:mm:ss)',
    required: false,
  })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiProperty({
    description: '结束时间 (格式: YYYY-MM-DD HH:mm:ss)',
    required: false,
  })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiProperty({
    description: '排序字段 (默认 createdAt)',
    required: false,
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortField?: string = 'createdAt';

  @ApiProperty({
    description: '排序方式 (ASC/DESC)',
    required: false,
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}