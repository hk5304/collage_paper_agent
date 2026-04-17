<!-- 
  The Academic Curator - 教师端仪表板重构版本
  这是一个完整的重构示例，展示了新的设计系统
  使用方法：将此文件内容替换到 dashboard.vue 中（保留原 script 部分）
-->

<template>
  <view class="dashboard-container" :class="{ 'dark-mode': darkMode }">
    <!-- 侧边栏导航 -->
    <aside class="sidebar" v-if="selectedClass">
      <view class="sidebar-brand">
        <view class="brand-icon">
          <text class="material-symbols-outlined">school</text>
        </view>
        <view class="brand-text">
          <text class="brand-title">The Curator</text>
          <text class="brand-subtitle">THESIS MANAGEMENT</text>
        </view>
      </view>
      
      <nav class="sidebar-nav">
        <view class="nav-item" :class="{ active: !selectedClass }" @click="backToClassList">
          <text class="material-symbols-outlined">dashboard_customize</text>
          <text class="nav-label">选择班级</text>
        </view>
        <view class="nav-item" :class="{ active: currentFilter === 'all' && !showMessageCenter }" @click="switchFilter('all')">
          <text class="material-symbols-outlined">group</text>
          <text class="nav-label">全部</text>
        </view>
        <view class="nav-item" :class="{ active: currentFilter === 'pending' && !showMessageCenter }" @click="switchFilter('pending')">
          <text class="material-symbols-outlined">pending_actions</text>
          <text class="nav-label">待审阅</text>
        </view>
        <view class="nav-item" :class="{ active: currentFilter === 'pending_update' && !showMessageCenter }" @click="switchFilter('pending_update')">
          <text class="material-symbols-outlined">edit_note</text>
          <text class="nav-label">待修改</text>
        </view>
        <view class="nav-item" :class="{ active: currentFilter === 'finalized' && !showMessageCenter }" @click="switchFilter('finalized')">
          <text class="material-symbols-outlined">verified</text>
          <text class="nav-label">已定稿</text>
        </view>
        <view class="nav-item" :class="{ active: currentFilter === 'unuploaded' && !showMessageCenter }" @click="switchFilter('unuploaded')">
          <text class="material-symbols-outlined">cloud_off</text>
          <text class="nav-label">未上传</text>
        </view>
      </nav>
      
      <view class="sidebar-divider"></view>
      
      <nav class="sidebar-nav secondary">
        <view class="nav-item" :class="{ active: showMessageCenter }" @click.stop="goToMessageCenter">
          <text class="material-symbols-outlined">mail</text>
          <text class="nav-label">消息中心</text>
          <view class="nav-badge" v-if="unreadMessageCount > 0">{{ unreadMessageCount }}</view>
        </view>
        <view class="nav-item" @click.stop="openDeadlineSetting">
          <text class="material-symbols-outlined">event</text>
          <text class="nav-label">截止日期</text>
        </view>
      </nav>
      
      <view class="sidebar-footer">
        <button 
          class="upload-btn" 
          :class="{ 'downloading': isBatchDownloading }"
          :disabled="isBatchDownloading"
          @click.stop="openBatchDownload">
          <text class="material-symbols-outlined">{{ isBatchDownloading ? 'hourglass_empty' : 'download' }}</text>
          <text>{{ isBatchDownloading ? '下载中...' : '批量下载' }}</text>
        </button>
      </view>
    </aside>
    
    <!-- 主内容区 -->
    <main class="main-content" :class="{ 'with-sidebar': selectedClass }">
      <!-- 顶部标题栏 -->
      <!-- 顶部标题栏 - 简化版 -->
      <header class="top-header">
        <view class="header-left">
          <text class="header-title">论文管理系统</text>
        </view>
        <view class="header-right">
          <view class="notification-icon" @click.stop="goToMessageCenter">
            <text class="material-symbols-outlined">notifications</text>
            <view class="notification-dot" v-if="unreadMessageCount > 0"></view>
          </view>
          <view class="profile-btn-wrapper"
            @mouseenter="onUserCardEnter"
            @mouseleave="onUserCardLeave">
            <view class="profile-avatar">
              <text class="avatar-text">{{ userCardInfo.name ? userCardInfo.name[0] : '教' }}</text>
            </view>
            
            <!-- 用户信息卡片 -->
            <view class="user-info-card" :class="{ show: showUserCard }" @click.stop
              @mouseenter="onUserCardEnter"
              @mouseleave="onUserCardLeave">
              <view class="user-card-header">
                <view class="user-card-avatar">
                  <text class="avatar-text">{{ userCardInfo.name ? userCardInfo.name[0] : '教' }}</text>
                </view>
                <view class="user-card-info">
                  <text class="user-name">{{ userCardInfo.name }}</text>
                  <text class="user-id">工号：{{ userCardInfo.username }}</text>
                  <view class="user-role-badge">{{ userCardInfo.role }}</view>
                </view>
              </view>
              <view class="user-card-menu">
                <view class="menu-item" @click="openChangePassword">
                  <text class="material-symbols-outlined">lock</text>
                  <text>修改密码</text>
                </view>
                <view class="menu-item logout" @click="showLogoutConfirm">
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
        <!-- 班级选择视图 -->
        <view class="class-selection-view" v-if="!selectedClass">
          <view class="page-header">
            <view>
              <h2 class="page-title">选择班级</h2>
              <p class="page-subtitle">请选择要管理的班级以查看学生论文</p>
            </view>
          </view>
          
          <view class="class-grid" v-if="classList.length > 0">
            <view class="class-card" v-for="(item, index) in classList" :key="index" @click="selectClass(item)">
              <view class="class-header">
                <h3 class="class-name">{{ item.name }}</h3>
                <text class="class-code">班级编号：{{ item.code || item.id }}</text>
              </view>
              <view class="class-stats">
                <view class="stat-box">
                  <text class="stat-value">{{ item.studentCount || 0 }}</text>
                  <text class="stat-label">学生</text>
                </view>
                <view class="stat-box">
                  <text class="stat-value">{{ item.paperCount || 0 }}</text>
                  <text class="stat-label">论文</text>
                </view>
              </view>
            </view>
          </view>
          
          <view class="empty-state" v-else-if="!loading">
            <text class="material-symbols-outlined empty-icon">class</text>
            <text class="empty-text">暂无班级数据</text>
          </view>
        </view>
        
        <!-- 论文列表视图 -->
        <view class="thesis-view" v-else-if="!showMessageCenter">
          <!-- 页面标题区 -->
          <view class="page-header">
            <view>
              <h2 class="page-title">学生论文库</h2>
              <p class="page-subtitle">欢迎回来，当前有 <text class="highlight">{{ stats.pendingReview }}</text> 篇论文等待您的审阅</p>
            </view>
          </view>
          
          <!-- Bento 筛选栏 -->
          <view class="bento-filter-bar">
            <view class="filter-card" @click="showFilterDropdown = !showFilterDropdown">
              <view class="filter-icon primary">
                <text class="material-symbols-outlined">filter_list</text>
              </view>
              <view class="filter-info">
                <text class="filter-label">按状态筛选</text>
                <text class="filter-value">{{ getFilterLabel }}</text>
              </view>
            </view>
            
            <view class="filter-card search-card">
              <view class="filter-icon secondary" @click="doSearch" style="cursor:pointer">
                <text class="material-symbols-outlined">search</text>
              </view>
              <input class="search-input" v-model="searchInput" placeholder="搜索学生姓名、学号或论文标题..." @confirm="doSearch" />
            </view>
          </view>
          
          <!-- 论文列表 -->
          <view class="thesis-list-container">
            <!-- 加载中 -->
            <view class="loading-state" v-if="loading">
              <text class="material-symbols-outlined loading-icon">progress_activity</text>
              <text>加载中...</text>
            </view>
            
            <!-- 空状态 -->
            <view class="empty-state" v-else-if="filteredStudents.length === 0">
              <text class="material-symbols-outlined empty-icon">inbox</text>
              <text class="empty-text">暂无相关学生数据</text>
            </view>
            
            <!-- 论文卡片列表 -->
            <view class="thesis-list" v-else>
              <view class="thesis-card" v-for="(student, index) in paginatedStudents" :key="index" @click="student.isUnuploaded || !student.paper ? null : openPaperReview(student, student.paper)" :style="student.isUnuploaded || !student.paper ? 'cursor:default' : ''">
                <!-- 头像与状态区 -->
                <view class="card-avatar-section">
                  <view class="student-avatar">
                    <text class="avatar-text">{{ student.name ? student.name[0] : '学' }}</text>
                    <view class="status-indicator" :class="getStatusClass(student.paper?.status)" v-if="student.paper"></view>
                  </view>
                  <view class="student-info">
                    <text class="student-name">{{ student.name }}</text>
                    <text class="student-id">学号: {{ student.studentNumber || student.id }}</text>
                    <view class="status-badge" :class="student.isUnuploaded || !student.paper ? 'status-unuploaded' : getStatusClass(student.paper?.status)">
                      <view class="status-dot"></view>
                      <text>{{ student.isUnuploaded || !student.paper ? '未上传' : getStatusText(student.paper?.status) }}</text>
                    </view>
                  </view>
                </view>
                
                <!-- 论文详情区 -->
                <view class="card-detail-section" v-if="student.paper">
                  <view class="detail-header">
                    <text class="detail-label">论文标题 / 当前版本</text>
                  </view>
                  <text class="paper-title">{{ student.paper.title || '未命名论文' }}</text>
                  <view class="paper-meta">
                    <view class="meta-item">
                      <text class="material-symbols-outlined">description</text>
                      <text>DOCX</text>
                    </view>
                    <view class="meta-item">
                      <text class="material-symbols-outlined">history</text>
                      <text>v{{ student.paper.version || 1 }}</text>
                    </view>
                    <view class="meta-item meta-item--update-time">
                      <text class="material-symbols-outlined">schedule</text>
                      <text>{{ formatPaperCardUpdateTime(student.paper) }}</text>
                    </view>
                  </view>
                </view>
                
                <!-- 未上传状态 -->
                <view class="card-detail-section unuploaded" v-else>
                  <text class="unuploaded-text">暂未上传论文</text>
                </view>
                
                <!-- 操作按钮区 -->
                <view class="card-action-section" v-if="student.paper">
                  <button 
                    class="action-btn primary" 
                    :class="{ 'downloading': downloadingPaperId === (student.paper.paperId || student.paper.id || student.paper.paper_id) }"
                    :disabled="downloadingPaperId === (student.paper.paperId || student.paper.id || student.paper.paper_id)"
                    @click.stop="openSingleDownload(student, student.paper)">
                    <text class="material-symbols-outlined">{{ downloadingPaperId === (student.paper.paperId || student.paper.id || student.paper.paper_id) ? 'hourglass_empty' : 'download' }}</text>
                    <text>{{ downloadingPaperId === (student.paper.paperId || student.paper.id || student.paper.paper_id) ? '下载中...' : '下载论文' }}</text>
                  </button>
                  <button class="action-btn secondary" @click.stop="openAttachmentModal(student, student.paper)">
                    <text class="material-symbols-outlined">visibility</text>
                    <text>查看附件</text>
                  </button>
                </view>
              </view>
            </view>
            
            <!-- 分页 -->
            <view class="pagination" v-if="filteredStudents.length > 0">
              <view class="pagination-info">
                <text>显示第 {{ paginationStart }}-{{ paginationEnd }} 篇论文，共 {{ filteredStudents.length }} 篇</text>
              </view>
              <view class="pagination-controls">
                <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
                  <text class="material-symbols-outlined">chevron_left</text>
                </button>
                <button 
                  v-for="page in visiblePages" 
                  :key="page"
                  class="page-btn"
                  :class="{ active: currentPage === page }"
                  @click="currentPage = page">
                  {{ page }}
                </button>
                <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">
                  <text class="material-symbols-outlined">chevron_right</text>
                </button>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 消息中心视图 -->
        <view class="message-center-view" v-else>
          <view class="page-header">
            <view>
              <h2 class="page-title">消息中心</h2>
              <p class="page-subtitle">您共有 {{ messages.length }} 条消息通知</p>
            </view>
          </view>
          
          <!-- 消息列表 -->
          <view class="message-list-container">
            <view class="message-list" v-if="paginatedMessages.length > 0">
              <view class="message-card" v-for="(msg, index) in paginatedMessages" :key="index" :class="{ unread: !msg.isRead }">
                <view class="message-indicator" v-if="!msg.isRead"></view>
                <view class="message-avatar">
                  <image v-if="msg.avatar" :src="msg.avatar" class="avatar-img"></image>
                  <view v-else class="avatar-placeholder">
                    <text class="material-symbols-outlined">person</text>
                  </view>
                </view>
                <view class="message-content">
                  <view class="message-header">
                    <text class="message-sender">{{ msg.sender }}</text>
                    <text class="message-time">{{ msg.time }}</text>
                  </view>
                  <text class="message-text">{{ msg.content }}</text>
                  <view class="message-tags" v-if="msg.tags">
                    <text class="message-tag" v-for="(tag, tIndex) in msg.tags" :key="tIndex">{{ tag }}</text>
                  </view>
                </view>
                <view class="message-actions">
                  <button class="action-icon-btn" @click="markAsRead(msg)" v-if="!msg.isRead">
                    <text class="material-symbols-outlined">mark_chat_read</text>
                  </button>
                  <button class="action-icon-btn" @click="viewMessageDetail(msg)">
                    <text class="material-symbols-outlined">chevron_right</text>
                  </button>
                </view>
              </view>
            </view>
            <view class="empty-state" v-else>
              <text class="material-symbols-outlined empty-icon">mail_outline</text>
              <text class="empty-text">暂无消息</text>
            </view>
            
            <!-- 消息分页 -->
            <view class="message-pagination" v-if="totalMessagePages > 1">
              <view class="pagination-info">
                <text>显示第 {{ (messagePage - 1) * messagePageSize + 1 }}-{{ Math.min(messagePage * messagePageSize, messages.length) }} 条，共 {{ messages.length }} 条</text>
              </view>
              <view class="pagination-controls">
                <button class="page-btn" :disabled="messagePage === 1" @click="messagePage--">
                  <text class="material-symbols-outlined">chevron_left</text>
                </button>
                <button 
                  v-for="page in totalMessagePages" 
                  :key="page"
                  class="page-btn"
                  :class="{ active: messagePage === page }"
                  @click="messagePage = page">
                  {{ page }}
                </button>
                <button class="page-btn" :disabled="messagePage === totalMessagePages" @click="messagePage++">
                  <text class="material-symbols-outlined">chevron_right</text>
                </button>
              </view>
            </view>
          </view>
        </view>
      </view>
    </main>
    
    <!-- 截止日期弹窗 -->
    <view v-if="showDeadlineModal" class="custom-modal-mask" @click="closeDeadlineModal">
      <view class="custom-modal-content deadline-modal" @click.stop>
        <DeadlineSetting 
          :group-id="selectedClass?.id"
          :initial-ddl-id="ddlId"
          :initial-deadline="currentDeadline"
          @save="saveDeadlineSettings"
          @close="closeDeadlineModal"
          @ddl-loaded="onDdlLoaded"
          @delete="onDdlDeleted" />
      </view>
    </view>
    
    <!-- 消息详情弹窗 -->
    <view v-if="showMessageDetailModal" class="custom-modal-mask message-detail-mask" @click="closeMessageDetailModal">
      <view class="custom-modal-content message-detail-modal" @click.stop>
        <view class="message-detail-header">
          <text class="material-symbols-outlined" @click="closeMessageDetailModal">arrow_back</text>
          <text class="header-title">消息详情</text>
          <view class="header-spacer"></view>
        </view>
        <view class="message-detail-body" v-if="currentMessageDetail">
          <view class="detail-sender-section">
            <view class="detail-avatar">
              <text class="material-symbols-outlined">person</text>
            </view>
            <view class="detail-sender-info">
              <text class="detail-sender-name">{{ currentMessageDetail.sender }}</text>
              <text class="detail-time">{{ currentMessageDetail.fullTime || currentMessageDetail.time }}</text>
            </view>
          </view>
          <view class="detail-content-section">
            <text class="detail-title" v-if="currentMessageDetail.title">{{ currentMessageDetail.title }}</text>
            <text class="detail-content">{{ currentMessageDetail.content }}</text>
          </view>
          <view class="detail-tags" v-if="currentMessageDetail.tags && currentMessageDetail.tags.length > 0">
            <text class="detail-tag" v-for="(tag, index) in currentMessageDetail.tags" :key="index">{{ tag }}</text>
          </view>
        </view>
        <view class="message-detail-footer">
          <button class="detail-close-btn" @click="closeMessageDetailModal">关闭</button>
        </view>
      </view>
    </view>
    
    <!-- 退出登录确认弹窗 -->
    <view v-if="showLogoutConfirmModal" class="custom-modal-mask" @click="showLogoutConfirmModal = false">
      <view class="custom-modal-content" @click.stop>
        <view class="custom-modal-header">确认退出</view>
        <view class="custom-modal-body">确定要退出登录吗？</view>
        <view class="custom-modal-footer">
          <view class="modal-btn cancel" @click="showLogoutConfirmModal = false">取消</view>
          <view class="modal-btn confirm danger" @click="logout">退出</view>
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
              v-model="passwordForm.oldPassword"
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
        </view>
        <view class="modal-footer">
          <view class="btn btn-cancel" @click="closePasswordModal">取消</view>
          <view class="btn btn-confirm" @click="submitChangePassword">确认修改</view>
        </view>
      </view>
    </view>
    
    <!-- 定稿确认弹窗 -->
    <view v-if="showFinalizeConfirmModal" class="custom-modal-mask finalize-confirm-mask" @click="closeFinalizeConfirmModal">
      <view class="custom-modal-content finalize-confirm-modal" @click.stop>
        <view class="custom-modal-header">
          <text class="material-symbols-outlined">verified</text>
          <text>确认定稿</text>
        </view>
        <view class="finalize-confirm-body">
          <text class="finalize-confirm-text">确定将《{{ finalizeConfirmPaper?.title || '该论文' }}》定为最终稿吗？</text>
        </view>
        <view class="custom-modal-footer">
          <view class="modal-btn cancel" @click="closeFinalizeConfirmModal">取消</view>
          <view class="modal-btn confirm" @click="doConfirmFinalize">确认</view>
        </view>
      </view>
    </view>
    
    <!-- 论文审阅弹窗 -->
    <view v-if="showReview" class="custom-modal-mask review-modal-mask" @click="closeReviewModal">
      <view class="review-modal-content" @click.stop>
        <!-- 头部 -->
        <view class="review-modal-header">
          <view class="review-header-left">
            <text class="review-student-name">{{ currentStudent?.name }}</text>
            <text class="review-paper-title">{{ currentPaper?.title || '未命名论文' }}</text>
            <view class="review-version-badge">v{{ currentPaper?.version || 1 }}</view>
          </view>
          <view class="review-header-right">
            <button class="review-close-btn" @click="closeReviewModal">
              <text class="material-symbols-outlined">close</text>
            </button>
          </view>
        </view>
        
        <!-- 工具栏 -->
        <view class="review-toolbar">
          <view class="toolbar-left">
            <view class="ai-summary-toggle" @click="showAISummary = !showAISummary">
              <text class="material-symbols-outlined">auto_awesome</text>
              <text>AI审查报告</text>
              <text class="material-symbols-outlined toggle-icon" :class="{ 'rotated': showAISummary }">expand_more</text>
            </view>
          </view>
          <view class="toolbar-center">
            <button type="button" class="toolbar-btn" @click.stop.prevent="zoomOut">
              <text class="material-symbols-outlined">remove</text>
            </button>
            <text class="zoom-level">{{ zoomLevel }}%</text>
            <button type="button" class="toolbar-btn" @click.stop.prevent="zoomIn">
              <text class="material-symbols-outlined">add</text>
            </button>
            <view class="toolbar-divider"></view>
            <button type="button" class="toolbar-btn primary" @click.stop.prevent="addAnnotation">
              <text class="material-symbols-outlined">add_comment</text>
              <text>添加批注</text>
            </button>
            <view class="toolbar-divider"></view>
            <button type="button" class="toolbar-btn" @click.stop.prevent="viewPdfVersion" v-if="currentPaper?.pdfOssKey || currentPaper?.pdf_oss_key">
              <text class="material-symbols-outlined">picture_as_pdf</text>
              <text>查看PDF版</text>
            </button>
            <view class="toolbar-divider" v-if="currentPaper?.pdfOssKey || currentPaper?.pdf_oss_key"></view>
            <text class="page-info">{{ currentPageNum }}/{{ docxTotalPages }} 页</text>
            <view class="toolbar-divider"></view>
            <text id="teacher-review-word-count-line" class="word-count">{{ reviewToolbarWordCountText }}</text>
            <template v-if="reviewFinalizeVisible">
              <view class="toolbar-divider"></view>
              <button type="button" class="toolbar-btn finalize-toolbar-btn" @click.stop.prevent="confirmFinalize()">
                <text class="material-symbols-outlined">verified</text>
                <text>确认定稿</text>
              </button>
            </template>
          </view>
        </view>
        
        <!-- 主体内容 -->
        <view class="review-body">
          <!-- AI摘要面板 -->
          <view class="ai-summary-panel" v-if="showAISummary">
            <view class="ai-summary-header">
              <text class="material-symbols-outlined">auto_awesome</text>
              <text>AI审查报告摘要</text>
            </view>
            <view class="ai-summary-content">
              <button
                type="button"
                class="ai-agent-primary-btn"
                :disabled="agentSmartButtonDisabled"
                @click="onAgentSmartPrimaryClick"
              >
                <text class="material-symbols-outlined">smart_toy</text>
                <text>{{ agentSmartButtonText }}</text>
              </button>
              <text class="ai-agent-hint">先提交审核，再点击「查询进度」直至完成；完成后自动拉取 JSON 报告。</text>
              <view v-if="agentTaskError" class="ai-agent-error">
                <text>{{ agentTaskError }}</text>
              </view>
              <view v-if="agentAuditTaskId || agentTaskStatus" class="ai-agent-task-meta">
                <text class="ai-agent-task-line">任务 ID：{{ agentAuditTaskId ?? '—' }}</text>
                <text class="ai-agent-task-line">状态：{{ agentTaskStatusDisplay }}</text>
                <text v-if="agentTaskProgress != null" class="ai-agent-task-line">进度：{{ agentTaskProgress }}%</text>
                <text v-if="agentTaskStage" class="ai-agent-task-line">阶段：{{ agentTaskStage }}</text>
              </view>
              <view v-if="agentReportPayload" class="ai-agent-report">
                <text class="ai-agent-report-title">审查结果</text>
                <text v-if="agentReportIssuesCount != null" class="ai-agent-report-line">问题总数：{{ agentReportIssuesCount }}</text>
                <text
                  v-if="agentReportPayload.annotated_path || agentReportPayload.annotatedPath"
                  class="ai-agent-report-line ai-agent-report-mono"
                >标注稿：{{ agentReportPayload.annotated_path || agentReportPayload.annotatedPath }}</text>
                <text
                  v-if="agentReportPayload.zip_path || agentReportPayload.zipPath"
                  class="ai-agent-report-line ai-agent-report-mono"
                >ZIP：{{ agentReportPayload.zip_path || agentReportPayload.zipPath }}</text>
                <view v-if="agentReferenceVerificationForPanel.length" class="ai-agent-ref-block">
                  <text class="ai-agent-report-subtitle">参考文献核查（{{ agentReferenceVerificationForPanel.length }} 条）</text>
                </view>
                <view v-if="agentChunkReviewsForPanel.length" class="ai-agent-chunk-list">
                  <text class="ai-agent-report-subtitle">分段问题（{{ agentChunkReviewsForPanel.length }} 段）</text>
                  <view
                    v-for="(chunk, cIdx) in agentChunkReviewsForPanel"
                    :key="'ag-chunk-' + cIdx + '-' + (chunk.section_id ?? chunk.sectionId ?? cIdx)"
                    class="ai-agent-chunk-item"
                  >
                    <text
                      class="ai-agent-chunk-head"
                      :class="{ 'ai-agent-chunk-head-tap': agentChunkHeadCanLocate(chunk) }"
                      @tap.stop="onAgentChunkLocateClick(chunk)"
                      @click.stop="onAgentChunkLocateClick(chunk)"
                    >{{ getAgentChunkHeadLabel(chunk, cIdx) }} · 问题 {{ agentChunkIssueCount(chunk) }} 条</text>
                    <view
                      v-for="(iss, iIdx) in agentChunkIssuesPreview(chunk)"
                      :key="'ag-iss-' + cIdx + '-' + iIdx"
                      class="ai-agent-issue ai-agent-issue-tappable"
                      hover-class="ai-agent-issue-tap-hover"
                      @tap.stop="onAgentIssueLocateClick(iss, chunk)"
                      @click.stop="onAgentIssueLocateClick(iss, chunk)"
                    >
                      <text class="ai-agent-issue-type">{{ formatAgentIssueType(iss.issue_type || iss.issueType) }}</text>
                      <text class="ai-agent-issue-msg">{{ iss.message || iss.msg || '' }}</text>
                      <text v-if="iss.suggestion" class="ai-agent-issue-sug">建议：{{ iss.suggestion }}</text>
                    </view>
                  </view>
                </view>
              </view>
              <text v-else-if="aiSummary" class="summary-text">{{ aiSummary }}</text>
              <text
                v-else-if="!agentAuditTaskId && !agentTaskError"
                class="summary-placeholder"
              >暂无AI审查报告</text>
            </view>
          </view>
          
          <!-- 论文预览区 -->
          <view
            ref="teacherReviewPaperPreviewArea"
            class="paper-preview-area"
            :class="{ 'with-ai-summary': showAISummary }"
            @scroll="onDocumentScroll"
          >
            <view v-if="paperLoading" class="paper-loading">
              <text class="material-symbols-outlined spinning">progress_activity</text>
              <text>正在加载论文...</text>
            </view>
            <view v-else-if="currentStudent?.paper?.docxBlob || docxBlob" class="paper-content-wrapper">
              <view id="docx-preview-container" class="docx-preview-container"></view>
            </view>
            <view v-else class="paper-empty">
              <text class="material-symbols-outlined">description</text>
              <text>论文内容加载失败</text>
            </view>
          </view>
          
          <!-- 批注管理面板 -->
          <view class="annotation-panel">
            <view class="annotation-panel-header">
              <text class="panel-title">批注管理</text>
            </view>
            <view
              class="annotation-list"
              :key="'annotation-list-' + (currentPaper && (currentPaper.paperId || currentPaper.paper_id || currentPaper.id || '')) + '-' + ((currentPaper && currentPaper.annotations && currentPaper.annotations.length) || 0)"
            >
              <view v-if="filteredAnnotations.length === 0" class="annotation-empty">
                <text>暂无批注数据</text>
              </view>
              <view 
                v-else 
                v-for="(annotation, index) in filteredAnnotations" 
                :key="annotationRowKey(annotation, index)"
                class="annotation-item"
                :class="{ 'ai-annotation': annotation.type === 'ai', 'manual-annotation': annotation.type === 'manual', 'review-comment': annotation.isReviewComment, 'active': activeAnnotation === index }"
                @click="focusAnnotation(index)">
                <view class="annotation-header">
                  <text class="annotation-author">{{ annotation.isReviewComment ? '审阅意见' : (annotation.author || '批注') }}</text>
                  <text class="annotation-time">{{ annotation.time }}</text>
                </view>
                <text class="annotation-content">{{ annotation.content }}</text>
                <view v-if="annotation.selectedText || annotation.selected_text" class="annotation-selected-text">
                  <text class="annotation-selected-label">选中原文：</text>
                  <text class="annotation-selected-content">{{ annotation.selectedText || annotation.selected_text }}</text>
                </view>
                <view v-if="annotation.type !== 'ai' && !annotation.isReviewComment" class="annotation-actions" @click.stop>
                  <text class="annotation-action-btn edit-btn" @click.stop="openEditAnnotation(annotation, index)">编辑</text>
                  <text class="annotation-action-btn delete-btn" @click.stop="openDeleteAnnotation(annotation, index)">删除</text>
                </view>
              </view>
            </view>
            <button class="submit-review-btn" @click="openReviewCommentModal">
              <text>{{ hasReviewComment ? '修改审阅意见' : '提交审阅意见' }}</text>
            </button>
          </view>
        </view>
      </view>
    </view>
  </view>
    
    <!-- 审阅意见弹窗 -->
    <view v-if="showReviewCommentModal" class="custom-modal-mask" @click="closeReviewCommentModal">
      <view class="custom-modal-content review-comment-modal" @click.stop>
        <view class="custom-modal-header">
          <text class="material-symbols-outlined">rate_review</text>
          <text>{{ editingReviewComment ? '编辑审阅意见' : '提交审阅意见' }}</text>
        </view>
        <view class="annotation-input-body">
          <textarea 
            class="annotation-textarea" 
            v-model="reviewCommentForm.content" 
            placeholder="请输入审阅意见..."
            maxlength="2000"
            auto-height />
          <text class="char-count">{{ reviewCommentForm.content.length }}/2000</text>
        </view>
        <view class="custom-modal-footer">
          <view class="modal-btn cancel" @click="closeReviewCommentModal">取消</view>
          <view class="modal-btn confirm" @click="saveReviewComment">{{ editingReviewComment ? '保存修改' : '提交意见' }}</view>
        </view>
      </view>
    </view>

    <!-- 批注输入弹窗 -->
    <view v-if="showAnnotationInputModal" class="custom-modal-mask" @click="closeAnnotationInputModal">
      <view class="custom-modal-content annotation-input-modal" @click.stop>
        <view class="custom-modal-header">
          <text class="material-symbols-outlined">add_comment</text>
          <text>添加批注</text>
        </view>
        <view class="annotation-input-body">
          <view class="selected-text-preview" v-if="selectedText">
            <text class="preview-label">选中内容：</text>
            <text class="preview-content">{{ selectedText }}</text>
          </view>
          <textarea 
            class="annotation-textarea" 
            v-model="annotationInputContent" 
            placeholder="请输入批注内容..."
            maxlength="500"
            auto-height />
          <text class="char-count">{{ annotationInputContent.length }}/500</text>
        </view>
        <view class="custom-modal-footer">
          <view class="modal-btn cancel" @click="closeAnnotationInputModal">取消</view>
          <view class="modal-btn confirm" @click="submitAnnotation">确认添加</view>
        </view>
      </view>
    </view>

    <!-- 编辑批注弹窗 -->
    <view v-if="showEditAnnotationModal" class="custom-modal-mask" @click="closeEditAnnotationModal">
      <view class="custom-modal-content annotation-input-modal" @click.stop>
        <view class="custom-modal-header">
          <text class="material-symbols-outlined">edit_note</text>
          <text>编辑批注</text>
        </view>
        <view class="annotation-input-body">
          <view class="selected-text-preview" v-if="editAnnotationData.selected_text">
            <text class="preview-label">选中原文：</text>
            <text class="preview-content">{{ editAnnotationData.selected_text }}</text>
          </view>
          <textarea
            class="annotation-textarea"
            v-model="editAnnotationContent"
            placeholder="请输入批注内容..."
            maxlength="500"
            auto-height></textarea>
          <text class="char-count">{{ editAnnotationContent.length }}/500</text>
        </view>
        <view class="custom-modal-footer">
          <view class="modal-btn cancel" @click="closeEditAnnotationModal">取消</view>
          <view class="modal-btn confirm" @click="submitEditAnnotation">确认修改</view>
        </view>
      </view>
    </view>

    <!-- 删除批注确认弹窗 -->
    <view v-if="showDeleteAnnotationModal" class="custom-modal-mask" @click="closeDeleteAnnotationModal">
      <view class="custom-modal-content" style="max-width: 400px;" @click.stop>
        <view class="custom-modal-header">
          <text class="material-symbols-outlined" style="color: #ef4444;">delete_forever</text>
          <text>删除批注</text>
        </view>
        <view style="padding: 16px 24px; color: var(--on-surface-variant); font-size: 14px; line-height: 1.6;">
          <text>确定要删除这条批注吗？此操作不可恢复。</text>
        </view>
        <view class="custom-modal-footer">
          <view class="modal-btn cancel" @click="closeDeleteAnnotationModal">取消</view>
          <view class="modal-btn confirm danger" @click="submitDeleteAnnotation">确定删除</view>
        </view>
      </view>
    </view>

    <!-- 未选中文本提示弹窗 -->
    <view v-if="showNoSelectionModal" class="custom-modal-mask" @click="closeNoSelectionModal">
      <view class="custom-modal-content" style="max-width: 320px;" @click.stop>
        <view class="custom-modal-header">
          <text class="material-symbols-outlined" style="color: var(--primary);">info</text>
          <text>提示</text>
        </view>
        <view style="padding: 20px 24px; color: var(--on-surface-variant); font-size: 15px; line-height: 1.6; text-align: center;">
          <text>请先选中文本再添加批注</text>
        </view>
        <view class="custom-modal-footer">
          <view class="modal-btn confirm" @click="closeNoSelectionModal" style="width: 100%; border-left: none;">我知道了</view>
        </view>
      </view>
    </view>

    <!-- 未选中文本提示弹窗 -->
    <view v-if="showNoSelectionModal" class="custom-modal-mask" @click="closeNoSelectionModal">
      <view class="custom-modal-content" style="max-width: 320px;" @click.stop>
        <view class="custom-modal-header">
          <text class="material-symbols-outlined" style="color: var(--primary);">info</text>
          <text>提示</text>
        </view>
        <view style="padding: 20px 24px; color: var(--on-surface-variant); font-size: 15px; line-height: 1.6; text-align: center;">
          <text>请先选中文本再添加批注</text>
        </view>
        <view class="custom-modal-footer">
          <view class="modal-btn confirm" @click="closeNoSelectionModal" style="width: 100%; border-left: none;">我知道了</view>
        </view>
      </view>
    </view>

    <!-- 附件列表弹窗 -->
    <view v-if="showAttachmentModal" class="custom-modal-mask" @click="showAttachmentModal = false">
      <view class="custom-modal-content attachment-modal" @click.stop>
        <view class="custom-modal-header">
          <text class="material-symbols-outlined">attach_file</text>
          <text>附件列表</text>
          <text class="attachment-count" v-if="attachmentList.length > 0">({{ attachmentList.length }})</text>
        </view>
        <view class="attachment-list-body">
          <!-- 空状态 -->
          <view v-if="attachmentList.length === 0" class="attachment-empty">
            <text class="material-symbols-outlined" style="font-size: 48px; color: var(--on-surface-variant);">folder_open</text>
            <text style="color: var(--on-surface-variant); margin-top: 12px;">暂无附件</text>
          </view>
          <!-- 附件列表 -->
          <view v-else class="attachment-list">
            <view 
              v-for="(file, index) in attachmentList" 
              :key="index" 
              class="attachment-item"
              @click="previewAttachment(file)">
              <view class="attachment-icon">
                <text class="material-symbols-outlined">{{ getFileIcon(file.type) }}</text>
              </view>
              <view class="attachment-info">
                <text class="attachment-name">{{ file.name }}</text>
                <view class="attachment-meta">
                  <text class="attachment-size" v-if="file.size && file.size !== '0 B'">{{ file.size }}</text>
                  <text class="attachment-time" v-if="file.uploadTime">{{ formatTime(file.uploadTime) }}</text>
                </view>
              </view>
              <view class="attachment-action">
                <text class="material-symbols-outlined" style="color: var(--primary);">visibility</text>
              </view>
            </view>
          </view>
        </view>
        <view class="custom-modal-footer">
          <view class="modal-btn cancel" @click="showAttachmentModal = false">关闭</view>
        </view>
      </view>
    </view>

    <!-- 附件预览弹窗 -->
    <view v-if="showAttachmentPreviewModal" class="custom-modal-mask attachment-preview-mask" @click="closeAttachmentPreview">
      <view class="custom-modal-content attachment-preview-modal" @click.stop>
        <view class="custom-modal-header">
          <text class="material-symbols-outlined">preview</text>
          <text class="preview-title">{{ currentPreviewAttachment?.name || '附件预览' }}</text>
          <view class="preview-close-btn" @click="closeAttachmentPreview">
            <text class="material-symbols-outlined">close</text>
          </view>
        </view>
        <view class="attachment-preview-body">
          <!-- 加载中 -->
          <view v-if="isPreviewLoading" class="preview-loading">
            <view class="loading-spinner"></view>
            <text>加载中...</text>
          </view>
          <!-- 错误提示 -->
          <view v-else-if="previewError" class="preview-error">
            <text class="material-symbols-outlined" style="font-size: 48px; color: #ef4444;">error_outline</text>
            <text style="color: #ef4444; margin-top: 12px;">{{ previewError }}</text>
          </view>
          <!-- 不支持的文件类型 -->
          <view v-else-if="!isImageFile && !isPDFFile && !isDocxFile" class="preview-unsupported">
            <text class="material-symbols-outlined" style="font-size: 48px; color: var(--on-surface-variant);">description</text>
            <text style="color: var(--on-surface-variant); margin-top: 12px;">该文件类型暂不支持预览</text>
            <text style="color: var(--on-surface-variant); font-size: 12px; margin-top: 8px;">请下载后查看</text>
          </view>
          <!-- 图片预览 -->
          <image v-else-if="isImageFile" :src="currentPreviewAttachment?.url" mode="aspectFit" class="preview-image"></image>
          <!-- PDF 预览 -->
          <view v-else-if="isPDFFile" class="preview-pdf-container">
            <iframe 
              :src="pdfPreviewUrl" 
              class="preview-pdf-iframe"
              frameborder="0"
              type="application/pdf">
            </iframe>
          </view>
          <!-- DOCX 预览 -->
          <view v-else-if="isDocxFile" class="preview-docx-container">
            <view id="attachment-docx-preview" class="docx-preview-content"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 添加批注前需选中文本：页面内顶层遮罩，高于审阅弹窗与 uni 原生层 -->
    <view
      v-if="showSelectTextHintMask"
      class="select-text-hint-mask"
      @click="closeSelectTextHintMask">
      <view class="select-text-hint-dialog" @click.stop>
        <view class="select-text-hint-title">提示</view>
        <view class="select-text-hint-body">
          <text>请先在论文中选中需要批注的文本，再点击「添加批注」。</text>
        </view>
        <view class="select-text-hint-footer">
          <view class="select-text-hint-btn" @click="closeSelectTextHintMask">知道了</view>
        </view>
      </view>
    </view>
