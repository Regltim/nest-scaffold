import {
  Between,
  DeepPartial,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { BasePageDto } from '../dto/base-page.dto';
import { buildQueryWhere } from '../utils/query-builder'; // 👈 引入工具

export abstract class BaseService<T extends BaseEntity> {
  constructor(protected readonly repository: Repository<T>) {}

  // ... create, remove, update, findOne 保持不变 ...

  async create(createDto: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(createDto);
    return await this.repository.save(entity);
  }

  async remove(id: number): Promise<void> {
    await this.repository.softDelete(id);
  }

  async update(id: number, updateDto: DeepPartial<T>): Promise<T> {
    await this.repository.update(id, updateDto as any);
    return this.findOne(id);
  }

  async findOne(id: number): Promise<T> {
    return await this.repository.findOne({ where: { id } as any });
  }

  /**
   * ✅ 升级版列表查询
   * 现在支持传入 DTO 自动构建查询条件
   */
  async list(dtoOrWhere?: any): Promise<T[]> {
    let where = dtoOrWhere;
    // 如果传入的是对象且不是纯 where 条件，尝试自动构建
    if (dtoOrWhere && typeof dtoOrWhere === 'object') {
      where = buildQueryWhere(dtoOrWhere);
    }

    return await this.repository.find({
      where,
      order: { createdAt: 'DESC' } as any,
    });
  }

  /**
   * ✅ 终极版分页查询
   * 自动处理：分页 + 排序 + 时间范围 + @QueryType 自动构建
   */
  async page(dto: BasePageDto & any) {
    // 允许传入子类 DTO
    const {
      page = 1,
      limit = 10,
      startTime,
      endTime,
      sortField = 'createdAt',
      sortOrder = 'DESC',
    } = dto;

    // 1. ⚡️ 利用工具自动构建业务查询条件 (代替手动 if-else)
    const autoWhere = buildQueryWhere<T>(dto);

    // 2. 处理时间范围
    const timeFilter: any = {};
    if (startTime && endTime) {
      timeFilter['createdAt'] = Between(startTime, endTime);
    } else if (startTime) {
      timeFilter['createdAt'] = MoreThanOrEqual(startTime);
    } else if (endTime) {
      timeFilter['createdAt'] = LessThanOrEqual(endTime);
    }

    // 3. 合并所有条件
    const finalWhere = { ...autoWhere, ...timeFilter };

    // 4. 处理排序
    const order: any = {};
    if (sortField) {
      order[sortField] = sortOrder.toUpperCase();
    }

    const [list, total] = await this.repository.findAndCount({
      where: finalWhere,
      order,
      skip: (page - 1) * limit,
      take: limit,
    });

    return { list, total, page, limit };
  }
}
