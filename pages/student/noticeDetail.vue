<template>
  <view class="notice-detail-page">
    <!-- 顶部标题栏 -->
    <header class="top-header">
      <view class="header-left">
        <view class="header-brand">
          <view class="header-brand-icon">
            <text class="material-symbols-outlined">notifications</text>
          </view>
          <view class="header-brand-text">
            <text class="header-brand-title">公告详情</text>
            <text class="header-brand-subtitle">论文管理系统</text>
          </view>
        </view>
      </view>
      <view class="header-right">
        <view class="profile-btn-wrapper"
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
          <view class="user-info-card" :class="{ show: showUserCard }" @click.stop
            @mouseenter="onUserCardEnter"
            @mouseleave="onUserCardLeave">
            <view class="user-card-header">
              <view class="user-card-avatar">
                <text>{{ userNameInitial }}</text>
              </view>
              <view class="user-card-info">
                <text class="user-name">{{ userInfo.name }}</text>
                <text class="user-id">学号：{{ userInfo.owner_id || userInfo.username || '未设置' }}</text>
                <view class="user-role-badge">学生</view>
              </view>
            </view>
            <view class="user-card-menu">
              <view class="user-card-menu-item" @click="openChangePassword">
                <text class="material-symbols-outlined">lock</text>
                <text>修改密码</text>
              </view>
              <view class="user-card-menu-item" @click="showAboutModal = true">
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

    <!-- 主内容区 -->
    <view class="main-layout">
      <!-- 左侧边栏 -->
      <aside class="sidebar">
        <view class="sidebar-nav">
          <view class="nav-item" @click="goToWorkbench">
            <text class="material-symbols-outlined">dashboard</text>
            <text class="nav-label">工作台</text>
          </view>
          <view class="nav-item" @click="goToPaperList">
            <text class="material-symbols-outlined">description</text>
            <text class="nav-label">论文列表</text>
          </view>
          <view class="nav-item" @click="goToAttachmentList">
            <text class="material-symbols-outlined">folder_open</text>
            <text class="nav-label">附件列表</text>
          </view>
        </view>

        <view class="sidebar-divider"></view>

        <!-- 公告统计 -->
        <view class="sidebar-stats">
          <view class="stats-title">公告统计</view>
          <view class="stat-item">
            <text class="stat-icon material-symbols-outlined">list_alt</text>
            <view class="stat-content">
              <text class="stat-label">全部公告</text>
              <text class="stat-value">{{ notices.length }}</text>
            </view>
          </view>
          <view class="stat-item">
            <text class="stat-icon material-symbols-outlined">warning</text>
            <view class="stat-content">
              <text class="stat-label">紧急公告</text>
              <text class="stat-value">{{ urgentCount }}</text>
            </view>
          </view>
          <view class="stat-item">
            <text class="stat-icon material-symbols-outlined">alarm</text>
            <view class="stat-content">
              <text class="stat-label">截止提醒</text>
              <text class="stat-value">{{ deadlineCount }}</text>
            </view>
          </view>
        </view>
      </aside>

      <!-- 右侧内容区 -->
      <main class="main-content">
        <!-- 公告列表 -->
        <view class="content-canvas">
          <view class="page-header">
            <text class="page-title">系统公告</text>
            <text class="page-subtitle">共 {{ notices.length }} 条公告</text>
          </view>

          <view class="notice-list" v-if="notices.length > 0">
            <view 
              v-for="(item, index) in notices" 
              :key="item.id"
              class="notice-card" 
              :class="{ 
                'urgent': item.urgent, 
                'status': item.type === 'status', 
                'deadline': item.type === 'deadline' 
              }"
              @click="viewNoticeDetail(item)"
            >
              <view class="notice-card-header">
                <view class="notice-type-badge" :class="item.type">
                  <text class="material-symbols-outlined">{{ getNoticeIcon(item.type) }}</text>
                  <text>{{ getNoticeTypeText(item.type) }}</text>
                </view>
                <text class="notice-time">{{ item.time }}</text>
              </view>
              <view class="notice-card-body">
                <text v-if="item.title" class="notice-card-title">{{ item.title }}</text>
                <text class="notice-card-content">{{ item.content }}</text>
              </view>
              <view class="notice-card-footer">
                <text class="notice-sender">发送者：{{ item.sender || '系统' }}</text>
                <view class="notice-arrow">
                  <text class="material-symbols-outlined">chevron_right</text>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 空状态 -->
          <view v-else class="empty-state">
            <text class="empty-icon material-symbols-outlined">inbox</text>
            <text class="empty-text">暂无公告</text>
            <text class="empty-subtext">当前没有新的系统公告</text>
          </view>
        </view>
      </main>
    </view>
    
    <!-- 通知详情弹窗 -->
    <view v-if="showDetailModal" class="modal-backdrop" @click="closeDetailModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">通知详情</text>
          <text class="modal-close" @click="closeDetailModal">×</text>
        </view>
        <view class="modal-body">
          <view class="detail-header">
            <view class="detail-type-badge" :class="currentNotice.type">
              <text class="material-symbols-outlined">{{ getNoticeIcon(currentNotice.type) }}</text>
              <text>{{ getNoticeTypeText(currentNotice.type) }}</text>
            </view>
            <text class="detail-time">{{ currentNotice.time }}</text>
          </view>
          <text class="detail-title">{{ currentNotice.title || '系统公告' }}</text>
          <view class="detail-content">
            <text>{{ currentNotice.content }}</text>
          </view>
          <text class="detail-sender">发送者：{{ currentNotice.sender || '系统' }}</text>
        </view>
        <view class="modal-footer">
          <button class="action-btn primary" @click="closeDetailModal">知道了</button>
        </view>
      </view>
    </view>
    
    <!-- 修改密码弹窗 -->
    <view v-if="showPasswordModal" class="modal-backdrop" @click.self="closePasswordModal">
      <view class="modal-content password-modal-content">
        <view class="modal-header">
          <text class="modal-title">修改密码</text>
          <text class="modal-close" @click="closePasswordModal">×</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">当前密码</text>
            <input 
              class="form-input" 
              type="password" 
              v-model="passwordForm.currentPassword"
              placeholder="请输入当前密码"
            />
          </view>
          <view class="form-item">
            <text class="form-label">新密码</text>
            <input 
              class="form-input" 
              type="password" 
              v-model="passwordForm.newPassword"
              placeholder="请输入新密码（至少6位）"
            />
          </view>
          <view class="form-item">
            <text class="form-label">确认新密码</text>
            <input 
              class="form-input" 
              type="password" 
              v-model="passwordForm.confirmPassword"
              placeholder="请再次输入新密码"
            />
          </view>
          <view class="form-tips" v-if="!passwordError">
            <text class="tips-text">密码修改成功后需要重新登录</text>
          </view>
          <view class="form-tips error-tips" v-else>
            <text class="tips-text error-text">{{ passwordError }}</text>
          </view>
        </view>
        <view class="modal-footer">
          <view class="btn btn-cancel" @click="closePasswordModal">取消</view>
          <view class="btn btn-confirm" @click="submitChangePassword">确认修改</view>
        </view>
      </view>
    </view>
    
    <!-- 关于系统弹窗 -->
    <view v-if="showAboutModal" class="modal-backdrop" @click.self="showAboutModal = false">
      <view class="modal-content about-modal">
        <view class="modal-header">
          <text class="modal-title">关于系统</text>
          <text class="modal-close" @click="showAboutModal = false">×</text>
        </view>
        <view class="modal-body about-modal-body">
          <view class="about-icon">
            <text class="material-symbols-outlined">school</text>
          </view>
          <view class="about-title">计测学院毕业论文管理系统</view>
          <view class="about-version">v1.0</view>
          <view class="about-desc">为学院师生提供论文管理、审阅和反馈功能。</view>
        </view>
        <view class="modal-footer">
          <view class="btn btn-confirm" @click="showAboutModal = false">确定</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>

