import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'; // 👈 限流
import { RedisModule } from './modules/global/redis.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email/email.module';
import { UploadModule } from './modules/upload/upload.module';
import { WhitelistModule } from './modules/whitelist/whitelist.module';
import { OperLog } from './modules/system/log/oper-log.entity';
import { OperLogInterceptor } from './common/interceptors/oper-log.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { SharedModule } from './modules/global/shared.module';

@Module({
  imports: [
    // 1. 配置模块
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] }),

    // 2. 数据库
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([OperLog]), // 注册日志实体

    // 3. ✅ 接口限流配置 (例如: 60秒内最多 60 次请求)
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),

    // 4. 业务模块
    RedisModule,
    RbacModule,
    UserModule,
    AuthModule,
    EmailModule,
    UploadModule,
    WhitelistModule,
    SharedModule,
  ],
  providers: [
    // 全局守卫 (JWT + 黑名单)
    { provide: APP_GUARD, useClass: JwtAuthGuard },

    // ✅ 全局限流守卫 (注意：这会和 JwtAuthGuard 并存)
    { provide: APP_GUARD, useClass: ThrottlerGuard },

    // 全局异常过滤
    { provide: APP_FILTER, useClass: AllExceptionsFilter },

    // 全局日志拦截
    { provide: APP_INTERCEPTOR, useClass: OperLogInterceptor },
  ],
})
export class AppModule {}
