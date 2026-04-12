<template>
  <view class="download-modal" :class="{ 'dark-mode': darkMode }" @click="closeModal">
    <view class="download-content" :class="{ 'dark-mode': darkMode }" @click.stop>
      <!-- 弹窗头部 -->
      <view class="modal-header" :class="{ 'dark-mode': darkMode }">
        <text class="modal-title" :class="{ 'dark-mode': darkMode }">{{ isBatch ? "批量下载" : "单篇下载" }}</text>
      </view>
      
      <!-- 单篇/批量选择 -->
      <view class="modal-body" :class="{ 'dark-mode': darkMode }" v-if="isBatch">
        <text class="tip-text" :class="{ 'dark-mode': darkMode }">请选择要下载的论文：</text>
        <view class="paper-list" :class="{ 'dark-mode': darkMode }">
          <view v-for="(item, index) in selectedPapers" :key="index" class="paper-item" :class="{ 'dark-mode': darkMode }">
            <checkbox 
              :value="item.checked"
              :checked="item.checked"
              @click="(e) => onCheckboxChange(index, { detail: { value: !item.checked } })"
              :disabled="downloading"
            />
            <text class="paper-title" :class="{ 'dark-mode': darkMode }">{{ item.studentName }} - {{ item.paperTitle }}</text>
          </view>
        </view>
      </view>
      
      <!-- 下载格式说明 -->
      <view class="compress-option" :class="{ 'dark-mode': darkMode }">
        <text class="option-text" :class="{ 'dark-mode': darkMode }">下载将自动打包为ZIP压缩包</text>
      </view>
      
      <!-- 操作按钮（取消，确认下载按钮） -->
      <view class="modal-footer" :class="{ 'dark-mode': darkMode }">
        <button 
          class="cancel-btn" 
          :class="{ 'dark-mode': darkMode }"
          @click="closeModal"
          :disabled="downloading"
          :style="{opacity: downloading ? 0.7 : 1}"
        >
          取消
        </button>
        <button 
          class="confirm-btn" 
          :class="{ 'dark-mode': darkMode }"
          @click="handleDownload"
          :disabled="downloading"
          :style="{opacity: downloading ? 0.7 : 1}"
        >
          <text v-if="downloading">下载中...</text>
          <text v-else>确认下载</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script>
// 引入API方法
import { batchDownloadPapers } from './api.js';

