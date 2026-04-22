<template>
  <view class="student-workbench-container page-enter" :class="{ 'page-fade-out': isPageFadeOut }">
    <!-- 侧边栏导航 -->
    <aside class="sidebar">
      <!-- 上传功能区 -->
      <view class="sidebar-upload-section">
        <button class="upload-btn primary" @click="importPaper">
          <text class="material-symbols-outlined">upload</text>
          <text>上传论文</text>
        </button>
        <button class="upload-btn secondary" @click="importAttachment">
          <text class="material-symbols-outlined">attach_file</text>
          <text>上传附件</text>
        </button>
      </view>

      <view class="sidebar-divider"></view>

      <nav class="sidebar-nav">
        <view class="nav-item active" @click="goToWorkbench">
          <text class="material-symbols-outlined">dashboard</text>
          <text class="nav-label">工作台</text>
        </view>
        <view class="nav-item" @click="goToAttachmentList">
          <text class="material-symbols-outlined">folder_open</text>
          <text class="nav-label">附件列表</text>
        </view>
      </nav>

      <view class="sidebar-divider"></view>

      <!-- 系统公告（移到个人中心下方） -->
      <view class="sidebar-notice-section">
        <view class="sidebar-notice-header">
          <text class="material-symbols-outlined">notifications</text>
          <text class="sidebar-notice-title">系统公告</text>
          <text class="sidebar-notice-more" @click="showMoreNotice" v-if="regularNotices.length > 0">更多</text>
        </view>
        <view class="sidebar-notice-list" v-if="regularNotices.length > 0">
          <view v-for="(item, index) in regularNotices.slice(0, 3)" :key="item.id || index"
                class="sidebar-notice-item" :class="{ 'urgent': item.urgent }" 
                @click="viewNoticeDetail(item)">
            <view class="sidebar-notice-dot" :class="{ 'urgent': item.urgent }"></view>
            <text class="sidebar-notice-content">{{ item.title || item.content }}</text>
          </view>
        </view>
        <view class="sidebar-no-notice" v-else>
          <text>暂无公告</text>
        </view>
      </view>

      <!-- 截止时间通知（在系统公告下方） -->
      <view class="sidebar-deadline-section" :class="{ 'has-data': deadlineNotices.length > 0 }">
        <view class="sidebar-notice-header">
          <text class="material-symbols-outlined">schedule</text>
          <text class="sidebar-notice-title">截止时间</text>
          <text class="sidebar-notice-more" @click="showMoreNotice" v-if="deadlineNotices.length > 0">更多</text>
        </view>
        <view class="sidebar-notice-list" v-if="deadlineNotices.length > 0">
          <view v-for="(item, index) in deadlineNotices.slice(0, 3)" :key="item.id || index" 
                class="sidebar-notice-item deadline" 
                @click="viewNoticeDetail(item)">
            <view class="sidebar-notice-dot deadline"></view>
            <text class="sidebar-notice-content">{{ item.title || item.content }}</text>
          </view>
        </view>
        <view class="sidebar-no-deadline" v-else>
          <text class="no-deadline-text">暂无截止时间通知</text>
        </view>
      </view>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 顶部标题栏 -->
      <header class="top-header">
        <view class="header-left">
          <view class="header-brand">
            <view class="header-brand-icon">
              <text class="material-symbols-outlined">school</text>
            </view>
            <view class="header-brand-text">
              <text class="header-brand-title">学生工作台</text>
              <text class="header-brand-subtitle">论文管理系统</text>
            </view>
          </view>
        </view>
        <view class="header-right">
          <view class="notification-icon" @click="showMoreNotice">
            <text class="material-symbols-outlined">notifications</text>
            <view class="notification-dot" v-if="notices.length > 0"></view>
          </view>
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

      <!-- 内容画布 -->
      <view class="content-canvas">
        <!-- 统计信息卡片 -->
        <view class="stats-grid">
          <view class="stat-card">
            <text class="stat-icon material-symbols-outlined">analytics</text>
            <view class="stat-content">
              <text class="stat-value">{{ stats.totalPapers }}</text>
              <text class="stat-label">总论文数</text>
            </view>
          </view>
          <view class="stat-card">
            <text class="stat-icon material-symbols-outlined">pending</text>
            <view class="stat-content">
              <text class="stat-value pending">{{ stats.pendingReview }}</text>
              <text class="stat-label">待审阅</text>
            </view>
          </view>
          <view class="stat-card">
            <text class="stat-icon material-symbols-outlined">edit_note</text>
            <view class="stat-content">
              <text class="stat-value pending-revision">{{ stats.pendingRevision }}</text>
              <text class="stat-label">待修改</text>
            </view>
          </view>
          <view class="stat-card">
            <text class="stat-icon material-symbols-outlined">check_circle</text>
            <view class="stat-content">
              <text class="stat-value finalized">{{ stats.finalized }}</text>
              <text class="stat-label">已定稿</text>
            </view>
          </view>
        </view>

        <!-- 论文列表卡片 -->
        <view class="thesis-section">
          <view class="section-header">
            <text class="section-title">我的论文</text>
          </view>

          <view v-if="paperCardLoading" class="paper-card-loading-container">
            <view class="paper-card-loading-spinner"></view>
            <text class="paper-card-loading-text">正在加载论文数据...</text>
          </view>

          <transition-group
            v-else-if="paperCards.length > 0"
            name="paper-list"
            tag="view"
            class="paper-list workbench-paper-list single-card"
          >
            <view
              v-for="paper in paperCards"
              :key="paper.id"
              :id="'paper-' + paper.id"
              class="paper-card workbench-paper-card"
              @click="viewPaper(paper)"
            >
              <view class="paper-header">
                <view class="paper-info">
                  <text class="paper-title">{{ paper.title }}<text class="paper-preview-hint"> 点击预览 👁</text></text>
                  <text class="paper-meta">指导教师：{{ paper.teacher }} | 版本：v{{ paper.version }}</text>
                </view>
                <view class="paper-header-actions" @click.prevent.stop>
                  <view class="refresh-status-btn" @click.prevent.stop="fetchAllPaperStatus">
                    <text class="refresh-text">刷新</text>
                  </view>
                </view>
              </view>

              <view class="paper-content-wrapper">
                <view class="paper-content">
                  <view class="paper-detail">
                    <text class="detail-label">最后更新：</text>
                    <text class="detail-value">{{ paper.updateTime }}</text>
                  </view>

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

              <view class="paper-actions">
                <button class="action-btn annotation-btn" :class="{ 'disabled': !canViewAnnotations(paper) }" @click.stop="viewAnnotations(paper)">
                  <text class="btn-icon material-symbols-outlined">chat</text>
                  <text>查看批注</text>
                </button>
                <button class="action-btn review-btn" :class="{ 'disabled': !canViewReview(paper) }" @click.stop="viewReview(paper)">
                  <text class="btn-icon material-symbols-outlined">fact_check</text>
                  <text>查看审阅</text>
                </button>
                <button class="action-btn download-btn" @click.stop="downloadPaper(paper)">
                  <text class="btn-icon material-symbols-outlined">download</text>
                  <text>下载论文</text>
                </button>
                <button class="action-btn update-btn" :class="{ 'disabled': !canUpdatePaper(paper.status) }" @click.stop="handleUpdateClick(paper)">
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

          <view class="paper-card-empty-container" v-else>
            <text class="paper-card-empty-icon material-symbols-outlined">inbox</text>
            <text class="paper-card-empty-text">暂无论文数据</text>
            <text class="paper-card-empty-subtext">请先上传论文以查看列表</text>
          </view>

        </view>

      </view>
    </main>

    <!-- 弹窗组件（保持原状） -->
    <paper-detail-modal v-if="modal.detail" :paper="currentPaper" :zoom-level="preview.zoom" :scroll-left="preview.scrollLeft" :scroll-top="preview.scrollTop" @close="closeDetail" @zoom-in="zoomIn" @zoom-out="zoomOut" @document-scroll="onDocumentScroll" @mark-processed="markAsProcessed" @show-version-compare="showVersionCompare" />

    <view v-if="modal.upload" class="upload-modal-backdrop" @click.self="closeUpload">
      <view class="upload-modal-content">
        <view class="upload-modal-header">
          <text class="upload-modal-title">上传论文</text>
          <text class="upload-modal-close" @click="closeUpload">×</text>
        </view>
        <view class="upload-modal-body">
          <view class="upload-modal-tips">
            <text>支持格式：.docx（Word文档）</text>
            <text>文件大小：≤100MB</text>
          </view>
          <view class="teacher-inline-section">
            <text class="teacher-inline-label">指导教师：</text>
            <text v-if="upload.teacherLoading" class="teacher-inline-value teacher-loading">查询中...</text>
            <text v-else-if="upload.teacherUsername" class="teacher-inline-value">{{ upload.teacherUsername }}</text>
            <text v-else class="teacher-inline-value teacher-error">未找到，请联系管理员</text>
          </view>
          <button class="upload-modal-btn" @click="choosePaperFile">选择文件</button>
          <view v-if="upload.file" class="upload-modal-file-info">
            <text class="upload-modal-file-name">{{ upload.file.name }}</text>
            <text class="upload-modal-file-size">{{ formatFileSize(upload.file.size) }}</text>
          </view>
          <button class="upload-modal-submit-btn" :disabled="!upload.file || !upload.teacherId || upload.teacherLoading" @click="submitPaper">提交上传</button>
        </view>
      </view>
    </view>

    <view v-if="modal.attachment" class="upload-modal-backdrop" @click.self="closeAttachmentUpload">
      <view class="upload-modal-content">
        <view class="upload-modal-header">
          <text class="upload-modal-title">上传附件</text>
          <text class="upload-modal-close" @click="closeAttachmentUpload">×</text>
        </view>
        <view class="upload-modal-body">
          <view class="upload-modal-tips">
            <text class="tips-line">支持格式：.docx、.doc、.pdf</text>
            <text class="tips-line">文件大小：≤100MB</text>
          </view>
          <view class="teacher-inline-section attachment-paper-section">
            <text class="teacher-inline-label">关联论文：</text>
            <view class="attachment-paper-info">
              <text class="attachment-paper-title">{{ attachmentUpload.paperTitle || '当前论文' }}</text>
            </view>
          </view>
          <button class="upload-modal-btn" @click="chooseAttachmentFile">选择文件</button>
          <view v-if="attachmentUpload.file" class="upload-modal-file-info">
            <text class="upload-modal-file-name">{{ attachmentUpload.file.name }}</text>
            <text class="upload-modal-file-size">{{ formatFileSize(attachmentUpload.file.size) }}</text>
          </view>
          <button class="upload-modal-submit-btn" :disabled="!attachmentUpload.file || !attachmentUpload.paperId" @click="submitAttachment">提交</button>
        </view>
      </view>
    </view>

    <version-compare-modal v-if="modal.compare" :paper="currentPaper" :version1="versionCompare.v1" :version2="versionCompare.v2" :version1-label="versionCompare.label1" :version2-label="versionCompare.label2" @close="closeCompare" @version1-change="onVersion1Change" @version2-change="onVersion2Change" />

    <teacher-select-modal v-if="modal.teacherSelect" :teacher-name="upload.teacherName" :teacher-id="upload.teacherId" @close="cancelTeacherSelect" @confirm="onTeacherSelectConfirm" @teacher-name-change="upload.teacherName = $event" @teacher-id-change="upload.teacherId = $event" />

    <view
      v-if="showConfirmModal"
      class="paper-card-review-modal workbench-confirm-modal"
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

    <view class="paper-card-review-modal" v-if="showReviewModal" @click="closeReviewModal">
      <view class="paper-card-review-content" @click.stop>
        <view class="paper-card-modal-header">
          <text class="paper-card-modal-title">论文审阅详情</text>
          <text class="paper-card-modal-close material-symbols-outlined" @click="closeReviewModal">close</text>
        </view>
        <view class="paper-card-modal-body">
          <view class="paper-card-review-info" v-if="currentReview">
            <text class="paper-card-review-title">{{ currentReview.paperTitle }}</text>
            <text class="paper-card-review-meta">论文ID：{{ currentReview.paperId }}</text>
          </view>
          <view class="paper-card-review-section" v-if="currentReview">
            <view class="paper-card-review-section-title">审阅内容</view>
            <view class="paper-card-review-content-text">{{ currentReview.reviewContent }}</view>
          </view>
          <view class="paper-card-review-time" v-if="currentReview && currentReview.reviewTime">
            <text class="paper-card-review-time-label">审阅时间：</text>
            <text class="paper-card-review-time-value">{{ currentReview.reviewTime }}</text>
          </view>
          <view class="paper-card-review-empty" v-else>
            <text class="paper-card-empty-icon material-symbols-outlined">fact_check</text>
            <text class="paper-card-empty-text">暂无审阅内容</text>
          </view>
        </view>
      </view>
    </view>

    <view class="paper-card-update-modal" v-if="showUpdateModal" @click.self="closeUpdateModal">
      <view class="paper-card-update-content">
        <view class="paper-card-modal-header">
          <text class="paper-card-modal-title">更新论文</text>
          <text class="paper-card-modal-close" @click="closeUpdateModal">×</text>
        </view>
        <view class="paper-card-modal-body">
          <view class="paper-card-update-info" v-if="updatePaperItem">
            <text class="paper-card-update-title">{{ updatePaperItem.title }}</text>
            <text class="paper-card-update-version">当前版本：v{{ updatePaperItem.version }}</text>
          </view>
          <view class="paper-card-update-tips">
            <text>支持格式：docx（Word 文档）</text>
            <text>文件大小：≤100MB</text>
          </view>
          <view class="paper-card-version-section">
            <text class="paper-card-input-label">新版本号：</text>
            <input
              class="paper-card-version-input"
              v-model="updateVersion"
              type="text"
              placeholder="请输入新版本号（如 v2.0）"
            />
            <text class="paper-card-version-hint">必须大于当前版本 v{{ updatePaperItem?.version }}</text>
          </view>
          <button class="paper-card-file-btn" @click="chooseUpdateFile">选择文件</button>
          <view v-if="updateSelectedFile" class="paper-card-file-info">
            <text class="paper-card-file-name">{{ updateSelectedFile.name }}</text>
            <text class="paper-card-file-size">{{ formatFileSize(updateSelectedFile.size) }}</text>
          </view>
          <button
            class="paper-card-submit-btn"
            :disabled="!updateSelectedFile || !updateVersion"
            @click="submitUpdatePaper"
          >
            提交更新
          </button>
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
    

    <view
      v-if="paperUploadNoticeModal.visible"
      class="modal-backdrop"
      @click.self="closePaperUploadNoticeModal"
    >
      <view class="modal-content paper-upload-notice-modal">
        <view class="modal-header">
          <text class="modal-title">{{ paperUploadNoticeModal.title }}</text>
          <text class="modal-close" @click="closePaperUploadNoticeModal">×</text>
        </view>
        <view class="modal-body paper-upload-notice-body">
          <view class="paper-upload-notice-icon">
            <text class="material-symbols-outlined">info</text>
          </view>
          <text class="paper-upload-notice-text">{{ paperUploadNoticeModal.content }}</text>
        </view>
        <view class="modal-footer">
          <view class="btn btn-confirm" @click="closePaperUploadNoticeModal">知道了</view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
// 导入子组件
import PaperDetailModal from '../../components/PaperDetailModal.vue';
import VersionCompareModal from '../../components/VersionCompareModal.vue';
import TeacherSelectModal from '../../components/TeacherSelectModal.vue';

// 导入API方法
import { getWorkbenchData, getPaperList, uploadPaper, uploadAttachment, getAttachmentList, getReceivedNotifications, getReceivedDDL, getSubByUsername, getTeacherByStudentId, createPaperStatus, getPaperDetail, changePassword, deletePaper, getAnnotationsByPaperId, updatePaperVersion, updatePaperStatus, getPaperReview } from '../../api/student.js';
import { config } from '../../api/config.js';
import { getUserId, clearLoginState } from '../../utils/auth.js';
import {
  studentDisplayStatusLabel,
  mapBackendStatusToStudentDisplayBucket,
  STUDENT_DISPLAY_BUCKETS,
  studentDisplayStep
} from '../../utils/studentPaperDisplayStatus.js';

// 导入主题管理工具


// 导入工具函数
import { throttle, formatFileSize, getFileType, formatDateTime, delay, safeGetStorage, safeSetStorage } from '../../utils/functionUtils.js';

// 常量配置
const CONFIG = {
  // 缓存时间：5分钟
  CACHE_TTL: 5 * 60 * 1000,
  // 最大文件大小：100MB
  MAX_FILE_SIZE: 100 * 1024 * 1024,
  // 支持的论文格式
  PAPER_EXTENSIONS: ['.docx', '.doc'],
  // 支持的附件格式
  ATTACHMENT_EXTENSIONS: ['.docx', '.doc', '.pdf', '.xlsx', '.pptx', '.txt', '.zip', '.rar'],
  // 截止日期
  DEADLINES: {
    draft: '2026-03-15',
    final: '2026-05-20'
  }
};

