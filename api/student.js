/**
 * 学生端 API 接口集合
 * 融合了 annotation.js、attachment.js、group.js、material.js、notification.js、paper.js
 */

// 从request.js导入基础请求方法
import { request, get, post, put, del, uploadFile } from './request.js';
// 导入配置
import { config } from './config.js';

/**
 * 获取数字用户ID（用于 current_user.sub）
 * 优先使用 userInfo.sub，其次是 userInfo.userId
 * @returns {number} 数字用户ID
 */
function getNumericUserId() {
  const userInfo = uni.getStorageSync('userInfo') || {};
  return parseInt(userInfo.sub || userInfo.userId || 0, 10);
}

/**
 * 获取当前用户信息（用于构建current_user）
 * @returns {Object} 包含userInfo和numericUserId的对象
 */
function getCurrentUserInfo() {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const numericUserId = parseInt(userInfo.sub || 0, 10);
  return { userInfo, numericUserId };
}

/**
 * 构建current_user参数对象
 * @param {Object} options - 可选配置
 * @param {number} options.sub - 用户ID，默认从storage获取
 * @param {string} options.username - 用户名，默认从storage获取
 * @param {boolean} options.encode - 是否返回encodeURIComponent后的字符串，默认false
 * @returns {string|Object} current_user参数
 */
function buildCurrentUser(options = {}) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const sub = options.sub || parseInt(userInfo.sub || 0, 10);
  const username = options.username || userInfo.username || userInfo.name || '';
  
  const currentUser = {
    sub,
    username,
    roles: ['student']
  };
  
  return options.encode ? encodeURIComponent(JSON.stringify(currentUser)) : currentUser;
}

// ==================== annotation.js ====================
export function createAnnotation(params) {
  return post('/api/v1/annotations', params);
}

// ==================== attachment.js ====================
import { getUserId, isValidUserId } from '../utils/auth.js';

export function uploadAttachment(params) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const submitterId = params.submitterId;
  // 优先用真实姓名，避免用数字ID作为name
  const name = params.name || userInfo.name || userInfo.username || String(submitterId);
  
  // 与论文上传保持一致：加上 current_user 参数供部署服务器认证
  // parseInt 确保 sub 是整数，避免后端字符串比较抛 TypeError → 500
  const currentUser = JSON.stringify({
    sub: parseInt(submitterId),
    username: name,
    roles: ['student']
  });
  
  // 新接口：使用 paper_id 替代 submitter_id
  const paperId = params.paperId || params.paper_id;
  if (!paperId) {
    return Promise.reject(new Error('缺少论文ID，无法上传附件'));
  }
  
  const url = `/api/v1/materials/upload?name=${encodeURIComponent(name)}&paper_id=${encodeURIComponent(paperId)}&file_type=${encodeURIComponent(params.fileType || 'document')}&version=${encodeURIComponent(params.version || 1)}&remark=${encodeURIComponent(params.remark || '')}&current_user=${encodeURIComponent(currentUser)}`;
  
  // needAuth=false：不发送 Bearer token，由 current_user 查询参数认证
  return uploadFile(url, params.filePath, 'file', {}, false);
}

export function getAttachmentList(paperId = null) {
  const studentId = getUserId();
  
  if (!isValidUserId(studentId)) {
    return Promise.reject(new Error('未登录或用户ID无效'));
  }
  
  // 有 paperId 则筛选，否则获取全部
  const params = paperId ? { paper_id: paperId } : {};
  return get('/api/v1/materials/names', params);
}

export function updateAttachment(attachmentId, params) {
  return put(`/api/v1/materials/${attachmentId}`, params);
}

export function deleteAttachment(attachmentId) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const studentId = getUserId();
  // name 必须是当前登录用户的用户名，用于权限校验
  const username = userInfo.username || userInfo.name || String(studentId);
  const currentUser = encodeURIComponent(JSON.stringify({
    sub: studentId,
    username: username,
    roles: ['student']
  }));
  
  return del(`/api/v1/materials/${attachmentId}?name=${encodeURIComponent(username)}&current_user=${currentUser}`);
}

export function downloadAttachment(attachmentId) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const studentId = getUserId();
  const currentUser = encodeURIComponent(JSON.stringify({
    sub: studentId || userInfo.owner_id || 0,
    username: userInfo.username || '',
    roles: ['student']
  }));
  
  const downloadUrl = `${config.baseURL}/api/v1/materials/${attachmentId}/download?current_user=${currentUser}`;
  return Promise.resolve({ downloadUrl });
}

