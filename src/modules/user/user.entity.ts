import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { Exclude } from 'class-transformer';
import { Role } from '../rbac/role.entity';
import { Dept } from '../system/dept/dept.entity';

@Entity('sys_users')
export class User extends BaseEntity {
  @Column({ unique: true, comment: '用户名' })
  username: string;

  @Column({ comment: '密码', select: false })
  @Exclude() // 返回前端时隐藏密码
  password: string;

  @Column({ comment: '昵称', nullable: true })
  nickname: string;

  @Column({ comment: '邮箱', nullable: true })
  email: string;

  @Column({ comment: '头像', nullable: true })
  avatar: string;

  @Column({ default: true, comment: '状态: 1启用 0禁用' })
  isActive: boolean;

  // 多对多关联角色
  @ManyToMany(() => Role)
  @JoinTable({ name: 'sys_user_roles' })
  roles: Role[];

  @ManyToOne(() => Dept, (dept) => dept.users)
  @JoinColumn({ name: 'dept_id' })
  dept: Dept;

  @Column({ name: 'dept_id', nullable: true })
  deptId: number;
}
