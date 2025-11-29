import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../../common/base/base.service';
import { Dept } from './dept.entity';

@Injectable()
export class DeptService extends BaseService<Dept> {
  constructor(
    @InjectRepository(Dept)
    private readonly deptRepo: Repository<Dept>,
  ) {
    super(deptRepo);
  }

  async findTree() {
    const all = await this.deptRepo.find({
      order: { sort: 'ASC', createdAt: 'DESC' },
    });
    return this.buildTree(all, null);
  }

  async remove(id: string): Promise<void> {
    const childCount = await this.deptRepo.count({ where: { parentId: id } });
    if (childCount > 0) throw new BadRequestException('存在子部门，不允许删除');
    await super.remove(id);
  }

  private buildTree(items: Dept[], parentId: string | null): any[] {
    // ✅ parentId: string
    return items
      .filter((item) => item.parentId === parentId)
      .map((item) => ({
        ...item,
        children: this.buildTree(items, item.id),
      }));
  }
}
