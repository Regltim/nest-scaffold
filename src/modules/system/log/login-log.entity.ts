import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';

@Entity('sys_login_log')
export class LoginLog extends BaseEntity {
  @Column({ comment: '登录账号', nullable: true })
  username: string;

  @Column({ comment: '登录IP', nullable: true })
  ip: string;

  @Column({ comment: '登录地点', nullable: true })
  location: string; // 需要集成 IP 库，暂时留空

  @Column({ comment: '浏览器', nullable: true })
  browser: string;

  @Column({ comment: '操作系统', nullable: true })
  os: string;

  @Column({ comment: '登录状态 (1成功 0失败)', default: 1 })
  status: number;

  @Column({ comment: '提示消息', nullable: true })
  message: string;

  @Column({ comment: '登录时间' })
  loginTime: Date;
}
