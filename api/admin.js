/**
 * 管理员相关接口
 */
import { get, post, put, del, request } from './request.js';
import { uploadFile } from './request.js';
import { config } from './config.js';

/** 获取群组列表 */
export function getGroupList(params = {}, currentUser = null) {
  const header = currentUser ? {
    'X-Current-User': JSON.stringify(currentUser)
  } : {};
  return request({ 
    url: '/api/v1/groups/', 
    method: 'GET', 
    params, 
    header 
  });
}

/** 导入群组/师生关系（Excel） */
export function importGroupData(filePath, formData = {}) {
  return uploadFile('/api/admin/groups/import', filePath, 'file', formData);
}

/** 创建群组 POST /api/v1/groups/create */
export function createGroup(params) {
  // 根据后端要求，参数通过 Query 传递
  const { group_name, group_id, current_user } = params;
  const queryParams = {
    group_name: group_name,
    group_id: group_id,
    current_user: JSON.stringify(current_user)
  };
  return request({
    url: '/api/v1/groups/create',
    method: 'POST',
    params: queryParams
  });
}

/** 更新群组 (PUT /api/v1/groups/{group_id}) */
export function updateGroup(groupId, params, currentUser = null) {
  // 根据 Swagger，current_user 需要在 Header 中传递
  const header = currentUser ? {
    'X-Current-User': JSON.stringify(currentUser)
  } : {};
  return request({
    url: `/api/v1/groups/${groupId}`,
    method: 'PUT',
    data: params,
    header
  });
}

/** 删除群组 */
export function deleteGroupById(groupId, data, currentUser = null) {
  // 使用 Query 参数传递 current_user（某些平台 DELETE 请求可能不支持自定义 header）
  const params = currentUser ? {
    current_user: JSON.stringify(currentUser)
  } : {};
  return request({ 
    url: `/api/v1/groups/${groupId}`, 
    method: 'DELETE', 
    data,
    params
  });
}

/**
 * 推送公告/通知 POST /api/v1/notifications/push
 * Query：send_to、current_user 必填；group_id / recipient_types / student_ids / teacher_ids 按范围组合传递
 */
export function pushNotification(data, currentUser = null) {
  const sendTo = data.send_to || 'individual';
  const params = {
    send_to: sendTo,
    current_user: currentUser ? JSON.stringify(currentUser) : '{}'
  };

  if (sendTo === 'all' || sendTo === 'group') {
    if (data.recipient_types) {
      params.recipient_types = data.recipient_types;
    }
  }
  if (sendTo === 'group' && data.group_id != null && String(data.group_id).trim() !== '') {
    params.group_id = String(data.group_id).trim();
  }
  if (sendTo === 'individual') {
    if (data.student_ids != null && data.student_ids !== '') {
      params.student_ids = Array.isArray(data.student_ids)
        ? data.student_ids.map((s) => String(s).trim()).filter(Boolean).join(',')
        : String(data.student_ids).trim();
    }
    if (data.teacher_ids != null && data.teacher_ids !== '') {
      params.teacher_ids = Array.isArray(data.teacher_ids)
        ? data.teacher_ids.map((s) => String(s).trim()).filter(Boolean).join(',')
        : String(data.teacher_ids).trim();
    }
  }

  const bodyData = {
    title: data.title,
    content: data.content
  };
  return request({
    url: '/api/v1/notifications/push',
    method: 'POST',
    data: bodyData,
    params
  });
}

/** 查询公告/通知列表（Query 需带 current_user，与后端 FastAPI 校验一致） */
export function queryNotifications(params = {}, adminId = null) {
  const queryParams = {
    ...params,
    user_type: 'admin',
  };
  if (adminId != null && adminId !== '') {
    queryParams.admin_id = adminId;
  }

  const sysAdmin = typeof uni !== 'undefined' ? (uni.getStorageSync('systemAdminInfo') || {}) : {};
  const userInfo = typeof uni !== 'undefined' ? (uni.getStorageSync('userInfo') || {}) : {};

  let sub = 1;
  if (adminId != null && adminId !== '') {
    const n = parseInt(String(adminId), 10);
    sub = Number.isNaN(n) ? adminId : n;
  } else if (sysAdmin.id != null && sysAdmin.id !== '') {
    const n = parseInt(String(sysAdmin.id), 10);
    sub = Number.isNaN(n) ? sysAdmin.id : n;
  }

  const username = sysAdmin.username || userInfo.username || 'admin';
  queryParams.current_user = JSON.stringify({
    sub,
    username,
    roles: ['admin']
  });

  return request({
    url: '/api/v1/notifications/query',
    method: 'GET',
    params: queryParams
  });
}

