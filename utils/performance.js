/**
 * 性能优化工具函数集合
 * 包含防抖、节流、懒加载等常用优化方法
 */

// ==================== 防抖函数 ====================

/**
 * 防抖函数 - 延迟执行，如果在此期间再次调用则重新计时
 * @param {Function} fn - 要执行的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @param {boolean} immediate - 是否立即执行第一次
 * @returns {Function}
 */
export function debounce(fn, delay = 300, immediate = false) {
  let timer = null;
  return function(...args) {
    const context = this;
    const callNow = immediate && !timer;
    
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (!immediate) {
        fn.apply(context, args);
      }
    }, delay);
    
    if (callNow) {
      fn.apply(context, args);
    }
  };
}

// ==================== 节流函数 ====================

/**
 * 节流函数 - 在指定时间内只执行一次
 * @param {Function} fn - 要执行的函数
 * @param {number} interval - 间隔时间（毫秒）
 * @returns {Function}
 */
export function throttle(fn, interval = 300) {
  let lastTime = 0;
  let timer = null;
  
  return function(...args) {
    const context = this;
    const now = Date.now();
    
    if (now - lastTime >= interval) {
      // 直接执行
      lastTime = now;
      fn.apply(context, args);
    } else {
      // 延迟到下一个周期执行
      clearTimeout(timer);
      timer = setTimeout(() => {
        lastTime = Date.now();
        fn.apply(context, args);
      }, interval - (now - lastTime));
    }
  };
}

// ==================== 请求帧节流 ====================

/**
 * 使用 requestAnimationFrame 节流
 * 适用于滚动、动画等高频事件
 * @param {Function} fn
 * @returns {Function}
 */
export function rafThrottle(fn) {
  let ticking = false;
  return function(...args) {
    if (!ticking) {
      requestAnimationFrame(() => {
        fn.apply(this, args);
        ticking = false;
      });
      ticking = true;
    }
  };
}

// ==================== 懒加载观察器 ====================

/**
 * 创建 IntersectionObserver 用于懒加载
 * @param {Function} callback - 元素进入视口时的回调
 * @param {Object} options - 观察器配置
 * @returns {IntersectionObserver}
 */
export function createLazyLoader(callback, options = {}) {
  const defaultOptions = {
    root: null,
    rootMargin: '50px', // 提前50px开始加载
    threshold: 0.1,
    ...options
  };
  
  return uni.createIntersectionObserver
    ? uni.createIntersectionObserver({ observeAll: true }).relativeToViewport(defaultOptions.rootMargin)
    : null;
}

// ==================== 内存缓存管理 ====================

/**
 * 简单的LRU缓存实现
 */
export class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }
  
  get(key) {
    if (this.cache.has(key)) {
      // 移动到末尾（最近使用）
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }
  
  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // 删除最久未使用的
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
  
  has(key) {
    return this.cache.has(key);
  }
  
  clear() {
    this.cache.clear();
  }
  
  get size() {
    return this.cache.size;
  }
}

// ==================== 任务队列管理 ====================

/**
 * 异步任务队列 - 控制并发数
 */
export class AsyncQueue {
  constructor(concurrency = 3) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }
  
  add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        task,
        resolve,
        reject
      });
      this.run();
    });
  }
  
  run() {
    while (this.running < this.concurrency && this.queue.length > 0) {
      const { task, resolve, reject } = this.queue.shift();
      this.running++;
      
      Promise.resolve(task())
        .then(resolve)
        .catch(reject)
        .finally(() => {
          this.running--;
          this.run();
        });
    }
  }
}

// ==================== 虚拟列表计算 ====================

/**
 * 计算虚拟列表的可见范围
 * @param {number} scrollTop - 滚动位置
 * @param {number} viewportHeight - 视口高度
 * @param {number} itemHeight - 每项高度
 * @param {number} totalCount - 总项目数
 * @param {number} bufferSize - 缓冲区大小（上下多渲染的项目数）
 * @returns {Object}
 */
export function calculateVisibleRange(scrollTop, viewportHeight, itemHeight, totalCount, bufferSize = 5) {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
  const visibleCount = Math.ceil(viewportHeight / itemHeight) + bufferSize * 2;
  const endIndex = Math.min(totalCount - 1, startIndex + visibleCount);
  
  return {
    startIndex,
    endIndex,
    offsetY: startIndex * itemHeight,
    visibleCount: endIndex - startIndex + 1
  };
}

// ==================== 页面可见性优化 ====================

/**
 * 监听页面可见性变化，在页面不可见时暂停某些操作
 * @param {Function} onVisible - 页面可见时回调
 * @param {Function} onHidden - 页面隐藏时回调
 * @returns {Function} 取消监听的函数
 */
export function watchPageVisibility(onVisible, onHidden) {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      onHidden && onHidden();
    } else {
      onVisible && onVisible();
    }
  };
  
  // #ifdef H5
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  // #endif
  
  // #ifndef H5
  // 小程序环境使用 app 生命周期
  return () => {};
  // #endif
}

export default {
  debounce,
  throttle,
  rafThrottle,
  createLazyLoader,
  LRUCache,
  AsyncQueue,
  calculateVisibleRange,
  watchPageVisibility
};