import { getReceivedNotifications, getReceivedDDL, markNotificationRead, changePassword } from '../../api/student.js';
import { clearLoginState } from '../../utils/auth.js';

export default {
  data() {
    return {
      /**
       * 用户信息
       */
      userInfo: {
        name: '',
        full_name: '',
        username: ''
      },
      /**
       * 系统公告列表
       * @type {Array<Object>}
       */
      notices: [],
      /**
       * 详情弹窗
       */
      showDetailModal: false,
      currentNotice: {},
      // 用户卡片
      showUserCard: false,
      // 修改密码弹窗
      showPasswordModal: false,
      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordError: '',
      // 关于系统弹窗
      showAboutModal: false
    };
  },
  computed: {
    /**
     * 用户姓名首字母
     */
    userNameInitial() {
      const displayName = this.userInfo.full_name || this.userInfo.name || '用';
      return displayName.charAt(0);
    },
    /**
     * 紧急公告数量
     */
    urgentCount() {
      return this.notices.filter(n => n.urgent).length;
    },
    /**
     * 截止提醒数量
     */
    deadlineCount() {
      return this.notices.filter(n => n.type === 'deadline').length;
    }
  },
  onLoad() {
    // 加载用户信息
    this.loadUserInfo();
    // 加载公告数据
    this.loadNotices();
    // 检查是否有从工作台传递过来的通知
    const currentNotice = uni.getStorageSync('currentNoticeDetail');
    if (currentNotice) {
      this.viewNoticeDetail(currentNotice);
      uni.removeStorageSync('currentNoticeDetail');
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

    /**
     * 加载用户信息
     */
    loadUserInfo() {
      try {
        let userInfo = uni.getStorageSync('userInfo');
        console.log('公告详情页 - 从存储获取的用户信息:', userInfo);
        
        // 如果获取的是字符串，需要解析
        if (typeof userInfo === 'string') {
          userInfo = JSON.parse(userInfo);
        }
        
        if (userInfo) {
          console.log('公告详情页 - 解析后的用户信息:', userInfo);
          this.userInfo = {
            name: userInfo.name || userInfo.username || '学生',
            full_name: userInfo.full_name || userInfo.name || '学生',
            username: userInfo.username || ''
          };
          console.log('公告详情页 - 设置后的userInfo:', this.userInfo);
        }
      } catch (e) {
        console.error('加载用户信息失败:', e);
        this.userInfo = { name: '学生', full_name: '学生', username: '' };
      }
    },

    /**
     * 获取通知图标
     */
    getNoticeIcon(type) {
      const iconMap = {
        'system': 'notifications',
        'status': 'info',
        'deadline': 'schedule',
        'urgent': 'warning'
      };
      return iconMap[type] || 'notifications';
    },

    /**
     * 页面导航
     */
    goToWorkbench() {
      uni.navigateTo({ url: '/pages/student/workbench' });
    },
    goToPaperList() {
      uni.navigateTo({ url: '/pages/student/paperList' });
    },
    goToAttachmentList() {
      uni.navigateTo({ url: '/pages/student/attachmentList' });
    },

    // 查看通知详情
    viewNoticeDetail(notice) {
      this.currentNotice = notice;
      this.showDetailModal = true;
    },
    
    async closeDetailModal() {
      // 如果是系统通知且有messageId，标记为已读
      if (this.currentNotice.type === 'system' && this.currentNotice.messageId) {
        try {
          await markNotificationRead(this.currentNotice.messageId);
          console.log(`[通知已读] messageId: ${this.currentNotice.messageId}`);
        } catch (err) {
          console.error('标记通知已读失败:', err);
          // 不影响用户体验，静默处理错误
        }
      }
      
      this.showDetailModal = false;
      this.currentNotice = {};
    },
    
    // 获取通知类型文本
    getNoticeTypeText(type) {
      const typeMap = {
        'system': '系统通知',
        'status': '状态通知',
        'deadline': '截止提醒',
        'urgent': '紧急通知'
      };
      return typeMap[type] || '系统通知';
    },
    
    // 加载公告数据（从后端API获取，包含通知和DDL截止时间）
    async loadNotices() {
      try {
        // 同时获取通知和DDL列表
        const [notificationsRes, ddlRes] = await Promise.all([
          getReceivedNotifications({ page: 1, page_size: 50 }),
          getReceivedDDL()
        ]);
        
        let noticeList = [];
        
        // 处理通知数据
        if (notificationsRes && notificationsRes.items && Array.isArray(notificationsRes.items)) {
          noticeList = notificationsRes.items.map((item, index) => ({
            id: `notice_${item.message_id || index + 1}`,
            messageId: item.message_id,
            title: item.title || '系统通知',
            content: item.content || '',
            time: item.operation_time || '',
            sender: item.sender_name || '',
            type: 'system',
            urgent: false
          }));
        }
        
        // 处理DDL数据，转换为公告格式
        if (ddlRes && Array.isArray(ddlRes)) {
          const ddlNotices = ddlRes.map((item, index) => ({
            id: `ddl_${item.message_id || index}`,
            title: item.title || '【截止时间通知】',
            content: item.content || '',
            time: item.received_time || '',
            sender: '系统',
            type: 'deadline',
            urgent: item.status === 'unread',
            rawData: item
          }));
          // 合并DDL到公告列表前面（DDL优先级更高）
          noticeList = [...ddlNotices, ...noticeList];
        }
        
        this.notices = noticeList;
        console.log('[公告详情] 公告列表:', this.notices);
      } catch (err) {
        console.error('获取通知/DDL失败:', err);
        this.notices = [];
      }
    }
  }
};
</script>

<style scoped>
/* ===== CSS 变量（与工作台保持一致） ===== */
.notice-detail-page {
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
  --on-surface-variant: #5f6368;
  --outline: #727785;
  
  /* Semantic Colors */
  --error: #ba1a1a;
  --error-container: #ffdad6;
  --tertiary: #006a5f;
  --tertiary-container: #b2dfdb;
  
  /* Shadows */
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
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  
  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-full: 9999px;
  
  display: flex;
  height: 100vh;
  background: var(--surface);
  font-family: var(--font-body);
  overflow: hidden;
}

/* ===== 顶部标题栏 ===== */
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

/* ===== 主布局 ===== */
.main-layout {
  display: flex;
  flex: 1;
  margin-top: 64px;
  height: calc(100vh - 64px);
}

/* ===== 侧边栏 ===== */
.sidebar {
  position: fixed;
  left: 0;
  top: 64px;
  height: calc(100vh - 64px);
  width: 281px;
  background: var(--surface-bright);
  box-shadow: var(--shadow-ambient);
  z-index: 101;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-6);
  overflow-y: auto;
  box-sizing: border-box;
}

