/**
 * 函数工具库
 * 提供防抖、节流等常用函数优化工具
 */

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

/**
 * 节流函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(func, wait) {
  let previous = 0;
  return function(...args) {
    const now = Date.now();
    const context = this;
    if (now - previous > wait) {
      func.apply(context, args);
      previous = now;
    }
  };
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的大小字符串
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化日期时间
 * @param {Date|string} date - 日期对象或字符串
 * @param {string} format - 格式模板，默认 'YYYY-MM-DD HH:mm'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDateTime(date, format = 'YYYY-MM-DD HH:mm') {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  const second = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second);
}

/**
 * 获取文件类型
 * @param {string} fileName - 文件名
 * @returns {string} 文件类型分类
 */
export function getFileType(fileName) {
  const ext = fileName.toLowerCase().split('.').pop();
  const typeMap = {
    doc: ['doc', 'docx'],
    sheet: ['xls', 'xlsx'],
    pdf: ['pdf'],
    image: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
    ppt: ['ppt', 'pptx'],
    zip: ['zip', 'rar', '7z']
  };
  
  for (const [type, exts] of Object.entries(typeMap)) {
    if (exts.includes(ext)) return type;
  }
  return 'other';
}

/**
 * 延迟执行
 * @param {number} ms - 延迟毫秒数
 * @returns {Promise<void>}
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 安全地获取本地存储数据
 * @param {string} key - 存储键名
 * @param {*} defaultValue - 默认值
 * @returns {*} 存储的值或默认值
 */
export function safeGetStorage(key, defaultValue = null) {
  try {
    return uni.getStorageSync(key) || defaultValue;
  } catch (e) {
    console.error(`获取存储[${key}]失败:`, e);
    return defaultValue;
  }
}

/**
 * 安全地设置本地存储数据
 * @param {string} key - 存储键名
 * @param {*} value - 要存储的值
 * @returns {boolean} 是否成功
 */
export function safeSetStorage(key, value) {
  try {
    uni.setStorageSync(key, value);
    return true;
  } catch (e) {
    console.error(`设置存储[${key}]失败:`, e);
    return false;
  }
}