export function getAttachmentWorkbenchData() {
  const studentId = getUserId();
  
  if (!isValidUserId(studentId)) {
    return Promise.reject(new Error('未登录或用户ID无效'));
  }
  
  const userInfo = uni.getStorageSync('userInfo') || {};
  
  const currentUser = JSON.stringify({
    sub: studentId,
    username: userInfo.username || userInfo.name || '',
    roles: ['student']
  });
  
  return get('/api/v1/materials/names', { 
    name: userInfo.username || userInfo.name || '',
    current_user: currentUser
  });
}

// ==================== group.js ====================
export function importGroupMembers(filePath, formData = {}) {
  return uploadFile('/api/v1/groups/import', filePath, 'file', formData);
}

export function createGroupV1(params) {
  return post('/api/v1/groups/create', params);
}

export function deleteGroup(groupId) {
  return del(`/api/v1/groups/${groupId}`);
}

export function updateGroupV1(groupId, params) {
  return put(`/api/v1/groups/${groupId}`, params);
}

export function addGroupMember(groupId, params) {
  return post(`/api/v1/groups/${groupId}/members`, params);
}

export function deleteGroupMember(groupId) {
  return del(`/api/v1/groups/${groupId}/members`);
}

// ==================== material.js ====================
export function uploadMaterial(filePath, formData = {}) {
  return uploadFile('/api/v1/materials/upload', filePath, 'file', formData);
}

export function updateMaterial(materialId, params) {
  return put(`/api/v1/materials/${materialId}`, params);
}

export function deleteMaterial(materialId) {
  return del(`/api/v1/materials/${materialId}`);
}

export function getMaterialNames() {
  return get('/api/v1/materials/names');
}

// ==================== notification.js ====================
export function pushNotification(params) {
  return post('/api/v1/notifications/push', params);
}

/**
 * 获取学生收到的通知消息
 * @param {Object} params - 查询参数
 * @param {string} params.student_id - 学生学号
 * @param {string} params.status - 状态筛选：unread, read, retracted
 * @param {number} params.page - 页码，默认1
 * @param {number} params.page_size - 每页数量，默认20
 * @returns {Promise}
 */
export function getReceivedNotifications(params = {}) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const numericUserId = parseInt(userInfo.sub || 0, 10);
  
  const currentUser = encodeURIComponent(JSON.stringify({
    sub: numericUserId,
    username: userInfo.username || '',
    roles: ['student']
  }));
  
  const queryParams = {
    student_id: params.student_id || userInfo.username || '',
    page: params.page || 1,
    page_size: params.page_size || 20,
    current_user: currentUser
  };
  
  if (params.status) {
    queryParams.status = params.status;
  }
  
  return get('/api/v1/notifications/received', queryParams);
}

/**
 * 标记消息为已读
 * @param {number} notificationId - 消息ID
 * @returns {Promise}
 */
export function markNotificationRead(notificationId) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const numericUserId = parseInt(userInfo.sub || 0, 10);
  
  const currentUser = encodeURIComponent(JSON.stringify({
    sub: numericUserId,
    username: userInfo.username || '',
    roles: ['student']
  }));
  
  return put(`/api/v1/notifications/${notificationId}/read`, {}, true, {
    current_user: currentUser
  });
}

/**
 * 查询学生的通知消息（旧版本，保留兼容）
 * 使用 target_user_id 查询学生自己收到的通知
 * @param {string} studentId - 学生ID (sub)
 * @returns {Promise}
 */
export function queryStudentNotifications(studentId) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const numericUserId = parseInt(userInfo.sub || 0, 10);
  
  const currentUser = encodeURIComponent(JSON.stringify({
    sub: numericUserId,
    username: userInfo.username || '',
    roles: ['teacher']  // 尝试用 teacher 角色查询
  }));
  
  // 通过 target_user_id 指定查询哪个学生的通知
  const params = {
    user_type: 'teacher',
    target_user_id: String(studentId),
    page: 1,
    page_size: 50
  };
  
  const queryString = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  return get(`/api/v1/notifications/query?current_user=${currentUser}&${queryString}`);
}

// ==================== paper.js ====================
/**
 * 通过教师工号查询教师的 sub（自增主键ID）
 * @param {string} username - 教师工号
 * @returns {Promise<number>} 教师 sub
 */
export function getSubByUsername(username) {
  return post('/api/v1/users/get-sub-by-username', {
    user_type: 'teacher',
    username: username
  });
}

/**
 * 通过学生ID查询其所在群组的教师信息
 * @param {string} studentId - 学生 username（学号）
 * @returns {Promise} 教师列表 { student_id, teachers: [{id, teacher_id}] }
 */