/* 导航菜单 */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  flex-shrink: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  color: var(--on-surface-variant);
}

.nav-item .material-symbols-outlined {
  font-size: 22px;
}

.nav-label {
  font-size: 16px;
  font-weight: 500;
  font-family: var(--font-body);
}

.nav-item:hover {
  background: var(--surface-container-low);
  color: var(--primary);
}

/* 区域分隔 */
.sidebar-divider {
  height: var(--spacing-4);
  flex-shrink: 0;
}

/* 公告统计 */
.sidebar-stats {
  padding: var(--spacing-4);
  background: var(--surface-container-low);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.stats-title {
  font-size: 0.8125rem;
  font-weight: 600;
  font-family: var(--font-body);
  color: var(--on-surface);
  margin-bottom: var(--spacing-3);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-2) 0;
}

.stat-icon {
  font-size: 20px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-fixed);
  border-radius: var(--radius-sm);
  font-family: 'Material Symbols Outlined', sans-serif;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.stat-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--on-surface-variant);
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  font-family: var(--font-display);
  color: var(--primary);
}

/* ===== 主内容区 ===== */
.main-content {
  flex: 1;
  margin-left: 281px;
  padding: var(--spacing-6) var(--spacing-8);
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: calc(100vh - 64px);
}

.content-canvas {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* 页面标题 */
.page-header {
  margin-bottom: var(--spacing-6);
  flex-shrink: 0;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 800;
  font-family: var(--font-display);
  letter-spacing: -0.02em;
  color: var(--on-surface);
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 15px;
  color: var(--on-surface-variant);
  margin: 0;
}

/* ===== 公告列表 ===== */
.notice-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  padding-right: var(--spacing-2);
  padding-bottom: var(--spacing-6);
}

