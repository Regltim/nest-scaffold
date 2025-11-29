/**
 * 下划线转帕斯卡 (SysUserLog)
 */
export function toPascalCase(str: string): string {
  return str.replace(/(^|_)(\w)/g, (_all, _sep, letter) =>
    letter.toUpperCase(),
  );
}

/**
 * 下划线转小驼峰 (sysUserLog)
 */
export function toCamelCase(str: string): string {
  return str.replace(/_(\w)/g, (_all, letter) => letter.toUpperCase());
}
/**
 * 转短横线 (sys-user-log) - 用于文件名
 */
export function toKebabCase(str: string): string {
  return str.replace(/_/g, '-');
}