export default {
  components: {
    PaperDetailModal,
    VersionCompareModal,
    TeacherSelectModal
  },
  
  data() {
    return {
      // 页面淡出状态（跳转动画）
      isPageFadeOut: false,
      // 缓存对象
      cache: {
        annotations: {},
        versions: {},
        api: {},
        apiTime: {}
      },
      
      // 加载状态
      loadingCount: 0,
      paperCardLoading: true,
      
      // 用户信息
      userInfo: {
        name: '学生',
        full_name: '',
        username: '',
        college: '学院'
      },
      
      // 论文数据
      paperGroups: [],
      currentPaper: null,
      paperIds: [], // 存储所有论文ID，用于获取附件
      
      // 统计数据
      stats: {
        totalPapers: 0,
        pendingReview: 0,
        pendingRevision: 0,
        finalized: 0
      },
      attachmentStats: {
        total: 0,
        doc: 0,
        sheet: 0,
        other: 0
      },
      
      // 弹窗状态
      modal: {
        detail: false,
        upload: false,
        compare: false,
        teacherSelect: false,
        attachment: false
      },
      
      // 上传数据
      upload: {
        file: null,
        isFinalVersion: false,
        teacherId: '',        // 教师自增ID（teachers表的id），用于上传接口
        teacherUsername: '',  // 教师工号（teacher_id字段），用于显示
        teacherName: '',
        teacherLoading: false // 是否正在查询教师信息
      },
      
      // 附件上传数据
      attachmentUpload: {
        file: null,
        remark: '',
        paperId: '',
        paperTitle: ''
      },
      
      // 文档预览状态
      preview: {
        zoom: 100,
        scrollLeft: 0,
        scrollTop: 0
      },
      
      // 批注筛选
      filter: {
        type: 'all',
        source: 'all'
      },
      
      // 版本对比
      versionCompare: {
        v1: null,
        v2: null,
        label1: '请选择版本1',
        label2: '请选择版本2'
      },
      
      // 学生信息
      studentInfo: null,
      
      // 系统状态
      isServerAvailable: true,
      
      // 系统公告
      notices: [],
      
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
      paperUploadNoticeModal: {
        visible: false,
        title: '',
        content: ''
      },
      showReviewModal: false,
      currentReview: null,
      showUpdateModal: false,
      updatePaperItem: null,
      updateVersion: '',
      updateSelectedFile: null,
      showConfirmModal: false,
      confirmModalTitle: '',
      confirmModalContent: '',
      confirmModalCallback: null
    };
  },
  computed: {
    // 筛选后的批注列表
    filteredAnnotations() {
      if (!this.currentPaper?.annotations) return [];
      
      let annotations = [...this.currentPaper.annotations];
      
      if (this.filter.type !== 'all') {
        annotations = annotations.filter(a => 
          this.filter.type === 'unprocessed' ? !a.processed : a.processed
        );
      }
      
      if (this.filter.source !== 'all') {
        annotations = annotations.filter(a => a.source === this.filter.source);
      }
      
      return annotations;
    },
    
    // 版本选项列表
    versionOptions() {
      if (!this.currentPaper?.versions) return [];
      
      return this.currentPaper.versions.map(v => ({
        label: `v${v.version} - ${v.updateTime}`,
        value: v.version
      }));
    },
    
    // 用户名首字母
    userNameInitial() {
      const displayName = this.userInfo.full_name || this.userInfo.name || '学';
      return displayName.charAt(0);
    },
    
    // 是否显示加载状态
    isLoading() {
      return this.loadingCount > 0;
    },
    
    paperCards() {
      return this.paperGroups.flatMap(group => Array.isArray(group.papers) ? group.papers : []);
    },
    
    // 截止时间相关通知
    deadlineNotices() {
      const deadlineKeywords = ['截止', 'DDL', 'deadline', '期限', '到期', '提交截止', '截止日期', '截止时间'];
      return this.notices.filter(item => {
        const text = (item.title + ' ' + item.content).toLowerCase();
        return deadlineKeywords.some(keyword => text.includes(keyword.toLowerCase()));
      });
    },
    
    // 普通系统公告（排除截止时间通知）
    regularNotices() {
      const deadlineKeywords = ['截止', 'DDL', 'deadline', '期限', '到期', '提交截止', '截止日期', '截止时间'];
      return this.notices.filter(item => {
        const text = (item.title + ' ' + item.content).toLowerCase();
        return !deadlineKeywords.some(keyword => text.includes(keyword.toLowerCase()));
      });
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
    }
  },
  onLoad() {
    // 打印当前登录学生信息，用于调试
    const userInfo = uni.getStorageSync('userInfo') || {};
    const numericUserId = parseInt(userInfo.sub || userInfo.id || 0, 10);
    // 构造与后端接口一致的 current_user 格式
    const currentUser = JSON.stringify({
      sub: numericUserId,
      username: userInfo.username || '',
      roles: ['student']
    });
    
    // 用户信息加载完成（生产环境不输出敏感信息）
    if (process.env.NODE_ENV === 'development') {
      console.log('[Workbench] 用户登录信息已加载');
    }
    
    this._skipNextShow = true;
    this.initialize();
  },
  
  async onShow() {
    // 重置淡出状态
    this.isPageFadeOut = false;
    
    if (this._skipNextShow) {
      this._skipNextShow = false;
      return;
    }
    this.showLoading('刷新数据...');
    try {
      // 强制刷新论文数据，避免缓存导致删除后统计不更新
      await this.refreshData(true);
    } finally {
      this.hideLoading();
    }
  },
  
  onUnload() {
    // 清理定时器，防止内存泄漏
    if (this._userCardShowTimer) {
      clearTimeout(this._userCardShowTimer);
      this._userCardShowTimer = null;
    }
    if (this._userCardHideTimer) {
      clearTimeout(this._userCardHideTimer);
      this._userCardHideTimer = null;
    }
  },
  
  methods: {
    // 轮询获取新上传的论文ID
    async pollForPaperId(existingPaperIds, maxAttempts = 10, interval = 500) {
      for (let i = 0; i < maxAttempts; i++) {
        try {
          const listRes = await getWorkbenchData();
          const papers = Array.isArray(listRes)
            ? listRes
            : (Array.isArray(listRes?.data) ? listRes.data : []);
          
          // 找到上传后新增的论文（ID 不在上传前集合中）
          const newPapers = papers.filter(p => !existingPaperIds.has(p.id));
          if (newPapers.length > 0) {
            // 多篇新论文时取 ID 最大的（最新上传）
            newPapers.sort((a, b) => b.id - a.id);
            return newPapers[0].id;
          }
          
          // 未达到最大尝试次数，等待后继续
          if (i < maxAttempts - 1) {
            await new Promise(resolve => setTimeout(resolve, interval));
          }
        } catch (err) {
          // 查询失败，继续尝试
          if (i < maxAttempts - 1) {
            await new Promise(resolve => setTimeout(resolve, interval));
          }
        }
      }
      
      // 轮询结束仍未找到，返回null
      return null;
    },
    
    // 刷新数据
    async refreshData(forceRefresh = false) {
      // 先获取论文列表
      await this.getPaperWorkbenchData(forceRefresh);
      // 再获取附件统计（需要论文ID）
      await this.loadAttachmentStats();
      // 获取通知
      await this.loadNotices();
    },
    
    // 初始化
    async initialize() {
      this.showLoading('初始化工作台...');
      
      await Promise.all([
        this.loadUserInfo(),
        this.refreshData()
      ]);
      
      await delay(500);
      this.hideLoading();
    },
    
    // 加载系统公告（从后端API获取，包含通知和DDL截止时间）
    async loadNotices() {
      try {
        // 同时获取通知和DDL列表
        const [notificationsRes, ddlRes] = await Promise.all([
          getReceivedNotifications({ page: 1, page_size: 10 }),
          getReceivedDDL()
        ]);
        
        let noticeList = [];
        
        // 处理通知数据
        if (notificationsRes && notificationsRes.items && Array.isArray(notificationsRes.items)) {
          noticeList = notificationsRes.items.map((item, index) => ({
            id: `notice_${item.message_id || index + 1}`,
            messageId: item.message_id,
            title: item.title || '',
            content: item.content || '',
            time: item.operation_time || '',
            sender: item.sender_name || '',
            type: 'system'
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
      } catch (err) {
        console.error('获取通知/DDL失败:', err);
        this.notices = [];
      }
    },
    
    // 加载用户信息
    loadUserInfo() {
      let userInfo = safeGetStorage('userInfo');
      
      // 兼容性处理：如果 full_name 为空，尝试从其他字段获取
      if (userInfo && !userInfo.full_name) {
        userInfo.full_name = userInfo.name || userInfo.username || '';
        // 更新本地存储
        uni.setStorageSync('userInfo', userInfo);
      }
      
      if (userInfo) {
        // 优先使用 full_name，如果不存在则使用 name，最后使用默认值
        const displayName = userInfo.full_name || userInfo.name || '学生用户';
        this.userInfo.name = displayName;
        this.userInfo.full_name = userInfo.full_name || userInfo.name || '学生';
        this.userInfo.username = userInfo.username || '';
        this.userInfo.college = userInfo.college || this.userInfo.college;
      }
    },
    
    // 页面跳转
    navigateTo(url, options = {}) {
      uni.navigateTo({
        url,
        animationType: options.animationType || 'slide-in-right',
        animationDuration: options.animationDuration || 300
      });
    },
    
    goToWorkbench() {
      uni.showToast({ title: '已在工作台', icon: 'none', duration: 1000 });
    },
    
    goToAttachmentList() {
      this.navigateTo('/pages/student/attachmentList');
    },
    
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
    
    showMoreNotice() {
      this.navigateTo('/pages/student/noticeDetail');
    },
    
    // 查看通知详情
    viewNoticeDetail(notice) {
      // 将当前通知存储到全局，供公告详情页使用
      uni.setStorageSync('currentNoticeDetail', notice);
      uni.navigateTo({
        url: '/pages/student/noticeDetail'
      });
    },
    
    // UI 反馈方法
    showLoading(title = '加载中...') {
      if (!this.loadingCount) {
        uni.showLoading({ title, mask: true });
      }
      this.loadingCount++;
    },
    
    hideLoading() {
      this.loadingCount = Math.max(0, this.loadingCount - 1);
      if (!this.loadingCount) {
        uni.hideLoading();
      }
    },
    
    showSuccess(title = '操作成功') {
      uni.showToast({ title, icon: 'success', duration: 1500 });
    },
    
    showError(title = '操作失败') {
      uni.showToast({ title, icon: 'none', duration: 2000 });
    },

    showPaperUploadNoticeModal(title, content) {
      this.paperUploadNoticeModal = {
        visible: true,
        title,
        content
      };
    },

    closePaperUploadNoticeModal() {
      this.paperUploadNoticeModal = {
        visible: false,
        title: '',
        content: ''
      };
    },

    getExistingPapers() {
      return this.paperGroups.flatMap(group => Array.isArray(group.papers) ? group.papers : []);
    },

    hasExistingPaper() {
      return this.getExistingPapers().length > 0;
    },

    getSinglePaperLimitMessage() {
      const currentPaper = this.getExistingPapers()[0] || null;
      const paperTitle = currentPaper?.title || '当前论文';
      return `当前账号已存在论文《${paperTitle}》。\n每位学生只能上传一篇论文。\n如需重新上传，请先在当前工作台删除这篇论文，再上传新论文。`;
    },

    showSinglePaperLimitDialog() {
      this.showPaperUploadNoticeModal('无法上传论文', this.getSinglePaperLimitMessage());
    },

    getPaperUploadErrorDetail(err) {
      const detailList = [];
      if (typeof err?.message === 'string' && err.message.trim()) {
        detailList.push(err.message.trim());
      }
      if (typeof err?.response?.message === 'string' && err.response.message.trim()) {
        detailList.push(err.response.message.trim());
      }
      if (typeof err?.response?.detail === 'string' && err.response.detail.trim()) {
        detailList.push(err.response.detail.trim());
      }
      if (Array.isArray(err?.response?.detail)) {
        err.response.detail.forEach(item => {
          if (typeof item === 'string' && item.trim()) {
            detailList.push(item.trim());
            return;
          }
          if (item && typeof item.msg === 'string' && item.msg.trim()) {
            detailList.push(item.msg.trim());
          }
        });
      }
      return detailList.join('；');
    },

    buildPaperUploadErrorMessage(err) {
      const detail = this.getPaperUploadErrorDetail(err);
      const isSinglePaperLimit =
        this.hasExistingPaper() ||
        (err?.statusCode === 400 && /只能|仅允许|一篇|only|already|duplicate/i.test(detail));

      if (isSinglePaperLimit) {
        return this.getSinglePaperLimitMessage();
      }

      return detail
        ? `论文上传失败：${detail}`
        : '论文上传失败，请稍后重试。';
    },

    // 将工具函数挂载到 methods，使模板可以直接访问
    formatFileSize(size) {
      return formatFileSize(size);
    },
    
    showConfirm(options = {}) {
      return new Promise((resolve) => {
        uni.showModal({
          title: options.title || '确认操作',
          content: options.content || '确定要执行此操作吗？',
          showCancel: options.showCancel !== false,
          cancelText: options.cancelText || '取消',
          confirmText: options.confirmText || '确定',
          success: (res) => resolve(res.confirm),
          fail: () => resolve(false)
        });
      });
    },

    // 弹窗控制
    openModal(name, data = null) {
      if (data) this.currentPaper = data;
      this.modal[name] = true;
    },
    
    closeModal(name) {
      this.modal[name] = false;
      if (name === 'detail') {
        this.resetPreviewState();
      } else if (name === 'upload') {
        this.resetUploadState();
      } else if (name === 'attachment') {
        this.resetAttachmentState();
      }
    },
    
    // 论文相关操作
    openPaperDetail(paper) {
      this.openModal('detail', paper);
    },
    
    closeDetail() {
      this.closeModal('detail');
    },
    
    importPaper() {
      if (this.hasExistingPaper()) {
        this.showSinglePaperLimitDialog();
        return;
      }
      this.modal.upload = true;
      this.resetUploadState();
      this.fetchStudentInfo();
      this.fetchTeacherForUpload();
    },
    
    closeUpload() {
      this.closeModal('upload');
    },
    
    /**
     * 打开上传弹窗时自动查询当前学生对应的指导教师
     * 接口返回 { student_id, teachers: [{id, teacher_id}] }
     * id      → teachers表自增ID，传给上传接口的 teacher_id 参数
     * teacher_id → 教师工号，用于界面展示
     */
    async fetchTeacherForUpload() {
      const userInfo = safeGetStorage('userInfo') || {};
      const studentUsername = userInfo.username || '';
      if (!studentUsername) {
        this.upload.teacherUsername = '';
        this.upload.teacherId = '';
        return;
      }
      
      this.upload.teacherLoading = true;
      try {
        const res = await getTeacherByStudentId(studentUsername);
        const teachers = res?.teachers || [];
        if (teachers.length > 0) {
          // 取第一位教师
          const teacher = teachers[0];
          this.upload.teacherId = teacher.id;           // 自增ID，用于上传
          this.upload.teacherUsername = teacher.teacher_id; // 工号，用于显示
        } else {
          this.upload.teacherId = '';
          this.upload.teacherUsername = '';
        }
      } catch (err) {
        console.error('[fetchTeacherForUpload] 查询教师失败:', err);
        this.upload.teacherId = '';
        this.upload.teacherUsername = '';
      } finally {
        this.upload.teacherLoading = false;
      }
    },
    
    resetUploadState() {
      this.upload.file = null;
      this.upload.isFinalVersion = false;
      this.upload.teacherId = '';
      this.upload.teacherUsername = '';
      this.upload.teacherName = '';
      this.upload.teacherLoading = false;
    },
    
    resetAttachmentState() {
      this.attachmentUpload.file = null;
      this.attachmentUpload.remark = '';
      this.attachmentUpload.paperId = '';
      this.attachmentUpload.paperTitle = '';
    },
    
    resetPreviewState() {
      this.preview.zoom = 100;
      this.preview.scrollLeft = 0;
      this.preview.scrollTop = 0;
    },
    
    /**
     * 检查服务器健康状态（通过实际数据请求判断）
     * @returns {Promise<boolean>}
     */
    async checkServerHealth() {
      // 不做单独的健康检查，默认认为服务器可用
      // 服务器是否可用将由 getWorkbenchData 的实际请求结果决定
      this.isServerAvailable = true;
      return true;
    },
    
    /**
     * 从后端获取学生信息
     * @returns {Promise<Object>} 学生信息对象
     */
    async fetchStudentInfo() {
      // 如果已经缓存了学生信息，直接返回
      if (this.studentInfo && this.studentInfo.id) {
        return this.studentInfo;
      }
      
      // 直接使用登录时保存在本地存储的用户信息
      // 登录时后端返回的userInfo中已包含正确的owner_id（学号）和sub（数字用户ID）
      const localUserInfo = uni.getStorageSync('userInfo') || {};
      
      if (localUserInfo.owner_id) {
        this.studentInfo = {
          id: localUserInfo.owner_id,
          username: localUserInfo.username || localUserInfo.name || String(localUserInfo.owner_id),
          name: localUserInfo.name || localUserInfo.username,
          userType: 'student'
        };
        return this.studentInfo;
      }
      
      return null;
    },
    getAttachmentPaperDisplayTitle(paper) {
      const rawTitle = paper?.title || paper?.name || paper?.paper_name || paper?.filename || paper?.file_name;
      if (rawTitle) {
        return rawTitle;
      }

      const rawPath = paper?.oss_key || paper?.fileUrl || '';
      if (rawPath) {
        const fileName = rawPath.split('/').pop();
        if (fileName) {
          try {
            return decodeURIComponent(fileName).replace(/^\d+_/, '').replace(/\.[^/.]+$/, '');
          } catch (err) {
            return fileName.replace(/^\d+_/, '').replace(/\.[^/.]+$/, '');
          }
        }
      }

      return '当前论文';
    },

    async fetchAttachmentPaperInfo() {
      const res = await getWorkbenchData();
      const papers = Array.isArray(res)
        ? res
        : (Array.isArray(res?.data) ? res.data : []);

      const validPapers = papers.filter(item => item?.id && !Number.isNaN(parseInt(item.id, 10)));
      if (validPapers.length === 0) {
        this.attachmentUpload.paperId = '';
        this.attachmentUpload.paperTitle = '';
        return null;
      }

      validPapers.sort((a, b) => Number(b.id) - Number(a.id));
      const paper = validPapers[0];
      this.attachmentUpload.paperId = String(parseInt(paper.id, 10));
      this.attachmentUpload.paperTitle = this.getAttachmentPaperDisplayTitle(paper);
      return paper;
    },

    async importAttachment() {
      this.resetAttachmentState();
      this.showLoading('加载论文信息...');
      try {
        const paper = await this.fetchAttachmentPaperInfo();
        if (!paper) {
          this.showPaperUploadNoticeModal('无法上传附件', '当前账号下未找到论文，请先上传论文后再上传附件。');
          return;
        }
        this.modal.attachment = true;
      } catch (err) {
        console.error('[importAttachment] 获取论文信息失败:', err);
        this.showPaperUploadNoticeModal('无法上传附件', '获取论文信息失败，请稍后重试。');
      } finally {
        this.hideLoading();
      }
    },

    closeAttachmentUpload() {
      this.closeModal('attachment');
    },

    // 通用文件选择
    async chooseFile(options = {}) {
      return new Promise((resolve, reject) => {
        uni.chooseFile({
          count: 1,
          type: 'file',
          extension: options.extensions || CONFIG.ATTACHMENT_EXTENSIONS,
          success: (res) => {
            const file = res.tempFiles?.[0];
            if (!file?.path || !file.name) {
              reject(new Error('文件信息不完整'));
              return;
            }
            if (file.size > CONFIG.MAX_FILE_SIZE) {
              reject(new Error('文件大小不能超过100MB'));
              return;
            }
            resolve(file);
          },
          fail: (err) => reject(err)
        });
      });
    },
    
    async chooseAttachmentFile() {
      try {
        const file = await this.chooseFile({
          extensions: CONFIG.ATTACHMENT_EXTENSIONS
        });
        this.attachmentUpload.file = file;
        this.showSuccess('附件选择成功');
      } catch (err) {
        this.showError(err.message || '文件选择失败');
      }
    },
    
    async submitAttachment() {
      if (!this.attachmentUpload.file) {
        this.showError('请选择附件文件');
        return;
      }
      
      const userId = getUserId();
      if (!userId) {
        this.showError('获取用户信息失败，请重新登录');
        return;
      }
      
      // 使用上传弹窗打开时自动查询到的论文ID
      const paperId = parseInt(this.attachmentUpload.paperId, 10);
      if (!paperId || isNaN(paperId)) {
        this.showError('未找到关联论文，请关闭弹窗后重试');
        return;
      }
      
      const userInfo = safeGetStorage('userInfo') || {};
      const name = userInfo.username || userInfo.name || String(userId);
      const filePath = this.attachmentUpload.file.path;
      // 将论文ID填入备注，格式：论文ID: xxx
      const remark = `论文ID: ${paperId}`;

      // 先关闭弹窗，再显示 loading（与论文上传保持一致，避免 loading 被弹窗遮挡）
      this.closeAttachmentUpload();
      this.showLoading('上传附件中...');
      
      try {
        await uploadAttachment({
          filePath,
          name,
          submitterId: userId,
          paperId: paperId,
          fileType: 'document',
          version: 1,
          remark
        });
        
        this.hideLoading();
        this.showSuccess('附件上传成功');
        this.loadAttachmentStats();
        
      } catch (err) {
        this.hideLoading();
        console.error('附件上传失败:', err);
        this.showError('上传失败: ' + (err.message || '未知错误'));
      }
    },
    addNewAttachmentToLocal(res) {
      const file = this.attachmentUpload.file;
      const newAttachment = {
        id: res.id || Date.now(),
        name: file.name,
        filename: file.name,
        type: getFileType(file.name),
        size: file.size || 0,
        uploadTime: formatDateTime(new Date(), 'YYYY-MM-DD HH:mm'),
        description: this.attachmentUpload.remark || '',
        fileUrl: res.storage_path || ''
      };
      
      const savedAttachments = safeGetStorage('studentAttachments', []);
      savedAttachments.unshift(newAttachment);
      safeSetStorage('studentAttachments', savedAttachments);
    },
    cancelTeacherSelect() {
      this.modal.teacherSelect = false;
      this.upload.teacherName = '';
      this.upload.teacherId = '';
    },
    
    // 文档预览操作
    zoomIn() {
      if (this.preview.zoom < 200) {
        this.preview.zoom += 10;
      }
    },
    
    zoomOut() {
      if (this.preview.zoom > 50) {
        this.preview.zoom -= 10;
      }
    },
    
    onDocumentScroll: throttle(function(e) {
      this.preview.scrollLeft = e.detail.scrollLeft;
      this.preview.scrollTop = e.detail.scrollTop;
    }, 100),
    
    // 版本对比
    showVersionCompare() {
      this.modal.compare = true;
    },
    
    closeCompare() {
      this.modal.compare = false;
    },
    
    onVersion1Change(e) {
      const option = this.versionOptions[e.detail.value];
      this.versionCompare.v1 = option.value;
      this.versionCompare.label1 = option.label;
    },
    
    onVersion2Change(e) {
      const option = this.versionOptions[e.detail.value];
      this.versionCompare.v2 = option.value;
      this.versionCompare.label2 = option.label;
    },
    
    // 论文文件选择
    async choosePaperFile() {
      try {
        const file = await this.chooseFile({
          extensions: CONFIG.PAPER_EXTENSIONS
        });
        this.upload.file = file;
        this.showSuccess('文件选择成功');
      } catch (err) {
        this.showError(err.message || '文件选择失败');
      }
    },
    
    // 数据处理
    updateStats() {
      let total = 0;
      let pendingReview = 0;
      let pendingRevision = 0;
      let finalized = 0;
      
      this.paperGroups.forEach(group => {
        if (group.papers && Array.isArray(group.papers)) {
          group.papers.forEach(paper => {
            total++;
            const bucket = mapBackendStatusToStudentDisplayBucket(paper.status);
            if (bucket === STUDENT_DISPLAY_BUCKETS.PENDING_REVIEW) pendingReview++;
            else if (bucket === STUDENT_DISPLAY_BUCKETS.PENDING_REVISION) pendingRevision++;
            else if (bucket === STUDENT_DISPLAY_BUCKETS.FINALIZED) finalized++;
          });
        }
      });
      
      this.stats = { totalPapers: total, pendingReview, pendingRevision, finalized };
    },
    
    findPaperById(paperId) {
      for (let group of this.paperGroups) {
        const paper = group.papers.find(p => p.id === paperId);
        if (paper) return paper;
      }
      return null;
    },
    
    updatePaperInList(paperId, updates) {
      const paper = this.findPaperById(paperId);
      if (paper) {
        Object.assign(paper, updates);
      }
      if (this.currentPaper && this.currentPaper.id === paperId) {
        Object.assign(this.currentPaper, updates);
      }
    },
    
    /**
     * 将新上传的论文添加到本地数据
     * @param {Object} res - 上传API返回的数据
     * @param {number} ownerId - 学生ID
     * @param {number} teacherId - 教师ID
     */
    addNewPaperToLocal(res, ownerId, teacherId) {
      const updateTime = formatDateTime(new Date(), 'YYYY-MM-DD HH:mm');
      
      // 查找或创建教师组
      let teacherGroup = this.paperGroups.find(g => g.teacherId === teacherId);
      if (!teacherGroup) {
        teacherGroup = {
          teacherId,
          teacherName: this.upload.teacherName || '张教授',
          papers: []
        };
        this.paperGroups.push(teacherGroup);
      }
      
      // 创建新论文对象
      const newPaper = {
        id: res.id,
        title: this.upload.file.name.replace(/\.(docx|doc)$/i, ''),
        version: 1.0,
        status: 'uploaded',
        updateTime,
        oss_key: res.oss_key,
        teacherId,
        versions: [{ version: 1.0, updateTime, status: 'uploaded' }],
        annotations: [],
        structureStatus: null,
        aiStructureCheck: null
      };
      
      teacherGroup.papers.push(newPaper);
      this.updateStats();
      this.savePapersToLocalStorage();
    },
    
    /**
     * 将API返回的论文列表转换为按教师分组的格式
     * 参考 paperList.vue 的 formatPaperData 方法
     * @param {Array} papers - API返回的论文列表
     * @param {Object} localPapers - 本地存储的论文fileUrl映射
     * @returns {Array} 按教师分组的论文列表
     */
    transformPapersToGroups(papers, localPapers = {}) {
      if (!Array.isArray(papers) || papers.length === 0) {
        return [];
      }
      
      // 按teacher_id分组
      const groupsMap = new Map();
      
      papers.forEach(paper => {
        const teacherId = paper.teacher_id || paper.teacherId;
        const teacherName = paper.teacher_name || paper.teacherName || '指导教师';
        
        if (!groupsMap.has(teacherId)) {
          groupsMap.set(teacherId, {
            teacherId: teacherId,
            teacherName: teacherName,
            papers: []
          });
        }
        
        const group = groupsMap.get(teacherId);
        
        const rawStatus = paper.status || paper.state || paper.paper_status || paper.paperState || '';
        const rawTrim = String(rawStatus).trim();
        const statusText = rawTrim ? studentDisplayStatusLabel(rawStatus) : '';
        
        // 尝试从多个字段获取标题
        let paperTitle = paper.title || paper.name || paper.paper_name || paper.filename || paper.file_name;
        
        // 如果没有标题，尝试从 oss_key 中提取文件名
        if (!paperTitle && paper.oss_key) {
          const fileName = paper.oss_key.split('/').pop();
          if (fileName) {
            paperTitle = fileName.replace(/^\d+_/, '').replace(/\.[^/.]+$/, '');
          }
        }
        
        if (!paperTitle) {
          paperTitle = '无标题论文';
        }
        
        // 格式化版本号
        let version = String(paper.latest_version || paper.version || '1.0').replace(/^v/i, '');
        
        // 格式化更新时间
        let updateTime = paper.updated_at || paper.updateTime || paper.created_at || '';
        if (updateTime && updateTime.length > 16) {
          updateTime = updateTime.substring(0, 16).replace('T', ' ');
        }
        
        // 格式化文件大小
        let fileSize = paper.size || paper.file_size || paper.fileSize || 0;
        let fileSizeText = '';
        if (fileSize) {
          if (fileSize < 1024) {
            fileSizeText = fileSize + ' B';
          } else if (fileSize < 1024 * 1024) {
            fileSizeText = (fileSize / 1024).toFixed(1) + ' KB';
          } else {
            fileSizeText = (fileSize / (1024 * 1024)).toFixed(1) + ' MB';
          }
        }
        
        const formattedPaper = {
          id: paper.id,
          title: paperTitle,
          fileName: paper.filename || paper.file_name || paper.name || paper.oss_key || paperTitle,
          oss_key: paper.oss_key || '',
          pdf_oss_key: paper.pdf_oss_key || '',
          version: version,
          teacher: teacherName,
          _rawTeacherId: teacherId, // 保留原始teacher_id用于查询工号
          status: rawStatus,
          statusText: statusText,
          updateTime: updateTime || '暂无更新时间',
          fileSize: fileSize,
          fileSizeText: fileSizeText,
          fileUrl: localPapers[paper.id] || null,
          teacherId: teacherId,
          owner_id: paper.owner_id,
          detail: paper.detail || '' // 审阅意见
        };
        
        group.papers.push(formattedPaper);
      });
      
      return Array.from(groupsMap.values());
    },
    
    /**
     * 查询学生的指导教师工号，并更新论文分组中的教师显示
     * 参考 paperList.vue 的实现
     * @param {string} studentUsername - 学生学号
     */
    async fetchAndApplyTeacherUsername(studentUsername) {
      try {
        const userInfo = uni.getStorageSync('userInfo') || {};
        const studentIdentifier = studentUsername || userInfo.username || userInfo.owner_id || userInfo.student_id || '';
        if (!studentIdentifier) return;

        const res = await getTeacherByStudentId(studentIdentifier);
        const teachers = res?.teachers || [];
        if (teachers.length === 0) return;
        
        // 这里直接使用接口返回的 teacher_id 作为展示值
        const teacherMap = {};
        teachers.forEach(t => {
          teacherMap[String(t.id)] = t.teacher_id || '';
        });
        const singleTeacherDisplay = teachers.length === 1 ? (teachers[0].teacher_id || '') : '';
        
        // 更新论文分组中匹配的教师显示
        this.paperGroups.forEach(group => {
          const rawTeacherId = String(group.teacherId || '');
          if (rawTeacherId && teacherMap[rawTeacherId]) {
            group.teacherName = teacherMap[rawTeacherId];
          } else if (singleTeacherDisplay) {
            group.teacherName = singleTeacherDisplay;
          }
          // 同时更新每篇论文的 teacher 字段
          if (group.papers) {
            group.papers.forEach(paper => {
              const paperTeacherId = String(paper._rawTeacherId || '');
              if (paperTeacherId && teacherMap[paperTeacherId]) {
                paper.teacher = teacherMap[paperTeacherId];
              } else if (
                singleTeacherDisplay &&
                (!paper.teacher ||
                  paper.teacher === '指导教师' ||
                  /^教师ID[:：]/.test(String(paper.teacher).trim()) ||
                  /^teacher\s*id[:：]/i.test(String(paper.teacher).trim()))
              ) {
                paper.teacher = singleTeacherDisplay;
              }
            });
          }
        });
        
        this.savePapersToLocalStorage();
        if (this.cache.api.paperWorkbenchData) {
          this.cache.api.paperWorkbenchData = JSON.parse(JSON.stringify(this.paperGroups));
          this.cache.apiTime.paperWorkbenchData = Date.now();
        }
        // 触发视图更新
        this.$forceUpdate();
      } catch (err) {
        console.error('[fetchAndApplyTeacherUsername] 查询教师工号失败:', err);
      }
    },
    
    /**
     * 获取论文工作台数据
     * @param {boolean} forceRefresh - 是否强制刷新
     */
    async getPaperWorkbenchData(forceRefresh = false) {
      // 检查缓存
      const cacheKey = 'paperWorkbenchData';
      const now = Date.now();
      const cachedData = this.cache.api[cacheKey];
      const cacheTime = this.cache.apiTime[cacheKey];
      
      if (!forceRefresh && this.isServerAvailable && cachedData && (now - cacheTime < CONFIG.CACHE_TTL)) {
        this.paperGroups = cachedData;
        this.updateStats();
        return;
      }
      
      try {
        const res = await getWorkbenchData();
        this.isServerAvailable = true;
        
        // 解析响应数据
        let paperData = null;
        if (Array.isArray(res)) {
          paperData = res;
        } else if (res?.code === 200 && res.data) {
          paperData = res.data;
        } else if (Array.isArray(res?.data)) {
          paperData = res.data;
        }
        
        if (!paperData) {
          this.paperGroups = [];
          this.updateStats();
          return;
        }
        
        // 服务器返回空数组是正常情况（用户没有论文）
        if (paperData.length === 0) {
          this.paperGroups = [];
          this.updateStats();
          this.clearCaches();
          this.notices = [];
          return;
        }
        
        // 先从本地存储加载数据，保留 fileUrl 字段
        const localPapers = {};
        try {
          const savedPapers = uni.getStorageSync('studentPapers');
          if (savedPapers && Array.isArray(savedPapers)) {
            savedPapers.forEach(paper => {
              if (paper.id && paper.fileUrl) {
                localPapers[paper.id] = paper.fileUrl;
              }
            });
          }
        } catch (error) {
          console.error('加载本地存储数据失败:', error);
        }
        
        // 获取每篇论文的详细信息以获取准确状态
        const paperDetails = await Promise.all(
          paperData.map(async (paper) => {
            try {
              const detail = await getPaperDetail(paper.id);
              return { ...paper, ...detail };
            } catch (err) {
              return paper;
            }
          })
        );
        
        // 将API返回的论文列表转换为按教师分组的格式
        // API返回: [{id, owner_id, teacher_id, latest_version, oss_key}, ...]
        // 前端需要: [{teacherId, teacherName, papers: [...]}, ...]
        this.paperGroups = this.transformPapersToGroups(paperDetails, localPapers);
        
        // 存储所有论文ID，用于获取附件
        this.paperIds = paperDetails.map(p => p.id).filter(id => id && !isNaN(parseInt(id)));
        
        // 更新缓存
        this.cache.api[cacheKey] = this.paperGroups;
        this.cache.apiTime[cacheKey] = now;
        
        // 保存到本地存储作为备份
        this.savePapersToLocalStorage();
        
        this.updateStats();
        this.clearCaches();
        
        // 异步获取教师工号并更新显示（不阻塞界面）
        const userInfo = uni.getStorageSync('userInfo') || {};
        const studentUsername = userInfo.username || '';
        if (studentUsername) {
          this.fetchAndApplyTeacherUsername(studentUsername);
        }
      } catch (err) {
        // 处理401未授权错误
        if (err.statusCode === 401 || err.message?.includes('401')) {
          uni.removeStorageSync('token');
          uni.showModal({
            title: '登录已过期',
            content: '您的登录状态已过期，请重新登录',
            showCancel: false,
            confirmText: '去登录',
            success: () => uni.reLaunch({ url: '/pages/index/index' })
          });
          return;
        }
        
        this.isServerAvailable = false;
        this.paperGroups = [];
        this.updateStats();
        uni.showToast({ title: '获取数据失败，请稍后重试', icon: 'none' });
      }
    },
    
    async loadAttachmentStats() {
      // 如果没有论文ID，直接返回空统计
      if (!this.paperIds || this.paperIds.length === 0) {
        this.attachmentStats = { total: 0, doc: 0, sheet: 0, other: 0 };
        return;
      }
      
      try {
        // 逐个获取每个论文的附件
        const allFiles = [];
        for (const paperId of this.paperIds) {
          try {
            const res = await getAttachmentList(paperId);
            const files = res?.files || [];
            // 标记每个附件所属的论文ID
            files.forEach(f => {
              f._paperId = paperId;
              allFiles.push(f);
            });
          } catch (err) {
            // 忽略单个论文附件获取失败
          }
        }
        
        // 去重（同一附件可能关联多个论文）
        const uniqueFiles = [];
        const seenIds = new Set();
        allFiles.forEach(f => {
          if (!seenIds.has(f.id)) {
            seenIds.add(f.id);
            uniqueFiles.push(f);
          }
        });
        
        // 统计
        let total = 0, doc = 0, sheet = 0, other = 0;
        uniqueFiles.forEach(f => {
          total++;
          const ext = (f.filename || '').split('.').pop().toLowerCase();
          if (['doc', 'docx', 'pdf'].includes(ext)) doc++;
          else if (['xls', 'xlsx'].includes(ext)) sheet++;
          else other++;
        });
        this.attachmentStats = { total, doc, sheet, other };
      } catch (err) {
        this.attachmentStats = { total: 0, doc: 0, sheet: 0, other: 0 };
      }
    },

    // 清除缓存
    clearCaches() {
      this.cache.annotations = {};
      this.cache.versions = {};
    },
    
    async markAsProcessed(annotation) {
      // 乐观更新UI
      const originalState = annotation.processed;
      annotation.processed = true;
      this.showSuccess('已标记为处理');
      
      try {
        // 使用封装的API方法
        const { markAnnotationProcessed } = await import('@/api/student.js');
        await markAnnotationProcessed(this.currentPaper.id, annotation.id, this.currentPaper.teacherId);
      } catch (err) {
        // 失败时回滚状态
        annotation.processed = originalState;
        this.showError('标记处理失败，请重试');
        console.error('标记批注处理失败:', err);
      }
    },
    
    
    /**
     * 提交论文文件
     */
    async submitPaper() {
      if (!this.upload.file) {
        this.showError('请选择论文文件');
        return;
      }
      
      const teacherId = parseInt(this.upload.teacherId);
      if (!teacherId || teacherId <= 0) {
        this.showError('未获取到指导教师信息，请关闭弹窗后重试');
        return;
      }
      
      const userId = getUserId();
      if (!userId) {
        this.showError('获取用户信息失败，请重新登录');
        return;
      }
      
      const filePath = this.upload.file.path;
      
      // 记录上传前已有的论文 ID 集合，用于上传后识别新论文
      const existingPaperIds = new Set(
        this.paperGroups.flatMap(group => (group.papers || []).map(p => p.id))
      );

      if (existingPaperIds.size > 0) {
        this.closeUpload();
        this.showSinglePaperLimitDialog();
        return;
      }
      
      // 先关闭上传弹窗，再显示 loading
      this.closeUpload();
      
      this.showLoading('上传中...');
      
      try {
        const res = await uploadPaper({
          filePath: filePath,
          ownerId: userId,
          teacherId: teacherId
        });
        
        // 优先使用上传接口直接返回的 paper_id
        let resolvedPaperId = res?.paper_id || null;
        
        // 若上传响应中没有 paper_id，则轮询 papers/list 对比差异来获取新论文 ID
        if (!resolvedPaperId) {
          resolvedPaperId = await this.pollForPaperId(existingPaperIds, 10, 500);
        }
        
        // 使用解析到的 paper_id 创建论文状态
        if (resolvedPaperId) {
          console.log('[submitPaper] 准备创建论文状态, paper_id:', resolvedPaperId);
          try {
            const statusRes = await createPaperStatus(resolvedPaperId);
            console.log('[submitPaper] 论文状态创建成功, 返回:', statusRes);
          } catch (statusErr) {
            console.error('[submitPaper] 创建论文状态失败:', statusErr);
          }
        } else {
          console.warn('[submitPaper] 无法获取 paper_id，跳过状态创建');
        }
        
        this.hideLoading();
        uni.showToast({ title: '论文上传成功', icon: 'success', duration: 2000 });
        
        // 延迟刷新论文列表（给数据库写入时间）
        setTimeout(() => {
          this.getPaperWorkbenchData(true);
        }, 1000);
        
      } catch (err) {
        console.error('上传失败:', err);
        this.hideLoading();

        this.showPaperUploadNoticeModal('上传失败', this.buildPaperUploadErrorMessage(err));
      }
    },
    
    /**
     * 调用AI智能体检查论文结构
     * @param {string} paperId - 论文ID
     * @returns {void}
     */
    async callAIAgentCheck(paperId) {
      console.log('调用callAIAgentCheck方法，paperId:', paperId);
      
      // 验证论文ID
      if (!paperId) {
        console.log('paperId为空，无法进行AI检查');
        this.showError('论文信息错误，无法进行AI检查');
        return;
      }
      
      try {
        const res = await callAIAgentCheck(paperId);
        if (res && res.message && res.message.includes('成功')) {
          this.updateAICheckResult(paperId, {
            isCorrect: res.is_correct || false,
            suggestions: res.suggestions || []
          });
        } else {
          this.showError(res.message || 'AI检查失败');
        }
      } catch (err) {
        console.error('AI检查失败:', err);
        this.showError('AI检查失败，请稍后重试');
      }
    },
    
    updateAICheckResult(paperId, aiResult) {
      let paper = this.findPaperById(paperId);
      
      // 如果找不到论文，检查是否是新上传的论文
      if (!paper && this.currentPaper && this.currentPaper.id === paperId) {
        paper = this.currentPaper;
        
        // 创建默认教师组
        let defaultGroup = this.paperGroups.find(g => g.teacherName === '默认教师');
        if (!defaultGroup) {
          defaultGroup = {
            teacherId: Date.now(),
            teacherName: '默认教师',
            papers: []
          };
          this.paperGroups.push(defaultGroup);
        }
        
        // 将新论文添加到教师组
        defaultGroup.papers.push(paper);
      }
      
      if (paper) {
        const updateTime = new Date().toLocaleString('zh-CN', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit' 
        }).replace(/\//g, '-');
        
        paper.status = 'uploaded';
        paper.updateTime = updateTime;
        paper.aiStructureCheck = {
          isCorrect: aiResult.isCorrect || false,
          suggestions: aiResult.suggestions || [],
          checkTime: new Date().toLocaleString()
        };
        paper.structureStatus = aiResult.isCorrect ? 'correct' : 'error';
        paper.version = paper.version || 1.0;
        paper.teacher = paper.teacher || '默认教师';
        
        // 保存文件路径，用于预览和下载
        if (this.upload.file?.path) {
          paper.fileUrl = this.upload.file.path;
        }
        
        if (this.currentPaper?.id === paperId) {
          Object.assign(this.currentPaper, {
            status: 'uploaded',
            updateTime,
            aiStructureCheck: paper.aiStructureCheck,
            structureStatus: paper.structureStatus,
            version: paper.version,
            teacher: paper.teacher,
            fileUrl: this.upload.file?.path || paper.fileUrl
          });
        }
        
        this.updateStats();
        
        // 保存论文数据到本地存储，以便在其他页面中显示
        this.savePapersToLocalStorage();
      }
      
      if (aiResult.isCorrect) {
        uni.showModal({
          title: '✓ 论文结构检查通过！',
          content: '您的论文结构符合要求，可以继续提交给教师审阅。',
          showCancel: false,
          success: () => {
            this.closeUpload();
            // 不要调用getPaperWorkbenchData，因为它会重置paperGroups数组
            // 直接更新统计数据即可
            this.updateStats();
            console.log('论文结构检查通过，已更新UI');
          }
        });
      } else {
        const suggestionsText = aiResult.suggestions && aiResult.suggestions.length > 0
          ? '\n\n修改建议：\n' + aiResult.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')
          : '';
        
        uni.showModal({
          title: '论文结构需要修改',
          content: 'AI智能体已检查您的论文，发现结构问题，请根据以下建议修改后重新上传：' + suggestionsText,
          showCancel: false,
          confirmText: '查看详细建议',
          success: () => {
            this.closeUpload();
            if (this.currentPaper) {
              this.openPaperDetail(this.currentPaper);
            }
            // 不要调用getPaperWorkbenchData，因为它会重置paperGroups数组
            // 直接更新统计数据即可
            this.updateStats();
            console.log('论文结构检查未通过，已更新UI');
          }
        });
      }
    },
    
    /**
     * 处理教师选择确认
     * @param {Object} data - 包含 teacherId 和 teacherName
     */
    onTeacherSelectConfirm(data) {
      const { teacherId, teacherName } = data;
      
      if (!teacherId || teacherId <= 0) {
        uni.showToast({ title: '请输入有效的教师编号', icon: 'none' });
        return;
      }
      
      this.upload.teacherId = String(teacherId);
      this.upload.teacherName = teacherName || '';
      this.modal.teacherSelect = false;
      this.modal.upload = true;
      this.resetUploadState();
      this.fetchStudentInfo();
    },
    
    handleImportPaper(file, teacherName) {
      uni.showLoading({ title: '导入中...', mask: true });
      setTimeout(() => {
        this.processImportFile(file, teacherName, null);
      }, 500);
    },
    
    processImportFile(file, teacherName, fileContent) {
      try {
        const fileName = file.name.replace(/\.(docx|doc)$/i, '');
        const updateTime = new Date().toLocaleString('zh-CN', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit' 
        }).replace(/\//g, '-');
        
        const newPaper = {
          id: Date.now(),
          title: fileName || '我的论文',
          version: 1.0,
          status: 'draft',
          updateTime: updateTime,
          content: fileContent || '',
          versions: [
            { 
              version: 1.0, 
              updateTime: updateTime, 
              status: 'draft' 
            }
          ],
          annotations: [],
          structureStatus: null,
          aiStructureCheck: null
        };
        
        let teacherGroup = this.paperGroups.find(g => g.teacherName === teacherName);
        if (!teacherGroup) {
          teacherGroup = {
            teacherId: Date.now(),
            teacherName: teacherName,
            papers: []
          };
          this.paperGroups.push(teacherGroup);
        }
        
        teacherGroup.papers.push(newPaper);
        this.updateStats();
        uni.hideLoading();
        uni.showToast({ title: '导入成功', icon: 'success' });
      } catch (error) {
        console.error('导入论文失败:', error);
        uni.hideLoading();
        uni.showToast({ title: '导入失败，请重试', icon: 'none' });
      }
    },
    
    // 保存论文数据到本地存储
    savePapersToLocalStorage() {
      try {
        // 转换paperGroups为扁平化的论文列表
        const allPapers = [];
        this.paperGroups.forEach(group => {
          if (group.papers && Array.isArray(group.papers)) {
            group.papers.forEach(paper => {
              allPapers.push({
                ...paper,
                teacher: group.teacherName
              });
            });
          }
        });
        
        // 保存到本地存储
        uni.setStorageSync('studentPapers', allPapers);
        console.log('论文数据已保存到本地存储:', allPapers.length, '篇论文');
      } catch (error) {
        console.error('保存论文数据失败:', error);
      }
    },
    
    // 从本地存储加载论文数据
    loadPapersFromLocalStorage() {
      try {
        const savedPapers = uni.getStorageSync('studentPapers');
        if (savedPapers && Array.isArray(savedPapers) && savedPapers.length > 0) {
          // 按教师分组
          const groups = {};
          savedPapers.forEach(paper => {
            const teacherName = paper.teacher || '默认教师';
            if (!groups[teacherName]) {
              groups[teacherName] = {
                teacherId: Date.now(),
                teacherName: teacherName,
                papers: []
              };
            }
            groups[teacherName].papers.push(paper);
          });
          
          this.paperGroups = Object.values(groups);
          this.updateStats();
          console.log('从本地存储加载论文数据:', savedPapers.length, '篇论文');
          return true;
        }
      } catch (error) {
        console.error('加载论文数据失败:', error);
      }
      return false;
    },
    
    goToAttachmentList() {
      uni.navigateTo({
        url: '/pages/student/attachmentList'
      });
    },
    
    // 工具方法
    // ===== 论文卡片：与 paperList 对齐的最终实现 =====
    getStudentPaperStorageKey(userId = null) {
      const userInfo = uni.getStorageSync('userInfo') || {};
      const scopedUserId = userId || parseInt(userInfo.sub || 0, 10);
      return scopedUserId ? `studentPapers_${scopedUserId}` : 'studentPapers';
    },

    updatePaperInList(paperId, updates) {
      const paper = this.findPaperById(paperId);
      if (paper) {
        Object.assign(paper, updates);
      }
      if (this.currentPaper && this.currentPaper.id === paperId) {
        Object.assign(this.currentPaper, updates);
      }
      if (this.updatePaperItem && this.updatePaperItem.id === paperId) {
        Object.assign(this.updatePaperItem, updates);
      }
    },

    savePapersToLocalStorage() {
      try {
        const allPapers = this.paperGroups.flatMap(group =>
          (group.papers || []).map(paper => ({
            ...paper,
            teacher: paper.teacher || group.teacherName,
            teacherName: group.teacherName,
            teacherId: group.teacherId
          }))
        );
        const storageKey = this.getStudentPaperStorageKey();
        uni.setStorageSync(storageKey, allPapers);
        uni.setStorageSync('studentPapers', allPapers);
      } catch (error) {
        console.error('保存论文缓存失败:', error);
      }
    },

    loadPapersFromLocalStorage(userId = null) {
      try {
        const storageKey = this.getStudentPaperStorageKey(userId);
        const savedPapers = uni.getStorageSync(storageKey) || uni.getStorageSync('studentPapers');
        if (savedPapers && Array.isArray(savedPapers) && savedPapers.length > 0) {
          this.paperGroups = this.transformPapersToGroups(savedPapers);
          this.updatePaperIdsFromGroups();
          this.updateStats();
          return true;
        }
      } catch (error) {
        console.error('读取论文缓存失败:', error);
      }
      return false;
    },

    updatePaperIdsFromGroups() {
      this.paperIds = this.paperCards
        .map(paper => parseInt(paper.id, 10))
        .filter(id => !Number.isNaN(id));
    },

    formatStatusText(status) {
      if (status == null || String(status).trim() === '') return '待审阅';
      return studentDisplayStatusLabel(status);
    },

    buildStatusHistory(detail) {
      const rawStatus = detail.status || '';
      const updateTime = detail.updated_at || detail.updateTime || new Date().toLocaleString('zh-CN');
      return [{
        time: updateTime,
        content: `当前状态：${studentDisplayStatusLabel(rawStatus)}`
      }];
    },

    formatPaperData(list) {
      return (list || []).map(item => {
        const rawStatus = item.status || item.state || item.paper_status || '';
        const normalizedStatus = String(rawStatus || '').toLowerCase().trim();
        let paperTitle = item.title || item.name || item.paper_name || item.filename || item.file_name;

        if (!paperTitle && (item.oss_key || item.fileUrl)) {
          const rawPath = item.oss_key || item.fileUrl;
          const fileName = rawPath.split('/').pop();
          if (fileName) {
            paperTitle = fileName.replace(/^\d+_/, '').replace(/\.[^/.]+$/, '');
          }
        }

        if (!paperTitle) {
          paperTitle = '未命名论文';
        }

        return {
          id: item.id || '',
          title: paperTitle,
          fileName: item.filename || item.file_name || item.name || item.oss_key || paperTitle,
          oss_key: item.oss_key || '',
          pdf_oss_key: item.pdf_oss_key || '',
          version: String(item.version || item.latest_version || '1.0').replace(/^v/i, ''),
          teacher: (
            item.teacher &&
            !/^教师ID[:：]/.test(String(item.teacher).trim()) &&
            !/^teacher\s*id[:：]/i.test(String(item.teacher).trim())
          )
            ? item.teacher
            : (item.teacher_name || item.teacher_display_name || item.supervisor_name || '指导教师'),
          _rawTeacherId: item.teacher_id || item.teacherId || null,
          status: normalizedStatus,
          statusText: this.formatStatusText(rawStatus),
          updateTime: item.updateTime || item.updated_at || item.created_at || '暂无更新时间',
          fileUrl: item.fileUrl || item.oss_key || item.file_url || '',
          hasReview: !!item.hasReview,
          hasAnnotations: !!item.hasAnnotations,
          statusHistory: item.statusHistory || item.status_history || [
            {
              time: item.updateTime || item.updated_at || item.created_at || new Date().toLocaleString('zh-CN'),
              content: `当前状态：${studentDisplayStatusLabel(rawStatus)}`
            }
          ]
        };
      });
    },

    transformPapersToGroups(papers, localPapers = {}) {
      const formattedPapers = this.formatPaperData(
        (papers || []).map(paper => ({
          ...paper,
          fileUrl: paper.fileUrl || localPapers[paper.id] || paper.oss_key || ''
        }))
      );

      const groupsMap = new Map();
      formattedPapers.forEach(paper => {
        const teacherId = paper._rawTeacherId || paper.teacherId || `teacher_${paper.id || Date.now()}`;
        const teacherName = paper.teacher || '指导教师';
        if (!groupsMap.has(teacherId)) {
          groupsMap.set(teacherId, {
            teacherId,
            teacherName,
            papers: []
          });
        }
        groupsMap.get(teacherId).papers.push({
          ...paper,
          teacher: teacherName,
          teacherId,
          _rawTeacherId: paper._rawTeacherId || teacherId
        });
      });
      return Array.from(groupsMap.values());
    },

    mergePaperDetail(paper, detail = {}) {
      const mergedPaper = {
        ...paper,
        oss_key: detail.oss_key || paper.oss_key || '',
        pdf_oss_key: detail.pdf_oss_key || paper.pdf_oss_key || '',
        version: String(detail.version || paper.version || '1.0').replace(/^v/i, ''),
        updateTime: detail.updated_at || paper.updateTime || '暂无更新时间',
        fileUrl: detail.oss_key || detail.pdf_oss_key || paper.fileUrl || ''
      };
      const normalizedStatus = String(detail.status || paper.status || '').toLowerCase().trim();
      if (normalizedStatus) {
        mergedPaper.status = normalizedStatus;
        mergedPaper.statusText = this.formatStatusText(detail.status || paper.status);
        mergedPaper.statusHistory = this.buildStatusHistory({
          ...paper,
          ...detail,
          status: detail.status || paper.status
        });
      }
      return mergedPaper;
    },

    getFileUrl(rawPath) {
      if (!rawPath) return '';
      if (/^https?:\/\//i.test(rawPath)) return rawPath;
      if (rawPath.startsWith('/doc/essay/')) {
        return `${config.baseURL}${encodeURI(rawPath)}`;
      }
      const filename = rawPath.split('/').pop();
      if (!filename) return '';
      return `${config.baseURL}/doc/essay/${encodeURIComponent(filename)}`;
    },

    async fetchPaperDetailForAction(paper) {
      const detail = await getPaperDetail(paper.id);
      if (!detail?.id) {
        throw new Error('获取论文详情失败');
      }
      const mergedPaper = this.mergePaperDetail(paper, detail);
      this.updatePaperInList(paper.id, mergedPaper);
      this.savePapersToLocalStorage();
      return mergedPaper;
    },

    hasReviewResponse(res) {
      const payload = (res && typeof res.data === 'object' && res.data) ? res.data : res;
      return !!(
        payload?.review_content ||
        payload?.reviewContent ||
        res?.code === 200 ||
        payload?.code === 200 ||
        (typeof res?.message === 'string' && res.message.includes('成功')) ||
        (typeof payload?.message === 'string' && payload.message.includes('成功'))
      );
    },

    getAnnotationListFromResponse(res) {
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.data)) return res.data;
      return [];
    },

    async enrichPaperActionAvailability(paper) {
      const enrichedPaper = { ...paper, hasReview: false, hasAnnotations: false };

      const [reviewResult, annotationResult] = await Promise.allSettled([
        getPaperReview(paper.id),
        getAnnotationsByPaperId(paper.id)
      ]);

      if (reviewResult.status === 'fulfilled') {
        enrichedPaper.hasReview = this.hasReviewResponse(reviewResult.value);
      }

      if (annotationResult.status === 'fulfilled') {
        const annotationList = this.getAnnotationListFromResponse(annotationResult.value);
        enrichedPaper.hasAnnotations = annotationList.length > 0;
      }

      return enrichedPaper;
    },

    async refreshPaperActionAvailability() {
      if (!this.paperGroups.length) return;

      const nextGroups = await Promise.all(
        this.paperGroups.map(async (group) => ({
          ...group,
          papers: await Promise.all((group.papers || []).map(paper => this.enrichPaperActionAvailability(paper)))
        }))
      );

      this.paperGroups = nextGroups;
      this.savePapersToLocalStorage();

      if (this.cache.api.paperWorkbenchData) {
        this.cache.api.paperWorkbenchData = JSON.parse(JSON.stringify(this.paperGroups));
        this.cache.apiTime.paperWorkbenchData = Date.now();
      }
    },

    async pollForPaperId(existingPaperIds, maxAttempts = 10, interval = 500) {
      const userInfo = uni.getStorageSync('userInfo') || {};
      const numericUserId = parseInt(userInfo.sub || 0, 10);
      for (let i = 0; i < maxAttempts; i++) {
        try {
          const listRes = await getPaperList({ owner_id: numericUserId });
          const papers = Array.isArray(listRes)
            ? listRes
            : (Array.isArray(listRes?.data) ? listRes.data : []);
          const newPapers = papers.filter(paper => !existingPaperIds.has(paper.id));
          if (newPapers.length > 0) {
            newPapers.sort((a, b) => Number(b.id) - Number(a.id));
            return newPapers[0].id;
          }
          if (i < maxAttempts - 1) {
            await new Promise(resolve => setTimeout(resolve, interval));
          }
        } catch (err) {
          if (i < maxAttempts - 1) {
            await new Promise(resolve => setTimeout(resolve, interval));
          }
        }
      }
      return null;
    },

    async getPaperWorkbenchData(forceRefresh = false) {
      const cacheKey = 'paperWorkbenchData';
      const now = Date.now();
      const cachedData = this.cache.api[cacheKey];
      const cacheTime = this.cache.apiTime[cacheKey];
      const userInfo = uni.getStorageSync('userInfo') || {};
      const numericUserId = parseInt(userInfo.sub || 0, 10);

      if (!forceRefresh && cachedData && (now - cacheTime < CONFIG.CACHE_TTL)) {
        this.paperGroups = JSON.parse(JSON.stringify(cachedData));
        this.updatePaperIdsFromGroups();
        this.updateStats();
        const studentUsername = userInfo.username || userInfo.owner_id || userInfo.student_id || '';
        if (studentUsername) {
          await this.fetchAndApplyTeacherUsername(studentUsername);
        }
        await this.refreshPaperActionAvailability();
        this.paperCardLoading = false;
        return;
      }

      if (!numericUserId) {
        this.paperGroups = [];
        this.paperIds = [];
        this.updateStats();
        this.paperCardLoading = false;
        return;
      }

      if (!forceRefresh) {
        const loadedFromStorage = this.loadPapersFromLocalStorage(numericUserId);
        if (loadedFromStorage) {
          this.paperCardLoading = false;
        }
      }

      this.paperCardLoading = true;
      try {
        const res = await getPaperList({ owner_id: numericUserId });
        let paperData = null;
        if (res && res.code === 200 && Array.isArray(res.data)) {
          paperData = res.data;
        } else if (Array.isArray(res)) {
          paperData = res;
        } else if (Array.isArray(res?.data)) {
          paperData = res.data;
        }

        if (paperData && paperData.length > 0) {
          const myPapers = paperData.filter(paper => !paper.owner_id || paper.owner_id === numericUserId);
          const formattedPapers = this.formatPaperData(myPapers.length > 0 ? myPapers : paperData);
          const detailedPapers = await Promise.all(
            formattedPapers.map(async (paper) => {
              try {
                const detail = await getPaperDetail(paper.id);
                return this.mergePaperDetail(paper, detail);
              } catch (error) {
                return paper;
              }
            })
          );

          this.paperGroups = this.transformPapersToGroups(detailedPapers);
          this.updatePaperIdsFromGroups();
          this.cache.api[cacheKey] = JSON.parse(JSON.stringify(this.paperGroups));
          this.cache.apiTime[cacheKey] = Date.now();
          this.updateStats();
          this.clearCaches();
          this.savePapersToLocalStorage();

          const studentUsername = userInfo.username || userInfo.owner_id || userInfo.student_id || '';
          if (studentUsername) {
            await this.fetchAndApplyTeacherUsername(studentUsername);
            this.cache.api[cacheKey] = JSON.parse(JSON.stringify(this.paperGroups));
            this.cache.apiTime[cacheKey] = Date.now();
            this.savePapersToLocalStorage();
          }
          await this.refreshPaperActionAvailability();
        } else {
          this.paperGroups = [];
          this.paperIds = [];
          this.updateStats();
          this.savePapersToLocalStorage();
        }
      } catch (err) {
        console.error('获取论文卡片数据失败:', err);
        if (!this.loadPapersFromLocalStorage(numericUserId)) {
          this.paperGroups = [];
          this.paperIds = [];
          this.updateStats();
        }
      } finally {
        this.paperCardLoading = false;
      }
    },

    async fetchAllPaperStatus(forceRefresh = false) {
      const now = Date.now();
      if (!forceRefresh && this._lastStatusRefresh && (now - this._lastStatusRefresh < 5000)) {
        uni.showToast({ title: '刷新太频繁，请稍后再试', icon: 'none' });
        return;
      }
      this._lastStatusRefresh = now;

      if (this.paperCards.length === 0) {
        uni.showToast({ title: '暂无论文', icon: 'none' });
        return;
      }

      this.paperCardLoading = true;
      try {
        const results = await Promise.all(
          this.paperCards.map(async (paper) => {
            try {
              const detail = await getPaperDetail(paper.id);
              return { paper, detail };
            } catch (error) {
              return { paper, detail: null };
            }
          })
        );

        let updatedCount = 0;
        results.forEach(({ paper, detail }) => {
          if (!detail) return;
          const mergedPaper = this.mergePaperDetail(paper, detail);
          const changed =
            mergedPaper.status !== paper.status ||
            mergedPaper.updateTime !== paper.updateTime ||
            JSON.stringify(mergedPaper.statusHistory || []) !== JSON.stringify(paper.statusHistory || []);
          this.updatePaperInList(paper.id, mergedPaper);
          if (changed) updatedCount++;
        });

        this.updateStats();
        this.savePapersToLocalStorage();
        this.cache.api.paperWorkbenchData = JSON.parse(JSON.stringify(this.paperGroups));
        this.cache.apiTime.paperWorkbenchData = Date.now();
        await this.refreshPaperActionAvailability();
        uni.showToast({
          title: updatedCount > 0 ? `已更新${updatedCount}篇论文状态` : '状态已是最新',
          icon: 'success'
        });
      } catch (error) {
        console.error('刷新论文状态失败:', error);
        uni.showToast({ title: '刷新论文状态失败', icon: 'none' });
      } finally {
        this.paperCardLoading = false;
      }
    },

    canUpdatePaper(status) {
      return mapBackendStatusToStudentDisplayBucket(status) === STUDENT_DISPLAY_BUCKETS.PENDING_REVISION;
    },

    getUpdateDisabledReason(status) {
      const bucket = mapBackendStatusToStudentDisplayBucket(status);
      const normalizedStatus = String(status || '').toLowerCase().trim();
      if (bucket === STUDENT_DISPLAY_BUCKETS.FINALIZED) return '论文已定稿，无法再进行更新';
      if (normalizedStatus === 'updated' || normalizedStatus === 'update_complete') return '论文已提交更新，请等待教师审阅';
      if (['pending_review', 'reviewing', 'under_review', 'in_review', 'review_pending'].includes(normalizedStatus)) return '论文正在等待教师审阅，请耐心等待';
      return '论文刚上传，请等待教师开始审阅';
    },

    canViewPaperFeedback(paper) {
      const bucket = mapBackendStatusToStudentDisplayBucket(paper?.status);
      return [
        STUDENT_DISPLAY_BUCKETS.PENDING_REVISION,
        STUDENT_DISPLAY_BUCKETS.FINALIZED
      ].includes(bucket);
    },

    canViewReview(paper) {
      return this.canViewPaperFeedback(paper);
    },

    canViewAnnotations(paper) {
      return this.canViewPaperFeedback(paper);
    },

    displayStep(status) {
      return studentDisplayStep(status);
    },

    handleUpdateClick(paper) {
      if (!this.canUpdatePaper(paper.status)) {
        uni.showToast({ title: this.getUpdateDisabledReason(paper.status), icon: 'none', duration: 2500 });
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
      // #ifdef H5
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          this.updateSelectedFile = { name: file.name, size: file.size, path: file };
        }
      };
      input.click();
      // #endif

      // #ifndef H5
      uni.chooseMessageFile({
        count: 1,
        type: 'file',
        extension: ['.docx'],
        success: (res) => {
          const file = res.tempFiles[0];
          this.updateSelectedFile = { name: file.name, size: file.size, path: file.path };
        },
        fail: (err) => {
          console.error('选择文件失败:', err);
          uni.showToast({ title: '选择文件失败', icon: 'none' });
        }
      });
      // #endif
    },

    async submitUpdatePaper() {
      if (!this.updateSelectedFile || !this.updateVersion) {
        uni.showToast({ title: '请选择文件并输入版本号', icon: 'none' });
        return;
      }

      const versionRegex = /^v\d+\.\d+$/;
      if (!versionRegex.test(this.updateVersion)) {
        uni.showToast({ title: '版本号格式不正确（如 v2.0）', icon: 'none' });
        return;
      }

      const currentVersion = parseFloat(this.updatePaperItem.version);
      const newVersion = parseFloat(this.updateVersion.replace('v', ''));
      if (newVersion <= currentVersion) {
        uni.showToast({ title: `新版本必须大于当前版本 v${this.updatePaperItem.version}`, icon: 'none' });
        return;
      }

      const paperId = this.updatePaperItem.id;
      const filePath = this.updateSelectedFile.path;
      const version = this.updateVersion;
      const currentStatus = String(this.updatePaperItem.status || '').trim();

      this.closeUpdateModal();
      uni.showLoading({ title: '更新中...', mask: true });
      try {
        await updatePaperVersion(paperId, filePath, version);
        if (['pending_update', 'update_pending'].includes(currentStatus.toLowerCase())) {
          try {
            await updatePaperStatus(paperId, { status: 'updated' });
          } catch (statusErr) {
            console.error('更新论文状态失败:', statusErr);
          }
        }
        uni.hideLoading();
        uni.showToast({ title: '更新成功', icon: 'success' });
        await this.getPaperWorkbenchData(true);
      } catch (err) {
        uni.hideLoading();
        console.error('提交论文更新失败:', err);
        uni.showToast({ title: err.message || '更新失败', icon: 'none' });
      }
    },

    async viewReview(paper) {
      if (!this.canViewReview(paper)) {
        uni.showToast({ title: '论文处于待审阅阶段，暂不可查看', icon: 'none', duration: 2000 });
        return;
      }
      uni.showLoading({ title: '加载审阅内容...' });
      try {
        const res = await getPaperReview(paper.id);
        uni.hideLoading();
        const payload = (res && typeof res.data === 'object' && res.data) ? res.data : res;
        const hasReviewContent = !!(payload?.review_content || payload?.reviewContent);
        const requestSucceeded =
          hasReviewContent ||
          res?.code === 200 ||
          payload?.code === 200 ||
          (typeof res?.message === 'string' && res.message.includes('成功')) ||
          (typeof payload?.message === 'string' && payload.message.includes('成功'));

        if (requestSucceeded) {
          this.currentReview = {
            paperId: paper.id,
            paperTitle: paper.title,
            reviewContent: payload?.review_content || payload?.reviewContent || '暂无审阅内容',
            reviewTime: payload?.review_time || payload?.created_at || payload?.reviewTime || '',
            updatedTime: payload?.updated_time || payload?.updated_at || '',
            teacherId: payload?.teacher_id || ''
          };
          this.showReviewModal = true;
        } else {
          uni.showToast({ title: payload?.message || res?.message || '暂无审阅内容', icon: 'none' });
        }
      } catch (err) {
        uni.hideLoading();
        uni.showToast({ title: err.message || '获取审阅内容失败', icon: 'none' });
      }
    },

    closeReviewModal() {
      this.showReviewModal = false;
      this.currentReview = null;
    },

    async deletePaperAttachments(paperId) {
      try {
        const { getAttachmentList, deleteAttachment } = await import('../../api/student.js');
        const res = await getAttachmentList(paperId);
        let attachments = [];
        if (res && res.code === 200 && Array.isArray(res.data)) {
          attachments = res.data;
        } else if (Array.isArray(res)) {
          attachments = res;
        }
        await Promise.all(
          attachments.map(attachment => {
            const attachmentId = attachment.id || attachment.material_id;
            if (!attachmentId) return Promise.resolve();
            return deleteAttachment(attachmentId).catch(error => {
              console.error(`删除附件 ${attachmentId} 失败:`, error);
              return null;
            });
          })
        );
      } catch (error) {
        console.error(`获取论文 ${paperId} 附件列表失败:`, error);
      }
    },

    showConfirm(title, content, callback) {
      this.confirmModalTitle = title;
      this.confirmModalContent = content;
      this.confirmModalCallback = callback;
      this.showConfirmModal = true;
    },

    handleConfirmModalConfirm() {
      this.showConfirmModal = false;
      if (this.confirmModalCallback) {
        this.confirmModalCallback(true);
      }
      this.confirmModalCallback = null;
    },

    handleConfirmModalCancel() {
      this.showConfirmModal = false;
      if (this.confirmModalCallback) {
        this.confirmModalCallback(false);
      }
      this.confirmModalCallback = null;
    },

    deletePaper(paperId, paperTitle) {
      this.showConfirm('确认删除', `确定要删除论文《${paperTitle || '未命名论文'}》吗？此操作不可恢复。`, async (confirmed) => {
        if (!confirmed) return;
        try {
          await this.deletePaperAttachments(paperId);
          await deletePaper(paperId);
          this.paperGroups = this.paperGroups
            .map(group => ({
              ...group,
              papers: (group.papers || []).filter(paper => paper.id !== paperId)
            }))
            .filter(group => group.papers.length > 0);
          this.updatePaperIdsFromGroups();
          this.updateStats();
          this.savePapersToLocalStorage();
          uni.showToast({ title: '删除成功', icon: 'success' });
        } catch (error) {
          console.error('删除论文失败:', error);
          uni.showToast({ title: error.message || '删除失败', icon: 'none' });
        }
      });
    },

    parseAnnotationContent(content) {
      if (!content) return { selected: '', annotation: '', suggestion: '' };
      const selectedMatch = content.match(/选中内容：([\s\S]*?)(?=批注：|$)/);
      const annotationMatch = content.match(/批注：([\s\S]*?)(?=建议：|$)/);
      const suggestionMatch = content.match(/建议：([\s\S]*)/);
      return {
        selected: selectedMatch ? selectedMatch[1].replace(/<[^>]+>/g, '').trim() : '',
        annotation: annotationMatch ? annotationMatch[1].replace(/<[^>]+>/g, '').trim() : '',
        suggestion: suggestionMatch ? suggestionMatch[1].replace(/<[^>]+>/g, '').trim() : ''
      };
    },

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

    async viewAnnotations(paper) {
      if (!this.canViewAnnotations(paper)) {
        uni.showToast({ title: '论文处于待审阅阶段，暂不可查看', icon: 'none', duration: 2000 });
        return;
      }
      uni.showLoading({ title: '加载批注中...' });
      try {
        const res = await getAnnotationsByPaperId(paper.id);
        uni.hideLoading();
        let annotations = [];
        if (res && Array.isArray(res)) {
          annotations = res.map(item => ({
            id: item.id,
            source: item.author_id === 1 ? 'teacher' : 'AI',
            content: this.parseAnnotationContent(item.content),
            rawContent: item.content,
            time: this.formatTime(item.created_at),
            coordinates: item.coordinates,
            paragraphId: item.paragraph_id,
            authorId: item.author_id,
            created_at: item.created_at,
            processed: false
          }));
        }
        if (annotations.length === 0) {
          uni.showToast({ title: '暂无批注', icon: 'none' });
          return;
        }
        const app = getApp();
        app.globalData.previewAnnotations = annotations;
        const url = `/pages/student/paperPreview?id=${paper.id}&title=${encodeURIComponent(paper.title || '论文预览')}&showAnnotations=true`;
        uni.navigateTo({
          url,
          fail: (err) => {
            console.error('跳转论文预览失败:', err);
            uni.showToast({ title: '页面跳转失败', icon: 'none' });
          }
        });
      } catch (error) {
        uni.hideLoading();
        console.error('获取批注失败:', error);
        uni.showToast({ title: '获取批注失败', icon: 'none' });
      }
    },

    async viewPaper(paper) {
      if (!paper || !paper.id) {
        uni.showToast({ title: '论文信息无效', icon: 'none' });
        return;
      }
      let previewWindow = null;
      // #ifdef H5
      previewWindow = window.open('', '_blank');
      if (previewWindow) {
        previewWindow.document.write('<title>论文预览加载中</title><p style="padding:24px;font-family:Arial,sans-serif;color:#333;">正在加载论文预览...</p>');
      }
      // #endif

      uni.showLoading({ title: '加载论文中...', mask: true });
      let paperDetail = paper;
      try {
        paperDetail = await this.fetchPaperDetailForAction(paper);
      } catch (error) {
        // #ifdef H5
        if (previewWindow) previewWindow.close();
        // #endif
        uni.hideLoading();
        uni.showToast({ title: error.message || '获取论文详情失败', icon: 'none' });
        return;
      }

      const hasRealFile = paperDetail.oss_key || paperDetail.pdf_oss_key;
      if (!hasRealFile) {
        // #ifdef H5
        if (previewWindow) previewWindow.close();
        // #endif
        uni.hideLoading();
        uni.showModal({
          title: '提示',
          content: '该论文暂无可预览文件，请稍后重试或下载源文件查看。',
          showCancel: false,
          confirmText: '知道了'
        });
        return;
      }

      if (!paperDetail.pdf_oss_key) {
        // #ifdef H5
        if (previewWindow) previewWindow.close();
        // #endif
        uni.hideLoading();
        uni.showModal({
          title: '提示',
          content: '该论文暂时没有 PDF 版本，是否下载 Word 版本查看？',
          confirmText: '下载',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) this.downloadPaper(paperDetail);
          }
        });
        return;
      }

      const fileUrl = this.getFileUrl(paperDetail.pdf_oss_key);
      if (!fileUrl) {
        // #ifdef H5
        if (previewWindow) previewWindow.close();
        // #endif
        uni.hideLoading();
        uni.showToast({ title: '论文预览链接无效', icon: 'none' });
        return;
      }

      // #ifdef H5
      if (previewWindow) {
        previewWindow.location.href = fileUrl;
      } else {
        window.open(fileUrl, '_blank');
      }
      // #endif
      // #ifndef H5
      uni.downloadFile({
        url: fileUrl,
        success: (res) => {
          if (res.statusCode === 200) {
            uni.openDocument({ filePath: res.tempFilePath, showMenu: true });
          }
        }
      });
      // #endif
      uni.hideLoading();
    },

    async downloadPaper(paper) {
      if (!paper || !paper.id) {
        uni.showToast({ title: '论文信息不完整', icon: 'none' });
        return;
      }
      uni.showLoading({ title: '加载论文中...', mask: true });
      let paperDetail = paper;
      try {
        paperDetail = await this.fetchPaperDetailForAction(paper);
      } catch (error) {
        uni.hideLoading();
        uni.showToast({ title: error.message || '获取论文详情失败', icon: 'none' });
        return;
      }
      uni.hideLoading();

      if (!paperDetail.oss_key) {
        this.showConfirm('提示', '该论文为演示数据，无法下载。请先上传真实论文文件。', () => {});
        return;
      }

      const fileUrl = this.getFileUrl(paperDetail.oss_key);
      if (!fileUrl) {
        uni.showToast({ title: '论文下载链接无效', icon: 'none' });
        return;
      }

      const downloadName = `${paperDetail.title || '论文'}.docx`;
      this.showConfirm('下载确认', `即将下载论文《${paperDetail.title}》，是否继续？`, async (confirmed) => {
        if (!confirmed) return;
        uni.showLoading({ title: '下载中...', mask: true });
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
          uni.showToast({ title: '下载完成', icon: 'success' });
        } catch (error) {
          console.error('下载论文失败:', error);
          uni.showToast({ title: '下载失败', icon: 'none' });
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
                success: () => uni.showToast({ title: '文件已保存', icon: 'success' }),
                fail: () => uni.showToast({ title: '保存失败', icon: 'none' })
              });
            } else {
              uni.showToast({ title: '下载失败', icon: 'none' });
            }
            uni.hideLoading();
          },
          fail: () => {
            uni.showToast({ title: '下载失败', icon: 'none' });
            uni.hideLoading();
          }
        });
        // #endif
      });
    },

    getStatusText(status) {
      if (status == null || String(status).trim() === '') return '待审阅';
      return studentDisplayStatusLabel(status);
    },
    
    getSeverityText(severity) {
      const severityMap = {
        'high': '高风险',
        'medium': '中风险',
        'low': '建议'
      };
      return severityMap[severity] || '';
    },
    
    // 测试数据
  }
}
</script>
<style scoped>
/* ===== CSS 变量（教师端风格） ===== */
.student-workbench-container {
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
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-10: 2.5rem;
  --spacing-12: 3rem;
  
  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-full: 9999px;
  
  display: flex;
  min-height: 100vh;
  background: var(--surface);
  font-family: var(--font-body);
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}

