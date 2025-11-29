import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { DictType } from './dict-type.entity';

@Entity('sys_dict_data')
export class DictData extends BaseEntity {
  @Column({ type: 'int', comment: '字典排序', default: 0 })
  sort: number;

  @Column({ type: 'varchar', comment: '字典标签' })
  label: string; // 例如：男

  @Column({ type: 'varchar', comment: '字典键值' })
  value: string; // 例如：1

  @Index()
  @Column({ comment: '字典类型' })
  dictType: string; // 冗余字段，方便直接查询，例如：sys_user_sex

  @Column({ type: 'boolean', comment: '是否默认 (1是 0否)', default: false })
  isDefault: boolean;

  @Column({ type: 'boolean', comment: '状态 (1正常 0停用)', default: true })
  status: boolean;

  // 关联类型
  // 注意：ManyToOne 不需要加 @Column，TypeORM 会自动处理外键
  @ManyToOne(() => DictType, (type) => type.dictDatas)
  @JoinColumn({ name: 'dict_type_id' })
  dictTypeObj: DictType;
}
