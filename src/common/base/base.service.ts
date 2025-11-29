import {
  Between,
  DeepPartial,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { BasePageDto } from '../dto/base-page.dto';
import { buildQueryWhere } from '../utils/query-builder';

export abstract class BaseService<T extends BaseEntity> {
  constructor(protected readonly repository: Repository<T>) {}

  async create(createDto: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(createDto);
    return await this.repository.save(entity);
  }

  async remove(id: string): Promise<void> {
    // ✅ 修改类型为 string
    await this.repository.softDelete(id);
  }

  async update(id: string, updateDto: DeepPartial<T>): Promise<T> {
    // ✅ 修改类型为 string
    await this.repository.update(id, updateDto as any);
    return this.findOne(id);
  }

  async findOne(id: string): Promise<T> {
    // ✅ 修改类型为 string
    return await this.repository.findOne({ where: { id } as any });
  }

  async list(dtoOrWhere?: any): Promise<T[]> {
    let where = dtoOrWhere;
    if (dtoOrWhere && typeof dtoOrWhere === 'object') {
      where = buildQueryWhere(dtoOrWhere);
    }
    return await this.repository.find({
      where,
      order: { createdAt: 'DESC' } as any,
    });
  }

  async page(dto: BasePageDto & any) {
    const {
      page = 1,
      limit = 10,
      startTime,
      endTime,
      sortField = 'createdAt',
      sortOrder = 'DESC',
    } = dto;
    const autoWhere = buildQueryWhere<T>(dto);

    const timeFilter: any = {};
    if (startTime && endTime) {
      timeFilter['createdAt'] = Between(startTime, endTime);
    } else if (startTime) {
      timeFilter['createdAt'] = MoreThanOrEqual(startTime);
    } else if (endTime) {
      timeFilter['createdAt'] = LessThanOrEqual(endTime);
    }

    const finalWhere = { ...autoWhere, ...timeFilter };
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
