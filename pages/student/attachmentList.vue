<template>
  <view class="attachment-list-page page-enter" :class="{ 'page-fade-out': isPageFadeOut }">
    <!-- 顶部标题栏 -->
    <header class="top-header">
      <view class="header-left">
        <view class="header-brand">
          <view class="header-brand-icon">
            <text class="material-symbols-outlined">attach_file</text>
          </view>
          <view class="header-brand-text">
            <text class="header-brand-title">附件列表</text>
            <text class="header-brand-subtitle">论文管理系统</text>
          </view>
        </view>
      </view>
      <view class="header-right">
        <view class="profile-btn-wrapper student-profile-btn"
          @mouseenter="onUserCardEnter"
          @mouseleave="onUserCardLeave">
          <view class="profile-avatar">
            <text>{{ userNameInitial }}</text>
          </view>
          <view class="profile-info">
            <text class="profile-name">{{ userInfo.full_name || userInfo.name }}</text>
            <text class="profile-role">{{ userInfo.username || '学号未设置' }}</text>
          </view>
          
          <!-- 用户信息卡片 -->
          <view class="user-info-card student-user-card" :class="{ show: showUserCard }" @click.stop
            @mouseenter="onUserCardEnter"
            @mouseleave="onUserCardLeave">
            <view class="user-card-header">
              <view class="user-card-avatar">
                <text>{{ userNameInitial }}</text>
              </view>
              <view class="user-card-info">
                <text class="user-name">{{ userInfo.full_name || userInfo.name }}</text>
                <text class="user-id">学号：{{ userInfo.owner_id || userInfo.username || '未设置' }}</text>
                <view class="user-role-badge">学生</view>
              </view>
            </view>
            <view class="user-card-menu">
              <view class="user-card-menu-item" @click="openChangePassword">
                <text class="material-symbols-outlined">lock</text>
                <text>修改密码</text>
              </view>
              <view class="user-card-menu-item" @click="openAboutModal">
                <text class="material-symbols-outlined">info</text>
                <text>关于系统</text>
              </view>
              <view class="user-card-menu-item logout" @click="logout">
                <text class="material-symbols-outlined">logout</text>
                <text>退出登录</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </header>

    <view class="main-layout-wrapper">
    <view class="main-layout">
      <!-- 左侧边栏 -->
      <view class="sidebar">
        <view class="sidebar-title">附件统计</view>
        <view class="sidebar-content">
          <view class="stats-panel">
            <view class="stat-item">
              <view class="stat-icon material-symbols-outlined">attach_file</view>
              <view class="stat-content">
                <text class="stat-label">附件总数</text>
                <text class="stat-value">{{ attachmentList.length }}</text>
              </view>
            </view>
            <!-- 附件名称列表 -->
            <view 
              v-for="attachment in sidebarAttachments" 
              :key="attachment.id"
              class="stat-item clickable attachment-stat-item"
              @click="handleSidebarItemClick(attachment)"
            >
              <view class="stat-icon material-symbols-outlined">{{ getFileIcon(attachment.type) }}</view>
              <view class="stat-content">
                <text class="stat-label">{{ getSidebarAttachmentName(attachment.name) }}</text>
                <text class="stat-value">{{ getTypeLabel(attachment.type) }}</text>
              </view>
            </view>
          </view>
          <view class="sidebar-menu">
            <view class="menu-item" @click="goToWorkbench">
              <view class="menu-icon material-symbols-outlined">home</view>
              <text class="menu-text">返回工作台</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 右侧内容区 -->
      <view class="content-area">
        <view class="content-wrapper">
        <!-- 加载中提示 -->
        <view v-if="loading" class="loading-container">
          <view class="loading-spinner"></view>
          <text class="loading-text">正在加载附件数据...</text>
        </view>

        <!-- 附件列表 -->
        <transition-group v-else name="attachment-list" tag="view" class="attachment-list">
          <view
            v-for="(item, index) in filteredAttachments"
            :key="item.id"
            :id="'attachment-' + item.id"
            class="attachment-card"
            :class="{ highlighted: highlightedAttachmentId === item.id }"
          >
            <!-- 附件头部 -->
            <view class="attachment-header">
              <view class="file-info">
                <view class="file-icon">
                  <text class="icon-text material-symbols-outlined">{{ getFileIcon(item.type) }}</text>
                </view>
                <view class="file-details">
                  <text class="file-name">{{ item.name }}</text>
                  <text class="file-meta">{{ item.uploadTime }}</text>
                </view>
              </view>
              <view class="type-badge">
                <text>{{ getTypeLabel(item.type) }}</text>
              </view>
            </view>

            <!-- 附件内容 -->
            <view class="attachment-content" v-if="item.description && item.description !== '暂无描述'">
              <view class="description-section">
                <text class="description-label">备注说明：</text>
                <text class="description-text">{{ item.description }}</text>
              </view>
            </view>

            <!-- 操作按钮 -->
            <view class="attachment-actions">
              <button class="action-btn" @click="viewAttachment(item)">
                <text class="btn-icon material-symbols-outlined">visibility</text>
                <text>查看</text>
              </button>
              <button class="action-btn" @click="downloadAttachment(item)">
                <text class="btn-icon material-symbols-outlined">download</text>
                <text>下载</text>
              </button>
              <button class="action-btn delete-btn" @click="deleteAttachment(item.id, item.name)">
                <text class="btn-icon material-symbols-outlined">delete</text>
                <text>删除</text>
              </button>
            </view>
          </view>
        </transition-group>

        <!-- 空状态 -->
        <view v-if="filteredAttachments.length === 0 && !loading" class="empty-container">
          <text class="empty-icon material-symbols-outlined">inbox</text>
          <text class="empty-text">暂无附件数据</text>
          <text class="empty-subtext">请从工作台上传附件</text>
        </view>
      </view>
    </view>
    </view>
    </view>
    
    <!-- 确认弹窗组件 -->
    <view
      v-if="showConfirmModal"
      class="attachment-confirm-modal workbench-confirm-modal"
      @click.self="handleConfirmModalCancel"
    >
      <view class="workbench-confirm-content">
        <view class="paper-card-modal-header workbench-confirm-header">
          <view class="workbench-confirm-title-group">
            <view class="workbench-confirm-icon" :class="{ danger: confirmModalIsDanger }">
              <text class="material-symbols-outlined">{{ confirmModalIcon }}</text>
            </view>
            <text class="paper-card-modal-title workbench-confirm-title">{{ confirmModalTitle }}</text>
          </view>
          <text class="paper-card-modal-close material-symbols-outlined" @click="handleConfirmModalCancel">close</text>
        </view>
        <view class="paper-card-modal-body workbench-confirm-body">
          <text class="workbench-confirm-message">{{ confirmModalContent }}</text>
        </view>
        <view class="workbench-confirm-footer">
          <button class="workbench-confirm-btn secondary" @click="handleConfirmModalCancel">取消</button>
          <button
            class="workbench-confirm-btn primary"
            :class="{ danger: confirmModalIsDanger }"
            @click="handleConfirmModalConfirm"
          >
            {{ confirmModalConfirmText }}
          </button>
        </view>
      </view>
    </view>
    
    <!-- 修改密码弹窗 -->
    <view v-if="showPasswordModal" class="modal-backdrop" @click.self="closePasswordModal">
      <view class="modal-content password-modal-content student-user-panel-modal">
        <view class="user-panel-header">
          <text class="user-panel-title">修改密码</text>
          <text class="user-panel-close" @click="closePasswordModal">×</text>
        </view>
        <view class="user-panel-body">
          <view class="user-panel-form-item">
            <text class="user-panel-form-label">当前密码</text>
            <input 
              class="user-panel-form-input"
              type="password" 
              v-model="passwordForm.currentPassword"
              placeholder="请输入当前密码"
            />
          </view>
          <view class="user-panel-form-item">
            <text class="user-panel-form-label">新密码</text>
            <input 
              class="user-panel-form-input"
              type="password" 
              v-model="passwordForm.newPassword"
              placeholder="请输入新密码（至少6位）"
            />
          </view>
          <view class="user-panel-form-item">
            <text class="user-panel-form-label">确认新密码</text>
            <input 
              class="user-panel-form-input"
              type="password" 
              v-model="passwordForm.confirmPassword"
              placeholder="请再次输入新密码"
            />
          </view>
          <view class="user-panel-form-tips" v-if="!passwordError">
            <text class="user-panel-tips-text">密码修改成功后需要重新登录</text>
          </view>
          <view class="user-panel-form-tips error-tips" v-else>
            <text class="user-panel-tips-text error-text">{{ passwordError }}</text>
          </view>
        </view>
        <view class="user-panel-footer">
          <view class="user-panel-btn user-panel-btn-cancel" @click="closePasswordModal">取消</view>
          <view class="user-panel-btn user-panel-btn-confirm" @click="submitChangePassword">确认修改</view>
        </view>
      </view>
    </view>
    
  </view>