</template>
<script>
	import DeadlineSetting from "./DeadlineSetting.vue";
	import PaperDownload from "./PaperDownload.vue";

	// 引入API方法
	import {
		getClassList,
		getStudentsByClass,
		getDashboardData, 
		getDeadlineSetting, 
		saveDeadlineSetting,
		addAnnotation,
		updateAnnotation,
		deleteAnnotation,
		completeFeedback,
		confirmFinalize,
		triggerAIReview,
		updatePaperStatus,
		submitPaperReview,
		updatePaperReview,
		getPaperReview,
		getMessageList,
		batchDownloadPapers,
		postAgentAudit,
		getAgentTaskByPaper,
		getAgentTask,
		getAgentReport
	} from './api.js';
	import { get } from '@/api/request.js';
	import { logout } from '@/api/user.js';
	import { config } from '@/api/config.js';

	export default {
		components: {
			DeadlineSetting,
			PaperDownload
		},
		data() {
			return {
				currentFilter: 'all',
				students: [], // 改为空数组，从接口加载
				groupPapers: [], // 群组论文列表
				unuploadedMembers: [], // 未上传论文的成员列表
				loading: true, // 加载状态
				showReview: false,
				currentStudent: null,
				// 当前审阅的论文（必须在 data 中声明，Vue 3 下否则计算属性不会随批注更新而重算）
				currentPaper: null,
				// 审阅弹窗相关
				showAISummary: false,
				activeAnnotationTab: 'all',
				paperLoading: false,
				paperContent: '',
				aiSummary: '',
				// 智能体审核（审阅弹窗内手动提交 / 查询，打开弹窗不自动请求）
				agentAuditTaskId: null,
				agentTaskStatus: '',
				agentTaskProgress: null,
				agentTaskStage: '',
				agentTaskError: '',
				agentReportPayload: null,
				agentAuditSubmitting: false,
				agentReportLoading: false,
				docxBlob: null, // docx 文件 blob
				// 审阅工具栏字数（须绑定 data，避免批注等更新触发重绘时静态模板把 DOM 改写的字数冲回「统计中」）
				reviewToolbarWordCountText: '字数: 统计中...',
				// 批注输入弹窗
				showAnnotationInputModal: false,
				annotationInputContent: '',
				// 未选中文本提示弹窗
				showNoSelectionModal: false,
				// 未选中文本提示弹窗
				showNoSelectionModal: false,
				// 编辑批注
				showEditAnnotationModal: false,
				editAnnotationContent: '',
				editAnnotationData: {},
				// 删除批注
				showDeleteAnnotationModal: false,
				deleteAnnotationData: {},
				// 选中文本下划线标记
				currentHighlightRange: null,
				aiSummaryCollapsed: false,
				zoomLevel: 100,
				currentPage: 1, // 当前页码（论文列表分页）
				totalPageCount: 0, // 总页数
				docxCurrentPage: 1, // DOCX预览当前页码
				documentWordCount: null, // 文档字数（从DOM计算）
				documentScrollTop: 0, // 文档滚动位置
				scrollThrottleTimer: null, // 滚动节流定时器
				annotationMode: false,
				showSelectTextHintMask: false,
				selectedParagraph: null,
				selectedCoordinates: null, // 选中的坐标位置 {x, y}
				selectedText: '', // 当前选中的文本
				selectedRange: null, // 当前选中的文本范围
				activeAnnotation: null,
				showAnnotationModal: false,
				editingAnnotation: null,
				showFinalizeModal: false,
				aiReport: {}, // 改为空对象，从接口加载
				aiReviewLoading: false, // AI评审加载状态
				aiReviewPolling: null, // AI评审轮询定时器
				showDownloadModal: false,
				isBatchDownload: false,
				downloadPaperList: [],
				// 附件相关
				showAttachmentModal: false, // 控制附件弹窗
				currentAttachmentStudent: null, // 当前查看附件的学生
				attachmentList: [], // 附件列表
				// 附件预览相关
				showAttachmentPreviewModal: false, // 控制附件预览弹窗
				currentPreviewAttachment: null, // 当前预览的附件
				isPreviewLoading: false, // 预览加载状态
				previewError: null, // 预览错误信息
				// 下载状态
				downloadingPaperId: null, // 正在下载的论文ID
				isBatchDownloading: false, // 是否正在批量下载
				// 班级相关
				classList: [], // 班级列表
				classLoadError: false, // 班级加载失败标志
				studentLoadError: false, // 学生加载失败标志
				selectedClass: null, // 当前选中的班级
				// 统计数据
				stats: {
					totalStudents: 0,
					pendingReview: 0,
					feedback: 0,
					updated: 0,
					pendingUpdate: 0,
					finalized: 0
				},
				// 富文本批注表单数据
				annotationForm: {
					content: '',
					suggestion: '',
					paragraph: null
				},
				// 富文本格式状态
				currentFormat: {
					bold: false,
					italic: false,
					underline: false,
					unorderedList: false
				},
				// 编辑器上下文（新增）
				editorCtx: null,
				// 截止日期设置相关
				showDeadlineModal: false,
				modalLoading: false,
				saving: false,
				ddlId: null, // 新增：保存当前截止日期的ID，用于删除操作
				deadlineDate: '', // 日期部分（年-月-日）
				deadlineTime: '23:59:59', // 时间部分（时:分:秒）
				// 独立的时间单位
				year: 2026,
				month: 2,
				day: 6,
				hour: 23,
				minute: 59,
				second: 59,
				displayDeadline: '未设置', // 新增：用于静态显示的截止时间文本
				showCustomDeleteModal: false, // 自定义删除确认弹窗
				showLogoutConfirmModal: false, // 自定义退出确认弹窗
				showAllDeadlinesModal: false, // 新增：控制所有班级截止日期汇总弹窗
				allDeadlinesList: [], // 新增：存储各班级截止日期汇总数据
				today: '',
				remindDayIndex: 3,
				// 消息中心相关
				unreadMessageCount: 0,
				messages: [],
				// 消息中心分页
				messagePage: 1,
				messagePageSize: 4,
				showMessageCenter: false,
				showMessageDetailModal: false,
				currentMessageDetail: null,
				// 搜索相关
				searchKeyword: '', // 实际生效的搜索词（点击搜索后更新）
				searchInput: '', // 输入框临时值
				showFilterDropdown: false,
				// 分页相关
				currentPage: 1,
				pageSize: 3,
				unuploadedPageSize: 4,
				// 回到顶部按钮
				showBackToTop: false,
				// 批注删除确认相关
				showDeleteConfirm: false,
				annotationToDelete: null,
				// 深色模式
				darkMode: false,
				// 审阅意见相关
				showReviewCommentModal: false, // 控制审阅意见弹窗
				reviewCommentForm: {
					content: '' // 审阅意见内容
				},
				editingReviewComment: false, // 是否正在编辑审阅意见
				// 用户信息卡片
				showUserCard: false,
				userCardInfo: {
					name: '',
					username: '',
					role: ''
				},
				// 修改密码弹窗
				showPasswordModal: false,
				passwordForm: {
					oldPassword: '',
					newPassword: '',
					confirmPassword: ''
				},
				passwordError: '',
				// 定稿确认弹窗
				showFinalizeConfirmModal: false,
				finalizeConfirmPaper: null,
				finalizeConfirmStudent: null
			}
		},
		computed: {
			filteredStudents() {
				// 未上传筛选：直接返回未上传成员列表
				if (this.currentFilter === 'unuploaded') {
					console.log('filteredStudents - unuploaded模式, unuploadedMembers:', this.unuploadedMembers);
					const result = this.unuploadedMembers.map(member => ({
						id: member.student_id || member.id,
						name: member.student_name || member.name || '未知学生',
						isUnuploaded: true, // 标记为未上传
						unuploadedInfo: member
					}));
					console.log('filteredStudents - 未上传结果:', result);
					return result;
				}
				
				// 将所有学生的论文扁平化为论文卡片列表
				let paperCards = [];
				this.students.forEach(student => {
					// 获取该学生的所有论文
					let papers = [];
					if (student.papers && student.papers.length > 0) {
						papers = student.papers;
					} else if (student.paper) {
						papers = [student.paper];
					}
					
					// 为每篇论文创建卡片数据
					papers.forEach(paper => {
						paperCards.push({
							...student,
							paper: paper, // 当前显示的论文
							papers: papers, // 该学生的所有论文（用于切换等）
							isPaperCard: true // 标记为论文卡片
						});
					});
				});
				
				// 按状态筛选（新状态体系：待审阅、待修改、已定稿）
				if (this.currentFilter !== 'all') {
					// 新状态到原状态的映射
					const statusGroupMap = {
						'pending': ['待审阅', '已更新'], // 待审阅包含：原待审阅 + 原已更新
						'pending_update': ['待更新', '已审阅'], // 待修改包含：原待更新 + 原已审阅
						'finalized': ['已定稿']
					};
					const targetStatuses = statusGroupMap[this.currentFilter] || [];
					console.log('筛选状态:', this.currentFilter, '->', targetStatuses);
					console.log('筛选前论文卡片:', paperCards.map(c => ({ title: c.paper?.title, status: c.paper?.status })));
					paperCards = paperCards.filter(card => {
						const match = card.paper && targetStatuses.includes(card.paper.status);
						console.log('检查论文:', card.paper?.title, '状态:', card.paper?.status, '匹配:', match);
						return match;
					});
					console.log('筛选后论文卡片:', paperCards.length);
				}
				
				// 按学生姓名、学号或论文标题搜索
				if (this.searchKeyword && this.searchKeyword.trim()) {
					const keyword = this.searchKeyword.trim().toLowerCase();
					paperCards = paperCards.filter(card => {
						const studentName = (card.name || '').toLowerCase();
						const studentNumber = (card.studentNumber || card.id || '').toString().toLowerCase();
						const paperTitle = (card.paper?.title || '').toLowerCase();
						return studentName.includes(keyword) || 
							   studentNumber.includes(keyword) || 
							   paperTitle.includes(keyword);
					});
				}
				
				// 按学号排序（数字大小排序）
				paperCards.sort((a, b) => {
					const numA = parseInt(a.studentNumber || a.id || 0);
					const numB = parseInt(b.studentNumber || b.id || 0);
					return numA - numB;
				});
				
				return paperCards;
			},
			// 筛选标签显示
			getFilterLabel() {
				const labels = {
					'all': '全部状态',
					'pending': '待审阅',
					'pending_update': '待修改',
					'finalized': '已定稿',
					'unuploaded': '未上传'
				};
				return labels[this.currentFilter] || '全部状态';
			},
			// 消息中心分页后的列表
			paginatedMessages() {
				const start = (this.messagePage - 1) * this.messagePageSize;
				const end = start + this.messagePageSize;
				return this.messages.slice(start, end);
			},
			// 消息总页数
			totalMessagePages() {
				return Math.ceil(this.messages.length / this.messagePageSize);
			},
			// 分页后的学生列表
			paginatedStudents() {
				const pageSize = this.currentFilter === 'unuploaded' ? this.unuploadedPageSize : this.pageSize;
				const start = (this.currentPage - 1) * pageSize;
				const end = start + pageSize;
				return this.filteredStudents.slice(start, end);
			},
			// 总页数
			totalPages() {
				const pageSize = this.currentFilter === 'unuploaded' ? this.unuploadedPageSize : this.pageSize;
				return Math.ceil(this.filteredStudents.length / pageSize);
			},
			// 可见的页码
			visiblePages() {
				const pages = [];
				const maxVisible = 5;
				let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
				let end = Math.min(this.totalPages, start + maxVisible - 1);
				
				if (end - start < maxVisible - 1) {
					start = Math.max(1, end - maxVisible + 1);
				}
				
				for (let i = start; i <= end; i++) {
					pages.push(i);
				}
				return pages;
			},
			// 分页起始位置
			paginationStart() {
				const pageSize = this.currentFilter === 'unuploaded' ? this.unuploadedPageSize : this.pageSize;
				return (this.currentPage - 1) * pageSize + 1;
			},
			// 分页结束位置
			paginationEnd() {
				const pageSize = this.currentFilter === 'unuploaded' ? this.unuploadedPageSize : this.pageSize;
				return Math.min(this.currentPage * pageSize, this.filteredStudents.length);
			},
			// 按学号排序的班级成员列表
			sortedClassMembers() {
				return [...this.classMemberList].sort((a, b) => {
					const idA = parseInt(a.id) || 0;
					const idB = parseInt(b.id) || 0;
					return idA - idB;
				});
			},
			// 按学号排序的可邀请学生列表
			sortedAvailableStudents() {
				return [...this.availableStudents].sort((a, b) => {
					const idA = parseInt(a.id) || 0;
					const idB = parseInt(b.id) || 0;
					return idA - idB;
				});
			},
			// 判断当前预览文件是否为图片
			isImageFile() {
				if (!this.currentPreviewAttachment) return false;
				const ext = this.currentPreviewAttachment.name?.split('.').pop()?.toLowerCase();
				return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext);
			},
			// 判断当前预览文件是否为PDF
			isPDFFile() {
				if (!this.currentPreviewAttachment) return false;
				const ext = this.currentPreviewAttachment.name?.split('.').pop()?.toLowerCase();
				return ext === 'pdf';
			},
			// 判断当前预览文件是否为 docx
			isDocxFile() {
				if (!this.currentPreviewAttachment) return false;
				const ext = this.currentPreviewAttachment.name?.split('.').pop()?.toLowerCase();
				return ext === 'docx';
			},
			// PDF 预览 URL
			pdfPreviewUrl() {
				if (!this.currentPreviewAttachment) return null;
				const storagePath = this.currentPreviewAttachment.storagePath;
				if (!storagePath) return null;
				const baseUrl = config.baseURL;
				// 绝对路径：提取文件名，拼接静态服务路径
				if (storagePath.startsWith('/root/') || storagePath.startsWith('/home/')) {
					const fileName = storagePath.split('/').pop();
					return `${baseUrl}/doc/attachment/${fileName}`;
				}
				// 已是完整 URL
				if (storagePath.startsWith('http')) return storagePath;
				// 相对路径
				const path = storagePath.startsWith('/') ? storagePath : '/' + storagePath;
				return `${baseUrl}${path}`;
			},
			// DOCX总页数
			docxTotalPages() {
				// 优先使用已存储的总页数
				if (this.totalPageCount > 0) {
					return this.totalPageCount;
				}
				// 从 docx-preview 渲染的页面数量获取
				const container = document.getElementById('docx-preview-container');
				if (container) {
					const wrapper = container.querySelector('.docx-preview-wrapper-wrapper');
					if (wrapper && wrapper.children.length > 0) {
						return wrapper.children.length;
					}
				}
				return 0;
			},
			// 当前页码（从数据中获取）
			currentPageNum() {
				return this.docxCurrentPage || 1;
			},
			documentParagraphs() {
				return this.currentPaper ? (this.currentPaper.paragraphs || []) : [];
			},
			// 过滤后的批注列表（审阅意见置顶）
			filteredAnnotations() {
				if (!this.currentPaper) {
					console.log('[filteredAnnotations] currentPaper 为空');
					return [];
				}
				// 与 applyAnnotationsToPapers 写入的 annotationCount 联动，避免仅依赖数组引用时偶发不刷新
				void this.currentPaper.annotationCount;
				let annotations = this.currentPaper.annotations || [];
				console.log('[filteredAnnotations] currentPaper:', this.resolvePaperId(this.currentPaper), 'annotations:', annotations.length);
				
				// 将审阅意见置顶（如果存在）
				const reviewComment = annotations.find(a => a.isReviewComment);
				if (reviewComment) {
					// 移除审阅意见，然后插入到最前面
					annotations = annotations.filter(a => !a.isReviewComment);
					annotations.unshift(reviewComment);
				}
				
				return annotations;
			},
			// 是否有审阅意见（兼容 paper 和 papers 两种数据结构）
			hasReviewComment() {
				if (!this.currentPaper || !this.currentPaper.annotations) return false;
				return this.currentPaper.annotations.some(a => a.isReviewComment);
			},
			// 获取审阅意见
			reviewComment() {
				if (!this.currentPaper || !this.currentPaper.annotations) return null;
				return this.currentPaper.annotations.find(a => a.isReviewComment);
			},
			// 完整截止时间预览
			fullDeadlinePreview() {
				const yearStr = String(this.year);
				const monthStr = String(this.month).padStart(2, '0');
				const dayStr = String(this.day).padStart(2, '0');
				const hourStr = String(this.hour).padStart(2, '0');
				const minuteStr = String(this.minute).padStart(2, '0');
				const secondStr = String(this.second).padStart(2, '0');
				return `${yearStr}-${monthStr}-${dayStr} ${hourStr}:${minuteStr}:${secondStr}`;
			},
			agentSmartButtonText() {
				if (this.agentAuditSubmitting) return '提交中…';
				if (this.agentReportLoading) return '加载报告中…';
				if (!this.agentAuditTaskId) return '提交智能体审核';
				return '查询进度';
			},
			agentSmartButtonDisabled() {
				return (
					this.agentAuditSubmitting ||
					this.agentReportLoading ||
					!this.currentPaper ||
					!this.resolvePaperId(this.currentPaper)
				);
			},
			agentTaskStatusDisplay() {
				const s = (this.agentTaskStatus || '').toLowerCase();
				const map = {
					pending: '排队中',
					processing: '分析中',
					running: '分析中',
					done: '已完成',
					completed: '已完成',
					success: '已完成',
					failed: '失败',
					error: '失败'
				};
				return map[s] || this.agentTaskStatus || '—';
			},
			agentReportIssuesCount() {
				const p = this.agentReportPayload;
				if (!p) return null;
				if (p.issues_count != null) return p.issues_count;
				if (p.issuesCount != null) return p.issuesCount;
				const ar = p.ai_review || p.aiReview;
				const sum = ar && ar.summary;
				if (sum && typeof sum === 'object' && sum.chunk_issue_count != null) return sum.chunk_issue_count;
				return null;
			},
			agentChunkReviewsForPanel() {
				const p = this.agentReportPayload;
				if (!p) return [];
				const list = p.chunk_reviews || p.chunkReviews;
				if (Array.isArray(list) && list.length > 0) return list;
				// 与《前端定位段落位置说明》一致：部分报告在 parse_result.data.sections
				const parsed = p.parse_result?.data ?? p.parse_result ?? {};
				const sections = parsed.sections;
				return Array.isArray(sections) ? sections : [];
			},
			agentReferenceVerificationForPanel() {
				const p = this.agentReportPayload;
				if (!p) return [];
				const r = p.reference_verification || p.referenceVerification;
				return Array.isArray(r) ? r : [];
			},
			// 审阅弹窗顶部工具栏是否显示「确认定稿」（待审阅/已更新；定稿 API 走解析出的「已更新」记录）
			reviewFinalizeVisible() {
				if (!this.showReview || !this.currentPaper) return false;
				const s = this.currentPaper.status;
				if (s !== '待审阅' && s !== '已更新') return false;
				const target = this.resolveFinalizeTargetPaperForReview();
				return !!(target && (target.paperId != null || target.id != null));
			}
		},
		watch: {
			// 监听批注弹窗显示状态，初始化数据
			'showAnnotationModal'(newVal) {
				if (newVal) {
					this.annotationForm.paragraph = this.selectedParagraph;
					if (this.editingAnnotation) {
						// 编辑模式：加载已有批注
						// 优先使用分开存储的字段
						if (this.editingAnnotation.selectedText !== undefined) {
							// 新格式：有分开存储的字段
							this.annotationForm.selectedText = this.editingAnnotation.selectedText || '';
							this.annotationForm.content = this.editingAnnotation.content || '';
							this.annotationForm.suggestion = this.editingAnnotation.suggestion || '';
						} else {
							// 旧格式：需要从 content 中解析
							const content = this.editingAnnotation.content || '';
							const lines = content.split('\n');
							let parsedSelectedText = '';
							let parsedContent = '';
							let parsedSuggestion = '';
							
							lines.forEach(line => {
								if (line.startsWith('选中内容：')) {
									parsedSelectedText = line.replace('选中内容：', '');
								} else if (line.startsWith('批注：')) {
									parsedContent = line.replace('批注：', '');
								} else if (line.startsWith('建议：')) {
									parsedSuggestion = line.replace('建议：', '');
								} else {
									// 兼容旧数据
									parsedContent = content;
								}
							});
							
							this.annotationForm.selectedText = parsedSelectedText;
							this.annotationForm.content = parsedContent;
							this.annotationForm.suggestion = parsedSuggestion;
						}
						this.annotationForm.paragraph = this.editingAnnotation.paragraph;
					} else {
						// 新增模式：清空表单
						this.annotationForm.selectedText = this.selectedText || '';
						this.annotationForm.content = '';
						this.annotationForm.suggestion = '';
						this.annotationForm.paragraph = this.selectedParagraph;
					}
					// 重置格式状态
					this.currentFormat = {
						bold: false,
						italic: false,
						underline: false,
						unorderedList: false
					};
					// 确保编辑器初始化
					this.$nextTick(() => {
						this.initEditor();
					});
				}
			}
		},
		async onLoad() {
			console.log('onLoad 开始执行');
			
			// 延迟一小段时间，确保登录后的 token 和用户信息已保存到 storage
			await new Promise(resolve => setTimeout(resolve, 100));
			
			// 页面加载时先加载班级列表
			await this.loadClassList();
			
			console.log('onLoad 执行完成');
		},
		mounted() {
			// 初始化今日日期
			const date = new Date();
			const year = date.getFullYear();
			const month = (date.getMonth() + 1).toString().padStart(2, '0');
			const day = date.getDate().toString().padStart(2, '0');
			this.today = `${year}-${month}-${day}`;

			// 加载已保存的截止日期设置
			this.loadDeadlineSetting();
			
			// 加载深色模式设置
			this.loadThemeSetting();
			
			// 加载用户信息
			const userInfo = uni.getStorageSync('userInfo') || {};
			this.userCardInfo = {
				name: userInfo.full_name || userInfo.name || userInfo.nickname || userInfo.username || '教师',
				username: userInfo.username || '',
				role: '教师'
			};
		},
		methods: {
			onAvatarError(e) {
				// 头像加载失败时，使用默认图标
				const img = e.target || e.detail.target;
				if (img) {
					img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9IiNEOUQ5RDkiLz4KPHBhdGggZD0iTTMwIDIwQzI0LjQ3NzEgMjAgMjAgMjQuNDc3MSAyMCAzMEMyMCAzNS41MjI5IDI0LjQ3NzEgNDAgMzAgNDBDMzUuNTIyOSA0MCA0MCAzNS41MjI5IDQwIDMwQzQwIDI0LjQ3NzEgMzUuNTIyOSAyMCAzMCAyMFoiIGZpbGw9IiM5OTk5OTkiLz4KPHBhdGggZD0iTTMwIDM1QzI2LjY4NjMgMzUgMjQgMzcuNjg4NjMgMjQgNDFMMjQgNTBIMzZMMzYgNDFDMzYgMzcuNjg2MyAzMy4zMTM3IDM1IDMwIDM1WiIgZmlsbD0iIzk5OTk5OSIvPgo8L3N2Zz4K';
				}
			},
			// 打开 PDF 版本（在新标签页中查看）
			openPDFVersion() {
				// 优先使用 currentPaper，然后是 currentStudent.paper，最后是 currentStudent.papers[0]
				const paper = this.currentPaper || this.currentStudent?.paper || (this.currentStudent?.papers && this.currentStudent.papers[0]);
				console.log('openPDFVersion - currentPaper:', this.currentPaper);
				console.log('openPDFVersion - currentStudent:', this.currentStudent);
				console.log('openPDFVersion - paper:', paper);
				if (!paper) {
					uni.showToast({ title: '论文信息不存在', icon: 'none' });
					return;
				}
				const pdfOssKey = paper.pdf_oss_key || paper.pdfOssKey;
				console.log('openPDFVersion - pdfOssKey:', pdfOssKey);
				if (!pdfOssKey) {
					uni.showToast({ title: '暂无 PDF 版本', icon: 'none' });
					return;
				}
				// 构建 PDF URL（复用学生端的 getFileUrl 逻辑）
				const baseUrl = config.baseURL;
				let pdfUrl;
				if (pdfOssKey.startsWith('/root/') || pdfOssKey.startsWith('/home/')) {
					const fileName = pdfOssKey.split('/').pop();
					pdfUrl = `${baseUrl}/doc/essay/${fileName}`;
				} else if (pdfOssKey.startsWith('http')) {
					pdfUrl = pdfOssKey;
				} else {
					const path = pdfOssKey.startsWith('/') ? pdfOssKey : '/' + pdfOssKey;
					pdfUrl = `${baseUrl}${path}`;
				}
				console.log('打开 PDF 版本:', pdfUrl);
				// #ifdef H5
				window.open(pdfUrl, '_blank');
				// #endif
				// #ifndef H5
				uni.navigateTo({
					url: `/pages/common/pdf-viewer?url=${encodeURIComponent(pdfUrl)}`
				});
				// #endif
			},
			// 加载班级列表
			async loadClassList(retryCount = 0) {
				try {
					this.loading = true;
					
					// 检查用户信息是否已准备好
					const userInfo = uni.getStorageSync('userInfo') || {};
					const teacherId = userInfo.id || uni.getStorageSync('teacher_id') || 0;
					
					console.log('loadClassList - userInfo:', userInfo);
					console.log('loadClassList - teacherId:', teacherId);
					
					if (!teacherId || teacherId === 0) {
						console.warn('用户信息未准备好，延迟重试...');
						if (retryCount < 3) {
							// 延迟 500ms 后重试
							await new Promise(resolve => setTimeout(resolve, 500));
							return this.loadClassList(retryCount + 1);
						} else {
							console.error('重试次数用完，使用模拟数据');
							throw new Error('用户信息未准备好');
						}
					}
					
					console.log('开始调用 getClassList...');
					const res = await getClassList();
					console.log('getClassList 返回:', res);
					console.log('获取班级列表返回:', res);
					// 处理后端的两种返回格式：分页格式 {items: [...]} 或标准格式 {code: 200, data: [...]}
					if(res && res.items && Array.isArray(res.items)) {
						// 分页格式：直接使用 items 数组
						console.log('班级列表原始数据:', res.items);
						this.classList = res.items.map(item => {
							// 尝试多种可能的字段名来获取论文数量
							const paperCount = item.paper_count || item.paperCount || item.total_papers || 
												 (item.pending_papers || 0) + (item.reviewed_papers || 0) || 
												 (item.papers ? item.papers.length : 0) || 0;
							return {
								id: item.group_id,
								name: item.group_name,
								code: item.group_id,
								studentCount: item.student_count || 0,
								paperCount: paperCount,
								pendingCount: item.pending_papers || 0,
								feedbackCount: item.reviewed_papers || 0
							};
						});
						console.log('班级列表数据（分页格式）:', this.classList);
					} else if(res && res.code === 200 && res.data) {
						// 标准格式
						this.classList = res.data;
						console.log('班级列表数据（标准格式）:', this.classList);
					} else {
						console.log('班级列表返回异常:', res);
						this.classLoadError = true;
					}
					this.loading = false;
				} catch (err) {
					console.error('加载班级列表失败:', err);
					this.classLoadError = true;
					this.loading = false;
				}
			},
			// 选择班级
			async selectClass(classItem) {
				this.selectedClass = classItem;
				this.studentLoadError = false; // 重置学生加载错误状态
				// 先 await 确保学生+论文数据加载完毕（getStudentsByClass 已含论文状态/版本信息）
				await this.loadDashboardData();
				this.loadDeadlineSetting(); // 切换班级时加载对应班级的截止日期
						
				// 补充论文文件路径（ossKey），不覆盖状态/版本
				this.loadGroupPapers();
						
				// 调用接口获取未上传论文的成员列表
				await this.loadUnuploadedMembers();
			},
			
			// 加载群组论文列表
			async loadGroupPapers() {
				if (!this.selectedClass) return;
				
				try {
					const teacherId = uni.getStorageSync('teacher_id') || uni.getStorageSync('userInfo')?.id;
					const groupId = this.selectedClass.id;
					
					console.log('加载群组论文列表:', { teacherId, groupId });
					
					const { getGroupPapers } = await import('@/api/teacher.js');
					const res = await getGroupPapers(teacherId, groupId);
					
					console.log('群组论文列表返回:', res);
					console.log('res结构:', Object.keys(res || {}));
					console.log('res.papers:', res?.papers);
					console.log('res.data:', res?.data);
					console.log('res.data?.papers:', res?.data?.papers);
					
					// 判断成功：后端直接返回数据对象
					const hasValidData = res && (res.papers !== undefined || res.data?.papers !== undefined);
					console.log('hasValidData:', hasValidData);
					
					if (hasValidData) {
						// 处理论文列表数据
						const papers = res.papers || res.data?.papers || [];
						this.groupPapers = papers;
						console.log('获取到论文数量:', papers.length);
						
						// 将论文数据按学生分组
						if (papers.length > 0) {
							// 按学生ID分组论文
							const studentPapersMap = new Map();
							
							papers.forEach((paper) => {
								console.log('处理论文:', paper);
								// 接口返回的字段名可能不同，做兼容处理
								const ownerId = paper.owner_id || paper.student_id || paper.author_id;
								const studentId = paper.student_id || paper.author_id || paper.id;
								const studentNumber = paper.student_number || '';
								const studentName = paper.student_name || paper.author_name || studentNumber || '未知学生';
								// 优先从文件路径中提取文件名作为论文标题
															let paperTitle = paper.title || paper.paper_title;
															if (!paperTitle) {
																// 从 oss_key 或 file_path 中提取文件名
																const filePath = paper.oss_key || paper.file_path || paper.file_url;
																if (filePath) {
																	// 提取路径中的文件名（去掉扩展名）
																	const fileName = filePath.split('/').pop();
																	if (fileName) {
																		// 去掉扩展名
																		const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
																		// 提取第一个下划线后面的内容作为论文名
																		const firstUnderscoreIndex = nameWithoutExt.indexOf('_');
																		if (firstUnderscoreIndex !== -1) {
																			paperTitle = nameWithoutExt.substring(firstUnderscoreIndex + 1);
																		} else {
																			paperTitle = nameWithoutExt;
																		}
																	} else {
																		paperTitle = `${studentName}的论文`;
																	}
																} else {
																	paperTitle = `${studentName}的论文`;
																}
															}
								// 使用列表接口返回的状态，并转换为中文
								const rawStatus = paper.paper_status || paper.status || 'pending';
								const statusMap = {
									'pending': '待审阅',
									'feedback': '已审阅',
									'updated': '已更新',
									'pending_update': '待更新',
									'finalized': '已定稿'
								};
								const paperStatus = statusMap[rawStatus] || rawStatus;
								// 处理版本号，优先使用详情接口返回的版本，去掉可能存在的 v 前缀
															let paperVersion = paper.paper_version || paper.version || '1';
															paperVersion = String(paperVersion).replace(/^v/i, '');
								const updateTime = paper.updated_at || paper.paper_update_time || paper.created_at || new Date().toLocaleString();
								const annotationCount = paper.annotation_count || paper.annotationCount || 0;
								const ossKey = paper.oss_key || paper.file_path || paper.file_url || null;
								const paperId = paper.paper_id || paper.id || null;
								const pdfOssKey = paper.pdf_oss_key || paper.pdfOssKey || null;
																
								const paperObj = {
									title: paperTitle,
									status: paperStatus,
									version: paperVersion,
									updateTime: updateTime,
									annotationCount: annotationCount,
									ossKey: ossKey,
									pdfOssKey: pdfOssKey,
									paperId: paperId,
									ownerId: ownerId
								};
								
								if (!studentPapersMap.has(studentId)) {
									studentPapersMap.set(studentId, {
										id: studentId,
										name: studentName,
										studentNumber: studentNumber,
										papers: []
									});
								}
								studentPapersMap.get(studentId).papers.push(paperObj);
							});
							
							console.log('学生论文分组:', studentPapersMap);
							
							// 合并到 students 中：只补充 ossKey/pdfOssKey，不覆盖状态和版本
							studentPapersMap.forEach((studentData, studentId) => {
								const existingIndex = this.students.findIndex(s => String(s.id) === String(studentId));
								if (existingIndex >= 0) {
									const existingPapers = this.students[existingIndex].papers;
									// 只补充文件路径字段，保留已有的状态/版本/标题
									studentData.papers.forEach(gPaper => {
										const matchIdx = existingPapers.findIndex(p => 
											String(p.paperId) === String(gPaper.paperId) ||
											String(p.paperId) === String(gPaper.id)
										);
										if (matchIdx >= 0) {
											// 已有记录：只补充缺少的文件路径和标题
											if (gPaper.ossKey) existingPapers[matchIdx].ossKey = gPaper.ossKey;
											if (gPaper.pdfOssKey) existingPapers[matchIdx].pdfOssKey = gPaper.pdfOssKey;
											if (gPaper.updateTime && !existingPapers[matchIdx].updateTime) {
												existingPapers[matchIdx].updateTime = gPaper.updateTime;
											}
											// 若 getStudentsByClass 未能提取到真实标题，用 getGroupPapers 的标题补充
											if (gPaper.title && (!existingPapers[matchIdx].title || existingPapers[matchIdx].title.endsWith('的论文'))) {
												existingPapers[matchIdx].title = gPaper.title;
											}
										} else {
											// 该论文不在 getStudentsByClass 结果中，直接追加
											existingPapers.push(gPaper);
										}
									});
									console.log('补充学生论文文件路径:', studentId, '论文数:', existingPapers.length);
								} else {
									// 添加新学生
									console.log('添加新学生:', studentId, studentData.name, '论文数:', studentData.papers.length);
									this.students.push(studentData);
								}
							});
							
							console.log('合并后学生总数:', this.students.length);
							
							// 更新统计
							this.updateStats();
						}
					} else {
						console.warn('获取群组论文列表失败:', res?.message || res);
						this.groupPapers = [];
					}
				} catch (err) {
					console.error('加载群组论文列表失败:', err);
					this.groupPapers = [];
				}
			},
			
			// 加载未上传论文的成员列表
			async loadUnuploadedMembers() {
				if (!this.selectedClass) return;
				
				try {
					const groupId = this.selectedClass.id;
					
					console.log('加载未上传论文的成员列表:', { groupId });
					
					const { getUnuploadedMembers } = await import('@/api/teacher.js');
					const res = await getUnuploadedMembers(groupId);
					
					console.log('未上传论文成员列表返回:', res);
					console.log('res.code:', res?.code, 'res.data:', res?.data);
					
					// 判断成功：后端直接返回数据对象，不是 {code, data} 格式
					// 检查是否有 unuploaded_members 字段来判断是否成功
					const hasValidData = res && (res.unuploaded_members !== undefined || res.code === 200);
					console.log('hasValidData:', hasValidData);
					
					if (hasValidData) {
						// 后端直接返回数据对象，不是嵌套在 data 中
						this.unuploadedMembers = res.unuploaded_members || res.data?.unuploaded_members || res.data?.members || [];
						console.log('获取到未上传论文成员数量:', this.unuploadedMembers.length);
						console.log('unuploadedMembers数据:', this.unuploadedMembers);
					} else {
						console.warn('获取未上传论文成员列表失败:', res?.message || '数据格式不符');
						this.unuploadedMembers = [];
					}
				} catch (err) {
					console.error('加载未上传论文成员列表失败:', err);
					this.unuploadedMembers = [];
				}
			},
			// 返回班级列表
			backToClassList() {
				this.selectedClass = null;
				this.students = [];
			},
			// 加载仪表盘数据（核心改造：优化加载逻辑和失败处理）
			async loadDashboardData() {
				try {
					this.loading = true;
					// 如果有选中的班级，按班级加载学生数据
					if (this.selectedClass) {
						const res = await getStudentsByClass(this.selectedClass.id);
						console.log('getStudentsByClass 返回:', JSON.stringify(res)?.slice(0, 200));
						// 兼容多种返回格式：直接返回 {group_id, students:[...]} 或 {code:200, data:[...]} 或数组
						let studentsRaw = null;
						if (res && Array.isArray(res.students)) {
							studentsRaw = res.students; // 后端直接返回 {group_id, students}
						} else if (res && res.code === 200 && res.data) {
							studentsRaw = Array.isArray(res.data.students) ? res.data.students : res.data;
						} else if (Array.isArray(res)) {
							studentsRaw = res;
						}
						
						if (studentsRaw !== null) {
							// 状态映射
							const statusMap = {
								'pending': '待审阅',
								'feedback': '已审阅',
								'updated': '已更新',
								'pending_update': '待更新',
								'finalized': '已定稿'
							};
							// 将后端字段转换为前端标准格式
							this.students = studentsRaw.map(student => {
								const studentName = student.student_name || student.name || '未知学生';
								const papers = (student.papers || []).map(paper => {
									const rawStatus = paper.paper_status || paper.status || 'pending';
									const paperStatus = rawStatus.includes('阅') || rawStatus.includes('传') || rawStatus.includes('稿') || rawStatus.includes('新')
										? rawStatus // 已经是中文
										: (statusMap[rawStatus] || rawStatus);
									
									let paperVersion = paper.paper_version || paper.version || '1';
									paperVersion = String(paperVersion).replace(/^v/i, '');
									
									// 从文件路径提取论文标题
									let paperTitle = paper.title || paper.paper_title || null;
									if (!paperTitle) {
										const filePath = paper.oss_key || paper.file_path || paper.file_url;
										if (filePath) {
											const fileName = filePath.split('/').pop();
											if (fileName) {
												const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
												const idx = nameWithoutExt.indexOf('_');
												paperTitle = idx !== -1 ? nameWithoutExt.substring(idx + 1) : nameWithoutExt;
											}
										}
										if (!paperTitle) paperTitle = `${studentName}的论文`;
									}
									
									return {
										paperId: paper.paper_id || paper.id,
										paper_id: paper.paper_id != null ? paper.paper_id : paper.id,
										title: paperTitle,
										status: paperStatus,
										version: paperVersion,
										paper_version: paper.paper_version || paper.version || '',
										updateTime: paper.paper_update_time || paper.updated_at || '',
										annotationCount: paper.annotation_count || 0,
										ossKey: paper.oss_key || null,
										pdfOssKey: paper.pdf_oss_key || null,
										ownerId: student.student_id || student.id
									};
								});
								return {
									id: student.student_id || student.id,
									name: studentName,
									studentNumber: student.student_number || '',
									papers: papers
								};
							});
							this.studentLoadError = false;
						} else if (res && res.code && res.code !== 200 && this.students.length === 0) {
							this.studentLoadError = true;
						}
						this.updateStats();
						this.loading = false;
					} else {
						// 调用改造后的API，先真实请求，失败自动降级
						const res = await getDashboardData();
						const data = res.data || {};
						// 更新页面数据
						this.students = data.students || [];
						this.aiReport = data.aiReport || { total: 0, highRisk: 0, mediumRisk: 0, lowRisk: 0 };
						this.updateStats();
						
						// 仅当接口返回空数据时提示（本地数据有内容则不提示）
						if (this.students.length === 0) {
							uni.showToast({
								title: '当前无学生数据',
								icon: 'none',
								duration: 1500
							});
						}
						this.loading = false;
					}
				} catch (err) {
					console.error('加载仪表盘数据失败:', err);
					this.studentLoadError = true;
					this.loading = false;
				}
			},
			formatPaperCardUpdateTime(paper) {
				if (!paper) return '暂无更新时间';
				const t = paper.updateTime || paper.paper_update_time || paper.updated_at;
				if (t == null || String(t).trim() === '') return '暂无更新时间';
				return String(t).trim();
			},
			resetAgentAuditState() {
				this.agentAuditTaskId = null;
				this.agentTaskStatus = '';
				this.agentTaskProgress = null;
				this.agentTaskStage = '';
				this.agentTaskError = '';
				this.agentReportPayload = null;
				this.agentAuditSubmitting = false;
				this.agentReportLoading = false;
			},
			unwrapAgentApiPayload(res) {
				if (res == null || typeof res !== 'object') return res;
				const d = res.data;
				if (
					d &&
					typeof d === 'object' &&
					!Array.isArray(d) &&
					(d.task_id != null ||
						d.status != null ||
						d.paper_id != null ||
						d.chunk_reviews != null ||
						d.parse_result != null ||
						d.ai_review != null ||
						d.issues_count != null)
				) {
					return d;
				}
				if (d && typeof d === 'object' && d.data && typeof d.data === 'object') {
					const inner = d.data;
					if (
						inner.chunk_reviews != null ||
						inner.parse_result != null ||
						Array.isArray(inner.sections) ||
						inner.ai_review != null ||
						inner.issues_count != null
					) {
						return inner;
					}
				}
				return res;
			},
			isAgentTaskTerminalDone(status) {
				const s = (status || '').toLowerCase();
				return s === 'done' || s === 'completed' || s === 'success';
			},
			isAgentTaskTerminalFailed(status) {
				const s = (status || '').toLowerCase();
				return s === 'failed' || s === 'error';
			},
			/** 提交审核失败但后端表示「已提交过」类错误时，改走按论文查询任务 */
			isAgentDuplicateAuditSubmitError(message) {
				const msg = message == null ? '' : String(message);
				if (!msg) return false;
				return (
					msg.includes('任务记录未成功写入') ||
					msg.includes('写入 MySQL') ||
					/已提交过|重复提交|duplicate|already\s*exist|unique|唯一约束/i.test(msg)
				);
			},
			/** GET /agent/tasks/by-paper：绑定 task_id，已完成则直接拉报告 */
			async agentBindTaskFromByPaper(paperIdNum, versionRaw) {
				const raw = await getAgentTaskByPaper(paperIdNum, versionRaw);
				const data = this.unwrapAgentApiPayload(raw);
				const tid = data?.task_id ?? data?.id;
				if (tid == null) {
					return false;
				}
				this.agentAuditTaskId = tid;
				this.agentTaskStatus = data?.status || '';
				this.agentTaskProgress = data?.progress != null ? Number(data.progress) : null;
				this.agentTaskStage = data?.current_stage || '';
				const errMsg = data?.error_message ?? data?.errorMessage;
				if (errMsg) {
					this.agentTaskError = String(errMsg);
				} else {
					this.agentTaskError = '';
				}
				if (this.isAgentTaskTerminalFailed(this.agentTaskStatus)) {
					this.agentTaskError = this.agentTaskError || '智能体分析失败';
					return true;
				}
				if (this.isAgentTaskTerminalDone(this.agentTaskStatus)) {
					await this.fetchAgentReportNow();
				}
				return true;
			},
			async onAgentSmartPrimaryClick() {
				if (this.agentSmartButtonDisabled) return;
				const paperIdNum = this.resolveAgentPaperIdNum();
				const versionRaw = this.resolveAgentPaperVersionRaw();
				if (paperIdNum == null) {
					this.agentTaskError = '无法解析论文 ID，请关闭弹窗后重新从列表打开该论文。';
					uni.showToast({ title: '无法获取论文ID', icon: 'none' });
					return;
				}
				if (!this.agentAuditTaskId) {
					this.agentAuditSubmitting = true;
					this.agentTaskError = '';
					try {
						const raw = await postAgentAudit(paperIdNum, versionRaw);
						const data = this.unwrapAgentApiPayload(raw);
						const tid = data?.task_id ?? data?.id;
						if (tid == null) {
							throw new Error(raw?.message || data?.message || '未返回任务 ID');
						}
						this.agentAuditTaskId = tid;
						this.agentTaskStatus = data?.status || 'pending';
						this.agentTaskProgress = data?.progress != null ? Number(data.progress) : null;
						this.agentTaskStage = data?.current_stage || '';
						uni.showToast({ title: '已提交智能体审核', icon: 'success' });
						this.showAISummary = true;
					} catch (e) {
						const errMsg = e?.message || String(e) || '提交失败';
						if (this.isAgentDuplicateAuditSubmitError(errMsg)) {
							try {
								const bound = await this.agentBindTaskFromByPaper(paperIdNum, versionRaw);
								if (bound) {
									this.showAISummary = true;
									if (this.agentReportPayload) {
										uni.showToast({ title: '已有审核任务，已加载报告', icon: 'success' });
									} else if (this.isAgentTaskTerminalDone(this.agentTaskStatus)) {
										uni.showToast({
											title: this.agentTaskError || '任务已完成，若报告未显示请再点查询进度',
											icon: 'none'
										});
									} else {
										uni.showToast({
											title: '该版本已提交过，已关联任务，可点「查询进度」',
											icon: 'none'
										});
									}
								} else {
									this.agentTaskError =
										errMsg + '（按论文查询任务未返回 task_id，请联系后端确认）';
									uni.showToast({ title: this.agentTaskError, icon: 'none' });
								}
							} catch (e2) {
								const msg2 = e2?.message || String(e2) || '';
								this.agentTaskError = msg2 ? `${errMsg}；查询已有任务失败：${msg2}` : errMsg;
								uni.showToast({ title: this.agentTaskError, icon: 'none' });
							}
						} else {
							this.agentTaskError = errMsg;
							uni.showToast({ title: this.agentTaskError, icon: 'none' });
						}
					} finally {
						this.agentAuditSubmitting = false;
					}
					return;
				}
				this.agentTaskError = '';
				try {
					const raw = await getAgentTask(this.agentAuditTaskId);
					const t = this.unwrapAgentApiPayload(raw);
					this.agentTaskStatus = t?.status || '';
					this.agentTaskProgress = t?.progress != null ? Number(t.progress) : null;
					this.agentTaskStage = t?.current_stage || '';
					const errMsg = t?.error_message ?? t?.errorMessage;
					if (errMsg) {
						this.agentTaskError = String(errMsg);
					}
					if (this.isAgentTaskTerminalFailed(this.agentTaskStatus)) {
						this.agentTaskError = this.agentTaskError || '智能体分析失败';
						return;
					}
					if (this.isAgentTaskTerminalDone(this.agentTaskStatus)) {
						await this.fetchAgentReportNow();
					} else {
						uni.showToast({
							title: '分析进行中，可稍后再次点击「查询进度」',
							icon: 'none'
						});
					}
				} catch (e) {
					this.agentTaskError = e?.message || String(e) || '查询任务失败';
					uni.showToast({ title: this.agentTaskError, icon: 'none' });
				}
			},
			async fetchAgentReportNow() {
				if (!this.agentAuditTaskId) return;
				this.agentReportLoading = true;
				this.agentTaskError = '';
				try {
					const raw = await getAgentReport(this.agentAuditTaskId);
					const rep = this.unwrapAgentApiPayload(raw);
					this.agentReportPayload = rep && typeof rep === 'object' ? rep : null;
					if (!this.agentReportPayload) {
						throw new Error('报告数据为空');
					}
					this.syncAgentReportToLegacySummary(this.agentReportPayload);
					// 报告数据就绪后重建预缓存（文档渲染时可能报告尚未加载，需在此补建）
					this.$nextTick(() => {
						this.buildAgentSectionIndexCache();
					});
				} catch (e) {
					this.agentTaskError = e?.message || String(e) || '获取报告失败';
					uni.showToast({ title: this.agentTaskError, icon: 'none' });
				} finally {
					this.agentReportLoading = false;
				}
			},
			agentChunkIssueCount(chunk) {
				if (!chunk) return 0;
				if (chunk.issue_count != null) return Number(chunk.issue_count);
				const arr = chunk.issues || chunk.llm_issues || chunk.local_issues || [];
				return Array.isArray(arr) ? arr.length : 0;
			},
			agentChunkIssuesPreview(chunk) {
				if (!chunk) return [];
				const a = chunk.issues || chunk.llm_issues;
				if (Array.isArray(a) && a.length > 0) return a;
				const b = chunk.local_issues;
				return Array.isArray(b) ? b : [];
			},
			/**
			 * 《JSON返回数据类型说明》§3.2：parse_result.data.sections[].id 与 chunk_reviews[].section_id 对应；
			 * 该元素含权威 xml_path、coordinates、raw_text。
			 */
			getAgentSectionMetaForLocate(sectionId) {
				if (sectionId == null || sectionId === '') return null;
				const sid = Number(sectionId);
				if (!Number.isFinite(sid) || sid < 1) return null;
				const p = this.agentReportPayload;
				if (!p || typeof p !== 'object') return null;
				let pr = p.parse_result;
				if (!pr && p.data && typeof p.data === 'object') pr = p.data.parse_result;
				if (!pr || typeof pr !== 'object') return null;
				let sections = null;
				if (pr.data && Array.isArray(pr.data.sections)) sections = pr.data.sections;
				else if (Array.isArray(pr.sections)) sections = pr.sections;
				if (!Array.isArray(sections) || sections.length === 0) return null;
				let sec = sections.find((s) => s && Number(s.id) === sid);
				if (!sec && sections[sid - 1] != null) {
					const cand = sections[sid - 1];
					if (cand && (cand.id == null || Number(cand.id) === sid)) sec = cand;
				}
				return sec && typeof sec === 'object' ? sec : null;
			},
			resolveAgentSectionIdForLookup(issue, chunk) {
				return (
					chunk?.section_id ??
					chunk?.sectionId ??
					issue?.section_id ??
					issue?.sectionId ??
					null
				);
			},
			/** 合并 issue / 段(chunk) / 段内 paragraph 上的坐标，供定位 */
			resolveAgentIssueCoordinates(issue, chunk) {
				const pickCoords = (o) => {
					if (!o || typeof o !== 'object') return null;
					if (o.coordinates && typeof o.coordinates === 'object') return o.coordinates;
					if (o.y != null || o.page != null) return o;
					return null;
				};
				const sid = this.resolveAgentSectionIdForLookup(issue, chunk);
				const parseSec = sid != null ? this.getAgentSectionMetaForLocate(sid) : null;
				const fromParse = pickCoords(parseSec);
				if (fromParse && (fromParse.y != null || fromParse.page != null)) return fromParse;
				const fromIssuePos = pickCoords(issue && issue.position);
				if (fromIssuePos && (fromIssuePos.y != null || fromIssuePos.page != null)) return fromIssuePos;
				const fromIssue = pickCoords(issue);
				if (fromIssue && (fromIssue.y != null || fromIssue.page != null)) return fromIssue;
				const fromChunkPos = pickCoords(chunk && chunk.position);
				if (fromChunkPos && (fromChunkPos.y != null || fromChunkPos.page != null)) return fromChunkPos;
				const fromChunk = pickCoords(chunk);
				if (fromChunk && (fromChunk.y != null || fromChunk.page != null)) return fromChunk;
				const para = chunk && chunk.paragraph;
				const fromPara = pickCoords(para);
				if (fromPara && (fromPara.y != null || fromPara.page != null)) return fromPara;
				const elem = chunk && chunk.element;
				const fromElem = pickCoords(elem);
				if (fromElem && (fromElem.y != null || fromElem.page != null)) return fromElem;
				return null;
			},
			/**
			 * 从 xml_path 取正文段落序号（1-based），与《前端定位段落位置说明》一致：/w:body/w:p[n]
			 */
			getWordParagraphNumberFromXmlPath(xmlPath) {
				if (!xmlPath || typeof xmlPath !== 'string') return null;
				const s = xmlPath.trim();
				let m = s.match(/\/w:p\[(\d+)\]\s*$/i);
				if (!m) m = s.match(/\/w:p\[(\d+)\]/i);
				if (!m) m = s.match(/w:p\s*\[\s*(\d+)\s*\]/i);
				if (!m) {
					const all = s.match(/w:p\[(\d+)\]/gi);
					if (all && all.length) {
						const last = all[all.length - 1].match(/(\d+)/);
						if (last) m = last;
					}
				}
				if (!m) return null;
				const n = parseInt(m[1], 10);
				return Number.isFinite(n) && n >= 1 ? n : null;
			},
			/** 0-based 段落下标，供兼容旧逻辑 */
			parseWordXmlParagraphIndex(xmlPath) {
				const n = this.getWordParagraphNumberFromXmlPath(xmlPath);
				return n != null ? n - 1 : null;
			},
			resolveAgentXmlPathString(issue, chunk) {
				const posIssue = issue && issue.position;
				const posChunk = chunk && chunk.position;
				const sid = this.resolveAgentSectionIdForLookup(issue, chunk);
				const parseSec = sid != null ? this.getAgentSectionMetaForLocate(sid) : null;
				const paths = [
					issue && issue.xml_path,
					issue && issue.xmlPath,
					posIssue && typeof posIssue === 'object' && (posIssue.xml_path || posIssue.xmlPath),
					posIssue && typeof posIssue === 'string' && posIssue.trim(),
					chunk && chunk.xml_path,
					chunk && chunk.xmlPath,
					posChunk && typeof posChunk === 'object' && (posChunk.xml_path || posChunk.xmlPath),
					posChunk && typeof posChunk === 'string' && posChunk.trim(),
					chunk && chunk.paragraph && chunk.paragraph.xml_path,
					chunk && chunk.paragraph && chunk.paragraph.xmlPath,
					chunk && chunk.element && (chunk.element.xml_path || chunk.element.xmlPath),
					parseSec && parseSec.xml_path,
					parseSec && parseSec.xmlPath
				];
				for (let i = 0; i < paths.length; i++) {
					const p = paths[i];
					if (p && typeof p === 'string' && p.trim()) return p.trim();
				}
				return '';
			},
			/**
			 * 无 xml_path 时：部分接口用 section_id 表示「第几段」，与列表「段 n」一致，可映射到第 n 个正文 p
			 */
			resolveAgentSectionIdAsParagraphIndex1Based(issue, chunk) {
				const sid =
					chunk?.section_id ??
					chunk?.sectionId ??
					issue?.section_id ??
					issue?.sectionId ??
					(chunk?.position && typeof chunk.position === 'object' && chunk.position.section_id);
				if (sid == null || sid === '') return null;
				const n = Number(sid);
				return Number.isFinite(n) && n >= 1 ? n : null;
			},
			resolveAgentXmlParagraphIndex(issue, chunk) {
				return this.parseWordXmlParagraphIndex(this.resolveAgentXmlPathString(issue, chunk));
			},
			getAgentChunkHeadLabel(chunk, cIdx) {
				const sid = chunk?.section_id ?? chunk?.sectionId ?? cIdx + 1;
				const meta = this.getAgentSectionMetaForLocate(sid);
				const xmlN = this.getWordParagraphNumberFromXmlPath(
					(chunk && (chunk.xml_path || chunk.xmlPath)) ||
						(meta && (meta.xml_path || meta.xmlPath))
				);
				if (xmlN != null) return `第 ${xmlN} 段`;
				return `段 ${sid}`;
			},
			agentChunkHeadCanLocate(chunk) {
				return this.agentIssueCanLocate(null, chunk);
			},
			resolveAgentLocateSnippet(issue, chunk) {
				const sid = this.resolveAgentSectionIdForLookup(issue, chunk);
				const meta = sid != null ? this.getAgentSectionMetaForLocate(sid) : null;
				const pos = issue && issue.position;
				if (
					meta &&
					typeof meta.raw_text === 'string' &&
					pos &&
					typeof pos === 'object' &&
					typeof pos.start_char === 'number' &&
					typeof pos.end_char === 'number' &&
					pos.end_char > pos.start_char
				) {
					const slice = meta.raw_text.slice(
						Math.max(0, pos.start_char),
						Math.min(meta.raw_text.length, pos.end_char, pos.start_char + 120)
					);
					const t = slice.replace(/\s+/g, ' ').trim();
					if (t.length >= 3) return t.slice(0, Math.min(80, t.length));
				}
				const posSnip =
					issue &&
					issue.position &&
					typeof issue.position === 'object' &&
					(issue.position.snippet || issue.position.text);
				const raw =
					(issue && (issue.original || issue.raw_text || issue.rawText)) ||
					posSnip ||
					(meta && typeof meta.raw_text === 'string' && meta.raw_text.trim() && meta.raw_text) ||
					(chunk && (chunk.text || chunk.raw_text || chunk.rawText)) ||
					(chunk && chunk.paragraph && (chunk.paragraph.raw_text || chunk.paragraph.rawText)) ||
					(chunk && chunk.element && (chunk.element.raw_text || chunk.element.rawText));
				if (raw == null || typeof raw !== 'string') return '';
				return raw.replace(/\s+/g, ' ').trim();
			},
			agentIssueCanLocate(issue, chunk) {
				const c = this.resolveAgentIssueCoordinates(issue, chunk);
				if (c && (c.page != null || c.y != null)) return true;
				if (this.resolveAgentXmlParagraphIndex(issue, chunk) != null) return true;
				const sid = this.resolveAgentSectionIdForLookup(issue, chunk);
				const meta = sid != null ? this.getAgentSectionMetaForLocate(sid) : null;
				if (meta && (meta.xml_path || meta.xmlPath || meta.raw_text)) return true;
				if (this.resolveAgentSectionIdAsParagraphIndex1Based(issue, chunk) != null) return true;
				return this.resolveAgentLocateSnippet(issue, chunk).length >= 4;
			},
			// 将问题类型英文转中文
			formatAgentIssueType(type) {
				const map = {
					'format': '格式问题',
					'typo': '拼写/错别字',
					'logic': '逻辑问题',
					'reference': '参考文献',
					'structure': '结构问题',
					'language': '语言表达',
					'content': '内容问题',
					'data': '数据问题',
					'figure': '图表问题',
					'table': '表格问题',
					'math': '公式问题',
					'citation': '引用格式',
					'plagiarism': '重复内容',
					'completeness': '内容完整性',
					'other': '其他问题'
				};
				const key = (type || '').toLowerCase();
				return map[key] || type || '问题';
			},
			/** 调试：默认输出；关闭请执行 localStorage.setItem('agent_locate_debug','0') */
			agentLocateDebugEnabled() {
				try {
					return typeof localStorage === 'undefined' || localStorage.getItem('agent_locate_debug') !== '0';
				} catch (e) {
					return true;
				}
			},
			agentLocateLog(...args) {
				if (!this.agentLocateDebugEnabled()) return;
				console.info('[AI定位]', ...args);
			},
			/**
			 * 从 docx 容器向上找真正出现纵向滚动条的那一层（uni-app H5 下 querySelector 到的节点未必是可滚动的真实 DOM）
			 */
			resolveAgentScrollContainerFromDocx(docxContainer) {
				if (typeof document === 'undefined' || !docxContainer) return null;
				let el = docxContainer;
				for (let hop = 0; el && hop < 28; hop++) {
					if (el.classList && el.classList.contains('review-modal-content')) break;
					const cs = window.getComputedStyle(el);
					const oy = cs.overflowY;
					const ov = cs.overflow;
					const canY = oy === 'auto' || oy === 'scroll' || ov === 'auto' || ov === 'scroll';
					const tall = el.scrollHeight > el.clientHeight + 1;
					if (this.agentLocateDebugEnabled() && hop < 8) {
						this.agentLocateLog(
							`向上探测[${hop}]`,
							el.tagName,
							(el.className && String(el.className).slice(0, 80)) || '',
							`overflowY=${oy}`,
							`scrollH=${el.scrollHeight}`,
							`clientH=${el.clientHeight}`,
							`可滚=${canY && tall}`
						);
					}
					if (canY && tall) {
						return el;
					}
					el = el.parentElement;
				}
				return null;
			},
			/** 审阅弹窗：优先 $refs 预览区，再向上解析滚动父级，避免 scrollTop 写到无效节点 */
			getDocxPreviewScrollContext() {
				if (typeof document === 'undefined') {
					this.agentLocateLog('getDocxPreviewScrollContext: document 不存在');
					return null;
				}
				const docxContainer = document.getElementById('docx-preview-container');
				if (!docxContainer) {
					this.agentLocateLog('getDocxPreviewScrollContext: 未找到 #docx-preview-container');
					return null;
				}
				let previewArea = null;
				let refSource = '';
				const refInst = this.$refs.teacherReviewPaperPreviewArea;
				if (refInst) {
					const raw =
						refInst.$el ||
						refInst.$?.el ||
						(refInst.__vnode && refInst.__vnode.el) ||
						refInst;
					if (raw && raw.nodeType === 1) {
						previewArea = raw;
						refSource = 'ref.$el';
					} else {
						this.agentLocateLog('ref teacherReviewPaperPreviewArea 已存在但取不到 HTMLElement', {
							rawType: typeof raw,
							nodeType: raw && raw.nodeType
						});
					}
				} else {
					this.agentLocateLog('ref teacherReviewPaperPreviewArea 为空（若刚打开弹窗，可能需在 nextTick 后点击）');
				}
				if (!previewArea) {
					previewArea = this.resolveAgentScrollContainerFromDocx(docxContainer);
					if (previewArea) refSource = refSource || 'walkFromDocx';
				}
				if (!previewArea) {
					previewArea =
						document.querySelector('.review-modal-content .paper-preview-area') ||
						document.querySelector('.paper-preview-area');
					if (previewArea) refSource = refSource || 'querySelector';
				}
				if (!previewArea || previewArea.nodeType !== 1) {
					this.agentLocateLog('最终未得到滚动容器 previewArea');
					return null;
				}
				let wrapper = docxContainer.querySelector('.docx-preview-wrapper-wrapper');
				if (!wrapper && docxContainer.firstElementChild) {
					wrapper = docxContainer.firstElementChild;
				}
				const bodyPs = wrapper ? this.collectDocxBodyParagraphEls(wrapper) : [];
				this.agentLocateLog('滚动容器已解析', {
					来源: refSource || 'unknown',
					scrollTag: previewArea.tagName,
					scrollClass: (previewArea.className && String(previewArea.className).slice(0, 100)) || '',
					scrollTop: previewArea.scrollTop,
					scrollHeight: previewArea.scrollHeight,
					clientHeight: previewArea.clientHeight,
					可纵向滚动: previewArea.scrollHeight > previewArea.clientHeight + 1,
					wrapper存在: !!wrapper,
					正文p数量: bodyPs.length
				});
				return { previewArea, docxContainer, wrapper };
			},
			/** 在 docx 容器内按正文片段找块级元素（由长到短多试几次，避免换行/空格与 DOM 不一致） */
			findDocxBlockByTextSnippet(root, snippet) {
				const needle = String(snippet).replace(/\s+/g, ' ').trim();
				if (needle.length < 3) return null;
				const maxTry = Math.min(72, needle.length);
				const lengths = [];
				for (let L = maxTry; L >= 8; L = Math.floor(L * 0.65)) {
					if (L < 8) break;
					lengths.push(Math.max(8, Math.min(L, needle.length)));
					if (lengths.length > 6) break;
				}
				if (!lengths.includes(Math.min(needle.length, maxTry))) lengths.unshift(Math.min(needle.length, maxTry));
				const uniq = [...new Set(lengths)].sort((a, b) => b - a);
				for (let li = 0; li < uniq.length; li++) {
					const short = needle.slice(0, uniq[li]);
					if (short.length < 3) continue;
					const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
					let node = walker.nextNode();
					while (node) {
						const t = (node.textContent || '').replace(/\s+/g, ' ');
						if (t.indexOf(short) !== -1) {
							let el = node.parentElement;
							for (let i = 0; el && i < 12; i++) {
								if (/^(P|H[1-6]|LI|TD|DIV)$/i.test(el.tagName) && root.contains(el)) {
									return el;
								}
								el = el.parentElement;
							}
							return node.parentElement;
						}
						node = walker.nextNode();
					}
				}
				return null;
			},
			scrollPreviewToRect(scrollContainer, targetEl, extraYOffset) {
				if (!scrollContainer || !targetEl || scrollContainer.nodeType !== 1) {
					this.agentLocateLog('scrollPreviewToRect 参数无效', {
						scrollContainer: !!scrollContainer,
						targetEl: !!targetEl,
						nodeType: scrollContainer && scrollContainer.nodeType
					});
					return;
				}
				const dy = Number(extraYOffset);
				const yOff = Number.isFinite(dy) ? dy : 0;
				
				const areaRect = scrollContainer.getBoundingClientRect();
				const elRect = targetEl.getBoundingClientRect();
				const delta = elRect.top - areaRect.top;
				const nextTop = Math.max(0, scrollContainer.scrollTop + delta + yOff - 96);
				const beforeTop = scrollContainer.scrollTop;
				const distance = Math.abs(nextTop - beforeTop);
				
				this.agentLocateLog('scrollPreviewToRect', {
					目标标签: targetEl.tagName,
					delta视口差: Math.round(delta),
					yOff,
					计算nextTop: Math.round(nextTop),
					scrollTop变更前: Math.round(beforeTop),
					distance: Math.round(distance)
				});
				
				// 距离超过一屏高度（远距离跳转）：先 instant 跳到附近，再 smooth 微调，避免 long-scroll 动画距离过长
				const clientH = scrollContainer.clientHeight;
				if (distance > clientH * 1.5) {
					// 先跳到目标上方1屏高度处
					const preJump = Math.max(0, nextTop - clientH * 0.8);
					try {
						scrollContainer.scrollTo({ top: preJump, behavior: 'instant' });
					} catch (e) {
						scrollContainer.scrollTop = preJump;
					}
					// 小延迟后 smooth 滑入最终位置
					const schedule = typeof globalThis !== 'undefined' ? globalThis.setTimeout : setTimeout;
					schedule(() => {
						try {
							scrollContainer.scrollTo({ top: nextTop, behavior: 'smooth' });
						} catch (e) {
							scrollContainer.scrollTop = nextTop;
						}
					}, 30);
				} else {
					// 近距离直接 smooth
					try {
						scrollContainer.scrollTo({ top: nextTop, behavior: 'smooth' });
					} catch (e) {
						scrollContainer.scrollTop = nextTop;
					}
				}
			},
			/** page + y：相对预览区视口换算 scrollTop（不用 offsetTop 累加） */
			scrollPreviewToAgentCoordinates(coords, ctx) {
				const previewArea = ctx.previewArea;
				if (!previewArea || previewArea.nodeType !== 1) {
					this.agentLocateLog('scrollPreviewToAgentCoordinates: 无 previewArea');
					return false;
				}
				const wrapper = ctx.wrapper;
				if (!wrapper) {
					this.agentLocateLog('scrollPreviewToAgentCoordinates: 无 wrapper');
					return false;
				}
				let pages = Array.from(wrapper.children).filter((el) => el && el.nodeType === 1);
				if (pages.length === 0) {
					const sec = wrapper.querySelector('section');
					pages = sec ? [sec] : [wrapper];
				}
				const pageNum = Math.max(1, Number(coords.page) || 1);
				const targetPage = pages[pageNum - 1] || pages[0];
				if (!targetPage) {
					this.agentLocateLog('scrollPreviewToAgentCoordinates: 无 targetPage', {
						pageNum,
						wrapper子节点数: pages.length
					});
					return false;
				}
				let yOffset = Number(coords.y);
				if (!Number.isFinite(yOffset)) yOffset = 0;
				this.agentLocateLog('scrollPreviewToAgentCoordinates', { pageNum, yOffset, 分页数: pages.length });
				this.scrollPreviewToRect(previewArea, targetPage, yOffset);
				return true;
			},
			/** 与打标顺序一致：正文 p，排除页眉页脚（对齐 w:body 段落序列） */
			collectDocxBodyParagraphEls(wrapper) {
				if (!wrapper || !wrapper.querySelectorAll) return [];
				const out = [];
				wrapper.querySelectorAll('p').forEach((p) => {
					if (p.closest('header') || p.closest('footer')) return;
					out.push(p);
				});
				return out;
			},
			/** docx 渲染后给每个正文 p 打上 data-agent-body-p-index（1-based），便于用 xml_path 命中 */
			refreshAgentDocxParagraphIndexStamps() {
				if (typeof document === 'undefined') return;
				const container = document.getElementById('docx-preview-container');
				if (!container) {
					this.agentLocateLog('stamp: 无 docx-preview-container');
					return;
				}
				const wrapper = container.querySelector('.docx-preview-wrapper-wrapper');
				if (!wrapper) {
					this.agentLocateLog('stamp: 无 .docx-preview-wrapper-wrapper');
					return;
				}
				wrapper.querySelectorAll('[data-agent-body-p-index]').forEach((el) => {
					el.removeAttribute('data-agent-body-p-index');
				});
				const list = this.collectDocxBodyParagraphEls(wrapper);
				list.forEach((p, i) => {
					p.setAttribute('data-agent-body-p-index', String(i + 1));
				});
				this.agentLocateLog('已打段落序号 data-agent-body-p-index，共', list.length, '个 <p>');
			},
			/**
			 * 预缓存：文档渲染完成后，一次性遍历所有 sections，
			 * 按文档顺序建立 section_id → bodyPs index 映射表。
			 * 后续点击定位时优先查表，O(1) 命中，无需实时文本匹配。
			 */
			buildAgentSectionIndexCache() {
				this._agentSectionIndexMap = null;
				this._agentLastMatchedPIndex = -1;
				this._agentLastMatchedSectionId = null;

				const container = document.getElementById('docx-preview-container');
				if (!container) return;
				const wrapper = container.querySelector('.docx-preview-wrapper-wrapper');
				if (!wrapper) return;

				// 获取 parse_sections 中所有 section 的 raw_text
				const p = this.agentReportPayload;
				if (!p || typeof p !== 'object') {
					this.agentLocateLog('[缓存] agentReportPayload 未就绪，跳过预缓存');
					return;
				}
				let pr = p.parse_result;
				if (!pr && p.data) pr = p.data.parse_result;
				let sections = null;
				if (pr && pr.data && Array.isArray(pr.data.sections)) sections = pr.data.sections;
				else if (pr && Array.isArray(pr.sections)) sections = pr.sections;
				if (!Array.isArray(sections) || sections.length === 0) {
					this.agentLocateLog('[缓存] 无 parse_sections，跳过预缓存');
					return;
				}

				const bodyPs = this.collectDocxBodyParagraphEls(wrapper);
				if (bodyPs.length === 0) {
					this.agentLocateLog('[缓存] bodyPs 为空，跳过预缓存');
					return;
				}

				const map = {};
				let cursor = 0; // 顺序游标，保证后面的 section 不会匹配到前面的段落

				for (const sec of sections) {
					if (!sec || sec.id == null) continue;
					const sid = Number(sec.id);
					if (!Number.isFinite(sid) || sid < 1) continue;
					const rawText = sec.raw_text;
					if (!rawText || !rawText.trim()) continue;
				
					// 表格类型特殊处理：用 table_rows 第一行作为匹配锚点
					if (sec.element_type === 'Table' && Array.isArray(sec.table_rows) && sec.table_rows.length > 0) {
						const firstRowText = sec.table_rows[0].join('\t');
						const result = this.findDomTargetByRawTextMatch(firstRowText, bodyPs, cursor, { isTable: true, tableRows: sec.table_rows });
						if (result) {
							map[sid] = result.index;
							cursor = result.index + 1;
							this.agentLocateLog('[缓存] Table段落 sid=', sid, '→ 首行匹配 bodyPs[', result.index, ']');
							continue;
						}
					}
									
					// has_math 段落走文本匹配（matchType=math 宽松匹配处理 MathML 差异）
					const result = this.findDomTargetByRawTextMatch(rawText, bodyPs, cursor);
					if (result) {
						map[sid] = result.index;
						cursor = result.index + 1; // 顺序前进，下一个 section 从这里往后找
					}
				}

				const hitCount = Object.keys(map).length;
				this._agentSectionIndexMap = hitCount > 0 ? map : null;
				this.agentLocateLog('[缓存] 预缓存完成：' + hitCount + '/' + sections.length + ' 个段落命中');
			},

			/**
			 * 基于 raw_text 的精确段落匹配
			 * 从上到下依次匹配，建立准确的段落映射关系
			 */
			findDomTargetByRawTextMatch(targetRawText, bodyPs, startIndex = 0, options = {}) {
				if (!targetRawText || !Array.isArray(bodyPs) || bodyPs.length === 0) return null;
				const { isTable, tableRows } = options;
				
				// 标准 normalize：合并空白
				const normalizeText = (text) => {
					return text.replace(/\s+/g, ' ').trim();
				};
				// 严格 normalize：去除所有空白，用于跨空格的模糊比较
				const normalizeStrict = (text) => {
					return text.replace(/\s/g, '').trim();
				};
				
				const targetNormalized = normalizeText(targetRawText);
				const targetStrict    = normalizeStrict(targetRawText);
				if (!targetNormalized) return null;

				// 取 raw_text 前 20 个字符作为"锚定前缀"，用于前缀匹配
				const prefixLen = Math.min(20, Math.floor(targetNormalized.length * 0.4));
				const targetPrefix = targetNormalized.slice(0, prefixLen);
				const targetPrefixStrict = normalizeStrict(targetPrefix);
				
				// 从 startIndex 开始搜索，避免重复匹配已确认的段落
				for (let i = startIndex; i < bodyPs.length; i++) {
					const p = bodyPs[i];
					if (!p) continue;
					
					// 获取段落的文本内容
					const pText = p.textContent || p.innerText || '';
					const pNormalized = normalizeText(pText);
					const pStrict     = normalizeStrict(pText);
					
					if (!pNormalized) continue;
					
					// 表格类型：首行匹配即可，后续行在附近范围内找到即可（不要求连续）
					if (isTable && tableRows && tableRows.length > 0) {
						// 检查首行是否匹配（支持部分匹配）
						const firstRowMatch = pNormalized === targetNormalized || pStrict === targetStrict || 
						    pNormalized.includes(targetNormalized) || pStrict.includes(targetStrict) ||
						    targetNormalized.includes(pNormalized) || targetStrict.includes(pStrict);
										
						if (firstRowMatch) {
							// 首行匹配成功，在附近范围内检查其他行是否存在
							let matchedRows = 1;
							const searchRange = 10; // 在前后10个段落范围内搜索
							const startIdx = Math.max(0, i - searchRange);
							const endIdx = Math.min(bodyPs.length, i + searchRange + tableRows.length);
																		
							for (let r = 1; r < tableRows.length; r++) {
								const rowText = tableRows[r].join('\t');
								const rowNorm = normalizeText(rowText);
								const rowStrict = normalizeStrict(rowText);
																				
								// 在范围内查找该行
								for (let j = startIdx; j < endIdx; j++) {
									if (j === i) continue; // 跳过首行
									const checkP = bodyPs[j];
									if (!checkP) continue;
									const checkText = checkP.textContent || '';
									const checkNorm = normalizeText(checkText);
									const checkStrict = normalizeStrict(checkText);
																					
									// 宽松匹配：包含或部分匹配
									if (checkNorm.includes(rowNorm) || rowNorm.includes(checkNorm) ||
									    checkStrict.includes(rowStrict) || rowStrict.includes(checkStrict)) {
										matchedRows++;
										break;
									}
								}
							}
																		
							// 只要匹配到一半以上的行就算成功（降低要求）
							if (matchedRows >= Math.ceil(tableRows.length * 0.5)) {
								this.agentLocateLog('matchType=table i=', i, 'matchedRows=', matchedRows, '/', tableRows.length);
								// 向上查找到 <table> 元素返回
								let tableEl = p;
								while (tableEl && tableEl.tagName !== 'TABLE') {
									tableEl = tableEl.parentElement;
									if (!tableEl || tableEl === document.body) break;
								}
								if (tableEl && tableEl.tagName === 'TABLE') {
									return { element: tableEl, index: i, matchType: 'table' };
								}
								return { element: p, index: i, matchType: 'table' };
							}
						}
					}
									
					// 完全匹配
					if (pNormalized === targetNormalized || pStrict === targetStrict) {
						this.agentLocateLog('matchType=exact i=', i, 'pText前30:', pNormalized.slice(0, 30));
						return { element: p, index: i, matchType: 'exact' };
					}
					
					// 包含匹配（段落文本包含 raw_text 全文）
					if (pNormalized.includes(targetNormalized) || pStrict.includes(targetStrict)) {
						this.agentLocateLog('matchType=contains i=', i, 'pText前30:', pNormalized.slice(0, 30));
						return { element: p, index: i, matchType: 'contains' };
					}
					
					// 前缀匹配（pText 包含 raw_text 的前缀）
					// 适用于：raw_text 因为换行/拆分比 pText 更长的情况
					if (prefixLen >= 8 && (pNormalized.includes(targetPrefix) || (targetPrefixStrict.length >= 8 && pStrict.includes(targetPrefixStrict)))) {
						this.agentLocateLog('matchType=prefix i=', i, 'prefix:', targetPrefix, 'pText前30:', pNormalized.slice(0, 30));
						return { element: p, index: i, matchType: 'prefix' };
					}
					
					// 相似匹配（raw_text 包含 pText）：要求 pText 占 raw_text 长度 >= 50%，防止短文本误触发
					const coverRatio = pNormalized.length / targetNormalized.length;
					if ((targetNormalized.includes(pNormalized) || targetStrict.includes(pStrict)) && pNormalized.length > 10 && coverRatio >= 0.5) {
						this.agentLocateLog('matchType=similar i=', i, 'ratio=', coverRatio.toFixed(2), 'pText前30:', pNormalized.slice(0, 30));
						return { element: p, index: i, matchType: 'similar' };
					}
								
					// 数学公式宽松匹配：去除所有非字母数字字符后比较（处理 MathML 渲染与 raw_text 差异）
					const normMath = (t) => t.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '');
					const targetMath = normMath(targetRawText);
					const pMath = normMath(pText);
					if (targetMath.length >= 4 && pMath.length >= 4) {
						// 策略A：顺序匹配（包含或相等）
						if (targetMath === pMath || pMath.includes(targetMath) || targetMath.includes(pMath)) {
							const mathRatio = Math.min(targetMath.length, pMath.length) / Math.max(targetMath.length, pMath.length);
							if (mathRatio >= 0.6) {
								this.agentLocateLog('matchType=math i=', i, 'mathRatio=', mathRatio.toFixed(2), 'targetMath:', targetMath.slice(0, 20), 'pMath:', pMath.slice(0, 20));
								return { element: p, index: i, matchType: 'math' };
							}
						}
						// 策略B：字符集合匹配（忽略顺序，处理分式等结构变化）
						// 将字符串转为字符排序后的形式，比较字符组成是否相似
						const sortedTarget = targetMath.split('').sort().join('');
						const sortedP = pMath.split('').sort().join('');
						if (sortedTarget === sortedP) {
							this.agentLocateLog('matchType=math-set i=', i, '字符集合完全匹配');
							return { element: p, index: i, matchType: 'math-set' };
						}
						// 字符集合包含率（处理分式分子分母顺序不同但字符相同的情况）
						const setOverlap = [...new Set(targetMath)].filter(c => pMath.includes(c)).length;
						const setRatio = setOverlap / Math.max([...new Set(targetMath)].length, [...new Set(pMath)].length);
						if (setRatio >= 0.85 && targetMath.length > 10) {
							this.agentLocateLog('matchType=math-set i=', i, 'setRatio=', setRatio.toFixed(2));
							return { element: p, index: i, matchType: 'math-set' };
						}
					}
				}
				
				return null;
			},
			
			findDomTargetForAgentLocate(issue, chunk, ctx) {
				const { docxContainer, wrapper } = ctx;
				const sid = this.resolveAgentSectionIdForLookup(issue, chunk);
				const parseSec = sid != null ? this.getAgentSectionMetaForLocate(sid) : null;
				
				// 优先使用 raw_text 进行精确匹配
				const targetRawText = parseSec && parseSec.raw_text;
				
				const xmlStr = this.resolveAgentXmlPathString(issue, chunk);
				let n = this.getWordParagraphNumberFromXmlPath(xmlStr);
				const nFromSection = this.resolveAgentSectionIdAsParagraphIndex1Based(issue, chunk);
				if (n == null && nFromSection != null) {
					n = nFromSection;
				}
				const bodyPs = wrapper ? this.collectDocxBodyParagraphEls(wrapper) : [];
				
				this.agentLocateLog('findDomTarget', {
					section_id: sid,
					parse_sections命中: !!parseSec,
					parse节id: parseSec && parseSec.id,
					raw_text前50字: targetRawText ? targetRawText.slice(0, 50) : '(无)',
					parse_xml_path: (parseSec && (parseSec.xml_path || parseSec.xmlPath)) || '(无)',
					合并后xml_path: xmlStr || '(无)',
					解析段落序号n_1based: n,
					section_id兜底p下标: nFromSection,
					正文p总数: bodyPs.length
				});
				
				// 策略0：优先查预缓存映射表（O(1)，最快最准）
				if (sid != null && this._agentSectionIndexMap && this._agentSectionIndexMap[sid] != null) {
					const cachedIdx = this._agentSectionIndexMap[sid];
					const cachedEl = bodyPs[cachedIdx];
					if (cachedEl) {
						this.agentLocateLog('[缓存命中] section_id=', sid, '→ bodyPs[', cachedIdx, ']');
						// 表格类型：向上查找到 <table> 元素返回
						if (parseSec && parseSec.element_type === 'Table') {
							let tableEl = cachedEl;
							while (tableEl && tableEl.tagName !== 'TABLE') {
								tableEl = tableEl.parentElement;
								if (!tableEl || tableEl === document.body) break;
							}
							if (tableEl && tableEl.tagName === 'TABLE') {
								this.agentLocateLog('[缓存命中] Table类型，返回<table>元素');
								return tableEl;
							}
						}
						return cachedEl;
					}
				}

				// 策略1：使用 raw_text 进行精确文本匹配（缓存未命中时兜底）
				if (targetRawText && bodyPs.length > 0) {
					// 判断用户是否在回退或重复点击（section_id <= 上次section_id）
					const lastSectionId = this._agentLastMatchedSectionId;
					const isBackward = (lastSectionId != null && sid != null && sid <= lastSectionId);
					
					// 如果是回退/重复点击，从0开始；否则从上次命中位置之后开始
					let startIdx = 0;
					if (!isBackward && this._agentLastMatchedPIndex != null && this._agentLastMatchedPIndex >= 0) {
						startIdx = this._agentLastMatchedPIndex + 1;
					}
					
					this.agentLocateLog('raw_text 搜索起点 bodyPs 下标:', startIdx, 
						'(上次命中:', this._agentLastMatchedPIndex, ', 上次section:', lastSectionId, ', 当前section:', sid, 
						isBackward ? ', 回退/重复点击从0开始' : ', 顺序搜索');
					
					// 表格类型需要传递额外参数
					const isTable = parseSec && parseSec.element_type === 'Table';
					const tableRows = isTable && parseSec.table_rows;
					const matchOptions = isTable ? { isTable: true, tableRows: tableRows } : {};
									
					let matchResult = this.findDomTargetByRawTextMatch(targetRawText, bodyPs, startIdx, matchOptions);
									
					// 顺序搜索未命中且不是从0开始时，全文兜底
					if (!matchResult && startIdx > 0) {
						this.agentLocateLog('顺序搜索未命中，全文兜底搜索');
						matchResult = this.findDomTargetByRawTextMatch(targetRawText, bodyPs, 0, matchOptions);
					}
					
					if (matchResult) {
						this.agentLocateLog('命中: raw_text 精确匹配', {
							matchType: matchResult.matchType,
							index: matchResult.index,
							raw_text前30字: targetRawText.slice(0, 30)
						});
						// 更新顺序匹配游标和section_id
						this._agentLastMatchedPIndex = matchResult.index;
						this._agentLastMatchedSectionId = sid;
						// 给匹配到的元素打上标记，便于后续定位
						matchResult.element.setAttribute('data-agent-matched-rawtext', String(sid));
						return matchResult.element;
					}
					this.agentLocateLog('raw_text 未匹配到，尝试其他策略');
				}
				
				// 策略2：使用 xml_path 段落序号
				if (n != null && n >= 1) {
					const stamped = docxContainer.querySelector(`[data-agent-body-p-index="${n}"]`);
					if (stamped) {
						this.agentLocateLog('命中: data-agent-body-p-index=', n);
						return stamped;
					}
					if (bodyPs[n - 1]) {
						this.agentLocateLog('命中: bodyPs 下标', n - 1, nFromSection != null ? '(来自 section_id)' : '');
						return bodyPs[n - 1];
					}
					this.agentLocateLog('未命中段落 n=', n, '（p 数量不足或序号与 Word 不一致）');
				}
				
				// 策略3：使用 xml_path 解析的索引
				const pIdx = this.resolveAgentXmlParagraphIndex(issue, chunk);
				if (pIdx != null && pIdx >= 0 && bodyPs[pIdx]) {
					this.agentLocateLog('命中: pIdx 0-based=', pIdx);
					return bodyPs[pIdx];
				}
				
				// 策略4：使用片段搜索（兜底）
				const snip = this.resolveAgentLocateSnippet(issue, chunk);
				if (snip) {
					const hit = this.findDocxBlockByTextSnippet(docxContainer, snip);
					if (hit) {
						this.agentLocateLog('命中: 原文片段前36字', snip.slice(0, 36));
						return hit;
					}
					this.agentLocateLog('原文片段未在 DOM 中找到', snip.slice(0, 48));
				} else {
					this.agentLocateLog('无 raw_text 片段可搜');
				}
				return null;
			},
			/**
			 * 在目标元素上方覆盖一层高亮遮罩（不修改原文任何样式）
			 * @param {Element} el 目标 DOM 元素
			 * @param {number} duration 高亮持续时间（ms），默认 3000
			 */
			showHighlightOverlay(el, duration = 3000) {
				if (!el || typeof el.getBoundingClientRect !== 'function') return;

				// 清理旧遮罩
				this._removeHighlightOverlay();

				const overlay = document.createElement('div');
				overlay.id = '__docx-highlight-overlay__';
				overlay.style.cssText = [
					'position: fixed',
					'pointer-events: none',
					'z-index: 99999',
					'border-radius: 3px',
					'background: rgba(255, 214, 0, 0.38)',
					'box-shadow: 0 0 0 2px rgba(255, 180, 0, 0.7)',
					'transition: opacity 0.4s ease',
					'opacity: 1',
				].join(';');
				document.body.appendChild(overlay);

				// 同步位置
				const syncPos = () => {
					if (!overlay.parentNode) return;
					const rect = el.getBoundingClientRect();
					overlay.style.top    = rect.top    + 'px';
					overlay.style.left   = rect.left   + 'px';
					overlay.style.width  = rect.width  + 'px';
					overlay.style.height = rect.height + 'px';
				};
				syncPos();

				// 用 rAF 在滚动期间持续跟随
				let rafId = null;
				let stopped = false;
				const track = () => {
					if (stopped) return;
					syncPos();
					rafId = requestAnimationFrame(track);
				};
				rafId = requestAnimationFrame(track);

				// 保存到实例，方便外部清理
				this._highlightOverlayEl    = overlay;
				this._highlightOverlayRafId = rafId;
				this._highlightOverlayStopped = () => { stopped = true; };

				// duration 后淡出并移除
				const fadeTimer = setTimeout(() => {
					if (overlay.parentNode) overlay.style.opacity = '0';
				}, duration - 400);
				const removeTimer = setTimeout(() => {
					this._removeHighlightOverlay();
				}, duration);

				this._highlightOverlayFadeTimer   = fadeTimer;
				this._highlightOverlayRemoveTimer = removeTimer;
			},

			/** 立即移除高亮遮罩 */
			_removeHighlightOverlay() {
				if (this._highlightOverlayStopped) { this._highlightOverlayStopped(); this._highlightOverlayStopped = null; }
				if (this._highlightOverlayRafId)   { cancelAnimationFrame(this._highlightOverlayRafId); this._highlightOverlayRafId = null; }
				if (this._highlightOverlayFadeTimer)   { clearTimeout(this._highlightOverlayFadeTimer);   this._highlightOverlayFadeTimer = null; }
				if (this._highlightOverlayRemoveTimer) { clearTimeout(this._highlightOverlayRemoveTimer); this._highlightOverlayRemoveTimer = null; }
				const old = document.getElementById('__docx-highlight-overlay__');
				if (old && old.parentNode) old.parentNode.removeChild(old);
				this._highlightOverlayEl = null;
			},

			flashAgentLocateTarget(el, options = {}) {
				if (!el || typeof el.classList === 'undefined') {
					this.agentLocateLog('flashAgentLocateTarget: 无效元素');
					return;
				}
				
				// 表格类型：向上查找到 <table> 元素，高亮整个表格
				if (options.isTable) {
					let tableEl = el;
					while (tableEl && tableEl.tagName !== 'TABLE') {
						tableEl = tableEl.parentElement;
						if (!tableEl || tableEl === document.body) break;
					}
					if (tableEl && tableEl.tagName === 'TABLE') {
						this.agentLocateLog('高亮表格 overlay 遮罩');
						this.showHighlightOverlay(tableEl, 3000);
						return;
					}
				}
				
				this.agentLocateLog('高亮段落 overlay 遮罩');
				this.showHighlightOverlay(el, 3000);
			},
			/** docx-preview 嵌在自定义滚动容器内时 scrollIntoView 常无效，统一用 scrollTop */
			scrollPreviewToAgentElement(scrollContainer, el) {
				if (!scrollContainer || !el) return;
				this.scrollPreviewToRect(scrollContainer, el, 0);
			},
			runAgentLocateInPreview(issue, chunk) {
				try {
					this.agentLocateLog('======== 开始定位 ========');
					const ctx = this.getDocxPreviewScrollContext();
					if (!ctx) {
						this.agentLocateLog('中止: getDocxPreviewScrollContext 返回 null');
						uni.showToast({ title: '文档未就绪', icon: 'none' });
						return;
					}
					this.refreshAgentDocxParagraphIndexStamps();
					// 1）优先 xml_path → 正文第 n 个 p（与后端 document.xml 段落序一致；docx-preview 用 <p> 渲染段落，序号与 Word 通常为近似对应）
					const el = this.findDomTargetForAgentLocate(issue, chunk, ctx);
					if (el) {
						this.agentLocateLog('走分支: 段落 DOM', el.tagName, el.className && String(el.className).slice(0, 60));
						this.flashAgentLocateTarget(el);
						this.scrollPreviewToAgentElement(ctx.previewArea, el);
						uni.showToast({ title: '已按段落定位', icon: 'none', duration: 1400 });
						return;
					}
					// 2）coordinates 用于页面近似位置（高亮/滚动）
					const coords = this.resolveAgentIssueCoordinates(issue, chunk);
					this.agentLocateLog('段落未找到，尝试 coordinates', coords || '(无)');
					if (coords && (coords.page != null || coords.y != null)) {
						const ok = this.scrollPreviewToAgentCoordinates(coords, ctx);
						if (ok) {
							this.agentLocateLog('走分支: 坐标滚动 成功');
							uni.showToast({ title: '已按坐标滚动到大致位置', icon: 'none', duration: 1400 });
							return;
						}
						this.agentLocateLog('坐标滚动返回 false（wrapper/分页异常）');
					}
					this.agentLocateLog('======== 定位失败：无可用段落/坐标/文本 ========');
					uni.showToast({
						title: '缺少 xml_path / 坐标 / 原文片段，无法定位',
						icon: 'none',
						duration: 2000
					});
				} catch (err) {
					console.error('[AI定位] 异常', err);
					uni.showToast({ title: '定位异常，请查看控制台', icon: 'none' });
				}
			},
			onAgentIssueLocateClick(issue, chunk) {
				const now = Date.now();
				if (!this._agentLocateDebounceAt) this._agentLocateDebounceAt = 0;
				if (now - this._agentLocateDebounceAt < 380) {
					this.agentLocateLog('忽略点击: 防抖间隔内');
					return;
				}
				this._agentLocateDebounceAt = now;
				this.agentLocateLog('点击问题项', {
					issue_type: issue && (issue.issue_type || issue.issueType),
					message前40字: issue && (issue.message || issue.msg || '').slice(0, 40)
				});

				this.$nextTick(() => {
					if (typeof requestAnimationFrame !== 'undefined') {
						requestAnimationFrame(() => requestAnimationFrame(() => this.runAgentLocateInPreview(issue, chunk)));
					} else {
						setTimeout(() => this.runAgentLocateInPreview(issue, chunk), 50);
					}
				});
			},
			onAgentChunkLocateClick(chunk) {
				if (!this.agentChunkHeadCanLocate(chunk)) {
					this.agentLocateLog('段标题点击忽略: agentChunkHeadCanLocate=false');
					return;
				}
				const now = Date.now();
				if (!this._agentLocateDebounceAt) this._agentLocateDebounceAt = 0;
				if (now - this._agentLocateDebounceAt < 380) {
					this.agentLocateLog('段标题点击忽略: 防抖');
					return;
				}
				this._agentLocateDebounceAt = now;
				this.agentLocateLog('点击段标题', {
					xml_path: chunk && (chunk.xml_path || chunk.xmlPath),
					section_id: chunk && (chunk.section_id ?? chunk.sectionId)
				});
				this.$nextTick(() => {
					if (typeof requestAnimationFrame !== 'undefined') {
						requestAnimationFrame(() => requestAnimationFrame(() => this.runAgentLocateInPreview(null, chunk)));
					} else {
						setTimeout(() => this.runAgentLocateInPreview(null, chunk), 50);
					}
				});
			},
			syncAgentReportToLegacySummary(rep) {
				const parts = [];
				const ic = rep.issues_count ?? rep.issuesCount;
				if (ic != null) parts.push(`问题总数：${ic}`);
				const parsed = rep.parse_result?.data ?? rep.parse_result ?? {};
				const secList = parsed.sections;
				if (Array.isArray(secList) && secList.length > 0) {
					parts.push(`解析段落：${secList.length} 段（可按 xml_path 定位）`);
				}
				const ar = rep.ai_review || rep.aiReview;
				if (ar && typeof ar === 'object') {
					const sum = ar.summary;
					if (typeof sum === 'string' && sum.trim()) parts.push(sum.trim());
					else if (sum && typeof sum === 'object') {
						const cc = sum.chunk_count;
						const cic = sum.chunk_issue_count;
						if (cic != null) parts.push(`分段问题数：${cic}`);
						if (cc != null) parts.push(`分段数：${cc}`);
					}
				}
				if (parts.length) this.aiSummary = parts.join('\n');
			},
			getStatusClass(status) {
				// 新状态体系映射：原状态 -> 新状态样式类（与CSS类名对应）
				const statusMap = {
					'待审阅': 'pending', // 待审阅（橙色）
					'已更新': 'pending', // 待审阅（橙色）
					'已审阅': 'pending_update', // 待修改（紫色）
					'待更新': 'pending_update', // 待修改（紫色）
					'已定稿': 'finalized' // 已定稿（绿色）
				};
				return statusMap[status] || '';
			},
			getStatusText(status) {
				// 新状态体系映射：原状态 -> 新状态显示文本
				const statusMap = {
					'待审阅': '待审阅',
					'已更新': '待审阅',
					'已审阅': '待修改',
					'待更新': '待修改',
					'已定稿': '已定稿'
				};
				return statusMap[status] || status || '未知';
			},
			getSeverityText(severity) {
				const severityMap = {
					'high': '高风险',
					'medium': '中风险',
					'low': '建议'
				};
				return severityMap[severity] || '';
			},
			async openPaperReview(student, paper) {
				this.currentStudent = student;
				// 创建一个新的响应式对象，避免直接修改原始数据
				const targetPaper = paper || student.paper || (student.papers && student.papers[0]);
				if (targetPaper) {
					const newPaper = { ...targetPaper };
					newPaper.annotations = [];
					newPaper.annotationCount = 0;
					this.currentPaper = newPaper;
					console.log('[openPaperReview] currentPaper 已设置:', this.resolvePaperId(this.currentPaper));
				} else {
					this.currentPaper = null;
				}
				this.showReview = true;
				this.resetAgentAuditState();
				this.paperLoading = true;
				this.docxBlob = null;
				this.documentWordCount = null; // 重置字数
				this.reviewToolbarWordCountText = '字数: 统计中...';
				this.docxCurrentPage = 1; // 重置页码
				
				// 等待 Vue 响应式系统更新完成
				await this.$nextTick();
				
				// 加载批注列表 - 使用 this.currentPaper 确保是同一个对象
				console.log('[openPaperReview] 开始加载批注列表，currentPaper:', this.resolvePaperId(this.currentPaper));
				await this.loadAnnotationList(student, this.currentPaper);
				
				// 如果是本地测试学生，加载真实论文内容
				if (student.isLocalTest && student.localFiles && student.localFiles.paper) {
					await this.loadLocalPaperContentForReview(student);
				} else if (this.currentPaper && this.currentPaper.ossKey && !student.isLocalTest) {
					// 接口返回的论文有 ossKey，从后端加载
					console.log('通过 ossKey 加载论文:', this.currentPaper.ossKey);
					await this.loadPaperFromBackend(student, this.currentPaper);
				} else if (this.currentPaper && !this.currentPaper.filePath && !student.isLocalTest) {
					// 接口返回的论文没有文件路径，显示提示
					console.warn('论文没有文件路径，无法加载内容:', student, this.currentPaper);
					uni.showToast({
						title: '论文内容暂不可用，请联系管理员',
						icon: 'none',
						duration: 2000
					});
				}
				
				this.paperLoading = false;
				// 论文 docx 加载会替换 currentStudent.paper，需与 currentPaper 对齐后再拉批注，避免引用脱节或首次请求过早
				this.currentPaper = this.currentStudent?.paper || this.currentPaper;
				await this.loadAnnotationList(this.currentStudent, this.currentPaper);
				// docx 合并后 currentPaper 可能与 student.paper 引用不一致，统一批注到当前展示用的 currentPaper
				this.syncCurrentPaperAnnotationsFromStudent();
				// 强制新数组引用，避免 v-for 使用 index 为 key 时在异步加载后复用错误 DOM
				if (this.currentPaper && Array.isArray(this.currentPaper.annotations)) {
					this.currentPaper.annotations = [...this.currentPaper.annotations];
				}
				await this.$nextTick();
				this.$nextTick(() => {
					this.applyReviewWordCountAfterOpen();
				});
			},
			
			resolvePaperId(targetPaper) {
				if (!targetPaper) return null;
				const id = targetPaper.paperId ?? targetPaper.paper_id ?? targetPaper.id;
				return id != null && id !== '' ? id : null;
			},
			/** 智能体接口：解析论文 ID（正整数），兼容 snake_case / 列表多论文 */
			resolveAgentPaperIdNum() {
				const tryPaper = (p) => {
					if (!p || typeof p !== 'object') return null;
					const raw = p.paperId ?? p.paper_id ?? p.id;
					if (raw == null || raw === '') return null;
					const n = Number(raw);
					return Number.isFinite(n) && n > 0 ? n : null;
				};
				let n = tryPaper(this.currentPaper);
				if (n != null) return n;
				n = tryPaper(this.currentStudent && this.currentStudent.paper);
				if (n != null) return n;
				const list = this.currentStudent && Array.isArray(this.currentStudent.papers) ? this.currentStudent.papers : [];
				const cur = this.currentPaper;
				const curKey = cur && (this.resolvePaperId(cur) ?? cur.title);
				for (const p of list) {
					if (curKey != null && curKey !== '') {
						const pk = this.resolvePaperId(p) ?? p.title;
						if (pk != null && String(pk) === String(curKey)) {
							const hit = tryPaper(p);
							if (hit != null) return hit;
						}
					} else {
						const hit = tryPaper(p);
						if (hit != null) return hit;
					}
				}
				return null;
			},
			/** 智能体接口：版本号优先后端 paper_version，其次 version（与列表接口一致） */
			resolveAgentPaperVersionRaw() {
				const pick = (p) => {
					if (!p || typeof p !== 'object') return '';
					const v = p.paper_version ?? p.version ?? p.paperVersion;
					if (v == null || v === '') return '';
					return String(v).trim();
				};
				let s = pick(this.currentPaper);
				if (s) return s;
				s = pick(this.currentStudent && this.currentStudent.paper);
				if (s) return s;
				const list = this.currentStudent && Array.isArray(this.currentStudent.papers) ? this.currentStudent.papers : [];
				const cur = this.currentPaper;
				const curKey = cur && (this.resolvePaperId(cur) ?? cur.title);
				for (const p of list) {
					if (curKey != null && curKey !== '') {
						const pk = this.resolvePaperId(p) ?? p.title;
						if (pk != null && String(pk) === String(curKey)) {
							const hit = pick(p);
							if (hit) return hit;
						}
					}
				}
				return '1';
			},
			/** 智能体接口：论文 ID（正整数），兼容接口原始字段 paper_id */
			resolveAgentPaperId(paper) {
				const p = paper || this.currentPaper || this.currentStudent?.paper;
				const raw = this.resolvePaperId(p);
				if (raw == null || raw === '') return null;
				const n = Number(raw);
				return Number.isFinite(n) && n > 0 ? n : null;
			},
			/** 智能体接口：版本号，优先接口返回的 paper_version，再 version */
			resolveAgentPaperVersion(paper) {
				const p = paper || this.currentPaper || this.currentStudent?.paper;
				if (!p) return '1';
				const raw = p.paper_version ?? p.version ?? p.paperVersion;
				if (raw == null || String(raw).trim() === '') return '1';
				return String(raw).trim();
			},
			/** 列表里「待审阅」多为合并展示，定稿接口需落在原先的「已更新」那条论文上 */
			resolveFinalizeTargetPaperForReview() {
				const st = this.currentStudent;
				const cp = this.currentPaper;
				if (!st || !cp) return null;
				const list =
					Array.isArray(st.papers) && st.papers.length > 0
						? st.papers
						: st.paper
							? [st.paper]
							: [];
				if (cp.status === '已更新') {
					return cp;
				}
				if (cp.status === '待审阅') {
					const updatedList = list.filter((p) => p && p.status === '已更新');
					if (updatedList.length === 0) return null;
					const curId = this.resolvePaperId(cp);
					if (curId != null) {
						const sameId = updatedList.find((p) => this.resolvePaperId(p) === curId);
						if (sameId) return sameId;
					}
					const t = (cp.title || '').trim();
					if (t) {
						const exact = updatedList.find((p) => (p.title || '').trim() === t);
						if (exact) return exact;
					}
					if (updatedList.length === 1) return updatedList[0];
					return [...updatedList].sort((a, b) => {
						const va = parseFloat(String(a.version ?? 0).replace(/^v/i, '')) || 0;
						const vb = parseFloat(String(b.version ?? 0).replace(/^v/i, '')) || 0;
						return vb - va;
					})[0];
				}
				return null;
			},
			
			normalizeAnnotationListResponse(res) {
				if (res == null) return [];
				if (Array.isArray(res)) return res;
				const d = res.data;
				if (Array.isArray(d)) return d;
				if (d && typeof d === 'object') {
					if (Array.isArray(d.items)) return d.items;
					if (Array.isArray(d.list)) return d.list;
					if (Array.isArray(d.annotations)) return d.annotations;
					if (Array.isArray(d.records)) return d.records;
					if (Array.isArray(d.results)) return d.results;
				}
				if (Array.isArray(res.items)) return res.items;
				if (Array.isArray(res.list)) return res.list;
				if (Array.isArray(res.annotations)) return res.annotations;
				return [];
			},
			
			applyAnnotationsToPapers(annotations, targetPaper) {
				const list = Array.isArray(annotations) ? [...annotations] : [];
				// 优先使用传入的 targetPaper，然后是 this._loadAnnotationTargetPaper，最后是 this.currentPaper
				const paper = targetPaper || this._loadAnnotationTargetPaper || this.currentPaper;
				console.log('[applyAnnotationsToPapers] targetPaper参数:', this.resolvePaperId(targetPaper), 'this._loadAnnotationTargetPaper:', this.resolvePaperId(this._loadAnnotationTargetPaper), 'this.currentPaper:', this.resolvePaperId(this.currentPaper), '最终paper:', this.resolvePaperId(paper), '批注数:', list.length);
				if (paper) {
					paper.annotations = list;
					paper.annotationCount = list.length;
					console.log('[applyAnnotationsToPapers] 已更新论文批注:', paper.annotations.length);
				} else {
					console.warn('[applyAnnotationsToPapers] 没有目标论文可更新');
				}
				// 同时更新 student.paper（如果存在且不同）
				const sp = this.currentStudent && this.currentStudent.paper;
				if (sp && sp !== paper) {
					sp.annotations = list;
					sp.annotationCount = list.length;
				}
				// 若写入对象不是当前弹窗展示的 currentPaper，再同步一份，避免侧边栏仍读空数组
				if (this.currentPaper && paper && this.currentPaper !== paper && this.resolvePaperId(this.currentPaper) === this.resolvePaperId(paper)) {
					this.currentPaper.annotations = [...list];
					this.currentPaper.annotationCount = list.length;
				}
			},
			/** 将 student.paper 上的批注同步到 this.currentPaper（同一篇论文时） */
			syncCurrentPaperAnnotationsFromStudent() {
				const cp = this.currentPaper;
				const sp = this.currentStudent && this.currentStudent.paper;
				if (!cp || !sp || cp === sp) return;
				if (this.resolvePaperId(cp) !== this.resolvePaperId(sp)) return;
				const ann = sp.annotations;
				if (!Array.isArray(ann) || ann.length === 0) return;
				cp.annotations = [...ann];
				cp.annotationCount = ann.length;
			},
			annotationRowKey(annotation, index) {
				if (!annotation) return 'ann-empty-' + index;
				if (annotation.isReviewComment) return 'review-' + (annotation.id || index);
				return 'ann-' + (annotation.id != null ? annotation.id : 'i' + index);
			},
			// 更新非审阅批注列表并保留顶部的「审阅意见」虚拟项顺序
			insertAnnotationsKeepReview(nonReviewAnnotations) {
				const list = Array.isArray(nonReviewAnnotations) ? [...nonReviewAnnotations] : [];
				const review = (this.currentPaper?.annotations || []).find((a) => a.isReviewComment);
				if (review) {
					list.unshift(review);
				}
				this.applyAnnotationsToPapers(list, this.currentPaper);
			},
			
			mergeStudentPaperWithDocxBlob(student, blob, preferPaper) {
				const prev = this.currentPaper;
				const seed = preferPaper || student.paper || (student.papers && student.papers[0]) || {};
				const base = { ...seed };
				if (prev && this.resolvePaperId(base) == null && this.resolvePaperId(prev) != null) {
					base.paperId = prev.paperId ?? prev.paper_id ?? prev.id;
					base.paper_id = prev.paper_id ?? prev.paperId ?? prev.id;
				}
				if (prev && !(base.version || base.paper_version) && (prev.version || prev.paper_version)) {
					base.version = prev.version ?? base.version;
					base.paper_version = prev.paper_version ?? base.paper_version;
				}
				const samePaper =
					prev &&
					base &&
					this.resolvePaperId(prev) != null &&
					this.resolvePaperId(prev) === this.resolvePaperId(base);
				// 同一篇论文时优先保留弹窗内 currentPaper 上刚拉取的批注；列表里 student.paper 可能带陈旧非空数组，原先仅在 base 为空时才拷贝会导致侧边栏一直空
				if (prev && Array.isArray(prev.annotations) && prev.annotations.length > 0) {
					const shouldCopy =
						samePaper || !base.annotations || base.annotations.length === 0;
					if (shouldCopy) {
						base.annotations = [...prev.annotations];
						base.annotationCount = prev.annotationCount ?? prev.annotations.length;
					}
				}
				base.docxBlob = blob;
				this.currentStudent = { ...student, paper: base };
				this.currentPaper = this.currentStudent.paper;
			},
			
			// 加载批注列表
			async loadAnnotationList(student, paper) {
				// 在方法开始处确定目标论文对象，并保存到 this 上供后续使用
				const targetStudent = this.currentStudent || student;
				const targetPaper = paper || this.currentPaper || targetStudent.paper || (targetStudent.papers && targetStudent.papers[0]);
				console.log('[loadAnnotationList] targetPaper:', targetPaper, 'this.currentPaper:', this.currentPaper);
				
				// 保存到 this 上，确保在异步操作后仍能访问
				this._loadAnnotationTargetPaper = targetPaper;
				
				try {
					const paperId = this.resolvePaperId(targetPaper);
					if (!paperId) {
						console.warn('无法获取论文ID，跳过加载批注列表');
						return;
					}
					
					// 注意：currentPaper 现在是独立对象，不需要在这里清空
					// 批注数据会在加载完成后直接赋值
					
					// 使用学生ID作为 owner_id（论文所属用户）
					const ownerId = targetStudent.id;
					console.log('加载批注列表 - paperId:', paperId, 'ownerId:', ownerId);
					
					const { getAnnotationList } = await import('@/api/teacher.js');
					const res = await getAnnotationList(paperId, ownerId);
					console.log('批注列表接口返回:', res);
					
					const responseData = this.normalizeAnnotationListResponse(res);
					const code = res && res.code;
					const codeNum = code != null ? Number(code) : NaN;
					const explicitError =
						codeNum === 401 ||
						codeNum === 403 ||
						codeNum === 404 ||
						codeNum === 422 ||
						(codeNum >= 400 && codeNum < 600);
					// 有数据则一定刷新；否则仅在非明确错误时采用接口结果（空数组也写入，避免一直显示旧数据）
					const listOk = responseData.length > 0 || !explicitError;
					
					if (listOk) {
						console.log('批注列表原始数据:', responseData);
						// 从 localStorage 加载本地保存的 selected_text
						let savedTexts = {};
						try {
							savedTexts = JSON.parse(localStorage.getItem('annotation_selected_texts') || '{}');
						} catch(e) {}
						// 更新学生的批注列表
						const annotations = responseData.map(item => {
							console.log('[批注列表] 处理 item:', { id: item.id, coordinates: item.coordinates, content: item.content?.substring(0, 20) });
							// 解析坐标为对象格式（支持字符串和对象两种格式）
							let coordinatesObj = null;
							console.log('解析批注坐标:', item.id, item.coordinates, typeof item.coordinates);
							if (item.coordinates) {
								if (typeof item.coordinates === 'string') {
									// 尝试匹配 (x,y) 格式，支持小数和整数
									const match = item.coordinates.match(/\(\s*(\d+\.?\d*)\s*,\s*(\d+\.?\d*)\s*\)/);
									console.log('坐标匹配结果:', match);
									if (match) {
										coordinatesObj = { x: parseFloat(match[1]), y: parseFloat(match[2]) };
										console.log('坐标解析成功:', coordinatesObj);
									} else {
										console.warn('坐标解析失败:', item.coordinates);
										// 尝试其他格式，比如没有括号的 "x,y"
										const simpleMatch = item.coordinates.match(/(\d+\.?\d*),(\d+\.?\d*)/);
										if (simpleMatch) {
											coordinatesObj = { x: parseFloat(simpleMatch[1]), y: parseFloat(simpleMatch[2]) };
											console.log('使用简单格式解析成功:', coordinatesObj);
										}
									}
								} else if (typeof item.coordinates === 'object' && item.coordinates.x !== undefined && item.coordinates.y !== undefined) {
									// 后端直接返回对象格式 {x, y}
									coordinatesObj = { x: parseFloat(item.coordinates.x), y: parseFloat(item.coordinates.y) };
									console.log('坐标为对象格式:', coordinatesObj);
								}
							} else {
								console.warn('批注没有坐标:', item.id);
							}
							
							// 解析合并的内容，分离出选中内容、批注和建议
							let selectedText = '';
							let content = item.content || '';
							let suggestion = '';
							
							if (item.content) {
								const lines = item.content.split('\n');
								lines.forEach(line => {
									if (line.startsWith('选中内容：')) {
										selectedText = line.replace('选中内容：', '');
									} else if (line.startsWith('批注：')) {
										content = line.replace('批注：', '');
									} else if (line.startsWith('建议：')) {
										suggestion = line.replace('建议：', '');
									} else {
										// 兼容旧数据，如果没有前缀，整段作为 content
										content = item.content;
									}
								});
							}
							
							const src = item.source || item.type || 'manual';
							const result = {
								id: item.id,
								content: content,
								// 优先使用 localStorage 保存的选中内容（后端不存储此字段）
								selectedText: savedTexts[String(item.id)] || selectedText || item.selected_text || '',
								suggestion: suggestion,
								fullContent: item.content, // 保存原始完整内容
								paragraph: item.paragraph_id || item.paragraph || 0,
								source: src,
								type: item.type || src,
								coordinates: item.coordinates || '(0,0)',
								coordinatesObj: coordinatesObj, // 解析后的坐标对象
								time: item.time || item.created_at || item.createTime || '',
								createTime: item.created_at || item.createTime || new Date().toISOString()
							};
							console.log('[批注列表] 映射结果:', { id: result.id, coordinates: result.coordinates, coordinatesObj: result.coordinatesObj });
							return result;
						});
						
						console.log('批注列表映射后:', annotations);
						this.applyAnnotationsToPapers(annotations, targetPaper);
						console.log('批注列表已写入:', annotations.length, '条');
						
						// 加载审阅意见（查询后端，更新 editingReviewComment 状态）
						try {
							const { getPaperReview: fetchReview } = await import('@/api/teacher.js');
							const reviewRes = await fetchReview(paperId);
							if (reviewRes && reviewRes.review_content !== undefined && reviewRes.review_content !== null) {
								const reviewAnnotation = {
									id: 'review_' + paperId,
									content: reviewRes.review_content || '',
									isReviewComment: true,
									source: 'manual',
									type: 'manual',
									time: reviewRes.created_at || '',
									createTime: reviewRes.created_at || new Date().toISOString()
								};
								const cur = (targetPaper && targetPaper.annotations) || [];
								const filtered = cur.filter((a) => !a.isReviewComment);
								filtered.unshift(reviewAnnotation);
								this.applyAnnotationsToPapers(filtered, targetPaper);
							}
						} catch (e) {
							console.warn('加载审阅意见失败:', e);
						}
					} else {
						console.warn('批注列表接口返回异常:', res);
						const existing =
							(targetPaper && targetPaper.annotations) ||
							(student.paper && student.paper.annotations) ||
							[];
						this.applyAnnotationsToPapers(existing, targetPaper);
					}
				} catch (err) {
					console.error('加载批注列表失败:', err);
					const existing =
						(targetPaper && targetPaper.annotations) ||
						(student.paper && student.paper.annotations) ||
						[];
					this.applyAnnotationsToPapers(existing, targetPaper);
				}
			},
			
			// 为审阅界面加载本地论文内容
			async loadLocalPaperContentForReview(student) {
				try {
					uni.showLoading({ title: '正在解析论文...' });
					
					// 获取 .docx 文件路径
					const docxPath = student.localFiles.paper;
					console.log('正在加载论文:', docxPath);
					
					// 使用 fetch 获取 .docx 文件
					const response = await fetch(`${docxPath}?t=${Date.now()}`);
					if (!response.ok) {
						throw new Error(`HTTP ${response.status}: ${response.statusText}`);
					}
					
					// 获取 ArrayBuffer
					const arrayBuffer = await response.arrayBuffer();
					
					// 使用 docx-preview 渲染 .docx 文件
					const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
					
					this.mergeStudentPaperWithDocxBlob(student, blob, this.currentPaper || student.paper);
					this.docxBlob = blob;
					
					// 等待 DOM 更新后渲染 docx
					this.$nextTick(() => {
						this.renderDocxPreview(blob);
					});
					
					uni.showToast({
						title: '论文加载成功',
						icon: 'none',
						duration: 1500
					});
				} catch (err) {
					console.error('加载本地论文内容失败:', err);
					console.error('错误详情:', err.message);
					uni.showToast({
						title: `加载失败: ${err.message}`,
						icon: 'none',
						duration: 3000
					});
				} finally {
					uni.hideLoading();
				}
			},
			
			// 从后端加载论文内容（使用 ossKey）
			async loadPaperFromBackend(student, paper) {
				try {
					uni.showLoading({ title: '正在加载论文...' });
					
					const currentPaper = paper || student.paper || (student.papers && student.papers[0]);
					const ossKey = currentPaper?.ossKey;
					if (!ossKey) {
						throw new Error('论文文件路径不存在');
					}
					
					console.log('加载后端论文:', { ossKey, studentId: student.id });
					
					// 从 ossKey 提取文件名
					const fileName = ossKey.split('/').pop();
					console.log('文件名:', fileName);
									
					// 构建文件 URL - 后端静态文件服务路径：/doc/essay/文件名.docx
					const fileUrl = `${config.baseURL}/doc/essay/${fileName}`;
									
					console.log('论文文件 URL:', fileUrl);
					
					// 使用 fetch 获取 .docx 文件
					const response = await fetch(fileUrl);
					if (!response.ok) {
						throw new Error(`HTTP ${response.status}: ${response.statusText}`);
					}
					
					// 获取 ArrayBuffer
					const arrayBuffer = await response.arrayBuffer();
					
					// 使用 docx-preview 渲染 .docx 文件
					const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
					
					this.mergeStudentPaperWithDocxBlob(student, blob, currentPaper);
					this.docxBlob = blob;
										
					// 等待 DOM 更新后渲染 docx
					this.$nextTick(() => {
						this.renderDocxPreview(blob);
					});
					
					uni.showToast({
						title: '论文加载成功',
						icon: 'none',
						duration: 1500
					});
				} catch (err) {
					console.error('从后端加载论文失败:', err);
					uni.showToast({
						title: '论文加载失败: ' + err.message,
						icon: 'none',
						duration: 2000
					});
				} finally {
					uni.hideLoading();
				}
			},
			
			// 工具栏字数：只改 data，由模板绑定更新；docx 容器在兄弟节点，不会因该字段更新而被重建
			setReviewWordCountLabel(text) {
				this.reviewToolbarWordCountText = text;
			},
			
			applyReviewWordCountAfterOpen() {
				if (!this.showReview) {
					return;
				}
				const paper = this.currentPaper || this.currentStudent?.paper;
				if (paper && paper.wordCount != null && String(paper.wordCount).trim() !== '') {
					this.setReviewWordCountLabel(`字数: ${paper.wordCount}`);
					return;
				}
				if (this.paperLoading) {
					this.setReviewWordCountLabel('字数: 统计中...');
					return;
				}
				// 已从 DOM 统计过则保留，禁止仅因存在 docxBlob 再次覆盖为「统计中」（会与 render 回调竞态，出现先出字数再闪回统计中）
				if (this.documentWordCount != null) {
					this.setReviewWordCountLabel(`字数: ${this.documentWordCount}`);
					return;
				}
				if (this.docxBlob || paper?.docxBlob) {
					if (typeof document !== 'undefined') {
						const container = document.getElementById('docx-preview-container');
						const wrapper = container && container.querySelector('.docx-preview-wrapper-wrapper');
						if (wrapper && wrapper.children.length > 0) {
							this.updateDocxWordCountFromDom();
							return;
						}
					}
					this.setReviewWordCountLabel('字数: 统计中...');
					return;
				}
				this.setReviewWordCountLabel('字数: —');
			},
			
			// 从已渲染的 docx-preview 容器统计正文字符数（剔除空白）；不写响应式 data
			updateDocxWordCountFromDom() {
				if (typeof document === 'undefined') {
					return;
				}
				const paper = this.currentPaper || this.currentStudent?.paper;
				if (paper && paper.wordCount != null && String(paper.wordCount).trim() !== '') {
					return;
				}
				const container = document.getElementById('docx-preview-container');
				if (!container) {
					return;
				}
				const text = container.innerText || container.textContent || '';
				const n = text.replace(/\s/g, '').length;
				this.setReviewWordCountLabel(`字数: ${n}`);
			},
			
			// 使用 docx-preview 渲染论文
			async renderDocxPreview(blob) {
				try {
					const docxPreview = await import('docx-preview');
					const container = document.getElementById('docx-preview-container');
					
					if (!container) {
						console.warn('docx-preview 容器不存在');
						return;
					}
					
					// 清空容器
					container.innerHTML = '';
					
					// 计算缩放比例 (zoomLevel 是百分比，如 100 表示 100%)
					const scale = this.zoomLevel / 100;
					
					// 渲染 docx，使用缩放选项
					await docxPreview.renderAsync(blob, container, null, {
						className: 'docx-preview-wrapper',
						inWrapper: true,
						ignoreWidth: false,
						ignoreHeight: false, // 保持 false，严格按照文档原始高度分页
						ignoreFonts: false,
						breakPages: true, // 启用分页
						ignoreLastRenderedPageBreak: true, // 忽略 lastRenderedPageBreak，使用文档原始分页
						trimXmlDeclaration: true,
						useBase64URL: false,
						renderChanges: false,
						renderComments: false
					});
					
					// 应用缩放
					this.applyDocxZoom(scale);
					
					// 更新总页数 + 前端字数（等布局稳定后再读 innerText）
					this.$nextTick(() => {
						const wrapper = container.querySelector('.docx-preview-wrapper-wrapper');
						if (wrapper) {
							this.totalPageCount = wrapper.children.length;
							console.log('文档总页数:', this.totalPageCount);
							
							// 调试：查看渲染后的 DOM 结构
							console.log('=== docx-preview DOM 结构 ===');
							console.log('wrapper 子元素数量:', wrapper.children.length);
							Array.from(wrapper.children).forEach((child, index) => {
								console.log(`页面 ${index + 1}:`, {
									tagName: child.tagName,
									className: child.className,
									height: child.offsetHeight,
									width: child.offsetWidth
								});
							});
							
							// 检查是否有页眉页脚
							const headers = wrapper.querySelectorAll('header');
							const footers = wrapper.querySelectorAll('footer');
							console.log('页眉数量:', headers.length);
							console.log('页脚数量:', footers.length);
							
							// 计算字数（去掉所有空白字符）
							const text = container.innerText || container.textContent || '';
							const cleanText = text.replace(/\s/g, '');
							this.documentWordCount = cleanText.length;
							console.log('文档字数:', this.documentWordCount);
						}
						this.updateDocxWordCountFromDom();
						requestAnimationFrame(() => {
							this.updateDocxWordCountFromDom();
							this.refreshAgentDocxParagraphIndexStamps();
							// 文档渲染完成，建立预缓存（并重置游标）
							this.buildAgentSectionIndexCache();
						});
					});
					
					// 修复文本选择：强制设置所有元素的 user-select
					this.$nextTick(() => {
						const wrapper = container.querySelector('.docx-preview-wrapper-wrapper');
						if (wrapper) {
							// 给 wrapper 和所有子元素强制设置 user-select
							wrapper.style.setProperty('user-select', 'text', 'important');
							wrapper.style.setProperty('-webkit-user-select', 'text', 'important');
							
							const allElements = wrapper.querySelectorAll('*');
							allElements.forEach(el => {
								el.style.setProperty('user-select', 'text', 'important');
								el.style.setProperty('-webkit-user-select', 'text', 'important');
							});
							
							console.log('已强制设置', allElements.length, '个元素的 user-select: text');
						}
						this.refreshAgentDocxParagraphIndexStamps();
						// 文档渲染完成，建立预缓存（并重置游标）
						this.buildAgentSectionIndexCache();
					});
									
					console.log('docx-preview 渲染完成，缩放:', this.zoomLevel + '%');
				} catch (err) {
					console.error('docx-preview 渲染失败:', err);
					uni.showToast({
						title: '论文渲染失败',
						icon: 'none',
						duration: 2000
					});
				}
			},
			
			// 应用 docx-preview 的缩放
			applyDocxZoom(scale) {
				const container = document.getElementById('docx-preview-container');
				if (!container) return;
				
				// ========== 排查代码：只打印，不修改任何逻辑 ==========
				console.log('========== docx-preview DOM 结构排查 ==========');
				console.log('1. 容器直接子元素数量:', container.children.length);
				Array.from(container.children).forEach((child, i) => {
					console.log(`   [${i}] ${child.tagName}, class="${child.className}", children=${child.children.length}`);
				});
				
				const docxEl = container.querySelector('.docx');
				if (docxEl) {
					console.log('2. .docx 元素子元素数量:', docxEl.children.length);
					Array.from(docxEl.children).forEach((child, i) => {
						const rect = child.getBoundingClientRect();
						console.log(`   [${i}] ${child.tagName}, class="${child.className?.substring(0, 40)}", width=${Math.round(rect.width)}`);
					});
				} else {
					console.log('2. 未找到 .docx 元素');
				}
				console.log('========== 排查结束 ==========');
				// ========== 排查代码结束 ==========
				
				// 原有缩放逻辑（保持不变）
				let pages = [];
				const selectors = [
					'.docx > div',
					'.docx-preview-wrapper .docx > div',
					'[class*="docx"] > div',
					container.querySelector('.docx')?.children
				];
				
				for (const selector of selectors) {
					if (typeof selector === 'string') {
						const found = container.querySelectorAll(selector);
						if (found.length > 1) {
							pages = Array.from(found);
							break;
						}
					} else if (selector && selector.length > 1) {
						pages = Array.from(selector);
						break;
					}
				}
				
				if (pages.length === 0) {
					const allDivs = container.querySelectorAll('div');
					pages = Array.from(allDivs).filter(div => {
						const style = window.getComputedStyle(div);
						const width = parseInt(style.width);
						return width > 500;
					});
				}
				
				if (pages.length > 0) {
					pages.forEach((page) => {
						page.style.setProperty('transform', `scale(${scale})`, 'important');
						page.style.setProperty('transform-origin', 'top center', 'important');
						page.style.setProperty('transition', 'transform 0.2s ease', 'important');
					});
					this.updatePageLayout(scale, pages);
				}
				this.$nextTick(() => {
					this.refreshAgentDocxParagraphIndexStamps();
					// 缩放完成，重建预缓存
					this.buildAgentSectionIndexCache();
				});
			},
					
			// 根据缩放比例更新页面布局（单页垂直排列）
			updatePageLayout(scale, pages) {
				const container = document.getElementById('docx-preview-container');
				if (!container || pages.length === 0) return;
				
				// 单页模式：垂直排列，让 docx-preview 按原始分页显示
				container.style.display = 'block';
				container.style.padding = '20rpx';
				
				// 恢复页面默认样式
				Array.from(pages).forEach(page => {
					page.style.flex = 'none';
					page.style.margin = '0 auto 20rpx auto';
				});
			},
			
			// 将 HTML 转换为段落数组
			parseHtmlToParagraphs(html) {
				const parser = new DOMParser();
				const doc = parser.parseFromString(html, 'text/html');
				const paragraphs = [];
				
				// 提取所有段落
				const elements = doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li');
				elements.forEach(el => {
					const text = el.textContent.trim();
					if (text) {
						paragraphs.push({ text });
					}
				});
				
				return paragraphs;
			},
			closeReview() {
				this.showReview = false;
				this.currentStudent = null;
				this.currentPaper = null; // 清空当前论文，避免数据残留
				this.currentPaper = null; // 清空当前论文，避免数据残留
				this.annotationMode = false;
				this.selectedParagraph = null;
				// 重置审阅弹窗状态
				this.showAISummary = false;
				this.activeAnnotationTab = 'all';
				this.paperContent = '';
				this.aiSummary = '';
				this.resetAgentAuditState();
				this.zoomLevel = 100;
				this.docxBlob = null;
				this.reviewToolbarWordCountText = '字数: 统计中...';
				this.documentWordCount = null;
			},
			// 关闭审阅弹窗
			closeReviewModal() {
				this.closeReview();
			},
			// 放大
			zoomIn() {
				if (this.zoomLevel < 150) {
					this.zoomLevel += 10;
					// 应用新的缩放
					this.$nextTick(() => {
						this.applyDocxZoom(this.zoomLevel / 100);
					});
				}
			},
			// 缩小
			zoomOut() {
				if (this.zoomLevel > 50) {
					this.zoomLevel -= 10;
					// 应用新的缩放
					this.$nextTick(() => {
						this.applyDocxZoom(this.zoomLevel / 100);
					});
				}
			},
			// 查看PDF版本
			viewPdfVersion() {
				const pdfKey = this.currentPaper?.pdfOssKey || this.currentPaper?.pdf_oss_key;
				if (!pdfKey) {
					uni.showToast({ title: 'PDF文件不存在', icon: 'none' });
					return;
				}
				// 提取相对路径：去掉 /root/CD_AI_back_end 前缀，保留 /doc/essay/... 部分
				let relativePath = pdfKey;
				if (pdfKey.startsWith('/root/CD_AI_back_end')) {
					relativePath = pdfKey.replace('/root/CD_AI_back_end', '');
				}
				// 构建PDF访问URL：假设静态文件通过根路径直接访问
				const pdfUrl = `${config.baseURL}${relativePath}`;
				console.log('打开PDF:', pdfUrl);
				// #ifdef H5
				window.open(pdfUrl, '_blank');
				// #endif
				// #ifndef H5
				uni.navigateTo({
					url: `/pages/teacher/PdfPreview?url=${encodeURIComponent(pdfUrl)}&title=${encodeURIComponent(this.currentPaper?.title || 'PDF预览')}`
				});
				// #endif
			},
			closeSelectTextHintMask() {
				this.showSelectTextHintMask = false;
			},
			// 添加批注
			addAnnotation() {
				// 调用 toggleAnnotationMode 处理批注逻辑
				this.toggleAnnotationMode();
			},
			// 显示批注输入弹窗
			showAddAnnotation() {
				this.annotationInputContent = '';
				this.showAnnotationInputModal = true;
			},
			// 关闭批注输入弹窗
			closeAnnotationInputModal() {
				this.showAnnotationInputModal = false;
				this.annotationInputContent = '';
				this.annotationMode = false;
				// 清除选中文本下划线
				this.clearTextUnderline();
			},
			// 关闭未选中文本提示弹窗
			closeNoSelectionModal() {
				this.showNoSelectionModal = false;
			},
			// 关闭未选中文本提示弹窗
			closeNoSelectionModal() {
				this.showNoSelectionModal = false;
			},
			// 提交批注
			async submitAnnotation() {
				if (!this.annotationInputContent.trim()) {
					uni.showToast({
						title: '请输入批注内容',
						icon: 'none'
					});
					return;
				}
				
				try {
					const paperId =
						this.resolvePaperId(this.currentPaper) || this.resolvePaperId(this.currentStudent?.paper);
					const ownerId = this.currentStudent?.id;
					
					if (!paperId || !ownerId) {
						uni.showToast({
							title: '批注参数不完整',
							icon: 'none'
						});
						return;
					}
					
					// 构建批注数据
					const userInfo = uni.getStorageSync('userInfo') || {};
					const teacherId = userInfo.id || uni.getStorageSync('teacher_id') || 0;
					
					// 将坐标格式化为 (x,y) 字符串格式
					const coords = this.selectedCoordinates || { x: 0, y: 0 };
					const coordinatesStr = `(${coords.x},${coords.y})`;
					
					// 构建合并格式的 content：选中内容 + 批注 + 建议
					const selectedText = this.selectedText || '';
					const annotationContent = this.annotationInputContent.trim();
					const combinedContent = `选中内容：${selectedText}\n批注：${annotationContent}\n建议：`;
					
					const annotationData = {
						paper_id: paperId,
						teacher_id: teacherId,
						content: combinedContent,
						paragraph_id: this.selectedParagraph || '0',
						coordinates: coordinatesStr
						// selected_text 不再单独传递，已嵌入 content
					};
					
					console.log('提交批注:', annotationData);
					
					// 调用API添加批注
					const res = await addAnnotation(annotationData, ownerId);
					
					if (res && (res.code === 200 || res.id || res.data?.id)) {
						const newId = res.id ?? res.data?.id ?? `local_${Date.now()}`;
						// 本地存储选中内容（用于前端快速显示）
						if (newId && selectedText) {
							try {
								const savedTexts = JSON.parse(localStorage.getItem('annotation_selected_texts') || '{}');
								savedTexts[String(newId)] = selectedText;
								localStorage.setItem('annotation_selected_texts', JSON.stringify(savedTexts));
							} catch(e) {}
						}
						const newAnn = {
							id: newId,
							content: annotationContent, // 前端显示用纯批注内容
							selectedText: selectedText,
							suggestion: '',
							paragraph: this.selectedParagraph || '0',
							source: 'manual',
							type: 'manual',
							coordinates: coordinatesStr,
							coordinatesObj: { x: Number(coords.x), y: Number(coords.y) },
							time: new Date().toISOString(),
							createTime: new Date().toISOString()
						};
						const nonReview = (this.currentPaper?.annotations || []).filter((a) => !a.isReviewComment);
						nonReview.push(newAnn);
						this.insertAnnotationsKeepReview(nonReview);
						
						uni.showToast({
							title: '批注添加成功',
							icon: 'success'
						});
						
						this.closeAnnotationInputModal();
						
						await this.loadAnnotationList(this.currentStudent, this.currentPaper);
					} else {
						throw new Error(res?.message || '添加失败');
					}
				} catch (err) {
					console.error('添加批注失败:', err);
					uni.showToast({
						title: '添加失败: ' + (err.message || '请重试'),
						icon: 'none'
					});
				}
			},
			// ==================== 编辑批注 ====================
			openEditAnnotation(annotation, index) {
				this.editAnnotationData = annotation;
				this.editAnnotationContent = annotation.content || '';
				this.showEditAnnotationModal = true;
			},
			closeEditAnnotationModal() {
				this.showEditAnnotationModal = false;
				this.editAnnotationContent = '';
				this.editAnnotationData = {};
			},
			async submitEditAnnotation() {
				if (!this.editAnnotationContent.trim()) {
					uni.showToast({ title: '请输入批注内容', icon: 'none' });
					return;
				}
				try {
					const userInfo = uni.getStorageSync('userInfo') || {};
					const teacherId = userInfo.id || uni.getStorageSync('teacher_id') || 0;
					const paperId =
						this.resolvePaperId(this.currentPaper) || this.resolvePaperId(this.currentStudent?.paper);
					// 复用原坐标，转为 (x,y) 字符串格式
					const rawCoords = this.editAnnotationData.coordinates;
					let originalCoords = '(0,0)';
					if (rawCoords && typeof rawCoords === 'string' && rawCoords.startsWith('(')) {
						originalCoords = rawCoords;
					} else if (rawCoords && typeof rawCoords === 'object') {
						originalCoords = `(${rawCoords.x},${rawCoords.y})`;
					} else if (typeof rawCoords === 'string') {
						originalCoords = rawCoords;
					}
					const editId = this.editAnnotationData.id;
					const res = await updateAnnotation(this.editAnnotationData.id, {
						paper_id: paperId,
						teacher_id: teacherId,
						content: this.editAnnotationContent.trim(),
						paragraph_id: this.editAnnotationData.paragraph_id || '0',
						coordinates: originalCoords,
						selected_text: this.editAnnotationData.selected_text || ''
					});
					if (res && (res.code === 200 || res.id)) {
						const nonReview = (this.currentPaper?.annotations || [])
							.filter((a) => !a.isReviewComment)
							.map((a) => {
								if (String(a.id) === String(editId)) {
									return {
										...a,
										content: this.editAnnotationContent.trim()
									};
								}
								return a;
							});
						this.insertAnnotationsKeepReview(nonReview);
						uni.showToast({ title: '修改成功', icon: 'success' });
						this.closeEditAnnotationModal();
						await this.loadAnnotationList(this.currentStudent, this.currentPaper);
					} else {
						throw new Error(res?.message || '修改失败');
					}
				} catch (err) {
					console.error('编辑批注失败:', err);
					uni.showToast({ title: '修改失败: ' + (err.message || '请重试'), icon: 'none' });
				}
			},
			// ==================== 删除批注 ====================
			openDeleteAnnotation(annotation, index) {
				this.deleteAnnotationData = annotation;
				this.showDeleteAnnotationModal = true;
			},
			closeDeleteAnnotationModal() {
				this.showDeleteAnnotationModal = false;
				this.deleteAnnotationData = {};
			},
			async submitDeleteAnnotation() {
				try {
					const userInfo = uni.getStorageSync('userInfo') || {};
					const teacherId = userInfo.id || uni.getStorageSync('teacher_id') || 0;
					const paperId =
						this.resolvePaperId(this.currentPaper) || this.resolvePaperId(this.currentStudent?.paper);
					const delId = this.deleteAnnotationData.id;
					const res = await deleteAnnotation(this.deleteAnnotationData.id, {
						paper_id: paperId,
						teacher_id: teacherId
					});
					if (res && (res.code === 200 || res.id || res.message === 'success' || res === '' || res === null)) {
						const nonReview = (this.currentPaper?.annotations || []).filter(
							(a) => !a.isReviewComment && String(a.id) !== String(delId)
						);
						this.insertAnnotationsKeepReview(nonReview);
						uni.showToast({ title: '删除成功', icon: 'success' });
						this.closeDeleteAnnotationModal();
						await this.loadAnnotationList(this.currentStudent, this.currentPaper);
					} else {
						throw new Error(res?.message || '删除失败');
					}
				} catch (err) {
					console.error('删除批注失败:', err);
					uni.showToast({ title: '删除失败: ' + (err.message || '请重试'), icon: 'none' });
				}
			},
			// ==================== 选中文本下划线 ====================
			applyTextUnderline(range) {
				// 清除之前的标记
				this.clearTextUnderline();
				if (!range || range.collapsed) return;
				try {
					console.log('[下划线] applyTextUnderline 被调用');
					// 使用覆盖层方案：在 .paper-preview-area 上叠加绝对定位的高亮 div
					// 不修改 docx DOM，完全可靠，支持跨节点
					const previewArea = document.querySelector('.paper-preview-area');
					const container = document.getElementById('docx-preview-container');
					if (!previewArea || !container) {
						console.log('[下划线] DOM元素缺失:', { previewArea: !!previewArea, container: !!container });
						return;
					}
					
					const wrapper = container.querySelector('.docx-preview-wrapper-wrapper');
					const contentEl = wrapper || container;
					const wrapperRect = contentEl.getBoundingClientRect();
					const rects = range.getClientRects();
					
					console.log('[下划线] 数据:', {
						wrapper: !!wrapper,
						contentEl: contentEl.tagName,
						wrapperRect: { top: wrapperRect.top, left: wrapperRect.left, width: wrapperRect.width, height: wrapperRect.height },
						rectsCount: rects ? rects.length : 0
					});
					
					if (!rects || rects.length === 0) {
						console.log('[下划线] 无 rects，返回');
						return;
					}
					
					// 创建容器 div（相对于 wrapper 定位）
					const overlayContainer = document.createElement('div');
					overlayContainer.className = 'annotation-underline-overlay';
					overlayContainer.style.cssText = 'position: absolute; pointer-events: none; top: 0; left: 0; width: 100%; height: 100%; z-index: 10;';
					
					// 为每个矩形创建高亮 div（相对于 wrapper 的绝对位置）
					for (let i = 0; i < rects.length; i++) {
						const rect = rects[i];
						const highlight = document.createElement('div');
						// 计算相对于 wrapper 的位置
						const top = rect.top - wrapperRect.top;
						const left = rect.left - wrapperRect.left;
						highlight.style.cssText = `
							position: absolute;
							top: ${top}px;
							left: ${left}px;
							width: ${rect.width}px;
							height: ${rect.height}px;
							background: rgba(59, 130, 246, 0.4);
							border-bottom: 3px solid #2563eb;
							pointer-events: none;
							z-index: 9999;
						`;
						overlayContainer.appendChild(highlight);
						console.log(`[下划线] 创建高亮 ${i}:`, { top, left, width: rect.width, height: rect.height });
					}
					
					// 将覆盖层插入到 contentEl 中，而不是 previewArea
					contentEl.style.position = 'relative';
					contentEl.appendChild(overlayContainer);
					this.currentHighlightRange = overlayContainer;
					console.log('[下划线] 覆盖层已插入到 contentEl');
				} catch (e) {
					console.warn('添加下划线高亮失败:', e);
				}
			},
			clearTextUnderline() {
				// 移除覆盖层容器
				if (this.currentHighlightRange && this.currentHighlightRange.parentNode) {
					this.currentHighlightRange.parentNode.removeChild(this.currentHighlightRange);
				}
				this.currentHighlightRange = null;
				// 兜底：移除所有残留覆盖层
				document.querySelectorAll('.annotation-underline-overlay').forEach(el => {
					if (el.parentNode) el.parentNode.removeChild(el);
				});
			},
			toggleAISummary() {
				this.aiSummaryCollapsed = !this.aiSummaryCollapsed;
			},
			jumpToFirstIssue() {
				const firstAIAnnotation = this.filteredAnnotations.find(a => a.source === 'ai');
				if (firstAIAnnotation) {
					this.focusAnnotation(this.filteredAnnotations.indexOf(firstAIAnnotation));
					this.selectedParagraph = firstAIAnnotation.paragraph;
				}
			},
			toggleAnnotationMode() {
				// 如果已经在批注模式，则退出
				if (this.annotationMode) {
					this.annotationMode = false;
					this.selectedText = '';
					this.selectedRange = null;
					return;
				}
				
				// 获取当前选中的文本
				const selection = window.getSelection();
				const selectedText = selection.toString().trim();
				
				if (!selectedText) {
					this.showSelectTextHintMask = true;
					return;
				}
				
				// 保存选中的文本和位置信息
				this.selectedText = selectedText;
				this.selectedRange = selection.getRangeAt(0).cloneRange();
				
				// 获取选中文本的坐标位置（必须在清除选区前获取）
				const container = document.getElementById('docx-preview-container');
				const previewArea = document.querySelector('.paper-preview-area');
				console.log('[坐标采集] DOM元素:', { container: !!container, previewArea: !!previewArea });
				if (container && this.selectedRange) {
					const wrapper = container.querySelector('.docx-preview-wrapper-wrapper');
					const contentEl = wrapper || container;
					const wrapperRect = contentEl.getBoundingClientRect();
					const rangeRect = this.selectedRange.getBoundingClientRect();
					const totalHeight = contentEl.scrollHeight;
					
					// x: 相对于 wrapper 宽度的百分比
					const x = ((rangeRect.left - wrapperRect.left) / wrapperRect.width * 100).toFixed(2);
					// y: 选中文字在整个文档中的百分比位置（相对于 wrapper 顶部，不包含当前滚动位置）
					// 这样无论当前滚动到哪里，坐标都是相对于文档顶部的固定百分比
					const rangeOffsetFromWrapperTop = rangeRect.top - wrapperRect.top;
					const y = ((rangeOffsetFromWrapperTop / totalHeight) * 100).toFixed(2);
					
					this.selectedCoordinates = { x: parseFloat(x), y: parseFloat(y) };
					console.log('[坐标采集] 详细数据:', {
						selectedCoordinates: this.selectedCoordinates,
						rangeRect: { top: rangeRect.top, left: rangeRect.left, width: rangeRect.width, height: rangeRect.height },
						wrapperRect: { top: wrapperRect.top, left: wrapperRect.left, width: wrapperRect.width, height: wrapperRect.height },
						totalHeight,
						rangeOffsetFromWrapperTop,
						selectedText: this.selectedText?.substring(0, 20)
					});
				}
				
				// 对选中文本加下划线标记（必须先标记再开弹窗，否则弹窗会清除选区）
				this.applyTextUnderline(this.selectedRange);
				selection.removeAllRanges();
				
				// 进入批注模式
				this.annotationMode = true;
				
				// 获取选中文本的坐标位置（相对于整个文档的百分比）
				// 直接显示批注输入弹窗
				this.annotationInputContent = '';
				this.showAnnotationInputModal = true;
			},
			handleDocumentClick(e) {
				console.log('handleDocumentClick 被调用, annotationMode:', this.annotationMode);
				if (this.annotationMode) {
					// 在批注模式下，获取点击坐标
					const container = document.getElementById('docx-preview-container');
					console.log('docx-preview-container:', container);
					if (container) {
						const rect = container.getBoundingClientRect();
						const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(2);
						const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(2);
						this.selectedCoordinates = { x: parseFloat(x), y: parseFloat(y) };
						console.log('docx-preview 点击坐标:', this.selectedCoordinates, 'event:', e.clientX, e.clientY);
					} else {
						console.warn('未找到 docx-preview-container');
					}
					// 显示批注弹窗（旧版富文本表单）
					this.openLegacyAnnotationModal();
				}
			},
			// 文档滚动事件 - 更新当前页码（带节流）
			onDocumentScroll(e) {
				// 获取滚动位置（兼容不同事件格式）
				let scrollTop = 0;
				if (e && e.detail && e.detail.scrollTop !== undefined) {
					// uni-app scroll-view 格式
					scrollTop = e.detail.scrollTop;
				} else if (e && e.target && e.target.scrollTop !== undefined) {
					// DOM 事件格式
					scrollTop = e.target.scrollTop;
				} else {
					// 直接查询 DOM
					const previewArea = document.querySelector('.paper-preview-area');
					if (previewArea) {
						scrollTop = previewArea.scrollTop;
					}
				}
				
				// 清除之前的定时器
				if (this.scrollThrottleTimer) {
					clearTimeout(this.scrollThrottleTimer);
				}
				
				// 设置新的定时器（150ms 节流）
				this.scrollThrottleTimer = setTimeout(() => {
					this.updateCurrentPage(scrollTop);
				}, 150);
			},
			// 更新当前页码（实际计算逻辑）
			updateCurrentPage(scrollTop) {
				// 同步滚动位置
				this.documentScrollTop = scrollTop;
				
				const container = document.getElementById('docx-preview-container');
				if (!container) return;
				
				const wrapper = container.querySelector('.docx-preview-wrapper-wrapper');
				if (!wrapper || wrapper.children.length === 0) return;
				
				// 获取所有页面元素
				const pages = Array.from(wrapper.children);
				if (pages.length === 0) return;
				
				// 计算当前可见的页面
				const scale = this.zoomLevel / 100;
				const pageHeight = pages[0].offsetHeight * scale;
				const gap = 20; // 页面间距
				
				// 计算当前页码（基于滚动位置）
				let currentPage = 1;
				for (let i = 0; i < pages.length; i++) {
					const pageTop = i * (pageHeight + gap);
					if (scrollTop >= pageTop - pageHeight / 2) {
						currentPage = i + 1;
					}
				}
				
				// 更新当前页码
				if (this.docxCurrentPage !== currentPage) {
					this.docxCurrentPage = currentPage;
				}
			},
			selectParagraph(index, event) {
				if (this.annotationMode) {
					this.selectedParagraph = index;
					// 获取点击坐标（相对于文档容器的百分比）
					if (event) {
						const container = document.getElementById('docx-preview-container');
						if (container) {
							const rect = container.getBoundingClientRect();
							const x = ((event.clientX - rect.left) / rect.width * 100).toFixed(2);
							const y = ((event.clientY - rect.top) / rect.height * 100).toFixed(2);
							this.selectedCoordinates = { x: parseFloat(x), y: parseFloat(y) };
							console.log('选中段落坐标:', this.selectedCoordinates);
						}
					}
					this.openLegacyAnnotationModal();
				}
			},
			hasAIIssue(paragraphIndex) {
				if (!this.currentStudent) return false;
				return this.currentStudent.paper.annotations.some(a => 
					a.source === 'ai' && a.paragraph === paragraphIndex
				);
			},
			hasAnnotation(paragraphIndex) {
				if (!this.currentStudent) return false;
				return this.currentStudent.paper.annotations.some(a => 
					a.source === 'manual' && a.paragraph === paragraphIndex
				);
			},
			getIssueSeverityClass(paragraphIndex) {
				const issue = this.currentStudent.paper.annotations.find(a => 
					a.source === 'ai' && a.paragraph === paragraphIndex
				);
				if (issue) {
					return `severity-${issue.severity}`;
				}
				return '';
			},
			getIssueSeverityIcon(paragraphIndex) {
				const issue = this.currentStudent.paper.annotations.find(a => 
					a.source === 'ai' && a.paragraph === paragraphIndex
				);
				if (issue) {
					const iconMap = {
						'high': '⚠',
						'medium': '△',
						'low': '○'
					};
					return iconMap[issue.severity] || '○';
				}
				return '';
			},
			showIssueDetail(paragraphIndex) {
				const issue = this.currentStudent.paper.annotations.find(a => 
					a.source === 'ai' && a.paragraph === paragraphIndex
				);
				if (issue) {
					const index = this.filteredAnnotations.indexOf(issue);
					this.focusAnnotation(index);
				}
			},
			showAnnotationDetail(paragraphIndex) {
				const annotation = this.currentStudent.paper.annotations.find(a => 
					a.source === 'manual' && a.paragraph === paragraphIndex
				);
				if (annotation) {
					const index = this.filteredAnnotations.indexOf(annotation);
					this.focusAnnotation(index);
				}
			},
			focusAnnotation(index) {
				console.log('focusAnnotation 被调用:', index, '当前 activeAnnotation:', this.activeAnnotation);
				
				// 如果点击的是当前已选中的项，则取消选中
				if (this.activeAnnotation === index) {
					console.log('取消选中批注');
					this.activeAnnotation = null;
					this.selectedParagraph = null;
					return;
				}
				
				this.activeAnnotation = index;
				const annotation = this.filteredAnnotations[index];
				console.log('找到批注:', annotation);
				console.log('批注坐标信息:', {
					coordinates: annotation?.coordinates,
					coordinatesObj: annotation?.coordinatesObj,
					x: annotation?.coordinatesObj?.x,
					y: annotation?.coordinatesObj?.y
				});
				if (annotation) {
					this.selectedParagraph = annotation.paragraph;
					// 滚动到批注对应的位置
					this.scrollToAnnotation(annotation);
				} else {
					console.warn('未找到批注，index:', index, 'filteredAnnotations:', this.filteredAnnotations);
				}
			},
			// 滚动到批注对应的位置
			scrollToAnnotation(annotation) {
				console.log('[定位] scrollToAnnotation 被调用:', annotation);
				if (!annotation) {
					console.log('[定位] annotation 为空，返回');
					return;
				}
				// 使用具有 overflow:auto 的 .paper-preview-area 容器滚动
				const previewArea = document.querySelector('.paper-preview-area');
				const docxContainer = document.getElementById('docx-preview-container');
				const wrapper = docxContainer ? docxContainer.querySelector('.docx-preview-wrapper-wrapper') : null;
				const contentEl = wrapper || docxContainer;
				
				console.log('[定位] DOM元素:', {
					previewArea: !!previewArea,
					docxContainer: !!docxContainer,
					wrapper: !!wrapper,
					contentEl: !!contentEl
				});
				
				if (!contentEl) {
					console.log('[定位] contentEl 为空，返回');
					return;
				}
				
				// 解析坐标：字符串 "(x,y)" 或对象 {x,y}
				let coords = null;
				console.log('[定位] 原始坐标数据:', {
					coordinates: annotation.coordinates,
					coordinatesObj: annotation.coordinatesObj,
					coordinatesType: typeof annotation.coordinates
				});
				
				if (annotation.coordinates && typeof annotation.coordinates === 'string') {
					const match = annotation.coordinates.match(/\(\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/);
					console.log('[定位] 字符串坐标匹配结果:', match);
					if (match) coords = { x: parseFloat(match[1]), y: parseFloat(match[2]) };
				} else if (annotation.coordinates && typeof annotation.coordinates === 'object') {
					coords = annotation.coordinates;
					console.log('[定位] 使用对象格式坐标:', coords);
				} else if (annotation.coordinatesObj) {
					coords = annotation.coordinatesObj;
					console.log('[定位] 使用 coordinatesObj:', coords);
				}
				
				console.log('[定位] 解析后的坐标:', coords);
				
				// 工具函数：通过 selectedText 在 docx-preview DOM 中查找匹配的 <p> 元素
				// anchorY: 定位目标在 contentEl 中的像素位置（可选），优先在附近搜索
				const findAnnotationParagraphEl = (selectedText, anchorY) => {
					if (!selectedText || !docxContainer) return null;
					const norm = (s) => s.replace(/\s+/g, ' ').trim();
					const target = norm(selectedText);
					if (!target) return null;

					const isMatch = (p) => {
						const pText = norm(p.textContent || '');
						if (!pText) return false;
						return pText === target || pText.includes(target) || (target.includes(pText) && pText.length > 10);
					};

					const allPs = Array.from(docxContainer.querySelectorAll('article p, .docx-wrapper p, p'));

					// 有锚点时：先在锚点附近（±1.5 视口高度）搜索，再全文兜底
					if (anchorY != null) {
						const viewH = (previewArea ? previewArea.clientHeight : 600);
						const radius = viewH * 1.5;

						// 筛选在锚点附近的候选段落，按距锚点距离排序
						const nearby = allPs
							.filter(p => {
								const pTop = p.offsetTop || 0;
								return Math.abs(pTop - anchorY) <= radius;
							})
							.sort((a, b) => Math.abs((a.offsetTop || 0) - anchorY) - Math.abs((b.offsetTop || 0) - anchorY));

						for (const p of nearby) {
							if (isMatch(p)) return p;
						}
						// 附近未命中，继续全文搜索（从锚点往后，再往前，避免匹配到文档更早的重复段）
						const afterAnchor = allPs.filter(p => (p.offsetTop || 0) >= anchorY - viewH * 0.5);
						for (const p of afterAnchor) {
							if (isMatch(p)) return p;
						}
					}

					// 全文兜底（从上往下）
					for (const p of allPs) {
						if (isMatch(p)) return p;
					}
					return null;
				};
			
				if (coords && coords.y !== undefined) {
					const totalHeight = contentEl.scrollHeight;
					// y 是相对于整个文档的百分比，转换为像素位置
					const targetY = (coords.y / 100) * totalHeight;
					// 滚动到目标位置（让目标在视口中间偏上）
					const scrollTop = Math.max(0, targetY - previewArea.clientHeight / 3);
							
					console.log('[定位] 计算滚动位置:', {
						coords,
						totalHeight,
						targetY,
						previewAreaHeight: previewArea.clientHeight,
						scrollTop,
						currentScrollTop: previewArea.scrollTop
					});
							
					previewArea.scrollTo({ top: scrollTop, behavior: 'smooth' });
					console.log('[定位] 已执行 scrollTo');
					return; // 坐标定位成功，不再进行段落定位
				}
						
				console.log('[定位] 无有效坐标，尝试按段落定位');
				// 无坐标时按页码/段落定位
				if (wrapper) {
					const pages = Array.from(wrapper.children);
					let targetPage = null;
					if (annotation.page && annotation.page > 0 && annotation.page <= pages.length) {
						targetPage = pages[annotation.page - 1];
					} else if (annotation.paragraph !== undefined) {
						const idx = Math.max(0, Math.ceil((parseInt(annotation.paragraph) + 1) / 5) - 1);
						targetPage = pages[idx] || pages[0];
					} else {
						targetPage = pages[0];
					}
					if (targetPage) {
						const scrollTop = (docxContainer ? docxContainer.offsetTop : 0) + targetPage.offsetTop - 80;
						previewArea.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' });
					}
				}
			},
			// 滚动到指定元素
			scrollToElement(element) {
				if (!element) return;
				const previewArea = document.querySelector('.paper-preview-area');
				const docxContainer = document.getElementById('docx-preview-container');
				if (!previewArea) return;
				const scrollTop = (docxContainer ? docxContainer.offsetTop : 0) + element.offsetTop - 80;
				previewArea.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' });
				console.log('页面定位滚动到:', scrollTop);
			},
			openLegacyAnnotationModal() {
				this.editingAnnotation = null;
				this.annotationForm.selectedText = this.selectedText;
				this.showAnnotationModal = true;
			},
			editAnnotation(annotation) {
				console.log('点击编辑批注:', JSON.stringify(annotation, null, 2));
				this.editingAnnotation = annotation;
				this.showAnnotationModal = true;
			},
			deleteAnnotation(annotation) {
				this.annotationToDelete = annotation;
				this.showDeleteConfirm = true;
			},
			async confirmDelete() {
				if (!this.annotationToDelete) return;
				try {
					const userInfo = uni.getStorageSync('userInfo');
					const teacherId = userInfo?.id || uni.getStorageSync('teacher_id') || 0;
					const paperId = Number(this.currentPaper?.paperId || this.currentPaper?.id || 
					                      this.currentStudent?.paper?.paperId || this.currentStudent?.paper?.id);
					
					console.log('删除批注参数:', { annotationId: this.annotationToDelete.id, paperId, teacherId });

					await deleteAnnotation(this.annotationToDelete.id, {
						paper_id: paperId,
						teacher_id: teacherId
					});
					const targetAnnotations = this.currentPaper?.annotations || this.currentStudent?.paper?.annotations;
					const index = targetAnnotations?.indexOf(this.annotationToDelete) ?? -1;
					if (index > -1 && targetAnnotations) {
						targetAnnotations.splice(index, 1);
						const targetPaper = this.currentPaper || this.currentStudent?.paper;
						if (targetPaper) targetPaper.annotationCount--;
						uni.showToast({
							title: '删除成功',
							icon: 'success'
						});
					}
					this.showDeleteConfirm = false;
					this.annotationToDelete = null;
				} catch (err) {
					console.error('删除批注失败:', err);
					uni.showToast({
						title: '删除失败',
						icon: 'none'
					});
				}
			},
			cancelDelete() {
				this.showDeleteConfirm = false;
				this.annotationToDelete = null;
			},
			closeAnnotationModal() {
				this.showAnnotationModal = false;
				this.editingAnnotation = null;
				this.selectedCoordinates = null; // 清空选中的坐标
			},
			async saveAnnotation() {
				if (!this.annotationForm.content.trim()) {
					uni.showToast({
						title: '请输入批注内容',
						icon: 'none'
					});
					return;
				}
				
				try {
					const userInfo = uni.getStorageSync('userInfo');
					// 使用当前登录用户的真实ID
					const teacherId = userInfo?.id || uni.getStorageSync('teacher_id') || 0;
					
					// 排查：输出 userInfo 和 teacherId
					console.log('saveAnnotation - userInfo:', userInfo);
					console.log('saveAnnotation - original teacherId:', userInfo?.id);
					console.log('saveAnnotation - using teacherId:', teacherId);
					
					// 排查：检查 currentStudent 和 currentPaper 的结构
					console.log('saveAnnotation - currentStudent:', this.currentStudent);
					console.log('saveAnnotation - currentPaper:', this.currentPaper);
					
					// 排查：检查 selectedCoordinates
					console.log('saveAnnotation - selectedCoordinates:', this.selectedCoordinates);
					console.log('saveAnnotation - selectedParagraph:', this.selectedParagraph);
					
					// 尝试获取 paperId，优先使用 currentPaper，然后是 currentStudent.paper
					let rawPaperId = this.currentPaper?.paperId || this.currentPaper?.id || 
					                 this.currentStudent?.paper?.paperId || this.currentStudent?.paper?.id;
					const paperId = Number(rawPaperId);
					
					console.log('saveAnnotation - rawPaperId:', rawPaperId, 'converted paperId:', paperId);
					
					if (isNaN(paperId) || paperId <= 0) {
						uni.showToast({
							title: '论文ID无效，请重新打开论文',
							icon: 'none',
							duration: 3000
						});
						return;
					}

					// 合并选中内容、批注内容与建议（因为后端接口只有 content 字段）
					const parts = [];
					if (this.annotationForm.selectedText) {
						parts.push(`选中内容：${this.annotationForm.selectedText}`);
					}
					if (this.annotationForm.content) {
						parts.push(`批注：${this.annotationForm.content}`);
					}
					if (this.annotationForm.suggestion) {
						parts.push(`建议：${this.annotationForm.suggestion}`);
					}
					const fullContent = parts.join('\n');

					if (this.editingAnnotation) {
						// 更新现有批注 - 沿用原来的坐标，不修改
						// 坐标可能是对象格式 {x, y} 或字符串格式 (x,y)，需要统一转换为字符串
						let coordinates = this.editingAnnotation.coordinates || '(0,0)';
						// 如果是对象格式，转换为字符串
						if (typeof coordinates === 'object' && coordinates !== null) {
							coordinates = `(${coordinates.x},${coordinates.y})`;
						}
						console.log('编辑批注 - 使用原有坐标:', coordinates);
						
						await updateAnnotation(this.editingAnnotation.id, {
							paper_id: paperId,
							teacher_id: teacherId,
							content: fullContent,
							paragraph_id: String(this.annotationForm.paragraph || 0),
							coordinates: coordinates
						});
						
						const annotations = this.currentPaper?.annotations || this.currentStudent?.paper?.annotations || [];
						const index = annotations.indexOf(this.editingAnnotation);
						if (index > -1) {
							const targetAnnotations = this.currentPaper?.annotations || this.currentStudent?.paper?.annotations || [];
							targetAnnotations[index] = {
								...targetAnnotations[index],
								selectedText: this.annotationForm.selectedText,
								content: this.annotationForm.content,
								suggestion: this.annotationForm.suggestion,
								fullContent: fullContent // 保存完整内容用于显示
							};
						}
						uni.showToast({
							title: '保存成功',
							icon: 'success'
						});
					} else {
						// 添加新批注 - 使用选中的坐标
						const coordinates = this.selectedCoordinates 
							? `(${this.selectedCoordinates.x},${this.selectedCoordinates.y})` 
							: '(0,0)';
						const coordinatesObj = this.selectedCoordinates || { x: 0, y: 0 };
						
						console.log('保存批注坐标:', coordinates, coordinatesObj);
						
						const res = await addAnnotation({
							paper_id: paperId,
							teacher_id: teacherId,
							content: fullContent,
							paragraph_id: String(this.annotationForm.paragraph || 0),
							coordinates: coordinates
						});
						
						const newAnnotation = {
							...this.annotationForm,
							id: res?.id || res?.data?.id || Date.now(),
							source: 'manual',
							coordinates: coordinates,
							coordinatesObj: coordinatesObj,
							fullContent: fullContent
						};
						
						// 使用 $set 更新 currentPaper.annotations 以触发 Vue 响应式
						if (this.currentPaper) {
							const existingAnnotations = this.currentPaper.annotations || [];
							this.$set(this.currentPaper, 'annotations', [...existingAnnotations, newAnnotation]);
							this.$set(this.currentPaper, 'annotationCount', (this.currentPaper.annotationCount || 0) + 1);
						}
						uni.showToast({
							title: '添加成功',
							icon: 'success'
						});
					}
					this.closeAnnotationModal();
				} catch (err) {
					console.error('保存批注失败:', err);
				}
			},
		// 打开审阅意见弹窗
		async openReviewCommentModal() {
			const existingComment = this.reviewComment;
			if (existingComment) {
				this.reviewCommentForm = { content: existingComment.content || '' };
				this.editingReviewComment = true;
			} else {
				this.reviewCommentForm = { content: '' };
				this.editingReviewComment = false;
			}
			this.showReviewCommentModal = true;
		},
		// 关闭审阅意见弹窗
		closeReviewCommentModal() {
			this.showReviewCommentModal = false;
			this.editingReviewComment = false;
			},
			// 保存审阅意见
			async saveReviewComment() {
				if (!this.reviewCommentForm.content.trim()) {
					uni.showToast({
						title: '请输入审阅意见',
						icon: 'none'
					});
					return;
				}
				
				try {
					const paperId =
						this.resolvePaperId(this.currentPaper) || this.resolvePaperId(this.currentStudent?.paper);
					if (!paperId) {
						uni.showToast({
							title: '论文ID无效',
							icon: 'none'
						});
						return;
					}
					
					// 构建审阅内容字符串（后端只接收 review_content 字符串）
					const reviewContent = this.reviewCommentForm.content || '';
					console.log('准备提交审阅意见:', { paperId, reviewContent, editing: this.editingReviewComment });
					
					// 根据是新建还是编辑，调用不同的接口
					if (this.editingReviewComment) {
						// 更新审阅意见
						await updatePaperReview(paperId, { review_content: reviewContent });
						console.log('审阅意见更新成功');
											
						// 如果论文当前状态是"已更新"，则更新为"待更新"
						const currentStatus = this.currentPaper?.status || this.currentStudent?.paper?.status;
						if (currentStatus === '已更新') {
							try {
								await updatePaperStatus(paperId, {
									status: '待更新',
									comment: '教师已修改审阅意见，等待学生更新'
								});
								console.log('论文状态已从已更新改为待更新');
							} catch (statusErr) {
								console.warn('更新论文状态失败（不影响审阅意见保存）:', statusErr);
							}
						}
					} else {
						// 提交新审阅意见
						console.log('调用 submitPaperReview:', paperId, { review_content: reviewContent });
						await submitPaperReview(paperId, { review_content: reviewContent });
						console.log('审阅意见提交成功');
											
						// 更新论文状态为已审阅（失败不影响主流程）
						try {
							await updatePaperStatus(paperId, {
								status: '已审阅',
								comment: '教师已提交审阅意见'
							});
							console.log('论文状态已更新为已审阅');
						} catch (statusErr) {
							console.warn('更新论文状态失败（不影响审阅意见保存）:', statusErr);
						}
					}
									
					const reviewCommentData = {
						id: 'review_' + paperId,
						content: reviewContent,
						isReviewComment: true,
						source: 'manual',
						type: 'manual',
						author: '审阅意见',
						time: new Date().toLocaleString(),
						createTime: new Date().toISOString()
					};
					const nonReview = (this.currentPaper?.annotations || []).filter((a) => !a.isReviewComment);
					const merged = [reviewCommentData, ...nonReview];
					this.applyAnnotationsToPapers(merged, this.currentPaper);
					
					const sp = this.currentStudent && this.currentStudent.paper;
					const currentStatus = this.currentPaper?.status || sp?.status;
					const newStatus =
						this.editingReviewComment && currentStatus === '已更新' ? '待更新' : '已审阅';
					if (this.currentPaper) {
						this.$set(this.currentPaper, 'status', newStatus);
					}
					if (sp && sp !== this.currentPaper) {
						this.$set(sp, 'status', newStatus);
					}
					
					await this.loadAnnotationList(this.currentStudent, this.currentPaper);
									
					uni.showToast({
						title: this.editingReviewComment ? '审阅意见已更新' : '审阅意见已提交',
						icon: 'success'
					});
									
					this.closeReviewCommentModal();
				} catch (err) {
					console.error('保存审阅意见失败:', err);
					uni.showToast({
						title: '提交失败：' + (err.message || '未知错误'),
						icon: 'none'
					});
				}
			},
			// 删除审阅意见
			async deleteReviewComment() {
				try {
					if (this.currentPaper && this.currentPaper.annotations) {
						const filtered = this.currentPaper.annotations.filter(a => !a.isReviewComment);
						this.$set(this.currentPaper, 'annotations', filtered);
					}
					
					uni.showToast({
						title: '审阅意见已删除',
						icon: 'success'
					});
					
					this.closeReviewCommentModal();
				} catch (err) {
					console.error('删除审阅意见失败:', err);
				}
			},
			// 获取审阅结论文本
			getConclusionText(conclusion) {
				const conclusionMap = {
					'approve': '通过',
					'reject': '不通过',
					'revise': '需修改'
				};
				return conclusionMap[conclusion] || '通过';
			},
			// 获取审阅结论样式类
			getConclusionClass(conclusion) {
				const classMap = {
					'approve': 'conclusion-approve',
					'reject': 'conclusion-reject',
					'revise': 'conclusion-revise'
				};
				return classMap[conclusion] || 'conclusion-approve';
			},
			// 确认定稿 - 支持从论文卡片或审阅界面调用
			async confirmFinalize(student = null, paper = null) {
				const targetStudent = student || this.currentStudent;
				let targetPaper = paper;
				if (!targetPaper && this.showReview && targetStudent === this.currentStudent) {
					targetPaper = this.resolveFinalizeTargetPaperForReview() || this.currentPaper;
				}
				if (!targetPaper) {
					targetPaper = (student ? student.paper : this.currentStudent?.paper) || this.currentPaper;
				}
				
				// 获取论文ID（兼容 paperId 和 id 两种字段名）
				const paperId = targetPaper?.paperId || targetPaper?.id;
				if (!targetPaper || !paperId) {
					uni.showToast({
						title: '论文信息无效',
						icon: 'none'
					});
					return;
				}
				
				// 显示自定义确认弹窗
				this.showFinalizeConfirmModal = true;
				this.finalizeConfirmPaper = targetPaper;
				this.finalizeConfirmStudent = targetStudent;
			},
			// 关闭定稿确认弹窗
			closeFinalizeConfirmModal() {
				this.showFinalizeConfirmModal = false;
				this.finalizeConfirmPaper = null;
				this.finalizeConfirmStudent = null;
			},
			// 执行定稿确认
			async doConfirmFinalize() {
				const targetPaper = this.finalizeConfirmPaper;
				const paperId = targetPaper?.paperId || targetPaper?.id;
				if (!paperId) return;
				
				try {
					await updatePaperStatus(paperId, {
						status: '已定稿',
						comment: '教师已确认定稿'
					});
					
					// 更新本地状态 - 找到 students 中对应的论文并更新（确保响应式）
					this.students.forEach(student => {
						if (student.papers) {
							student.papers.forEach(paper => {
								if ((paper.paperId || paper.id) === paperId) {
									paper.status = '已定稿';
								}
							});
						}
						if (student.paper && (student.paper.paperId || student.paper.id) === paperId) {
							student.paper.status = '已定稿';
						}
					});
					
					// 同时更新 currentPaper（如果在审阅弹窗中）
					if (this.currentPaper && (this.currentPaper.paperId || this.currentPaper.id) === paperId) {
						this.currentPaper.status = '已定稿';
					}
					
					// 更新统计数据
					this.updateStats();
					
					// 先关闭弹窗再显示提示
					this.closeFinalizeConfirmModal();
					
					uni.showToast({
						title: '定稿成功',
						icon: 'success'
					});
				} catch (err) {
					console.error('定稿失败:', err);
					uni.showToast({
						title: '定稿失败，请重试',
						icon: 'none'
					});
				}
			},
			closeFinalizeModal() {
				this.showFinalizeModal = false;
			},
			async doFinalize() {
				try {
					await confirmFinalize(this.currentStudent.paper.id);
					this.currentStudent.paper.status = 'finalized';
					uni.showToast({
						title: '定稿确认成功',
						icon: 'success'
					});
					this.closeFinalizeModal();
				} catch (err) {
					console.error('定稿确认失败:', err);
				}
			},
			// 批量下载（直接下载，不显示弹窗）
			async openBatchDownload() {
				// 获取当前筛选出的所有学生的论文
				const papers = [];
				this.filteredStudents.forEach(card => {
					if (card.paper) {
						const paperId = card.paper.paperId || card.paper.id || card.paper.paper_id;
						if (paperId && !papers.find(p => (p.paperId || p.id || p.paper_id) === paperId)) {
							papers.push(card.paper);
						}
					}
				});
				
				if (papers.length === 0) {
					uni.showToast({ title: '没有可下载的论文', icon: 'none' });
					return;
				}
				
				// 设置批量下载状态
				this.isBatchDownloading = true;
				
				try {
					// 获取用户信息
					const userInfo = uni.getStorageSync('userInfo') || {};
					const currentUser = {
						sub: userInfo.id || userInfo.sub || userInfo.user_id || 0,
						username: userInfo.username || 'teacher',
						roles: ['teacher']
					};
					
					// 提取所有论文ID
					const paperIds = papers.map(p => p.paperId || p.id || p.paper_id).filter(Boolean).join(',');
					
					// 调用批量下载接口
					const res = await batchDownloadPapers(paperIds, { current_user: JSON.stringify(currentUser) });
					
					// 处理响应（ArrayBuffer）
					if (res && res instanceof ArrayBuffer) {
						// 创建 Blob
						const blob = new Blob([res], { type: 'application/zip' });
						
						// 生成文件名
						const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
						const fileName = `批量下载_${papers.length}篇论文_${timestamp}.zip`;
						
						// 创建下载链接
						const url = window.URL.createObjectURL(blob);
						const link = document.createElement('a');
						link.href = url;
						link.download = fileName;
						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);
						
						// 释放 URL 对象
						setTimeout(() => window.URL.revokeObjectURL(url), 1000);
						
						uni.showToast({ title: `已开始下载 ${papers.length} 篇论文`, icon: 'success' });
					} else {
						uni.showToast({ title: '下载失败', icon: 'none' });
					}
				} catch (err) {
					console.error('批量下载失败:', err);
					uni.showToast({ title: '批量下载失败: ' + (err.message || '未知错误'), icon: 'none' });
				} finally {
					this.isBatchDownloading = false;
				}
			},
			// 打开截止日期设置弹窗
			openDeadlineSetting() {
				this.showDeadlineModal = true;
				// 打开弹窗时重新加载最新设置
				this.modalLoading = true;
				this.loadDeadlineSetting();
				// 加载完成后设置modalLoading为false
				this.modalLoading = false;
			},
			// 打开所有班级截止日期汇总
			async openAllDeadlinesSummary() {
				// 添加触感反馈
				uni.vibrateShort();
				try {
					await this.loadAllDeadlinesData();
					this.showAllDeadlinesModal = true;
				} catch (e) {
					console.error('打开汇总弹窗失败:', e);
					uni.showToast({
						title: '加载失败',
						icon: 'none'
					});
				}
			},
			// 加载汇总数据
			async loadAllDeadlinesData() {
				const list = [];
				const classData = this.classList || [];
				
				try {
					// 获取当前教师ID，确保是数字类型
					const userInfo = uni.getStorageSync('userInfo');
					const teacherId = Number(userInfo?.id || 1);
					
					// 构造参数，确保 teacher_id 和 current_user.sub 一致
					const params = { teacher_id: teacherId };
					if (userInfo) {
						params.current_user = JSON.stringify({
							sub: teacherId,
							username: userInfo.username,
							roles: Array.isArray(userInfo.role) ? userInfo.role : [userInfo.role]
						});
					}
					
					// 尝试从接口获取完整列表
					const res = await getDeadlineSetting(params);
					if (res && res.code === 200 && Array.isArray(res.data)) {
						// 将班级数据与截止日期数据进行匹配
						classData.forEach(classItem => {
							const ddlInfo = res.data.find(d => d.class_id === classItem.id);
							list.push({
								classId: classItem.id,
								className: classItem.name || '未知班级',
								deadline: ddlInfo ? ddlInfo.deadline : '未设置'
							});
						});
					} else {
						// 降级：从本地存储汇总
						this.aggregateDeadlinesFromStorage(classData, list);
					}
				} catch (err) {
					console.error('获取所有截止日期失败:', err);
					this.aggregateDeadlinesFromStorage(classData, list);
				}
				
				this.allDeadlinesList = list;
				console.log('加载汇总数据完成:', list.length, '个班级');
			},
			// 封装从本地存储汇总的逻辑
			aggregateDeadlinesFromStorage(classData, list) {
				classData.forEach(classItem => {
					const classId = classItem.id;
					let deadline = uni.getStorageSync(`paper_deadline_${classId}`);
					if (!deadline || deadline === '未设置') {
						deadline = '未设置';
					}
					list.push({
						classId: classId,
						className: classItem.name || '未知班级',
						deadline: deadline
					});
				});
			},
			// 关闭截止日期设置弹窗
			closeDeadlineModal() {
				this.showDeadlineModal = false;
				this.saving = false;
				this.modalLoading = false;
			},
			// DDL加载完成回调
			onDdlLoaded(ddlId) {
				console.log('DDL加载完成:', ddlId);
				this.ddlId = ddlId;
			},
			// DDL删除完成回调
			onDdlDeleted() {
				console.log('DDL已删除');
				this.ddlId = null;
				this.displayDeadline = '未设置';
			},
			// 切换筛选状态（重置页码到第一页）
			switchFilter(filter) {
				this.currentFilter = filter;
				this.currentPage = 1;
				this.showMessageCenter = false;
			},
			// 触发搜索：将输入框值应用到搜索词，并重置到第1页
			doSearch() {
				this.searchKeyword = this.searchInput.trim();
				this.currentPage = 1;
			},
			// 跳转到消息中心
			goToMessageCenter() {
				this.showMessageCenter = true;
				this.currentFilter = 'all';
				this.currentPage = 1;
				this.fetchMessages();
			},
			// 获取消息列表
			async fetchMessages() {
				try {
					const userInfo = uni.getStorageSync('userInfo') || {};
					const currentUser = {
						sub: userInfo.id || userInfo.sub || userInfo.user_id || 0,
						username: userInfo.username || 'teacher',
						roles: ['teacher']
					};
					
					const res = await getMessageList({ filter: this.currentFilter }, currentUser);
					
					// 处理响应数据
					let messageList = [];
					let responseData = res;
					if (res && res.statusCode === 200 && res.data) {
						responseData = res.data;
					}
					
					// 时间格式化函数
					const formatTime = (timeStr) => {
						if (!timeStr) return '刚刚';
						const date = new Date(timeStr);
						if (isNaN(date.getTime())) return timeStr;
						const now = new Date();
						const diff = now - date;
						const minutes = Math.floor(diff / 60000);
						const hours = Math.floor(diff / 3600000);
						const days = Math.floor(diff / 86400000);
						
						if (minutes < 1) return '刚刚';
						if (minutes < 60) return `${minutes}分钟前`;
						if (hours < 24) return `${hours}小时前`;
						if (days < 7) return `${days}天前`;
						return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
					};
					
					if (responseData && Array.isArray(responseData.items)) {
						messageList = responseData.items.map(item => ({
							id: item.id || item.message_id,
							sender: item.sender_name || item.username || '系统',
							content: item.content || '',
							time: formatTime(item.received_time || item.created_at || item.operation_time),
							fullTime: item.received_time || item.created_at || item.operation_time,
							isRead: item.status !== 'unread',
							tags: item.tags || [item.source || '通知'],
							title: item.title || ''
						}));
					} else if (Array.isArray(responseData)) {
						messageList = responseData.map(item => ({
							id: item.id || item.message_id,
							sender: item.sender_name || item.username || '系统',
							content: item.content || '',
							time: formatTime(item.received_time || item.created_at || item.operation_time),
							fullTime: item.received_time || item.created_at || item.operation_time,
							isRead: item.status !== 'unread',
							tags: item.tags || [item.source || '通知'],
							title: item.title || ''
						}));
					}
					
					this.messages = messageList;
				} catch (err) {
					console.error('获取消息列表失败:', err);
					this.messages = [];
				}
			},
			// 标记消息为已读
			markAsRead(msg) {
				msg.isRead = true;
				if (this.unreadMessageCount > 0) {
					this.unreadMessageCount--;
				}
			},
			// 查看消息详情
			viewMessageDetail(msg) {
				console.log('查看消息详情:', msg);
				this.currentMessageDetail = msg;
				this.showMessageDetailModal = true;
				// 如果未读，标记为已读
				if (!msg.isRead) {
					this.markAsRead(msg);
				}
			},
			// 关闭消息详情弹窗
			closeMessageDetailModal() {
				this.showMessageDetailModal = false;
				this.currentMessageDetail = null;
			},
			// 处理搜索
			handleSearch() {
				// 搜索逻辑会在computed filteredStudents中自动处理
			},
			// 清除搜索
			clearSearch() {
				this.searchKeyword = '';
				this.searchInput = '';
			},

			// 滚动到顶部
			scrollToTop() {
				uni.pageScrollTo({
					scrollTop: 0,
					duration: 300
				});
			},
			// 切换深色/浅色模式
			toggleTheme() {
				this.darkMode = !this.darkMode;
				uni.setStorageSync('dark_mode', this.darkMode);
				uni.$emit('theme-change', this.darkMode);
				uni.showToast({
					title: this.darkMode ? '已切换到深色模式' : '已切换到浅色模式',
					icon: 'success',
					duration: 1500
				});
			},
			// 加载主题设置
			loadThemeSetting() {
				try {
					const savedTheme = uni.getStorageSync('dark_mode');
					if (savedTheme !== null) {
						this.darkMode = savedTheme;
					}
				} catch (err) {
					console.error('加载主题设置失败:', err);
				}
			},
			// 加载截止日期设置
			async loadDeadlineSetting() {
				if (!this.selectedClass) {
					this.displayDeadline = '未设置';
					this.ddlId = null;
					return;
				}
				
				const classId = this.selectedClass.id;
				try {
					// 获取当前教师ID，确保是数字类型
					const userInfo = uni.getStorageSync('userInfo');
					const teacherId = Number(userInfo?.id || 1);
					
					// 构造参数，确保 teacher_id 和 current_user.sub 一致
					const params = { teacher_id: teacherId };
					if (userInfo) {
						params.current_user = JSON.stringify({
							sub: teacherId,
							username: userInfo.username,
							roles: Array.isArray(userInfo.role) ? userInfo.role : [userInfo.role]
						});
					}
					
					// 优先从接口加载
					const res = await getDeadlineSetting(params);
					console.log('加载DDL返回结果:', res);
									
					// 兼容多种返回格式：直接数组 / {code:200, data:[]} / {code:200, data:{}}
					let ddlData = null;
					if (Array.isArray(res)) {
						// 直接返回数组
						ddlData = res.find(item => item.teacher_id === teacherId) || res[0] || null;
					} else if (res && res.code === 200 && res.data) {
						if (Array.isArray(res.data)) {
							console.log('teacherId:', teacherId, '数组长度:', res.data.length);
							ddlData = res.data.find(item => item.teacher_id === teacherId) || res.data[0];
						} else {
							ddlData = res.data;
						}
					}
									
					if (ddlData) {
						console.log('加载的ddlData:', ddlData);
						this.ddlId = ddlData.ddlid;
						console.log('设置的ddlId:', this.ddlId);
						// 兼容 ddl_time 和 deadline 字段名
						const ddlTime = ddlData.ddl_time || ddlData.deadline;
						let fullDeadline = ddlTime;
						if (fullDeadline) {
							if (fullDeadline.length <= 10) fullDeadline += ' 23:59:59';
							this.displayDeadline = fullDeadline;
							this.parseDeadlineToUnits(fullDeadline);
						} else {
							this.displayDeadline = '未设置';
						}
						this.remindDayIndex = ddlData.remindDay || 0;
					} else {
						this.displayDeadline = '未设置';
						this.ddlId = null;
						try {
							uni.removeStorageSync(`paper_deadline_${classId}`);
						} catch (e) { /* ignore */ }
					}
				} catch (err) {
					console.error('加载截止日期设置失败:', err);
					this.loadDeadlineFromStorage(classId);
				}
			},
			// 封装从本地存储加载的逻辑
			loadDeadlineFromStorage(classId) {
				let savedDeadline = uni.getStorageSync(`paper_deadline_${classId}`);
				const savedRemindDay = uni.getStorageSync(`paper_remind_day_${classId}`);
				if (savedDeadline) {
					if (savedDeadline.length <= 10 && savedDeadline !== '未设置') {
						savedDeadline += ' 23:59:59';
					}
					this.displayDeadline = savedDeadline;
					this.parseDeadlineToUnits(savedDeadline);
				} else {
					this.displayDeadline = '未设置';
				}
				this.remindDayIndex = savedRemindDay !== null ? savedRemindDay : 3;
				this.ddlId = null;
			},
			// 辅助方法：解析时间字符串到独立变量
			parseDeadlineToUnits(deadlineStr) {
				if (!deadlineStr || deadlineStr === '未设置') return;
				try {
					const parts = deadlineStr.split(' ');
					const datePart = parts[0];
					const timePart = parts[1] || '23:59:59'; // 如果没时间部分，默认深夜
					
					const [y, m, d] = datePart.split('-').map(Number);
					if (!isNaN(y)) this.year = y;
					if (!isNaN(m)) this.month = m;
					if (!isNaN(d)) this.day = d;
					
					const [h, mi, s] = timePart.split(':').map(Number);
					if (!isNaN(h)) this.hour = h;
					if (!isNaN(mi)) this.minute = mi;
					if (!isNaN(s)) this.second = s;
				} catch (e) {
					console.error('时间解析失败:', e);
				}
			},
			// 调整年份
			adjustYear(delta) {
				const newYear = this.year + delta;
				if (newYear >= 2020 && newYear <= 2100) {
					this.year = newYear;
				}
			},
			// 调整月份
			adjustMonth(delta) {
				let newMonth = this.month + delta;
				if (newMonth > 12) {
					newMonth = 1;
					this.adjustYear(1);
				} else if (newMonth < 1) {
					newMonth = 12;
					this.adjustYear(-1);
				}
				this.month = newMonth;
				// 检查当月有效天数
				const maxDay = this.getMaxDay(this.year, this.month);
				if (this.day > maxDay) {
					this.day = maxDay;
				}
			},
			// 调整日期
			adjustDay(delta) {
				const maxDay = this.getMaxDay(this.year, this.month);
				let newDay = this.day + delta;
				if (newDay > maxDay) {
					newDay = 1;
					this.adjustMonth(1);
				} else if (newDay < 1) {
					const prevMonth = this.month - 1 === 0 ? 12 : this.month - 1;
					const prevYear = this.month - 1 === 0 ? this.year - 1 : this.year;
					newDay = this.getMaxDay(prevYear, prevMonth);
					this.adjustMonth(-1);
				}
				this.day = newDay;
			},
			// 调整小时
			adjustHour(delta) {
				let newHour = this.hour + delta;
				if (newHour > 23) {
					newHour = 0;
					this.adjustDay(1);
				} else if (newHour < 0) {
					newHour = 23;
					this.adjustDay(-1);
				}
				this.hour = newHour;
			},
			// 调整分钟
			adjustMinute(delta) {
				let newMinute = this.minute + delta;
				if (newMinute > 59) {
					newMinute = 0;
					this.adjustHour(1);
				} else if (newMinute < 0) {
					newMinute = 59;
					this.adjustHour(-1);
				}
				this.minute = newMinute;
			},
			// 调整秒数
			adjustSecond(delta) {
				let newSecond = this.second + delta;
				if (newSecond > 59) {
					newSecond = 0;
					this.adjustMinute(1);
				} else if (newSecond < 0) {
					newSecond = 59;
					this.adjustMinute(-1);
				}
				this.second = newSecond;
			},
			// 获取指定月份的最大天数
			getMaxDay(year, month) {
				const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
				if (month === 2) {
					// 闰年判断
					if ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) {
						return 29;
					}
				}
				return monthDays[month - 1];
			},
			// 处理日期选择
			handleDeadlineDateChange(e) {
				this.deadlineDate = e.detail.value;
			},
			// 处理时间选择
			handleDeadlineTimeChange(e) {
				const selectedTime = e.detail.value; // 格式 HH:mm
				// 自动补全秒数为 :59
				this.deadlineTime = `${selectedTime}:59`;
			},
			// 减少提醒天数
			decreaseRemindDay() {
				if (this.remindDayIndex > 0) {
					this.remindDayIndex--;
				}
			},
			// 增加提醒天数
			increaseRemindDay() {
				if (this.remindDayIndex < 9) {
					this.remindDayIndex++;
				}
			},
			// 保存截止日期设置
			async saveDeadlineSettings() {
				const fullDeadline = this.fullDeadlinePreview;
				const classId = this.selectedClass?.id;
				
				try {
					this.saving = true;
					
					// 获取教师ID，确保是数字类型
					const userInfo = uni.getStorageSync('userInfo');
					const teacherId = Number(userInfo?.id || 1);
					
					// 直接使用独立的时间单位
					const params = {
						year: String(this.year),
						month: String(this.month),
						day: String(this.day),
						hour: String(this.hour),
						minute: String(this.minute),
						second: String(this.second),
						teacher_id: teacherId,
						group_id: String(classId)
					};
					
					// 添加 current_user 参数（后端需要用于权限验证）
					// 确保 sub 和 teacher_id 一致且都是数字
					if (userInfo) {
						params.current_user = JSON.stringify({
							sub: teacherId,  // 使用 teacherId 确保一致性
							username: userInfo.username,
							roles: Array.isArray(userInfo.role) ? userInfo.role : [userInfo.role]
						});
						console.log('saveDeadlineSettings - teacher_id:', teacherId, 'current_user.sub:', teacherId);
					}
					
					console.log(this.ddlId ? '更新DDL请求参数:' : '创建DDL请求参数:', params);
									
					// 根据是否有ddlId决定是创建还是更新
					let res;
					if (this.ddlId) {
						// 更新现有DDL
						const { updateDeadlineSetting } = await import('@/api/teacher.js');
						res = await updateDeadlineSetting(this.ddlId, params);
						console.log('更新DDL返回结果:', res);
					} else {
						// 创建新DDL
						const { saveDeadlineSetting } = await import('@/api/teacher.js');
						res = await saveDeadlineSetting(params);
						console.log('创建DDL返回结果:', res);
						// 如果接口返回了新创建的ID，保存它
						if (res && res.ddlid) {
							console.log('返回的ddlid:', res.ddlid);
							this.ddlId = res.ddlid;
						}
					}
					
					// 更新显示文本（无论接口返回什么，只要没抛错就更新，抛错由catch处理）
					this.displayDeadline = fullDeadline;
					
					// 同时保存到本地存储（按班级区分）
					if (classId) {
						uni.setStorageSync(`paper_deadline_${classId}`, this.displayDeadline);
						uni.setStorageSync(`paper_remind_day_${classId}`, this.remindDayIndex);
					}
					
					uni.showToast({
						title: this.ddlId ? '更新成功' : '保存成功',
						icon: 'success'
					});

					// 关闭弹窗
					setTimeout(() => {
						this.closeDeadlineModal();
					}, 1000);
				} catch (err) {
					console.error('保存截止日期设置失败:', err);
					uni.showToast({
						title: '保存失败，请重试',
						icon: 'none'
					});
				} finally {
					this.saving = false;
				}
			},
			// 触发删除确认显示
			showDeleteConfirmAction() {
				this.showCustomDeleteModal = true;
			},
			// 执行确认删除
			async confirmDeleteDeadline() {
				const classId = this.selectedClass?.id;
				console.log('删除时 ddlId:', this.ddlId);
				try {
					// 优先调用后端接口删除
					if (this.ddlId) {
						console.log('调用删除接口，ddlid:', this.ddlId);
						// 获取当前教师ID，确保是数字类型
						const userInfo = uni.getStorageSync('userInfo');
						const teacherId = Number(userInfo?.id || 1);
								
						// 构造参数，确保 teacher_id 和 current_user.sub 一致
						const params = {};
						if (userInfo) {
							params.current_user = JSON.stringify({
								sub: teacherId,
								username: userInfo.username,
								roles: Array.isArray(userInfo.role) ? userInfo.role : [userInfo.role]
							});
						}
								
						// 动态导入删除函数
						const { deleteDeadlineSetting } = await import('@/api/teacher.js');
						await deleteDeadlineSetting(this.ddlId, params);
					} else {
						console.log('ddlId 为空，不调用删除接口');
					}
					
					this.displayDeadline = '未设置';
					this.ddlId = null;
					
					if (classId) {
						uni.removeStorageSync(`paper_deadline_${classId}`);
						uni.removeStorageSync(`paper_remind_day_${classId}`);
					}
					this.showCustomDeleteModal = false;
					uni.showToast({ title: '删除成功', icon: 'success' });
				} catch (err) {
					console.error('删除截止日期失败:', err);
					uni.showToast({ title: '删除失败', icon: 'none' });
				}
			},
			async openSingleDownload(student, paper) {
				const currentPaper = paper || student.paper;
				if (!currentPaper) {
					uni.showToast({ title: '论文信息不存在', icon: 'none' });
					return;
				}
				
				// 获取论文ID
				const paperId = currentPaper.paperId || currentPaper.id || currentPaper.paper_id;
				if (!paperId) {
					uni.showToast({ title: '论文ID不存在', icon: 'none' });
					return;
				}
				
				// 设置下载状态
				this.downloadingPaperId = paperId;
				
				try {
					// 获取用户信息
					const userInfo = uni.getStorageSync('userInfo') || {};
					const currentUser = {
						sub: userInfo.id || userInfo.sub || userInfo.user_id || 0,
						username: userInfo.username || 'teacher',
						roles: ['teacher']
					};
					
					// 调用批量下载接口（单篇）
					const res = await batchDownloadPapers(String(paperId), { current_user: JSON.stringify(currentUser) });
					
					// 处理响应（ArrayBuffer）
					if (res && res instanceof ArrayBuffer) {
						// 创建 Blob
						const blob = new Blob([res], { type: 'application/zip' });
						
						// 获取论文标题作为文件名
						const fileName = `${currentPaper.title || '论文'}.zip`;
						
						// 创建下载链接
						const url = window.URL.createObjectURL(blob);
						const link = document.createElement('a');
						link.href = url;
						link.download = fileName;
						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);
						
						// 释放 URL 对象
						setTimeout(() => window.URL.revokeObjectURL(url), 1000);
						
						uni.showToast({ title: '下载已开始', icon: 'success' });
					} else {
						uni.showToast({ title: '下载失败', icon: 'none' });
					}
				} catch (err) {
					console.error('下载失败:', err);
					uni.showToast({ title: '下载失败: ' + (err.message || '未知错误'), icon: 'none' });
				} finally {
					// 清除下载状态
					this.downloadingPaperId = null;
				}
			},
			// 自动触发 AI 评审
			async autoTriggerAIReview(paperId) {
				if (!paperId) return;
				
				this.aiReviewLoading = true;
				try {
					// 先尝试获取现有报告
					const reportRes = await getAIReport(paperId);
					
					if (reportRes && reportRes.code === 200 && reportRes.data && reportRes.data.total > 0) {
						// 已有报告，直接使用
						this.aiReport = reportRes.data;
						this.aiReviewLoading = false;
						return;
					}
					
					// 没有报告，触发 AI 评审
					const triggerRes = await triggerAIReview(paperId);
					if (triggerRes && triggerRes.code === 200) {
						// 触发成功，开始轮询获取结果
						this.startAIReviewPolling(paperId);
					} else {
						this.aiReviewLoading = false;
						console.warn('触发 AI 评审失败:', triggerRes);
					}
				} catch (err) {
					console.error('AI 评审流程失败:', err);
					this.aiReviewLoading = false;
				}
			},
			
			// 开始轮询 AI 评审结果
			startAIReviewPolling(paperId) {
				// 清除之前的轮询
				if (this.aiReviewPolling) {
					clearInterval(this.aiReviewPolling);
				}
				
				let attempts = 0;
				const maxAttempts = 30; // 最多轮询 30 次（约 2.5 分钟）
				
				this.aiReviewPolling = setInterval(async () => {
					attempts++;
					
					try {
						const res = await getAIReport(paperId);
						
						if (res && res.code === 200 && res.data && res.data.total > 0) {
							// 获取到报告，停止轮询
							clearInterval(this.aiReviewPolling);
							this.aiReviewPolling = null;
							this.aiReport = res.data;
							this.aiReviewLoading = false;
							
							uni.showToast({
								title: 'AI 评审完成',
								icon: 'success'
							});
						} else if (attempts >= maxAttempts) {
							// 超过最大尝试次数，停止轮询
							clearInterval(this.aiReviewPolling);
							this.aiReviewPolling = null;
							this.aiReviewLoading = false;
							
							uni.showToast({
								title: 'AI 评审超时，请稍后刷新',
								icon: 'none'
							});
						}
					} catch (err) {
						console.error('轮询 AI 报告失败:', err);
						if (attempts >= maxAttempts) {
							clearInterval(this.aiReviewPolling);
							this.aiReviewPolling = null;
							this.aiReviewLoading = false;
						}
					}
				}, 5000); // 每 5 秒轮询一次
			},
			
			// ========== 查看附件功能 ==========
			// 打开附件弹窗
			async openAttachmentModal(student, paper) {
				uni.vibrateShort();
				this.currentAttachmentStudent = student;
				this.currentAttachmentPaper = paper || student.paper;
				this.showAttachmentModal = true;
				
				// 显示加载状态
				uni.showLoading({ title: '加载中...' });
				
				try {
					// 调用后端接口获取材料列表
					const paperId = paper?.paperId || paper?.id || student?.paper?.paperId || student?.paper?.id || '';
					const res = await uni.request({
						url: config.baseURL + '/api/v1/materials/names',
						method: 'GET',
						data: {
							paper_id: paperId, // 添加 paper_id 参数
							name: student.studentNumber || student.number || student.name || '', // 按学号筛选（接口uploader_name存的是学号）
							file_type: '', // 不限制文件类型
							keyword: '' // 不限制关键词
						}
					});
					
					uni.hideLoading();
					
					if (res.statusCode === 200 && res.data) {
						const data = res.data;
						// 转换后端数据格式
						console.log('材料列表接口返回:', data);
						if (data.files && data.files.length > 0) {
							this.attachmentList = data.files.map(file => {
								console.log('单个文件数据:', JSON.stringify(file));
								console.log('storage_path 值:', file.storage_path);
								console.log('storagePath 值:', file.storagePath);
								const result = {
									id: file.id,
									name: file.filename,
									size: this.formatFileSize(file.size || 0),
									url: file.url || '#',
									type: file.file_type,
									uploadTime: file.upload_time,
									uploader: file.uploader_name,
									version: file.version,
									storagePath: file.storage_path || file.storagePath || null // 兼容两种字段名
								};
								console.log('映射后的 storagePath:', result.storagePath);
								return result;
							});
						} else {
							this.attachmentList = [];
						}
					} else {
						this.attachmentList = [];
						uni.showToast({ title: '获取附件列表失败', icon: 'none' });
					}
				} catch (error) {
					uni.hideLoading();
					console.error('获取附件列表失败:', error);
					this.attachmentList = [];
					uni.showToast({ title: '获取附件列表失败', icon: 'none' });
				}
			},
			
			// 格式化文件大小
			formatFileSize(bytes) {
				if (!bytes || bytes === 0) return '0 B';
				const k = 1024;
				const sizes = ['B', 'KB', 'MB', 'GB'];
				const i = Math.floor(Math.log(bytes) / Math.log(k));
				return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
			},
			
			// 根据文件类型返回图标
			getFileIcon(type) {
				const iconMap = {
					'document': 'description',
					'pdf': 'picture_as_pdf',
					'image': 'image',
					'video': 'videocam',
					'audio': 'audiotrack',
					'zip': 'folder_zip',
					'code': 'code',
					'essay': 'article'
				};
				return iconMap[type] || 'insert_drive_file';
			},
			
			// 下载附件
			downloadAttachment(file) {
				// 如果是本地文件，直接打开
				if (file.url && file.url.startsWith('/static/')) {
					window.open(file.url, '_blank');
					return;
				}
				
				uni.showToast({
					title: `开始下载: ${file.name}`,
					icon: 'none'
				});
				// TODO: 实现实际的下载逻辑
				// uni.downloadFile({
				//     url: file.url,
				//     success: (res) => { ... }
				// });
			},
			// 预览附件
			async previewAttachment(file) {
				uni.vibrateShort();
				
				// 如果是本地文件，直接在新窗口打开
				if (file.url && file.url.startsWith('/static/')) {
					window.open(file.url, '_blank');
					return;
				}
				
				this.currentPreviewAttachment = file;
				this.showAttachmentPreviewModal = true;
				this.isPreviewLoading = true;
				this.previewError = null;
				
				// 检查文件类型是否支持预览
				const ext = file.name?.split('.').pop()?.toLowerCase();
				const supportedExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'pdf', 'docx'];
				
				if (!supportedExts.includes(ext)) {
					// 不支持的文件类型，直接显示不支持提示
					this.isPreviewLoading = false;
					return;
				}
				
				// 如果是 docx 文件，使用 docx-preview 渲染
				if (ext === 'docx') {
					await this.loadAndRenderDocx(file);
				} else {
					// PDF、图片等其他类型直接关闭 loading，让对应分支渲染
					this.isPreviewLoading = false;
				}
			},
			
			// 加载并渲染 docx 附件
			async loadAndRenderDocx(file) {
				try {
					this.isPreviewLoading = true;
					this.previewError = null;
					
					console.log('loadAndRenderDocx - file:', file);
					console.log('loadAndRenderDocx - storagePath:', file.storagePath);
					
					// 检查是否有 storagePath
					if (!file.storagePath) {
						throw new Error('文件路径不可用，请下载后查看');
					}
					
					// 使用 storagePath 构建可访问的 URL
					let fileUrl;
					if (file.storagePath.startsWith('http')) {
						fileUrl = file.storagePath;
					} else if (file.storagePath.startsWith('/root/') || file.storagePath.startsWith('/home/')) {
						// 绝对路径：提取文件名，拼接静态服务路径
						const fileName = file.storagePath.split('/').pop();
						fileUrl = `${config.baseURL}/doc/attachment/${fileName}`;
					} else {
						fileUrl = `${config.baseURL}/${file.storagePath}`;
					}
					
					console.log('loadAndRenderDocx - fileUrl:', fileUrl);
					
					// 获取文件内容
					const response = await fetch(`${fileUrl}?t=${Date.now()}`);
					if (!response.ok) {
						if (response.status === 404) {
							throw new Error('文件不存在（404），可能已被删除或路径错误');
						}
						throw new Error(`HTTP ${response.status}: ${response.statusText}`);
					}
					
					// 获取 ArrayBuffer
					const arrayBuffer = await response.arrayBuffer();
					
					// 创建 Blob
					const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
									
					// 先关闭 loading，让 isDocxFile 分支渲染出容器，再执行渲染
					this.isPreviewLoading = false;
									
					this.$nextTick(async () => {
						// 等待容器节点出现（最多重试 20 次，每次 100ms）
						let container = null;
						for (let i = 0; i < 20; i++) {
							container = document.getElementById('attachment-docx-preview');
							if (container) break;
							await new Promise(r => setTimeout(r, 100));
						}
						if (container) {
							this.renderAttachmentDocx(blob);
						} else {
							this.previewError = '预览容器未找到，请重试';
						}
					});
					
				} catch (err) {
					console.error('加载 docx 附件失败:', err);
					this.previewError = `${err.message}`;
					this.isPreviewLoading = false;
				}
			},
			
			// 使用 docx-preview 渲染附件
			async renderAttachmentDocx(blob) {
				try {
					const docxPreview = await import('docx-preview');
					const container = document.getElementById('attachment-docx-preview');
					
					if (!container) {
						console.warn('docx-preview 容器不存在');
						this.previewError = '预览容器未找到';
						this.isPreviewLoading = false;
						return;
					}
					
					// 清空容器
					container.innerHTML = '';
					
					// 渲染 docx
					await docxPreview.renderAsync(blob, container, null, {
						className: 'docx-preview-wrapper',
						inWrapper: true,
						ignoreWidth: false,
						ignoreHeight: false,
						ignoreFonts: false,
						breakPages: true,
						ignoreLastRenderedPageBreak: true,
						trimXmlDeclaration: true,
						useBase64URL: false,
						renderChanges: false,
						renderComments: false
					});
					
					this.isPreviewLoading = false;
					
				} catch (err) {
					console.error('渲染 docx 附件失败:', err);
					this.previewError = `渲染失败: ${err.message}`;
					this.isPreviewLoading = false;
				}
			},
			// 预览加载完成
			onPreviewLoad() {
				this.isPreviewLoading = false;
			},
			// 预览加载失败
			onPreviewError() {
				this.isPreviewLoading = false;
				this.previewError = '预览加载失败，请尝试下载后查看';
			},
			
			// 关闭附件预览弹窗
			closeAttachmentPreview() {
				this.showAttachmentPreviewModal = false;
				this.currentPreviewAttachment = null;
				this.isPreviewLoading = false;
				this.previewError = null;
			},
			
			// 下载当前预览的附件
			downloadCurrentAttachment() {
				if (!this.currentPreviewAttachment) return;
				
				const file = this.currentPreviewAttachment;
				
				// 如果有 storagePath，构建下载链接
				if (file.storagePath) {
					let fileUrl;
					if (file.storagePath.startsWith('http')) {
						fileUrl = file.storagePath;
					} else if (file.storagePath.startsWith('/root/') || file.storagePath.startsWith('/home/')) {
						const fileName = file.storagePath.split('/').pop();
						fileUrl = `${config.baseURL}/doc/attachment/${fileName}`;
					} else {
						fileUrl = `${config.baseURL}/${file.storagePath}`;
					}
					
					// 创建临时链接下载
					const link = document.createElement('a');
					link.href = fileUrl;
					link.download = file.name || 'download';
					link.target = '_blank';
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				} else if (file.url) {
					// 使用 file.url 下载
					const link = document.createElement('a');
					link.href = file.url;
					link.download = file.name || 'download';
					link.target = '_blank';
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				} else {
					uni.showToast({ title: '下载链接不可用', icon: 'none' });
				}
			},
			
			// ========== 富文本编辑器核心修复方法 ==========
			// 编辑器初始化（新增）
			initEditor() {
				if (uni.createSelectorQuery) {
					uni.createSelectorQuery().in(this).select('#rich-text-editor').context(res => {
						if (res.context) {
							this.editorCtx = res.context;
							console.log('编辑器初始化成功');
							// 编辑器上下文准备好后，立即设置内容（避免闪烁）
							if (this.annotationForm.content) {
								this.editorCtx.setContents({
									html: this.annotationForm.content,
									success: () => {
										console.log('编辑器内容设置成功');
									},
									fail: (err) => {
										console.error('编辑器内容设置失败:', err);
									}
								});
							}
						}
					}).exec();
				}
			},
			
			// 编辑器就绪事件（新增）
			onEditorReady() {
				this.initEditor();
			},
			
			// 编辑器输入事件（新增：添加链接自动转换）
			onEditorInput(e) {
				let html = e.detail.html;
				
				// 正则匹配纯文本链接并转换为<a>标签
				const urlRegex = /(https?:\/\/[^\s]+)/g;
				html = html.replace(urlRegex, '<a href="$1" target="_blank" style="color: #1890ff;">$1</a>');
				
				this.annotationForm.content = html;
			},
			
			// 编辑器键盘事件（新增：处理列表自动续接）
			onEditorKeydown(e) {
				// 仅处理Enter键
				if (e.keyCode !== 13) return;
				
				// 获取当前光标位置的文本
				this.editorCtx.getSelectionText({
					success: (res) => {
						const selectedText = res.text;
						const content = this.annotationForm.content;
						const cursorPos = this.editorCtx.getCursorPosition();
						
						// 处理无序列表
						if (this.currentFormat.unorderedList) {
							this.handleUnorderedListEnter(content, cursorPos);
						}
					}
				});
			},
			
			// 处理无序列表Enter键
			handleUnorderedListEnter(content, cursorPos) {
				// 获取当前行文本
				const lines = content.split('\n');
				const currentLine = lines[cursorPos.line - 1];
				
				// 检查是否为无序列表行
				const unorderedListRegex = /^•\s/;
				const match = currentLine.match(unorderedListRegex);
				
				if (match) {
					// 插入新的无序列表项
					const newLine = `\n• `;
					this.insertTextAtCursor(newLine);
				} else if (currentLine.trim() === '') {
					// 如果当前行为空，关闭列表模式
					this.currentFormat.unorderedList = false;
				}
			},
			
			// 在光标位置插入文本
			insertTextAtCursor(text) {
				this.editorCtx.insertText({
					text: text,
					success: () => {
						// 插入后移动光标
						this.editorCtx.setCursorPosition({
							line: this.editorCtx.getCursorPosition().line + 1,
							ch: text.length
						});
					}
				});
			},
			
			// 富文本格式化方法（核心修复）
			formatText(type) {
				if (!this.editorCtx) {
					this.initEditor();
					// 延迟执行确保编辑器已初始化
					setTimeout(() => {
						this.formatText(type);
					}, 100);
					return;
				}
				
				try {
					switch (type) {
						case 'bold':
							this.currentFormat.bold = !this.currentFormat.bold;
							this.editorCtx.format('bold');
							break;
						case 'italic':
							this.currentFormat.italic = !this.currentFormat.italic;
							this.editorCtx.format('italic');
							break;
						case 'underline':
							this.currentFormat.underline = !this.currentFormat.underline;
							this.editorCtx.format('underline');
							break;
						case 'unorderedList':
							this.currentFormat.unorderedList = !this.currentFormat.unorderedList;
							if (this.currentFormat.unorderedList) {
								// 开启无序列表时，在当前光标位置插入"• "
								this.insertTextAtCursor('• ');
							}
							break;
					}
				} catch (e) {
					console.error('格式化失败:', e);
					// 降级方案：使用uni.setEditorContent
					this.fallbackFormatText(type);
				}
			},
			
			// 格式化降级方案（新增）
			fallbackFormatText(type) {
				const formatMap = {
					'bold': 'bold',
					'italic': 'italic',
					'underline': 'underline',
					'unorderedList': 'insertUnorderedList'
				};
				
				uni.setEditorContent({
					editorId: 'rich-text-editor',
					action: 'format',
					value: formatMap[type]
				});
			},
			
			// 插入链接（修复核心）
			insertLink() {
				if (!this.editorCtx) {
					this.initEditor();
					return;
				}
				
				// 使用原生prompt获取链接地址，兼容性更好
				const linkUrl = prompt('请输入链接地址', 'https://');
				if (linkUrl) {
					try {
						// 尝试使用编辑器API插入链接
						this.editorCtx.insertLink({
							url: linkUrl,
							text: linkUrl,
							success: () => {
								console.log('链接插入成功');
								// 同步更新annotationForm.content
								this.editorCtx.getContents({
									success: (res) => {
										this.annotationForm.content = res.html;
									}
								});
							},
							fail: (err) => {
								console.error('编辑器API插入链接失败:', err);
								// 降级方案：直接拼接HTML并插入
								this.fallbackInsertLink(linkUrl);
							}
						});
					} catch (e) {
						console.error('调用编辑器API异常:', e);
						// 降级方案：直接拼接HTML并插入
						this.fallbackInsertLink(linkUrl);
					}
				}
			},
			
			// 降级插入链接的方法
			fallbackInsertLink(url) {
				const linkHTML = `<a href="${url}" target="_blank">${url}</a>`;
				// 获取当前编辑器内容
				this.editorCtx.getContents({
					success: (res) => {
						// 直接在现有内容末尾追加链接
						const newContent = res.html + linkHTML;
						this.editorCtx.setContents({
							html: newContent,
							success: () => {
								console.log('降级方案插入链接成功');
								// 同步更新annotationForm.content
								this.annotationForm.content = newContent;
							}
						});
					}
				});
			},
			
			// 更新统计数据（兼容 papers 数组格式，使用中文状态值）
			updateStats() {
				let total = 0, pending = 0, pendingUpdate = 0, finalized = 0;
				this.students.forEach(student => {
					total++;
					// 获取所有论文（兼容 paper 和 papers 两种数据结构）
					let papers = [];
					if (student.papers && student.papers.length > 0) {
						papers = student.papers;
					} else if (student.paper) {
						papers = [student.paper];
					}
					// 统计该学生所有论文的状态（新状态体系）
					papers.forEach(paper => {
						// 待审阅包含：原待审阅 + 原已更新
						if (paper.status === '待审阅' || paper.status === '已更新') pending++;
						// 待修改包含：原待更新 + 原已审阅
						else if (paper.status === '待更新' || paper.status === '已审阅') pendingUpdate++;
						else if (paper.status === '已定稿') finalized++;
					});
				});
				this.stats = {
					totalStudents: total,
					pendingReview: pending, // 待审阅数量（原待审阅+原已更新）
					pendingUpdate: pendingUpdate, // 待修改数量（原待更新+原已审阅）
					finalized: finalized // 已定稿数量
				};
			},
			
			// 获取模拟学生数据（已弃用，保留空方法以兼容旧代码）
			getMockStudents() {
				return [];
			},
			// 用户卡片鼠标进入（取消延迟隐藏）
			onUserCardEnter() {
				if (this._userCardHideTimer) {
					clearTimeout(this._userCardHideTimer);
					this._userCardHideTimer = null;
				}
				// 延迟300ms显示，防止快速滑过时的闪烁
				this._userCardShowTimer = setTimeout(() => {
					this.showUserCard = true;
				}, 300);
			},
			// 用户卡片鼠标离开（延迟1.5秒再隐藏，给用户足够时间点击）
			onUserCardLeave() {
				if (this._userCardShowTimer) {
					clearTimeout(this._userCardShowTimer);
					this._userCardShowTimer = null;
				}
				this._userCardHideTimer = setTimeout(() => {
					this.showUserCard = false;
				}, 1500);
			},
			// 跳转到个人中心
			goToProfile() {
				uni.navigateTo({url: '/pages/teacher/profile'});
			},
			// 跳转到修改密码页面
			openChangePassword() {
				this.showUserCard = false;
				this.showPasswordModal = true;
			},
			// 关闭修改密码弹窗
			closePasswordModal() {
				this.showPasswordModal = false;
				this.passwordForm = { oldPassword: '', newPassword: '', confirmPassword: '' };
				this.passwordError = '';
			},
			// 提交修改密码
			async submitChangePassword() {
				const { oldPassword, newPassword, confirmPassword } = this.passwordForm;
				
				// 密码表单验证
				if (!oldPassword) {
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
				if (oldPassword === newPassword) {
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
						old_password: oldPassword,
						new_password: newPassword
					});
					
					uni.hideLoading();
					
					// 判断修改成功
					if (res && (res.message?.includes('成功') || res.code === 200)) {
						uni.showToast({ title: '密码修改成功，请重新登录', icon: 'success', duration: 2000 });
						this.closePasswordModal();
						setTimeout(() => {
							logout();
							uni.reLaunch({url: '/pages/index/index'});
						}, 2000);
					} else {
						this.passwordError = res?.detail || res?.message || '密码修改失败';
					}
				} catch (err) {
					uni.hideLoading();
					this.passwordError = err?.message || err?.detail || '密码修改失败，请检查输入后重试';
				}
			},
			// 显示退出确认对话框
			showLogoutConfirm() {
				this.showUserCard = false;
				this.showLogoutConfirmModal = true;
			},
			// 退出登录
			async logout() {
				try {
					await logout();
					uni.removeStorageSync('token');
					uni.removeStorageSync('userInfo');
					uni.removeStorageSync('userRole');
					uni.removeStorageSync('rememberedUsername');
					uni.showToast({
						title: '已退出登录',
						icon: 'success'
					});
					setTimeout(() => {
						uni.reLaunch({url: '/pages/index/index'});
					}, 1000);
				} catch (err) {
					console.error('退出登录失败:', err);
					// 即使接口失败也清除本地数据
					uni.removeStorageSync('token');
					uni.removeStorageSync('userInfo');
					uni.removeStorageSync('userRole');
					uni.reLaunch({url: '/pages/index/index'});
				}
			}
		},
		onPageScroll(e) {
			this.showBackToTop = e.scrollTop > 300;
		}
	}
