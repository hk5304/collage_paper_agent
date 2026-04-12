<template>
  <view class="detail-modal" @click="$emit('close')">
    <view class="detail-content" @click.stop @touchmove.stop.prevent>
      <view class="detail-header">
        <text class="detail-title">{{ paper.title }}</text>
        <text class="close-btn" @click="$emit('close')">×</text>
      </view>
      <view class="detail-body">
        <view class="preview-area">
          <view class="preview-toolbar">
            <button class="tool-btn" @click="$emit('zoom-out')">-</button>
            <text class="zoom-level">{{ zoomLevel }}%</text>
            <button class="tool-btn" @click="$emit('zoom-in')">+</button>
          </view>
          <scroll-view 
            class="document-preview" 
            :scroll-y="true" 
            :scroll-x="true"
            :enable-back-to-top="true"
            :show-scrollbar="true"
            :scroll-left="scrollLeft"
            :scroll-top="scrollTop"
            @scroll="handleDocumentScroll"
          >
            <view 
              class="document-content" 
              :class="{ 'zoomed': zoomLevel !== 100 }"
              :style="getContentStyle()"
            >
              <view class="preview-content-area">
                <text class="preview-placeholder">文档预览区域</text>
                <text class="preview-text">{{ paper.content || '暂无内容' }}</text>
              </view>
            </view>
          </scroll-view>
        </view>
        <!-- AI结构检查结果 -->
        <view v-if="paper && paper.aiStructureCheck" class="ai-structure-panel">
          <view class="structure-header">
            <text class="structure-title">📋 AI结构检查结果</text>
            <view class="structure-status" :class="paper.aiStructureCheck.isCorrect ? 'status-correct' : 'status-error'">
              <text>{{ paper.aiStructureCheck.isCorrect ? '✓ 论文结构正确' : '✗ 论文结构需要修改' }}</text>
            </view>
          </view>
          <view v-if="!paper.aiStructureCheck.isCorrect && paper.aiStructureCheck.suggestions && paper.aiStructureCheck.suggestions.length > 0" class="structure-suggestions">
            <text class="suggestions-title">修改建议：</text>
            <view v-for="(suggestion, idx) in paper.aiStructureCheck.suggestions" :key="idx" class="suggestion-item">
              <text class="suggestion-index">{{ idx + 1 }}.</text>
              <text class="suggestion-text">{{ suggestion }}</text>
            </view>
          </view>
          <view v-if="paper.aiStructureCheck.checkTime" class="check-time">
            <text>检查时间：{{ paper.aiStructureCheck.checkTime }}</text>
          </view>
        </view>
        <view class="annotation-panel">
          <view class="panel-header">
            <text class="panel-title">批注与反馈</text>
            <view class="filter-tabs">
              <text class="filter-tab" :class="{active: filterType === 'all'}" @click="filterType = 'all'">全部</text>
              <text class="filter-tab" :class="{active: filterType === 'unprocessed'}" @click="filterType = 'unprocessed'">未处理</text>
              <text class="filter-tab" :class="{active: filterType === 'processed'}" @click="filterType = 'processed'">已处理</text>
            </view>
            <view class="source-tabs">
              <text class="source-tab" :class="{active: filterSource === 'all'}" @click="filterSource = 'all'">全部</text>
              <text class="source-tab" :class="{active: filterSource === 'ai'}" @click="filterSource = 'ai'">AI审查</text>
              <text class="source-tab" :class="{active: filterSource === 'teacher'}" @click="filterSource = 'teacher'">教师批注</text>
            </view>
          </view>
          <scroll-view class="annotation-list" :scroll-y="true">
            <view v-for="(annotation, index) in filteredAnnotations" :key="index" class="annotation-item">
              <view class="annotation-header">
                <view class="annotation-badge" :class="annotation.source === 'ai' ? 'ai-badge' : 'teacher-badge'">
                  <text>{{ annotation.source === 'ai' ? 'AI' : '教师' }}</text>
                </view>
                <view class="annotation-severity" v-if="annotation.severity">
                  <text class="severity-{{ annotation.severity }}">{{ getSeverityText(annotation.severity) }}</text>
                </view>
                <view class="annotation-status" :class="annotation.processed ? 'processed' : 'unprocessed'">
                  <text>{{ annotation.processed ? '已处理' : '未处理' }}</text>
                </view>
              </view>
              <view class="annotation-content">
                <text class="annotation-text">{{ annotation.content }}</text>
                <text class="annotation-suggestion" v-if="annotation.suggestion">建议：{{ annotation.suggestion }}</text>
              </view>
              <view class="annotation-actions">
                <button v-if="!annotation.processed" class="mark-btn" @click="$emit('mark-processed', annotation)">标记为已处理</button>
                <button v-if="annotation.processed" class="mark-btn processed" disabled>已处理</button>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>
      <view class="version-history">
        <view class="history-header">
          <text class="history-title">版本历史</text>
          <button class="compare-btn" @click="$emit('show-version-compare')">版本对比</button>
        </view>
        <scroll-view class="version-list" :scroll-y="true">
          <view v-for="(version, index) in paper.versions" :key="index" class="version-item">
            <text class="version-info">v{{ version.version }} - {{ version.updateTime }}</text>
            <text class="version-status">{{ getStatusText(version.status) }}</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    paper: {
      type: Object,
      required: true
    },
    zoomLevel: {
      type: Number,
      default: 100
    },
    scrollLeft: {
      type: Number,
      default: 0
    },
    scrollTop: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      filterType: 'all',
      filterSource: 'all'
    };
  },
  computed: {
    filteredAnnotations() {
      if (!this.paper) return [];
      let annotations = this.paper.annotations || [];
      if (this.filterType !== 'all') {
        annotations = annotations.filter(a => this.filterType === 'unprocessed' ? !a.processed : a.processed);
      }
      if (this.filterSource !== 'all') {
        annotations = annotations.filter(a => a.source === this.filterSource);
      }
      return annotations;
    }
  },
  methods: {
    handleDocumentScroll(e) {
      this.$emit('document-scroll', e);
    },
    getContentStyle() {
      const scale = this.zoomLevel / 100;
      if (scale === 1) {
        return { width: '100%' };
      }
      return {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: `${100 / scale}%`,
        height: `${100 / scale}%`
      };
    },
    getStatusText(status) {
      const statusMap = {
        'draft': '已上传',
        'uploaded': '已上传',
        'reviewing': '审阅中',
        'feedback': '待修改',
        'finalized': '已定稿',
        'pending_final': '待确认定稿'
      };
      return statusMap[status] || '未知';
    },
    getSeverityText(severity) {
      const severityMap = {
        'high': '高风险',
        'medium': '中风险',
        'low': '建议'
      };
      return severityMap[severity] || '';
    }
  }
};
</script>

