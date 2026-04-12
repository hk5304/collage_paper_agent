/**
 * 教师相关接口 - 匹配后端 v1 规范
 */
import { get, post, put, del, request } from './request.js';
import { config } from './config.js';

/** 获取班级列表 (匹配后端: GET /groups/ 需要 X-Current-User Header) */
export function getClassList() {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const savedTeacherId = uni.getStorageSync('teacher_id');
  
  // 优先使用 userInfo.id（登录后获取的真实ID）
  let teacherId = userInfo.id || savedTeacherId || 0;
  
  // 确保 teacherId 是数字类型
  teacherId = Number(teacherId);
  
  // 如果 teacherId 为 0，说明用户信息还未保存，返回一个失败的 Promise
  if (teacherId === 0) {
    console.warn('获取班级列表: 教师ID为0，用户信息可能未保存');
    return Promise.reject(new Error('用户信息未准备好'));
  }
  
  const teacherUsername = userInfo.username || uni.getStorageSync('teacher_username') || 'teacher';
  const currentUser = JSON.stringify({
    sub: teacherId,
    roles: [userInfo.role || 'teacher'],
    username: teacherUsername
  });
  console.log('获取班级列表 current_user:', currentUser, 'teacherId:', teacherId);
  // 使用 request 函数直接传递 header
  return request({ 
    url: '/api/v1/groups/', 
    method: 'GET', 
    header: {
      'X-Current-User': currentUser
    }
  });
}

/** 根据班级 ID 获取学生列表 (匹配截图: GET /api/v1/groups/{group_id}/students) */
export function getStudentsByClass(classId) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const currentUser = JSON.stringify({
    sub: userInfo.id || 0,
    roles: [userInfo.role || 'teacher'],
    username: userInfo.username || 'teacher'
  });
  return get(`/api/v1/groups/${classId}/students`, { current_user: currentUser });
}

/** 获取仪表盘统计数据 (匹配截图: GET /api/v1/admin/dashboard/stats) */
export function getDashboardStats(classId) {
  return get('/api/v1/admin/dashboard/stats', { classId });
}

/** 获取仪表盘数据 */
export function getDashboardData() {
  return get('/api/v1/admin/dashboard/stats');
}

/** 查看群组论文列表 (匹配截图: GET /api/v1/groups/papers) */
export function getGroupPapers(teacherId, groupId) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const currentUser = JSON.stringify({
    sub: userInfo.id || 0,
    roles: [userInfo.role || 'teacher'],
    username: userInfo.username || 'teacher'
  });
  return get('/api/v1/groups/papers', { 
    teacher_id: teacherId,
    group_id: groupId,
    current_user: currentUser 
  });
}

/** 查看未上传论文的成员 (匹配截图: GET /api/v1/groups/paper/unuploaded/members) */
export function getUnuploadedMembers(groupId) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const teacherId = uni.getStorageSync('teacher_id') || userInfo.id || 0;
  const currentUser = JSON.stringify({
    sub: String(teacherId),
    roles: ['teacher'],
    username: userInfo.username || 'teacher'
  });
  console.log('getUnuploadedMembers currentUser:', currentUser);
  return request({
    url: '/api/v1/groups/paper/unuploaded/members',
    method: 'GET',
    params: { group_id: groupId },
    header: {
      'X-Current-User': currentUser
    }
  });
}

/** 获取截止日期列表 (匹配截图: GET /api/v1/papers/ddl/list) */
export function getDeadlineSetting(params = {}) {
  // params 通常包含 class_id 或 teacher_id
  // 如果调用方已经提供了 current_user，则不再覆盖
  if (!params.current_user) {
    // 获取当前登录用户信息（后端需要 current_user 进行权限验证）
    const userInfo = uni.getStorageSync('userInfo');
    if (userInfo) {
      // 构造后端要求的 JSON 字符串格式（根据 Swagger 描述）
      // roles 必须是数组
      const roles = Array.isArray(userInfo.role) ? userInfo.role : [userInfo.role];
      params.current_user = JSON.stringify({
        sub: userInfo.id,
        username: userInfo.username,
        roles: roles
      });
      console.log('getDeadlineSetting current_user:', params.current_user);
    }
  }
  return get('/api/v1/papers/ddl/list', params);
}

