<template>
  <view class="preview-modal" :class="{ 'dark-mode': darkMode }" @click="closeModal">
    <view class="preview-content" @click.stop>
      <view class="preview-header">
        <text class="preview-title">{{ paperTitle }}</text>
        <text class="close-btn" @click="closeModal" :style="{pointerEvents: loading ? 'none' : 'auto'}">×</text>
      </view>
      
      <view class="document-type-tabs" :style="{pointerEvents: loading ? 'none' : 'auto'}">
        <text class="type-tab" :class="{active: activeType === 'pdf'}" @click="activeType = 'pdf'" :style="{opacity: loading ? 0.7 : 1}">PDF预览</text>
        <text class="type-tab" :class="{active: activeType === 'word'}" @click="activeType = 'word'" :style="{opacity: loading ? 0.7 : 1}">Word结构化</text>
      </view>
      
      <view v-if="loading" class="loading-container">
        <uni-load-more status="loading" icon-size="24" color="#1890ff"></uni-load-more>
        <text class="loading-text">正在加载预览数据...</text>
      </view>
      
      <view v-else-if="aiReviewLoading" class="loading-container ai-review-loading">
        <uni-load-more status="loading" icon-size="24" color="#1890ff"></uni-load-more>
        <text class="loading-text">AI 评审进行中，请稍候...</text>
        <text class="loading-subtext">正在分析论文格式、内容和风险点</text>
      </view>
      
      <view v-else-if="activeType === 'pdf'" class="pdf-preview">
        <view class="pdf-toolbar">
          <button class="tool-btn" @click="zoomOut" :disabled="loading">-</button>
          <text class="zoom-level">{{ zoomLevel }}%</text>
          <button class="tool-btn" @click="zoomIn" :disabled="loading">+</button>
          <button class="tool-btn" @click="toggleHighlight" :disabled="loading || !selectedParagraph" :class="{active: isHighlightEnabled}">
            {{ isHighlightEnabled ? '取消高亮' : '高亮' }}
          </button>
        </view>
        <scroll-view class="pdf-content" :scroll-y="true" :style="{zoom: zoomLevel + '%'}">
          <view class="pdf-page" v-for="(page, index) in pdfPages" :key="index">
            <view class="pdf-paragraph" 
              v-for="(para, pIndex) in page.paragraphs" 
              :key="pIndex"
              @click="selectParagraph(index, pIndex)"
              :class="{
                'highlighted': para.userHighlighted,
                'selected': selectedParagraph && selectedParagraph.pageIndex === index && selectedParagraph.pIndex === pIndex
              }">
              <text class="paragraph-text">{{ para.text }}</text>
              <view v-if="para.hasIssue" class="issue-badge">
                <text>{{ para.severity === 'high' ? '⚠' : '△' }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
      
      <view v-else-if="activeType === 'word'" class="word-preview">
        <scroll-view class="word-content" :scroll-y="true">
          <view class="word-section" v-for="(section, index) in wordStructure" :key="index">
            <view class="section-header">
              <text class="section-title">{{ section.title }}</text>
            </view>
            <view class="section-content">
              <text class="section-text">{{ section.content }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
      
      <view class="preview-footer" :style="{pointerEvents: loading ? 'none' : 'auto'}">
        <button class="confirm-btn" @click="closeModal" :disabled="loading" :style="{opacity: loading ? 0.7 : 1}">关闭</button>
      </view>
    </view>
  </view>
</template>

<script>
import { getPaperPreviewData } from './api.js';

export default {
  props: {
    paper: {
      type: Object,
      required: true
    },
    aiReviewLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      activeType: 'pdf',
      zoomLevel: 100,
      selectedParagraph: null,
      pdfPages: [],
      wordStructure: [],
      loading: false,
      darkMode: false
    }
  },
  computed: {
    paperTitle() {
      return this.paper?.title || '论文预览';
    },
    isHighlightEnabled() {
      if (!this.selectedParagraph) return false;
      const { pageIndex, pIndex } = this.selectedParagraph;
      return this.pdfPages[pageIndex]?.paragraphs[pIndex]?.userHighlighted || false;
    }
  },
  async mounted() {
    this.loadThemeSetting();
    await this.loadPaperPreviewData();
  },
  methods: {
    async loadPaperPreviewData() {
      try {
        this.loading = true;
        const paperId = this.paper.id || this.paper.title;
        const previewData = await getPaperPreviewData(paperId);
        
        this.pdfPages = this.processPdfData(previewData.pdfPages || []);
        this.wordStructure = this.processWordData(previewData.wordStructure || []);
        
      } catch (err) {
        console.error('加载预览数据失败:', err);
        uni.showToast({
          title: '预览数据加载失败，已使用本地缓存数据',
          icon: 'none',
          duration: 2000
        });
        
        this.pdfPages = this.processPdfData([]);
        this.wordStructure = this.processWordData([]);
      } finally {
        this.loading = false;
      }
    },
    processPdfData(data) {
      if (data.length === 0) {
        return [
          {
            paragraphs: [
              {text: '摘要：本文研究了基于深度学习的图像识别技术...', hasIssue: true, severity: 'high', userHighlighted: false},
              {text: '关键词：深度学习；图像识别；卷积神经网络', hasIssue: false, userHighlighted: false},
              {text: '1. 引言', hasIssue: false, userHighlighted: false}
            ]
          }
        ];
      }
      
      return data.map(page => ({
        ...page,
        paragraphs: page.paragraphs.map(para => ({
          ...para,
          userHighlighted: para.userHighlighted || false
        }))
      }));
    },
    processWordData(data) {
      if (data.length === 0) {
        return [
          {title: '摘要', content: '本文研究了基于深度学习的图像识别技术...'},
          {title: '1. 引言', content: '随着人工智能技术的快速发展...'},
          {title: '1.1 研究背景', content: '图像识别在安防、医疗等领域有广泛应用...'}
        ];
      }
      
      return data;
    },
    closeModal() {
      if (this.loading) return;
      this.$emit('close');
    },
    zoomIn() {
      if (this.zoomLevel < 200 && !this.loading) this.zoomLevel += 10;
    },
    zoomOut() {
      if (this.zoomLevel > 50 && !this.loading) this.zoomLevel -= 10;
    },
    selectParagraph(pageIndex, pIndex) {
      if (this.loading) return;
      this.selectedParagraph = { pageIndex, pIndex };
    },
    toggleHighlight() {
      if (this.loading || !this.selectedParagraph) return;
      
      const { pageIndex, pIndex } = this.selectedParagraph;
      if (this.pdfPages[pageIndex] && this.pdfPages[pageIndex].paragraphs[pIndex]) {
        this.pdfPages[pageIndex].paragraphs[pIndex].userHighlighted = !this.pdfPages[pageIndex].paragraphs[pIndex].userHighlighted;
      }
    },
    loadThemeSetting() {
      try {
        const savedTheme = uni.getStorageSync('dark_mode');
        if (savedTheme !== null) {
          this.darkMode = savedTheme;
        }
      } catch (err) {
        console.error('加载主题设置失败:', err);
      }
    }
  }
}
</script>

<style scoped>
.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-content {
  width: 90%;
  max-height: 90vh;
  background: #fff;
  border-radius: 10rpx;
  display: flex;
  flex-direction: column;
}

.preview-header {
  padding: 30rpx;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
  font-size: 50rpx;
  color: #999;
  transition: opacity 0.3s;
}

.document-type-tabs {
  display: flex;
  padding: 24rpx 30rpx;
  border-bottom: 1px solid #f0f0f0;
  transition: opacity 0.3s;
  background-color: #f8f9fa;
}

.type-tab {
  padding: 14rpx 28rpx;
  margin-right: 20rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  background: #fff;
  color: #666;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
  font-weight: 500;
  cursor: pointer;
}

.type-tab:hover:not(.active) {
  background-color: #f0f0f0;
  transform: translateY(-2rpx);
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
}

.type-tab.active {
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  color: #fff;
  box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.3);
  transform: translateY(-2rpx);
  border: 1px solid #1890ff;
}