/* 页面淡出动画 */
.student-workbench-container.page-fade-out {
  opacity: 0;
  transform: scale(0.98);
}

/* 页面淡入动画 */
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

/* ===== 侧边栏 - 白色背景 ===== */
.sidebar {
  position: fixed;
  left: 0;
  top: 64px;
  height: calc(100vh - 64px);
  width: clamp(200px, 18vw, 280px);
  background: #ffffff;
  box-shadow: var(--shadow-ambient);
  z-index: 98;
  display: flex;
  flex-direction: column;
  padding: clamp(16px, 1.5vw, 24px);
  overflow-y: auto;
  box-sizing: border-box;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  margin-bottom: 32px;
  flex-shrink: 0;
}

.brand-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 91, 191, 0.3);
}

.brand-icon .material-symbols-outlined {
  font-size: 20px;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-size: clamp(14px, 1.2vw, 16px);
  font-weight: 800;
  color: var(--primary);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.brand-subtitle {
  font-size: clamp(8px, 0.7vw, 9px);
  font-weight: 600;
  color: var(--on-surface-variant);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-top: 2px;
  white-space: nowrap;
}

/* 上传功能区 */
.sidebar-upload-section {
  padding: 0;
  margin-bottom: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  flex-shrink: 0;
}

.upload-btn {
  width: 100%;
  padding: clamp(10px, 1vw, 12px) clamp(12px, 1.2vw, 16px);
  border: none;
  border-radius: var(--radius-md);
  font-size: clamp(12px, 1vw, 14px);
  font-weight: 600;
  font-family: var(--font-body);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(6px, 0.5vw, 8px);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.upload-btn .material-symbols-outlined {
  font-size: 18px;
}

.upload-btn.primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  color: white;
  box-shadow: var(--shadow-primary);
}

.upload-btn.primary:hover {
  box-shadow: 0 6px 20px rgba(0, 91, 191, 0.35);
  transform: translateY(-1px);
}

.upload-btn.secondary {
  background: var(--surface-container-low);
  color: var(--primary);
  box-shadow: var(--shadow-sm);
}

.upload-btn.secondary:hover {
  background: var(--surface-container-high);
}

.upload-btn:active {
  transform: scale(0.98);
}

/* 区域分隔 - 使用间距而非线条 */
.sidebar-divider {
  height: var(--spacing-4);
  flex-shrink: 0;
}

/* 导航菜单 - 垂直药丸形状 */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  flex-shrink: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: clamp(8px, 0.8vw, 12px);
  padding: clamp(10px, 1vw, 12px) clamp(14px, 1.2vw, 16px);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  color: var(--on-surface-variant);
}