</script>
<style scoped>
/* ============================================
   The Academic Curator - Design System
   完整样式定义
   ============================================ */

/* CSS Variables */
.dashboard-container {
  --primary: #005bbf;
  --primary-container: #1a73e8;
  --surface: #f8f9fa;
  --surface-container-low: #f3f4f5;
  --surface-container-lowest: #ffffff;
  --surface-container-high: #e7e8e9;
  --surface-variant: #e1e3e4;
  --on-surface: #191c1d;
  --on-surface-variant: #414754;
  --outline: #727785;
  --outline-variant: #c1c6d6;
  --error: #ba1a1a;
  --error-container: #ffdad6;
  --tertiary: #006a5f;
  --tertiary-container: #008678;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--surface);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Material Symbols */
.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  vertical-align: middle;
}

/* Sidebar */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 256px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 40;
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  margin-bottom: 32px;
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
  font-size: 16px;
  font-weight: 800;
  color: var(--primary);
  line-height: 1.2;
}

.brand-subtitle {
  font-size: 9px;
  font-weight: 600;
  color: var(--on-surface-variant);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-top: 2px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-nav.secondary {
  margin-top: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.5);
  color: var(--primary);
  transform: translateX(4px);
}

.nav-item.active {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 91, 191, 0.3);
}