/** 更新通知（路径参数须为 user_messages 表主键 id） */
export function updateNotification(notificationId, data, adminId = null) {
  const params = {};
  if (adminId != null && adminId !== '') params.admin_id = adminId;
  const id = parseInt(String(notificationId), 10);
  const pathId = Number.isFinite(id) ? id : notificationId;
  return request({
    url: `/api/v1/notifications/${pathId}`,
    method: 'PUT',
    data,
    params
  });
}

/** 撤回通知 */
export function retractNotification(notificationId, adminId = null) {
  const params = {};
  if (adminId != null && adminId !== '') params.admin_id = adminId;
  const id = parseInt(String(notificationId), 10);
  const pathId = Number.isFinite(id) ? id : notificationId;
  return request({
    url: `/api/v1/notifications/${pathId}/retract`,
    method: 'PUT',
    params
  });
}

/** 删除通知（DELETE /api/v1/notifications/{notification_id}，管理员从库中删除） */
export function deleteNotification(notificationId, currentUser) {
  const id = parseInt(String(notificationId), 10);
  const pathId = Number.isFinite(id) ? id : notificationId;
  const params = {
    current_user:
      typeof currentUser === 'string'
        ? currentUser
        : JSON.stringify(currentUser)
  };
  return request({
    url: `/api/v1/notifications/${pathId}`,
    method: 'DELETE',
    params
  });
}

/** 获取群组成员信息 */
export function getGroupMembers(groupId, params = {}, currentUser = null) {
  // 根据 Swagger，current_user 需要作为 query 参数传递
  if (currentUser) {
    params.current_user = JSON.stringify(currentUser);
  }
  return request({ 
    url: `/api/v1/groups/${groupId}/members`, 
    method: 'GET', 
    params
  });
}

/** 添加群组成员（邀请教师/学生） POST /api/v1/groups/members */
export function addGroupMember(groupId, params) {
  const { current_user, member_type, member_id, role, action } = params;
  
  const queryParams = {
    group_id: groupId,
    action: action || 'add',
    current_user: JSON.stringify(current_user)
  };
  
  // 根据成员类型使用正确的参数名（复数数组格式）
  if (member_type === 'student') {
    queryParams.student_ids = [member_id];
  } else if (member_type === 'teacher') {
    queryParams.teacher_ids = [member_id];
  }
  
  return request({
    url: '/api/v1/groups/members',
    method: 'POST',
    params: queryParams
  });
}

/** 删除群组成员 DELETE /api/v1/groups/{group_id}/members */
export function removeGroupMember(groupId, params) {
  // 根据 Swagger 文档，参数通过 Query 传递
  const { current_user, member_type, member_id } = params;
  
  const queryParams = {
    group_id: groupId,
    member_type: member_type,
    current_user: JSON.stringify(current_user)
  };
  
  // 根据成员类型使用正确的参数名
  if (member_type === 'student') {
    queryParams.student_id = member_id;
  } else if (member_type === 'teacher') {
    queryParams.teacher_id = member_id;
  } else if (member_type === 'admin') {
    queryParams.admin_id = member_id;
  }
  
  return request({
    url: `/api/v1/groups/${groupId}/members`,
    method: 'DELETE',
    params: queryParams
  });
}