.nav-item .material-symbols-outlined {
  font-size: clamp(18px, 1.5vw, 20px);
  flex-shrink: 0;
}

.nav-label {
  font-size: clamp(13px, 1vw, 14px);
  font-weight: 500;
  font-family: var(--font-body);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-item:hover {
  background: var(--surface-container-low);
  color: var(--primary);
}

.nav-item.active {
  background: var(--primary-fixed);
  color: var(--on-primary-fixed);
}

/* 系统公告区域 */
.sidebar-notice-section {
  padding: clamp(12px, 1.2vw, 16px);
  background: var(--surface-container-low);
  border-radius: var(--radius-md);
  flex-shrink: 0;
  box-sizing: border-box;
}

.sidebar-notice-header {
  display: flex;
  align-items: center;
  gap: clamp(6px, 0.5vw, 8px);
  margin-bottom: clamp(10px, 1vw, 12px);
}

.sidebar-notice-header .material-symbols-outlined {
  font-size: clamp(16px, 1.4vw, 18px);
  color: var(--primary);
  flex-shrink: 0;
}

.sidebar-notice-title {
  font-size: clamp(12px, 0.9vw, 13px);
  font-weight: 600;
  font-family: var(--font-body);
  color: var(--on-surface);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-notice-more {
  font-size: 0.6875rem;
  font-weight: 500;
  font-family: var(--font-body);
  color: var(--primary);
  cursor: pointer;
}

.sidebar-notice-more:hover {
  text-decoration: underline;
}

.sidebar-notice-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.sidebar-notice-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--surface-container-lowest);
}

