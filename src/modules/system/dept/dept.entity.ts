import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { User } from '../../user/user.entity';

@Entity('sys_dept')
export class Dept extends BaseEntity {
  @Column({ comment: '部门名称' })
  name: string;

  @Column({ comment: '父级ID', nullable: true })
  parentId: string; // ✅ 修改：UUID 是字符串

  @Column({ comment: '显示顺序', default: 0 })
  sort: number;

  @Column({ comment: '负责人', nullable: true })
  leader: string;

  @Column({ comment: '状态 (1正常 0停用)', default: true })
  status: boolean;

  @OneToMany(() => User, (user) => user.dept)
  users: User[];
}
