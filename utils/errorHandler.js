/**
 * 统一错误处理模块
 * 提供错误分类、降级处理、用户提示等功能
 */

// 错误类型枚举
export const ErrorType = {
  NETWORK: 'NETWORK',       // 网络错误
  SERVER: 'SERVER',         // 服务器错误
  AUTH: 'AUTH',             // 认证错误
  VALIDATION: 'VALIDATION', // 参数校验错误
  BUSINESS: 'BUSINESS',     // 业务逻辑错误
  UNKNOWN: 'UNKNOWN'        // 未知错误
};

// 错误码映射
const ERROR_CODE_MAP = {
  400: { type: ErrorType.VALIDATION, message: '请求参数错误' },
  401: { type: ErrorType.AUTH, message: '登录已过期，请重新登录' },
  403: { type: ErrorType.AUTH, message: '没有权限执行此操作' },
  404: { type: ErrorType.SERVER, message: '请求的资源不存在' },
  422: { type: ErrorType.VALIDATION, message: '数据校验失败' },
  429: { type: ErrorType.BUSINESS, message: '请求过于频繁，请稍后再试' },
  500: { type: ErrorType.SERVER, message: '服务器内部错误' },
  502: { type: ErrorType.SERVER, message: '网关错误' },
  503: { type: ErrorType.SERVER, message: '服务暂时不可用' },
  504: { type: ErrorType.SERVER, message: '网关超时' }
};

/**
 * 解析错误类型
 * @param {Error|Object} error - 错误对象
 * @returns {Object} 错误信息对象
 */
export function parseError(error) {
  // 网络请求错误
  if (error.statusCode) {
    const mapped = ERROR_CODE_MAP[error.statusCode];
    if (mapped) {
      return {
        type: mapped.type,
        code: error.statusCode,
        message: error.message || mapped.message,
        detail: error.detail || null
      };
    }
    return {
      type: ErrorType.SERVER,
      code: error.statusCode,
      message: error.message || `服务器错误 (${error.statusCode})`,
      detail: null
    };
  }
  
  // 网络连接错误
  if (error.errMsg && (error.errMsg.includes('fail') || error.errMsg.includes('timeout'))) {
    return {
      type: ErrorType.NETWORK,
      code: -1,
      message: '网络连接失败，请检查网络设置',
      detail: error.errMsg
    };
  }
  
  // 业务错误
  if (error.code && error.message) {
    return {
      type: ErrorType.BUSINESS,
      code: error.code,
      message: error.message,
      detail: error.detail || null
    };
  }
  
  // 未知错误
  return {
    type: ErrorType.UNKNOWN,
    code: -999,
    message: error.message || '发生未知错误',
    detail: error.stack || null
  };
}

/**
 * 显示错误提示
 * @param {Object} errorInfo - 解析后的错误信息
 * @param {Object} options - 显示选项
 */
export function showErrorTip(errorInfo, options = {}) {
  const { showToast = true, showModal = false, title = '提示' } = options;
  
  const message = errorInfo.message || '操作失败';
  
  if (showModal) {
    uni.showModal({
      title,
      content: message,
      showCancel: false,
      confirmText: '知道了'
    });
  } else if (showToast) {
    uni.showToast({
      title: message,
      icon: 'none',
      duration: 3000
    });
  }
}

/**
 * 处理认证错误（401/403）
 * @param {Object} errorInfo - 错误信息
 * @returns {boolean} 是否已处理
 */
export function handleAuthError(errorInfo) {
  if (errorInfo.type === ErrorType.AUTH) {
    uni.showModal({
      title: '登录已过期',
      content: '您的登录状态已过期，请重新登录',
      showCancel: false,
      confirmText: '去登录',
      success: () => {
        // 清除登录状态
        uni.removeStorageSync('token');
        uni.removeStorageSync('userInfo');
        uni.removeStorageSync('userRole');
        // 跳转到登录页
        uni.reLaunch({ url: '/pages/index/index' });
      }
    });
    return true;
  }
  return false;
}

/**
 * 错误降级处理 - 仅用于在线功能的优雅降级
 * @param {Object} errorInfo - 错误信息
 * @param {Object} fallbackData - 降级数据（如空数组等默认值）
 * @returns {Object} 处理结果
 */
export function handleFallback(errorInfo, fallbackData = null) {
  // 服务器错误时返回默认值，保持界面可用
  if (errorInfo.type === ErrorType.SERVER) {
    return {
      useFallback: true,
      data: fallbackData || [],
      message: '服务器暂时不可用'
    };
  }
  
  return {
    useFallback: false,
    data: null,
    message: errorInfo.message
  };
}

/**
 * 统一的错误处理函数
 * @param {Error} error - 错误对象
 * @param {Object} options - 处理选项
 * @returns {Object} 处理结果
 */
export function handleError(error, options = {}) {
  const {
    showTip = true,
    rethrow = false,
    context = ''
  } = options;
  
  // 解析错误
  const errorInfo = parseError(error);
  
  // 记录错误日志
  console.error(`[Error${context ? ` - ${context}` : ''}]`, {
    type: errorInfo.type,
    code: errorInfo.code,
    message: errorInfo.message,
    detail: errorInfo.detail
  });
  
  // 认证错误特殊处理
  if (handleAuthError(errorInfo)) {
    return { handled: true, errorInfo };
  }
  
  // 显示错误提示
  if (showTip) {
    showErrorTip(errorInfo, options);
  }
  
  // 如果需要重新抛出
  if (rethrow) {
    throw error;
  }
  
  return {
    handled: true,
    errorInfo
  };
}

/**
 * 创建带错误处理的异步函数包装器
 * @param {Function} fn - 异步函数
 * @param {Object} options - 错误处理选项
 * @returns {Function}
 */
export function withErrorHandling(fn, options = {}) {
  return async function(...args) {
    try {
      return await fn.apply(this, args);
    } catch (error) {
      return handleError(error, {
        context: fn.name,
        ...options
      });
    }
  };
}

/**
 * 批量错误处理 - 部分成功时返回成功结果
 * @param {Array<Promise>} promises - Promise数组
 * @param {Object} options - 选项
 * @returns {Object} 处理结果
 */
export async function handleBatchRequests(promises, options = {}) {
  const { continueOnError = true, errorThreshold = 0.5 } = options;
  
  const results = await Promise.allSettled(promises);
  
  const successful = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
  
  const failed = results
    .filter(r => r.status === 'rejected')
    .map(r => r.reason);
  
  const errorRate = failed.length / promises.length;
  
  // 如果错误率超过阈值且不允许继续
  if (errorRate > errorThreshold && !continueOnError) {
    throw new Error(`批量请求失败率过高 (${(errorRate * 100).toFixed(1)}%)`);
  }
  
  // 记录失败的请求
  if (failed.length > 0) {
    console.warn(`[BatchRequest] ${failed.length}/${promises.length} 请求失败`);
  }
  
  return {
    successful,
    failed,
    successCount: successful.length,
    failCount: failed.length,
    errorRate
  };
}

export default {
  ErrorType,
  parseError,
  showErrorTip,
  handleAuthError,
  handleFallback,
  handleError,
  withErrorHandling,
  handleBatchRequests
};