.nav-item .material-symbols-outlined {
  font-size: 20px;
}

.nav-label {
  font-size: 14px;
  font-weight: 500;
}

.nav-badge {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  min-width: 20px;
  height: 20px;
  background: var(--error);
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
}

.sidebar-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--outline-variant), transparent);
  margin: 16px 12px;
}

.sidebar-footer {
  margin-top: 20px;
  padding: 0 8px;
}

.upload-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 91, 191, 0.25);
  transition: all 0.2s ease;
}

.upload-btn:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 16px rgba(0, 91, 191, 0.35);
}

.upload-btn:active {
  transform: scale(0.98);
}

.upload-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
}

.upload-btn.downloading {
  background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%);
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.25);
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 0;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.main-content.with-sidebar {
  margin-left: 256px;
}

/* Top Header */
.top-header {
  height: 64px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  position: sticky;
  top: 0;
  z-index: 30;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--on-surface);
  letter-spacing: -0.02em;
}

.header-divider {
  width: 1px;
  height: 16px;
  background: var(--outline-variant);
}

.header-nav {
  display: flex;
  gap: 24px;
}

.nav-link {
  font-size: 14px;
  font-weight: 500;
  color: var(--on-surface-variant);
  cursor: pointer;
  transition: color 0.2s;
}

