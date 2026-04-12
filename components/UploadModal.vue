<template>
  <view class="upload-modal" @click="$emit('close')">
    <view class="upload-content" @click.stop>
      <view class="upload-header">
        <text class="upload-title">上传论文</text>
        <text class="close-btn" @click="$emit('close')">×</text>
      </view>
      <view class="upload-body">
        <view class="upload-tips">
          <text>支持格式：.docx、.doc</text>
          <text>文件大小：≤100MB</text>
        </view>
        <button class="upload-btn" @click="$emit('choose-file')">选择文件</button>
        <view v-if="selectedFile" class="file-info">
          <text class="file-name">{{ selectedFile.name }}</text>
          <text class="file-size">{{ formatFileSize(selectedFile.size) }}</text>
        </view>
        <view class="final-version-option">
          <checkbox-group @change="handleFinalVersionChange">
            <label class="checkbox-label">
              <checkbox value="final" :checked="isFinalVersion" />
              <text>本次为最终版本</text>
            </label>
          </checkbox-group>
        </view>
        <button class="submit-btn" :disabled="!selectedFile" @click="$emit('submit')">提交</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    selectedFile: {
      type: Object,
      default: null
    },
    isFinalVersion: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleFinalVersionChange(e) {
      this.$emit('final-version-change', e);
    },
    formatFileSize(size) {
      if (size < 1024) return size + 'B';
      if (size < 1024 * 1024) return (size / 1024).toFixed(2) + 'KB';
      return (size / (1024 * 1024)).toFixed(2) + 'MB';
    }
  }
};
</script>

<style scoped>
.upload-modal {
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

.upload-content {
  width: 90%;
  max-width: 800rpx;
  background: #fff;
  border-radius: 20rpx;
  box-sizing: border-box;
  overflow: hidden;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.1);
}

.upload-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #e2e8f0;
}

.upload-title {
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

/* ==================== 深色模式 ==================== */
:global(.dark-mode) .upload-content {
  background: #252525;
  background-color: #252525;
}

:global(.dark-mode) .upload-header {
  border-bottom-color: #3a3a3a;
}

:global(.dark-mode) .upload-title {
  color: #ffffff;
}

:global(.dark-mode) .close-btn {
  color: #aaaaaa;
}

:global(.dark-mode) .upload-body {
  background-color: #252525;
}

:global(.dark-mode) .upload-tips {
  color: #cccccc;
}

:global(.dark-mode) .upload-btn {
  background-color: #1890ff;
}

:global(.dark-mode) .file-info {
  background-color: #333333;
  border-color: #444444;
}

:global(.dark-mode) .file-name {
  color: #ffffff;
}

:global(.dark-mode) .file-size {
  color: #aaaaaa;
}

:global(.dark-mode) .submit-btn {
  background-color: #1890ff;
}

:global(.dark-mode) .submit-btn:disabled {
  background-color: #444444;
  color: #888888;
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .upload-content {
    width: 95%;
  }
}
</style>