/** 删除截止日期 (匹配截图: DELETE /api/v1/papers/ddl/{ddlid}) */
export function deleteDeadlineSetting(ddlId, customParams = {}) {
  // 获取当前登录用户信息（后端 Swagger 显示支持 current_user query 参数）
  const params = { ...customParams };
  if (!params.current_user) {
    const userInfo = uni.getStorageSync('userInfo');
    if (userInfo) {
      // 构造后端要求的 JSON 字符串格式（根据 Swagger 描述）
      params.current_user = JSON.stringify({
        sub: userInfo.id,
        username: userInfo.username,
        roles: Array.isArray(userInfo.role) ? userInfo.role : [userInfo.role]
      });
    }
  }
  return del(`/api/v1/papers/ddl/${ddlId}`, true, params);
}

export function saveDeadlineSetting(params) {
  // 参数格式：
  // {
  //   year: 2024,
  //   month: 6,
  //   day: 30,
  //   hour: 23,
  //   minute: 59,
  //   second: 59,
  //   teacher_id: 1
  // }
  // 后端要求所有参数均为 query 形式
  
  // 如果调用方已经提供了 current_user，则不再覆盖
  if (!params.current_user) {
    // 获取当前登录用户信息（后端需要 current_user 进行权限验证）
    const userInfo = uni.getStorageSync('userInfo');
    if (userInfo) {
      // roles 必须是数组
      const roles = Array.isArray(userInfo.role) ? userInfo.role : [userInfo.role];
      params.current_user = JSON.stringify({
        sub: userInfo.id,
        username: userInfo.username,
        roles: roles
      });
      console.log('saveDeadlineSetting current_user:', params.current_user);
    }
  } else {
    console.log('saveDeadlineSetting 使用传入的 current_user:', params.current_user);
  }
  
  return post('/api/v1/papers/ddl/create', {}, true, params);
}

/** 更新截止日期 (PUT /api/v1/papers/ddl/{ddlid}) */
export function updateDeadlineSetting(ddlId, params) {
  // 如果调用方已经提供了 current_user，则不再覆盖
  if (!params.current_user) {
    const userInfo = uni.getStorageSync('userInfo');
    if (userInfo) {
      const roles = Array.isArray(userInfo.role) ? userInfo.role : [userInfo.role];
      params.current_user = JSON.stringify({
        sub: userInfo.id,
        username: userInfo.username,
        roles: roles
      });
    }
  }
  
  return put(`/api/v1/papers/ddl/${ddlId}`, {}, true, params);
}

/** 获取论文预览数据 (匹配截图: GET /api/v1/papers/{paper_id}/versions) */
export function getPaperPreviewData(paperId) {
  return get(`/api/v1/papers/${paperId}/versions`);
}

/** 获取论文下载URL（匹配截图: GET /api/v1/papers/{paper_id}/download） */
export function getDownloadUrl(paperId, studentId) {
  return get(`/api/v1/papers/${paperId}/download`, { student_id: studentId });
}

/** 批量下载论文（新接口：POST /api/v1/groups/download/selected）
 * @param {string} paperIds - 论文ID列表，用英文逗号分隔，例如: 1,2,3,4,5
 * @param {object} customParams - 额外参数
 */
export function batchDownloadPapers(paperIds, customParams = {}) {
  const params = { ...customParams };
  
  // 添加 current_user 参数
  if (!params.current_user) {
    const userInfo = uni.getStorageSync('userInfo');
    if (userInfo) {
      params.current_user = JSON.stringify({
        sub: userInfo.id,
        username: userInfo.username,
        roles: Array.isArray(userInfo.role) ? userInfo.role : [userInfo.role]
      });
    }
  }
  
  // 使用 request 直接发起请求，指定 responseType 为 arraybuffer 以处理文件流
  // 下载接口设置较长的超时时间（5分钟）
  return request({
    url: '/api/v1/groups/download/selected',
    method: 'POST',
    params: { ...params, paper_ids: paperIds },
    responseType: 'arraybuffer',
    timeout: 300000 // 5分钟超时
  });
}

/** 单个下载论文（新接口，通过批量下载接口传单个ID）
 * @param {string|number} paperId - 论文ID
 * @param {object} customParams - 额外参数
 */
export function downloadSinglePaper(paperId, customParams = {}) {
  return batchDownloadPapers(String(paperId), customParams);
}

/** 添加批注 (匹配截图: POST /api/v1/annotations/) */
export function addAnnotation(data) {
  // 后端要求所有参数均为 query 形式，通过 params 传递
  // 添加 current_user 参数用于身份验证
  const userInfo = uni.getStorageSync('userInfo') || {};
  // 使用传入的 teacher_id 作为 current_user.sub，确保权限校验通过
  const teacherId = data.teacher_id || userInfo.id || uni.getStorageSync('teacher_id') || 0;
  const teacherUsername = userInfo.username || uni.getStorageSync('teacher_username') || 'teacher';
  
  const params = {
    ...data,
    current_user: JSON.stringify({
      sub: Number(teacherId),
      username: teacherUsername,
      roles: [userInfo.role || 'teacher']
    })
  };
  
  console.log('添加批注参数:', params);
  return post('/api/v1/annotations/', {}, true, params);
}