/* 公告卡片 */
.notice-card {
  background: var(--surface-bright);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--surface-container-high);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-bottom: var(--spacing-4);
}

.notice-card:hover {
  box-shadow: var(--shadow);
  transform: translateY(-2px);
}

.notice-card.urgent {
  border-left: 4px solid var(--error);
}

.notice-card.deadline {
  border-left: 4px solid var(--tertiary);
}

.notice-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-3);
}

.notice-type-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
}

.notice-type-badge.system {
  background: var(--primary-fixed);
  color: var(--primary);
}

.notice-type-badge.status {
  background: var(--secondary-container);
  color: var(--on-secondary-container);
}

.notice-type-badge.deadline {
  background: var(--tertiary-container);
  color: var(--tertiary);
}

.notice-type-badge.urgent {
  background: var(--error-container);
  color: var(--error);
}

.notice-type-badge .material-symbols-outlined {
  font-size: 14px;
}

.notice-time {
  font-size: 0.75rem;
  color: var(--on-surface-variant);
}

.notice-card-body {
  margin-bottom: var(--spacing-3);
}

.notice-card-title {
  font-size: 1.125rem;
  font-weight: 700;
  font-family: var(--font-display);
  color: var(--on-surface);
  margin-bottom: var(--spacing-2);
  display: block;
  line-height: 1.4;
}