.sidebar-notice-item:hover {
  background: var(--surface-container-high);
}

.sidebar-notice-dot {
  width: 6px;
  height: 6px;
  background: var(--primary);
  border-radius: 50%;
  flex-shrink: 0;
}

.sidebar-notice-dot.urgent {
  background: var(--error);
}

.sidebar-notice-item.urgent {
  background: var(--error-container);
}

.sidebar-notice-content {
  font-size: 0.6875rem;
  font-weight: 400;
  font-family: var(--font-body);
  color: var(--on-surface-variant);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.sidebar-no-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 0;
  min-height: 60rpx;
}

.sidebar-no-notice text {
  font-size: 24rpx;
  font-weight: 400;
  font-family: var(--font-body);
  color: var(--outline);
}

/* 截止时间通知区域 */
.sidebar-deadline-section {
  margin-top: var(--spacing-2);
  padding: var(--spacing-4);
  background: var(--surface-container-low);
  border-radius: var(--radius-md);
  flex-shrink: 0;
  box-sizing: border-box;
  transition: background 0.3s ease;
}

/* 有截止时间数据时显示红色背景 */
.sidebar-deadline-section.has-data {
  background: var(--error-container);
}

.sidebar-notice-item.deadline {
  background: transparent;
}

.sidebar-notice-item.deadline:hover {
  background: var(--surface-container-high);
}

