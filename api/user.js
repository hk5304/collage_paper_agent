/**
 * 用户相关接口 - 与后端对接时路径、参数需与后端约定一致
 */
import { get, post, put, request } from './request.js';

/** 登录（不需要 token） POST /api/v1/users/login */
export function login(params) {
  return post('/api/v1/users/login', {
    username: params.username,
    password: params.password,
    user_type: params.role
  }, false);
}

/** 获取验证码 */
export function getCaptcha() {
  return get('/api/v1/user/captcha', {}, false);
}

/** 验证验证码 */
export function verifyCaptcha(captcha, captchaId = '') {
  return post('/api/v1/user/verify-captcha', { captcha, captchaId }, false);
}

/** 忘记密码 */
export function forgotPassword(params) {
  return post('/api/v1/user/forgot-password', {
    username: params.username,
    captcha: params.captcha,
    role: params.role
  }, false);
}

/** 重置密码（通过邮件链接） */
export function resetPassword(params) {
  return post('/api/v1/user/reset-password', {
    token: params.token,
    newPassword: params.newPassword,
    confirmPassword: params.confirmPassword
  }, false);
}

/** 获取当前用户信息 GET /api/v1/users/me */
export function getUserInfo() {
  return get('/api/v1/users/me');
}

/** 刷新 token */
export function refreshToken(refreshToken) {
  return post('/api/v1/user/refresh-token', { refreshToken }, false);
}

/** 退出登录 */
export function logout() {
  return post('/api/v1/user/logout');
}

/** 修改密码 PUT /api/v1/users/change-password */
export function changePassword(data) {
  // data 包含: old_password, new_password
  const userInfo = uni.getStorageSync('userInfo') || {};
  const currentUser = JSON.stringify({
    sub: userInfo.id || 0,
    roles: [userInfo.role || 'teacher'],
    username: userInfo.username || 'teacher'
  });
  
  // 使用 request 函数，current_user 作为 Query 参数
  return request({
    url: '/api/v1/users/change-password',
    method: 'PUT',
    data,
    params: {
      current_user: currentUser
    }
  });
}