</template>

<script>
import { getUserId, isValidUserId, checkLogin } from '../../utils/auth.js';
import { getAttachmentList, deleteAttachment, getWorkbenchData } from '../../api/student.js';
import { config } from '../../api/config.js';

import { changePassword } from '../../api/student.js';
import { clearLoginState } from '../../utils/auth.js';

export default {
  data() {
    return {
      // 页面淡出状态（跳转动画）
      isPageFadeOut: false,
      userInfo: {
        name: '',
        full_name: '',
        username: ''
      },
      attachmentList: [],
      loading: true,
      // 左侧栏展示用的附件列表
      sidebarAttachments: [],
      // 论文ID列表
      paperIds: [],
      // 按论文分组的附件数据
      attachmentsByPaper: {},
      // 确认弹窗相关
      showConfirmModal: false,
      confirmModalTitle: '',
      confirmModalContent: '',
      confirmModalCallback: null,
      currentFilter: 'all',
      // 左侧栏点击后高亮的附件ID
      highlightedAttachmentId: null,
      // 附件列表刷新key
      attachmentListKey: 0,
      backupAttachmentList: [
        {
          id: 1,
          name: '实验数据汇总表.xlsx',
          type: 'sheet',
          size: 2560000,
          uploadTime: '2026-01-20 14:30',
          description: '包含所有实验组的原始数据',
          fileUrl: ''
        },
        {
          id: 2,
          name: '调研问卷结果.docx',
          type: 'doc',
          size: 1536000,
          uploadTime: '2026-01-18 10:15',
          description: '用户满意度调研问卷统计结果',
          fileUrl: ''
        },
        {
          id: 3,
          name: '参考文献合集.pdf',
          type: 'pdf',
          size: 5120000,
          uploadTime: '2026-01-15 16:45',
          description: '相关领域重要文献整理',
          fileUrl: ''
        }
      ],
      // 用户卡片
      showUserCard: false,
      // 修改密码弹窗
      showPasswordModal: false,
      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordError: ''
    };
  },
  computed: {
    userNameInitial() {
      const displayName = this.userInfo.full_name || this.userInfo.name || '用';
      return displayName.charAt(0);
    },
    confirmModalIsDanger() {
      const modalText = `${this.confirmModalTitle || ''} ${this.confirmModalContent || ''}`;
      return /删除|移除|不可恢复/.test(modalText);
    },
    confirmModalIcon() {
      if (this.confirmModalIsDanger) return 'delete';
      if (/下载/.test(this.confirmModalTitle || '')) return 'download';
      return 'info';
    },
    confirmModalConfirmText() {
      return this.confirmModalIsDanger ? '确认删除' : '确定';
    },
    filteredAttachments() {
      if (this.currentFilter === 'all') {
        return this.attachmentList;
      }
      if (this.currentFilter === 'other') {
        return this.attachmentList.filter(item => !['doc', 'sheet', 'pdf'].includes(item.type));
      }
      return this.attachmentList.filter(item => item.type === this.currentFilter);
    }
  },
  onLoad() {
    if (!checkLogin({ redirect: true, message: '请先登录' })) {
      return;
    }
    // 加载用户信息
    this.loadUserInfo();
    // 首次加载显示 loading
    this.loadAttachmentList(true);
    this._skipNextShow = true;
  },
  onShow() {
    // 重置淡出状态
    this.isPageFadeOut = false;
    
    if (this._skipNextShow) {
      this._skipNextShow = false;
      return;
    }
    // 从后台返回时不显示 loading，使用缓存快速显示
    this.loadAttachmentList(false);
  },
  
  onUnload() {
    // 清理导航定时器
    if (this._navigateTimer) {
      clearTimeout(this._navigateTimer);
      this._navigateTimer = null;
    }
    if (this._userCardShowTimer) {
      clearTimeout(this._userCardShowTimer);
      this._userCardShowTimer = null;
    }
    if (this._userCardHideTimer) {
      clearTimeout(this._userCardHideTimer);
      this._userCardHideTimer = null;
    }
    if (this._attachmentHighlightTimer) {
      clearTimeout(this._attachmentHighlightTimer);
      this._attachmentHighlightTimer = null;
    }
  },
  
  methods: {
    // 用户卡片鼠标进入（延迟显示）
    onUserCardEnter() {
      if (this._userCardHideTimer) {
        clearTimeout(this._userCardHideTimer);
        this._userCardHideTimer = null;
      }
      this._userCardShowTimer = setTimeout(() => {
        this.showUserCard = true;
      }, 300);
    },
    
    // 用户卡片鼠标离开（延迟隐藏）
    onUserCardLeave() {
      if (this._userCardShowTimer) {
        clearTimeout(this._userCardShowTimer);
        this._userCardShowTimer = null;
      }
      this._userCardHideTimer = setTimeout(() => {
        this.showUserCard = false;
      }, 1000);
    },
    
    // 打开修改密码弹窗
    openChangePassword() {
      this.showUserCard = false;
      this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
      this.passwordError = '';
      this.showPasswordModal = true;
    },

    openAboutModal() {
      this.showUserCard = false;
      uni.showToast({
        title: '当前为论文管理系统v1.0版本',
        icon: 'none'
      });
    },
    
    // 关闭修改密码弹窗
    closePasswordModal() {
      this.showPasswordModal = false;
      this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
      this.passwordError = '';
    },
    
    // 提交修改密码
    async submitChangePassword() {
      const { currentPassword, newPassword, confirmPassword } = this.passwordForm;
      
      // 密码表单验证（生产环境不输出密码信息）
      if (!currentPassword) {
        this.passwordError = '请输入当前密码';
        return;
      }
      if (!newPassword) {
        this.passwordError = '请输入新密码';
        return;
      }
      if (newPassword.length < 6) {
        this.passwordError = '新密码长度不能少于6位';
        return;
      }
      if (newPassword !== confirmPassword) {
        this.passwordError = '两次输入的新密码不一致';
        return;
      }
      if (currentPassword === newPassword) {
        this.passwordError = '新密码不能与当前密码相同';
        return;
      }
      
      this.passwordError = '';
      
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('[ChangePassword] 开始修改密码');
        }
        
        uni.showLoading({ title: '修改中...', mask: true });
        
        const res = await changePassword({
          old_password: currentPassword,
          new_password: newPassword
        });
        
        uni.hideLoading();
        
        // 判断修改成功（后端返回 message 或 HTTP 状态码为 200）
        if (res && (res.message?.includes('成功') || res.code === 200)) {
          uni.showToast({ title: '密码修改成功，请重新登录', icon: 'success', duration: 2000 });
          this.closePasswordModal();
          setTimeout(() => {
            clearLoginState();
            uni.reLaunch({ url: '/pages/index/index' });
          }, 2000);
        } else {
          // 显示后端返回的错误信息
          this.passwordError = res?.detail || res?.message || '密码修改失败';
        }
      } catch (err) {
        uni.hideLoading();
        this.passwordError = err?.message || err?.detail || '密码修改失败，请检查输入后重试';
      }
    },
    
    // 退出登录
    logout() {
      this.showUserCard = false;
      clearLoginState();
      uni.removeStorageSync('rememberedUsername');
      uni.showToast({ title: '已退出登录', icon: 'success' });
      setTimeout(() => {
        uni.reLaunch({ url: '/pages/index/index' });
      }, 1000);
    },

    // ─── 导航 ───────────────────────────────────────────

    loadUserInfo() {
      try {
        let userInfo = uni.getStorageSync('userInfo');
        
        // 如果获取的是字符串，需要解析
        if (typeof userInfo === 'string') {
          userInfo = JSON.parse(userInfo);
        }
        
        if (userInfo) {
          this.userInfo = {
            name: userInfo.full_name || userInfo.name || userInfo.username || '学生',
            full_name: userInfo.full_name || userInfo.name || '学生',
            username: userInfo.username || ''
          };
        }
      } catch (e) {
        console.error('加载用户信息失败:', e);
        this.userInfo = { name: '学生', full_name: '学生', username: '' };
      }
    },

    goBack() {
      uni.navigateBack();
    },

    goToWorkbench() {
      this.isPageFadeOut = true;
      this._navigateTimer = setTimeout(() => {
        this._navigateTimer = null;
        uni.navigateTo({ url: '/pages/student/workbench' });
      }, 300);
    },
    getSidebarAttachmentName(name) {
      if (!name) return '未命名附件';
      if (name.length <= 10) return name;
      return name.substring(0, 10) + '...';
    },
    handleSidebarItemClick(attachment) {
      if (!attachment || !attachment.id) return;

      const targetId = attachment.id;
      const targetIndex = this.attachmentList.findIndex(item => item.id === targetId);
      if (targetIndex === -1) return;

      const targetItem = this.attachmentList[targetIndex];
      const remainingItems = this.attachmentList.filter(item => item.id !== targetId);
      this.attachmentList = [targetItem, ...remainingItems];

      this.highlightedAttachmentId = targetId;
      if (this._attachmentHighlightTimer) {
        clearTimeout(this._attachmentHighlightTimer);
      }
      this._attachmentHighlightTimer = setTimeout(() => {
        this.highlightedAttachmentId = null;
        this._attachmentHighlightTimer = null;
      }, 2000);
    },
    syncSidebarAttachments() {
      this.sidebarAttachments = this.attachmentList.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        size: item.size
      }));
    },
    getFileIcon(type) {
      const iconMap = {
        'doc': 'description',
        'sheet': 'table_chart',
        'pdf': 'picture_as_pdf',
        'image': 'image',
        'other': 'folder'
      };
      return iconMap[type] || 'folder';
    },
    getTypeLabel(type) {
      const labelMap = {
        'doc': '文档',
        'sheet': '表格',
        'pdf': 'PDF',
        'image': '图片',
        'other': '其他'
      };
      return labelMap[type] || '其他';
    },
    formatFileSize(bytes) {
      if (!bytes || bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    async loadAttachmentList(showLoading = true) {
      const userId = getUserId();
      
      if (!isValidUserId(userId)) {
        this.loading = false;
        this.attachmentList = [];
        this.sidebarAttachments = [];
        return;
      }

      if (showLoading) {
        this.loading = true;
      }

      try {
        // 第一步：获取论文列表，提取所有论文ID
        console.log('[附件列表] 获取论文列表...');
        const paperRes = await getWorkbenchData();
        let papers = [];
        if (Array.isArray(paperRes)) {
          papers = paperRes;
        } else if (paperRes?.data && Array.isArray(paperRes.data)) {
          papers = paperRes.data;
        }
        
        // 提取论文ID
        this.paperIds = papers
          .map(p => p.id)
          .filter(id => id && !isNaN(parseInt(id)));
        console.log('[附件列表] 论文ID列表:', this.paperIds);
        
        // 第二步：逐个获取每个论文的附件
        const allAttachments = [];
        this.attachmentsByPaper = {};
        
        for (const paperId of this.paperIds) {
          try {
            console.log(`[附件列表] 获取论文ID ${paperId} 的附件...`);
            const res = await getAttachmentList(paperId);
            const files = res?.files || [];
            
            // 格式化并标记所属论文
            const formattedFiles = files.map(f => ({
              ...this.formatSingleAttachment(f),
              _paperId: paperId
            }));
            
            this.attachmentsByPaper[paperId] = formattedFiles;
            allAttachments.push(...formattedFiles);
            
            console.log(`[附件列表] 论文ID ${paperId} 有 ${files.length} 个附件`);
          } catch (err) {
            console.warn(`[附件列表] 获取论文ID ${paperId} 的附件失败:`, err);
            this.attachmentsByPaper[paperId] = [];
          }
        }
        
        // 去重（同一附件可能关联多个论文）
        const seenIds = new Set();
        this.attachmentList = allAttachments.filter(f => {
          if (seenIds.has(f.id)) return false;
          seenIds.add(f.id);
          return true;
        });
        this.syncSidebarAttachments();
        
        console.log('[附件列表] 汇总附件总数:', this.attachmentList.length);
        
        this.loading = false;
        this.attachmentListKey++;
        
        // 缓存到本地存储
        uni.setStorageSync('studentAttachments', this.attachmentList);
        uni.setStorageSync('attachmentsByPaper', this.attachmentsByPaper);
        
      } catch (err) {
        console.error('[附件列表] 获取失败:', err);
        this.loading = false;
        this.attachmentListKey++;
        
        // 尝试从缓存加载
        const cachedData = uni.getStorageSync('studentAttachments');
        if (cachedData && Array.isArray(cachedData)) {
          this.attachmentList = cachedData;
          this.syncSidebarAttachments();
        } else {
          this.sidebarAttachments = [];
        }
      }
    },
    
    // 格式化单个附件数据
    formatSingleAttachment(item) {
      // 处理时间格式
      let timeStr = item.upload_time || item.created_at || item.uploadTime || '';
      if (timeStr) {
        timeStr = timeStr.replace('T', ' ').replace(/:\d{2}$/, '');
        timeStr = `最近更新：${timeStr}`;
      } else {
        timeStr = '最近更新：暂无';
      }
      
      // 判断文件类型
      const ext = (item.filename || item.name || '').split('.').pop().toLowerCase();
      let type = 'other';
      if (['doc', 'docx', 'pdf', 'txt'].includes(ext)) type = 'doc';
      else if (['xls', 'xlsx', 'csv'].includes(ext)) type = 'sheet';
      else if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) type = 'image';
      
      return {
        id: item.id,
        name: item.filename || item.name || '未命名文件',
        type: type,
        size: item.size || 0,
        uploadTime: timeStr,
        description: item.remark || item.description || item.note || '',
        fileUrl: item.storage_path || item.fileUrl || '',
        version: item.version || 1,
        paperId: item.paper_id || item.paperId
      };
    },
    loadFromLocalStorage() {
      try {
        const savedAttachments = uni.getStorageSync('studentAttachments');
        if (savedAttachments && Array.isArray(savedAttachments) && savedAttachments.length > 0) {
          this.attachmentList = savedAttachments;
          this.syncSidebarAttachments();
        } else {
          this.attachmentList = this.backupAttachmentList;
          this.syncSidebarAttachments();
          uni.setStorageSync('studentAttachments', this.attachmentList);
        }
      } catch (error) {
        console.error('加载附件数据失败:', error);
        this.attachmentList = this.backupAttachmentList;
        this.syncSidebarAttachments();
      }
    },
    formatAttachmentData(list) {
      return list.map((item, index) => {
        // 后端返回字段: id, uploader_name, filename, file_type, upload_time, version, storage_path
        // 处理时间格式：将 ISO 格式 (2026-03-22T15:10:07) 转换为友好格式
        let timeStr = item.upload_time || item.created_at || item.uploadTime || '';
        if (timeStr) {
          // 替换 T 为空格，去掉秒部分 (2026-03-22T15:10:07 -> 2026-03-22 15:10)
          timeStr = timeStr.replace('T', ' ').replace(/:\d{2}$/, '');
          timeStr = `最近更新：${timeStr}`;
        } else {
          timeStr = '最近更新：暂无';
        }
        
        return {
          id: item.id || index,
          name: item.filename || item.name || item.title || '未命名附件',
          type: this.getFileType(item.filename || item.file_type || ''),
          size: item.size || item.file_size || 0,
          uploadTime: timeStr,
          description: item.remark || item.description || '',
          fileUrl: item.storage_path || item.file_url || item.url || '',
          uploaderName: item.uploader_name || item.name || '',
          version: item.version || 1
        };
      });
    },
    getFileType(filename) {
      if (!filename) return 'other';
      const ext = filename.split('.').pop().toLowerCase();
      if (['doc', 'docx'].includes(ext)) return 'doc';
      if (['xls', 'xlsx'].includes(ext)) return 'sheet';
      if (['pdf'].includes(ext)) return 'pdf';
      if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image';
      return 'other';
    },
    getAttachmentUrl(item) {
      // Support full URLs, static paths, and storage paths.
      const rawPath = item.fileUrl || item.storage_path || '';
      if (!rawPath) return '';

      if (/^https?:\/\//i.test(rawPath)) {
        return rawPath;
      }

      if (rawPath.startsWith('/doc/attachment/')) {
        return `${config.baseURL}${encodeURI(rawPath)}`;
      }

      const filename = rawPath.split('/').pop();
      if (!filename) return '';

      return `${config.baseURL}/doc/attachment/${encodeURIComponent(filename)}`;
    },

    viewAttachment(item) {
      console.log('[viewAttachment] 查看附件:', item);
      
      if (!item.id) {
        uni.showToast({ title: '附件信息不完整', icon: 'none' });
        return;
      }

      const fileUrl = this.getAttachmentUrl(item);
      const ext = (item.name || '').split('.').pop().toLowerCase();

      if (!fileUrl) {
        uni.showToast({ title: '附件链接无效', icon: 'none' });
        return;
      }
      
      console.log('[viewAttachment] 文件URL:', fileUrl, '扩展名:', ext);

      // #ifdef H5
      window.open(fileUrl, '_blank');
      // #endif
      // #ifndef H5
      uni.showLoading({ title: '加载中...' });
      uni.downloadFile({
        url: fileUrl,
        success: (res) => {
          uni.hideLoading();
          if (res.statusCode === 200) {
            uni.openDocument({ filePath: res.tempFilePath, showMenu: true,
              fail: () => uni.showToast({ title: '预览失败', icon: 'none' })
            });
          } else {
            uni.showToast({ title: '加载失败', icon: 'none' });
          }
        },
        fail: () => { uni.hideLoading(); uni.showToast({ title: '加载失败', icon: 'none' }); }
      });
      // #endif
    },

    // 显示确认弹窗
    showConfirm(title, content, callback) {
      this.confirmModalTitle = title;
      this.confirmModalContent = content;
      this.confirmModalCallback = callback;
      this.showConfirmModal = true;
    },
    
    // 处理确认弹窗确认
    handleConfirmModalConfirm() {
      this.showConfirmModal = false;
      if (this.confirmModalCallback) {
        this.confirmModalCallback(true);
      }
      this.confirmModalCallback = null;
    },
    
    // 处理确认弹窗取消
    handleConfirmModalCancel() {
      this.showConfirmModal = false;
      if (this.confirmModalCallback) {
        this.confirmModalCallback(false);
      }
      this.confirmModalCallback = null;
    },
    
    async downloadAttachment(item) {
      if (!item.id) {
        uni.showToast({ title: '附件信息不完整', icon: 'none' });
        return;
      }

      const fileUrl = this.getAttachmentUrl(item);
      const downloadName = item.name || '附件';

      this.showConfirm('下载确认', `即将下载附件《${downloadName}》，是否继续？`, async (confirmed) => {
        if (!confirmed) return;

        uni.showLoading({ title: '下载中...' });

        // #ifdef H5
        try {
          const response = await fetch(fileUrl);
          if (!response.ok) throw new Error('下载失败');
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = downloadName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          uni.hideLoading();
          uni.showToast({ title: '下载完成', icon: 'success' });
        } catch (e) {
          uni.hideLoading();
          uni.showToast({ title: '下载失败', icon: 'none' });
        }
        // #endif

        // #ifndef H5
        uni.downloadFile({
          url: fileUrl,
          success: (downloadRes) => {
            uni.hideLoading();
            if (downloadRes.statusCode === 200) {
              uni.saveFile({
                tempFilePath: downloadRes.tempFilePath,
                success: () => uni.showToast({ title: '文件已保存', icon: 'success' }),
                fail: () => uni.showToast({ title: '保存失败', icon: 'none' })
              });
            } else {
              uni.showToast({ title: '下载失败', icon: 'none' });
            }
          },
          fail: () => { uni.hideLoading(); uni.showToast({ title: '下载失败', icon: 'none' }); }
        });
        // #endif
      });
    },
    async deleteAttachment(id, name) {
      const attachmentName = name || '未命名附件';
      this.showConfirm('确认删除', `确定要删除附件《${attachmentName}》吗？此操作不可恢复。`, async (confirmed) => {
        if (!confirmed) return;
        
        try {
          // 调用后端 API 删除
          await deleteAttachment(id);
          
          // 更新本地存储
          const savedAttachments = uni.getStorageSync('studentAttachments');
          if (savedAttachments && Array.isArray(savedAttachments)) {
            const updatedAttachments = savedAttachments.filter(item => item.id !== id);
            uni.setStorageSync('studentAttachments', updatedAttachments);
          }
          
          // 更新前端列表
          this.attachmentList = this.attachmentList.filter(item => item.id !== id);
          this.sidebarAttachments = this.sidebarAttachments.filter(item => item.id !== id);
          if (this.highlightedAttachmentId === id) {
            this.highlightedAttachmentId = null;
          }
          uni.showToast({ title: '删除成功', icon: 'success' });
        } catch (error) {
          console.error('删除失败:', error);
          uni.showToast({ title: '删除失败: ' + (error.message || '未知错误'), icon: 'none' });
        }
      });
    }
  }
};
</script>