.sidebar-notice-dot.deadline {
  background: var(--error);
}

/* 截止时间空状态 */
.sidebar-no-deadline {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 0;
  min-height: 60rpx;
}

.no-deadline-text {
  font-size: 24rpx;
  font-weight: 400;
  font-family: var(--font-body);
  color: var(--outline);
}

/* ===== 主内容区（与教师端一致，居中布局） ===== */
.main-content {
  flex: 1;
  margin-left: clamp(200px, 18vw, 280px);
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* ===== 顶部标题栏（全宽） ===== */
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
  padding: 0 var(--spacing-8);
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
  gap: var(--spacing-3);
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
  gap: var(--spacing-4);
}

.notification-icon {
  position: relative;
  cursor: pointer;
  padding: var(--spacing-2);
  border-radius: var(--radius-md);
  transition: background 0.2s;
}

.notification-icon:hover {
  background: var(--surface-container-low);
}

.notification-icon .material-symbols-outlined {
  font-size: 22px;
  color: var(--on-surface-variant);
}

.notification-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background: var(--error);
  border-radius: 50%;
  border: 2px solid var(--surface-container-lowest);
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

.profile-avatar {
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

.profile-info {
  display: flex;
  flex-direction: column;
}

.profile-name {
  font-size: 16px;
  font-weight: 600;
  font-family: var(--font-body);
  color: var(--on-surface);
}

.profile-role {
  font-size: 12px;
  font-weight: 400;
  font-family: var(--font-body);
  color: var(--on-surface-variant);
}

@media screen and (max-width: 767px) {
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
  font-family: var(--font-display);
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
  font-family: var(--font-body);
  color: white;
}

.user-card-info .user-id {
  font-size: 13px;
  font-weight: 400;
  font-family: var(--font-body);
  color: rgba(255, 255, 255, 0.8);
}

.user-role-badge {
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
  font-family: var(--font-body);
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

/* ===== 内容画布（教师端风格：居中布局） ===== */
.content-canvas {
  flex: 1;
  padding: 88px var(--spacing-8) var(--spacing-6);
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  overflow: visible;
  display: flex;
  flex-direction: column;
}

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
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 15px;
  color: var(--on-surface-variant);
  margin: 0;
}

.highlight {
  color: var(--primary);
  font-weight: 700;
}

/* ===== 统计信息卡片 ===== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);
  flex-shrink: 0;
}

.stat-card {
  background: var(--surface-container-lowest);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  transition: all 0.2s ease;
}

.stat-card:hover {
  background: var(--surface-bright);
  box-shadow: var(--shadow-ambient);
}

.stat-icon {
  font-size: 24px;
  color: var(--primary);
  font-family: 'Material Symbols Outlined', sans-serif;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  font-family: var(--font-display);
  color: var(--primary);
  line-height: 1;
  letter-spacing: -0.02em;
}

.stat-value.pending {
  color: var(--error);
}

.stat-value.updated,
.stat-value.pending-revision {
  color: var(--tertiary);
}

.stat-value.finalized {
  color: var(--tertiary);
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 500;
  font-family: var(--font-body);
  color: var(--on-surface-variant);
  margin-top: var(--spacing-1);
}
/* ===== 论文列表 - 表面层级设计 ===== */
.thesis-section {
  background: var(--surface-container-lowest);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: visible;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
  flex-shrink: 0;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  font-family: var(--font-display);
  color: var(--on-surface);
  letter-spacing: -0.02em;
}

.notice-more {
  color: var(--primary);
  font-size: 0.875rem;
  font-weight: 500;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.2s ease;
}

.notice-more:hover {
  color: var(--primary-container);
}

.thesis-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  overflow-y: auto;
  flex: 1;
}

.teacher-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.group-title {
  font-size: 0.75rem;
  font-weight: 600;
  font-family: var(--font-body);
  color: var(--on-surface-variant);
  padding: var(--spacing-2) 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.thesis-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background: var(--surface-container-low);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.thesis-card:hover {
  background: var(--surface-container-high);
  box-shadow: var(--shadow);
}

.card-avatar-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  min-width: 180px;
  flex-shrink: 0;
}

.student-avatar {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  font-weight: 700;
  font-family: var(--font-display);
}

.student-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.student-name {
  font-size: 1rem;
  font-weight: 600;
  font-family: var(--font-body);
  color: var(--on-surface);
}

.student-id {
  font-size: 0.75rem;
  font-weight: 400;
  font-family: var(--font-body);
  color: var(--on-surface-variant);
}

/* Status Chips - 使用设计系统颜色 */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
  font-family: var(--font-body);
  margin-top: var(--spacing-1);
}

.status-badge.status-uploaded,
.status-badge.status-pending_review {
  background: var(--amber-tint);
  color: var(--on-amber);
}

.status-badge.status-finalized,
.status-badge.status-approved {
  background: var(--tertiary-container);
  color: var(--on-tertiary-container);
}

.status-badge.status-updated {
  background: var(--error-container);
  color: var(--on-error-container);
}

.status-dot {
  width: 6px;
  height: 6px;
  background: currentColor;
  border-radius: 50%;
  display: inline-block;
}

.card-detail-section {
  flex: 1;
  min-width: 0;
}

.detail-header {
  font-size: 0.75rem;
  font-weight: 500;
  font-family: var(--font-body);
  color: var(--on-surface-variant);
  margin-bottom: var(--spacing-2);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.detail-label {
  color: var(--on-surface-variant);
  font-size: 0.75rem;
  font-family: var(--font-body);
}

.group-title-icon {
  margin-right: 4px;
  font-family: 'Material Symbols Outlined', sans-serif;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
}

.paper-title {
  font-size: 1.125rem;
  font-weight: 700;
  font-family: var(--font-display);
  color: var(--on-surface);
  margin-bottom: var(--spacing-2);
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
  letter-spacing: -0.01em;
}

.paper-meta {
  display: flex;
  gap: var(--spacing-4);
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-3);
  background: var(--surface-container-low);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 400;
  font-family: var(--font-body);
  color: var(--on-surface-variant);
}

.meta-icon {
  font-size: 14px;
  font-family: 'Material Symbols Outlined', sans-serif;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
}

.card-action-section {
  display: flex;
  gap: var(--spacing-2);
  flex-shrink: 0;
}

.action-btn {
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  font-family: var(--font-body);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
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

.action-btn.secondary {
  background: var(--surface-container-low);
  color: var(--primary);
}

.action-btn.secondary:hover {
  background: var(--surface-container-high);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12) var(--spacing-8);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-4);
  opacity: 0.5;
  font-family: 'Material Symbols Outlined', sans-serif;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48;
}

