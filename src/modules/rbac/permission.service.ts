import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../common/base/base.service';
import { Permission } from './permission.entity';

@Injectable()
export class PermissionService extends BaseService<Permission> {
  constructor(
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
  ) {
    super(permRepo);
  }

  async findTree() {
    const all = await this.permRepo.find({ order: { sort: 'ASC' } });
    return this.buildTree(all, null);
  }

  private buildTree(items: Permission[], parentId: string | null): any[] {
    // ✅ parentId: string
    return items
      .filter((item) => item.parentId === parentId)
      .map((item) => ({
        ...item,
        children: this.buildTree(items, item.id),
      }));
  }
}