<style scoped>
/* ==================== CSS变量定义 - 与论文列表保持一致 ==================== */
.attachment-list-page {
  /* Primary Colors */
  --primary: #005bbf;
  --primary-container: #1a73e8;
  --primary-fixed: #d6e3ff;
  --on-primary-fixed: #002e6d;

  /* Surface Hierarchy */
  --surface: #f8f9fa;
  --surface-bright: #ffffff;
  --surface-container-low: #f3f4f5;
  --surface-container-lowest: #ffffff;
  --surface-container-high: #e7e8e9;
  --surface-variant: rgba(225, 227, 228, 0.6);

  /* Text Colors */
  --on-surface: #191c1d;
  --on-surface-variant: #5a5f61;
  --outline: #727785;
  --outline-variant: rgba(193, 198, 214, 0.15);

  /* Semantic Colors */
  --error: #ba1a1a;
  --error-container: #ffdad6;
  --on-error-container: #410002;
  --tertiary: #006a5f;
  --tertiary-container: #b2dfdb;
  --on-tertiary-container: #00201c;
  --secondary-container: #e0e2ec;
  --on-secondary-container: #191c1d;
  --amber-tint: #fef3c7;
  --on-amber: #92400e;

  /* Shadows - Ambient light physics */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-ambient: 0 16px 48px rgba(25, 28, 29, 0.08);
  --shadow-primary: 0 4px 16px rgba(0, 91, 191, 0.25);

  /* Typography */
  --font-display: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

  /* Spacing */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-5: 1.25rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;

  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-full: 9999px;

  /* 动画缓动函数 */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-in-out-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);

  /* 动画时长 */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --duration-enter: 600ms;
}