/** 编辑批注 (匹配截图: PUT /api/v1/annotations/{annotation_id}) */
export function updateAnnotation(annotationId, data) {
  // 后端要求所有参数均为 query 形式，通过 params 传递
  // 添加 current_user 参数用于身份验证
  const userInfo = uni.getStorageSync('userInfo') || {};
  const teacherId = uni.getStorageSync('teacher_id') || userInfo.id || 0;
  const teacherUsername = uni.getStorageSync('teacher_username') || userInfo.username || 'teacher';
  
  const params = {
    ...data,
    current_user: JSON.stringify({
      sub: Number(teacherId),
      username: teacherUsername,
      roles: [userInfo.role || 'teacher']
    })
  };
  
  console.log('编辑批注参数:', params);
  return put(`/api/v1/annotations/${annotationId}`, {}, true, params);
}

/** 删除批注 (匹配截图: DELETE /api/v1/annotations/{annotation_id}) */
export function deleteAnnotation(annotationId, data) {
  // 后端要求 paper_id 和 teacher_id 均为 query 形式
  // 添加 current_user 参数用于身份验证
  const userInfo = uni.getStorageSync('userInfo') || {};
  // 使用传入的 teacher_id 作为 current_user.sub
  const teacherId = data.teacher_id || userInfo.id || 0;
  const teacherUsername = userInfo.username || 'teacher';
  
  const params = {
    ...data,
    current_user: JSON.stringify({
      sub: Number(teacherId),
      username: teacherUsername,
      roles: [userInfo.role || 'teacher']
    })
  };
  
  console.log('删除批注参数:', params);
  return del(`/api/v1/annotations/${annotationId}`, true, params);
}

/** 获取论文批注列表 (匹配截图: GET /api/v1/annotations/paper) */
export function getAnnotationList(paperId, ownerId) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const teacherId = userInfo.id || uni.getStorageSync('teacher_id') || 0;
  return get('/api/v1/annotations/paper', { 
    paper_id: paperId,
    owner_id: ownerId || teacherId
  });
}

/** 完成反馈 */
export function completeFeedback(paperId, data) {
  return post(`/api/v1/papers/${paperId}/feedback`, data);
}

/** 确认定稿 */
export function confirmFinalize(paperId) {
  return post(`/api/v1/papers/${paperId}/finalize`);
}

/** 获取收到的消息列表 (GET /api/v1/notifications/received) */
export function getMessageList(params = {}, currentUser = null) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const queryParams = {
    teacher_id: userInfo.username || '',  // 教师工号
    current_user: currentUser ? JSON.stringify(currentUser) : ''
  };
  // 支持分页和状态筛选
  if (params.page) queryParams.page = params.page;
  if (params.page_size) queryParams.page_size = params.page_size;
  if (params.status) queryParams.status = params.status;
  return get('/api/v1/notifications/received', queryParams);
}

/** 获取材料名称列表 (匹配截图: GET /api/v1/materials/names) */
export function getMaterialNames(params = {}) {
  // 参数说明：
  // name (optional): 按上传者姓名筛选
  // file_type (optional): 按文件类型筛选，可选值: document, essay
  // keyword (optional): 按文件名关键词模糊筛选
  return get('/api/v1/materials/names', params);
}

/** 更新论文状态 (PUT /api/v1/papers/{paper_id}/status) */
export function updatePaperStatus(paperId, data) {
  // data 包含: status, comment 等
  // 注意：后端要求 status 必须作为 Query 参数
  
  // 获取当前用户信息
  const userInfo = uni.getStorageSync('userInfo') || {};
  const currentUser = JSON.stringify({
    sub: userInfo.user_id || userInfo.id || '',
    username: userInfo.username || '',
    roles: userInfo.roles || ['teacher']
  });
  
  return request({
    url: `/api/v1/papers/${paperId}/status`,
    method: 'PUT',
    params: {
      status: data.status,
      current_user: currentUser
    }
  });
}

/** 查询论文审阅内容 (GET /api/v1/papers/{paper_id}/review) */
export function getPaperReview(paperId) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const currentUser = JSON.stringify({
    sub: userInfo.id || userInfo.sub || 0,
    username: userInfo.username || '',
    roles: ['teacher']
  });
  return get(`/api/v1/papers/${paperId}/review`, { current_user: currentUser });
}

