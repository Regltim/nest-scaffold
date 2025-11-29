import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { DictData } from './dict-data.entity';

@Entity('sys_dict_type')
export class DictType extends BaseEntity {
  @Column({ type: 'varchar', comment: '字典名称', nullable: true })
  name: string;

  @Column({ type: 'varchar', comment: '字典类型', unique: true })
  type: string;

  @Column({ type: 'boolean', comment: '状态 (1正常 0停用)', default: true })
  status: boolean;

  @Column({ type: 'varchar', comment: '备注', nullable: true })
  remark: string;

  @OneToMany(() => DictData, (data) => data.dictTypeObj)
  dictDatas: DictData[];
}
