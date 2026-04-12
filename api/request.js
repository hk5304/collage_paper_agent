/**
 * 统一请求封装 - 自动带 token、统一处理 401、返回标准格式
 * 后端需约定：{ code: 200, data: any, message?: string }
 */
import { config } from './config.js';

// ==================== 防抖节流管理 ====================
const pendingRequests = new Map();

// ==================== 错误提示管理 ====================
let lastToastTime = 0;
const TOAST_INTERVAL = 2000; // 错误提示最小间隔（毫秒）

/**
 * 显示错误提示（带防抖）
 * @param {string} message 错误信息
 * @param {boolean} force 是否强制显示
 */
function showErrorToast(message, force = false) {
  const now = Date.now();
  if (force || now - lastToastTime > TOAST_INTERVAL) {
    lastToastTime = now;
    uni.showToast({
      title: message,
      icon: 'none'
    });
  }
}

/**
 * 防抖请求 - 相同请求在指定时间内只发送一次
 */
function debounceRequest(cacheKey, requestFn, delay = 300) {
  const pending = pendingRequests.get(cacheKey);
  if (pending) {
    return pending;
  }
  
  const promise = requestFn().finally(() => {
    setTimeout(() => {
      pendingRequests.delete(cacheKey);
    }, delay);
  });
  
  pendingRequests.set(cacheKey, promise);
  return promise;
}

// ==================== 错误重试机制 ====================
const MAX_RETRY_COUNT = 3;
const RETRY_DELAY = 1000;

/**
 * 发起请求（GET/POST/PUT/DELETE）
 * @param {Object} options
 * @param {string} options.url 接口路径，如 '/api/user/login'（不要写 baseURL）
 * @param {string} [options.method='GET']
 * @param {Object} [options.data] 请求体参数 (Body)
 * @param {Object} [options.params] 查询字符串参数 (Query)
 * @param {boolean} [options.needAuth=true] 是否自动带 token
 * @param {boolean} [options.debounce=false] 是否防抖（防止重复提交）
 * @param {number} [options.retryCount=0] 失败重试次数
 * @returns {Promise<{ code: number, data: any, message?: string }>} 直接返回 res.data
 */
export function request(options) {
  const {
    url,
    method = 'GET',
    data = {},
    params = {},
    needAuth = true,
    responseType,
    timeout: customTimeout,
    debounce = false,
    retryCount = 0
  } = options;
  
  const cacheKey = `${url}:${JSON.stringify(params || {})}`;
  
  // 防抖处理
  if (debounce) {
    return debounceRequest(cacheKey, () => doRequest(options, cacheKey, retryCount));
  }
  
  return doRequest(options, cacheKey, retryCount);
}

/**
 * 实际执行请求
 */