.empty-text {
  font-size: 1rem;
  font-weight: 400;
  font-family: var(--font-body);
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
  max-width: 400px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: var(--shadow-ambient);
  animation: modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

/* 修改密码弹窗特定样式 - 固定宽度 400px */
.password-modal-content {
  max-width: 400px !important;
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

.modal-header.logout-header {
  background: linear-gradient(135deg, #fc8181 0%, #f56565 100%);
}

.modal-header.logout-header .modal-title,
.modal-header.logout-header .modal-close {
  color: white;
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

.btn-logout {
  background: linear-gradient(135deg, #fc8181 0%, #f56565 100%);
  color: white;
}

.btn-logout:hover {
  box-shadow: 0 4px 12px rgba(245, 101, 101, 0.3);
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

.paper-upload-notice-modal {
  width: 90%;
  max-width: 800rpx !important;
}

.paper-upload-notice-modal .modal-title {
  font-size: 1.25rem;
}

.paper-upload-notice-body {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--spacing-4);
  padding: var(--spacing-6) var(--spacing-5);
  text-align: left;
}

.paper-upload-notice-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-primary);
  align-self: center;
}

.paper-upload-notice-icon .material-symbols-outlined {
  font-size: 32px;
  color: white;
}

.paper-upload-notice-text {
  font-size: 1.05rem;
  font-weight: 400;
  font-family: var(--font-body);
  color: var(--on-surface-variant);
  line-height: 1.25;
  white-space: pre-line;
  word-break: break-word;
  text-align: left;
}

.paper-upload-notice-modal .btn {
  font-size: 0.95rem;
}

/* 退出登录弹窗 */
.logout-modal-body {
  padding: var(--spacing-8);
  text-align: center;
}

.logout-message {
  font-size: 1rem;
  font-weight: 400;
  font-family: var(--font-body);
  color: var(--on-surface);
}

/* ===== 系统公告 ===== */
.notice-section {
  background: var(--surface-container-lowest);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.notice-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background: var(--surface-container-low);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.notice-item:hover {
  background: var(--surface-container-high);
  box-shadow: var(--shadow);
}

.notice-item.urgent-notice {
  background: var(--amber-tint);
}

.notice-dot {
  font-size: 0.875rem;
  margin-top: 2px;
  flex-shrink: 0;
}

.notice-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  min-width: 0;
}

.notice-title {
  font-size: 1rem;
  font-weight: 600;
  font-family: var(--font-body);
  color: var(--on-surface);
}

.notice-content {
  font-size: 0.875rem;
  font-weight: 400;
  font-family: var(--font-body);
  color: var(--on-surface-variant);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-time {
  font-size: 0.75rem;
  font-weight: 400;
  font-family: var(--font-body);
  color: var(--outline);
  flex-shrink: 0;
}

.no-notice {
  padding: var(--spacing-8) 0;
  text-align: center;
  color: var(--outline);
  font-size: 1rem;
  font-weight: 400;
  font-family: var(--font-body);
}

/* 旧样式兼容 - 保留部分基础样式 */
.reviewing-val { color: #fa8c16 !important; }
.feedback-val  { color: #f5222d !important; }
.finalized-val { color: #52c41a !important; }
.notice-more {
  font-size: 26rpx;
  color: #1890ff;
  font-weight: 600;
  transition: all 0.3s ease;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
}
.notice-more:hover {
  background: rgba(24, 144, 255, 0.1);
}
.notice-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.notice-item {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  transition: all 0.3s ease;
  border-left: 4rpx solid #1890ff;
}
.notice-item:hover {
  transform: translateX(8rpx);
  box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.1);
}

/* 所有通知统一样式 */
.urgent-notice,
.status-notice,
.deadline-notice {
  border-left: 4rpx solid #1890ff;
  background: #f8f9fa;
}

.urgent-notice:hover,
.status-notice:hover,
.deadline-notice:hover {
  background: #e6f7ff;
  box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.1);
}
.notice-dot {
  font-size: 28rpx;
  color: #2d3748;
  margin-top: 4rpx;
  font-weight: bold;
}

.urgent-notice .notice-dot {
  color: #2d3748;
  font-size: 32rpx;
}

.status-notice .notice-dot {
  color: #2d3748;
}

.deadline-notice .notice-dot {
  color: #2d3748;
}
.notice-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.notice-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1a202c;
  line-height: 1.4;
}
.notice-content {
  font-size: 26rpx;
  color: #4a5568;
  line-height: 1.5;
}

.urgent-notice .notice-content {
  color: #2d3748;
  font-weight: 600;
}

.status-notice .notice-content {
  color: #2d3748;
}

.deadline-notice .notice-content {
  color: #2d3748;
}
.notice-time {
  font-size: 24rpx;
  color: #718096;
  font-weight: 500;
  white-space: nowrap;
  background: rgba(113, 128, 150, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

/* 响应式设计 */
@media (max-width: 1200rpx) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .thesis-card {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .card-action-section {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 1200px) {
  .content-canvas {
    padding: 80px 24px 20px;
  }
}

@media (max-width: 1100px) {
  .sidebar {
    width: clamp(180px, 22vw, 220px);
    padding: clamp(12px, 2vw, 20px);
  }
  
  .main-content {
    margin-left: clamp(180px, 22vw, 220px);
  }
  
  .brand-subtitle {
    display: none;
  }
  
  .sidebar-notice-section,
  .sidebar-deadline-section {
    display: none;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: clamp(56px, 10vw, 72px);
    padding: clamp(12px, 2vw, 16px) clamp(6px, 1vw, 10px);
  }
  
  .main-content {
    margin-left: clamp(56px, 10vw, 72px);
  }
  
  .sidebar-brand {
    justify-content: center;
    padding: 0;
  }
  
  .brand-text {
    display: none;
  }
  
  .sidebar-upload-section {
    padding: 0;
    gap: 8px;
  }
  
  .upload-btn {
    padding: 10px;
  }
  
  .upload-btn text:last-child {
    display: none;
  }
  
  .nav-label {
    display: none;
  }
  
  .nav-item {
    justify-content: center;
    padding: 10px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .content-canvas {
    padding: 80px 16px 16px;
  }
}

/* 上传弹窗样式 */
.upload-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  animation: modalBackdropIn 0.3s ease;
}

.upload-modal-content {
  width: 90%;
  max-width: 800rpx;
  background: #fff;
  border-radius: 20rpx;
  box-sizing: border-box;
  overflow: hidden;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.1);
  animation: modalContentIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modalBackdropIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalContentIn {
  from {
    opacity: 0;
    transform: translateY(-30rpx) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.upload-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #e2e8f0;
}

.upload-modal-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1a202c;
}

.upload-modal-close {
  font-size: 50rpx;
  color: #718096;
  width: 50rpx;
  height: 50rpx;
  text-align: center;
  transition: all 0.2s ease;
}

.upload-modal-close:active {
  color: #1677ff;
  transform: scale(0.9);
}

.upload-modal-body {
  padding: 30rpx;
}

.upload-modal-tips {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20rpx;
  font-size: 26rpx;
  color: #718096;
}

.upload-modal-tips .tips-line {
  font-size: 26rpx;
  line-height: 1.6;
}

/* 教师编号输入区域 */
.teacher-input-section {
  margin-bottom: 20rpx;
}

.input-label {
  display: block;
  font-size: 28rpx;
  color: #2d3748;
  margin-bottom: 10rpx;
  font-weight: 500;
}

.teacher-id-input {
  width: 100%;
  height: 80rpx;
  padding: 0 20rpx;
  border: 2rpx solid #e2e8f0;
  border-radius: 12rpx;
  font-size: 30rpx;
  color: #2d3748;
  background-color: #fff;
  box-sizing: border-box;
}

.teacher-id-input:focus {
  border-color: #1677ff;
  outline: none;
}

.teacher-info-display {
  width: 100%;
  height: 80rpx;
  padding: 0 20rpx;
  border: 2rpx solid #e2e8f0;
  border-radius: 12rpx;
  background-color: #f7fafc;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.teacher-info-text {
  font-size: 30rpx;
  color: #2d3748;
  font-weight: 500;
}

.teacher-inline-section {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  padding: 18rpx 0;
  border-bottom: 2rpx solid #f0f0f0;
}

.attachment-paper-section {
  align-items: flex-start;
  gap: 20rpx;
}

.attachment-paper-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  min-width: 0;
}

.attachment-paper-title {
  font-size: 30rpx;
  color: #2d3748;
  font-weight: 600;
  word-break: break-word;
}

.teacher-inline-label {
  font-size: 28rpx;
  color: #718096;
  flex-shrink: 0;
}

.teacher-inline-value {
  font-size: 30rpx;
  color: #2d3748;
  font-weight: 600;
}

.teacher-loading {
  color: #a0aec0;
  font-style: italic;
}

.teacher-error {
  color: #e53e3e;
  font-size: 26rpx;
}

.upload-modal-btn {
  width: 100%;
  padding: 22rpx 0;
  background-color: #1677ff;
  color: #fff;
  border-radius: 12rpx;
  font-size: 27rpx;
  border: none;
  margin-bottom: 20rpx;
}

.upload-modal-file-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background-color: #f7fafc;
  border-radius: 8rpx;
  margin-bottom: 30rpx;
}

.upload-modal-file-name {
  font-size: 26rpx;
  color: #2d3748;
}

.upload-modal-file-size {
  font-size: 24rpx;
  color: #718096;
}

.upload-modal-final-version {
  margin-bottom: 30rpx;
}

.upload-modal-checkbox-label {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  color: #2d3748;
}

/* 附件上传弹窗备注输入框样式 */
.upload-modal-remark {
  margin-bottom: 30rpx;
}

.remark-label {
  display: block;
  font-size: 28rpx;
  color: #2d3748;
  margin-bottom: 15rpx;
}

.remark-input {
  width: 100%;
  padding: 20rpx;
  border: 1rpx solid #e2e8f0;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #1a202c;
  background: #ffffff;
  box-sizing: border-box;
}

.remark-input:focus {
  border-color: #1677ff;
  outline: none;
}

.upload-modal-submit-btn {
  width: 100%;
  padding: 22rpx 0;
  background-color: #1677ff;
  color: #fff;
  border-radius: 12rpx;
  font-size: 27rpx;
  border: none;
}

.upload-modal-submit-btn:disabled {
  background-color: #e2e8f0;
  color: #718096;
}

/* 响应式设计优化 */
@media screen and (max-width: 750rpx) {
  /* 小屏幕设备适配 */
  .top-bar {
    padding: 0 20rpx;
    height: 80rpx;
  }
  .system-title {
    font-size: 28rpx;
  }
  .user-name {
    font-size: 24rpx;
  }
  .user-college {
    font-size: 20rpx;
  }
  
  .welcome-bar {
    padding: 20rpx;
  }
  .welcome-text {
    font-size: 32rpx;
  }
  .progress-tip {
    font-size: 24rpx;
  }
  
  .function-cards {
    padding: 10rpx;
    gap: 10rpx;
  }
  .card {
    padding: 30rpx 15rpx;
  }
  .card-icon {
    font-size: 50rpx;
    margin-bottom: 15rpx;
  }
  .card-title {
    font-size: 28rpx;
  }
  .card-desc {
    font-size: 22rpx;
  }
  
  .content-canvas {
    padding: 80rpx 20rpx 20rpx;
  }
  
  .stats-section,
  .notice-section {
    margin: 10rpx;
    padding: 20rpx;
  }
  .section-title {
    font-size: 28rpx;
  }
  
  .stats-cards {
    flex-direction: column;
  }
  .stat-item {
    padding: 15rpx;
  }
  .stat-value {
    font-size: 36rpx;
  }
  .stat-label {
    font-size: 22rpx;
  }
  
  .notice-content {
    font-size: 24rpx;
  }
  .notice-time {
    font-size: 20rpx;
  }
  
  /* 弹窗适配 */
  .detail-content,
  .upload-content,
  .compare-content,
  .teacher-select-content {
    width: 95%;
    max-height: 90vh;
  }
  
  .detail-header,
  .upload-header,
  .compare-header,
  .modal-header {
    padding: 20rpx;
  }
  .detail-title,
  .upload-title,
  .compare-title,
  .modal-title {
    font-size: 32rpx;
  }
  
  .preview-toolbar {
    padding: 15rpx;
    flex-wrap: wrap;
  }
  .tool-btn {
    padding: 8rpx 16rpx;
    font-size: 22rpx;
  }
  .zoom-level {
    margin: 0 10rpx;
    font-size: 24rpx;
  }
  
  .document-preview {
    padding: 20rpx;
  }
}

@media screen and (min-width: 751rpx) and (max-width: 1080rpx) {
  /* 中等屏幕设备适配 */
  .function-cards {
    padding: 15rpx;
  }
  .card {
    padding: 35rpx 18rpx;
  }
  
  .stats-section,
  .notice-section {
    margin: 15rpx;
    padding: 25rpx;
  }
}

@media screen and (min-width: 1081rpx) {
  /* 大屏幕设备适配 */
  .student-workbench {
    max-width: 1200rpx;
    margin: 0 auto;
  }
  
  .function-cards {
    padding: 30rpx;
  }
  .card {
    width: calc(25% - 15rpx);
  }
  
  .stats-cards {
    gap: 30rpx;
  }
}

/* 原有弹窗样式（功能不变，只适配新布局） */
.detail-modal, .upload-modal, .compare-modal, .teacher-select-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.detail-content, .upload-content, .compare-content, .teacher-select-content {
  width: 90%;
  max-width: 800rpx;
  background: #fff;
  border-radius: 20rpx;
  box-sizing: border-box;
  overflow: hidden;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.1);
}
.detail-header, .upload-header, .compare-header, .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #e2e8f0;
}
.detail-title, .upload-title, .compare-title, .modal-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1a202c;
}
.close-btn {
  font-size: 50rpx;
  color: #718096;
  width: 50rpx;
  height: 50rpx;
  text-align: center;
  transition: all 0.2s ease;
}
.close-btn:active {
  color: #1677ff;
  transform: scale(0.9);
}
.detail-body {
  display: flex;
  flex: 1;
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}
.preview-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1rpx solid #e2e8f0;
  min-width: 0;
  overflow: hidden;
  min-height: 0;
}
.preview-toolbar {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1rpx solid #e2e8f0;
  gap: 10rpx;
}
.tool-btn {
  padding: 10rpx 20rpx;
  border: 1rpx solid #e2e8f0;
  border-radius: 8rpx;
  background: #fff;
  font-size: 24rpx;
  color: #2d3748;
  transition: all 0.2s ease;
}
.tool-btn:active {
  border-color: #1677ff;
  color: #1677ff;
}
.zoom-level {
  margin: 0 20rpx;
  font-size: 28rpx;
  color: #2d3748;
}
.document-preview {
  flex: 1;
  padding: 30rpx;
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
}
.document-content {
  background-color: #fff;
  padding: 40rpx;
  border: 1rpx solid #e2e8f0;
  border-radius: 8rpx;
  box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.02);
  min-width: 100%;
  box-sizing: border-box;
}
.preview-content-area {
  line-height: 1.8;
  font-size: 28rpx;
  color: #1a202c;
  white-space: pre-wrap;
  word-wrap: break-word;
}
.preview-placeholder {
  display: block;
  text-align: center;
  font-size: 32rpx;
  color: #a0aec0;
  margin-bottom: 30rpx;
}
.ai-structure-panel {
  background-color: #ebf8ff;
  border: 2rpx solid #1677ff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin: 30rpx;
}
.structure-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.structure-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a202c;
}
.structure-status {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 26rpx;
  font-weight: 600;
}
.status-correct {
  background-color: #38b2ac;
  color: #fff;
}
.status-error {
  background-color: #e53e3e;
  color: #fff;
}
.structure-suggestions {
  margin-top: 20rpx;
}
.suggestions-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a202c;
  display: block;
  margin-bottom: 15rpx;
}
.suggestion-item {
  display: flex;
  margin-bottom: 15rpx;
  padding: 15rpx;
  background-color: #fff;
  border-radius: 8rpx;
  border-left: 4rpx solid #1677ff;
}
.suggestion-index {
  font-size: 26rpx;
  color: #1677ff;
  margin-right: 10rpx;
  font-weight: 600;
}
.suggestion-text {
  font-size: 26rpx;
  color: #2d3748;
  flex: 1;
}
.check-time {
  margin-top: 15rpx;
  font-size: 24rpx;
  color: #718096;
}
.annotation-panel {
  width: 500rpx;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.panel-header {
  padding: 20rpx;
  border-bottom: 1rpx solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}
.panel-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1a202c;
}
.filter-tabs, .source-tabs {
  display: flex;
  gap: 10rpx;
  flex-wrap: wrap;
}
.filter-tab, .source-tab {
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #718096;
  transition: all 0.2s ease;
}
.filter-tab.active, .source-tab.active {
  background-color: #1677ff;
  color: #fff;
}
.annotation-list {
  flex: 1;
  padding: 20rpx;
  min-height: 0;
}
.annotation-item {
  padding: 20rpx;
  border-radius: 12rpx;
  background-color: #f7fafc;
  margin-bottom: 15rpx;
  border: 1rpx solid #e2e8f0;
}
.annotation-header {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 15rpx;
  flex-wrap: wrap;
}
.annotation-badge {
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 600;
}
.ai-badge {
  background-color: #ebf8ff;
  color: #1677ff;
}
.teacher-badge {
  background-color: #e6fffa;
  color: #38b2ac;
}
.annotation-severity {
  margin-left: auto;
}
.severity-high {
  color: #e53e3e;
  font-weight: 600;
  font-size: 22rpx;
}
.severity-medium {
  color: #ed8936;
  font-weight: 600;
  font-size: 22rpx;
}
.severity-low {
  color: #718096;
  font-weight: 600;
  font-size: 22rpx;
}
.annotation-status {
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
}
.unprocessed {
  background-color: #fef7fb;
  color: #ed8936;
}
.processed {
  background-color: #e6fffa;
  color: #38b2ac;
}
.annotation-content {
  margin-bottom: 15rpx;
}
.annotation-text {
  font-size: 26rpx;
  color: #1a202c;
  line-height: 1.6;
  display: block;
  margin-bottom: 10rpx;
}
.annotation-suggestion {
  font-size: 24rpx;
  color: #1677ff;
  line-height: 1.6;
  display: block;
}
.annotation-actions {
  display: flex;
  justify-content: flex-end;
}
.mark-btn {
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  background-color: #1677ff;
  color: #fff;
  border: none;
  font-size: 24rpx;
  transition: all 0.2s ease;
}
.mark-btn.processed {
  background-color: #e2e8f0;
  color: #718096;
}
.mark-btn:active:not(.processed) {
  opacity: 0.9;
  transform: scale(0.98);
}
.version-history {
  padding: 20rpx;
  border-top: 1rpx solid #e2e8f0;
}
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.history-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1a202c;
}
.compare-btn {
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  background-color: #1677ff;
  color: #fff;
  border: none;
  font-size: 24rpx;
}
.version-list {
  max-height: 200rpx;
}
.version-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f7fafc;
}
.version-info {
  font-size: 24rpx;
  color: #2d3748;
}
.version-status {
  font-size: 22rpx;
  color: #718096;
  background-color: #f7fafc;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}
.upload-body {
  padding: 30rpx;
}
.upload-tips {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30rpx;
  font-size: 24rpx;
  color: #718096;
}
.upload-btn {
  width: 100%;
  padding: 25rpx 0;
  background-color: #1677ff;
  color: #fff;
  border-radius: 12rpx;
  font-size: 30rpx;
  border: none;
  margin-bottom: 20rpx;
}
.file-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background-color: #f7fafc;
  border-radius: 8rpx;
  margin-bottom: 30rpx;
}
.file-name {
  font-size: 26rpx;
  color: #2d3748;
}
.file-size {
  font-size: 24rpx;
  color: #718096;
}
.final-version-option {
  margin-bottom: 30rpx;
}
.checkbox-label {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  color: #2d3748;
}
.submit-btn {
  width: 100%;
  padding: 25rpx 0;
  background-color: #1677ff;
  color: #fff;
  border-radius: 12rpx;
  font-size: 30rpx;
  border: none;
}
.submit-btn:disabled {
  background-color: #e2e8f0;
  color: #718096;
}
.compare-body {
  padding: 30rpx;
}
.version-selector {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
}
.picker-view {
  padding: 20rpx;
  border: 1rpx solid #e2e8f0;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #2d3748;
  width: 100%;
}
.compare-result {
  height: 400rpx;
  border: 1rpx solid #e2e8f0;
  border-radius: 8rpx;
  padding: 20rpx;
}
.diff-content {
  line-height: 1.8;
  font-size: 28rpx;
}
.diff-item {
  margin-bottom: 10rpx;
  padding: 8rpx;
  border-radius: 4rpx;
}
.added {
  color: #38b2ac;
  background-color: #e6fffa;
}
.deleted {
  color: #e53e3e;
  background-color: #fef2f2;
}
.modified {
  color: #ed8936;
  background-color: #fef7fb;
}
.modal-body {
  padding: 30rpx;
}
.input-group {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
  margin-bottom: 20rpx;
}
.input-label {
  font-size: 28rpx;
  color: #2d3748;
}
.teacher-input {
  padding: 20rpx;
  border: 1rpx solid #e2e8f0;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #1a202c;
  width: 100%;
  box-sizing: border-box;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #e2e8f0;
}
.modal-btn {
  padding: 15rpx 30rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  border: none;
}
.cancel-btn {
  background-color: #f7fafc;
  color: #718096;
  border: 1rpx solid #e2e8f0;
}
.confirm-btn {
  background-color: #1677ff;
  color: #fff;
}

