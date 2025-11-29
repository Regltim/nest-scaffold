/**
 * 下划线转帕斯卡 (SysUserLog -> SysUserLog)
 */
export function toPascalCase(str: string): string {
  if (!str) return ''; // ✅ 防御性代码：如果是空，直接返回
  return str.replace(/(^|_)(\w)/g, (_all, _sep, letter) =>
    letter.toUpperCase(),
  );
}

/**
 * 下划线转小驼峰 (sys_user_log -> sysUserLog)
 */
export function toCamelCase(str: string): string {
  if (!str) return ''; // ✅ 防御性代码
  return str.replace(/_(\w)/g, (_all, letter) => letter.toUpperCase());
}

/**
 * 转短横线 (sys_user_log -> sys-user-log)
 */
export function toKebabCase(str: string): string {
  if (!str) return ''; // ✅ 防御性代码
  return str.replace(/_/g, '-');
}
