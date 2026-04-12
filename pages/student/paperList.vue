<template>
  <view class="paper-list-page page-enter" :class="{ 'page-fade-out': isPageFadeOut }">
    <!-- 顶部标题栏 -->
    <header class="top-header">
      <view class="header-left">
        <view class="header-brand">
          <view class="header-brand-icon">
            <text class="material-symbols-outlined">description</text>
          </view>
          <view class="header-brand-text">
            <text class="header-brand-title">我的论文</text>
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

    <view class="main-layout-wrapper">
    <view class="main-layout">
      <!-- 左侧边栏 -->
      <view class="sidebar">
        <view class="sidebar-title">论文统计</view>
        <view class="sidebar-content">
          <view class="stats-panel">
            <view class="stat-item">
              <view class="stat-icon material-symbols-outlined">description</view>
              <view class="stat-content">
                <text class="stat-label">论文总数</text>
                <text class="stat-value">{{ paperList.length }}</text>
              </view>
            </view>
            <view
              class="stat-item clickable"
              @click="sortPapersByStatus(displayStatusBuckets.PENDING_REVIEW)"
              :class="{ active: activeSort === displayStatusBuckets.PENDING_REVIEW }"
            >
              <view class="stat-icon material-symbols-outlined">pending</view>
              <view class="stat-content">
                <text class="stat-label">待审阅</text>
                <text class="stat-value">{{ getDisplayStatusCount(displayStatusBuckets.PENDING_REVIEW) }}</text>
              </view>
            </view>
            <view
              class="stat-item clickable"
              @click="sortPapersByStatus(displayStatusBuckets.PENDING_REVISION)"
              :class="{ active: activeSort === displayStatusBuckets.PENDING_REVISION }"
            >
              <view class="stat-icon material-symbols-outlined">edit_note</view>
              <view class="stat-content">
                <text class="stat-label">待修改</text>
                <text class="stat-value">{{ getDisplayStatusCount(displayStatusBuckets.PENDING_REVISION) }}</text>
              </view>
            </view>
            <view
              class="stat-item clickable"
              @click="sortPapersByStatus(displayStatusBuckets.FINALIZED)"
              :class="{ active: activeSort === displayStatusBuckets.FINALIZED }"
            >
              <view class="stat-icon material-symbols-outlined">check_circle</view>
              <view class="stat-content">
                <text class="stat-label">已定稿</text>
                <text class="stat-value">{{ getDisplayStatusCount(displayStatusBuckets.FINALIZED) }}</text>
              </view>
            </view>
          </view>
          <view class="sidebar-menu">
            <view class="menu-item" @click="goToWorkbench">
              <view class="menu-icon material-symbols-outlined">home</view>
              <text class="menu-text">返回工作台</text>
            </view>
            <view class="menu-item" @click="goToAttachmentList">
              <view class="menu-icon material-symbols-outlined">attach_file</view>
              <text class="menu-text">附件列表</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 右侧内容区 -->
      <view class="content-area" id="scrollContainer">
        <view class="content-wrapper">
        <!-- 加载中提示 -->
        <view v-if="loading" class="loading-container">
          <view class="loading-spinner"></view>
          <text class="loading-text">正在加载论文数据...</text>
        </view>

        <!-- 论文列表 -->
        <transition-group v-else name="paper-list" tag="view" class="paper-list">
          <view v-for="(paper, index) in filteredPapers" :key="paper.id" :id="'paper-' + paper.id" class="paper-card" :class="{ 'collapsed': isCollapsed(paper.id), 'highlighted': highlightedPaperId === paper.id }" @click="viewPaper(paper)">
            <!-- 论文头部 -->
            <view class="paper-header">
              <view class="paper-info">
                <text class="paper-title">{{ paper.title }}<text class="paper-preview-hint"> 点击预览 👁</text></text>
                <text class="paper-meta">指导教师：{{ paper.teacher }} | 版本：v{{ paper.version }} | 论文ID：{{ paper.id }}</text>
              </view>
              <view class="header-right" @click.prevent.stop>
                <view class="refresh-status-btn" @click.prevent.stop="fetchAllPaperStatus">
                  <text class="refresh-text">获取状态</text>
                </view>
                <!-- 折叠按钮 -->
                <view class="collapse-btn" @click.prevent.stop="toggleCollapse(paper.id, $event)">
                  <text class="collapse-icon material-symbols-outlined" :class="{ 'collapsed': isCollapsed(paper.id) }">expand_more</text>
                </view>
              </view>
            </view>

            <!-- 论文内容（可折叠区域） -->
            <view class="paper-content-wrapper" :class="{ 'collapsed': isCollapsed(paper.id) }">
              <view class="paper-content">
                <view class="paper-detail">
                  <text class="detail-label">最后更新：</text>
                  <text class="detail-value">{{ paper.updateTime }}</text>
                </view>

                <!-- 状态进度条（三步：与侧栏展示桶一致，依据后端 status 映射） -->
                <view class="progress-section">
                  <view class="progress-track">
                    <view class="progress-step" :class="{ active: displayStep(paper.status) >= 1, completed: displayStep(paper.status) > 1 }">
                      <view class="step-circle">1</view>
                      <text class="step-text">待审阅</text>
                    </view>
                    <view class="progress-line" :class="{ active: displayStep(paper.status) >= 2 }">
                      <view class="line-flow" v-if="displayStep(paper.status) >= 2"></view>
                    </view>
                    <view class="progress-step" :class="{ active: displayStep(paper.status) >= 2, completed: displayStep(paper.status) > 2 }">
                      <view class="step-circle">2</view>
                      <text class="step-text">待修改</text>
                    </view>
                    <view class="progress-line" :class="{ active: displayStep(paper.status) >= 3 }">
                      <view class="line-flow" v-if="displayStep(paper.status) >= 3"></view>
                    </view>
                    <view class="progress-step" :class="{ active: displayStep(paper.status) >= 3 }">
                      <view class="step-circle">3</view>
                      <text class="step-text">已定稿</text>
                    </view>
                  </view>
                </view>

                <!-- 状态记录区域 -->
                <view class="notice-section" v-if="paper.statusHistory && paper.statusHistory.length > 0">
                  <view class="notice-header">
                    <text class="notice-title">状态记录</text>
                  </view>
                  <view class="notice-list">
                    <view v-for="(record, nIdx) in paper.statusHistory.slice(0, 2)" :key="nIdx" class="notice-item">
                      <view class="notice-time">{{ record.time }}</view>
                      <view class="notice-content">{{ record.content }}</view>
                    </view>
                  </view>
                </view>
              </view>
            </view>

            <!-- 操作按钮 -->
            <view class="paper-actions">
              <button class="action-btn annotation-btn" @click.stop="viewAnnotations(paper)">
                <text class="btn-icon material-symbols-outlined">chat</text>
                <text>查看批注</text>
              </button>
              <button 
                class="action-btn review-btn" 
                :class="{ 'disabled': !canViewReview(paper.status) }"
                @click.stop="viewReview(paper)"
              >
                <text class="btn-icon material-symbols-outlined">fact_check</text>
                <text>查看审阅</text>
              </button>
              <button class="action-btn download-btn" @click.stop="downloadPaper(paper)">
                <text class="btn-icon material-symbols-outlined">download</text>
                <text>下载论文</text>
              </button>
              <button 
                class="action-btn update-btn" 
                :class="{ 'disabled': !canUpdatePaper(paper.status) }"
                @click.stop="handleUpdateClick(paper)"
              >
                <text class="btn-icon material-symbols-outlined">update</text>
                <text>更新论文</text>
              </button>
              <button class="action-btn delete-btn" @click.stop="deletePaper(paper.id, paper.title)">
                <text class="btn-icon material-symbols-outlined">delete</text>
                <text>删除</text>
              </button>
            </view>
          </view>
        </transition-group>

        <!-- 空状态 -->
        <view v-if="filteredPapers.length === 0 && !loading" class="empty-container">
          <text class="empty-icon material-symbols-outlined">inbox</text>
          <text class="empty-text">暂无论文数据</text>
          <text class="empty-subtext">请先上传论文以查看列表</text>
        </view>
      </view>
    </view>

    <!-- 批注详情模态框 -->
    <view class="annotation-modal" v-if="showAnnotationModal" @click="closeAnnotationModal">
      <view class="annotation-modal-content" @click.stop>
        <view class="annotation-modal-header">
          <view class="annotation-header-left"></view>
          <text class="annotation-modal-title">论文批注</text>
          <view class="annotation-header-right">
            <text class="annotation-modal-close material-symbols-outlined" @click="closeAnnotationModal">close</text>
          </view>
        </view>
        <view class="annotation-modal-body">
          <view class="annotation-paper-info">
            <text class="annotation-paper-title">{{ currentPaper?.title }}</text>
            <text class="annotation-paper-meta">指导教师：{{ currentPaper?.teacher }} | 版本：v{{ currentPaper?.version }}</text>
          </view>
          <view class="annotation-list" v-if="annotations.length > 0">
            <view 
              class="annotation-item" 
              v-for="(annotation, index) in annotations"
              :key="index"
              :class="{ 'processed': annotation.processed, 'unprocessed': !annotation.processed }"
            >
              <view class="annotation-header">
                <view class="annotation-source">
                  <text class="source-icon material-symbols-outlined">{{ annotation.source === 'AI' ? 'smart_toy' : 'person' }}</text>
                  <text class="source-text">{{ annotation.source === 'AI' ? 'AI智能批注' : '教师批注' }}</text>
                </view>
                <view class="annotation-status" :class="annotation.processed ? 'status-processed' : 'status-unprocessed'">
                  <text>{{ annotation.processed ? '已处理' : '未处理' }}</text>
                </view>
              </view>
                        
              <!-- 选中内容 -->
              <view class="annotation-section" v-if="annotation.content.selected">
                <view class="section-title">选中内容</view>
                <view class="section-content selected-content">{{ annotation.content.selected }}</view>
              </view>
                        
              <!-- 批注内容 -->
              <view class="annotation-section" v-if="annotation.content.annotation">
                <view class="section-title">批注</view>
                <view class="section-content annotation-content-text">{{ annotation.content.annotation }}</view>
              </view>
                        
              <!-- 建议 -->
              <view class="annotation-section" v-if="annotation.content.suggestion">
                <view class="section-title">建议</view>
                <view class="section-content suggestion-content">{{ annotation.content.suggestion }}</view>
              </view>
                        
              <view class="annotation-footer">
                <text class="annotation-time">{{ annotation.time }}</text>
              </view>
            </view>
          </view>
          <view class="annotation-empty" v-else>
            <text class="empty-icon material-symbols-outlined">chat</text>
            <text class="empty-text">暂无批注</text>
            <text class="empty-subtext">该论文暂时还没有批注信息</text>
          </view>
        </view>
      </view>
    </view>
    </view>
    </view>

    <!-- 更新论文弹窗 -->
    <view class="update-modal" v-if="showUpdateModal" @click.self="closeUpdateModal">
      <view class="update-modal-content">
        <view class="update-modal-header">
          <text class="update-modal-title">更新论文</text>
          <text class="update-modal-close" @click="closeUpdateModal">×</text>
        </view>
        <view class="update-modal-body">
          <view class="update-paper-info" v-if="updatePaperItem">
            <text class="update-paper-title">{{ updatePaperItem.title }}</text>
            <text class="update-paper-current-version">当前版本：v{{ updatePaperItem.version }}</text>
          </view>
          
          <view class="update-modal-tips">
            <text>支持格式：.docx（Word文档）</text>
            <text>文件大小：≤100MB</text>
          </view>
          
          <!-- 版本号输入 -->
          <view class="version-input-section">
            <text class="input-label">新版本号：</text>
            <input 
              class="version-input" 
              v-model="updateVersion" 
              type="text"
              placeholder="请输入新版本号（如 v2.0）"
            />
            <text class="version-hint">必须大于当前版本 v{{ updatePaperItem?.version }}</text>
          </view>
          
          <button class="update-modal-btn" @click="chooseUpdateFile">选择文件</button>
          <view v-if="updateSelectedFile" class="update-modal-file-info">
            <text class="update-modal-file-name">{{ updateSelectedFile.name }}</text>
            <text class="update-modal-file-size">{{ formatFileSize(updateSelectedFile.size) }}</text>
          </view>
          <button 
            class="update-modal-submit-btn" 
            :disabled="!updateSelectedFile || !updateVersion" 
            @click="submitUpdatePaper"
          >
            提交更新
          </button>
        </view>
      </view>
    </view>
    
    <!-- Word文档预览组件 -->
    <WordPreview
      :visible="showWordPreview"
      :fileUrl="previewFileUrl"
      :title="previewTitle"
      @close="closeWordPreview"
      @download="handlePreviewDownload"
      @error="handlePreviewError"
    />
    
    <!-- 确认弹窗组件 -->
    <ConfirmModal
      :visible="showConfirmModal"
      :title="confirmModalTitle"
      :content="confirmModalContent"
      @confirm="handleConfirmModalConfirm"
      @cancel="handleConfirmModalCancel"
    />
  </view>

  <!-- 审阅详情弹窗 - 放在最外层避免受父元素transform影响 -->
  <view class="review-modal" v-if="showReviewModal" @click="closeReviewModal">
    <view class="review-modal-content" @click.stop>
      <view class="review-modal-header">
        <text class="review-modal-title">论文审阅详情</text>
        <text class="review-modal-close material-symbols-outlined" @click="closeReviewModal">close</text>
      </view>
      <view class="review-modal-body">
        <view class="review-paper-info" v-if="currentReview">
          <text class="review-paper-title">{{ currentReview.paperTitle }}</text>
          <text class="review-paper-meta">论文ID：{{ currentReview.paperId }}</text>
        </view>
        <view class="review-content-section" v-if="currentReview">
          <view class="review-section-title">审阅内容</view>
          <view class="review-content-text">{{ currentReview.reviewContent }}</view>
        </view>
        <view class="review-time-section" v-if="currentReview && currentReview.reviewTime">
          <text class="review-time-label">审阅时间：</text>
          <text class="review-time-value">{{ currentReview.reviewTime }}</text>
        </view>
        <view class="review-empty" v-else>
          <text class="empty-icon material-symbols-outlined">fact_check</text>
          <text class="empty-text">暂无审阅内容</text>
        </view>
      </view>
    </view>
  </view>
    
  <!-- 修改密码弹窗 -->
  <view v-if="showPasswordModal" class="modal-backdrop" @click.self="closePasswordModal">
    <view class="modal-content">
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
</template>

