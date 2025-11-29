import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './role.entity';
import { Permission } from './permission.entity';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission])], // 注册 Entity
  controllers: [RoleController, PermissionController], // 注册 Controller
  providers: [RoleService, PermissionService], // 注册 Service
  exports: [TypeOrmModule, RoleService, PermissionService], // 导出供 UserModule 使用
})
export class RbacModule {}
