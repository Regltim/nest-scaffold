import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  toCamelCase,
  toKebabCase,
  toPascalCase,
} from '../../common/utils/string.util';

@Injectable()
export class GenService {
  private readonly logger = new Logger(GenService.name);

  constructor(@InjectDataSource() private dataSource: DataSource) {}

  /**
   * 获取数据库所有表
   */
  async listTables() {
    // 查询当前数据库的所有表
    const sql = `
      SELECT table_name as name, table_comment as comment 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_type = 'BASE TABLE'
    `;
    return this.dataSource.query(sql);
  }

  /**
   * 生成代码核心逻辑
   */
  async generate(tableName: string) {
    this.logger.log(`正在生成代码，表名: ${tableName}`);

    // 1. 查询列信息
    const columns = await this.dataSource.query(`
      SELECT column_name, data_type, column_comment, is_nullable 
      FROM information_schema.columns 
      WHERE table_schema = DATABASE() AND table_name = '${tableName}'
      ORDER BY ordinal_position
    `);

    // ✅ 校验：如果查不到列，说明表名错了
    if (!columns || columns.length === 0) {
      this.logger.error(`表 ${tableName} 不存在或没有列信息`);
      throw new BadRequestException(
        `表 [${tableName}] 不存在，请检查数据库拼写`,
      );
    }

    // 2. 准备变量名
    // sys_user_order -> UserOrder (类名) / userOrder (变量名) / user-order (文件名)
    const cleanName = tableName.replace(/^sys_/, '');
    const ClassName = toPascalCase(cleanName);
    const varName = toCamelCase(cleanName);
    const fileName = toKebabCase(cleanName);

    // 3. 生成代码
    return {
      info: {
        tableName,
        ClassName,
        fileName,
      },
      codes: {
        entity: this.genEntity(ClassName, tableName, columns),
        dto: this.genDto(ClassName, columns),
        service: this.genService(ClassName, varName, fileName),
        controller: this.genController(ClassName, varName, fileName),
        module: this.genModule(ClassName, fileName),
      },
    };
  }

  // --- 模板生成 ---

  private genEntity(ClassName: string, tableName: string, columns: any[]) {
    let props = '';
    const ignoreCols = ['id', 'created_at', 'updated_at', 'deleted_at'];

    for (const col of columns) {
      if (ignoreCols.includes(col.column_name)) continue;
      const tsType = this.mapType(col.data_type);
      const comment = col.column_comment || '';
      // 避免 type 报错，这里不指定 type，让 TypeORM 自动推断
      props += `
  @Column({ comment: '${comment}' })
  ${toCamelCase(col.column_name)}: ${tsType};
`;
    }

    return `import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';

@Entity('${tableName}')
export class ${ClassName} extends BaseEntity {${props}}`;
  }

  private genDto(ClassName: string, columns: any[]) {
    let props = '';
    const ignoreCols = ['id', 'created_at', 'updated_at', 'deleted_at'];

    for (const col of columns) {
      if (ignoreCols.includes(col.column_name)) continue;

      const field = toCamelCase(col.column_name);
      const comment = col.column_comment || field;
      const tsType = this.mapType(col.data_type);
      const isOptional = col.is_nullable === 'YES';

      // 根据类型选择 Validator
      let validator = '@IsString()';
      if (tsType === 'number') validator = '@IsInt()';
      if (tsType === 'boolean') validator = '@IsBoolean()';
      if (tsType === 'Date') validator = '@IsDateString()';

      props += `
  @ApiProperty({ description: '${comment}', required: ${!isOptional} })
  ${validator}
  ${isOptional ? '@IsOptional()' : '@IsNotEmpty()'}
  ${field}${isOptional ? '?' : ''}: ${tsType};
`;
    }

    return `import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsNotEmpty, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { BasePageDto } from '../../common/dto/base-page.dto';

export class Create${ClassName}Dto {${props}}

export class ${ClassName}PageDto extends BasePageDto {
  // TODO: 在这里添加查询字段
}`;
  }

  private genService(ClassName: string, varName: string, fileName: string) {
    return `import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../common/base/base.service';
import { ${ClassName} } from './${fileName}.entity';

@Injectable()
export class ${ClassName}Service extends BaseService<${ClassName}> {
  constructor(
    @InjectRepository(${ClassName})
    private readonly ${varName}Repo: Repository<${ClassName}>,
  ) {
    super(${varName}Repo);
  }
}`;
  }

  private genController(ClassName: string, varName: string, fileName: string) {
    // ✅ 修复：这里之前写死了 userService，现在改为动态 ${varName}Service
    return `import { Controller, Get, Post, Body, Query, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BaseController } from '../../common/base/base.controller';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ${ClassName} } from './${fileName}.entity';
import { ${ClassName}Service } from './${fileName}.service';
import { Create${ClassName}Dto, ${ClassName}PageDto } from './${fileName}.dto';

@ApiTags('${ClassName}管理')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('${fileName}')
export class ${ClassName}Controller extends BaseController<${ClassName}> {
  constructor(private readonly ${varName}Service: ${ClassName}Service) {
    super(${varName}Service);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: '创建${ClassName}' })
  async create(@Body() dto: Create${ClassName}Dto) {
    return super.create(dto);
  }

  @Get('page')
  @ApiOperation({ summary: '分页查询' })
  async page(@Query() query: ${ClassName}PageDto) {
    return this.${varName}Service.page(query);
  }
}`;
  }

  private genModule(ClassName: string, fileName: string) {
    return `import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ${ClassName} } from './${fileName}.entity';
import { ${ClassName}Service } from './${fileName}.service';
import { ${ClassName}Controller } from './${fileName}.controller';

@Module({
  imports: [TypeOrmModule.forFeature([${ClassName}])],
  controllers: [${ClassName}Controller],
  providers: [${ClassName}Service],
})
export class ${ClassName}Module {}`;
  }

  private mapType(dataType: string): string {
    if (
      [
        'int',
        'tinyint',
        'bigint',
        'decimal',
        'double',
        'float',
        'smallint',
      ].includes(dataType)
    ) {
      return 'number';
    }
    if (['datetime', 'timestamp', 'date', 'time'].includes(dataType)) {
      return 'Date'; // 或者 string，取决于你的偏好
    }
    if (['boolean', 'tinyint(1)'].includes(dataType)) {
      return 'boolean';
    }
    return 'string';
  }
}
