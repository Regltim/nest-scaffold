import { SetMetadata } from '@nestjs/common';

export const KEEP_KEY = 'common:keep';

/**
 * 保持原样返回，不进行统一响应封装
 * 用于 Swagger 登录等需要标准 OAuth2 格式的接口
 */
export const Keep = () => SetMetadata(KEEP_KEY, true);
