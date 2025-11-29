import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  toCamelCase,
  toKebabCase,
  toPascalCase,
} from '../../common/utils/string.util';
import * as AdmZip from 'adm-zip';

@Injectable()
export class GenService {
  private readonly logger = new Logger(GenService.name);

  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async listTables() {
    return this.dataSource.query(`
      SELECT table_name as name, table_comment as comment 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE'
    `);
  }

  async generate(tableName: string) {
    try {
      // ✅ 1. 校验 tableName 是否存在
      if (!tableName) {
        throw new Error('表名不能为空');
      }

      this.logger.log(`正在生成代码，表名: ${tableName}`);

      // 2. 查询列信息
      const columns = await this.dataSource.query(`
        SELECT column_name, data_type, column_comment, is_nullable 
        FROM information_schema.columns 
        WHERE table_schema = DATABASE() AND table_name = '${tableName}'
        ORDER BY ordinal_position
      `);

      // ✅ 3. 校验表是否存在
      if (!columns || columns.length === 0) {
        throw new BadRequestException(`表 [${tableName}] 不存在或读取列失败`);
      }

      // ✅ 4. 调试日志：打印第一行看看数据库返回的 Key 是大写还是小写
      // this.logger.debug('Column Info:', columns[0]);

      // 5. 名称处理
      let cleanName = tableName.replace(/^sys_/, '');
      if (cleanName.endsWith('s') && cleanName.length > 3) {
        cleanName = cleanName.slice(0, -1);
      }

      const ClassName = toPascalCase(cleanName);
      const varName = toCamelCase(cleanName);
      const fileName = toKebabCase(cleanName);

      return {
        info: { tableName, ClassName, fileName, varName },
        codes: {
          entity: this.genEntity(ClassName, tableName, columns),
          dto: this.genDto(ClassName, columns),
          service: this.genService(ClassName, varName, fileName),
          controller: this.genController(ClassName, varName, fileName),
          module: this.genModule(ClassName, fileName),
        },
      };
    } catch (error) {
      this.logger.error(`代码生成失败: ${error.message}`, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  async downloadCode(tableName: string): Promise<Buffer> {
    const data = await this.generate(tableName);
    const zip = new AdmZip();
    const { fileName } = data.info;
    const { entity, dto, service, controller, module } = data.codes;

    zip.addFile(
      `${fileName}/${fileName}.entity.ts`,
      Buffer.from(entity, 'utf8'),
    );
    zip.addFile(`${fileName}/${fileName}.dto.ts`, Buffer.from(dto, 'utf8'));
    zip.addFile(
      `${fileName}/${fileName}.service.ts`,
      Buffer.from(service, 'utf8'),
    );
    zip.addFile(
      `${fileName}/${fileName}.controller.ts`,
      Buffer.from(controller, 'utf8'),
    );
    zip.addFile(
      `${fileName}/${fileName}.module.ts`,
      Buffer.from(module, 'utf8'),
    );

    return zip.toBuffer();
  }

  // --- 模板生成逻辑 ---

  private genEntity(ClassName: string, tableName: string, columns: any[]) {
    let props = '';
    const ignoreCols = [
      'id',
      'created_at',
      'updated_at',
      'deleted_at',
      'createdAt',
      'updatedAt',
      'deletedAt',
    ];

    for (const col of columns) {
      // ✅ 兼容性处理：数据库可能返回 COLUMN_NAME (大写) 或 column_name (小写)
      const colName = col.column_name || col.COLUMN_NAME;
      const dataType = col.data_type || col.DATA_TYPE;
      const colComment = col.column_comment || col.COLUMN_COMMENT || '';

      if (!colName) continue; // 如果拿不到列名，跳过

      const fieldName = toCamelCase(colName);
      if (ignoreCols.includes(colName) || ignoreCols.includes(fieldName))
        continue;

      const tsType = this.mapType(dataType);

      props += `
  @Column({ comment: '${colComment}' })
  ${fieldName}: ${tsType};
`;
    }

    return `import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';

@Entity('${tableName}')
export class ${ClassName} extends BaseEntity {${props}}`;
  }

  private genDto(ClassName: string, columns: any[]) {
    let props = '';
    const ignoreCols = [
      'id',
      'created_at',
      'updated_at',
      'deleted_at',
      'createdAt',
      'updatedAt',
      'deletedAt',
    ];

    for (const col of columns) {
      const colName = col.column_name || col.COLUMN_NAME;
      const dataType = col.data_type || col.DATA_TYPE;
      const colComment = col.column_comment || col.COLUMN_COMMENT || colName;
      const isNullable = (col.is_nullable || col.IS_NULLABLE) === 'YES';

      if (!colName) continue;

      const fieldName = toCamelCase(colName);
      if (ignoreCols.includes(colName) || ignoreCols.includes(fieldName))
        continue;

      const tsType = this.mapType(dataType);

      let validator = '@IsString()';
      if (tsType === 'number') validator = '@IsInt()';
      if (tsType === 'boolean') validator = '@IsBoolean()';
      if (tsType === 'Date') validator = '@IsDateString()';

      props += `
  @ApiProperty({ description: '${colComment}', required: ${!isNullable} })
  ${validator}
  ${isNullable ? '@IsOptional()' : '@IsNotEmpty()'}
  ${fieldName}${isNullable ? '?' : ''}: ${tsType};
`;
    }

    return `import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsNotEmpty, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { BasePageDto } from '../../common/dto/base-page.dto';

export class Create${ClassName}Dto {${props}}

export class ${ClassName}PageDto extends BasePageDto {
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
    if (!dataType) return 'string'; // 防止 undefined
    const type = dataType.toLowerCase();
    if (
      [
        'int',
        'tinyint',
        'bigint',
        'decimal',
        'double',
        'float',
        'smallint',
      ].some((t) => type.includes(t))
    ) {
      return 'number';
    }
    if (
      ['datetime', 'timestamp', 'date', 'time'].some((t) => type.includes(t))
    ) {
      return 'Date';
    }
    if (['boolean', 'tinyint(1)', 'bit'].some((t) => type.includes(t))) {
      return 'boolean';
    }
    return 'string';
  }
}
