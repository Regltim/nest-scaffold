import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { DiscoveryModule } from '@nestjs/core';
import { DictType } from './dict/dict-type.entity';
import { DictData } from './dict/dict-data.entity';
import { OperLog } from './log/oper-log.entity';
import { Permission } from '../rbac/permission.entity';
import { Role } from '../rbac/role.entity';
import { DictController } from './dict/dict.controller';
import { MonitorController } from './monitor/monitor.controller';
import { SyncController } from './sync/sync.controller';
import { DictService } from './dict/dict.service';
import { TaskService } from './task/task.service';
import { SyncService } from './sync/sync.service';
import { OnlineController } from './monitor/online.controller';

@Module({
  imports: [
    // 确保引入了 Permission 和 Role，因为 SyncService 要操作它们
    TypeOrmModule.forFeature([DictType, DictData, OperLog, Permission, Role]),
    TerminusModule,
    HttpModule,
    DiscoveryModule,
  ],
  controllers: [
    DictController,
    MonitorController,
    SyncController,
    OnlineController,
  ],
  providers: [DictService, TaskService, SyncService],
  exports: [DictService],
})
export class SystemModule {}
