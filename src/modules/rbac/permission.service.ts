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

  /**
   * 获取权限树 (递归构建)
   */
  async findTree() {
    const all = await this.permRepo.find({ order: { sort: 'ASC' } });
    return this.buildTree(all, null);
  }

  /**
   * 递归辅助函数
   */
  private buildTree(items: Permission[], parentId: number | null): any[] {
    return items
      .filter((item) => item.parentId === parentId) // 找到当前父节点下的子节点
      .map((item) => ({
        ...item,
        children: this.buildTree(items, item.id), // 递归查找子节点
      }));
  }
}
