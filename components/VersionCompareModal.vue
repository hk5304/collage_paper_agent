<template>
  <view class="compare-modal" @click="$emit('close')">
    <view class="compare-content" @click.stop>
      <view class="compare-header">
        <text class="compare-title">版本对比</text>
        <text class="close-btn" @click="$emit('close')">×</text>
      </view>
      <view class="compare-body">
        <view class="version-selector">
          <picker mode="selector" :range="versionOptions" range-key="label" @change="handleVersion1Change">
            <view class="picker-view"><text>版本1：{{ version1Label }}</text></view>
          </picker>
          <picker mode="selector" :range="versionOptions" range-key="label" @change="handleVersion2Change">
            <view class="picker-view"><text>版本2：{{ version2Label }}</text></view>
          </picker>
        </view>
        <scroll-view class="compare-result" :scroll-y="true">
          <view class="diff-content">
            <text class="diff-placeholder">版本对比结果将显示在这里</text>
            <view class="diff-item added"><text>+ 新增内容</text></view>
            <view class="diff-item deleted"><text>- 删除内容</text></view>
            <view class="diff-item modified"><text>~ 修改内容</text></view>
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
    version1: {
      type: [String, Number],
      default: null
    },
    version2: {
      type: [String, Number],
      default: null
    },
    version1Label: {
      type: String,
      default: '请选择版本1'
    },
    version2Label: {
      type: String,
      default: '请选择版本2'
    }
  },
  computed: {
    versionOptions() {
      if (!this.paper) return [];
      return this.paper.versions.map(v => ({
        label: `v${v.version} - ${v.updateTime}`,
        value: v.version
      }));
    }
  },
  methods: {
    handleVersion1Change(e) {
      this.$emit('version1-change', e);
    },
    handleVersion2Change(e) {
      this.$emit('version2-change', e);
    }
  }
};
</script>

<style scoped>
.compare-modal {
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

.compare-content {
  width: 90%;
  max-width: 800rpx;
  background: #fff;
  border-radius: 20rpx;
  box-sizing: border-box;
  overflow: hidden;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.1);
}

.compare-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #e2e8f0;
}

.compare-title {
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

.compare-body {
  padding: 30rpx;
}

.version-selector {
  display: flex;
  flex-direction: column;
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

/* ==================== 深色模式 ==================== */
:global(.dark-mode) .compare-content {
  background: #252525;
  background-color: #252525;
}

:global(.dark-mode) .compare-header {
  border-bottom-color: #3a3a3a;
}

:global(.dark-mode) .compare-title {
  color: #ffffff;
}

:global(.dark-mode) .close-btn {
  color: #aaaaaa;
}

:global(.dark-mode) .compare-body {
  background-color: #252525;
}

:global(.dark-mode) .picker-view {
  background-color: #333333;
  border-color: #444444;
  color: #ffffff;
}

:global(.dark-mode) .compare-result {
  background-color: #1a1a1a;
  border-color: #444444;
}

:global(.dark-mode) .diff-line {
  border-bottom-color: #3a3a3a;
}

:global(.dark-mode) .line-number {
  color: #888888;
  background-color: #333333;
}

:global(.dark-mode) .line-content {
  color: #ffffff;
}

:global(.dark-mode) .added {
  background-color: #1a4a1a;
  color: #4caf50;
}

:global(.dark-mode) .deleted {
  background-color: #4a1a1a;
  color: #ff8a80;
}

:global(.dark-mode) .modified {
  background-color: #4a3a1a;
  color: #ffc107;
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .compare-content {
    width: 95%;
  }
  
  .compare-result {
    height: 300rpx;
  }
}
</style>