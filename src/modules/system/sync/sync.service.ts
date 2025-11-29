import { Injectable, Logger } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../../rbac/permission.entity';
import { Role } from '../../rbac/role.entity';
import { DECORATORS } from '@nestjs/swagger/dist/constants'; // 获取 Swagger 的元数据 Key

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly discovery: DiscoveryService,
    private readonly scanner: MetadataScanner,
    private readonly reflector: Reflector,
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  /**
   * 核心方法：扫描并同步 API 到数据库
   */
  async syncApiToDb() {
    this.logger.log('开始扫描系统接口...');

    // 1. 获取所有 Controller
    const controllers = this.discovery.getControllers();

    // 2. 查找 Admin 角色 (用于自动赋权)
    const adminRole = await this.roleRepo.findOne({
      where: { code: 'admin' },
      relations: ['permissions'],
    });

    const newPermissions: Permission[] = [];

    // 3. 遍历 Controller
    for (const wrapper of controllers) {
      const { instance, metatype } = wrapper;
      if (!instance || !metatype) continue;

      // 获取 Controller 上的 @ApiTags 作为“菜单名称”
      const apiTags = this.reflector.get(DECORATORS.API_TAGS, metatype);
      const moduleName = apiTags ? apiTags[0] : metatype.name;

      // 生成模块的 Code (例如 UserController -> user)
      const moduleCode = metatype.name.replace('Controller', '').toLowerCase();

      // --- A. 创建/更新 模块级权限 (作为父节点) ---
      let parentPerm = await this.permRepo.findOne({
        where: { code: `${moduleCode}:mgr` },
      });
      if (!parentPerm) {
        parentPerm = this.permRepo.create({
          name: `${moduleName}管理`,
          code: `${moduleCode}:mgr`,
          type: 'menu',
          parentId: null,
          sort: 0,
        });
        await this.permRepo.save(parentPerm);
        newPermissions.push(parentPerm);
        this.logger.log(`>> 创建菜单: ${moduleName}`);
      }

      // 4. 遍历 Controller 下的所有方法
      const methods = this.scanner.getAllMethodNames(
        Object.getPrototypeOf(instance),
      );

      for (const methodName of methods) {
        const methodHandler = instance[methodName];

        // 获取 @ApiOperation 的 summary 作为“权限名称”
        const apiOperation = this.reflector.get(
          DECORATORS.API_OPERATION,
          methodHandler,
        );
        if (!apiOperation) continue; // 如果没写 Swagger 文档，跳过

        // 获取 @Roles，如果没有 Role 限制，默认不需要录入权限表(或者是公共接口)
        // const roles = this.reflector.get('roles', methodHandler);

        const permName = apiOperation.summary;
        const permCode = `${moduleCode}:${methodName}`; // 生成标识: user:create

        // --- B. 创建/更新 按钮级权限 ---
        let childPerm = await this.permRepo.findOne({
          where: { code: permCode },
        });
        if (!childPerm) {
          childPerm = this.permRepo.create({
            name: permName,
            code: permCode,
            type: 'button',
            parentId: parentPerm.id,
            sort: 0,
          });
          await this.permRepo.save(childPerm);
          newPermissions.push(childPerm);
          this.logger.log(`   -- 创建权限: ${permName} (${permCode})`);
        }
      }
    }

    // 5. 自动将新发现的权限赋予给 Admin 角色
    if (adminRole && newPermissions.length > 0) {
      adminRole.permissions = [...adminRole.permissions, ...newPermissions];
      await this.roleRepo.save(adminRole);
      this.logger.log(
        `已将 ${newPermissions.length} 个新权限自动赋予 Admin 角色`,
      );
    }

    return {
      msg: '接口同步完成',
      added: newPermissions.length,
      details: newPermissions.map((p) => p.name),
    };
  }
}