.attachment-list-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* ==================== 全局性能优化 ==================== */
/* 减少动画对性能的影响 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* ==================== 响应式设计 ==================== */

/* 大屏幕 (>1400px) */
@media screen and (min-width: 1400px) {
  .main-layout {
    padding-left: 256px;
  }
  
  .sidebar {
    width: 256px;
  }
  
  .attachment-card {
    padding: 40rpx;
  }
  
  .file-name {
    font-size: 36rpx;
  }
}

/* 中等屏幕 (992px-1399px) */
@media screen and (max-width: 1399px) and (min-width: 992px) {
  .main-layout {
    padding-left: 256px;
  }
  
  .sidebar {
    width: 256px;
  }
  
  .attachment-card {
    padding: 35rpx;
  }
}

/* 平板屏幕 (768px-991px) */
@media screen and (max-width: 991px) and (min-width: 768px) {
  .main-layout {
    padding-left: 256px;
    padding-right: 16rpx;
  }
  
  .sidebar {
    width: 256px;
    padding: 20rpx 12rpx;
  }
  
  .sidebar-title {
    font-size: 30rpx;
  }
  
  .stat-label {
    font-size: 24rpx;
  }
  
  .stat-value {
    font-size: 40rpx;
  }
  
  .attachment-card {
    padding: 30rpx;
  }
  
  .file-name {
    font-size: 32rpx;
  }
  
  .header-brand-title {
    font-size: 16px;
  }
  
  .header-brand-subtitle {
    font-size: 10px;
  }
}

