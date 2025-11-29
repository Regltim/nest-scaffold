import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BaseService } from '../../common/base/base.service';
import { User } from './user.entity';
import { Role } from '../rbac/role.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService extends BaseService<User> implements OnModuleInit {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {
    super(userRepo);
  }

  /**
   * 系统启动初始化
   */
  async onModuleInit() {
    await this.initAdmin();
  }

  private async initAdmin() {
    let adminRole = await this.roleRepo.findOne({ where: { code: 'admin' } });
    if (!adminRole) {
      this.logger.log('初始化: 创建 admin 角色...');
      adminRole = this.roleRepo.create({ name: '超级管理员', code: 'admin' });
      await this.roleRepo.save(adminRole);
    }

    const adminUser = await this.userRepo.findOne({
      where: { username: 'admin' },
    });
    if (!adminUser) {
      this.logger.log('初始化: 创建 admin 账号 (密码: 123456)...');
      const hashedPassword = bcrypt.hashSync('123456', 10);
      const newUser = this.userRepo.create({
        username: 'admin',
        password: hashedPassword,
        nickname: 'Super Admin',
        roles: [adminRole],
        isActive: true,
      });
      await this.userRepo.save(newUser);
    }
  }

  /**
   * 使用 QueryBuilder 查询带密码的用户信息 (用于登录)
   */
  async findByUsername(username: string): Promise<User | undefined> {
    return this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.username = :username', { username })
      .leftJoinAndSelect('user.roles', 'roles')
      .getOne();
  }

  /**
   * 获取用户完整画像 (角色+权限)
   */
  async findProfile(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) throw new Error('用户不存在');

    const roleCodes = user.roles.map((r) => r.code);
    const permissions = user.roles.reduce((acc, role) => {
      const perms = role.permissions ? role.permissions.map((p) => p.code) : [];
      return [...acc, ...perms];
    }, [] as string[]);

    return {
      ...user,
      roles: roleCodes,
      permissions: [...new Set(permissions)],
    };
  }

  /**
   * 给用户分配角色
   */
  async setRoles(userId: number, roleIds: number[]) {
    const user = await this.findOne(userId);
    if (!user) throw new Error('用户不存在');

    user.roles = await this.roleRepo.find({ where: { id: In(roleIds) } });

    return this.userRepo.save(user);
  }

  /**
   * ✅ 关键方法：暴露 Repository 给外部 (如 AuthService) 使用
   */
  public repo(): Repository<User> {
    return this.userRepo;
  }

  // 为数据权限拦截器提供查询 (需要查 Role.depts)
  async findUserWithRolesAndDepts(userId: number) {
    return this.userRepo.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.depts', 'dept'],
    });
  }
}