/** 导入群组与师生关系 */
export function importGroupRelations(file, currentUser = null) {
  return new Promise((resolve, reject) => {
    // 构建 URL，添加 current_user query 参数
    let url = config.baseURL + '/api/v1/groups/import';
    if (currentUser) {
      const userParam = encodeURIComponent(JSON.stringify(currentUser));
      url += `?current_user=${userParam}`;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    fetch(url, {
      method: 'POST',
      body: formData
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const msg =
            (typeof data.msg === 'string' && data.msg) ||
            (typeof data.message === 'string' && data.message) ||
            (typeof data.detail === 'string' && data.detail) ||
            `请求失败 ${response.status}`;
          throw new Error(msg);
        }
        return data;
      })
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
}

/**
 * 管理员查询全部用户 GET /api/v1/users/all
 * @param {{ user_type?: 'student'|'teacher'|'admin' }} params - 不指定则查全部
 * @param {object|string|null} currentUser - { sub, username, roles } 或已序列化 JSON 字符串
 */
export function queryAllUsers(params = {}, currentUser = null) {
  const queryParams = { ...params };
  if (currentUser != null) {
    queryParams.current_user =
      typeof currentUser === 'string' ? currentUser : JSON.stringify(currentUser);
  }
  return request({
    url: '/api/v1/users/all',
    method: 'GET',
    params: queryParams
  });
}

/** 批量导入用户 POST /api/v1/users/import */
export function importUsers(file, currentUser = null) {
  return new Promise((resolve, reject) => {
    // 构建 URL
    let url = config.baseURL + '/api/v1/users/import';
    
    const formData = new FormData();
    formData.append('file', file);
    
    fetch(url, {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => resolve(data))
    .catch(error => reject(error));
  });
}

/** 上传模板 */
export function uploadTemplate(filePath, formData = {}) {
  return uploadFile('/api/v1/admin/templates', filePath, 'file', formData);
}

/** 更新模板 */
export function updateTemplate(templateId, params) {
  return put(`/api/v1/admin/templates/${templateId}`, params);
}

/** 删除模板 */
export function deleteTemplate(templateId) {
  return del(`/api/v1/admin/templates/${templateId}`);
}

/** 导出模板 */
export function exportTemplate(templateId) {
  return get(`/api/v1/admin/templates/${templateId}/download`);
}

/** 获取仪表盘统计 */
export function getDashboardStatus() {
  return get('/api/v1/admin/dashboard/stats');
}

/** 获取审计日志查询 */
export function getAuditLogs(params = {}) {
  return get('/api/v1/admin/audit/logs', params);
}

/** 用户角色转换 (POST /api/v1/users/user/change-role) */
export function changeUserRole(data) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const currentUser = JSON.stringify({
    sub: userInfo.id || userInfo.sub || 0,
    username: userInfo.username || '',
    roles: Array.isArray(userInfo.role) ? userInfo.role : [userInfo.role || 'admin']
  });
  // data: { new_business_id, new_role, original_role, original_sub }
  return request({
    url: '/api/v1/users/user/change-role',
    method: 'POST',
    params: { current_user: currentUser },
    data: data,
    header: { 'Content-Type': 'application/json' }
  });
}

/** 删除用户 (DELETE /api/v1/users/{user_id}) */
export function deleteUser(userId, userType) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const currentUser = JSON.stringify({
    sub: userInfo.id || userInfo.sub || 0,
    username: userInfo.username || '',
    roles: Array.isArray(userInfo.role) ? userInfo.role : [userInfo.role || 'admin']
  });
  return request({
    url: `/api/v1/users/${userId}`,
    method: 'DELETE',
    params: { user_type: userType, current_user: currentUser }
  });
}

/** 创建管理员 (POST /api/v1/users/admins) */
export function createAdmin(data) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const currentUser = JSON.stringify({
    sub: userInfo.id || userInfo.sub || 0,
    username: userInfo.username || '',
    roles: Array.isArray(userInfo.role) ? userInfo.role : [userInfo.role || 'admin']
  });
  // 管理员默认 role 为 admin
  const postData = { ...data, role: data.role || 'admin' };
  return request({
    url: '/api/v1/users/admins',
    method: 'POST',
    params: { current_user: currentUser },
    data: postData,
    header: { 'Content-Type': 'application/json' }
  });
}

/** 批量下载群组论文 (POST /api/v1/groups/download/batch)
 * 所有参数均为 Query 参数
 * @param {string} groupId - 群组ID
 * @param {string} format - 文件格式：zip（打包）或 original
 * @param {object} adminInfo - 管理员信息 {id, username}
 * @param {Array} studentIds - 学生ID列表（可选，空则下载全部）
 */
export function batchDownloadGroupPapers(groupId, format = 'zip', adminInfo = {}, studentIds = []) {
  const currentUser = JSON.stringify({
    sub: adminInfo.id || 0,
    roles: ['admin'],
    username: adminInfo.username || 'admin'
  });
  const queryParams = {
    group_id: String(groupId),
    format,
    current_user: currentUser
  };
  // student_ids 为空数组时不传，表示下载全部
  if (studentIds && studentIds.length > 0) {
    queryParams.student_ids = studentIds;
  }
  return request({
    url: '/api/v1/groups/download/batch',
    method: 'POST',
    params: queryParams,
    responseType: 'arraybuffer',
    timeout: 300000 // 5分钟超时
  });
}

/** 通过论文ID列表下载论文 (POST /api/v1/groups/download/selected)
 * @param {string} paperIds - 论文ID列表，英文逗号分隔，例如: "1,2,3,4,5"
 * @param {object} adminInfo - 管理员信息 {id, username}
 */