export function getTeacherByStudentId(studentId) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const sub = parseInt(userInfo.sub || 0, 10);
  const username = userInfo.username || String(sub);
  const currentUser = JSON.stringify({ sub, username, roles: ['student'] });
  return get(`/api/v1/groups/students/${encodeURIComponent(studentId)}/teachers`, {
    current_user: currentUser
  });
}

export function uploadPaper(params) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  // 从登录信息获取正确的字段
  // sub = 数字用户ID（如 1），username = 学号/工号（如 2400305305）
  const userId = parseInt(userInfo.sub || userInfo.userId || 0, 10);
  const username = userInfo.username || userInfo.name || String(userId);
  
  // owner_id 必须与 userId 一致
  const ownerId = userId;
  const teacherId = parseInt(params.teacherId, 10) || 0;
  
  if (!teacherId || teacherId <= 0) {
    return Promise.reject(new Error('教师ID无效，请输入正确的教师编号'));
  }
  
  const currentUser = JSON.stringify({
    sub: ownerId,  // 必须与 owner_id 相同，后端校验 owner_id == submitter_id
    username: username,
    roles: ['student']
  });
  
  const url = `/api/v1/papers/upload?owner_id=${encodeURIComponent(ownerId)}&teacher_id=${encodeURIComponent(teacherId)}&current_user=${encodeURIComponent(currentUser)}`;
  
  return uploadFile(url, params.filePath, 'file', {});
}

export function callAIAgentCheck(paperId) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  // 论文相关接口使用数字用户ID（sub）
  const numericUserId = parseInt(userInfo.sub || 0, 10);
  
  const currentUser = JSON.stringify({
    sub: numericUserId,
    username: userInfo.username || userInfo.name || '',
    roles: ['student']
  });
  
  return post(`/api/v1/papers/${paperId}/ai-review?current_user=${encodeURIComponent(currentUser)}`);
}

export function getWorkbenchData() {
  const userInfo = uni.getStorageSync('userInfo') || {};
  
  // 论文相关接口使用数字用户ID（sub）
  const numericUserId = parseInt(userInfo.sub || 0, 10);
  
  if (!numericUserId) {
    return Promise.reject(new Error('未登录或用户ID无效'));
  }
  
  // 论文接口使用数字用户ID作为 owner_id 和 sub
  const currentUser = JSON.stringify({
    sub: numericUserId,
    username: userInfo.username || userInfo.name || '',
    roles: ['student']
  });
  
  return get('/api/v1/papers/list', { 
    owner_id: numericUserId,
    current_user: currentUser
  });
}

export function getPaperList(params = {}) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  // 论文相关接口使用数字用户ID（sub）
  const numericUserId = parseInt(userInfo.sub || 0, 10);
  const currentUser = JSON.stringify({
    sub: numericUserId,
    username: userInfo.username || '',
    roles: ['student']
  });
  
  return get('/api/v1/papers/list', { 
    ...params, 
    owner_id: numericUserId,
    current_user: currentUser 
  });
}

export function getPaperStatusList(params = {}) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  // 论文相关接口使用数字用户ID（sub）
  const numericUserId = parseInt(userInfo.sub || 0, 10);
  const currentUser = JSON.stringify({
    sub: numericUserId,
    username: userInfo.username || '',
    roles: ['student']
  });
  
  return get('/api/v1/papers/list', { 
    ...params, 
    current_user: currentUser 
  });
}

export function createPaperAnnotation(params) {
  return post('/api/v1/annotations/', params);
}

export function getPaperAnnotations(paperId, ownerId) {
  return get('/api/v1/annotations/paper', { 
    paper_id: paperId,
    owner_id: ownerId
  });
}

export function getAnnotationsByPaperId(paperId) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const ownerId = parseInt(userInfo.sub || userInfo.id || userInfo.userId || 0, 10);
  
  if (!ownerId) {
    return Promise.reject(new Error('未登录或用户ID无效'));
  }
  
  const currentUser = JSON.stringify({
    sub: ownerId,
    username: userInfo.username || '',
    roles: ['student']
  });
  
  return get('/api/v1/annotations/paper', {
    paper_id: parseInt(paperId, 10),
    owner_id: ownerId,
    current_user: currentUser
  });
}

export function markAnnotationProcessed(paperId, annotationId, teacherId) {
  return post('/api/v1/annotations/', { 
    paper_id: paperId, 
    teacher_id: teacherId,
    content: `[系统] 批注 #${annotationId} 已被标记为已处理`,
    coordinates: null,
    paragraph_id: null
  });
}

