<template>
  <view class="teacher-select-modal" @click.stop>
    <view class="teacher-select-content" @click.stop>
      <view class="modal-header">
        <text class="modal-title">选择指导教师</text>
        <text class="close-btn" @click="$emit('close')">×</text>
      </view>
      <view class="modal-body">
        <view class="input-group">
          <text class="input-label">教师姓名：</text>
          <input 
            v-model="localTeacherName" 
            class="teacher-input" 
            placeholder="请输入教师姓名"
            maxlength="50"
            :focus="true"
            @input="handleTeacherNameChange"
          />
        </view>
      </view>
      <view class="modal-footer">
        <button class="modal-btn cancel-btn" @click="$emit('close')">取消</button>
        <button class="modal-btn confirm-btn" @click="$emit('confirm')">确定</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    teacherName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      localTeacherName: this.teacherName
    };
  },
  watch: {
    teacherName: {
      handler(newVal) {
        this.localTeacherName = newVal;
      },
      immediate: true
    }
  },
  methods: {
    handleTeacherNameChange(e) {
      this.localTeacherName = e.detail.value;
      this.$emit('teacher-name-change', this.localTeacherName);
    }
  }
};
</script>

<style scoped>
.teacher-select-modal {
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

.teacher-select-content {
  width: 90%;
  max-width: 600rpx;
  background: #fff;
  border-radius: 20rpx;
  box-sizing: border-box;
  overflow: hidden;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #e2e8f0;
}

.modal-title {
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

/* ==================== 深色模式 ==================== */
:global(.dark-mode) .teacher-select-content {
  background: #252525;
  background-color: #252525;
}

:global(.dark-mode) .modal-header {
  border-bottom-color: #3a3a3a;
}

:global(.dark-mode) .modal-title {
  color: #ffffff;
}

:global(.dark-mode) .close-btn {
  color: #aaaaaa;
}

:global(.dark-mode) .modal-body {
  background-color: #252525;
}

:global(.dark-mode) .input-label {
  color: #cccccc;
}

:global(.dark-mode) .teacher-input {
  background-color: #333333;
  border-color: #444444;
  color: #ffffff;
}

:global(.dark-mode) .teacher-input::placeholder {
  color: #888888;
}

:global(.dark-mode) .modal-footer {
  border-top-color: #3a3a3a;
  background-color: #252525;
}

:global(.dark-mode) .cancel-btn {
  background-color: #333333;
  color: #ffffff;
  border-color: #444444;
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .teacher-select-content {
    width: 95%;
  }
}
</style>