export function downloadSelectedPapers(paperIds, adminInfo = {}) {
  const currentUser = JSON.stringify({
    sub: adminInfo.id || 0,
    roles: ['admin'],
    username: adminInfo.username || 'admin'
  });
  return request({
    url: '/api/v1/groups/download/selected',
    method: 'POST',
    params: {
      paper_ids: paperIds,
      current_user: currentUser
    },
    responseType: 'arraybuffer',
    timeout: 300000 // 5分钟超时
  });
}

/** 获取群组论文列表（用于统计数量和大小）(GET /api/v1/groups/papers)
 * @param {string|number} groupId - 群组 ID
 * @param {object} adminInfo - 管理员信息
 * @param {string|number} [teacherId] - 教师内部 id 或工号；不传时回退为 adminInfo.id（旧行为，易 403，建议始终传入群组成员中的教师）
 */
export function getGroupPapersList(groupId, adminInfo = {}, teacherId = null) {
  const currentUser = JSON.stringify({
    sub: adminInfo.id || 0,
    roles: ['admin'],
    username: adminInfo.username || 'admin'
  });
  const tid =
    teacherId != null && teacherId !== ''
      ? String(teacherId)
      : String(adminInfo.id || 1);
  return request({
    url: '/api/v1/groups/papers',
    method: 'GET',
    params: {
      teacher_id: tid,
      group_id: String(groupId),
      current_user: currentUser
    }
  });
}

/** 自动匹配用户类型查询sub (GET /api/v1/users/get-sub-auto) */
export function getUserSubAuto(username) {
  return request({
    url: '/api/v1/users/get-sub-auto',
    method: 'GET',
    params: { username }
  });
}

/** 获取用户完整信息 (POST /api/v1/users/user/full-info) */
export function getUserFullInfo(params) {
  return request({
    url: '/api/v1/users/user/full-info',
    method: 'POST',
    data: params
  });
}

/** ========== 院校信息维护接口 ========== */

/** 录入学校 (POST /api/v1/users/schools) */
export function createSchool(params, currentUser) {
  return request({
    url: '/api/v1/users/schools',
    method: 'POST',
    data: params,
    params: currentUser ? {
      current_user: JSON.stringify(currentUser)
    } : {}
  });
}

/** 录入院系 (POST /api/v1/users/departments) */
export function createDepartment(params, currentUser) {
  return request({
    url: '/api/v1/users/departments',
    method: 'POST',
    data: params,
    params: currentUser ? {
      current_user: JSON.stringify(currentUser)
    } : {}
  });
}

/** 查询学校ID (POST /api/v1/users/schools/query-id) */
export function querySchoolId(params) {
  return post('/api/v1/users/schools/query-id', params);
}

/** 查询院系ID (POST /api/v1/users/departments/query-by-school) */
export function queryDepartmentBySchool(params) {
  return post('/api/v1/users/departments/query-by-school', params);
}

/** 重置用户密码为123456 (POST /api/v1/users/reset-password) */
export function resetUserPassword(userId, userType) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const currentUser = JSON.stringify({
    sub: userInfo.id || userInfo.sub || 0,
    username: userInfo.username || '',
    roles: Array.isArray(userInfo.role) ? userInfo.role : [userInfo.role || 'admin']
  });
  return request({
    url: '/api/v1/users/reset-password',
    method: 'POST',
    params: { current_user: currentUser },
    data: { user_id: userId, user_type: userType },
    header: { 'Content-Type': 'application/json' }
  });
}

/** 创建学生 (POST /api/v1/users/students) */
export function createStudent(data) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const currentUser = JSON.stringify({
    sub: userInfo.id || userInfo.sub || 0,
    username: userInfo.username || '',
    roles: Array.isArray(userInfo.role) ? userInfo.role : [userInfo.role || 'admin']
  });
  return request({
    url: '/api/v1/users/students',
    method: 'POST',
    params: { current_user: currentUser },
    data: data,
    header: { 'Content-Type': 'application/json' }
  });
}

/** 创建教师 (POST /api/v1/users/teachers) */
export function createTeacher(data) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const currentUser = JSON.stringify({
    sub: userInfo.id || userInfo.sub || 0,
    username: userInfo.username || '',
    roles: Array.isArray(userInfo.role) ? userInfo.role : [userInfo.role || 'admin']
  });
  return request({
    url: '/api/v1/users/teachers',
    method: 'POST',
    params: { current_user: currentUser },
    data: data,
    header: { 'Content-Type': 'application/json' }
  });
}