/* 小屏幕手机 (<768px) */
@media screen and (max-width: 767px) {
  /* 侧边栏变为顶部导航 */
  .sidebar {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    width: 100%;
    height: auto;
    max-height: 200px;
    padding: 16rpx;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 16rpx;
    overflow-x: auto;
    overflow-y: hidden;
    z-index: 99;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  }
  
  .sidebar-title {
    width: 100%;
    font-size: 28rpx;
    margin-bottom: 12rpx;
    padding-bottom: 12rpx;
  }
  
  .stats-panel {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 12rpx;
  }
  
  .stat-item {
    flex: 1;
    min-width: 140rpx;
    padding: 20rpx 16rpx;
  }
  
  .stat-icon {
    width: 60rpx;
    height: 60rpx;
    font-size: 36rpx;
  }
  
  .stat-label {
    font-size: 22rpx;
  }
  
  .stat-value {
    font-size: 36rpx;
  }
  
  .sidebar-menu {
    display: none;
  }
  
  /* 主内容区调整 */
  .main-layout {
    padding-left: 0;
    padding-top: 280px;
    padding-right: 16rpx;
  }
  
  .content-area {
    padding: 16rpx;
  }
  
  /* 顶部标题栏 */
  .top-header {
    padding: 0 16rpx;
  }
  
  .header-brand-icon {
    width: 36px;
    height: 36px;
  }
  
  .header-brand-title {
    font-size: 15px;
  }
  
  .header-brand-subtitle {
    display: none;
  }
  
  .profile-info {
    display: none;
  }
  
  /* 附件卡片 */
  .attachment-card {
    padding: 24rpx;
    margin: 0 0 16rpx 0;
  }
  
  .attachment-header {
    flex-direction: column;
    gap: 16rpx;
    margin-bottom: 20rpx;
    padding-bottom: 20rpx;
  }
  
  .file-info {
    width: 100%;
  }
  
  .file-icon {
    width: 70rpx;
    height: 70rpx;
  }
  
  .icon-text {
    font-size: 36rpx;
  }
  
  .file-name {
    font-size: 28rpx;
  }
  
  .file-meta {
    font-size: 22rpx;
  }
  
  .type-badge {
    align-self: flex-start;
  }
  
  /* 操作按钮 */
  .attachment-actions {
    flex-wrap: wrap;
    gap: 12rpx;
  }
  
  .action-btn {
    flex: 1;
    min-width: 100rpx;
    padding: 16rpx 20rpx;
    font-size: 24rpx;
  }
  
  .action-btn .btn-icon {
    font-size: 24rpx;
  }
  
  /* 描述区域 */
  .description-section {
    padding: 16rpx;
  }
  
  .description-label {
    font-size: 24rpx;
  }
  
  .description-text {
    font-size: 24rpx;
  }
  
  /* 空状态 */
  .empty-container {
    padding: 80rpx 40rpx;
    margin: 0;
  }
  
  .empty-icon {
    font-size: 64rpx;
  }
  
  .empty-text {
    font-size: 28rpx;
  }
  
  .empty-subtext {
    font-size: 24rpx;
  }
  
  /* 加载状态 */
  .loading-container {
    margin: 0;
    padding: 80rpx 0;
  }
}

/* 超小屏幕 (<480px) */
@media screen and (max-width: 479px) {
  .sidebar {
    max-height: 180px;
    padding: 12rpx;
  }
  
  .main-layout-wrapper {
    padding-top: 240px;
  }
  
  .stat-item {
    min-width: 120rpx;
    padding: 16rpx 12rpx;
  }
  
  .stat-icon {
    width: 48rpx;
    height: 48rpx;
    font-size: 28rpx;
  }
  
  .stat-label {
    font-size: 20rpx;
  }
  
  .stat-value {
    font-size: 32rpx;
  }
  
  .attachment-card {
    padding: 20rpx;
  }
  
  .file-icon {
    width: 60rpx;
    height: 60rpx;
  }
  
  .icon-text {
    font-size: 32rpx;
  }
  
  .file-name {
    font-size: 26rpx;
  }
  
  .action-btn {
    padding: 14rpx 16rpx;
    font-size: 22rpx;
  }
  
  .action-btn .btn-icon {
    font-size: 22rpx;
  }
}

/* 窗口缩放时的过渡动画 */
@media screen and (max-height: 920px) {
  .main-layout {
    gap: 16rpx;
    padding-right: 16rpx;
  }

  .sidebar {
    padding: 18rpx 16rpx;
  }

  .sidebar-title {
    margin-bottom: 20rpx;
    padding-bottom: 16rpx;
  }

  .stats-panel,
  .sidebar-menu {
    gap: 16rpx;
  }

  .stat-item,
  .menu-item {
    padding: 22rpx 16rpx;
  }

  .content-area {
    padding: 12px 20rpx 20rpx;
  }

  .attachment-card {
    padding: 28rpx;
  }
}

.sidebar,
.main-layout,
.attachment-card,
.stat-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ==================== 顶部标题栏 ==================== */
.top-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 64px;
  background: var(--surface-container-lowest);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-sizing: border-box;
  box-shadow: var(--shadow);
}

.header-left {
  display: flex;
  align-items: center;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-brand-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: var(--shadow-primary);
}

.header-brand-icon .material-symbols-outlined {
  font-size: 20px;
}

.header-brand-text {
  display: flex;
  flex-direction: column;
}

.header-brand-title {
  font-size: 18px;
  font-weight: 800;
  font-family: var(--font-display);
  color: var(--primary);
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.header-brand-subtitle {
  font-size: 12px;
  font-weight: 600;
  font-family: var(--font-body);
  color: var(--on-surface-variant);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-top: 2px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 16px 4px 4px;
  border-radius: var(--radius-full);
  background: var(--surface-container-low);
}

.profile-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.profile-info {
  display: flex;
  flex-direction: column;
}

.profile-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--on-surface);
  line-height: 1.2;
}

.profile-role {
  font-size: 12px;
  color: var(--on-surface-variant);
  line-height: 1.2;
}

/* ==================== 页面入场动画 ==================== */
.page-enter {
  animation: pageEnter 0.4s ease-out both;
}

