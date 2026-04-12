/**
 * 统一日志管理工具
 * 生产环境自动禁用调试日志，保留错误日志
 */

const isDev = process.env.NODE_ENV === 'development';

/**
 * 格式化日志前缀
 * @param {string} level 日志级别
 * @param {string} module 模块名
 * @returns {string}
 */
function formatPrefix(level, module) {
  const timestamp = isDev ? `[${new Date().toLocaleTimeString()}] ` : '';
  return `${timestamp}[${level}]${module ? `[${module}]` : ''}`;
}

/**
 * 安全处理日志参数，避免输出敏感信息
 * @param {Array} args 原始参数
 * @returns {Array}
 */
function sanitizeArgs(args) {
  // 过滤掉可能包含敏感信息的对象
  return args.map(arg => {
    if (typeof arg === 'object' && arg !== null) {
      // 移除敏感字段的副本
      const sanitized = { ...arg };
      delete sanitized.password;
      delete sanitized.token;
      delete sanitized.current_password;
      delete sanitized.new_password;
      delete sanitized.old_password;
      return sanitized;
    }
    return arg;
  });
}

export const logger = {
  /**
   * 调试日志 - 仅开发环境输出
   * @param {string} module 模块名
   * @param {...any} args 日志内容
   */
  debug(module, ...args) {
    if (isDev) {
      console.log(formatPrefix('DEBUG', module), ...sanitizeArgs(args));
    }
  },

  /**
   * 信息日志 - 仅开发环境输出
   * @param {string} module 模块名
   * @param {...any} args 日志内容
   */
  info(module, ...args) {
    if (isDev) {
      console.info(formatPrefix('INFO', module), ...sanitizeArgs(args));
    }
  },

  /**
   * 警告日志 - 仅开发环境输出
   * @param {string} module 模块名
   * @param {...any} args 日志内容
   */
  warn(module, ...args) {
    if (isDev) {
      console.warn(formatPrefix('WARN', module), ...sanitizeArgs(args));
    }
  },

  /**
   * 错误日志 - 始终输出（但生产环境简化信息）
   * @param {string} module 模块名
   * @param {...any} args 日志内容
   */
  error(module, ...args) {
    if (isDev) {
      console.error(formatPrefix('ERROR', module), ...sanitizeArgs(args));
    } else {
      // 生产环境只输出模块名和简要信息
      const message = args.find(arg => typeof arg === 'string') || '发生错误';
      console.error(formatPrefix('ERROR', module), message);
    }
  },

  /**
   * 分组日志 - 仅开发环境
   * @param {string} module 模块名
   * @param {string} label 分组标签
   * @param {Function} fn 分组内执行的函数
   */
  group(module, label, fn) {
    if (isDev) {
      console.group(formatPrefix('GROUP', module), label);
      fn();
      console.groupEnd();
    }
  }
};

export default logger;