export function uploadPaperV1(filePath, formData = {}) {
  return uploadFile('/api/v1/papers/upload', filePath, 'file', formData);
}

export function updatePaper(paperId, params) {
  return put(`/api/v1/papers/${paperId}`, params);
}

/**
 * 更新论文版本（上传新版本文件）
 * @param {number} paperId - 论文ID
 * @param {string|File} filePath - 文件路径（小程序）或 File 对象（H5）
 * @param {string} version - 新版本号（如 v2.0）
 * @returns {Promise}
 */
export function updatePaperVersion(paperId, filePath, version) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const numericUserId = parseInt(userInfo.sub || 0, 10);
  
  const currentUser = encodeURIComponent(JSON.stringify({
    sub: numericUserId,
    username: userInfo.username || '',
    roles: ['student']
  }));
  
  const url = `${config.baseURL}/api/v1/papers/${paperId}?version=${encodeURIComponent(version)}&current_user=${currentUser}`;
  
  return new Promise((resolve, reject) => {
    // H5 平台：filePath 是 File 对象，使用 FormData
    // #ifdef H5
    if (filePath instanceof File) {
      const formData = new FormData();
      formData.append('file', filePath);
      
      const token = uni.getStorageSync('token');
      
      fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: formData
      })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('更新失败');
        }
      })
      .then(data => resolve(data))
      .catch(err => {
        uni.showToast({ title: err.message || '更新失败', icon: 'none' });
        reject(err);
      });
      return;
    }
    // #endif
    
    // 小程序/移动端：filePath 是文件路径，使用 uni.getFileSystemManager
    // #ifndef H5
    uni.getFileSystemManager().readFile({
      filePath: filePath,
      success: (readRes) => {
        const token = uni.getStorageSync('token');
        const header = {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/octet-stream'
        };
        
        uni.request({
          url: url,
          method: 'PUT',
          data: readRes.data,
          header: header,
          success: (res) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(res.data);
            } else {
              uni.showToast({ title: res.data?.message || '更新失败', icon: 'none' });
              reject(new Error(res.data?.message || '更新失败'));
            }
          },
          fail: (err) => {
            uni.showToast({ title: err.errMsg || '网络异常', icon: 'none' });
            reject(err);
          }
        });
      },
      fail: (err) => {
        uni.showToast({ title: '读取文件失败', icon: 'none' });
        reject(err);
      }
    });
    // #endif
  });
}

export function deletePaper(paperId) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  // 论文相关接口使用数字用户ID（sub）
  const numericUserId = parseInt(userInfo.sub || 0, 10);
  
  const currentUser = encodeURIComponent(JSON.stringify({
    sub: numericUserId,
    username: userInfo.username || '',
    roles: ['student']
  }));
  
  return del(`/api/v1/papers/${paperId}?current_user=${currentUser}`);
}

export function createPaperStatus(paperId, params) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  // 论文相关接口使用数字用户ID（sub）
  const numericUserId = parseInt(userInfo.sub || 0, 10);
  
  const currentUser = JSON.stringify({
    sub: numericUserId,
    username: userInfo.username || userInfo.name || '',
    roles: ['student']
  });
  
  // 创建论文状态不需要传递 status 参数，后端默认设置为"待审阅"
  return post(`/api/v1/papers/${paperId}/status?current_user=${encodeURIComponent(currentUser)}`);
}

/**
 * 获取论文详情
 * @param {number} paperId - 论文ID
 * @returns {Promise}
 */
export function getPaperDetail(paperId) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const numericUserId = parseInt(userInfo.sub || 0, 10);
  
  const currentUser = encodeURIComponent(JSON.stringify({
    sub: numericUserId,
    username: userInfo.username || '',
    roles: ['student']
  }));
  
  return get(`/api/v1/papers/${paperId}`, { current_user: currentUser });
}

export function updatePaperStatus(paperId, params) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const numericUserId = parseInt(userInfo.sub || 0, 10);
  
  const currentUser = encodeURIComponent(JSON.stringify({
    sub: numericUserId,
    username: userInfo.username || '',
    roles: ['student']
  }));
  
  // 状态作为 Query 参数传递
  const status = params.status;
  
  return put(`/api/v1/papers/${paperId}/status?current_user=${currentUser}&status=${encodeURIComponent(status)}`);
}

export function getPaperVersions(paperId) {
  return get(`/api/v1/papers/${paperId}/versions`);
}