@keyframes pageEnter {
  from {
    opacity: 0;
    transform: translateY(10rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ==================== 列表重新排序动画 ==================== */
.attachment-list-move {
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.attachment-list-enter-active,
.attachment-list-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.attachment-list-enter {
  opacity: 0;
  transform: translateY(15rpx) scale(0.97);
}

.attachment-list-leave-to {
  opacity: 0;
  transform: translateX(-15rpx);
}

/* 优化滚动性能 */
.attachment-list-page {
  min-height: 100vh;
  background: var(--surface);
  font-family: var(--font-body);
  -webkit-overflow-scrolling: touch;
  overflow-x: hidden;
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}

/* 页面淡出动画 */
.attachment-list-page.page-fade-out {
  opacity: 0;
  transform: scale(0.98);
}

/* 主布局包裹层 */
.main-layout-wrapper {
  display: flex;
  justify-content: flex-start;
  width: 100%;
}

/* 主布局 */
.main-layout {
  display: flex;
  min-height: 100vh;
  height: auto;
  background: var(--surface);
  width: 100%;
  max-width: none;
  justify-content: flex-start;
  gap: 24rpx;
  padding: 64px 24rpx 0 280px;
  box-sizing: border-box;
  overflow: visible;
}

/* 左侧边栏 - 与工作台保持一致 256px */
.sidebar {
  position: fixed;
  left: 0;
  top: 64px;
  height: calc(100vh - 64px);
  width: 256px;
  background: var(--surface-bright);
  box-shadow: var(--shadow);
  padding: 24rpx;
  overflow-x: hidden;
  overflow-y: auto;
  box-sizing: border-box;
  z-index: 98;
  display: flex;
  flex-direction: column;
}

.sidebar-title {
  font-size: 34rpx;
  font-weight: 700;
  color: var(--on-surface);
  padding-bottom: 20rpx;
  border-bottom: 1px solid var(--surface-container-high);
  margin-bottom: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-content {
  padding: 0;
  min-width: 0;
}

.stats-panel {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  width: 100%;
  min-width: 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 28rpx 20rpx;
  background: var(--surface-container-low);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.stat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 6rpx;
  height: 100%;
  background: var(--primary);
  border-radius: 6rpx 0 0 6rpx;
}

.stat-item:hover {
  transform: translateY(-2rpx);
  box-shadow: var(--shadow);
  background: var(--surface-bright);
  border-color: var(--primary);
}

/* ==================== 可点击状态项动画优化 ==================== */
.stat-item.clickable {
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

/* 波纹效果 */
.stat-item.clickable::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: var(--primary-fixed);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1), height 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.stat-item.clickable:active::after {
  width: 300rpx;
  height: 300rpx;
}

.stat-item.clickable:active {
  transform: translateY(-1rpx) scale(0.98);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}

/* ==================== 统计图标动画优化 ==================== */
.stat-icon {
  font-size: 44rpx;
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-fixed);
  border-radius: var(--radius-sm);
  color: var(--primary);
  flex-shrink: 0;
  transition: 
    transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
    background-color 0.3s ease,
    color 0.3s ease;
  font-family: 'Material Symbols Outlined', sans-serif;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.stat-item:hover .stat-icon {
  transform: scale(1.15) rotate(5deg);
  background-color: var(--primary);
  color: #fff;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5rpx;
  min-width: 0;
}

.attachment-stat-item .stat-label {
  display: block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}

.attachment-stat-item .stat-value {
  font-size: 22rpx;
  font-weight: 500;
  color: var(--on-surface-variant);
  text-align: left;
}

.stat-label {
  font-size: 26rpx;
  color: var(--on-surface-variant);
  font-weight: 500;
  text-align: center;
}

.stat-value {
  font-size: 48rpx;
  font-weight: 800;
  color: var(--primary);
  line-height: 1.2;
}

.stat-item:hover .stat-value {
  color: var(--primary);
}

/* ==================== 侧边栏菜单动画优化 ==================== */
.sidebar-menu {
  margin-top: 30rpx;
  padding-top: 20rpx;
  border-top: 1px solid var(--surface-container-high);
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  position: relative;
  z-index: 10;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 25rpx;
  background-color: var(--surface-container-low);
  border-radius: var(--radius-md);
  border: 1px solid var(--surface-container-high);
  transition: 
    transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    background-color 0.3s ease,
    border-color 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  pointer-events: auto;
}

.menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 6rpx;
  height: 100%;
  background: var(--primary);
  border-radius: 6rpx 0 0 6rpx;
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.menu-item:hover {
  transform: translateY(-4rpx) scale(1.02);
  box-shadow: var(--shadow);
  background-color: var(--surface-bright);
  border-color: var(--primary);
}

.menu-item:hover::before {
  width: 8rpx;
}

.menu-item:active {
  transform: translateY(-1rpx) scale(0.98);
  transition: all 0.1s cubic-bezier(0.16, 1, 0.3, 1);
}

.menu-icon {
  font-size: 40rpx;
  width: 70rpx;
  height: 70rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-fixed);
  border-radius: var(--radius-sm);
  transition: all 0.3s;
  font-family: 'Material Symbols Outlined', sans-serif;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.menu-item:hover .menu-icon {
  background-color: var(--primary);
  transform: scale(1.1);
}

.menu-text {
  flex: 1;
  font-size: 30rpx;
  font-weight: 500;
  color: var(--on-surface);
  transition: color 0.3s;
}

.menu-item:hover .menu-text {
  color: var(--primary);
}

/* 右侧内容区 - 扩展至全屏，支持滚动 */
.content-area {
  flex: 1;
  max-width: none;
  padding: 16px 30rpx 30rpx;
  background: var(--surface);
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  min-height: 0;
}

.content-wrapper {
  max-width: none;
  margin: 0;
  width: 100%;
}

/* ==================== 加载动画 ==================== */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  background: var(--surface-bright);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow);
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  margin: 0 25rpx;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  position: relative;
  margin-bottom: 30rpx;
}

.loading-spinner::before,
.loading-spinner::after {
  content: '';
  position: absolute;
  border-radius: 50%;
}

.loading-spinner::before {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  animation: pulse-ring 1.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

.loading-spinner::after {
  width: 70%;
  height: 70%;
  top: 15%;
  left: 15%;
  background: #fff;
  animation: pulse-dot 1.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(0.8); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(0.8); opacity: 1; }
}

@keyframes pulse-dot {
  0% { transform: scale(0.6); }
  50% { transform: scale(1); }
  100% { transform: scale(0.6); }
}

.loading-text {
  font-size: 28rpx;
  color: var(--on-surface-variant);
  animation: textPulse 1.5s ease-in-out infinite;
}

@keyframes textPulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* 附件列表 */
.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 25rpx;
  position: relative;
}

/* ==================== 排序过渡动画 ==================== */
.attachment-list-move {
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.attachment-list-enter-active {
  transition: all 0.4s ease-out;
}

.attachment-list-leave-active {
  transition: all 0.3s ease-in;
  position: absolute;
}

.attachment-list-enter {
  opacity: 0;
  transform: translateY(30rpx);
}

.attachment-list-leave-to {
  opacity: 0;
  transform: translateY(-30rpx);
}

/* ==================== 附件卡片样式 ==================== */
.attachment-card {
  cursor: pointer;
  background: var(--surface-bright);
  border-radius: var(--radius-lg);
  padding: 35rpx;
  box-shadow: var(--shadow);
  border: 1rpx solid var(--surface-container-high);
  transition: 
    transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.3s ease;
  position: relative;
  will-change: transform, box-shadow;
  margin: 0 25rpx;
}

.attachment-card.highlighted {
  border-color: var(--primary);
  box-shadow: 0 0 0 4rpx rgba(0, 91, 191, 0.14), var(--shadow-lg);
  animation: attachmentHighlightPulse 2s ease;
}

@keyframes attachmentHighlightPulse {
  0% {
    border-color: rgba(0, 91, 191, 0.4);
    box-shadow: 0 0 0 0 rgba(0, 91, 191, 0.22), var(--shadow);
  }
  30% {
    border-color: var(--primary);
    box-shadow: 0 0 0 6rpx rgba(0, 91, 191, 0.18), var(--shadow-lg);
  }
  100% {
    border-color: var(--primary);
    box-shadow: 0 0 0 4rpx rgba(0, 91, 191, 0.14), var(--shadow-lg);
  }
}

.attachment-card:hover {
  transform: translateY(-6rpx) scale(1.01);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-fixed);
}

.attachment-card.highlighted:hover {
  border-color: var(--primary);
  box-shadow: 0 0 0 4rpx rgba(0, 91, 191, 0.14), var(--shadow-lg);
}

.attachment-card:active {
  transform: translateY(-2rpx) scale(0.99);
  transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}

/* 附件头部 */
.attachment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 25rpx;
  padding-bottom: 25rpx;
  border-bottom: 1px solid var(--surface-container-high);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 25rpx;
  flex: 1;
  min-width: 0;
}

/* 文件图标样式 */
.file-icon {
  width: 90rpx;
  height: 90rpx;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: 
    transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  background-color: var(--primary-fixed);
  color: var(--primary);
}

.attachment-card:hover .file-icon {
  transform: scale(1.15) rotate(5deg);
  background-color: var(--primary);
  color: #fff;
}

.icon-text {
  font-size: 48rpx;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-family: 'Material Symbols Outlined', sans-serif;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.attachment-card:hover .icon-text {
  transform: scale(1.15);
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 34rpx;
  font-weight: 700;
  color: var(--on-surface);
  display: block;
  margin-bottom: 12rpx;
  line-height: 1.4;
  word-break: break-all;
}

.file-meta {
  font-size: 26rpx;
  color: var(--on-surface-variant);
  display: block;
}

/* 类型徽章 - 统一蓝色 */
.type-badge {
  padding: 10rpx 24rpx;
  border-radius: var(--radius-full);
  font-size: 24rpx;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
  background-color: var(--primary-fixed);
  color: var(--primary);
  border: 1px solid var(--primary-fixed);
}

/* 附件内容 */
.attachment-content {
  margin-bottom: 25rpx;
}

.description-section {
  background-color: var(--surface-container-low);
  border-radius: var(--radius-md);
  padding: 20rpx;
  border-left: 4rpx solid var(--primary);
}

.description-label {
  font-size: 26rpx;
  color: var(--on-surface-variant);
  font-weight: 500;
  margin-bottom: 8rpx;
  display: block;
}

.description-text {
  font-size: 26rpx;
  color: var(--on-surface);
  line-height: 1.6;
}

/* 操作按钮 - 统一蓝色 */
.attachment-actions {
  display: flex;
  gap: 16rpx;
  padding-top: 22rpx;
  border-top: 1px solid var(--surface-container-high);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 14rpx 20rpx;
  border-radius: var(--radius-sm);
  font-size: 24rpx;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  flex: 1;
  background-color: var(--primary-fixed);
  color: var(--primary);
  border: 1px solid var(--primary-fixed);
  min-width: 0;
}

/* 删除按钮 - 浅红色背景 */
.action-btn.delete-btn {
  background-color: #ffebee;
  color: #e53e3e;
  border: 1px solid #ffcdd2;
}

.action-btn.delete-btn:hover {
  background-color: #ef5350;
  color: #fff;
  border-color: #ef5350;
}

.action-btn .btn-icon {
  font-size: 26rpx;
  font-family: 'Material Symbols Outlined', sans-serif;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
}

.action-btn:hover {
  background-color: var(--primary);
  color: #fff;
  transform: translateY(-2rpx);
  box-shadow: var(--shadow-primary);
}

/* ==================== 空状态动画优化 ==================== */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  background: var(--surface-bright);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow);
  animation: emptyEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  margin: 0 25rpx;
}

