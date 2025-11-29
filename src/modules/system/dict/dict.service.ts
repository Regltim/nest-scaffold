import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DictType } from './dict-type.entity';
import { DictData } from './dict-data.entity';
import {
  CreateDictDataDto,
  CreateDictTypeDto,
  DictDataPageDto,
  UpdateDictDataDto,
  UpdateDictTypeDto,
} from './dict.dto';

@Injectable()
export class DictService {
  constructor(
    @InjectRepository(DictType)
    private readonly typeRepo: Repository<DictType>,
    @InjectRepository(DictData)
    private readonly dataRepo: Repository<DictData>,
  ) {}

  // --- 字典类型 ---

  async createType(dto: CreateDictTypeDto) {
    return this.typeRepo.save(this.typeRepo.create(dto));
  }

  async updateType(dto: UpdateDictTypeDto) {
    return this.typeRepo.update(dto.id, dto);
  }

  async deleteType(id: string) {
    // 可以在这里加校验：如果该类型下有数据，禁止删除
    return this.typeRepo.softDelete(id);
  }

  async listType() {
    return this.typeRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getType(id: string) {
    return this.typeRepo.findOneBy({ id });
  }

  // --- 字典数据 ---

  async createData(dto: CreateDictDataDto) {
    return this.dataRepo.save(this.dataRepo.create(dto));
  }

  async updateData(dto: UpdateDictDataDto) {
    return this.dataRepo.update(dto.id, dto);
  }

  async deleteData(id: string) {
    return this.dataRepo.softDelete(id);
  }

  /**
   * 分页查询字典数据 (管理后台用)
   */
  async pageData(dto: DictDataPageDto) {
    const { page = 1, limit = 10, dictType, label } = dto;
    const query = this.dataRepo.createQueryBuilder('data');

    if (dictType) {
      query.andWhere('data.dictType = :dictType', { dictType });
    }
    if (label) {
      query.andWhere('data.label LIKE :label', { label: `%${label}%` });
    }

    query.orderBy('data.sort', 'ASC');
    query.addOrderBy('data.createdAt', 'DESC');
    query.skip((page - 1) * limit).take(limit);

    const [list, total] = await query.getManyAndCount();
    return { list, total, page, limit };
  }

  /**
   * ✅ 核心功能：根据字典类型获取数据列表 (前端下拉框用)
   * 缓存建议：这里非常适合加 Redis 缓存
   */
  async getDataByType(type: string) {
    return this.dataRepo.find({
      where: { dictType: type, status: true },
      order: { sort: 'ASC' },
    });
  }
}