<script>
import { getPaperList, deletePaper, getAnnotationsByPaperId, updatePaperVersion, getPaperDetail, updatePaperStatus, getTeacherByStudentId, getPaperReview } from '../../api/student.js';
import { getUserId, isValidUserId, checkLogin } from '../../utils/auth.js';
import { AsyncQueue, debounce } from '../../utils/performance.js';
import {
	mapBackendStatusToStudentDisplayBucket,
	studentDisplayStatusLabel,
	studentDisplayStep,
	STUDENT_DISPLAY_BUCKETS
} from '../../utils/studentPaperDisplayStatus.js';

import WordPreview from '../../components/WordPreview.vue';
import ConfirmModal from '../../components/ConfirmModal.vue';
import { changePassword } from '../../api/student.js';
import { clearLoginState } from '../../utils/auth.js';

export default {
  components: {
    WordPreview,
    ConfirmModal
  },
  data() {
    return {
      // 页面淡出状态（跳转动画）
      isPageFadeOut: false,
      /** 论文展示三态（与 utils/studentPaperDisplayStatus 一致，供模板侧栏排序/统计） */
      displayStatusBuckets: STUDENT_DISPLAY_BUCKETS,
      paperList: [],
      loading: true,
      // Word预览相关
      showWordPreview: false,
      previewFileUrl: '',
      previewTitle: '',
      previewPaper: null,
      currentFilter: 'all',
      // 高亮的论文ID（从工作台跳转过来）
      highlightedPaperId: null,
      // 用户信息
      userInfo: {
        name: '学生',
        full_name: '',
        username: '',
        college: '学院'
      },
      // 当前排序状态
      activeSort: null,
      // 保存原始顺序用于恢复
      originalPaperList: [],
      // 论文列表刷新key
      paperListKey: 0,
      showAnnotationModal: false,
      currentPaper: null,
      annotations: [],
      // 论文卡片折叠状态
      collapsedPapers: {},
      // 更新论文相关
      showUpdateModal: false,
      updatePaperItem: null,
      updateVersion: '',
      updateSelectedFile: null,
      // 确认弹窗相关
      showConfirmModal: false,
      confirmModalTitle: '',
      confirmModalContent: '',
      confirmModalCallback: null,
      // 审阅弹窗相关
      showReviewModal: false,
      currentReview: null,
      backupPaperList: [
        {
          id: 1,
          title: "基于深度学习的图像识别研究",
          version: 2.0,
          teacher: "张教授",
          status: "reviewed",
          statusText: "待修改",
          updateTime: "2026-01-18 15:30",
          fileUrl: "https://example.com/papers/deep-learning-image-recognition.pdf",
          notices: [
            { time: '2026-01-18 15:30', content: '论文状态：已审阅' },
            { time: '2026-01-17 10:20', content: '论文状态：待审阅' }
          ]
        },
        {
          id: 2,
          title: "大数据在医疗领域的应用研究",
          version: 1.0,
          teacher: "李教授",
          status: "pending_review",
          statusText: "待审阅",
          updateTime: "2026-01-10 09:15",
          fileUrl: "https://example.com/papers/big-data-healthcare.pdf",
          notices: [
            { time: '2026-01-10 09:15', content: '论文状态：待审阅' }
          ]
        },
        {
          id: 3,
          title: "计算机视觉技术及应用",
          version: 1.5,
          teacher: "王教授",
          status: "finalized",
          statusText: "已定稿",
          updateTime: "2026-01-20 16:40",
          fileUrl: "https://example.com/papers/computer-vision-applications.pdf",
          notices: [
            { time: '2026-01-20 16:40', content: '论文状态：已定稿' }
          ]
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
      passwordError: '',
      // 关于系统弹窗
      showAboutModal: false
    };
  },
  computed: {
    filteredPapers() {
      // 始终返回新数组以确保Vue响应式更新
      if (this.currentFilter === 'all') {
        return [...this.paperList];
      }
      const f = this.currentFilter;
      const buckets = Object.values(STUDENT_DISPLAY_BUCKETS);
      if (buckets.includes(f)) {
        return this.paperList.filter(
          paper => mapBackendStatusToStudentDisplayBucket(paper.status) === f
        );
      }
      return this.paperList.filter(paper => paper.status === f);
    },
    // 用户名首字母
    userNameInitial() {
      const displayName = this.userInfo.full_name || this.userInfo.name || '学';
      return displayName.charAt(0);
    }
  },
  async onLoad() {
    if (!checkLogin({ redirect: true, message: '请先登录' })) {
      this.loading = false;
      return;
    }
    // 加载用户信息
    this.loadUserInfo();
    // 首次加载显示 loading
    await this.getPaperList(true);
    // 加载折叠状态
    this.loadCollapseState();
    // 检查是否有目标论文ID（从工作台跳转过来）
    this.checkAndNavigateToTargetPaper();
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
    this.getPaperList(false);
  },
  
  onUnload() {
    // 清理高亮定时器
    if (this._highlightTimer) {
      clearTimeout(this._highlightTimer);
      this._highlightTimer = null;
    }
    if (this._scrollTimer) {
      clearTimeout(this._scrollTimer);
      this._scrollTimer = null;
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
    
    // 加载用户信息
    loadUserInfo() {
      try {
        let userInfo = uni.getStorageSync('userInfo');
        
        // 如果获取的是字符串，需要解析
        if (typeof userInfo === 'string') {
          userInfo = JSON.parse(userInfo);
        }
        
        if (userInfo) {
          // 优先使用 full_name，如果不存在则使用 name
          const displayName = userInfo.full_name || userInfo.name || '学生用户';
          this.userInfo.name = displayName;
          this.userInfo.full_name = userInfo.full_name || userInfo.name || '学生';
          this.userInfo.username = userInfo.username || '';
          this.userInfo.college = userInfo.college || '学院';
        }
      } catch (e) {
        console.error('获取用户信息失败:', e);
      }
    },
    
    // 检查并跳转到目标论文（从工作台跳转）
    async checkAndNavigateToTargetPaper() {
      try {
        const targetPaperInfo = uni.getStorageSync('targetPaperInfo');
        if (!targetPaperInfo || !targetPaperInfo.id) {
          return;
        }
        
        console.log('[论文列表] 检测到目标论文:', targetPaperInfo);
        
        // 清除存储的目标信息
        uni.removeStorageSync('targetPaperInfo');
        
        const targetPaperId = targetPaperInfo.id;
        const targetStatus = targetPaperInfo.status;
        
        // 等待论文列表渲染完成
        await this.$nextTick();
        
        // 检查目标论文是否在当前筛选条件下可见
        let targetPaper = this.filteredPapers.find(p => p.id === targetPaperId);
        
        // 如果不在当前筛选条件下，切换筛选条件
        if (!targetPaper && targetStatus) {
          const bucket = mapBackendStatusToStudentDisplayBucket(targetStatus);
          console.log('[论文列表] 论文不在当前筛选条件下，切换展示筛选:', targetStatus, '->', bucket);
          this.currentFilter = bucket;
          await this.$nextTick();
          targetPaper = this.filteredPapers.find(p => p.id === targetPaperId);
        }
        
        if (!targetPaper) {
          // 尝试在所有论文中查找
          targetPaper = this.paperList.find(p => p.id === targetPaperId);
          if (targetPaper) {
            // 切换到全部显示
            console.log('[论文列表] 切换到全部显示以查找论文');
            this.currentFilter = 'all';
            await this.$nextTick();
          }
        }
        
        if (targetPaper) {
          console.log('[论文列表] 找到目标论文:', targetPaper.title);
          
          // 确保论文卡片是展开状态
          if (this.collapsedPapers[targetPaperId]) {
            this.$set(this.collapsedPapers, targetPaperId, false);
            this.saveCollapseState();
            await this.$nextTick();
          }
          
          // 设置高亮状态
          this.highlightedPaperId = targetPaperId;
          
          // 延迟滚动到目标论文位置（等待页面淡入动画完成）
          this._scrollTimer = setTimeout(() => {
            this._scrollTimer = null;
            this.scrollToPaper(targetPaperId);
          }, 450);
          
          // 3秒后取消高亮
          this._highlightTimer = setTimeout(() => {
            this._highlightTimer = null;
            this.highlightedPaperId = null;
          }, 3000);
        } else {
          uni.showToast({ title: '未找到对应论文', icon: 'none' });
        }
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[PaperList] 检查目标论文失败');
        }
      }
    },
    
    // 滚动到指定论文位置
    scrollToPaper(paperId) {
      // 使用 uni.createSelectorQuery 获取元素位置
      const query = uni.createSelectorQuery().in(this);
      
      // 同时获取容器和目标元素的位置
      query.select('#scrollContainer').boundingClientRect();
      query.select('#scrollContainer').scrollOffset();
      query.select(`#paper-${paperId}`).boundingClientRect();
      
      query.exec((res) => {
        console.log('[论文列表] 滚动查询结果:', res);
        
        if (res && res[0] && res[2]) {
          const containerRect = res[0];  // 容器位置
          const scrollOffset = res[1];    // 容器当前滚动位置
          const targetRect = res[2];      // 目标元素位置
          
          if (!targetRect) {
            console.warn('[论文列表] 未找到目标元素:', paperId);
            return;
          }
          
          // 获取容器高度（可视区域高度）
          const containerHeight = containerRect.height;
          
          // 计算目标元素相对于容器的位置
          // targetRect.top 是元素相对于视口顶部的位置
          // containerRect.top 是容器相对于视口顶部的位置
          // 所以元素相对于容器顶部的位置 = targetRect.top - containerRect.top + 当前滚动位置
          const relativeTop = targetRect.top - containerRect.top + scrollOffset.scrollTop;
          
          // 计算目标滚动位置：使元素在容器中垂直居中
          const cardHeight = targetRect.height;
          const targetScrollTop = relativeTop - (containerHeight / 2) + (cardHeight / 2);
          
          // 确保滚动位置不小于0
          const finalScrollTop = Math.max(0, targetScrollTop);
          
          console.log('[论文列表] 滚动计算:', {
            containerHeight,
            relativeTop,
            cardHeight,
            currentScrollTop: scrollOffset.scrollTop,
            targetScrollTop: finalScrollTop
          });
          
          // 获取容器 DOM 元素并设置滚动位置
          // #ifdef H5
          const container = document.getElementById('scrollContainer');
          if (container) {
            container.scrollTo({
              top: finalScrollTop,
              behavior: 'smooth'
            });
            console.log('[论文列表] 已滚动到论文:', paperId);
          } else {
            console.warn('[论文列表] 未找到滚动容器');
          }
          // #endif
          
          // #ifndef H5
          // 非H5环境，尝试使用 uni.pageScrollTo
          uni.pageScrollTo({
            scrollTop: finalScrollTop,
            duration: 600
          });
          // #endif
        } else {
          console.warn('[论文列表] 无法获取元素位置，结果:', res);
        }
      });
    },
    
    // ========== 更新论文相关方法 ==========
    
    /**
     * 处理更新按钮点击
     * 如果状态不允许更新，显示对应状态的原因提示
     */
    handleUpdateClick(paper) {
      if (!this.canUpdatePaper(paper.status)) {
        const reason = this.getUpdateDisabledReason(paper.status);
        uni.showToast({ 
          title: reason, 
          icon: 'none',
          duration: 2500
        });
        return;
      }
      this.openUpdateModal(paper);
    },
    
    openUpdateModal(paper) {
      this.updatePaperItem = paper;
      this.updateVersion = '';
      this.updateSelectedFile = null;
      this.showUpdateModal = true;
    },
    
    closeUpdateModal() {
      this.showUpdateModal = false;
      this.updatePaperItem = null;
      this.updateVersion = '';
      this.updateSelectedFile = null;
    },
    
    chooseUpdateFile() {
      // H5 平台使用 input 元素选择文件
      // #ifdef H5
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          this.updateSelectedFile = {
            name: file.name,
            size: file.size,
            path: file  // H5 下传递交 File 对象
          };
        }
      };
      input.click();
      // #endif
      
      // 小程序/移动端使用 uni.chooseMessageFile
      // #ifndef H5
      uni.chooseMessageFile({
        count: 1,
        type: 'file',
        extension: ['.docx'],
        success: (res) => {
          const file = res.tempFiles[0];
          this.updateSelectedFile = {
            name: file.name,
            size: file.size,
            path: file.path
          };
        },
        fail: (err) => {
          console.error('选择文件失败:', err);
          uni.showToast({ title: '选择文件失败', icon: 'none' });
        }
      });
      // #endif
    },
    
    formatFileSize(size) {
      if (size < 1024) return size + ' B';
      if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
      return (size / (1024 * 1024)).toFixed(2) + ' MB';
    },
    
    async submitUpdatePaper() {
      if (!this.updateSelectedFile || !this.updateVersion) {
        uni.showToast({ title: '请选择文件并输入版本号', icon: 'none' });
        return;
      }
      
      // 验证版本号格式
      const versionRegex = /^v\d+\.\d+$/;
      if (!versionRegex.test(this.updateVersion)) {
        uni.showToast({ title: '版本号格式不正确（如 v2.0）', icon: 'none' });
        return;
      }
      
      // 验证新版本是否大于当前版本
      const currentVersion = parseFloat(this.updatePaperItem.version);
      const newVersion = parseFloat(this.updateVersion.replace('v', ''));
      if (newVersion <= currentVersion) {
        uni.showToast({ title: `新版本必须大于当前版本 v${this.updatePaperItem.version}`, icon: 'none' });
        return;
      }
      
      // 关闭弹窗前保存所有需要的值（关闭后 updatePaperItem 会被清空）
      const paperId = this.updatePaperItem.id;
      const filePath = this.updateSelectedFile.path;
      const version = this.updateVersion;
      // 保存当前状态，用于判断是否需要触发状态回退
      const currentStatus = (this.updatePaperItem.status || '').trim();
      
      // 先关闭弹窗，再显示 loading
      this.closeUpdateModal();
      uni.showLoading({ title: '更新中...', mask: true });
      
      try {
        const res = await updatePaperVersion(paperId, filePath, version);
        console.log('[提交更新] 版本更新成功:', res);
        
        // 状态流转：仅当当前状态为"待更新"时，才将状态回退为"已更新"
        // 后端权限规则：待更新 → 学生可设为已更新
        const NEED_STATUS_UPDATE = ['待更新', 'pending_update', 'update_pending'];
        if (NEED_STATUS_UPDATE.includes(currentStatus) || NEED_STATUS_UPDATE.includes(currentStatus.toLowerCase())) {
          try {
            await updatePaperStatus(paperId, { status: '已更新' });
            console.log('[提交更新] 状态已更新为"已更新"，原状态:', currentStatus);
          } catch (statusErr) {
            console.error('[提交更新] 状态更新失败，原状态:', currentStatus, '错误:', statusErr);
            // 状态更新失败不阻断主流程，刷新列表后显示最新状态
          }
        } else {
          console.log('[提交更新] 当前状态无需触发状态变更:', currentStatus);
        }
        
        uni.hideLoading();
        uni.showToast({ title: '更新成功', icon: 'success' });
        
        // 刷新列表以显示最新状态
        this.getPaperList();
      } catch (err) {
        uni.hideLoading();
        console.error('[提交更新] 失败:', err);
        uni.showToast({ title: err.message || '更新失败', icon: 'none' });
      }
    },
    
    // 刷新所有论文状态（并行执行，带防抖）
    async fetchAllPaperStatus(forceRefresh = false) {
      // 防抖检查：5秒内不重复刷新
      const now = Date.now();
      if (!forceRefresh && this._lastStatusRefresh && (now - this._lastStatusRefresh < 5000)) {
        uni.showToast({ title: '刷新太频繁，请稍后再试', icon: 'none' });
        return;
      }
      this._lastStatusRefresh = now;
      
      if (this.paperList.length === 0) {
        uni.showToast({ title: '暂无论文', icon: 'none' });
        return;
      }
      
      this.loading = true;
      
      try {
        // 使用队列控制并发数，避免同时发起过多请求
        const queue = new AsyncQueue(3); // 最多3个并发
        const statusPromises = this.paperList.map(paper => 
          queue.add(() => 
            getPaperDetail(paper.id)
              .then(res => ({ id: paper.id, status: res?.status }))
              .catch(() => ({ id: paper.id, status: null }))
          )
        );
        
        const results = await Promise.all(statusPromises);
        const statusMap = {};
        let updatedCount = 0;
        
        results.forEach(({ id, status }) => {
          if (status) {
            // 标准化状态值
            const normalizedStatus = (status || '').toLowerCase().trim();
            const index = this.paperList.findIndex(p => p.id === id);
            if (index !== -1) {
              // 只在状态变化时更新
              if (this.paperList[index].status !== normalizedStatus) {
                this.$set(this.paperList[index], 'status', normalizedStatus);
                this.$set(this.paperList[index], 'statusText', this.formatStatusText(normalizedStatus));
                updatedCount++;
              }
            }
            statusMap[id] = normalizedStatus;
          }
        });
        
        this.savePaperStatusToStorage(statusMap);
        if (updatedCount > 0) {
          this.paperListKey++;
        }
        uni.showToast({ 
          title: updatedCount > 0 ? `已更新${updatedCount}篇论文状态` : '状态已是最新', 
          icon: 'success' 
        });
      } catch (err) {
        console.error('刷新状态失败:', err);
        uni.showToast({ title: '刷新状态失败', icon: 'none' });
      } finally {
        this.loading = false;
      }
    },
    
    goToWorkbench() {
      this.isPageFadeOut = true;
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/student/workbench' });
      }, 300);
    },
    goToAttachmentList() {
      this.isPageFadeOut = true;
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/student/attachmentList' });
      }, 300);
    },
    
    // ========== 论文状态本地存储相关方法 ==========
    /**
     * 保存论文状态到本地存储
     */
    savePaperStatusToStorage(statusMap) {
      const userId = getUserId();
      if (!userId) return;
      
      const storageKey = `paper_status_${userId}`;
      const data = {
        timestamp: Date.now(),
        statusMap: statusMap
      };
      uni.setStorageSync(storageKey, data);
    },
    
    /**
     * 从本地存储加载论文状态
     */
    loadPaperStatusFromStorage() {
      const userId = getUserId();
      if (!userId) return null;
      
      const storageKey = `paper_status_${userId}`;
      const data = uni.getStorageSync(storageKey);
      
      if (!data || !data.statusMap) return null;
      
      // 检查数据是否过期（7天）
      const now = Date.now();
      const expireTime = 7 * 24 * 60 * 60 * 1000;
      if (now - data.timestamp > expireTime) {
        uni.removeStorageSync(storageKey);
        return null;
      }
      
      return data.statusMap;
    },
    
    /**
     * 应用本地存储的状态到论文列表
     */
    applyStoredStatusToPaperList() {
      const statusMap = this.loadPaperStatusFromStorage();
      if (!statusMap) return;
      
      let hasUpdate = false;
      this.paperList.forEach((paper, index) => {
        const stored = statusMap[paper.id] != null ? statusMap[paper.id] : statusMap[String(paper.id)];
        if (!stored) return;

        const serverBucket = mapBackendStatusToStudentDisplayBucket(paper.status);
        // 列表接口已给出「待修改」或「已定稿」时，不要用本地旧缓存覆盖（否则会出现进度条与按钮不一致）
        if (
          serverBucket === STUDENT_DISPLAY_BUCKETS.PENDING_REVISION ||
          serverBucket === STUDENT_DISPLAY_BUCKETS.FINALIZED
        ) {
          return;
        }

        if (paper.status !== stored) {
          this.$set(this.paperList[index], 'status', stored);
          this.$set(this.paperList[index], 'statusText', this.formatStatusText(stored));
          hasUpdate = true;
        } else if (!paper.statusText) {
          this.$set(this.paperList[index], 'statusText', this.formatStatusText(stored));
          hasUpdate = true;
        }
      });
      
      if (hasUpdate) {
        this.paperListKey++;
      }
    },
    
    /**
     * 查询学生的指导教师工号，并更新论文列表中的教师显示
     * 接口返回 { teachers: [{id, teacher_id}] }，teacher_id 即教师工号
     * @param {string} studentUsername - 学生学号
     */
    async fetchAndApplyTeacherUsername(studentUsername) {
      try {
        const res = await getTeacherByStudentId(studentUsername);
        const teachers = res?.teachers || [];
        if (teachers.length === 0) return;
        
        // 构建 教师自增ID → 教师工号 的映射表
        const teacherMap = {};
        teachers.forEach(t => {
          teacherMap[t.id] = t.teacher_id; // t.teacher_id 是工号如 "t123"
        });
        
        // 更新论文列表中匹配的教师显示
        let hasUpdate = false;
        this.paperList.forEach((paper, index) => {
          // 取原始 teacher_id（数字），在映射表中查找工号
          const rawTeacherId = paper._rawTeacherId;
          if (rawTeacherId && teacherMap[rawTeacherId]) {
            this.$set(this.paperList[index], 'teacher', teacherMap[rawTeacherId]);
            hasUpdate = true;
          }
        });
        
        if (hasUpdate) this.paperListKey++;
      } catch (err) {
        console.error('[fetchAndApplyTeacherUsername] 查询教师工号失败:', err);
      }
    },
    
    // 获取缺少状态的论文详细状态（并行执行）
    async fetchAllPaperDetails(papers) {
      if (!papers || papers.length === 0) return;
          
      // 并行获取所有论文详情（包含状态和更新时间）
      const detailPromises = papers.map(paper =>
        getPaperDetail(paper.id)
          .then(res => ({ id: paper.id, detail: res }))
          .catch(() => ({ id: paper.id, detail: null }))
      );
          
      const results = await Promise.all(detailPromises);
          
      let hasUpdate = false;
      results.forEach(({ id, detail }) => {
        if (detail) {
          const index = this.paperList.findIndex(p => p.id === id);
          if (index !== -1) {
            // 标准化状态值（小写）
            const rawStatus = detail.status || '';
            const normalizedStatus = rawStatus.toLowerCase().trim();
            const oldStatus = this.paperList[index].status;
                
            // 调试日志
            console.log('[fetchAllPaperDetails] 论文ID:', id, '原始状态:', rawStatus, '-> 标准化:', normalizedStatus, '旧状态:', oldStatus);
                
            // 更新状态（如果后端返回的状态与当前不同）
            if (normalizedStatus && normalizedStatus !== oldStatus) {
              this.$set(this.paperList[index], 'status', normalizedStatus);
              this.$set(this.paperList[index], 'statusText', this.formatStatusText(normalizedStatus));
              hasUpdate = true;
            }
                
            // 更新更新时间
            if (detail.updated_at) {
              this.$set(this.paperList[index], 'updateTime', detail.updated_at);
            }
                
            // 构建并更新状态历史记录（基于后端返回的真实状态）
            const statusHistory = this.buildStatusHistory(detail);
            this.$set(this.paperList[index], 'statusHistory', statusHistory);
          }
        }
      });
          
      if (hasUpdate) {
        this.paperListKey++;
        this.savePaperStatusToStorageFromList();
      }
    },
    
    // 保留此方法用于兼容，实际逻辑已合并到 fetchAllPaperDetails
    async fetchMissingStatuses(papers) {
      return this.fetchAllPaperDetails(papers);
    },
    
    /**
     * 根据论文详情构建状态历史记录
     * @param {Object} detail - 论文详情对象
     * @returns {Array} 状态历史记录数组
     */
    buildStatusHistory(detail) {
      const history = [];
      const rawStatus = detail.status || '';
      const updateTime = detail.updated_at || detail.updateTime || new Date().toLocaleString('zh-CN');
      const displayStatus = studentDisplayStatusLabel(rawStatus);
      history.push({
        time: updateTime,
        content: `当前状态：${displayStatus}`
      });
      return history;
    },
    
    // 格式化状态文本（学生端统一三态展示，后端枚举不变）
    formatStatusText(status) {
      if (status == null || String(status).trim() === '') return '待审阅';
      return studentDisplayStatusLabel(status);
    },
    
    // 从列表保存状态到本地存储
    savePaperStatusToStorageFromList() {
      try {
        const statusMap = {};
        this.paperList.forEach(paper => {
          if (paper.status) {
            statusMap[paper.id] = paper.status;
          }
        });
        this.savePaperStatusToStorage(statusMap);
      } catch (error) {
        console.error('保存论文状态到本地存储失败:', error);
      }
    },
    
    getStatusCount(status) {
      // 标准化状态值进行比较（支持中英文）
      const normalizedTarget = this.normalizeStatus(status);
      return this.paperList.filter(paper => {
        const normalizedPaperStatus = this.normalizeStatus(paper.status);
        return normalizedPaperStatus === normalizedTarget;
      }).length;
    },

    /** 侧栏：按展示桶（ui_pending_review 等）统计数量 */
    getDisplayStatusCount(bucket) {
      return this.paperList.filter(
        p => mapBackendStatusToStudentDisplayBucket(p.status) === bucket
      ).length;
    },

    /** 模板用：三步进度当前步 1–3 */
    displayStep(status) {
      return studentDisplayStep(status);
    },
    
    /**
     * 标准化状态值（支持中英文互转）
     * 将各种状态格式统一为英文标准格式
     */
    normalizeStatus(status) {
      if (!status) return '';
      const normalized = String(status).toLowerCase().trim();
      
      // 中文状态映射到英文
      const statusMap = {
        '待审阅': 'pending_review',
        '已审阅': 'reviewed',
        '已更新': 'updated',
        '待更新': 'pending_update',
        '已定稿': 'finalized',
        '已上传': 'uploaded',
        '未提交': 'unsubmitted'
      };
      
      // 如果是中文，返回对应的英文
      if (statusMap[normalized]) {
        return statusMap[normalized];
      }
      
      // 如果是英文，标准化常见变体
      const englishMap = {
        'pending_review': 'pending_review',
        'review_pending': 'pending_review',
        'reviewing': 'pending_review',
        'under_review': 'pending_review',
        'in_review': 'pending_review',
        'reviewed': 'reviewed',
        'review_complete': 'reviewed',
        'feedback': 'reviewed',
        'updated': 'updated',
        'update_complete': 'updated',
        'pending_update': 'pending_update',
        'update_pending': 'pending_update',
        'finalized': 'finalized',
        'completed': 'finalized',
        'done': 'finalized',
        'uploaded': 'uploaded',
        'submitted': 'uploaded',
        'unsubmitted': 'unsubmitted',
        'draft': 'unsubmitted'
      };
      
      return englishMap[normalized] || normalized;
    },
    
    sortPapersByStatus(status) {
      // 如果点击的是当前已激活的状态，则取消排序
      if (this.activeSort === status) {
        this.activeSort = null;
        // 恢复原始顺序
        if (this.originalPaperList && this.originalPaperList.length > 0) {
          this.paperList = JSON.parse(JSON.stringify(this.originalPaperList));
        }
        return;
      }
      
      // 首次排序时保存原始顺序（深拷贝）
      if (!this.originalPaperList || this.originalPaperList.length === 0) {
        this.originalPaperList = JSON.parse(JSON.stringify(this.paperList));
      }
      
      this.activeSort = status;
      
      const sourceList = JSON.parse(JSON.stringify(this.originalPaperList));
      const bucketKeys = Object.values(STUDENT_DISPLAY_BUCKETS);
      if (bucketKeys.includes(status)) {
        const matchingPapers = sourceList.filter(
          p => mapBackendStatusToStudentDisplayBucket(p.status) === status
        );
        const nonMatchingPapers = sourceList.filter(
          p => mapBackendStatusToStudentDisplayBucket(p.status) !== status
        );
        this.paperList = [...matchingPapers, ...nonMatchingPapers];
        return;
      }
      
      const normalizedTarget = this.normalizeStatus(status);
      const matchingPapers = sourceList.filter(p => this.normalizeStatus(p.status) === normalizedTarget);
      const nonMatchingPapers = sourceList.filter(p => this.normalizeStatus(p.status) !== normalizedTarget);
      this.paperList = [...matchingPapers, ...nonMatchingPapers];
    },
    
    /**
     * 判断学生是否可以更新论文
     * 与展示「待修改」同一规则：凡归入 ui_pending_revision 桶的后端状态均可更新（避免白名单漏写导致按钮灰显）
     */
    canUpdatePaper(status) {
      return (
        mapBackendStatusToStudentDisplayBucket(status) ===
        STUDENT_DISPLAY_BUCKETS.PENDING_REVISION
      );
    },
    
    /**
     * 获取论文不可更新时的原因提示
     * 根据不同状态返回对应的提示信息
     */
    getUpdateDisabledReason(status) {
      const bucket = mapBackendStatusToStudentDisplayBucket(status);
      const ns = this.normalizeStatus(status);
      console.log('[更新提示] 原始状态:', status, '-> 展示桶:', bucket, '-> normalize:', ns);
      if (bucket === STUDENT_DISPLAY_BUCKETS.FINALIZED) {
        return '论文已定稿，无法再进行更新';
      }
      if (ns === 'updated' || ns === 'update_complete') {
        return '论文已提交更新，请等待教师审阅';
      }
      if (
        ns === 'pending_review' ||
        ns === 'reviewing' ||
        ns === 'under_review' ||
        ns === 'in_review' ||
        ns === 'review_pending'
      ) {
        return '论文正在等待教师审阅，请耐心等待';
      }
      return '论文刚上传，请等待教师开始审阅';
    },
    
    // 判断是否可查看审阅（已审阅及之后的状态）
    canViewReview(status) {
      const normalizedStatus = (status || '').toLowerCase().trim();
      // 已审阅及之后的状态：已审阅、已更新、待更新、已定稿
      const canViewStatuses = [
        '已审阅', 'reviewed', 'review_complete',
        '已更新', 'updated', 'update_complete',
        '待更新', 'pending_update', 'update_pending',
        '已定稿', 'finalized', 'final'
      ];
      return canViewStatuses.includes(normalizedStatus);
    },
    
    // 查看审阅内容
    async viewReview(paper) {
      if (!this.canViewReview(paper.status)) {
        uni.showToast({
          title: '当前论文尚未审阅，暂无审阅内容',
          icon: 'none',
          duration: 2000
        });
        return;
      }
      
      uni.showLoading({ title: '加载审阅内容...' });
      
      try {
        const res = await getPaperReview(paper.id);
        uni.hideLoading();
        
        if (res && res.message && res.message.includes('成功')) {
          // 显示审阅内容弹窗
          this.currentReview = {
            paperId: paper.id,
            paperTitle: paper.title,
            reviewContent: res.review_content || '暂无审阅内容',
            reviewTime: res.review_time || res.created_at || '',
            updatedTime: res.updated_time || res.updated_at || '',
            teacherId: res.teacher_id || ''
          };
          this.showReviewModal = true;
        } else {
          uni.showToast({
            title: res.message || '获取审阅内容失败',
            icon: 'none'
          });
        }
      } catch (err) {
        uni.hideLoading();
        uni.showToast({
          title: err.message || '获取审阅内容失败',
          icon: 'none'
        });
      }
    },
    
    // 关闭审阅弹窗
    closeReviewModal() {
      this.showReviewModal = false;
      this.currentReview = null;
    },
    
    async getPaperList(showLoading = true) {
      // 重置排序状态和原始顺序缓存
      this.activeSort = null;
      this.originalPaperList = [];
      const userInfo = uni.getStorageSync('userInfo') || {};
      const numericUserId = parseInt(userInfo.sub || 0, 10);
      
      if (!numericUserId) {
        this.loading = false;
        const loadedFromStorage = this.loadPapersFromLocalStorage();
        if (!loadedFromStorage) {
          this.paperList = JSON.parse(JSON.stringify(this.backupPaperList));
        }
        return;
      }
      
      // 先尝试从本地存储加载，快速显示
      const cachedData = uni.getStorageSync(`studentPapers_${numericUserId}`);
      if (cachedData && Array.isArray(cachedData) && cachedData.length > 0 && !showLoading) {
        this.paperList = this.formatPaperData(cachedData);
        this.applyStoredStatusToPaperList();
        this.loading = false;
      } else if (showLoading) {
        this.loading = true;
      }
      
      try {
        const res = await getPaperList({ owner_id: numericUserId });
        this.loading = false;
        this.paperListKey++;
        
        let paperData = null;
        if (res && res.code === 200 && res.data && Array.isArray(res.data)) {
          paperData = res.data;
        } else if (Array.isArray(res)) {
          paperData = res;
        }
        
        if (paperData && paperData.length > 0) {
          const myPapers = paperData.filter(p => !p.owner_id || p.owner_id === numericUserId);
          this.paperList = this.formatPaperData(myPapers.length > 0 ? myPapers : paperData);
          uni.setStorageSync(`studentPapers_${numericUserId}`, paperData);
          
          // 应用本地存储的论文状态
          this.applyStoredStatusToPaperList();
          
          // 异步获取所有论文的详情和状态历史（不阻塞界面）
          this.fetchAllPaperDetails(this.paperList);
          
          // 异步获取教师工号并更新显示（不阻塞界面）
          const userInfo = uni.getStorageSync('userInfo') || {};
          const studentUsername = userInfo.username || '';
          if (studentUsername) {
            this.fetchAndApplyTeacherUsername(studentUsername);
          }
        } else if (paperData !== null) {
          this.paperList = [];
        } else {
          const loadedFromStorage = this.loadPapersFromLocalStorage(numericUserId);
          if (!loadedFromStorage) {
            this.paperList = [];
          }
          this.applyStoredStatusToPaperList();
        }
      } catch (err) {
        console.error('获取论文列表失败:', err);
        this.loading = false;
        this.paperListKey++;
        const loadedFromStorage = this.loadPapersFromLocalStorage(numericUserId);
        if (!loadedFromStorage) {
          this.paperList = [];
        }
      }
    },
    loadPapersFromLocalStorage(userId) {
      try {
        // 优先读取当前用户专属的本地缓存
        const key = userId ? `studentPapers_${userId}` : 'studentPapers';
        const savedPapers = uni.getStorageSync(key);
        if (savedPapers && Array.isArray(savedPapers) && savedPapers.length > 0) {
          this.paperList = this.formatPaperData(savedPapers);
          // 应用本地存储的论文状态
          this.applyStoredStatusToPaperList();
          return true;
        }
        return false;
      } catch (error) {
        console.error('加载本地论文数据失败:', error);
        return false;
      }
    },
    formatPaperData(list) {
      return list.map(item => {
        const rawStatus = item.status || item.state || item.paper_status || '';
        const status = (rawStatus || '').toLowerCase().trim();
        const rawTrim = String(rawStatus).trim();
        const statusText = rawTrim ? studentDisplayStatusLabel(rawStatus) : '';
        console.log('[formatPaperData] 原始状态:', rawStatus, '-> 标准化:', status, '-> 展示:', statusText);
        const statusHistory = item.statusHistory || item.status_history || [
          {
            time: item.updateTime || item.updated_at || new Date().toLocaleString('zh-CN'),
            content: `当前状态：${studentDisplayStatusLabel(rawStatus)}`
          }
        ];
        
        // 尝试从多个字段获取标题
        let paperTitle = item.title || item.name || item.paper_name || item.filename || item.file_name;
        
        // 如果没有标题，尝试从 oss_key 或 fileUrl 中提取文件名
        if (!paperTitle && (item.oss_key || item.fileUrl)) {
          const path = item.oss_key || item.fileUrl;
          const fileName = path.split('/').pop(); // 获取路径最后一部分
          if (fileName) {
            // 移除时间戳前缀（如 20260310153710467633_）
            paperTitle = fileName.replace(/^\d+_/, '').replace(/\.[^/.]+$/, '');
          }
        }
        
        // 如果还是没有，使用默认标题
        if (!paperTitle) {
          paperTitle = '无标题论文';
        }
        
        return {
          id: item.id || '',
          title: paperTitle,
          fileName: item.filename || item.file_name || item.name || item.oss_key || paperTitle,
          oss_key: item.oss_key || '',
          pdf_oss_key: item.pdf_oss_key || '',
          version: String(item.version || item.latest_version || '1.0').replace(/^v/i, ''),
          teacher: item.teacher || (item.teacher_id ? `教师ID: ${item.teacher_id}` : '未分配指导教师'),
          _rawTeacherId: item.teacher_id || null, // 保留原始数字teacher_id，用于后续查询工号
          status: status, // 使用标准化后的状态值（小写），确保后续判断一致
          statusText: statusText,
          updateTime: item.updateTime || item.updated_at || item.created_at || '暂无更新时间',
          fileUrl: item.fileUrl || item.oss_key || item.file_url || '',
          statusHistory: statusHistory
        };
      });
    },
    /**
     * 从 oss_key 构建静态文件 URL
     */
    getFileUrl(ossKey) {
      if (!ossKey) return '';
      const filename = ossKey.split('/').pop();
      // 修复路径：使用正确的 /doc/essay/ 路径
      const { config } = require('../../api/config.js');
      return `${config.baseURL}/doc/essay/${filename}`;
    },

    /**
     * 预览论文 - 使用 WordPreview 组件
     */
    async viewPaper(paper) {
      console.log('[viewPaper] 开始预览论文:', paper);

      if (!paper.id) {
        uni.showToast({title: '论文信息不完整', icon: "none", duration:1500});
        return;
      }

      // 检查论文是否为本地模拟数据（没有oss_key的是模拟数据）
      const hasRealFile = paper.oss_key;
      console.log('[viewPaper] 是否有真实文件:', hasRealFile, 'oss_key:', paper.oss_key);
      
      if (!hasRealFile) {
        uni.showModal({
          title: '提示',
          content: '该论文为演示数据，无法预览。请先上传真实论文文件。',
          showCancel: false,
          confirmText: '知道了'
        });
        return;
      }

      // 预览优先使用 PDF 版本
      console.log('[viewPaper] pdf_oss_key:', paper.pdf_oss_key);
      if (!paper.pdf_oss_key) {
        uni.showModal({
          title: '提示',
          content: '该论文暂无 PDF 版本，是否下载 Word 版本查看？',
          confirmText: '下载',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) this.downloadPaper(paper);
          }
        });
        return;
      }

      const fileUrl = this.getFileUrl(paper.pdf_oss_key);
      console.log('[viewPaper] 预览PDF URL:', fileUrl);

      // #ifdef H5
      window.open(fileUrl, '_blank');
      // #endif
      // #ifndef H5
      uni.downloadFile({
        url: fileUrl,
        success: (res) => {
          if (res.statusCode === 200) {
            uni.openDocument({filePath: res.tempFilePath, showMenu: true});
          }
        }
      });
      // #endif
    },
    
    /**
     * 关闭 Word 预览
     */
    closeWordPreview() {
      this.showWordPreview = false;
      this.previewFileUrl = '';
      this.previewTitle = '';
      this.previewPaper = null;
    },
    
    /**
     * 处理预览中的下载请求
     */
    handlePreviewDownload({ url, title }) {
      // 保存当前论文引用
      const paper = this.previewPaper;
      
      // 先关闭预览组件，避免遮挡下载确认对话框
      this.showWordPreview = false;
      
      // 延迟执行下载，等待预览组件完全关闭
      setTimeout(() => {
        if (paper) {
          this.downloadPaper(paper);
        }
        // 清理预览数据
        this.previewFileUrl = '';
        this.previewTitle = '';
        this.previewPaper = null;
      }, 300);
    },
    
    /**
     * 处理预览错误
     */
    handlePreviewError({ error, message, url }) {
      console.log('预览错误:', message);
      
      // 如果预览失败，提示用户下载查看
      uni.showModal({
        title: '预览提示',
        content: message || '文档预览失败，是否下载查看？',
        confirmText: '下载查看',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm && this.previewPaper) {
            this.downloadPaper(this.previewPaper);
          }
        }
      });
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
    },
    
    // 处理确认弹窗取消
    handleConfirmModalCancel() {
      this.showConfirmModal = false;
      if (this.confirmModalCallback) {
        this.confirmModalCallback(false);
      }
    },
    
    async downloadPaper(paper) {
      console.log('[downloadPaper] 开始下载论文:', paper);
      
      if (!paper.id) {
        uni.showToast({title: '论文信息不完整', icon: "none"});
        return;
      }

      if (!paper.oss_key) {
        console.log('[downloadPaper] 论文没有oss_key，是演示数据');
        this.showConfirm('提示', '该论文为演示数据，无法下载。请先上传真实论文文件。', (confirmed) => {
          // 只是提示，不需要处理确认结果
        });
        return;
      }

      // 下载使用 Word (docx) 版本
      const fileUrl = this.getFileUrl(paper.oss_key);
      const downloadName = `${paper.title || '论文'}.docx`;
      
      console.log('[downloadPaper] 下载URL:', fileUrl, '文件名:', downloadName);

      this.showConfirm('下载确认', `即将下载论文《${paper.title}》，是否继续？`, async (confirmed) => {
        if (!confirmed) {
          console.log('[downloadPaper] 用户取消下载');
          return;
        }

        uni.showLoading({title: '下载中...', mask: true});

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
          uni.showToast({title: '下载完成', icon: "success"});
        } catch (error) {
          console.error('[downloadPaper] 下载失败:', error);
          uni.showToast({title: '下载失败', icon: "none"});
        } finally {
          uni.hideLoading();
        }
        // #endif

        // #ifndef H5
        uni.downloadFile({
          url: fileUrl,
          success: (downloadRes) => {
            if (downloadRes.statusCode === 200) {
              uni.saveFile({
                tempFilePath: downloadRes.tempFilePath,
                success: () => uni.showToast({title: '文件已保存', icon: "success"}),
                fail: () => uni.showToast({title: '保存失败', icon: "none"})
              });
            } else {
              uni.showToast({title: '下载失败', icon: "none"});
            }
            uni.hideLoading();
          },
          fail: () => {
            uni.showToast({title: '下载失败', icon: "none"});
            uni.hideLoading();
          }
        });
        // #endif
      });
    },
    
    // 删除论文关联的附件
    async deletePaperAttachments(paperId) {
      try {
        // 获取该论文的附件列表
        const { getAttachmentList, deleteAttachment } = await import('../../api/student.js');
        const res = await getAttachmentList(paperId);
        
        // 解析附件列表
        let attachments = [];
        if (res && res.code === 200 && Array.isArray(res.data)) {
          attachments = res.data;
        } else if (Array.isArray(res)) {
          attachments = res;
        }
        
        if (attachments.length === 0) {
          console.log(`论文 ${paperId} 没有关联附件`);
          return;
        }
        
        console.log(`论文 ${paperId} 关联 ${attachments.length} 个附件，开始删除...`);
        
        // 并行删除所有附件
        const deletePromises = attachments.map(attachment => {
          const attachmentId = attachment.id || attachment.material_id;
          if (attachmentId) {
            return deleteAttachment(attachmentId).catch(err => {
              console.error(`删除附件 ${attachmentId} 失败:`, err);
              // 单个附件删除失败不影响整体流程
              return null;
            });
          }
          return Promise.resolve(null);
        });
        
        await Promise.all(deletePromises);
        console.log(`论文 ${paperId} 的附件删除完成`);
      } catch (error) {
        console.error(`获取论文 ${paperId} 附件列表失败:`, error);
        // 获取附件列表失败不阻止论文删除
      }
    },
    
    deletePaper(paperId, paperTitle) {
      this.showConfirm('确认删除', `确定要删除论文《${paperTitle}》吗？`, async (confirmed) => {
        if (confirmed) {
          try {
            // 先获取该论文的附件列表并删除
            await this.deletePaperAttachments(paperId);
            
            // 调用后端 API 删除论文
            await deletePaper(paperId);
            
            // 从本地存储中删除
            const userInfo = uni.getStorageSync('userInfo') || {};
            const numericUserId = parseInt(userInfo.sub || 0, 10);
            const savedPapers = uni.getStorageSync(`studentPapers_${numericUserId}`);
            if (savedPapers && Array.isArray(savedPapers)) {
              const updatedPapers = savedPapers.filter(paper => paper.id !== paperId);
              uni.setStorageSync(`studentPapers_${numericUserId}`, updatedPapers);
            }
            
            // 从列表中移除
            this.paperList = this.paperList.filter(paper => paper.id !== paperId);
            uni.showToast({title: '删除成功', icon: "success"});
          } catch (error) {
            console.error('删除论文失败:', error);
            uni.showToast({title: '删除失败：' + (error.message || '未知错误'), icon: "none"});
          }
        }
      });
    },
    
    // 查看批注 - 跳转到论文预览页面并显示批注定位
    async viewAnnotations(paper) {
      uni.showLoading({title: '加载批注中...'});

      try {
        // 先获取批注数据
        const res = await getAnnotationsByPaperId(paper.id);
        uni.hideLoading();

        let annotations = [];
        if (res && Array.isArray(res)) {
          annotations = res.map(item => {
            const parsed = this.parseAnnotationContent(item.content);
            return {
              id: item.id,
              source: item.author_id === 1 ? 'teacher' : 'AI',
              content: parsed,
              rawContent: item.content,
              time: this.formatTime(item.created_at),
              coordinates: item.coordinates,
              paragraphId: item.paragraph_id,
              authorId: item.author_id,
              created_at: item.created_at,
              processed: false
            };
          });
        }

        if (annotations.length === 0) {
          uni.showToast({title: '暂无批注', icon: 'none'});
          return;
        }

        // 将批注数据存储到全局，供 paperPreview 使用
        const app = getApp();
        app.globalData.previewAnnotations = annotations;
        
        // 跳转到论文预览页面
        const url = `/pages/student/paperPreview?id=${paper.id}&title=${encodeURIComponent(paper.title || '论文预览')}&showAnnotations=true`;
        console.log('[跳转] 目标URL:', url);
        uni.navigateTo({
          url: url,
          fail: (err) => {
            console.error('[跳转失败]', err);
            uni.showToast({ title: '页面跳转失败', icon: 'none' });
          }
        });
      } catch (error) {
        uni.hideLoading();
        console.error('获取批注失败:', error);
        uni.showToast({title: '获取批注失败', icon: 'none'});
      }
    },

    // 解析批注内容
    parseAnnotationContent(content) {
      if (!content) return { selected: '', annotation: '', suggestion: '' };
          
      // 提取各部分
      const selectedMatch = content.match(/\u9009\u4e2d\u5185\u5bb9：([\s\S]*?)(?=\u6279\u6ce8：|$)/);
      const annotationMatch = content.match(/\u6279\u6ce8：([\s\S]*?)(?=\u5efa\u8bae：|$)/);
      const suggestionMatch = content.match(/\u5efa\u8bae：([\s\S]*)/);
          
      return {
        selected: selectedMatch ? selectedMatch[1].replace(/<[^>]+>/g, '').trim() : '',
        annotation: annotationMatch ? annotationMatch[1].replace(/<[^>]+>/g, '').trim() : '',
        suggestion: suggestionMatch ? suggestionMatch[1].replace(/<[^>]+>/g, '').trim() : ''
      };
    },

    // 格式化时间
    formatTime(isoTime) {
      if (!isoTime) return '';
      const date = new Date(isoTime);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    // 关闭批注模态框
    closeAnnotationModal() {
      this.showAnnotationModal = false;
      this.currentPaper = null;
      this.annotations = [];
    },
    
    
    // 切换论文卡片折叠状态
    toggleCollapse(paperId, event) {
      if (event) {
        event.stopPropagation();
        event.preventDefault();
      }
      this.$set(this.collapsedPapers, paperId, !this.collapsedPapers[paperId]);
      // 保存折叠状态到本地存储
      this.saveCollapseState();
    },
    
    // 检查论文是否已折叠
    isCollapsed(paperId) {
      return !!this.collapsedPapers[paperId];
    },
    
    // 保存折叠状态到本地存储
    saveCollapseState() {
      try {
        uni.setStorageSync('paperListCollapsedState', this.collapsedPapers);
      } catch (error) {
        console.error('保存折叠状态失败:', error);
      }
    },
    
    // 从本地存储加载折叠状态
    loadCollapseState() {
      try {
        const savedState = uni.getStorageSync('paperListCollapsedState');
        if (savedState && typeof savedState === 'object') {
          this.collapsedPapers = savedState;
        }
      } catch (error) {
        console.error('加载折叠状态失败:', error);
      }
    }
  }
};
</script>

