<template>
  <view class="confirm-modal-backdrop" v-if="visible" @click.self="handleCancel">
    <view class="confirm-modal-content">
      <view class="confirm-modal-header">
        <text class="confirm-modal-title">{{ title }}</text>
        <text class="confirm-modal-close" @click="handleCancel">×</text>
      </view>
      <view class="confirm-modal-body">
        <text class="confirm-modal-message">{{ content }}</text>
      </view>
      <view class="confirm-modal-footer">
        <button class="confirm-btn cancel" @click="handleCancel">{{ cancelText }}</button>
        <button class="confirm-btn confirm" @click="handleConfirm">{{ confirmText }}</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ConfirmModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '提示'
    },
    content: {
      type: String,
      default: ''
    },
    confirmText: {
      type: String,
      default: '确定'
    },
    cancelText: {
      type: String,
      default: '取消'
    }
  },
  methods: {
    handleConfirm() {
      this.$emit('confirm');
    },
    handleCancel() {
      this.$emit('cancel');
    }
  }
};
</script>

<style scoped>
.confirm-modal-backdrop {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: rgba(0, 0, 0, 0.6) !important;
  z-index: 1000 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.confirm-modal-content {
  width: 90%;
  max-width: 400px;
  background: #ffffff !important;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: contentIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

@keyframes contentIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.confirm-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 24px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
  box-sizing: border-box;
}

.confirm-modal-title {
  font-size: 16px;
  font-weight: 800;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #005bbf;
  line-height: 1.2;
  letter-spacing: -0.01em;
  text-align: center;
  flex: 1;
}

.confirm-modal-close {
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

.confirm-modal-close:hover {
  color: #191c1d;
  background: #f3f4f5;
}

.confirm-modal-body {
  padding: 20px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
}

.confirm-modal-message {
  font-size: 0.875rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #191c1d;
  line-height: 1.8;
  text-align: center;
}

.confirm-modal-footer {
  display: flex;
  padding: 16px 24px 24px;
  gap: 12px;
  background: #ffffff;
}

.confirm-btn {
  flex: 1;
  height: 44px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-btn.cancel {
  background: #f3f4f5;
  color: #5f6368;
}

.confirm-btn.cancel:hover {
  background: #e5e7eb;
}

.confirm-btn.confirm {
  background: #005bbf;
  color: #fff;
}

.confirm-btn.confirm:hover {
  background: #004a9a;
}

/* ==================== 深色模式 ==================== */
:global(.dark-mode) .confirm-modal-backdrop {
  background: rgba(0, 0, 0, 0.7) !important;
}

:global(.dark-mode) .confirm-modal-content {
  background: #2d3748 !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

:global(.dark-mode) .confirm-modal-header {
  background: #2d3748;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

:global(.dark-mode) .confirm-modal-title {
  color: #8ab4f8;
}

:global(.dark-mode) .confirm-modal-close {
  color: #9aa0a6;
}

:global(.dark-mode) .confirm-modal-close:hover {
  color: #ffffff;
  background: #383838;
}

:global(.dark-mode) .confirm-modal-body {
  background: #2d3748;
}

:global(.dark-mode) .confirm-modal-message {
  color: #e8eaed;
}

:global(.dark-mode) .confirm-modal-footer {
  background: #2d3748;
}

:global(.dark-mode) .confirm-btn.cancel {
  background: #383838;
  color: #e8eaed;
}

:global(.dark-mode) .confirm-btn.cancel:hover {
  background: #484848;
}

:global(.dark-mode) .confirm-btn.confirm {
  background: #8ab4f8;
  color: #202124;
}

:global(.dark-mode) .confirm-btn.confirm:hover {
  background: #9cc4f9;
}
</style>
