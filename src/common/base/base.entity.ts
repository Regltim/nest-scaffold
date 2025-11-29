import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid') // ✅ 修改：使用 UUID 生成策略
  id: string;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间', select: false })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', select: false, comment: '删除时间' })
  deletedAt: Date;
}
