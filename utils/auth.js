/**
 * 用户认证和登录状态管理工具模块
 * 统一处理用户登录状态、userInfo获取、token管理等
 */

/**
 * 获取当前登录用户信息
 * @returns {Object|null} 用户信息对象，未登录返回null
 */
export function getUserInfo() {
  try {
    const userInfo = uni.getStorageSync('userInfo');
    if (userInfo && typeof userInfo === 'object') {
      return userInfo;
    }
    return null;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
}

/**
 * 获取当前用户ID（学号/工号）
 * 优先使用 owner_id 字段，其次是 username
 * @returns {number|null} 用户ID，未登录返回null
 */
export function getUserId() {
  const userInfo = getUserInfo();
  if (!userInfo) {
    return null;
  }
  
  // 优先使用 owner_id（学号/工号），其次是 username
  const userId = userInfo.owner_id || userInfo.username;
  
  // 确保返回数字类型
  if (userId) {
    const parsedId = parseInt(userId, 10);
    if (!isNaN(parsedId) && parsedId > 0) {
      return parsedId;
    }
  }
  
  return null;
}

/**
 * 检查用户是否已登录
 * @returns {boolean} 是否已登录
 */
export function isLoggedIn() {
  const token = uni.getStorageSync('token');
  const userId = getUserId();
  return !!(token && userId);
}

/**
 * 获取用户角色
 * @returns {string|null} 用户角色（student/teacher/admin），未登录返回null
 */
export function getUserRole() {
  return uni.getStorageSync('userRole') || null;
}

/**
 * 获取Token
 * @returns {string|null} Token字符串，未登录返回null
 */
export function getToken() {
  return uni.getStorageSync('token') || null;
}

/**
 * 保存登录状态
 * @param {Object} data - 登录数据
 * @param {string} data.token - 访问令牌
 * @param {Object} data.userInfo - 用户信息
 * @param {string} data.role - 用户角色
 */
export function saveLoginState(data) {
  try {
    const { token, userInfo, role } = data;
    
    if (token) {
      uni.setStorageSync('token', token);
    }
    
    if (userInfo) {
      // 确保userInfo包含必要的字段
      const normalizedUserInfo = {
        id: userInfo.id || userInfo.userId || userInfo.sub,
        userId: userInfo.userId || userInfo.id || userInfo.sub,
        sub: (userInfo.sub || userInfo.id || userInfo.userId)?.toString(),
        username: userInfo.username || '',
        name: userInfo.name || userInfo.full_name || userInfo.username || '',
        full_name: userInfo.full_name || userInfo.name || userInfo.username || '',
        role: role || userInfo.role || '',
        college: userInfo.college || '',
        avatar: userInfo.avatar || '/static/logo.png'
      };
      uni.setStorageSync('userInfo', normalizedUserInfo);
    }
    
    if (role) {
      uni.setStorageSync('userRole', role);
    }
    
    console.log('登录状态已保存:', { role, userId: userInfo?.id });
  } catch (error) {
    console.error('保存登录状态失败:', error);
  }
}

/**
 * 清除登录状态（退出登录）
 */
export function clearLoginState() {
  try {
    uni.removeStorageSync('token');
    uni.removeStorageSync('userInfo');
    uni.removeStorageSync('userRole');
    uni.removeStorageSync('refreshToken');
    console.log('登录状态已清除');
  } catch (error) {
    console.error('清除登录状态失败:', error);
  }
}

/**
 * 检查登录状态，未登录则跳转到登录页
 * @param {Object} options - 配置选项
 * @param {boolean} options.redirect - 是否自动跳转（默认true）
 * @param {string} options.message - 提示消息
 * @returns {boolean} 是否已登录
 */
export function checkLogin(options = {}) {
  const { redirect = true, message = '请先登录' } = options;
  
  if (!isLoggedIn()) {
    if (message) {
      uni.showToast({
        title: message,
        icon: 'none',
        duration: 2000
      });
    }
    
    if (redirect) {
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/index/index'
        });
      }, 1500);
    }
    
    return false;
  }
  
  return true;
}

/**
 * 验证用户ID有效性
 * @param {number|string} userId - 用户ID
 * @returns {boolean} 是否有效
 */
export function isValidUserId(userId) {
  if (!userId) return false;
  const parsedId = parseInt(userId, 10);
  return !isNaN(parsedId) && parsedId > 0;
}

/**
 * 获取完整的认证信息（用于API请求）
 * @returns {Object} 包含token、userId、role的对象
 */
export function getAuthInfo() {
  return {
    token: getToken(),
    userId: getUserId(),
    role: getUserRole(),
    userInfo: getUserInfo(),
    isLoggedIn: isLoggedIn()
  };
}

export default {
  getUserInfo,
  getUserId,
  isLoggedIn,
  getUserRole,
  getToken,
  saveLoginState,
  clearLoginState,
  checkLogin,
  isValidUserId,
  getAuthInfo
};