.nav-link:hover,
.nav-link.active {
  color: var(--primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.notification-icon {
  position: relative;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
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
  border: 2px solid white;
}

/* Profile */
.profile-btn-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 6px 12px 6px 6px;
  border-radius: 24px;
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
}

.profile-info {
  display: flex;
  flex-direction: column;
}

.profile-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--on-surface);
}

.profile-role {
  font-size: 11px;
  color: var(--on-surface-variant);
}

/* User Card */
.user-info-card {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 280px;
  background: white;
  border-radius: 16px;
  box-shadow: var(--shadow-xl);
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
  padding: 20px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-card-avatar {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: 600;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.user-card-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-size: 15px;
  font-weight: 600;
  color: white;
}

.user-id {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.user-role-badge {
  display: inline-flex;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  font-size: 11px;
  color: white;
  font-weight: 500;
  width: fit-content;
}

.user-card-menu {
  padding: 8px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 14px;
  color: var(--on-surface);
}

.menu-item:hover {
  background: var(--surface-container-low);
}

.menu-item.logout {
  color: var(--error);
}

.menu-item.logout:hover {
  background: var(--error-container);
}

.menu-item .material-symbols-outlined {
  font-size: 18px;
  color: var(--on-surface-variant);
}

.menu-item.logout .material-symbols-outlined {
  color: var(--error);
}

/* Content Canvas */
.content-canvas {
  flex: 1;
  padding: 24px 32px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Page Header */
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--on-surface);
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 15px;
  color: var(--on-surface-variant);
  margin: 0;
}

.page-subtitle .highlight {
  color: var(--primary);
  font-weight: 700;
}

.view-toggle {
  display: flex;
  background: var(--surface-container-high);
  padding: 4px;
  border-radius: 12px;
}

.toggle-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--on-surface-variant);
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: white;
  color: var(--primary);
  box-shadow: var(--shadow-sm);
}