.type-tab:active {
  transform: translateY(0);
}

.loading-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
  background-color: #f8f9fa;
  border-radius: 12rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #666;
  margin-top: 30rpx;
  font-weight: 500;
  letter-spacing: 2rpx;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

uni-load-more {
  animation: pulse 2s infinite ease-in-out;
}

.pdf-preview, .word-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.pdf-toolbar {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
  border-bottom: 1px solid #f0f0f0;
  background-color: #f8f9fa;
  border-radius: 12rpx 12rpx 0 0;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.tool-btn {
  padding: 14rpx 24rpx;
  border: 1px solid #e0e0e0;
  border-radius: 12rpx;
  background: #fff;
  margin: 0 10rpx;
  font-size: 26rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
  font-weight: 500;
}

.tool-btn:hover:not(:disabled) {
  background-color: #f0f0f0;
  border-color: #1890ff;
  transform: translateY(-2rpx);
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
}

.tool-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.05);
}

.tool-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.tool-btn.active {
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  color: #fff;
  border-color: #1890ff;
  box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.3);
}

.tool-btn.active:hover {
  background: linear-gradient(135deg, #40a9ff 0%, #69c0ff 100%);
  box-shadow: 0 6rpx 16rpx rgba(24, 144, 255, 0.4);
}

.zoom-level {
  margin: 0 24rpx;
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  min-width: 80rpx;
  text-align: center;
}

.pdf-content, .word-content {
  flex: 1;
  padding: 30rpx;
  overflow-y: auto;
  padding-right: 38rpx;
  box-sizing: border-box;
}

.pdf-content::-webkit-scrollbar,
.word-content::-webkit-scrollbar {
  width: 8rpx;
}

.pdf-content::-webkit-scrollbar-track,
.word-content::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 4rpx;
}

