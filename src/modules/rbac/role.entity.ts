import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { Permission } from './permission.entity';

@Entity('sys_roles')
export class Role extends BaseEntity {
  @Column({ unique: true, comment: '角色名' })
  name: string;

  @Column({ unique: true, comment: '角色编码' }) // 如 'admin'
  code: string;

  @ManyToMany(() => Permission)
  @JoinTable({ name: 'sys_role_permissions' })
  permissions: Permission[];
}