/* Thesis View */
.thesis-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Bento Filter */
.bento-filter-bar {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 12px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.filter-card {
  background: white;
  padding: 12px 16px;
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-card:hover {
  box-shadow: var(--shadow);
  transform: translateY(-1px);
}

.filter-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-icon.primary {
  background: rgba(0, 91, 191, 0.1);
  color: var(--primary);
}

.filter-icon.secondary {
  background: var(--surface-container-low);
  color: var(--on-surface-variant);
}

.filter-icon .material-symbols-outlined {
  font-size: 24px;
}

.filter-info {
  display: flex;
  flex-direction: column;
}

.filter-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--on-surface);
}

.search-card {
  cursor: default;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: var(--on-surface);
  outline: none;
}


.search-input::placeholder {
  color: var(--outline);
}

/* Thesis List */
.thesis-list-container {
  background: var(--surface-container-low);
  border-radius: 24px;
  padding: 16px;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: var(--on-surface-variant);
}

.loading-icon {
  font-size: 48px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 16px;
}

/* Thesis Cards */
.thesis-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  overflow: hidden;
}

.thesis-card {
  background: white;
  border-radius: 16px;
  padding: 12px 16px;
  display: grid;
  grid-template-columns: 180px 1fr 140px;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  min-height: 100px;
}