export function downloadPaper(paperId) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  // 论文相关接口使用数字用户ID（sub）
  const numericUserId = parseInt(userInfo.sub || 0, 10);
  
  // 构建 current_user 参数
  const currentUser = encodeURIComponent(JSON.stringify({
    sub: numericUserId,
    username: userInfo.username || '',
    roles: ['student']
  }));
  
  // 返回下载链接，前端自行处理下载
  const downloadUrl = `${config.baseURL}/api/v1/papers/${paperId}/download?student_id=${numericUserId}&current_user=${currentUser}`;
  
  return Promise.resolve({ downloadUrl });
}

export function createPaperDDL(params) {
  return post('/api/v1/papers/ddl/create', params);
}

export function getPaperDDLList(teacherId) {
  return get('/api/v1/papers/ddl/list', { teacher_id: teacherId });
}

export function deletePaperDDL(ddlId) {
  return del(`/api/v1/papers/ddl/${ddlId}`);
}

export function triggerAIReview(paperId) {
  return post(`/api/v1/papers/${paperId}/ai-review`);
}

export function getAIReport(paperId) {
  return get(`/api/v1/papers/${paperId}/ai-report`);
}

export function previewPaper(paperId, studentId) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  // 论文相关接口使用数字用户ID（sub）
  const numericUserId = parseInt(userInfo.sub || 0, 10);
  const currentUser = JSON.stringify({
    sub: numericUserId,
    username: userInfo.username || '',
    roles: ['student']
  });
  
  return get(`/api/v1/papers/${paperId}/preview`, {
    student_id: studentId,
    current_user: currentUser
  });
}

/**
 * 获取论文审阅内容
 * @param {number} paperId - 论文ID
 * @returns {Promise}
 */
export function getPaperReview(paperId) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const numericUserId = parseInt(userInfo.sub || 0, 10);
  
  const currentUser = encodeURIComponent(JSON.stringify({
    sub: numericUserId,
    username: userInfo.username || '',
    roles: ['student']
  }));
  
  return get(`/api/v1/papers/${paperId}/review`, { current_user: currentUser });
}

// ==================== 用户信息绑定接口 ====================

/**
 * 学生修改密码
 * @param {Object} data - 包含 old_password 和 new_password
 * @returns {Promise}
 */
export function changePassword(data) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const numericUserId = parseInt(userInfo.sub || userInfo.id || 0, 10);
  
  // 构造 current_user 参数，格式与后端接口文档一致
  // 后端要求: {"sub":3,"username":"1002","roles":["student"]}
  const currentUser = encodeURIComponent(JSON.stringify({
    sub: numericUserId,
    username: userInfo.username || '',
    roles: ['student']
  }));
  
  // 调试信息仅在开发环境输出
  if (process.env.NODE_ENV === 'development') {
    console.log('[ChangePassword] 修改密码请求已发送');
  }
  
  return put(`/api/v1/users/change-password?current_user=${currentUser}`, {
    old_password: data.old_password,
    new_password: data.new_password
  });
}

/**
 * 绑定手机号
 * @param {number} userId - 用户ID
 * @param {string} phone - 手机号
 * @returns {Promise}
 */
export function bindPhone(userId, phone) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const numericUserId = parseInt(userInfo.sub || 0, 10);
  
  const currentUser = encodeURIComponent(JSON.stringify({
    sub: numericUserId,
    username: userInfo.username || '',
    roles: ['student']
  }));
  
  return put(`/api/v1/users/${userId}/bind-phone?user_type=student&current_user=${currentUser}`, { phone });
}

/**
 * 绑定邮箱
 * @param {number} userId - 用户ID
 * @param {string} email - 邮箱
 * @returns {Promise}
 */
export function bindEmail(userId, email) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const numericUserId = parseInt(userInfo.sub || 0, 10);
  
  const currentUser = encodeURIComponent(JSON.stringify({
    sub: numericUserId,
    username: userInfo.username || '',
    roles: ['student']
  }));
  
  return put(`/api/v1/users/${userId}/bind-email?user_type=student&current_user=${currentUser}`, { email });
}

// ==================== DDL截止时间接口 ====================

/**
 * 获取收到的DDL列表
 * @returns {Promise<Array>} DDL消息列表
 */
export function getReceivedDDL() {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const numericUserId = parseInt(userInfo.sub || userInfo.userId || 0, 10);
  
  const currentUser = encodeURIComponent(JSON.stringify({
    sub: numericUserId,
    username: userInfo.username || '',
    roles: ['student']
  }));
  
  return get('/api/v1/papers/ddl/received', { current_user: currentUser });
}