.notice-card-content {
  font-size: 0.875rem;
  color: var(--on-surface-variant);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notice-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-3);
  border-top: 1px solid var(--surface-container-high);
}

.notice-sender {
  font-size: 0.75rem;
  color: var(--on-surface-variant);
}

.notice-arrow {
  color: var(--on-surface-variant);
}

.notice-arrow .material-symbols-outlined {
  font-size: 20px;
}

/* ===== 空状态 ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12) var(--spacing-8);
  flex: 1;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-4);
  opacity: 0.5;
  font-family: 'Material Symbols Outlined', sans-serif;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48;
}

.empty-text {
  font-size: 1.125rem;
  font-weight: 600;
  font-family: var(--font-display);
  color: var(--on-surface);
  margin-bottom: var(--spacing-2);
}

.empty-subtext {
  font-size: 0.875rem;
  color: var(--on-surface-variant);
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
  max-width: 700px;
  max-height: 85vh;
  overflow: hidden;
  box-shadow: var(--shadow-ambient);
  animation: modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 修改密码弹窗特定样式 - 固定宽度 400px */
.password-modal-content {
  max-width: 400px !important;
}

/* 修改密码弹窗内部元素样式统一 */
.password-modal-content .modal-header {
  padding: var(--spacing-4) var(--spacing-5);
  min-height: auto;
}

.password-modal-content .modal-body {
  padding: var(--spacing-5);
}

.password-modal-content .modal-footer {
  padding: var(--spacing-4) var(--spacing-5);
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
  padding: var(--spacing-4) var(--spacing-6);
  background: var(--surface-container-low);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  min-height: 56px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
}

.modal-close:hover {
  color: var(--on-surface);
  background: var(--surface-container-high);
}

.modal-body {
  padding: var(--spacing-6);
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  max-height: calc(85vh - 140px);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.detail-type-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 600;
}

.detail-type-badge.system {
  background: var(--primary-fixed);
  color: var(--primary);
}

.detail-type-badge.deadline {
  background: var(--tertiary-container);
  color: var(--tertiary);
}

.detail-type-badge.urgent {
  background: var(--error-container);
  color: var(--error);
}

.detail-type-badge .material-symbols-outlined {
  font-size: 16px;
}

.detail-time {
  font-size: 0.875rem;
  color: var(--on-surface-variant);
}

.detail-title {
  font-size: 1.5rem;
  font-weight: 700;
  font-family: var(--font-display);
  color: var(--on-surface);
  margin-bottom: var(--spacing-4);
  display: block;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.detail-content {
  font-size: 1rem;
  color: var(--on-surface);
  line-height: 1.8;
  padding: var(--spacing-4);
  background: var(--surface-container-low);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-4);
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-height: 40vh;
  overflow-y: auto;
}

.detail-sender {
  font-size: 0.875rem;
  color: var(--on-surface-variant);
  margin-top: var(--spacing-4);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--surface-container-high);
}

.modal-footer {
  display: flex;
  padding: var(--spacing-5) var(--spacing-6);
  gap: var(--spacing-3);
  background: var(--surface-container-lowest);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}

/* 按钮样式 */
.action-btn {
  flex: 1;
  padding: var(--spacing-5) var(--spacing-6);
  border-radius: var(--radius-md);
  font-size: 1.0625rem;
  font-weight: 600;
  font-family: var(--font-body);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 52px;
}

.action-btn.primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  color: white;
  box-shadow: var(--shadow-primary);
}

.action-btn.primary:hover {
  box-shadow: 0 6px 20px rgba(0, 91, 191, 0.35);
  transform: translateY(-1px);
}

/* ==================== 响应式设计 ==================== */

/* 大屏幕 (>1400px) */
@media screen and (min-width: 1400px) {
  .sidebar {
    width: 300px;
  }
  
  .main-content {
    margin-left: 300px;
  }
  
  .content-canvas {
    max-width: 1400px;
  }
  
  .notice-card {
    padding: var(--spacing-8);
  }
}

/* 中等屏幕 (992px-1399px) */
@media screen and (max-width: 1399px) and (min-width: 992px) {
  .sidebar {
    width: 260px;
  }
  
  .main-content {
    margin-left: 260px;
  }
}

/* 平板屏幕 (768px-991px) */
@media screen and (max-width: 991px) and (min-width: 768px) {
  .sidebar {
    width: 220px;
    padding: var(--spacing-4);
  }
  
  .main-content {
    margin-left: 220px;
    padding: var(--spacing-4) var(--spacing-6);
  }
  
  .sidebar-stats {
    padding: var(--spacing-3);
  }
  
  .stat-item {
    padding: var(--spacing-2) 0;
  }
  
  .nav-item {
    padding: var(--spacing-2) var(--spacing-3);
  }
  
  .notice-card {
    padding: var(--spacing-5);
  }
}