@keyframes emptyEnter {
  0% {
    opacity: 0;
    transform: translateY(30rpx) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 30rpx;
  animation: iconFloat 3s ease-in-out infinite;
  font-family: 'Material Symbols Outlined', sans-serif;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48;
}

@keyframes iconFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10rpx); }
}

.empty-text {
  font-size: 32rpx;
  font-weight: bold;
  color: var(--on-surface);
  margin-bottom: 15rpx;
}

.empty-subtext {
  font-size: 26rpx;
  color: var(--on-surface-variant);
}

/* Profile Button Wrapper */
.profile-btn-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  cursor: pointer;
  padding: var(--spacing-1) var(--spacing-3) var(--spacing-1) var(--spacing-1);
  border-radius: var(--radius-full);
  transition: background 0.2s;
}

.profile-btn-wrapper:hover {
  background: var(--surface-container-low);
}

/* User Info Card */
.user-info-card {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 380px;
  background: var(--surface-container-lowest);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-ambient);
  z-index: 100;
  overflow: hidden;
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
  transform-origin: top right;
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  visibility: hidden;
}

.user-info-card.show {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
  visibility: visible;
}

.user-card-header {
  padding: var(--spacing-6);
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  display: flex;
  align-items: center;
  gap: var(--spacing-5);
}

.user-card-avatar {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 22px;
  font-weight: 600;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.user-card-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.user-card-info .user-name {
  font-size: 17px;
  font-weight: 600;
  color: white;
}

.user-card-info .user-id {
  font-size: 13px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
}

.user-role-badge {
  display: inline-flex;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;
  color: white;
  width: fit-content;
}

.user-card-menu {
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.user-card-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.2s;
  font-size: 15px;
  font-weight: 500;
  color: var(--on-surface);
}

.user-card-menu-item:hover {
  background: var(--surface-container-low);
}

.user-card-menu-item.logout {
  color: var(--error);
}

.user-card-menu-item.logout:hover {
  background: var(--error-container);
}

.user-card-menu-item .material-symbols-outlined {
  font-size: 20px;
  color: var(--on-surface-variant);
}

.user-card-menu-item.logout .material-symbols-outlined {
  color: var(--error);
}

/* ===== 弹窗样式 ===== */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: modalBackdropIn 0.3s ease;
}

@keyframes modalBackdropIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: var(--surface-container-lowest);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: var(--shadow-ambient);
  animation: modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

/* 修改密码弹窗特定样式 - 固定宽度 400px */
.password-modal-content,
.about-modal {
  width: 90%;
  max-width: 400px !important;
  max-height: 80vh;
}

.password-modal-content .modal-header,
.about-modal .modal-header {
  padding: var(--spacing-4) var(--spacing-5);
  background: var(--surface-container-low);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  min-height: auto;
}

.password-modal-content .modal-body {
  padding: var(--spacing-5);
}

.password-modal-content .modal-footer,
.about-modal .modal-footer {
  padding: var(--spacing-4) var(--spacing-5);
  gap: var(--spacing-3);
  background: var(--surface-container-low);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4) var(--spacing-5);
  background: var(--surface-container-low);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  font-family: var(--font-body);
  color: var(--on-surface);
}

.modal-close {
  font-size: 1.5rem;
  color: var(--on-surface-variant);
  cursor: pointer;
  padding: var(--spacing-1);
  transition: color 0.2s;
}

.modal-close:hover {
  color: var(--on-surface);
}

.modal-body {
  padding: var(--spacing-5);
  flex: 1;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  padding: var(--spacing-4) var(--spacing-5);
  gap: var(--spacing-3);
  background: var(--surface-container-low);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}

/* 表单样式 */
.form-item {
  margin-bottom: var(--spacing-4);
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: var(--font-body);
  color: var(--on-surface);
  margin-bottom: var(--spacing-2);
}

.form-input {
  width: 100%;
  height: 44px;
  padding: 0 var(--spacing-4);
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-family: var(--font-body);
  color: var(--on-surface);
  background: var(--surface-container-low);
  box-sizing: border-box;
  transition: all 0.2s;
}

.form-input:focus {
  background: var(--surface-container-high);
  outline: none;
}

.form-tips {
  margin-top: var(--spacing-3);
  padding: var(--spacing-3);
  background: var(--amber-tint);
  border-radius: var(--radius-md);
}

.form-tips.error-tips {
  background: var(--error-container);
}

.tips-text {
  font-size: 0.75rem;
  font-weight: 400;
  font-family: var(--font-body);
  color: var(--on-amber);
}

.tips-text.error-text {
  color: var(--on-error-container);
}

/* 按钮样式 */
.btn {
  flex: 1;
  height: 44px;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-cancel {
  background: var(--surface-container-high);
  color: var(--on-surface-variant);
}

.btn-cancel:hover {
  background: var(--surface-container-low);
}

.btn-confirm {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  color: white;
  box-shadow: var(--shadow-primary);
}

.btn-confirm:hover {
  box-shadow: 0 6px 20px rgba(0, 91, 191, 0.35);
  transform: translateY(-1px);
}

/* 关于系统弹窗 */
.about-modal-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-8);
  text-align: center;
}

.about-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-4);
}

.about-icon .material-symbols-outlined {
  font-size: 32px;
  color: white;
}

.about-title {
  font-size: 1.125rem;
  font-weight: 600;
  font-family: var(--font-body);
  color: var(--on-surface);
  margin-bottom: var(--spacing-2);
}

.about-version {
  font-size: 0.875rem;
  font-weight: 400;
  font-family: var(--font-body);
  color: var(--on-surface-variant);
  margin-bottom: var(--spacing-4);
}

.about-desc {
  font-size: 0.875rem;
  font-weight: 400;
  font-family: var(--font-body);
  color: var(--on-surface-variant);
  line-height: 1.6;
}

/* ===== 工作台同款用户菜单样式（放在文件尾部以覆盖页面通用规则） ===== */
.student-profile-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  cursor: pointer;
  padding: var(--spacing-1) var(--spacing-3) var(--spacing-1) var(--spacing-1);
  border-radius: var(--radius-full);
  transition: background 0.2s;
}

.student-profile-btn:hover {
  background: var(--surface-container-low);
}

.student-profile-btn .profile-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
  font-family: var(--font-display);
}

.student-profile-btn .profile-name {
  font-size: 16px;
  font-weight: 600;
  font-family: var(--font-body);
  color: var(--on-surface);
}

.student-profile-btn .profile-role {
  font-size: 12px;
  font-weight: 400;
  font-family: var(--font-body);
  color: var(--on-surface-variant);
}

.student-user-card {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 380px;
  background: var(--surface-container-lowest);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-ambient);
  z-index: 100;
  overflow: hidden;
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
  transform-origin: top right;
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  visibility: hidden;
}

.student-user-card.show {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
  visibility: visible;
}

.student-user-card .user-card-header {
  padding: var(--spacing-6);
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  display: flex;
  align-items: center;
  gap: var(--spacing-5);
}