<style scoped>
/* ==================== CSS变量定义 - 与工作台保持一致 ==================== */
.paper-list-page {
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

/* 优化滚动性能 */
.paper-list-page {
  min-height: 100vh;
  background: var(--surface);
  font-family: var(--font-body);
  -webkit-overflow-scrolling: touch;
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}

/* 页面淡出动画 */
.paper-list-page.page-fade-out {
  opacity: 0;
  transform: scale(0.98);
}

/* 启用GPU加速 */
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
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
    transform: translateY(0) scale(1);
  }
}

/* ==================== 列表重新排序动画 ==================== */
.paper-list-move {
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.paper-list-enter-active,
.paper-list-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.paper-list-enter {
  opacity: 0;
  transform: translateY(15rpx) scale(0.97);
}

.paper-list-leave-to {
  opacity: 0;
  transform: translateX(-15rpx);
}

/* 顶部标题栏 - 已移除，使用原生导航栏 */

/* 导航栏 */
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 90rpx;
  background: var(--surface-bright);
  border-bottom: 1px solid var(--surface-container-high);
  display: flex;
  align-items: center;
  padding: 0 40rpx;
  box-shadow: var(--shadow);
  z-index: 99;
  overflow-x: auto;
  white-space: nowrap;
  box-sizing: border-box;
}

