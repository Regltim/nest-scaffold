import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

// 1. 定义需要脱敏的字段
const SENSITIVE_KEYS = [
  'password',
  'oldPass',
  'newPass',
  'token',
  'accessToken',
  'authorization',
  'access_token',
];

// 2. 递归脱敏函数
const maskSensitiveData = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  // 处理数组
  if (Array.isArray(data)) {
    return data.map(maskSensitiveData);
  }

  // 处理 Buffer (文件流不记录)
  if (Buffer.isBuffer(data)) {
    return '[Binary Data]';
  }

  // 深度拷贝并脱敏
  const newData = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      if (
        SENSITIVE_KEYS.includes(key) ||
        SENSITIVE_KEYS.includes(key.toLowerCase())
      ) {
        newData[key] = '******';
      } else {
        newData[key] = maskSensitiveData(data[key]);
      }
    }
  }
  return newData;
};

// 3. 自定义 Winston Format (拦截日志内容进行处理)
const sensitiveMaskFormat = winston.format((info) => {
  // 处理 metadata (NestJS 的额外参数通常在这里)
  // ✅ 修复：添加 'as any[]' 类型断言，解决 TS2339 错误
  const splat = info[Symbol.for('splat') as any] as any[];

  if (splat && splat.length > 0) {
    info[Symbol.for('splat') as any] = splat.map(maskSensitiveData);
  }

  // 处理 message 本身如果是对象的情况
  if (typeof info.message === 'object') {
    info.message = maskSensitiveData(info.message);
  }

  // 处理 info 对象中的其他属性 (context 除外)
  for (const key of Object.keys(info)) {
    if (
      key !== 'level' &&
      key !== 'message' &&
      key !== 'timestamp' &&
      key !== 'context' &&
      key !== 'ms'
    ) {
      info[key] = maskSensitiveData(info[key]);
    }
  }

  return info;
});

// 4. 配置导出
export const winstonConfig = {
  transports: [
    // --- 控制台输出 (开发环境友好) ---
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // 可读时间格式
        winston.format.ms(), // 显示距离上次日志的时间差 (+3ms)
        sensitiveMaskFormat(), // 应用脱敏
        nestWinstonModuleUtilities.format.nestLike('NestAdmin', {
          colors: true, // 开启颜色
          prettyPrint: true, // 对象展开显示，清晰明了
        }),
      ),
    }),

    // --- 文件输出 (生产环境存档) ---
    new DailyRotateFile({
      dirname: 'logs',
      filename: 'application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true, // 归档压缩
      maxSize: '20m',
      maxFiles: '14d', // 保留 14 天
      format: winston.format.combine(
        winston.format.timestamp(),
        sensitiveMaskFormat(), // 应用脱敏
        winston.format.json(), // 文件存 JSON 格式，方便日志系统解析
      ),
    }),

    // (可选) 单独记录错误日志
    new DailyRotateFile({
      dirname: 'logs',
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error', // 只记录 error 级别
      format: winston.format.combine(
        winston.format.timestamp(),
        sensitiveMaskFormat(),
        winston.format.json(),
      ),
    }),
  ],
};