.thesis-card:hover {
  border-color: rgba(0, 91, 191, 0.2);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

/* Card Sections */
.card-avatar-section {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.student-avatar {
  position: relative;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: 700;
}

.status-indicator {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 3px solid white;
}

.status-indicator.pending { background: #f59e0b; }
.status-indicator.feedback { background: var(--tertiary); }
.status-indicator.updated { background: #3b82f6; }
.status-indicator.pending_update { background: #8b5cf6; }
.status-indicator.finalized { background: #10b981; }

.student-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.student-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--on-surface);
}

.student-id {
  font-size: 12px;
  color: var(--on-surface-variant);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  width: fit-content;
  margin-top: 8px;
}

.status-badge.pending { background: #fef3c7; color: #92400e; }
.status-badge.feedback { background: #d1fae5; color: #065f46; }
.status-badge.updated { background: #dbeafe; color: #1e40af; }
.status-badge.pending_update { background: #ede9fe; color: #5b21b6; }
.status-badge.finalized { background: #d1fae5; color: #065f46; }
.status-badge.status-unuploaded { background: #f3f4f6; color: #6b7280; }

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

/* Card Detail */
.card-detail-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-header {
  margin-bottom: 4px;
}

.detail-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--outline);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.paper-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--on-surface);
  line-height: 1.4;
}

.paper-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 8px;
}

.meta-item--update-time {
  max-width: 100%;
}

.meta-item--update-time > text:last-child {
  word-break: break-all;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--surface-container-low);
  border-radius: 8px;
  font-size: 12px;
  color: var(--on-surface-variant);
}

.meta-item .material-symbols-outlined {
  font-size: 16px;
}

.card-detail-section.unuploaded {
  justify-content: center;
}

.unuploaded-text {
  font-size: 14px;
  color: var(--outline);
  font-style: italic;
}

/* Card Actions */
.card-action-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  min-width: 140px;
}

.action-btn.primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 91, 191, 0.25);
}

.action-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 91, 191, 0.35);
}