.nav-bar .nav-item {
  display: inline-flex;
  align-items: center;
  padding: 18rpx 30rpx;
  margin-right: 25rpx;
  border-radius: var(--radius-full);
  color: var(--on-surface-variant);
  font-size: 28rpx;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  white-space: nowrap;
  position: relative;
  background-color: var(--surface-container-low);
}

.nav-bar .nav-item:hover {
  background-color: var(--primary-fixed);
  color: var(--primary);
  transform: translateY(-2rpx);
  box-shadow: var(--shadow-sm);
}

.nav-bar .nav-item.active {
  background-color: var(--primary);
  color: #fff;
  box-shadow: var(--shadow-primary);
}

.nav-bar .nav-text {
  margin-right: 10rpx;
}

.nav-bar .nav-count {
  background-color: var(--primary);
  color: #fff;
  padding: 5rpx 15rpx;
  border-radius: var(--radius-full);
  font-size: 22rpx;
  font-weight: bold;
  min-width: 40rpx;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.nav-bar .nav-item.active .nav-count {
  background-color: #fff;
  color: var(--primary);
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
  height: 100vh;
  background: var(--surface);
  width: 100%;
  max-width: none;
  justify-content: flex-start;
  gap: 24rpx;
  padding: 64px 24rpx 0 280px;
  box-sizing: border-box;
  overflow: hidden;
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
}

.stats-panel {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
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

/* ==================== 激活状态过渡优化 ==================== */
.stat-item.active {
  background: var(--primary);
  box-shadow: var(--shadow-primary);
  animation: activePulse 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes activePulse {
  0% { transform: scale(0.95); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

.stat-item.active .stat-value {
  animation: countUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes countUp {
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}

.stat-item.active::before {
  background: #ffffff;
}

.stat-item.active .stat-icon {
  background-color: rgba(255, 255, 255, 0.3);
  color: #ffffff;
}

.stat-item.active .stat-label {
  color: #ffffff;
}

.stat-item.active .stat-value {
  color: #ffffff;
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

.stat-item.active:hover .stat-icon {
  transform: scale(1.1);
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5rpx;
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
  box-sizing: border-box;
  min-height: 0;
}

.content-wrapper {
  max-width: none;
  margin: 0;
  width: 100%;
}

/* 加载中样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  background: var(--surface-bright);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow);
}

/* ==================== 加载动画优化 ==================== */
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
  animation: pulse-ring 1.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

.loading-spinner::before {
  width: 100%;
  height: 100%;
  background: var(--primary);
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

/* 备用旋转加载动画 */
.loading-spinner-fallback {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #f0f0f0;
  border-top-color: #1890ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

.loading-text {
  font-size: 28rpx;
  color: var(--on-surface-variant);
}

/* 论文列表 */
.paper-list {
  display: flex;
  flex-direction: column;
  gap: 25rpx;
  position: relative;
}

/* ==================== 排序过渡动画 ==================== */
.paper-list-move {
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.paper-list-enter-active {
  transition: all 0.4s ease-out;
}

.paper-list-leave-active {
  transition: all 0.3s ease-in;
  position: absolute;
}

.paper-list-enter {
  opacity: 0;
  transform: translateY(30rpx);
}

.paper-list-leave-to {
  opacity: 0;
  transform: translateY(-30rpx);
}

/* ==================== 论文卡片样式 ==================== */
.paper-card {
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

.paper-card:hover {
  transform: translateY(-6rpx) scale(1.01);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-fixed);
}

.paper-card:active {
  transform: translateY(-2rpx) scale(0.99);
  transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}

/* 高亮样式（从工作台跳转过来） */
.paper-card.highlighted {
  border: 2px solid var(--primary);
  box-shadow: 0 0 20px rgba(0, 91, 191, 0.4), var(--shadow-lg);
  animation: highlightPulse 2s ease-in-out;
}

@keyframes highlightPulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(0, 91, 191, 0.4), var(--shadow-lg);
  }
  50% {
    box-shadow: 0 0 30px rgba(0, 91, 191, 0.6), var(--shadow-lg);
  }
}

/* 论文头部 */
.paper-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 25rpx;
  padding-bottom: 25rpx;
  border-bottom: 1px solid var(--surface-container-high);
}

/* 头部右侧区域（获取状态按钮+折叠按钮） */
.header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12rpx;
  flex-shrink: 0;
}

/* ==================== 折叠按钮动画优化 ==================== */
.collapse-btn {
  width: calc(50% - 12rpx);
  min-width: 60rpx;
  height: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-fixed);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: 
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    background 0.3s ease;
  border: 1px solid var(--primary-fixed);
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
  z-index: 10;
  pointer-events: auto;
}

.collapse-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: var(--primary-fixed);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1), height 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.collapse-btn:active::before {
  width: 100rpx;
  height: 100rpx;
}

.collapse-btn:hover {
  background: var(--surface-container-low);
  transform: scale(1.15);
  box-shadow: var(--shadow-primary);
}

.collapse-btn:active {
  transform: scale(0.92);
  transition: transform 0.1s cubic-bezier(0.16, 1, 0.3, 1);
}

/* ==================== 折叠图标动画优化 ==================== */
.collapse-icon {
  font-size: 20rpx;
  color: var(--primary);
  transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  display: block;
  font-family: 'Material Symbols Outlined', sans-serif;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
}

.collapse-icon.collapsed {
  transform: rotate(-180deg);
}

/* ==================== 内容折叠动画优化 ==================== */
.paper-content-wrapper {
  overflow: hidden;
  transition: 
    max-height 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  max-height: 2000rpx;
  opacity: 1;
  transform: translateY(0);
}

.paper-content-wrapper.collapsed {
  max-height: 0;
  opacity: 0;
  margin: 0;
  padding: 0;
  transform: translateY(-10rpx);
}

/* ==================== 获取状态按钮动画优化 ==================== */
.refresh-status-btn {
  height: 56rpx;
  padding: 0 24rpx;
  border-radius: var(--radius-full);
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: var(--shadow-primary);
  margin-right: 16rpx;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.refresh-status-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1), height 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.refresh-status-btn:active::before {
  width: 200rpx;
  height: 200rpx;
}

.refresh-status-btn:hover {
  transform: translateY(-3rpx) scale(1.02);
  box-shadow: 0 8rpx 20rpx rgba(0, 91, 191, 0.4);
}

.refresh-status-btn:active {
  transform: translateY(0) scale(0.96);
  box-shadow: var(--shadow-primary);
  transition: all 0.1s cubic-bezier(0.16, 1, 0.3, 1);
}

.refresh-status-btn.loading {
  animation: btnPulse 1.5s ease-in-out infinite;
}

@keyframes btnPulse {
  0%, 100% { box-shadow: var(--shadow-primary); }
  50% { box-shadow: 0 4rpx 20rpx rgba(0, 91, 191, 0.5); }
}

.refresh-text {
  font-size: 24rpx;
  color: #ffffff;
  font-weight: 500;
  white-space: nowrap;
}

/* 折叠状态的卡片样式 */
.paper-card.collapsed {
  padding-bottom: 25rpx;
}

.paper-card.collapsed .paper-header {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.paper-info {
  flex: 1;
  min-width: 0;
}

.paper-title {
  font-size: 34rpx;
  font-weight: 700;
  color: var(--on-surface);
  display: block;
  margin-bottom: 12rpx;
  line-height: 1.4;
}

.paper-preview-hint {
  font-size: 24rpx;
  font-weight: 400;
  color: var(--primary);
  margin-left: 8rpx;
  opacity: 0.8;
}

.paper-meta {
  font-size: 26rpx;
  color: var(--on-surface-variant);
  display: block;
}

/* 状态徽章 - 统一蓝色 */
.status-badge {
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

/* 论文内容 */
.paper-content {
  margin-bottom: 25rpx;
}

.paper-detail {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.detail-label {
  font-size: 26rpx;
  color: var(--on-surface-variant);
  margin-right: 10rpx;
}

.detail-value {
  font-size: 26rpx;
  color: var(--on-surface);
}

/* 进度条 */
.progress-section {
  margin-bottom: 25rpx;
  padding: 20rpx;
  background-color: var(--surface-container-low);
  border-radius: var(--radius-md);
}

.progress-track {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}

.step-circle {
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  background-color: var(--surface-container-high);
  color: var(--on-surface-variant);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  transition: all 0.3s;
  border: 2rpx solid var(--surface-container-high);
}

.progress-step.active .step-circle,
.progress-step.completed .step-circle {
  background-color: var(--primary);
  color: #fff;
  border-color: var(--primary);
  box-shadow: var(--shadow-primary);
}

.step-text {
  font-size: 20rpx;
  color: var(--on-surface-variant);
  text-align: center;
  transition: all 0.3s;
}

.progress-step.active .step-text,
.progress-step.completed .step-text {
  color: var(--primary);
  font-weight: 500;
}

.progress-line {
  flex: 1;
  height: 3rpx;
  background-color: var(--surface-container-high);
  margin: 0 10rpx;
  margin-bottom: 35rpx;
  transition: all 0.3s;
}

.progress-line.active {
  background-color: var(--primary);
}

/* 状态进度条动画效果 */
.step-circle {
  position: relative;
  overflow: visible;
}

.step-number {
  position: relative;
  z-index: 2;
}

/* 连接线流动动画 */
.progress-line {
  position: relative;
  overflow: hidden;
}

.line-flow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  animation: flow-move 2s linear infinite;
}

@keyframes flow-move {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* 通知区域 - 统一蓝色 */
.notice-section {
  background-color: #e6f7ff;
  border-radius: 12rpx;
  padding: 20rpx;
  border: 1px solid #91d5ff;
}

.notice-header {
  margin-bottom: 15rpx;
}

.notice-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #1890ff;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.notice-item {
  background-color: #fff;
  border-radius: 8rpx;
  padding: 15rpx;
  border-left: 4rpx solid #1890ff;
}

.notice-time {
  font-size: 22rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.notice-content {
  font-size: 26rpx;
  color: #333;
  line-height: 1.5;
}

/* 操作按钮 - 统一蓝色 */
.paper-actions {
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

/* 更新按钮禁用状态 - 变灰不可用 */
.action-btn.update-btn.disabled {
  background-color: var(--surface-container-low);
  color: var(--on-surface-variant);
  border-color: var(--surface-container-high);
  cursor: not-allowed;
  opacity: 0.7;
}

.action-btn.update-btn.disabled:hover {
  background-color: var(--surface-container-low);
  color: var(--on-surface-variant);
  border-color: var(--surface-container-high);
  transform: none;
  box-shadow: none;
}

/* 查看审阅按钮样式 */
.action-btn.review-btn {
  background-color: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.action-btn.review-btn:hover {
  background-color: #52c41a;
  color: #fff;
  border-color: #52c41a;
}

/* 查看审阅按钮禁用状态 */
.action-btn.review-btn.disabled {
  background-color: var(--surface-container-low);
  color: var(--on-surface-variant);
  border-color: var(--surface-container-high);
  cursor: not-allowed;
  opacity: 0.7;
}

.action-btn.review-btn.disabled:hover {
  background-color: var(--surface-container-low);
  color: var(--on-surface-variant);
  border-color: var(--surface-container-high);
  transform: none;
  box-shadow: none;
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
  animation: emptyFloat 3s ease-in-out infinite;
  font-family: 'Material Symbols Outlined', sans-serif;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48;
}

@keyframes emptyFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10rpx); }
}

.empty-text {
  font-size: 32rpx;
  font-weight: bold;
  color: var(--on-surface);
  margin-bottom: 15rpx;
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
}

.empty-subtext {
  font-size: 26rpx;
  color: var(--on-surface-variant);
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ==================== 模态框动画优化 - 与工作台保持一致 ==================== */
/* 统一弹窗背景样式 */
.annotation-modal,
.update-modal,
.review-modal {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: rgba(0, 0, 0, 0.6) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 1000 !important;
}

@keyframes modalBackdropIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 统一弹窗内容样式 */
.annotation-modal-content,
.update-modal-content,
.review-modal-content {
  background: #ffffff !important;
  border-radius: 12px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
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

/* 批注弹窗特殊尺寸 */
.annotation-modal-content {
  width: 90%;
  max-width: 900px;
  height: 80vh;
}

/* 更新弹窗特殊尺寸 */
.update-modal-content {
  width: 90%;
  max-width: 400px;
}

/* 审阅弹窗特殊尺寸 */
.review-modal-content {
  width: 90%;
  max-width: 500px;
}

/* 统一弹窗头部样式 - 与页面顶部标题栏一致 */
.annotation-modal-header,
.update-modal-header,
.review-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 24px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-radius: 12px 12px 0 0;
  flex-shrink: 0;
  box-sizing: border-box;
}

.annotation-header-left,
.annotation-header-right {
  display: flex;
  align-items: center;
  min-width: 40px;
}

.annotation-header-right {
  justify-content: flex-end;
}

/* 统一弹窗标题样式 - 与页面顶部标题栏一致 */
.annotation-modal-title,
.update-modal-title,
.review-modal-title {
  font-size: 16px;
  font-weight: 800;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #005bbf;
  line-height: 1.2;
  letter-spacing: -0.01em;
  text-align: center;
  flex: 1;
}

/* 统一关闭按钮样式 - 与页面风格一致 */
.annotation-modal-close,
.update-modal-close,
.review-modal-close {
  font-size: 20px;
  color: #5f6368;
  cursor: pointer;
  padding: 8px;
  transition: color 0.2s;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: transparent;
}

.annotation-modal-close:hover,
.update-modal-close:hover,
.review-modal-close:hover {
  color: #191c1d;
  background: #f3f4f5;
}

/* 统一弹窗主体样式 */
.annotation-modal-body,
.update-modal-body,
.review-modal-body {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
  background: #ffffff;
}

.annotation-paper-info {
  background: #f3f4f5;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border-left: 3px solid #005bbf;
}

.annotation-paper-title {
  font-size: 1rem;
  font-weight: 600;
  color: #191c1d;
  display: block;
  margin-bottom: 8px;
}

.annotation-paper-meta {
  font-size: 0.875rem;
  color: #5f6368;
  display: block;
}

.annotation-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: calc(80vh - 200px);
  overflow-y: auto;
}

.annotation-item {
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  transition: all 0.3s;
}

.annotation-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.annotation-item.processed {
  border-left: 3px solid #38a169;
  background: linear-gradient(135deg, #f0fff4 0%, #ffffff 100%);
}

.annotation-item.unprocessed {
  border-left: 3px solid #005bbf;
  background: linear-gradient(135deg, #e8f4fd 0%, #ffffff 100%);
}

.annotation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.annotation-source {
  display: flex;
  align-items: center;
  gap: 8px;
}

.source-icon {
  font-size: 1.25rem;
  font-family: 'Material Symbols Outlined', sans-serif;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.source-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #191c1d;
}

.annotation-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.annotation-status.status-processed {
  background: #f0fff4;
  color: #1c4532;
}

.annotation-status.status-unprocessed {
  background: #e8f4fd;
  color: #1a3c6e;
}

/* 批注分区样式 */
.annotation-section {
  margin-bottom: 12px;
}

.annotation-section:last-of-type {
  margin-bottom: 0;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #5f6368;
  margin-bottom: 8px;
  padding-left: 8px;
  border-left: 2px solid #005bbf;
}

.section-content {
  font-size: 0.875rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  padding: 12px;
  border-radius: 8px;
  background: #f3f4f5;
  max-height: 120px;
  overflow-y: auto;
  word-break: break-all;
}

.selected-content {
  color: #191c1d;
  background: #e8f4fd;
}

.annotation-content-text {
  color: #191c1d;
  background: #fffbeb;
}

.suggestion-content {
  color: #1c4532;
  background: #f0fff4;
}

.annotation-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.annotation-time {
  font-size: 0.75rem;
  color: #5f6368;
}

.annotation-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
}

.annotation-empty .empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
  font-family: 'Material Symbols Outlined', sans-serif;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48;
}

.annotation-empty .empty-text {
  font-size: 1rem;
  font-weight: 500;
  color: #191c1d;
  margin-bottom: 8px;
}

.annotation-empty .empty-subtext {
  font-size: 0.875rem;
  color: #5f6368;
}

/* ========== 审阅详情弹窗样式 - 与工作台保持一致 ========== */
.review-modal {
  z-index: 1000;
}

/* review-modal-content、header、title、close、body 已在统一样式中定义 */

.review-paper-info {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.review-paper-title {
  font-size: 1rem;
  font-weight: 600;
  color: #191c1d;
  display: block;
  margin-bottom: 8px;
}

.review-paper-meta {
  font-size: 0.875rem;
  color: #5f6368;
  display: block;
}

.review-content-section {
  margin-bottom: 16px;
}

.review-section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #005bbf;
  margin-bottom: 12px;
  padding-left: 12px;
  border-left: 3px solid #005bbf;
}

.review-content-text {
  font-size: 0.875rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #191c1d;
  line-height: 1.8;
  padding: 16px;
  background: #f3f4f5;
  border-radius: 8px;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 40vh;
  overflow-y: auto;
}

.review-time-section {
  display: flex;
  align-items: center;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.review-time-label {
  font-size: 0.875rem;
  color: #5f6368;
  margin-right: 8px;
}

.review-time-value {
  font-size: 0.875rem;
  color: #191c1d;
  font-weight: 500;
}

.review-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-8) var(--spacing-4);
  text-align: center;
}

.review-empty .empty-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-4);
  opacity: 0.5;
  font-family: 'Material Symbols Outlined', sans-serif;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48;
}

.review-empty .empty-text {
  font-size: 1rem;
  font-weight: 500;
  color: var(--on-surface);
}

/* ========== 更新论文弹窗样式 - 与工作台保持一致 ========== */
.update-modal {
  z-index: 1000;
}

.update-paper-info {
  background: #f3f4f5;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.update-paper-title {
  font-size: 1rem;
  font-weight: 600;
  color: #191c1d;
  display: block;
  margin-bottom: 8px;
}

.update-paper-current-version {
  font-size: 0.875rem;
  color: #5f6368;
}

.update-modal-tips {
  background: #e8f4fd;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
}

.update-modal-tips text {
  display: block;
  font-size: 0.875rem;
  color: #1a3c6e;
  line-height: 1.6;
}

.version-input-section {
  margin-bottom: 16px;
}

.input-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #191c1d;
  margin-bottom: 8px;
}

.version-input {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 8px;
  padding: 0 16px;
  font-size: 0.875rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #191c1d;
  background: #f3f4f5;
  box-sizing: border-box;
  transition: all 0.2s;
}

.version-input:focus {
  background: #e5e7eb;
  outline: none;
}

.version-hint {
  display: block;
  font-size: 0.75rem;
  color: #5f6368;
  margin-top: 8px;
}

.update-modal-btn {
  width: 100%;
  height: 44px;
  background: #f3f4f5;
  border: 2rpx dashed #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #191c1d;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.update-modal-btn:active {
  background: #e5e7eb;
}

.update-modal-file-info {
  background: #e8f4fd;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
}

.update-modal-file-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1a3c6e;
  display: block;
  margin-bottom: 4px;
  word-break: break-all;
}

.update-modal-file-size {
  font-size: 0.75rem;
  color: #1a3c6e;
  opacity: 0.7;
}

.update-modal-submit-btn {
  width: 100%;
  height: 44px;
  background: #005bbf;
  border-radius: 8px;
  font-size: 0.875rem;
  color: white;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.update-modal-submit-btn:disabled {
  background: #e5e7eb;
  color: #5f6368;
  cursor: not-allowed;
}

.update-modal-submit-btn:not(:disabled):active {
  opacity: 0.9;
}

/* 弹窗样式 */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
}

.modal-content {
  background: #ffffff;
  border-radius: 24rpx;
  width: 600rpx;
  max-width: 90vw;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #e8e8e8;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.modal-body {
  padding: 40rpx;
}

.modal-loading-text {
  font-size: 28rpx;
  color: #666;
  text-align: center;
  display: block;
  margin-top: 20rpx;
}

/* ==================== 响应式设计 ==================== */

/* 大屏幕 (>1400px) */
@media screen and (min-width: 1400px) {
  .main-layout {
    padding-left: 280px;
  }
  
  .sidebar {
    width: 280px;
  }
  
  .paper-card {
    padding: 32rpx;
  }
}

/* 中等屏幕 (992px-1399px) */
@media screen and (max-width: 1399px) and (min-width: 992px) {
  .main-layout {
    padding-left: 240px;
  }
  
  .sidebar {
    width: 240px;
  }
  
  .paper-card {
    padding: 28rpx;
  }
}

/* 平板屏幕 (768px-991px) */
@media screen and (max-width: 991px) and (min-width: 768px) {
  .main-layout {
    padding-left: 200px;
    padding-right: 16rpx;
  }
  
  .sidebar {
    width: 200px;
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
  
  .paper-card {
    padding: 24rpx;
  }
  
  .paper-title {
    font-size: 30rpx;
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
  
  /* 论文卡片 */
  .paper-card {
    padding: 20rpx;
    margin-bottom: 16rpx;
  }
  
  .paper-header {
    flex-direction: column;
    gap: 16rpx;
  }
  
  .paper-title-section {
    width: 100%;
  }
  
  .paper-title {
    font-size: 28rpx;
    line-height: 1.4;
  }
  
  .paper-meta {
    flex-wrap: wrap;
    gap: 12rpx;
  }
  
  .header-right {
    width: 100%;
    justify-content: flex-end;
  }
  
  /* 卡片内容 */
  .paper-content-wrapper {
    padding: 16rpx 0;
  }
  
  .paper-actions {
    flex-wrap: wrap;
    gap: 12rpx;
  }
  
  .action-btn {
    flex: 1;
    min-width: 120rpx;
    padding: 16rpx 20rpx;
    font-size: 24rpx;
  }
  
  /* 弹窗适配 */
  .annotation-modal-content {
    width: 95%;
    max-width: 95%;
    height: 85vh;
  }
  
  .update-modal-content,
  .review-modal-content {
    width: 90%;
    max-width: 90%;
  }
  
  .annotation-modal-header,
  .update-modal-header,
  .review-modal-header {
    height: 56px;
    padding: 0 16rpx;
  }
  
  .annotation-modal-title,
  .update-modal-title,
  .review-modal-title {
    font-size: 15px;
  }
  
  /* 空状态 */
  .empty-container {
    padding: 80rpx 40rpx;
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
}

/* 超小屏幕 (<480px) */
@media screen and (max-width: 479px) {
  .sidebar {
    max-height: 180px;
    padding: 12rpx;
  }
  
  .main-layout {
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
  
  .paper-card {
    padding: 16rpx;
  }
  
  .paper-title {
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
.sidebar,
.main-layout,
.paper-card,
.stat-item {
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
