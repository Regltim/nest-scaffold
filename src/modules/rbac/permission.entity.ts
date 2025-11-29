import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';

@Entity('sys_permissions')
export class Permission extends BaseEntity {
  @Column({ comment: '权限名称/菜单标题' })
  name: string;

  @Column({ comment: '权限标识', unique: true })
  code: string;

  @Column({ comment: '类型: menu(菜单) / button(按钮)', default: 'menu' })
  type: string;

  @Column({ comment: '父级ID', nullable: true })
  parentId: string;

  @Column({ comment: '排序', default: 0 })
  sort: number;

  @Column({ comment: '路由路径', nullable: true })
  path: string;
}