export default {
  props: {
    // 是否批量下载
    isBatch: {
      type: Boolean,
      default: false
    },
    // 批量下载时的论文列表（单篇时传当前论文）
    paperList: {
      type: Array,
      default: () => []
    },
    // 深色模式
    darkMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isZip: true, // 是否打包为ZIP
      selectedPapers: [], // 批量选择的论文（含checked状态）
      downloading: false // 下载中状态
    };
  },
  watch: {
    paperList: {
      immediate: true,
      handler(list) {
        // 将学生列表转换为论文列表（每篇论文一个条目）
        const papers = [];
        list.forEach(student => {
          // 如果是单篇下载，且指定了 currentPaper，只使用该论文
          if (student.currentPaper) {
            papers.push({
              studentName: student.name,
              studentId: student.id,
              paperTitle: student.currentPaper.title || '未命名论文',
              paperId: student.currentPaper.paperId || student.currentPaper.id,
              paper: student.currentPaper,
              checked: true
            });
          } else {
            // 批量下载：获取该学生的所有论文
            const studentPapers = student.papers || [student.paper];
            studentPapers.forEach(paper => {
              if (paper) {
                papers.push({
                  studentName: student.name,
                  studentId: student.id,
                  paperTitle: paper.title || '未命名论文',
                  paperId: paper.paperId || paper.id,
                  paper: paper,
                  checked: true
                });
              }
            });
          }
        });
        this.selectedPapers = papers;
      }
    }
  },
  methods: {
    closeModal() {
      // 下载过程中禁止关闭弹窗
      if (this.downloading) return;
      this.$emit("close");
    },
    // 处理 checkbox 状态变化
    onCheckboxChange(index, e) {
      // uni-app checkbox 的 value 可能是数组或布尔值
      let checked = e.detail.value;
      if (Array.isArray(checked)) {
        checked = checked.length > 0;
      }
      // 使用 $set 确保 Vue 检测到变化
      this.$set(this.selectedPapers[index], 'checked', checked);
      console.log(`论文 ${index} 选中状态:`, checked, '论文标题:', this.selectedPapers[index].paperTitle);
    },
    async handleDownload() {
      // 1. 筛选选中的论文
      let targetPapers;
      if (this.isBatch) {
        // 批量下载：从选中的列表中筛选
        targetPapers = this.selectedPapers.filter(item => item.checked);
      } else {
        // 单篇下载：从 paperList 构建论文对象
        targetPapers = this.selectedPapers.length > 0 
          ? this.selectedPapers 
          : this.paperList.map(student => {
              const paper = student.currentPaper || student.paper || (student.papers && student.papers[0]);
              return {
                studentName: student.name,
                studentId: student.id,
                paperTitle: paper?.title || '未命名论文',
                paperId: paper?.paperId || paper?.id,
                paper: paper
              };
            });
      }
      
      if (targetPapers.length === 0) {
        uni.showToast({ title: "请选择要下载的论文", icon: "none" });
        return;
      }
      
      // 2. 从选中的论文中提取论文ID和学生ID
      console.log('targetPapers:', targetPapers);
      
      const paperIds = targetPapers.map(item => item.paperId).filter(id => id);
      
      console.log('paperIds:', paperIds);
      
      if (paperIds.length === 0) {
        uni.showToast({ title: "没有有效的论文ID", icon: "none" });
        return;
      }
      
      // 3. 获取下载文件名
      const firstPaper = targetPapers[0];
      const paperTitle = firstPaper?.paperTitle || firstPaper?.paper?.title || '论文';
      const fileName = this.isBatch && paperIds.length > 1 
        ? `批量下载_${paperIds.length}篇论文.zip` 
        : `${paperTitle}.zip`;
      
      // 4. 如果浏览器支持，先弹出保存对话框（必须在用户交互中立即调用）
      let fileHandle = null;
      if (window.showSaveFilePicker) {
        try {
          console.log('弹出文件保存对话框...');
          fileHandle = await window.showSaveFilePicker({
            suggestedName: fileName,
            types: [{
              description: 'ZIP 文件',
              accept: { 'application/zip': ['.zip'] }
            }]
          });
          console.log('用户选择了保存位置:', fileHandle.name);
        } catch (pickerErr) {
          if (pickerErr.name === 'AbortError') {
            console.log('用户取消了文件保存对话框');
            return; // 用户取消，直接返回
          }
          console.error('保存文件选择器失败:', pickerErr);
          // 继续执行，使用默认下载方式
        }
      }
      
      try {
        // 标记下载中状态
        this.downloading = true;
        
        uni.showLoading({ 
          title: fileHandle ? "正在下载文件..." : "正在打包并准备文件...",
          mask: true
        });
        
        // 5. 调用新接口下载论文
        // 将论文ID数组转换为逗号分隔的字符串
        const paperIdsStr = paperIds.join(',');
        
        console.log('下载论文ID列表:', paperIdsStr);
        
        // 调用新的批量下载接口（返回文件流）
        const response = await batchDownloadPapers(paperIdsStr);
        
        // 6. 处理下载的文件流
        try {
          // response 是 arraybuffer 数据，转换为 blob
          const blob = new Blob([response], { type: 'application/zip' });
          
          console.log('文件下载完成，大小:', blob.size, 'bytes');
          
          // 如果用户已选择保存位置，直接写入文件
          if (fileHandle) {
            console.log('写入文件到用户选择的位置...');
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
            console.log('文件写入完成');
          } else {
            // 使用默认下载方式
            console.log('使用默认下载方式');
            fallbackDownload(blob, fileName);
          }
          
          uni.hideLoading();
          uni.showToast({ 
            title: `下载成功`, 
            icon: "success",
            duration: 2000
          });
          
          // 下载成功后延迟关闭弹窗
          setTimeout(() => {
            this.closeModal();
            this.downloading = false;
          }, 1500);
        } catch (err) {
          throw err;
        }
        
        // 默认下载方式（不支持选择保存位置）
        function fallbackDownload(blob, fileName) {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }
        
        // 可选：监听下载进度（如需显示进度条可启用）
        // downloadTask.onProgressUpdate((res) => {
        //   console.log('下载进度', res.progress);
        // });
        
      } catch (err) {
        // 重置下载状态
        this.downloading = false;
        uni.hideLoading();
        
        console.error('下载失败:', err);
        
        // 分级提示：根据错误类型给出更友好的提示
        let errorMsg = '下载失败，请稍后重试';
        if (err.message.includes('404') || err.message.includes('不存在')) {
          errorMsg = '文件不存在，可能尚未上传';
        } else if (err.message.includes('超时')) {
          errorMsg = '下载超时，请检查网络';
        } else if (err.message.includes('保存')) {
          errorMsg = '文件保存失败，请检查存储空间';
        }
        
        // 下载失败时的友好提示
        uni.showToast({ 
          title: errorMsg, 
          icon: "none",
          duration: 3000
        });
      }
    }
  }
};
</script>