.action-btn.secondary {
  background: rgba(0, 106, 95, 0.1);
  color: var(--tertiary);
  border: 1px solid rgba(0, 106, 95, 0.2);
}

.action-btn.secondary:hover {
  background: rgba(0, 106, 95, 0.15);
}

.action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
}

.action-btn.primary.downloading {
  background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%);
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.25);
}

.action-btn .material-symbols-outlined {
  font-size: 16px;
}

/* Class Selection */
.class-selection-view {
  max-width: 1200px;
}

.class-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.class-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: var(--shadow-sm);
}

.class-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.class-header {
  margin-bottom: 20px;
}

.class-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0 0 4px 0;
}

.class-code {
  font-size: 13px;
  color: var(--on-surface-variant);
}

.class-stats {
  display: flex;
  gap: 16px;
}

.stat-box {
  flex: 1;
  background: var(--surface-container-low);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 28px;
  font-weight: 800;
  color: var(--primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--on-surface-variant);
  font-weight: 500;
}

/* Modals */
.custom-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

/* 定稿确认弹窗 - 更高层级确保不被覆盖 */
.finalize-confirm-mask {
  z-index: 10001;
}

/* 选中文本提示：置于所有业务弹窗之上（含审阅全屏弹窗） */
.select-text-hint-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  box-sizing: border-box;
}

.select-text-hint-dialog {
  width: 100%;
  max-width: 360px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.35);
}

.select-text-hint-title {
  padding: 20px 20px 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--on-surface);
}

.select-text-hint-body {
  padding: 16px 20px 24px;
  font-size: 15px;
  line-height: 1.55;
  color: var(--on-surface-variant);
}

.select-text-hint-footer {
  border-top: 1px solid var(--surface-container-high);
}

.select-text-hint-btn {
  padding: 16px;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: var(--primary);
  cursor: pointer;
}

.select-text-hint-btn:active {
  background: rgba(0, 91, 191, 0.08);
}

.finalize-confirm-modal {
  background: white;
  border-radius: 14px;
  width: 320px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.finalize-confirm-body {
  padding: 20px;
  text-align: center;
}

.finalize-confirm-text {
  font-size: 15px;
  color: var(--on-surface);
  line-height: 1.5;
}

.custom-modal-content {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: var(--shadow-xl);
}

.custom-modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--surface-container-high);
  font-size: 18px;
  font-weight: 700;
  color: var(--on-surface);
  display: flex;
  align-items: center;
  gap: 12px;
}

.custom-modal-header .material-symbols-outlined {
  color: var(--primary);
}

.custom-modal-body {
  padding: 24px;
  font-size: 15px;
  color: var(--on-surface-variant);
}

.custom-modal-footer {
  display: flex;
  border-top: 1px solid var(--surface-container-high);
}

.modal-btn {
  flex: 1;
  padding: 16px;
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.modal-btn.cancel {
  color: var(--on-surface-variant);
  border-right: 1px solid var(--surface-container-high);
}

.modal-btn.cancel:hover {
  background: #f0f0f0;
}

.modal-btn.confirm {
  color: var(--primary);
}

.modal-btn.confirm:hover {
  background: rgba(0, 91, 191, 0.08);
}

/* 删除弹窗取消按钮：红字无背景hover */
.modal-btn.cancel.danger-cancel {
  color: #ef4444;
}

.modal-btn.cancel.danger-cancel:hover {
  background: transparent;
  cursor: default;
}

.modal-btn.confirm.danger {
  color: #ef4444 !important;
  background: transparent;
}

.modal-btn.confirm.danger:hover {
  background: rgba(239, 68, 68, 0.08) !important;
}

/* 修改密码弹窗样式 - 与学生页面保持一致 */
.password-modal-content {
  max-width: 400px !important;
}

.password-modal-content .modal-body {
  padding: var(--spacing-8);
}

.password-modal-content .form-item {
  margin-bottom: var(--spacing-6);
}

.password-modal-content .form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--on-surface);
  margin-bottom: var(--spacing-3);
  font-family: var(--font-body);
}

.password-modal-content .form-input {
  width: 100%;
  height: 48px;
  padding: 0 var(--spacing-4);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-family: var(--font-body);
  background: var(--surface-container-lowest);
  transition: all 0.2s ease;
}

.password-modal-content .form-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 91, 191, 0.1);
  outline: none;
}

.password-modal-content .form-tips {
  margin-top: var(--spacing-5);
  padding: var(--spacing-4);
  background: var(--amber-tint);
  border-radius: var(--radius-md);
}

.password-modal-content .form-tips.error-tips {
  background: var(--error-container);
}

.password-modal-content .tips-text {
  font-size: 0.875rem;
  color: var(--on-amber);
}

.password-modal-content .tips-text.error-text {
  color: var(--on-error-container);
}

.password-modal-content .modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4) var(--spacing-5);
  background: var(--surface-container-low);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  min-height: 56px;
}

.password-modal-content .modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  font-family: var(--font-body);
  color: var(--on-surface);
}

.password-modal-content .modal-close {
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

.password-modal-content .modal-close:hover {
  color: var(--on-surface);
  background: var(--surface-container-high);
}

.password-modal-content .modal-footer {
  display: flex;
  border-top: 1px solid var(--surface-container-high);
}

.password-modal-content .btn {
  flex: 1;
  padding: 16px;
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.password-modal-content .btn-cancel {
  color: var(--on-surface-variant);
  border-right: 1px solid var(--surface-container-high);
}

.password-modal-content .btn-cancel:hover {
  background: #f0f0f0;
}

.password-modal-content .btn-confirm {
  color: var(--primary);
}

.password-modal-content .btn-confirm:hover {
  background: rgba(0, 91, 191, 0.08);
}

/* 审阅弹窗样式 */
.review-modal-mask {
  align-items: flex-start;
  padding-top: 40px;
  padding-bottom: 40px;
}

.review-modal-content {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 1400px;
  height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.review-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--surface-container-high);
  flex-shrink: 0;
}

.review-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.review-student-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--on-surface);
}

.review-paper-title {
  font-size: 14px;
  color: var(--on-surface-variant);
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.review-version-badge {
  background: var(--primary-container);
  color: var(--primary);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.review-close-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: var(--surface-container-low);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.review-close-btn:hover {
  background: var(--surface-container-high);
}

.review-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: var(--surface-container-lowest);
  border-bottom: 1px solid var(--surface-container-high);
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.ai-summary-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.ai-summary-toggle:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.ai-summary-toggle .toggle-icon {
  transition: transform 0.2s;
}

.ai-summary-toggle .toggle-icon.rotated {
  transform: rotate(180deg);
}

.toolbar-center {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  background: white;
  color: var(--on-surface);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toolbar-btn:hover {
  background: var(--surface-container-low);
}

.toolbar-btn.primary {
  background: var(--primary);
  color: white;
}

.toolbar-btn.primary:hover {
  background: #004a9f;
}

.toolbar-btn.finalize-toolbar-btn {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: #fff;
  box-shadow: 0 1px 3px rgba(9, 109, 217, 0.35);
}

.toolbar-btn.finalize-toolbar-btn:hover {
  background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
  color: #fff;
}

.toolbar-btn.finalize-toolbar-btn .material-symbols-outlined {
  font-size: 18px;
}

.zoom-level {
  font-size: 14px;
  font-weight: 600;
  color: var(--on-surface);
  min-width: 50px;
  text-align: center;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: var(--outline-variant);
}

.page-info {
  font-size: 13px;
  color: var(--on-surface-variant);
}

.word-count {
  font-size: 13px;
  color: var(--on-surface-variant);
}

.review-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.ai-summary-panel {
  width: 300px;
  background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);
  border-right: 1px solid var(--surface-container-high);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.ai-summary-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--surface-container-high);
  font-size: 14px;
  font-weight: 700;
  color: var(--on-surface);
}

.ai-summary-header .material-symbols-outlined {
  color: #667eea;
}

.ai-summary-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.summary-text {
  font-size: 13px;
  line-height: 1.7;
  color: var(--on-surface-variant);
}

.summary-placeholder {
  font-size: 13px;
  color: var(--on-surface-variant);
  text-align: center;
  padding: 40px 20px;
}

.ai-agent-primary-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px 14px;
  margin-bottom: 12px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(102, 126, 234, 0.35);
}

.ai-agent-primary-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

.ai-agent-primary-btn .material-symbols-outlined {
  font-size: 18px;
}

.ai-agent-hint {
  display: block;
  font-size: 11px;
  line-height: 1.5;
  color: var(--on-surface-variant);
  margin-bottom: 14px;
}

.ai-agent-error {
  padding: 10px 12px;
  margin-bottom: 12px;
  border-radius: 10px;
  background: rgba(185, 28, 28, 0.08);
  border: 1px solid rgba(185, 28, 28, 0.25);
  font-size: 12px;
  color: #b91c1c;
  line-height: 1.5;
}

.ai-agent-task-meta {
  margin-bottom: 14px;
  padding: 10px 12px;
  background: var(--surface-container-low);
  border-radius: 10px;
}

.ai-agent-task-line {
  display: block;
  font-size: 12px;
  color: var(--on-surface-variant);
  line-height: 1.6;
}

.ai-agent-report {
  margin-top: 8px;
}

.ai-agent-report-title {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: var(--on-surface);
  margin-bottom: 8px;
}

.ai-agent-report-subtitle {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--on-surface);
  margin: 12px 0 6px;
}

.ai-agent-report-line {
  display: block;
  font-size: 12px;
  color: var(--on-surface-variant);
  line-height: 1.55;
  margin-bottom: 6px;
}

.ai-agent-report-mono {
  word-break: break-all;
  font-size: 11px;
}

.ai-agent-ref-block {
  margin-bottom: 4px;
}

.ai-agent-chunk-list {
  margin-top: 4px;
}

.ai-agent-chunk-item {
  padding: 10px 0;
  border-bottom: 1px solid var(--surface-container-high);
}

.ai-agent-chunk-item:last-child {
  border-bottom: none;
}

.ai-agent-chunk-head {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--on-surface);
  margin-bottom: 6px;
}

.ai-agent-chunk-head-tap {
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: rgba(79, 70, 229, 0.35);
  text-underline-offset: 3px;
}

.ai-agent-chunk-head-tap:active {
  opacity: 0.85;
}

.ai-agent-issue {
  margin-bottom: 8px;
  padding-left: 4px;
}

.ai-agent-issue-type {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #4f46e5;
  margin-bottom: 2px;
}

.ai-agent-issue-msg {
  display: block;
  font-size: 11px;
  color: var(--on-surface-variant);
  line-height: 1.45;
}

.ai-agent-issue-sug {
  display: block;
  font-size: 11px;
  color: var(--on-surface);
  margin-top: 2px;
  line-height: 1.45;
}

.ai-agent-issue-tappable {
  cursor: pointer;
  border-radius: 6px;
  padding: 6px 6px 6px 4px;
  margin-left: -4px;
  transition: background 0.15s ease;
}

.ai-agent-issue-tappable:active {
  background: var(--surface-container-high);
}

.ai-agent-issue-tap-hover {
  background: rgba(103, 80, 164, 0.08);
}

.ai-agent-issue-locate-hint {
  display: block;
  font-size: 10px;
  color: #4f46e5;
  margin-top: 4px;
}

.paper-preview-area {
  flex: 1;
  background: #e5e5e5;
  overflow: auto;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px;
}

.paper-preview-area.with-ai-summary {
  flex: 1;
}

.paper-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: var(--on-surface-variant);
}

.paper-loading .material-symbols-outlined {
  font-size: 40px;
}

.paper-loading .material-symbols-outlined.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.paper-content-wrapper {
  background: white;
  padding: 0;
  min-width: 600px;
  max-width: 800px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transform-origin: top center;
  transition: transform 0.2s ease;
}

.docx-preview-container {
  width: 100%;
  min-height: 600px;
}

.docx-preview-container .docx-preview-wrapper {
  padding: 40px;
  background: white;
}

.docx-preview-container p.agent-docx-locate-flash {
  outline: 2px solid #4f46e5 !important;
  outline-offset: 3px;
  background: rgba(79, 70, 229, 0.06);
  transition: outline 0.15s ease, background 0.15s ease;
}

.paper-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: var(--on-surface-variant);
  padding: 60px;
}

.paper-empty .material-symbols-outlined {
  font-size: 48px;
  opacity: 0.5;
}

.annotation-panel {
  width: 320px;
  background: white;
  border-left: 1px solid var(--surface-container-high);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.annotation-panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--surface-container-high);
}

.panel-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--on-surface);
}

.annotation-tabs {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--surface-container-high);
}

.annotation-tab {
  flex: 1;
  padding: 8px 12px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--on-surface-variant);
  background: var(--surface-container-low);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.annotation-tab:hover {
  background: var(--surface-container-high);
}

.annotation-tab.active {
  background: var(--primary);
  color: white;
}

.annotation-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.annotation-empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--on-surface-variant);
  font-size: 13px;
}

.annotation-item {
  padding: 16px;
  background: var(--surface-container-lowest);
  border-radius: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.annotation-item:hover {
  background: var(--surface-container-low);
  transform: translateX(4px);
}

.annotation-item.ai-annotation {
  border-left: 3px solid #667eea;
}

.annotation-item.manual-annotation {
  border-left: 3px solid var(--primary);
}

.annotation-item.active {
  box-shadow: 0 0 0 2px var(--primary);
  background: var(--surface-container-low);
}

/* 批注操作按鈕 */
.annotation-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  justify-content: flex-end;
}

.annotation-action-btn {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.annotation-action-btn.edit-btn {
  color: var(--primary);
  background: rgba(59, 130, 246, 0.08);
}

.annotation-action-btn.edit-btn:hover {
  background: rgba(59, 130, 246, 0.18);
}

.annotation-action-btn.delete-btn {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
}

.annotation-action-btn.delete-btn:hover {
  background: rgba(239, 68, 68, 0.18);
}

/* 批注选中原文 */
.annotation-selected-text {
  margin-top: 6px;
  padding: 4px 8px;
  background: rgba(59, 130, 246, 0.06);
  border-left: 2px solid #3b82f6;
  border-radius: 0 4px 4px 0;
}

.annotation-selected-label {
  font-size: 11px;
  color: var(--on-surface-variant);
}

.annotation-selected-content {
  font-size: 12px;
  color: var(--on-surface);
  font-style: italic;
}

/* 批注高亮样式 */
.annotation-highlight {
  background: rgba(255, 235, 59, 0.3) !important;
  border-radius: 4px;
  padding: 2px 4px;
  transition: background 0.3s ease;
}

.annotation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.annotation-author {
  font-size: 13px;
  font-weight: 700;
  color: var(--on-surface);
}

.annotation-time {
  font-size: 12px;
  color: var(--on-surface-variant);
}

.annotation-content {
  font-size: 13px;
  line-height: 1.6;
  color: var(--on-surface-variant);
}

.submit-review-btn {
  margin: 16px;
  padding: 14px;
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.submit-review-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(82, 196, 26, 0.3);
}

/* 批注输入弹窗 */
.annotation-input-modal {
  max-width: 460px;
}

.annotation-input-body {
  padding: 20px 24px;
}

.selected-text-preview {
  background: var(--surface-container-low);
  border-left: 3px solid var(--primary);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-label {
  font-size: 12px;
  color: var(--on-surface-variant);
  font-weight: 600;
}

.preview-content {
  font-size: 13px;
  color: var(--on-surface);
  line-height: 1.6;
  word-break: break-all;
  max-height: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.annotation-textarea {
  width: 100%;
  box-sizing: border-box;
  min-height: 120px;
  padding: 12px 16px;
  border: 1px solid var(--outline-variant);
  border-radius: 12px;
  font-size: 14px;
  background: var(--surface-container-lowest);
  resize: none;
  font-family: inherit;
  line-height: 1.6;
  transition: all 0.2s;
}

.annotation-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 91, 191, 0.1);
}

.char-count {
  display: block;
  text-align: right;
  font-size: 12px;
  color: var(--on-surface-variant);
  margin-top: 8px;
}

/* Password Modal */
.password-change-modal {
  max-width: 400px;
}

.password-modal-body {
  padding: 24px;
}

.pwd-form-item {
  margin-bottom: 20px;
}

.pwd-form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--on-surface-variant);
  margin-bottom: 8px;
}

.pwd-form-input {
  width: 100%;
  box-sizing: border-box;
  height: 44px;
  padding: 12px 16px;
  border: 1px solid var(--outline-variant);
  border-radius: 12px;
  font-size: 14px;
  background: var(--surface-container-lowest);
  transition: all 0.2s;
}

.pwd-form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 91, 191, 0.1);
}

.pwd-form-input.pwd-input-error {
  border-color: var(--error);
  background: var(--error-container);
}

.pwd-error-tip {
  font-size: 12px;
  color: var(--error);
  margin-top: 6px;
}

.download-modal {
  max-width: 600px;
}

.deadline-modal {
  max-width: 500px;
}

/* 消息详情弹窗样式 */
.message-detail-modal {
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.message-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #e0e0e0;
  background: #fff;
}

.message-detail-header .material-symbols-outlined {
  font-size: 48rpx;
  color: #666;
  cursor: pointer;
  padding: 10rpx;
}

.message-detail-header .header-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.message-detail-header .header-spacer {
  width: 68rpx;
}

.message-detail-body {
  flex: 1;
  padding: 40rpx 30rpx;
  overflow-y: auto;
  background: #f8f9fa;
}

.detail-sender-section {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 40rpx;
  padding: 30rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);
}

.detail-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-avatar .material-symbols-outlined {
  font-size: 56rpx;
  color: #fff;
}

.detail-sender-info {
  flex: 1;
}

.detail-sender-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #1a1a1a;
  display: block;
  margin-bottom: 8rpx;
}

.detail-time {
  font-size: 28rpx;
  color: #999;
}

.detail-content-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);
}

.detail-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #1a1a1a;
  display: block;
  margin-bottom: 24rpx;
  line-height: 1.4;
}

.detail-content {
  font-size: 32rpx;
  color: #333;
  line-height: 1.8;
  display: block;
  white-space: pre-wrap;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 0 10rpx;
}

.detail-tag {
  padding: 12rpx 24rpx;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 30rpx;
  font-size: 26rpx;
  font-weight: 500;
}

.message-detail-footer {
  padding: 30rpx;
  border-top: 1rpx solid #e0e0e0;
  background: #fff;
  display: flex;
  justify-content: center;
}

.detail-close-btn {
  padding: 24rpx 80rpx;
  background: #2196F3;
  color: #fff;
  border: none;
  border-radius: 40rpx;
  font-size: 32rpx;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.detail-close-btn:hover {
  background: #1976d2;
  transform: translateY(-2rpx);
  box-shadow: 0 8rpx 24rpx rgba(33, 150, 243, 0.3);
}

/* 深色模式下的消息详情弹窗 */
.dark-mode .message-detail-header {
  background: #2D2D2D;
  border-bottom-color: #3F3F3F;
}

.dark-mode .message-detail-header .header-title {
  color: #fff;
}

.dark-mode .message-detail-body {
  background: #1a1a1a;
}

.dark-mode .detail-sender-section,
.dark-mode .detail-content-section {
  background: #2D2D2D;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.2);
}

.dark-mode .detail-sender-name {
  color: #fff;
}

.dark-mode .detail-title {
  color: #fff;
}

.dark-mode .detail-content {
  color: #ccc;
}

.dark-mode .message-detail-footer {
  background: #2D2D2D;
  border-top-color: #3F3F3F;
}

/* Responsive */
@media (max-width: 1200px) {
  .thesis-card {
    grid-template-columns: 200px 1fr 160px;
  }
}

@media (max-width: 992px) {
  .thesis-card {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .card-action-section {
    flex-direction: row;
  }
  
  .bento-filter-bar {
    grid-template-columns: 1fr;
  }
}

/* Message Center */
.message-center-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--surface-container-low);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--on-surface);
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: var(--surface-container-high);
}

.message-filter-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.filter-tab {
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--surface-container-low);
  color: var(--on-surface-variant);
}

.filter-tab:hover {
  background: var(--surface-container-high);
}

.filter-tab.active {
  background: var(--primary-container);
  color: var(--on-primary-container);
}

.message-list-container {
  flex: 1;
  overflow: hidden;
  background: var(--surface-container-low);
  border-radius: 24px;
  padding: 20px;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 20px;
  background: white;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  transition: all 0.2s;
  cursor: pointer;
}

.message-card:hover {
  box-shadow: var(--shadow);
}

.message-card.unread {
  background: var(--surface-container-lowest);
}

.message-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--primary);
}

.message-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: var(--surface-container-high);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--on-surface-variant);
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.message-sender {
  font-size: 16px;
  font-weight: 700;
  color: var(--on-surface);
}

.message-time {
  font-size: 12px;
  color: var(--on-surface-variant);
  background: var(--surface-container);
  padding: 4px 10px;
  border-radius: 6px;
}

.message-text {
  font-size: 14px;
  color: var(--on-surface-variant);
  line-height: 1.5;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.message-tags {
  display: flex;
  gap: 8px;
}

.message-tag {
  padding: 4px 12px;
  background: rgba(0, 106, 95, 0.1);
  color: var(--tertiary);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: 20px;
  border: 1px solid rgba(0, 106, 95, 0.2);
}

.message-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-icon-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--on-surface-variant);
  transition: all 0.2s;
}

.action-icon-btn:hover {
  background: var(--surface-container-high);
  color: var(--primary);
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

/* 消息中心分页 */
.message-pagination {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.message-pagination .pagination-info {
  font-size: 14px;
  color: var(--on-surface-variant);
}

.message-pagination .pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-info {
  font-size: 14px;
  color: var(--on-surface-variant);
}

.pagination-controls {
  display: flex;
  gap: 8px;
}

.page-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid var(--outline-variant);
  background: white;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--on-surface);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
  background: rgba(0, 91, 191, 0.05);
}

.page-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 91, 191, 0.25);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  border-color: var(--outline-variant);
  color: var(--on-surface-variant);
}

.page-btn .material-symbols-outlined {
  font-size: 20px;
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s;
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
  
  .main-content.with-sidebar {
    margin-left: 0;
  }
  
  .content-canvas {
    padding: 20px;
  }
  
  .class-grid {
    grid-template-columns: 1fr;
  }
}

/* 附件弹窗样式 */
.attachment-modal {
  max-width: 560px;
  width: 90%;
}

.attachment-count {
  margin-left: 8px;
  color: var(--on-surface-variant);
  font-size: 14px;
  font-weight: 500;
}

.attachment-list-body {
  padding: 16px 24px;
  max-height: 400px;
  overflow-y: auto;
}

.attachment-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--surface-container-low);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.attachment-item:hover {
  background: #f0f0f0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.attachment-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--primary-container);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.attachment-icon .material-symbols-outlined {
  color: var(--primary);
  font-size: 20px;
}

.attachment-info {
  flex: 1;
  min-width: 0;
}

.attachment-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--on-surface);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.attachment-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--on-surface-variant);
}

.attachment-action {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-container);
  flex-shrink: 0;
}

.attachment-item:hover .attachment-action {
  background: var(--primary-container);
}

/* 附件预览弹窗样式 */
.attachment-preview-mask {
  z-index: 1100;
}

.attachment-preview-modal {
  max-width: 900px;
  width: 90%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.preview-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 16px;
}

.preview-close-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.preview-close-btn:hover {
  background: var(--surface-container-high);
}

.attachment-preview-body {
  flex: 1;
  overflow: auto;
  padding: 24px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: var(--on-surface-variant);
}

.preview-error,
.preview-unsupported {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 48px 24px;
}

.preview-image {
  max-width: 100%;
  max-height: 60vh;
}

.preview-pdf-container,
.preview-docx-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.preview-pdf-iframe {
  width: 100%;
  height: 60vh;
  border: none;
  border-radius: 8px;
}

.docx-preview-content {
  width: 100%;
  min-height: 400px;
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.docx-preview-content .docx-preview-wrapper {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>
