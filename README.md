# NestJS 企业级脚手架 (NestJS Enterprise Scaffold)

基于 NestJS + TypeORM + MySQL + Redis 构建的企业级后台管理系统脚手架。

## ✅ 已完成功能清单 (Completed Features)

### 1. 核心基建
- [x] **Docker 部署**: 包含 App, MySQL, Redis 的 `docker-compose` 一键启动。
- [x] **通用 CRUD**: 基于 `BaseService` 和 `BaseController` 的泛型增删改查。
- [x] **智能查询**:
  - `@QueryType` 装饰器：自动将 DTO 转换为 SQL 查询条件（支持模糊、精确、IN 查询）。
  - 自动处理分页、排序、时间范围查询。
- [x] **全局处理**: 统一响应格式、全局异常拦截、Swagger 文档、Winston 日志记录。

### 2. 安全与鉴权
- [x] **JWT 认证**: 登录、注册、Token 校验。
- [x] **RBAC 权限**: 用户-角色-权限（菜单）的完整数据库模型与关联。
- [x] **混合白名单**: 支持 `@Public()` 装饰器和 Redis 动态接口白名单。
- [x] **安全退出**: 基于 Redis 黑名单机制使 Token 失效。
- [x] **接口限流**: 全局 Rate Limiting 防止暴力请求。
- [x] **密码管理**: 修改密码、邮件验证码重置密码。

### 3. 业务功能
- [x] **用户管理**: 用户画像、角色分配、操作审计日志。
- [x] **角色管理**: 角色增删改查、分配权限。
- [x] **权限/菜单管理**: 树形菜单查询、权限管理。
- [x] **文件上传**: 本地存储 + 静态资源映射。
- [x] **邮件服务**: 发送 HTML 验证码。
- [x] **Excel 导出**: 通用导出服务。
- [x] **操作审计**: 自动记录所有写操作日志到数据库。

## 🛠️ 快速开始

1. 安装依赖: `npm install`
2. 启动容器: `docker-compose up -d`
3. 运行服务: `npm run start:dev`
4. 接口文档: `http://localhost:3000/doc`

## 默认账号
- 用户名: `admin`
- 密码: `123456`