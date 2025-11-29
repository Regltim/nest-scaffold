# NestJS Enterprise Admin Scaffold (NestJS 企业级管理后台脚手架)

[![NestJS](https://img.shields.io/badge/NestJS-10.x-red.svg)](https://nestjs.com/)
[![TypeORM](https://img.shields.io/badge/TypeORM-0.3.x-orange.svg)](https://typeorm.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

基于 **NestJS + TypeORM + MySQL + Redis** 构建的现代化、生产级后台管理系统脚手架。
内置 **RBAC 动态权限**、**数据权限隔离**、**低代码查询引擎**、**代码生成器** 等核心功能，开箱即用。

---

## ✨ 核心特性 (Features)

### 🏗️ 深度封装的基础设施
- **Docker 一键部署**: 包含 App, MySQL, Redis 的编排配置，环境搭建零成本。
- **通用 CRUD 内核**:
  - `BaseService` / `BaseController`: 继承即拥有标准的增删改查接口。
  - **智能查询引擎**:
    - `@QueryType` 装饰器：自动将 DTO 转换为 SQL 条件（支持 Like, Equal, In, Between）。
    - 自动处理分页 (`page`, `limit`)、排序 (`sort`)、时间范围 (`startTime`, `endTime`)。
- **性能优化**:
  - **响应缓存**: 集成 Redis 缓存，支持 `@CacheTTL` 接口级缓存控制。
  - **全局拦截**: 统一响应封装、全局异常处理、Winston 日志系统 (按天切割)。

### 🔐 企业级安全体系
- **多重鉴权**:
  - **JWT**: 标准 Token 认证。
  - **OAuth2**: 支持 Swagger/Knife4j 直接登录调试。
  - **混合白名单**: 支持 `@Public()` 装饰器和 Redis 动态配置接口白名单。
- **安全防护**:
  - **安全退出**: 基于 Redis 黑名单机制实现 Token 主动失效。
  - **接口限流**: 全局 Rate Limiting (Throttler)，防止暴力破解。
  - **在线用户监控**: 实时监控在线用户，支持强制踢下线。

### 🛡️ RBAC 与 数据权限
- **完整组织架构**: 用户 - 部门 - 角色 - 权限 (菜单/按钮) 多对多关联。
- **功能权限**:
  - **接口级**: `@Roles('admin')` 守卫拦截。
  - **菜单级**: 递归生成前端所需的树形菜单结构。
  - **API 自动同步**: 一键扫描代码自动生成权限数据并赋权给 Admin。
- **数据权限 (Data Scope)**:
  - 基于 `@DataScope` 装饰器和拦截器。
  - 支持 5 种数据范围：全部、本部门、本部门及以下、仅本人、自定义部门。

### 🧩 丰富的业务模块
- **系统监控**:
  - **服务监控**: 监控 CPU、内存、数据库、Redis 健康状态 (Health Check)。
  - **审计日志**: `@Log` 装饰器自动记录操作人、IP、参数、耗时、结果。
  - **登录日志**: 自动解析 User-Agent 记录登录设备、IP、浏览器、操作系统。
- **开发工具**:
  - **代码生成器**: 可视化选择数据库表，一键生成 Entity/DTO/Service/Controller 代码包 (.zip)。
- **通用服务**:
  - **数据字典**: 统一管理系统静态数据，支持缓存。
  - **Excel 导出**: 通用导出服务。
  - **文件上传**: 本地存储 + 静态资源映射。
  - **邮件服务**: 发送 HTML 格式验证码。
- **文档增强**: 集成 **Knife4j**，提供全中文、侧边栏布局的接口文档。

---

## 🛠️ 快速开始 (Quick Start)

### 1. 环境准备
确保本地已安装 `Node.js (v16+)` 和 `Docker`。

### 2. 启动基础设施
```bash
docker-compose up -d
```


---

## 📂 目录结构
```src/
├── common/             # 公共模块 (基类、装饰器、过滤器、拦截器、DTO)
├── config/             # 配置相关
├── modules/            # 业务模块
│   ├── auth/           # 认证 (登录/注册/密码/Token)
│   ├── user/           # 用户管理
│   ├── rbac/           # 权限核心 (角色/菜单)
│   ├── system/         # 系统管理
│   │   ├── dept/       # 部门管理 (组织架构)
│   │   ├── dict/       # 数据字典
│   │   ├── log/        # 操作日志 & 登录日志
│   │   ├── monitor/    # 服务监控 & 在线用户
│   │   ├── task/       # 定时任务
│   │   └── sync/       # API 同步工具
│   ├── gen/            # 代码生成器
│   ├── upload/         # 文件上传
│   ├── email/          # 邮件服务
│   ├── global/         # 全局共享模块 (Excel/Redis)
│   └── whitelist/      # 白名单管理
├── main.ts             # 入口文件
└── app.module.ts       # 根模块
```