/** 提交论文审阅 (POST /api/v1/papers/{paper_id}/review) */
export function submitPaperReview(paperId, data) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const currentUser = JSON.stringify({
    sub: userInfo.id || userInfo.sub || 0,
    username: userInfo.username || '',
    roles: ['teacher']
  });
  const reviewContent = data.review_content || '';
  
  console.log('submitPaperReview 被调用:', { paperId, reviewContent });
  
  // Body 直接是字符串，需要用 JSON.stringify 包装；current_user 在 Query 中
  return request({
    url: `/api/v1/papers/${paperId}/review`,
    method: 'POST',
    params: { current_user: currentUser },
    data: JSON.stringify(reviewContent),
    header: { 'Content-Type': 'application/json' }
  });
}

/** 更新论文审阅 (PUT /api/v1/papers/{paper_id}/review) */
export function updatePaperReview(paperId, data) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const currentUser = JSON.stringify({
    sub: userInfo.id || userInfo.sub || 0,
    username: userInfo.username || '',
    roles: ['teacher']
  });
  const reviewContent = data.review_content || '';
  
  console.log('updatePaperReview 被调用:', { paperId, reviewContent });
  
  return request({
    url: `/api/v1/papers/${paperId}/review`,
    method: 'PUT',
    params: { current_user: currentUser },
    data: JSON.stringify(reviewContent),
    header: { 'Content-Type': 'application/json' }
  });
}

/** 标记消息为已读 */
export function markMessageAsRead(messageId) {
  return put(`/api/v1/message/${messageId}/read`);
}

/** 标记所有消息为已读 */
export function markAllMessagesAsRead() {
  return post('/api/v1/messages/read-all');
}

/** 获取未读消息数量 */
export function getUnreadMessageCount() {
  return get('/api/v1/messages/unread-count');
}

/** 获取学生论文详情 */
export function getStudentPaperDetail(studentId, paperId) {
  return get('/api/v1/student/paper', { studentId, paperId });
}

/** 置顶/取消置顶学生 */
export function togglePinStudent(studentId, pinned) {
  return put(`/api/v1/student/${studentId}/pin`, { pinned });
}

/** 获取论文详情 (匹配截图: GET /api/v1/papers/{paper_id}) */
export function getPaperDetail(paperId) {
  const userInfo = uni.getStorageSync('userInfo') || {};
  const currentUser = JSON.stringify({
    sub: userInfo.id || userInfo.sub || 0,
    username: userInfo.username || '',
    roles: ['teacher']
  });
  return get(`/api/v1/papers/${paperId}`, { current_user: currentUser });
}

/** 获取AI审查报告 (匹配截图: GET /api/v1/papers/{paper_id}/ai-report) */
export function getAIReport(paperId) {
  return get(`/api/v1/papers/${paperId}/ai-report`);
}

/** 触发AI评审 (匹配截图: POST /api/v1/papers/{paper_id}/ai-review) */
export function triggerAIReview(paperId) {
  return post(`/api/v1/papers/${paperId}/ai-review`);
}

/** 智能体审核：版本号统一为 v1.0 形式 */
export function normalizeAgentApiVersion(version) {
	if (version == null || version === '') return 'v1';
	const s = String(version).trim();
	if (/^v[\d.]/i.test(s)) return s;
	return `v${s}`;
}

/** 智能体：提交论文审核 POST /api/v1/agent/audit
 * 后端 OpenAPI：paper_id、version 在 Query；Body 为 multipart（可选 file），JSON Body 不会被解析 */
export function postAgentAudit(paperId, version) {
	const v = normalizeAgentApiVersion(version);
	const id = Number(paperId);
	if (!Number.isFinite(id) || id <= 0) {
		return Promise.reject(new Error('论文 ID 无效'));
	}
	return post('/api/v1/agent/audit', {}, true, {
		paper_id: id,
		version: v
	});
}

/** 智能体：按论文与版本查询任务 GET /api/v1/agent/tasks/by-paper */
export function getAgentTaskByPaper(paperId, version) {
	const v = normalizeAgentApiVersion(version);
	const id = Number(paperId);
	return get('/api/v1/agent/tasks/by-paper', {
		paper_id: id,
		version: v
	});
}

/** 智能体：查询任务进度 GET /api/v1/agent/tasks/{task_id} */
export function getAgentTask(taskId) {
	return get(`/api/v1/agent/tasks/${taskId}`);
}

/** 智能体：获取 JSON 报告 GET /api/v1/agent/report/{task_id} */
export function getAgentReport(taskId) {
	return get(`/api/v1/agent/report/${taskId}`);
}