/* ==================== 深色模式 - 高对比度，无渐变，白色字体 ==================== */
.student-workbench.dark-mode {
  background: #1a1a1a;
  background-color: #1a1a1a;
  min-height: 100vh;
}

</style>
<style scoped>
.paper-card-loading-container,
.paper-card-empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 120rpx 40rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 249, 250, 0.96) 100%);
  border-radius: calc(var(--radius-lg) + 2px);
  border: 1px dashed rgba(0, 91, 191, 0.16);
  box-shadow: var(--shadow-sm);
}

.paper-card-loading-spinner {
  width: 60rpx;
  height: 60rpx;
  position: relative;
  margin-bottom: 30rpx;
}

.paper-card-loading-spinner::before,
.paper-card-loading-spinner::after {
  content: '';
  position: absolute;
  border-radius: 50%;
}

.paper-card-loading-spinner::before {
  width: 100%;
  height: 100%;
  background: var(--primary);
  animation: workbenchPaperPulseRing 1.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

.paper-card-loading-spinner::after {
  width: 70%;
  height: 70%;
  top: 15%;
  left: 15%;
  background: #fff;
  animation: workbenchPaperPulseDot 1.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

@keyframes workbenchPaperPulseRing {
  0% { transform: scale(0.8); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(0.8); opacity: 1; }
}

@keyframes workbenchPaperPulseDot {
  0% { transform: scale(0.6); }
  50% { transform: scale(1); }
  100% { transform: scale(0.6); }
}

.paper-card-loading-text {
  font-size: 28rpx;
  color: var(--on-surface-variant);
}

.paper-card-empty-icon {
  font-size: 80rpx;
  margin-bottom: 30rpx;
  font-family: 'Material Symbols Outlined', sans-serif;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48;
  opacity: 0.65;
}

.paper-card-empty-text {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--on-surface);
  margin-bottom: 12rpx;
}

.paper-card-empty-subtext {
  font-size: 26rpx;
  color: var(--on-surface-variant);
  text-align: center;
}

.workbench-paper-list {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 20rpx;
  position: relative;
}

.workbench-paper-list.single-card {
  padding: 22rpx;
  gap: 0;
  justify-content: center;
  align-items: stretch;
  box-sizing: border-box;
}

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

.workbench-paper-list .workbench-paper-card {
  cursor: pointer;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.96) 100%);
  border-radius: calc(var(--radius-lg) + 2px);
  padding: 32rpx;
  box-shadow: 0 12px 28px rgba(25, 28, 29, 0.06);
  border: 1rpx solid rgba(0, 91, 191, 0.08);
  transition:
    transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.3s ease;
  position: relative;
  box-sizing: border-box;
  will-change: transform, box-shadow;
  overflow: hidden;
}

.workbench-paper-list.single-card .workbench-paper-card {
  width: 100%;
  height: 100%;
  min-height: 0;
  margin: 0;
  padding: 50rpx 46rpx;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.workbench-paper-list .workbench-paper-card:hover {
  transform: translateY(-4rpx);
  box-shadow: 0 16px 32px rgba(25, 28, 29, 0.1);
  border-color: rgba(0, 91, 191, 0.18);
}

.workbench-paper-list .paper-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 22rpx;
  padding-bottom: 20rpx;
  border-bottom: 1px solid rgba(25, 28, 29, 0.07);
}

.workbench-paper-list.single-card .paper-header {
  margin-bottom: 30rpx;
  padding-bottom: 24rpx;
}

.workbench-paper-list .paper-header-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  align-self: stretch;
  gap: 12rpx;
  flex-shrink: 0;
}

.workbench-paper-list .paper-info {
  flex: 1;
  min-width: 0;
}

.workbench-paper-list .paper-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--on-surface);
  display: block;
  margin-bottom: 10rpx;
  line-height: 1.4;
  letter-spacing: -0.02em;
}

.workbench-paper-list.single-card .paper-title {
  font-size: 46rpx;
  margin-bottom: 18rpx;
  line-height: 1.36;
}

.workbench-paper-list .paper-preview-hint {
  font-size: 22rpx;
  font-weight: 400;
  color: var(--primary-container);
  margin-left: 10rpx;
  opacity: 0.88;
}

.workbench-paper-list.single-card .paper-preview-hint {
  font-size: 30rpx;
}

.workbench-paper-list .paper-meta {
  font-size: 24rpx;
  color: var(--on-surface-variant);
  display: block;
  line-height: 1.55;
}

.workbench-paper-list.single-card .paper-meta {
  font-size: 34rpx;
  line-height: 1.75;
}

.workbench-paper-list.single-card .refresh-status-btn {
  height: 66rpx;
  padding: 0 36rpx;
}

.workbench-paper-list.single-card .refresh-text {
  font-size: 30rpx;
}

.workbench-paper-list .refresh-status-btn {
  height: 52rpx;
  padding: 0 22rpx;
  border-radius: var(--radius-full);
  background: rgba(0, 91, 191, 0.08);
  border: 1px solid rgba(0, 91, 191, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: none;
}

.workbench-paper-list .refresh-status-btn:hover {
  transform: translateY(-2rpx);
  background: var(--primary);
  box-shadow: 0 10rpx 18rpx rgba(0, 91, 191, 0.22);
}

.workbench-paper-list .refresh-text {
  font-size: 22rpx;
  color: var(--primary);
  font-weight: 500;
}

.workbench-paper-list .refresh-status-btn:hover .refresh-text {
  color: #fff;
}

.workbench-paper-list .paper-content {
  margin-bottom: 22rpx;
}

.workbench-paper-list .paper-content-wrapper {
  width: 100%;
}

.workbench-paper-list.single-card .paper-content-wrapper {
  flex: 1;
  display: flex;
  min-height: 0;
}

.workbench-paper-list.single-card .paper-content {
  flex: 1;
  display: grid;
  grid-template-rows: auto minmax(250rpx, 0.95fr) minmax(240rpx, 0.9fr);
  gap: 28rpx;
  align-content: stretch;
  margin-bottom: 34rpx;
  min-height: 0;
}

.workbench-paper-list .paper-detail {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.workbench-paper-list.single-card .paper-detail {
  margin-bottom: 0;
}

.workbench-paper-list .detail-label,
.workbench-paper-list .detail-value {
  font-size: 26rpx;
}

.workbench-paper-list.single-card .detail-label,
.workbench-paper-list.single-card .detail-value {
  font-size: 34rpx;
}

.workbench-paper-list .detail-label {
  color: var(--on-surface-variant);
  margin-right: 10rpx;
}

.workbench-paper-list .detail-value {
  color: var(--on-surface);
}

.workbench-paper-list .progress-section {
  margin-bottom: 22rpx;
  padding: 18rpx 20rpx;
  background: linear-gradient(180deg, rgba(214, 227, 255, 0.26) 0%, rgba(255, 255, 255, 0.82) 100%);
  border-radius: calc(var(--radius-md) + 2px);
  border: 1px solid rgba(0, 91, 191, 0.08);
}

.workbench-paper-list.single-card .progress-section {
  margin-bottom: 0;
  padding: 24rpx 28rpx;
  height: 100%;
  display: flex;
  align-items: center;
}

.workbench-paper-list .progress-track {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.workbench-paper-list.single-card .progress-track {
  width: 100%;
  align-items: flex-start;
}

.workbench-paper-list .progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}

.workbench-paper-list .step-circle {
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  background-color: var(--surface-container-high);
  color: var(--on-surface-variant);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 700;
  margin-bottom: 10rpx;
  border: 2rpx solid var(--surface-container-high);
}

.workbench-paper-list.single-card .step-circle {
  width: 88rpx;
  height: 88rpx;
  font-size: 36rpx;
  margin-bottom: 16rpx;
}

.workbench-paper-list .progress-step.active .step-circle,
.workbench-paper-list .progress-step.completed .step-circle {
  background-color: var(--primary);
  color: #fff;
  border-color: var(--primary);
  box-shadow: var(--shadow-primary);
}

.workbench-paper-list .step-text {
  font-size: 20rpx;
  color: var(--on-surface-variant);
  text-align: center;
}

.workbench-paper-list.single-card .step-text {
  font-size: 32rpx;
  line-height: 1.28;
}

.workbench-paper-list .progress-step.active .step-text,
.workbench-paper-list .progress-step.completed .step-text {
  color: var(--primary);
  font-weight: 500;
}

.workbench-paper-list .progress-line {
  flex: 1;
  height: 3rpx;
  background-color: var(--surface-container-high);
  margin: 0 10rpx;
  margin-bottom: 35rpx;
  position: relative;
  overflow: hidden;
}

.workbench-paper-list.single-card .progress-line {
  height: 8rpx;
  margin: 40rpx 26rpx 0;
  border-radius: 999px;
}

.workbench-paper-list .progress-line.active {
  background-color: var(--primary);
}

.workbench-paper-list .line-flow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  animation: workbenchLineFlow 2s linear infinite;
}

@keyframes workbenchLineFlow {
  0% { left: -100%; }
  100% { left: 100%; }
}

.workbench-paper-list .notice-section {
  background: linear-gradient(180deg, rgba(247, 251, 255, 1) 0%, rgba(241, 247, 255, 1) 100%);
  border-radius: 16rpx;
  padding: 18rpx 20rpx;
  border: 1px solid rgba(0, 91, 191, 0.1);
}

.workbench-paper-list.single-card .notice-section {
  margin-top: 0;
  padding: 26rpx 28rpx;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 0;
}

.workbench-paper-list .notice-header {
  margin-bottom: 15rpx;
}

.workbench-paper-list .notice-title {
  font-size: 26rpx;
  font-weight: 700;
  color: var(--primary);
}

.workbench-paper-list.single-card .notice-title {
  font-size: 34rpx;
}

.workbench-paper-list .notice-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.workbench-paper-list.single-card .notice-list {
  flex: 1;
  justify-content: center;
}

.workbench-paper-list .notice-item {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 12rpx;
  padding: 14rpx 16rpx;
  border-left: 4rpx solid var(--primary);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);
}

.workbench-paper-list.single-card .notice-item {
  min-height: 96rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.workbench-paper-list .notice-time {
  font-size: 22rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.workbench-paper-list.single-card .notice-time {
  font-size: 30rpx;
}

.workbench-paper-list .notice-content {
  font-size: 26rpx;
  color: #333;
  line-height: 1.5;
}

.workbench-paper-list.single-card .notice-content {
  font-size: 34rpx;
  line-height: 1.62;
}

.workbench-paper-list .paper-actions {
  display: flex;
  gap: 14rpx;
  padding: 18rpx;
  margin: 0 -8rpx -8rpx;
  border-top: 1px solid rgba(25, 28, 29, 0.06);
  background: linear-gradient(180deg, rgba(250, 251, 252, 0.65) 0%, rgba(243, 244, 245, 0.88) 100%);
  border-radius: 18rpx;
}

.workbench-paper-list.single-card .paper-actions {
  gap: 18rpx;
  padding: 28rpx 26rpx;
  margin: 0;
  min-height: 136rpx;
  align-items: stretch;
}

.workbench-paper-list .action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 12rpx 16rpx;
  border-radius: var(--radius-sm);
  font-size: 23rpx;
  font-weight: 500;
  border: none;
  flex: 1;
  background-color: rgba(0, 91, 191, 0.06);
  color: var(--primary);
  border: 1px solid rgba(0, 91, 191, 0.08);
  min-width: 0;
}

.workbench-paper-list.single-card .action-btn {
  padding: 20rpx 22rpx;
  font-size: 28rpx;
  min-height: 92rpx;
}

.workbench-paper-list .action-btn .btn-icon {
  font-size: 26rpx;
  font-family: 'Material Symbols Outlined', sans-serif;
}

.workbench-paper-list.single-card .action-btn .btn-icon {
  font-size: 32rpx;
}

.workbench-paper-list .action-btn:hover {
  background-color: var(--primary);
  color: #fff;
  transform: translateY(-1rpx);
  box-shadow: 0 10rpx 18rpx rgba(0, 91, 191, 0.18);
}

.workbench-paper-list .action-btn.delete-btn {
  background-color: #ffebee;
  color: #e53e3e;
  border-color: #ffcdd2;
}

.workbench-paper-list .action-btn.delete-btn:hover {
  background-color: #ef5350;
  color: #fff;
  border-color: #ef5350;
}

.workbench-paper-list .action-btn.review-btn {
  background-color: #f6ffed;
  color: #52c41a;
  border-color: #b7eb8f;
}

.workbench-paper-list .action-btn.review-btn:hover {
  background-color: #52c41a;
  color: #fff;
  border-color: #52c41a;
}

.workbench-paper-list .action-btn.update-btn.disabled,
.workbench-paper-list .action-btn.review-btn.disabled,
.workbench-paper-list .action-btn.annotation-btn.disabled {
  background-color: var(--surface-container-low);
  color: var(--on-surface-variant);
  border-color: var(--surface-container-high);
  cursor: not-allowed;
  opacity: 0.7;
}

.workbench-paper-list .action-btn.update-btn.disabled:hover,
.workbench-paper-list .action-btn.review-btn.disabled:hover,
.workbench-paper-list .action-btn.annotation-btn.disabled:hover {
  background-color: var(--surface-container-low);
  color: var(--on-surface-variant);
  border-color: var(--surface-container-high);
  transform: none;
  box-shadow: none;
}

@media (max-height: 980px) {
  .workbench-paper-list.single-card {
    justify-content: flex-start;
  }

  .workbench-paper-list.single-card .workbench-paper-card {
    height: auto;
    min-height: 0;
  }

  .workbench-paper-list.single-card .paper-content {
    grid-template-rows: auto auto auto;
  }

  .workbench-paper-list.single-card .progress-section,
  .workbench-paper-list.single-card .notice-section {
    height: auto;
  }
}

.paper-card-review-modal,
.paper-card-update-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.paper-card-review-content,
.paper-card-update-content {
  background: #fff;
  border-radius: 12px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.paper-card-review-content {
  width: 90%;
  max-width: 500px;
}

.paper-card-update-content {
  width: 90%;
  max-width: 400px;
}

.workbench-confirm-modal {
  backdrop-filter: blur(4px);
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

.paper-card-review-info,
.paper-card-update-info {
  background: #f3f4f5;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.paper-card-review-title,
.paper-card-update-title {
  font-size: 1rem;
  font-weight: 600;
  color: #191c1d;
  display: block;
  margin-bottom: 8px;
}

.paper-card-review-meta,
.paper-card-update-version {
  font-size: 0.875rem;
  color: #5f6368;
}

.paper-card-review-section {
  margin-bottom: 16px;
}

.paper-card-review-section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #005bbf;
  margin-bottom: 12px;
  padding-left: 12px;
  border-left: 3px solid #005bbf;
}

.paper-card-review-content-text {
  font-size: 0.875rem;
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

.paper-card-review-time {
  display: flex;
  align-items: center;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.paper-card-review-time-label {
  font-size: 0.875rem;
  color: #5f6368;
  margin-right: 8px;
}

.paper-card-review-time-value {
  font-size: 0.875rem;
  color: #191c1d;
  font-weight: 500;
}

.paper-card-update-tips,
.paper-card-file-info {
  background: #e8f4fd;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
}

.paper-card-update-tips text,
.paper-card-version-hint,
.paper-card-file-size {
  display: block;
  font-size: 0.875rem;
  color: #1a3c6e;
  line-height: 1.6;
}

.paper-card-version-section {
  margin-bottom: 16px;
}

.paper-card-input-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #191c1d;
  margin-bottom: 8px;
}

.paper-card-version-input {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 8px;
  padding: 0 16px;
  font-size: 0.875rem;
  color: #191c1d;
  background: #f3f4f5;
  box-sizing: border-box;
}

.paper-card-file-btn,
.paper-card-submit-btn {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.paper-card-file-btn {
  background: #f3f4f5;
  border: 2rpx dashed #e5e7eb;
  color: #191c1d;
  margin-bottom: 12px;
}

.paper-card-submit-btn {
  background: #005bbf;
  color: #fff;
  font-weight: 500;
}

.paper-card-submit-btn:disabled {
  background: #e5e7eb;
  color: #5f6368;
}

.paper-card-file-name {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1a3c6e;
  margin-bottom: 4px;
  word-break: break-all;
}

.paper-card-review-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
}
</style>
