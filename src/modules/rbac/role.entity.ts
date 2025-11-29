import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { Permission } from './permission.entity';
import { Dept } from '../system/dept/dept.entity'; // 👈

@Entity('sys_roles')
export class Role extends BaseEntity {
  @Column({ unique: true, comment: '角色名' })
  name: string;

  @Column({ unique: true, comment: '角色编码' })
  code: string;

  /**
   * 1：全部数据权限
   * 2：自定数据权限 (需关联 sys_role_depts)
   * 3：本部门数据权限
   * 4：本部门及以下数据权限
   * 5：仅本人数据权限
   */
  @Column({ comment: '数据范围 (1-5)', default: '5' })
  dataScope: string;

  @ManyToMany(() => Permission)
  @JoinTable({ name: 'sys_role_permissions' })
  permissions: Permission[];

  // ✅ 角色对应的“自定义部门权限”
  @ManyToMany(() => Dept)
  @JoinTable({ name: 'sys_role_depts' })
  depts: Dept[];
}