<style scoped>
.detail-modal {
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

.detail-content {
  width: 90%;
  max-width: 800rpx;
  background: #fff;
  border-radius: 20rpx;
  box-sizing: border-box;
  overflow: hidden;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.1);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #e2e8f0;
}

.detail-title {
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
  max-height: 300rpx;
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

/* ==================== 深色模式 ==================== */
:global(.dark-mode) .detail-content {
  background: #252525;
  background-color: #252525;
}

:global(.dark-mode) .detail-header {
  background: #1e3a5f;
  background-color: #1e3a5f;
  border-bottom-color: #2d5a8a;
}

:global(.dark-mode) .detail-title {
  color: #ffffff;
}

:global(.dark-mode) .close-btn {
  color: #aaaaaa;
}

:global(.dark-mode) .detail-body {
  background-color: #252525;
}

:global(.dark-mode) .preview-area {
  background-color: #1a1a1a;
  border-right-color: #3a3a3a;
}

:global(.dark-mode) .preview-placeholder {
  color: #cccccc;
}

:global(.dark-mode) .version-history {
  background-color: #333333;
  border-color: #444444;
}

:global(.dark-mode) .version-title {
  color: #ffffff;
}

:global(.dark-mode) .version-item {
  border-bottom-color: #444444;
}

:global(.dark-mode) .version-item:hover {
  background-color: #3a3a3a;
}

:global(.dark-mode) .version-number {
  color: #ffffff;
}

:global(.dark-mode) .version-time {
  color: #aaaaaa;
}

:global(.dark-mode) .version-status {
  color: #cccccc;
}

:global(.dark-mode) .ai-check-section {
  background-color: #333333;
  border-color: #444444;
}

:global(.dark-mode) .check-title {
  color: #ffffff;
}

:global(.dark-mode) .check-time {
  color: #aaaaaa;
}

:global(.dark-mode) .annotation-panel {
  background-color: #252525;
  border-left-color: #3a3a3a;
}

:global(.dark-mode) .panel-header {
  border-bottom-color: #3a3a3a;
}

:global(.dark-mode) .panel-title {
  color: #ffffff;
}

:global(.dark-mode) .filter-tab,
:global(.dark-mode) .source-tab {
  color: #aaaaaa;
}

:global(.dark-mode) .filter-tab.active,
:global(.dark-mode) .source-tab.active {
  background-color: #1890ff;
  color: #ffffff;
}

:global(.dark-mode) .annotation-list {
  background-color: #252525;
}

:global(.dark-mode) .annotation-item {
  background-color: #333333;
  border-color: #444444;
}

:global(.dark-mode) .annotation-source {
  color: #aaaaaa;
}

:global(.dark-mode) .annotation-content {
  color: #ffffff;
}

:global(.dark-mode) .annotation-time {
  color: #888888;
}

:global(.dark-mode) .empty-state {
  color: #cccccc;
}

:global(.dark-mode) .annotation-section {
  background-color: transparent;
}

:global(.dark-mode) .section-title {
  color: #aaaaaa;
}

:global(.dark-mode) .section-content {
  color: #e0e0e0;
  background-color: #2a2a2a;
}

:global(.dark-mode) .selected-content {
  color: #e0e0e0;
  background-color: #2a2a2a;
}

:global(.dark-mode) .annotation-content-text {
  color: #ffffff;
}

:global(.dark-mode) .suggestion-content {
  color: #81c784;
}

:global(.dark-mode) .annotation-footer {
  background-color: transparent;
}

:global(.dark-mode) .annotation-header {
  background-color: transparent;
}

:global(.dark-mode) .annotation-source {
  color: #aaaaaa;
}

:global(.dark-mode) .annotation-status.status-unprocessed {
  background-color: #4a3a1a;
  color: #ffa726;
}

:global(.dark-mode) .annotation-status.status-processed {
  background-color: #1a4a1a;
  color: #4caf50;
}

:global(.dark-mode) .source-icon {
  color: #ffffff;
}

:global(.dark-mode) .source-text {
  color: #aaaaaa;
}

:global(.dark-mode) .annotation-text {
  color: #ffffff;
}

:global(.dark-mode) .annotation-suggestion {
  color: #63b3ed;
}

:global(.dark-mode) .annotation-badge.ai-badge {
  background-color: #1e3a5f;
  color: #63b3ed;
}

:global(.dark-mode) .annotation-badge.teacher-badge {
  background-color: #1a4a4a;
  color: #4db6ac;
}

:global(.dark-mode) .severity-high {
  color: #ff8a80;
}

:global(.dark-mode) .severity-medium {
  color: #ffb74d;
}

:global(.dark-mode) .severity-low {
  color: #aaaaaa;
}

:global(.dark-mode) .mark-btn {
  background-color: #1890ff;
  color: #ffffff;
}

:global(.dark-mode) .mark-btn.processed {
  background-color: #444444;
  color: #888888;
}

:global(.dark-mode) .history-title {
  color: #ffffff;
}

:global(.dark-mode) .version-info {
  color: #e0e0e0;
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .detail-content {
    width: 95%;
    max-height: 95vh;
  }
  
  .detail-body {
    flex-direction: column;
  }
  
  .preview-area {
    border-right: none;
    border-bottom: 1rpx solid #e2e8f0;
  }
  
  .annotation-panel {
    width: 100%;
    flex-shrink: 1;
  }
  
  .version-history {
    max-height: 200rpx;
  }
}
</style>