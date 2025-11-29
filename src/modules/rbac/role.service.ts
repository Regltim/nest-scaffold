import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BaseService } from '../../common/base/base.service';
import { Role } from './role.entity';
import { Permission } from './permission.entity';
import { Dept } from '../system/dept/dept.entity';

@Injectable()
export class RoleService extends BaseService<Role> {
  constructor(
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(Permission) private permRepo: Repository<Permission>,
    @InjectRepository(Dept) private deptRepo: Repository<Dept>,
  ) {
    super(roleRepo);
  }

  async assignPermissions(roleId: number, permIds: number[]) {
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) throw new Error('角色不存在');
    role.permissions = await this.permRepo.find({ where: { id: In(permIds) } });
    return this.roleRepo.save(role);
  }

  async getRolePermissions(roleId: number) {
    const role = await this.roleRepo.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });
    return role ? role.permissions.map((p) => p.id) : [];
  }

  // ✅ 新增：分配数据权限
  async assignDataScope(roleId: number, dataScope: string, deptIds: number[]) {
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) throw new Error('角色不存在');

    role.dataScope = dataScope;
    // 如果是“自定义”，则关联部门；否则清空
    if (dataScope === '2' && deptIds && deptIds.length > 0) {
      role.depts = await this.deptRepo.findBy({ id: In(deptIds) });
    } else {
      role.depts = [];
    }
    return this.roleRepo.save(role);
  }
}
