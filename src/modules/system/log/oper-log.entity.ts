import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';

@Entity('sys_oper_log')
export class OperLog extends BaseEntity {
  @Column({ comment: '模块标题', nullable: true })
  title: string;

  @Column({ comment: '业务类型', nullable: true })
  businessType: string; // 例如: INSERT, UPDATE, DELETE, GRANT

  @Column({ comment: '方法名称 (Controller方法名)', nullable: true })
  method: string;

  @Column({ comment: '请求方式 (GET/POST)', nullable: true })
  requestMethod: string;

  @Column({ comment: '操作人员', nullable: true })
  operName: string;

  @Column({ comment: '请求URL' })
  operUrl: string;

  @Column({ comment: '主机地址', nullable: true })
  operIp: string;

  @Column({ comment: '请求参数', type: 'text', nullable: true })
  operParam: string;

  @Column({ comment: '返回结果', type: 'text', nullable: true })
  jsonResult: string;

  @Column({ comment: '操作状态 (0正常 1异常)', default: 0 })
  status: number;

  @Column({ comment: '错误消息', nullable: true })
  errorMsg: string;
}
