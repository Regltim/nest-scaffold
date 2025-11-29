import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

// 模块引入
import { RedisModule } from './modules/global/redis.module';
import { SharedModule } from './modules/global/shared.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email/email.module';
import { UploadModule } from './modules/upload/upload.module';
import { WhitelistModule } from './modules/whitelist/whitelist.module';
import { SystemModule } from './modules/system/system.module'; // ✅ 只需引入这个
import { OperLog } from './modules/system/log/oper-log.entity';
import { OperLogInterceptor } from './common/interceptors/oper-log.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoginLog } from './modules/system/log/login-log.entity';
import { LoginLogService } from './modules/system/log/login-log.service';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    // 1. 基础配置
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] }),
    ScheduleModule.forRoot(),

    // 注册缓存 (全局可用)
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        // 指定使用 redisStore
        store: redisStore as any,
        host: config.get('REDIS_HOST'),
        port: config.get('REDIS_PORT'),
        // auth_pass: config.get('REDIS_PASSWORD'), // 如果有密码
        ttl: 60 * 1000, // 默认缓存有效期 (单位: 秒，不同版本单位可能不同，建议测试)
        max: 1000,
      }),
    }),

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

    // 日志实体 (为了 Interceptor 能全局使用)
    TypeOrmModule.forFeature([OperLog]),

    // 3. 限流
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),

    // 4. 业务模块
    RedisModule,
    SharedModule,
    RbacModule,
    UserModule,
    AuthModule,
    EmailModule,
    UploadModule,
    WhitelistModule,
    SystemModule,
    TypeOrmModule.forFeature([LoginLog]),
  ],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: OperLogInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    LoginLogService,
  ],
})
export class AppModule {}
