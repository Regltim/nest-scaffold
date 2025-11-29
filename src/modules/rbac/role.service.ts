import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BaseService } from '../../common/base/base.service';
import { Role } from './role.entity';
import { Permission } from './permission.entity';

@Injectable()
export class RoleService extends BaseService<Role> {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
  ) {
    super(roleRepo);
  }

  /**
   * 给角色分配权限
   */
  async assignPermissions(roleId: number, permIds: number[]) {
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) throw new Error('角色不存在');

    // 查询权限列表
    const perms = await this.permRepo.find({
      where: { id: In(permIds) },
    });

    // 更新关联
    role.permissions = perms;
    return this.roleRepo.save(role);
  }

  /**
   * 获取某个角色的所有权限ID (用于前端回显勾选状态)
   */
  async getRolePermissions(roleId: number) {
    const role = await this.roleRepo.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });
    return role ? role.permissions.map((p) => p.id) : [];
  }
}