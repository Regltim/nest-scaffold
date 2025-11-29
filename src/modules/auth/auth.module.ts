import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // 👈 引入 TypeOrmModule
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module';

// 👇 引入日志相关
import { LoginLog } from '../system/log/login-log.entity';
import { LoginLogService } from '../system/log/login-log.service';

@Module({
  imports: [
    // 解决循环依赖
    forwardRef(() => UserModule),

    PassportModule,

    // 👇 关键修复 1: 注册 LoginLog 实体，否则 Service 里的 InjectRepository 会报错
    TypeOrmModule.forFeature([LoginLog]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '7d' }, // 这里建议用 config 读取，或者保持硬编码也可
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    // 👇 关键修复 2: 注册 LoginLogService
    LoginLogService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