<style scoped>
.download-modal {
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
/* 新设计：现代化卡片式弹窗 */
.download-content {
  width: 85%;
  max-width: 700rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(30rpx) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
/* 新设计：简洁的头部 */
.modal-header {
  padding: 40rpx 40rpx 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
}
.modal-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: 1rpx;
}
/* 新设计：更精致的关闭按钮 */
.close-btn {
  font-size: 44rpx;
  color: #999;
  transition: all 0.2s ease;
  cursor: pointer;
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #f5f5f5;
}
.close-btn:hover {
  color: #666;
  background-color: #e8e8e8;
  transform: rotate(90deg);
}
.close-btn:active {
  transform: rotate(90deg) scale(0.9);
}
.modal-body {
  padding: 30rpx 40rpx;
}
.tip-text {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 24rpx;
  display: block;
  font-weight: 500;
}
.paper-list {
  max-height: 450rpx;
  overflow-y: auto;
  border-radius: 12rpx;
  border: 1px solid #f0f0f0;
  background-color: #fafafa;
}
.paper-item {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  font-size: 26rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 1px solid #f0f0f0;
}
.paper-item:last-child {
  border-bottom: none;
}
.paper-item:hover {
  background-color: #f8f9fa;
  transform: translateX(8rpx);
}
.paper-title {
  margin-left: 20rpx;
  color: #666;
  flex: 1;
  line-height: 1.4;
}

/* 美化滚动条 */
.paper-list {
  /* 添加内边距，确保滚动条不会影响内容布局 */
  padding-right: 8rpx;
  box-sizing: border-box;
}

.paper-list::-webkit-scrollbar {
  width: 8rpx;
}
.paper-list::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 4rpx;
}
.paper-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4rpx;
  transition: background 0.2s ease;
}
.paper-list::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
/* 新设计：更简洁的选项区域 */
.compress-option {
  padding: 30rpx 40rpx;
  border-top: 1rpx solid #f0f0f0;
  display: flex;
  align-items: center;
  font-size: 28rpx;
  background-color: #fff;
  transition: all 0.2s ease;
}
.compress-option:hover {
  background-color: #fafafa;
}
.option-text {
  margin-left: 20rpx;
  color: #333;
  font-weight: 500;
  flex: 1;
}
/* 新设计：底部通栏按钮组（iOS风格） */
.modal-footer {
  padding: 0;
  display: flex;
  border-top: 1rpx solid #e8e8e8;
  background-color: #fff;
}
.cancel-btn, .confirm-btn {
  flex: 1;
  padding: 32rpx 40rpx;
  border-radius: 0;
  font-size: 30rpx;
  margin: 0;
  border: none;
  transition: all 0.2s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
/* 取消按钮 - 左侧 */
.cancel-btn {
  background: #fff;
  color: #666;
  border-right: 1rpx solid #e8e8e8;
}
.cancel-btn:hover {
  background: #f8f8f8;
}
/* 确认下载按钮 - 右侧，蓝色主色调 */
.confirm-btn {
  background: #fff;
  color: #1890ff;
  font-weight: 600;
}
.confirm-btn:hover {
  background: #f0f8ff;
}
.cancel-btn:active, .confirm-btn:active {
  background: #f0f0f0;
}

/* 禁用状态样式增强 */
.cancel-btn:disabled, .confirm-btn:disabled {
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* 确认下载按钮禁用状态 - 与取消按钮一致 */
.confirm-btn:disabled {
  background: #e0e0e0 !important;
  color: rgba(102, 102, 102, 0.5) !important;
}
/* 禁用状态样式 */
checkbox[disabled] {
  opacity: 0.6;
}

/* 美化checkbox */
checkbox {
  width: 32rpx;
  height: 32rpx;
  border-radius: 4rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

checkbox::after {
  width: 32rpx;
  height: 32rpx;
  border-radius: 4rpx;
  font-size: 20rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

checkbox:checked {
  background-color: #1890ff;
  border-color: #1890ff;
}
</style>

<style>
/* 深色模式样式 - 新设计 */
.download-modal.dark-mode {
  background: rgba(0, 0, 0, 0.7) !important;
}

.download-content.dark-mode {
  background: #2D2D2D !important;
}

.modal-header.dark-mode {
  background-color: #2D2D2D !important;
}

.modal-title.dark-mode {
  color: #ffffff !important;
}

.close-btn.dark-mode {
  color: #999 !important;
  background-color: #3F3F3F !important;
}

.close-btn.dark-mode:hover {
  color: #fff !important;
  background-color: #4a4a4a !important;
}

.modal-body.dark-mode {
  background-color: #2D2D2D !important;
}

.tip-text.dark-mode {
  color: #ffffff !important;
}

.paper-list.dark-mode {
  background-color: #1E1E1E !important;
  border-color: #3F3F3F !important;
}

.paper-list.dark-mode::-webkit-scrollbar-track {
  background: #1E1E1E !important;
}

.paper-list.dark-mode::-webkit-scrollbar-thumb {
  background: #3F3F3F !important;
}

.paper-list.dark-mode::-webkit-scrollbar-thumb:hover {
  background: #4a4a4a !important;
}

.paper-item.dark-mode {
  border-bottom-color: #3F3F3F !important;
}

.paper-item.dark-mode:hover {
  background-color: #3F3F3F !important;
}

.paper-title.dark-mode {
  color: #ffffff !important;
}

.compress-option.dark-mode {
  background-color: #2D2D2D !important;
  border-top-color: #3F3F3F !important;
}

.compress-option.dark-mode:hover {
  background-color: #3F3F3F !important;
}

.option-text.dark-mode {
  color: #ffffff !important;
}

.modal-footer.dark-mode {
  background-color: #2D2D2D !important;
  border-top-color: #3F3F3F !important;
}

/* 深色模式按钮 - 新设计（通栏风格） */
.cancel-btn.dark-mode {
  background: #2D2D2D !important;
  color: #bbbbbb !important;
  border-right-color: #3F3F3F !important;
}

.cancel-btn.dark-mode:hover {
  background: #3F3F3F !important;
}

.confirm-btn.dark-mode {
  background: #2D2D2D !important;
  color: #87CEEB !important;
  font-weight: 600 !important;
}

.confirm-btn.dark-mode:hover {
  background: #3F3F3F !important;
}

.cancel-btn.dark-mode:disabled,
.confirm-btn.dark-mode:disabled {
  background-color: #2D2D2D !important;
  color: rgba(255, 255, 255, 0.3) !important;
}

.download-modal.dark-mode checkbox {
  background-color: #3F3F3F !important;
  border-color: #3F3F3F !important;
}

.download-modal.dark-mode checkbox:checked {
  background-color: #87CEEB !important;
  border-color: #87CEEB !important;
}
</style>