/* 小屏幕手机 (<768px) */
@media screen and (max-width: 767px) {
  /* 侧边栏变为抽屉式或隐藏 */
  .sidebar {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    width: 100%;
    height: auto;
    max-height: 180px;
    padding: 16rpx;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 12rpx;
    overflow-x: auto;
    z-index: 99;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  }
  
  .sidebar-nav {
    flex-direction: row;
    flex: 1;
    gap: 8rpx;
  }
  
  .nav-item {
    flex: 1;
    min-width: 100rpx;
    justify-content: center;
    padding: var(--spacing-2);
  }
  
  .nav-label {
    font-size: 12px;
  }
  
  .sidebar-divider {
    display: none;
  }
  
  .sidebar-stats {
    display: none;
  }
  
  /* 主内容区调整 */
  .main-content {
    margin-left: 0;
    padding: 200px 16rpx 16rpx;
  }
  
  .content-canvas {
    padding: 0;
  }
  
  .page-header {
    margin-bottom: var(--spacing-4);
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .page-subtitle {
    font-size: 14px;
  }
  
  /* 公告卡片 */
  .notice-card {
    padding: var(--spacing-4);
    margin-bottom: var(--spacing-3);
  }
  
  .notice-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-2);
    margin-bottom: var(--spacing-3);
  }
  
  .notice-type-badge {
    font-size: 0.6875rem;
  }
  
  .notice-time {
    font-size: 0.6875rem;
  }
  
  .notice-card-title {
    font-size: 1rem;
  }
  
  .notice-card-content {
    font-size: 0.8125rem;
    -webkit-line-clamp: 3;
    line-clamp: 3;
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
  
  /* 弹窗适配 */
  .modal-content {
    width: 95%;
    max-width: 95%;
    max-height: 90vh;
  }
  
  .modal-header {
    padding: var(--spacing-4);
  }
  
  .modal-title {
    font-size: 1rem;
  }
  
  .modal-body {
    padding: var(--spacing-4);
  }
  
  .detail-title {
    font-size: 1.25rem;
  }
  
  .detail-content {
    font-size: 0.875rem;
    padding: var(--spacing-3);
    max-height: 50vh;
  }
  
  .modal-footer {
    padding: var(--spacing-4);
  }
  
  .action-btn {
    min-height: 44px;
    font-size: 1rem;
  }
  
  /* 空状态 */
  .empty-state {
    padding: var(--spacing-8) var(--spacing-4);
  }
  
  .empty-icon {
    font-size: 2.5rem;
  }
  
  .empty-text {
    font-size: 1rem;
  }
  
  .empty-subtext {
    font-size: 0.8125rem;
  }
}

/* 超小屏幕 (<480px) */
@media screen and (max-width: 479px) {
  .sidebar {
    max-height: 160px;
    padding: 12rpx;
  }
  
  .main-content {
    padding-top: 180px;
  }
  
  .nav-item {
    min-width: 80rpx;
    padding: var(--spacing-1);
  }
  
  .nav-item .material-symbols-outlined {
    font-size: 18px;
  }
  
  .nav-label {
    font-size: 11px;
  }
  
  .notice-card {
    padding: var(--spacing-3);
  }
  
  .notice-card-title {
    font-size: 0.9375rem;
  }
  
  .notice-card-content {
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }
  
  .modal-content {
    width: 98%;
    border-radius: var(--radius-md);
  }
  
  .detail-title {
    font-size: 1.125rem;
  }
}

/* 窗口缩放时的过渡动画 */
.sidebar,
.main-content,
.notice-card,
.modal-content {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
  color: #f44336;
}

.user-card-menu-item.logout:hover {
  background: #ffebee;
}

.user-card-menu-item .material-symbols-outlined {
  font-size: 20px;
  color: var(--on-surface-variant);
}

.user-card-menu-item.logout .material-symbols-outlined {
  color: #f44336;
}

/* ===== 弹窗样式 ===== */

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
  color: var(--on-surface);
  margin-bottom: var(--spacing-2);
}

.about-version {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--on-surface-variant);
  margin-bottom: var(--spacing-4);
}

.about-desc {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--on-surface-variant);
  line-height: 1.6;
}

</style>