.student-user-card .user-card-avatar {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 22px;
  font-weight: 600;
  font-family: var(--font-display);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.student-user-card .user-card-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.student-user-card .user-card-info .user-name {
  font-size: 17px;
  font-weight: 600;
  font-family: var(--font-body);
  color: white;
}

.student-user-card .user-card-info .user-id {
  font-size: 13px;
  font-weight: 400;
  font-family: var(--font-body);
  color: rgba(255, 255, 255, 0.8);
}

.student-user-card .user-role-badge {
  display: inline-flex;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;
  font-family: var(--font-body);
  color: white;
  width: fit-content;
}

.student-user-card .user-card-menu {
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.student-user-card .user-card-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.2s;
  font-size: 15px;
  font-weight: 500;
  font-family: var(--font-body);
  color: var(--on-surface);
}

.student-user-card .user-card-menu-item:hover {
  background: var(--surface-container-low);
}

.student-user-card .user-card-menu-item.logout {
  color: var(--error);
}

.student-user-card .user-card-menu-item.logout:hover {
  background: var(--error-container);
}

.student-user-card .user-card-menu-item .material-symbols-outlined {
  font-size: 20px;
  color: var(--on-surface-variant);
}

.student-user-card .user-card-menu-item.logout .material-symbols-outlined {
  color: var(--error);
}

.student-user-panel-modal {
  background: var(--surface-container-lowest);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: var(--shadow-ambient);
  animation: modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.student-user-panel-modal .user-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4) var(--spacing-5);
  background: var(--surface-container-low);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  min-height: auto;
}

.student-user-panel-modal .user-panel-header.logout-header {
  background: linear-gradient(135deg, #fc8181 0%, #f56565 100%);
}

.student-user-panel-modal .user-panel-header.logout-header .user-panel-title,
.student-user-panel-modal .user-panel-header.logout-header .user-panel-close {
  color: white;
}

.student-user-panel-modal .user-panel-title {
  font-size: 1.125rem;
  font-weight: 600;
  font-family: var(--font-body);
  color: var(--on-surface);
}

.student-user-panel-modal .user-panel-close {
  font-size: 1.5rem;
  color: var(--on-surface-variant);
  cursor: pointer;
  padding: var(--spacing-1);
  transition: color 0.2s;
}

.student-user-panel-modal .user-panel-close:hover {
  color: var(--on-surface);
}

.student-user-panel-modal .user-panel-body {
  padding: var(--spacing-5);
  flex: 1;
  overflow-y: auto;
}

.student-user-panel-modal .user-panel-footer {
  display: flex;
  padding: var(--spacing-4) var(--spacing-5);
  gap: var(--spacing-3);
  background: var(--surface-container-low);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}

.student-user-panel-modal .user-panel-form-item {
  margin-bottom: var(--spacing-4);
}

.student-user-panel-modal .user-panel-form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: var(--font-body);
  color: var(--on-surface);
  margin-bottom: var(--spacing-2);
}

.student-user-panel-modal .user-panel-form-input {
  width: 100%;
  height: 44px;
  padding: 0 var(--spacing-4);
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-family: var(--font-body);
  color: var(--on-surface);
  background: var(--surface-container-low);
  box-sizing: border-box;
  transition: all 0.2s;
}

.student-user-panel-modal .user-panel-form-input:focus {
  background: var(--surface-container-high);
  outline: none;
}

.student-user-panel-modal .user-panel-form-tips {
  margin-top: var(--spacing-3);
  padding: var(--spacing-3);
  background: var(--amber-tint);
  border-radius: var(--radius-md);
}

.student-user-panel-modal .user-panel-form-tips.error-tips {
  background: var(--error-container);
}

.student-user-panel-modal .user-panel-tips-text {
  font-size: 0.75rem;
  font-weight: 400;
  font-family: var(--font-body);
  color: var(--on-amber);
}

.student-user-panel-modal .user-panel-tips-text.error-text {
  color: var(--on-error-container);
}

.student-user-panel-modal .user-panel-btn {
  flex: 1;
  height: 44px;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.student-user-panel-modal .user-panel-btn-cancel {
  background: var(--surface-container-high);
  color: var(--on-surface-variant);
}

.student-user-panel-modal .user-panel-btn-cancel:hover {
  background: var(--surface-container-low);
}

.student-user-panel-modal .user-panel-btn-confirm {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  color: white;
  box-shadow: var(--shadow-primary);
}

.student-user-panel-modal .user-panel-btn-confirm:hover {
  box-shadow: 0 6px 20px rgba(0, 91, 191, 0.35);
  transform: translateY(-1px);
}

.student-user-panel-modal .user-panel-btn-logout {
  background: linear-gradient(135deg, #fc8181 0%, #f56565 100%);
  color: white;
}

.student-user-panel-modal .user-panel-btn-logout:hover {
  box-shadow: 0 4px 12px rgba(245, 101, 101, 0.3);
}

.student-user-panel-modal .user-panel-about-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-8);
  text-align: center;
}

.student-user-panel-modal .user-panel-about-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-4);
}

.student-user-panel-modal .user-panel-about-icon .material-symbols-outlined {
  font-size: 32px;
  color: white;
}

.student-user-panel-modal .user-panel-about-title {
  font-size: 1.125rem;
  font-weight: 600;
  font-family: var(--font-body);
  color: var(--on-surface);
  margin-bottom: var(--spacing-2);
}

.student-user-panel-modal .user-panel-about-version {
  font-size: 0.875rem;
  font-weight: 400;
  font-family: var(--font-body);
  color: var(--on-surface-variant);
  margin-bottom: var(--spacing-4);
}

.student-user-panel-modal .user-panel-about-desc {
  font-size: 0.875rem;
  font-weight: 400;
  font-family: var(--font-body);
  color: var(--on-surface-variant);
  line-height: 1.6;
}

.attachment-confirm-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1200;
}

.workbench-confirm-modal {
  backdrop-filter: blur(4px);
  animation: workbenchModalFadeIn 0.28s ease;
}

.workbench-confirm-content {
  width: 90%;
  max-width: 430px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border-radius: 16px;
  border: 1px solid rgba(0, 91, 191, 0.12);
  overflow: hidden;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18);
  display: flex;
  flex-direction: column;
  animation: workbenchModalPanelFadeIn 0.32s ease both;
}

@keyframes workbenchModalFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes workbenchModalPanelFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.workbench-confirm-header {
  height: auto;
  min-height: 76px;
  padding: 18px 22px 16px;
  background: transparent;
  box-shadow: none;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.workbench-confirm-title-group {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding-right: 12px;
}

.workbench-confirm-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(0, 91, 191, 0.12);
  color: #005bbf;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.workbench-confirm-icon text {
  font-size: 22px;
}

.workbench-confirm-icon.danger {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
}

.workbench-confirm-title {
  flex: 1;
  font-size: 17px;
  line-height: 1.3;
}

.workbench-confirm-body {
  padding: 22px 24px 14px;
}

.workbench-confirm-message {
  display: block;
  font-size: 15px;
  line-height: 1.9;
  color: #1f2937;
  text-align: center;
}

.workbench-confirm-footer {
  display: flex;
  gap: 12px;
  padding: 0 24px 24px;
}

.workbench-confirm-btn {
  flex: 1;
  height: 46px;
  border: none;
  padding: 0;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.workbench-confirm-btn::after {
  border: none;
}

.workbench-confirm-btn.secondary {
  background: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.workbench-confirm-btn.secondary:hover {
  background: #e8edf3;
  color: #374151;
}

.workbench-confirm-btn.primary {
  background: linear-gradient(135deg, #0a7cff 0%, #005bbf 100%);
  color: #ffffff;
  box-shadow: 0 10px 24px rgba(0, 91, 191, 0.2);
}

.workbench-confirm-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(0, 91, 191, 0.24);
}

.workbench-confirm-btn.primary.danger {
  background: linear-gradient(135deg, #f97373 0%, #ef4444 100%);
  box-shadow: 0 10px 24px rgba(239, 68, 68, 0.22);
}

.workbench-confirm-btn.primary.danger:hover {
  box-shadow: 0 14px 28px rgba(239, 68, 68, 0.26);
}

.paper-card-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 24px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.paper-card-modal-title {
  font-size: 16px;
  font-weight: 800;
  color: #005bbf;
}

.paper-card-modal-close {
  font-size: 20px;
  color: #5f6368;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.paper-card-modal-body {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

</style>
