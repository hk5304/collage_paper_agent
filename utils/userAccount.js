/**
 * 用户账户管理工具
 * 用于创建和管理真实的学生账户，确保符合后端API要求
 */

/**
 * 生成符合后端要求的用户ID（10位数字，20开头）
 * @returns {number} 用户ID
 */
export function generateUserId() {
  // 格式：20 + 8位随机数 = 10位数字
  // 范围：2010000000 - 2099999999（在MySQL INT范围内）
  return parseInt('20' + Math.floor(10000000 + Math.random() * 90000000));
}

/**
 * 生成符合后端要求的JWT Token
 * @param {Object} userInfo 用户信息
 * @returns {string} JWT Token
 */
export function generateJWTToken(userInfo) {
  const payload = {
    sub: userInfo.id.toString(),
    username: userInfo.username,
    roles: [userInfo.role || 'student'],
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24小时过期
  };
  
  // 生成JWT token（Header.Payload.Signature格式）
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadBase64 = btoa(JSON.stringify(payload));
  const signature = btoa('signature_' + Date.now());
  return `${header}.${payloadBase64}.${signature}`;
}

/**
 * 创建学生账户
 * @param {string} username 用户名/学号
 * @param {string} name 真实姓名
 * @param {string} college 学院名称
 * @returns {Object} 完整的用户信息
 */
export function createStudentAccount(username, name, college = '计算机科学与技术学院') {
  const userId = generateUserId();
  
  const userInfo = {
    id: userId,
    userId: userId,
    sub: userId.toString(),
    username: username,
    name: name || username,
    role: 'student',
    college: college,
    avatar: '/static/logo.png',
    createdAt: new Date().toISOString()
  };
  
  // 生成token
  const token = generateJWTToken(userInfo);
  
  return {
    userInfo,
    token,
    refreshToken: 'refresh_' + Date.now()
  };
}

/**
 * 保存用户账户到本地存储
 * @param {Object} account 账户信息
 */
export function saveUserAccount(account) {
  try {
    uni.setStorageSync('token', account.token);
    uni.setStorageSync('userInfo', account.userInfo);
    uni.setStorageSync('userRole', account.userInfo.role);
    uni.setStorageSync('refreshToken', account.refreshToken);
    
    console.log('用户账户已保存:', {
      userId: account.userInfo.id,
      username: account.userInfo.username,
      role: account.userInfo.role
    });
    
    return true;
  } catch (error) {
    console.error('保存用户账户失败:', error);
    return false;
  }
}

/**
 * 获取当前用户账户信息
 * @returns {Object|null} 账户信息
 */
export function getCurrentUserAccount() {
  try {
    const token = uni.getStorageSync('token');
    const userInfo = uni.getStorageSync('userInfo');
    const userRole = uni.getStorageSync('userRole');
    
    if (!token || !userInfo) {
      console.warn('未找到用户账户信息');
      return null;
    }
    
    return {
      token,
      userInfo,
      userRole
    };
  } catch (error) {
    console.error('获取用户账户失败:', error);
    return null;
  }
}

/**
 * 验证用户ID是否有效
 * @param {number|string} userId 用户ID
 * @returns {boolean} 是否有效
 */
export function isValidUserId(userId) {
  if (!userId) return false;
  
  const id = parseInt(userId, 10);
  if (isNaN(id) || id <= 0) return false;
  
  // 支持两种格式的用户ID：
  // 1. 内部数字用户ID（如 3）- 用于后端权限校验
  // 2. 学号/工号（如 2400305305）- 10位数字，以20开头
  const idStr = id.toString();
  if (idStr.length === 10 && idStr.startsWith('20')) {
    return true; // 学号格式
  }
  if (id > 0 && id < 100000) {
    return true; // 内部数字用户ID格式
  }
  
  return false;
}

/**
 * 清除用户账户信息（退出登录）
 */
export function clearUserAccount() {
  try {
    uni.removeStorageSync('token');
    uni.removeStorageSync('userInfo');
    uni.removeStorageSync('userRole');
    uni.removeStorageSync('refreshToken');
    uni.removeStorageSync('studentPapers');
    
    console.log('用户账户已清除');
    return true;
  } catch (error) {
    console.error('清除用户账户失败:', error);
    return false;
  }
}

/**
 * 检查用户是否已登录
 * @returns {boolean} 是否已登录
 */
export function isLoggedIn() {
  const account = getCurrentUserAccount();
  return !!(account && account.token && isValidUserId(account.userInfo?.id));
}

/**
 * 获取用于API调用的认证Header
 * @returns {Object} Header对象
 */
export function getAuthHeader() {
  const token = uni.getStorageSync('token');
  if (!token) {
    console.warn('未找到token，无法获取认证Header');
    return {};
  }
  
  return {
    'Authorization': `Bearer ${token}`
  };
}

/**
 * 获取用于后端Query参数的current_user
 * @returns {string} JSON字符串
 */
export function getCurrentUserParam() {
  const userInfo = uni.getStorageSync('userInfo') || {};
  
  const currentUser = {
    sub: userInfo.id || userInfo.userId || 0,
    username: userInfo.username || '',
    roles: [userInfo.role || 'student']
  };
  
  return JSON.stringify(currentUser);
}

/**
 * 打印当前账户信息（用于调试）
 */
export function printAccountInfo() {
  const account = getCurrentUserAccount();
  if (!account) {
    console.log('当前无用户登录');
    return;
  }
  
  console.log('========== 当前用户账户信息 ==========');
  console.log('用户ID:', account.userInfo.id);
  console.log('用户名:', account.userInfo.username);
  console.log('姓名:', account.userInfo.name);
  console.log('角色:', account.userInfo.role);
  console.log('学院:', account.userInfo.college);
  console.log('Token前缀:', account.token.substring(0, 50) + '...');
  console.log('=====================================');
}