function doRequest(options, cacheKey, retryCount = 0) {
  const {
    url,
    method = 'GET',
    data = {},
    params = {},
    needAuth = true,
    responseType,
    timeout: customTimeout
  } = options;

  let finalURL = url.startsWith('http') ? url : `${config.baseURL}${url}`;
  
  // 处理 Query 参数（拼接到 URL 后面）
  const queryKeys = Object.keys(params);
  if (queryKeys.length > 0) {
    const queryParts = [];
    queryKeys.forEach(key => {
      const val = params[key];
      if (Array.isArray(val)) {
        // 数组参数：每个元素单独拼接，如 teacher_ids=t1&teacher_ids=t2
        val.forEach(item => queryParts.push(`${key}=${encodeURIComponent(item)}`));
      } else {
        queryParts.push(`${key}=${encodeURIComponent(val)}`);
      }
    });
    finalURL += (finalURL.includes('?') ? '&' : '?') + queryParts.join('&');
  }

  const header = {
    'Content-Type': 'application/json',
    ...options.header
  };

  // 调试日志：仅在开发环境输出
  if (process.env.NODE_ENV === 'development' && options.header && options.header['X-Current-User']) {
    console.log('[Request] X-Current-User Header已设置');
  }

  if (needAuth) {
    const token = uni.getStorageSync('token');
    if (token) {
      header['Authorization'] = `Bearer ${token}`;
    }
  }

  // 构造请求参数
  const requestOptions = {
    url: finalURL,
    method,
    header,
    timeout: customTimeout || config.timeout
  };
  
  // 支持二进制响应类型（如文件下载）
  if (responseType) {
    requestOptions.responseType = responseType;
  }

  // 只有非 GET 请求才发送请求体
  // 支持 data 为对象或字符串
  if (method !== 'GET') {
    if (typeof data === 'string') {
      requestOptions.data = data;
    } else if (Object.keys(data).length > 0) {
      requestOptions.data = data;
    }
  }

  return new Promise((resolve, reject) => {
    uni.request({
      ...requestOptions,
      success(res) {
        const status = res.statusCode;
        const body = res.data || {};

        // 开发模式：401/403/404 不强制退登，让降级数据生效
        // 注意：正式上线前需要恢复 401 的强制退登逻辑
        if (status === 401 || status === 403 || status === 404) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[Request] 接口返回 ${status}`);
          }
          // 返回空数据，触发降级逻辑，但保留后端错误信息
          resolve({ code: status, data: null, message: body.detail || body.message || '接口未就绪' });
          return;
        }
        
        // 打印 422 错误的详细信息（仅开发环境）
        if (status === 422 && process.env.NODE_ENV === 'development') {
          console.error(`[Request] 接口返回 422 错误`);
        }

        if (status >= 200 && status < 300) {
          // 如果是二进制响应（如文件下载），直接返回原始数据
          if (responseType === 'arraybuffer') {
            resolve(body);
          } else {
            resolve(body);
          }
        } else {
          // 服务器错误，尝试重试
          if (retryCount < MAX_RETRY_COUNT && status >= 500) {
            if (process.env.NODE_ENV === 'development') {
              console.log(`[Request] ${url} 将在 ${RETRY_DELAY}ms 后重试 (${retryCount + 1}/${MAX_RETRY_COUNT})`);
            }
            setTimeout(() => {
              doRequest(options, cacheKey, retryCount + 1)
                .then(resolve)
                .catch(reject);
            }, RETRY_DELAY * (retryCount + 1));
            return;
          }
          
          const detail = body.detail;
          const detailStr =
            typeof detail === 'string'
              ? detail
              : Array.isArray(detail) && detail[0] && typeof detail[0].msg === 'string'
                ? detail[0].msg
                : '';
          const errText = detailStr || body.message || `请求失败 ${status}`;
          showErrorToast(errText);
          reject(new Error(errText));
        }
      },
      fail(err) {
        // 网络错误，尝试重试
        if (retryCount < MAX_RETRY_COUNT) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`[Request Retry] ${url} 网络错误，将在 ${RETRY_DELAY}ms 后重试 (${retryCount + 1}/${MAX_RETRY_COUNT})`);
          }
          setTimeout(() => {
            doRequest(options, cacheKey, retryCount + 1)
              .then(resolve)
              .catch(reject);
          }, RETRY_DELAY * (retryCount + 1));
          return;
        }
        
        showErrorToast(err.errMsg || '网络异常，请稍后重试');
        reject(err);
      }
    });
  });
}

/**
 * GET 请求
 */
export function get(url, params = {}, needAuth = true) {
  return request({ url, method: 'GET', params, needAuth });
}

/**
 * POST 请求
 */
export function post(url, data = {}, needAuth = true, params = {}) {
  return request({ url, method: 'POST', data, needAuth, params });
}

/**
 * PUT 请求
 */
export function put(url, data = {}, needAuth = true, params = {}) {
  return request({ url, method: 'PUT', data, needAuth, params });
}

/**
 * DELETE 请求
 */
export function del(url, needAuth = true, params = {}) {
  return request({ url, method: 'DELETE', needAuth, params });
}

/**
 * 上传文件（自动带 token）
 * @param {string} url 如 '/api/student/paper/upload'
 * @param {string} filePath 本地文件路径
 * @param {string} name 字段名，默认 'file'
 * @param {Object} formData 额外表单字段
 */
export function uploadFile(url, filePath, name = 'file', formData = {}) {
  const fullURL = url.startsWith('http') ? url : `${config.baseURL}${url}`;
  const token = uni.getStorageSync('token');
  const header = {};
  if (token) header['Authorization'] = `Bearer ${token}`;

  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: fullURL,
      filePath,
      name,
      formData,
      header,
      success(res) {
        const status = res.statusCode;
        let body = {};
        try {
          body = typeof res.data === 'string' ? JSON.parse(res.data) : (res.data || {});
        } catch (e) {
          body = { message: res.data };
        }
        if (status >= 200 && status < 300) {
          resolve(body);
        } else {
          uni.showToast({ title: body.message || '上传失败', icon: 'none' });
          reject(new Error(body.message || '上传失败'));
        }
      },
      fail(err) {
        uni.showToast({ title: err.errMsg || '网络异常', icon: 'none' });
        reject(err);
      }
    });
  });
}