.pdf-content::-webkit-scrollbar-thumb,
.word-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4rpx;
  transition: background 0.2s ease;
}

.pdf-content::-webkit-scrollbar-thumb:hover,
.word-content::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

.pdf-page {
  background: #fff;
  padding: 50rpx;
  margin-bottom: 30rpx;
  border: 1px solid #f0f0f0;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.pdf-page:hover {
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  transform: translateY(-2rpx);
}

.pdf-paragraph {
  position: relative;
  margin-bottom: 30rpx;
  padding: 24rpx;
  border-radius: 12rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: #fafafa;
}

.pdf-paragraph:hover {
  background-color: #f8f9fa;
  cursor: pointer;
}

.pdf-paragraph.highlighted {
  background: linear-gradient(135deg, #fff7e6 0%, #fff3cd 100%);
  border: 2px solid #fa8c16;
  box-shadow: 0 4rpx 12rpx rgba(250, 140, 22, 0.15);
  transform: translateX(8rpx);
}

.pdf-paragraph.selected {
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
  border: 2px solid #1890ff;
  box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.2);
  transform: translateX(8rpx);
}

.pdf-paragraph.selected.highlighted {
  background: linear-gradient(135deg, #fff7e6 0%, #fff3cd 100%);
  border: 3px solid #1890ff;
  box-shadow: 0 4rpx 12rpx rgba(250, 140, 22, 0.15), 0 0 0 4rpx rgba(24, 144, 255, 0.2);
  position: relative;
}

.pdf-paragraph.selected::after {
  content: '✓ 已选中';
  position: absolute;
  top: -12rpx;
  right: 12rpx;
  background-color: #1890ff;
  color: white;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
  font-weight: bold;
  z-index: 10;
}

.paragraph-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.8;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.issue-badge {
  position: absolute;
  top: -12rpx;
  right: -12rpx;
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: #ff4d4f;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  box-shadow: 0 4rpx 8rpx rgba(255, 77, 79, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
}

.issue-badge:hover {
  transform: scale(1.1);
  box-shadow: 0 6rpx 12rpx rgba(255, 77, 79, 0.4);
}

.word-section {
  margin-bottom: 30rpx;
  padding: 28rpx;
  border-left: 6px solid #1890ff;
  background: linear-gradient(135deg, #f8f9fa 0%, #e6f7ff 100%);
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.word-section:hover {
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  transform: translateX(8rpx);
  border-left-width: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
  padding-bottom: 12rpx;
  border-bottom: 1px solid #e6f7ff;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
}

.section-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  letter-spacing: 1rpx;
}

.preview-footer {
  padding: 30rpx;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  transition: opacity 0.3s;
}

.confirm-btn {
  padding: 15rpx 30rpx;
  background: #1890ff;
  color: #fff;
  border-radius: 5rpx;
  font-size: 28rpx;
  border: none;
  transition: opacity 0.3s;
}

.confirm-btn:disabled {
  opacity: 0.7;
}
</style>

<style>
.dark-mode .preview-modal {
  background: rgba(18, 18, 18, 0.9);
}

.dark-mode .preview-content {
  background: #1E1E1E;
}

.dark-mode .preview-header {
  border-bottom-color: #3F3F3F;
}

.dark-mode .preview-title {
  color: #ffffff;
}

.dark-mode .close-btn {
  color: #ffffff;
}

.dark-mode .document-type-tabs {
  background-color: #2D2D2D;
  border-bottom-color: #3F3F3F;
}

.dark-mode .type-tab {
  background: #3F3F3F;
  color: #ffffff;
}

.dark-mode .type-tab:hover:not(.active) {
  background: #2D2D2D;
}

.dark-mode .type-tab.active {
  background: linear-gradient(135deg, #87CEEB 0%, #98FB98 100%);
  color: #121212;
  border-color: #87CEEB;
}

.dark-mode .loading-container {
  background-color: #2D2D2D;
}

.dark-mode .loading-text {
  color: #ffffff;
}

.ai-review-loading .loading-subtext {
  font-size: 24rpx;
  color: #999;
  margin-top: 16rpx;
}

.dark-mode .ai-review-loading .loading-subtext {
  color: #aaa;
}

.dark-mode .pdf-toolbar {
  background-color: #2D2D2D;
  border-bottom-color: #3F3F3F;
}

.dark-mode .tool-btn {
  background: #3F3F3F;
  border-color: #3F3F3F;
  color: #ffffff;
}

.dark-mode .tool-btn:hover:not(:disabled) {
  background: #2D2D2D;
  border-color: #87CEEB;
}

.dark-mode .tool-btn.active {
  background: linear-gradient(135deg, #87CEEB 0%, #98FB98 100%);
  color: #121212;
  border-color: #87CEEB;
}

.dark-mode .tool-btn.active:hover {
  background: linear-gradient(135deg, #98FB98 0%, #87CEEB 100%);
}

.dark-mode .zoom-level {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.05);
}

.dark-mode .pdf-page {
  background: #2D2D2D;
  border-color: #3F3F3F;
}

.dark-mode .pdf-paragraph {
  background-color: #3F3F3F;
}

.dark-mode .pdf-paragraph:hover {
  background-color: #2D2D2D;
}

.dark-mode .pdf-paragraph.highlighted {
  background: linear-gradient(135deg, #2D2D2D 0%, #3F3F3F 100%);
  border-color: #87CEEB;
}

.dark-mode .pdf-paragraph.selected {
  background: linear-gradient(135deg, #3F3F3F 0%, #2D2D2D 100%);
  border-color: #87CEEB;
}

.dark-mode .pdf-paragraph.selected.highlighted {
  background: linear-gradient(135deg, #2D2D2D 0%, #3F3F3F 100%);
  border-color: #87CEEB;
}

.dark-mode .pdf-paragraph.selected::after {
  background-color: #87CEEB;
  color: #121212;
}

.dark-mode .paragraph-text {
  color: #ffffff;
}

.dark-mode .word-section {
  background: linear-gradient(135deg, #2D2D2D 0%, #3F3F3F 100%);
  border-left-color: #87CEEB;
}

.dark-mode .section-header {
  border-bottom-color: #87CEEB;
}

.dark-mode .section-title {
  color: #ffffff;
}

.dark-mode .section-text {
  color: #e0e0e0;
}

.dark-mode .preview-footer {
  border-top-color: #3F3F3F;
}

.dark-mode .confirm-btn {
  background: #87CEEB;
  color: #121212;
}

.dark-mode .pdf-content::-webkit-scrollbar-track,
.dark-mode .word-content::-webkit-scrollbar-track {
  background: #2D2D2D;
}

.dark-mode .pdf-content::-webkit-scrollbar-thumb,
.dark-mode .word-content::-webkit-scrollbar-thumb {
  background: #3F3F3F;
}

.dark-mode .pdf-content::-webkit-scrollbar-thumb:hover,
.dark-mode .word-content::-webkit-scrollbar-thumb:hover {
  background: #87CEEB;
}
</style>
