import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DictType } from './dict-type.entity';
import { DictData } from './dict-data.entity';
import { CreateDictDataDto, CreateDictTypeDto } from './dict.dto';

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

  async listType() {
    return this.typeRepo.find({ order: { createdAt: 'DESC' } });
  }

  // --- 字典数据 ---
  async createData(dto: CreateDictDataDto) {
    return this.dataRepo.save(this.dataRepo.create(dto));
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

  async deleteType(id: number) {
    return this.typeRepo.softDelete(id);
  }

  async deleteData(id: number) {
    return this.dataRepo.softDelete(id);
  }
}
