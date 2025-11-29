import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { DiscoveryModule } from '@nestjs/core';

// Entity
import { DictType } from './dict/dict-type.entity';
import { DictData } from './dict/dict-data.entity';
import { OperLog } from './log/oper-log.entity';
import { LoginLog } from './log/login-log.entity';
import { Permission } from '../rbac/permission.entity';
import { Role } from '../rbac/role.entity';
import { Dept } from './dept/dept.entity';

// Controller
import { MonitorController } from './monitor/monitor.controller';
import { OnlineController } from './monitor/online.controller';
import { SyncController } from './sync/sync.controller';
import { DeptController } from './dept/dept.controller';
// 👇 替换旧的 DictController
import { DictTypeController } from './dict/dict-type.controller';
import { DictDataController } from './dict/dict-data.controller';

// Service
import { DictService } from './dict/dict.service';
import { TaskService } from './task/task.service';
import { SyncService } from './sync/sync.service';
import { LoginLogService } from './log/login-log.service';
import { DeptService } from './dept/dept.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DictType,
      DictData,
      OperLog,
      LoginLog,
      Permission,
      Role,
      Dept,
    ]),
    TerminusModule,
    HttpModule,
    DiscoveryModule,
  ],
  controllers: [
    DictTypeController,
    DictDataController,
    MonitorController,
    OnlineController,
    SyncController,
    DeptController,
  ],
  providers: [
    DictService,
    TaskService,
    SyncService,
    LoginLogService,
    DeptService,
  ],
  exports: [DictService, DeptService],
})
export class SystemModule {}
