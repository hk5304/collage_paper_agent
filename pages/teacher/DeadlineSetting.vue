<template>
  <view :class="{ 'dark-mode': darkMode }">
    <!-- 设置弹窗 - 由父组件通过 v-if 控制显示 -->
    <view class="modal-overlay" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">论文提交截止设置</text>
        </view>

        <view class="modal-body">
          <!-- 加载中提示 -->
          <view v-if="modalLoading" class="loading-container">
            <uni-load-more status="loading" icon-size="24" :color="darkMode ? '#87CEEB' : '#1890ff'"></uni-load-more>
            <text class="loading-text">加载设置中...</text>
          </view>
          
          <view v-else>
            <!-- 年月日设置 -->
            <view class="form-item">
              <text class="form-label">截止日期</text>
              <picker
                mode="date"
                :value="tempDateValue"
                @change="handleDateChange"
                :start="todayDate"
              >
                <view class="picker-display">
                  {{ tempDateValue || '请选择日期' }}
                </view>
              </picker>
            </view>

            <!-- 完整时间预览 -->
            <view class="preview-section">
              <template v-if="dateValue">
                <text class="preview-label">完整截止时间：</text>
                <text class="preview-value">{{ previewDeadline }}</text>
              </template>
              <template v-else>
                <text class="preview-hint">请选择截止日期以设置论文提交截止时间</text>
              </template>
            </view>
          </view>
        </view>

        <view class="modal-footer">
          <button class="cancel-btn" @click="closeModal" :disabled="saving">取消</button>
          <button v-if="ddlId" class="delete-btn" @click="showDeleteConfirm" :disabled="saving">
            <text v-if="deleting">删除中...</text>
            <text v-else>删除</text>
          </button>
          <button class="save-btn" @click="saveSettings" :disabled="saving">
            <text v-if="saving">保存中...</text>
            <text v-else>保存设置</text>
          </button>
        </view>
      </view>
    </view>

    <!-- 自定义删除确认弹窗 -->
    <view v-if="showDeleteModal" class="modal-overlay delete-confirm-overlay" @click="cancelDelete">
      <view class="modal-content delete-confirm-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">确认删除</text>
        </view>
        <view class="modal-body">
          <text class="delete-confirm-text">确定要删除当前的截止日期设置吗？</text>
        </view>
        <view class="modal-footer">
          <button class="cancel-btn" @click="cancelDelete">取消</button>
          <button class="delete-confirm-btn" @click="confirmDelete">
            <text v-if="deleting">删除中...</text>
            <text v-else>确定</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { getDeadlineSetting, saveDeadlineSetting, updateDeadlineSetting, deleteDeadlineSetting } from './api.js';

// 定义 props
const props = defineProps({
  groupId: {
    type: [String, Number],
    default: null
  },
  initialDdlId: {
    type: [String, Number],
    default: null
  }
});

// 定义事件
const emit = defineEmits(['close', 'save', 'delete', 'ddl-loaded']);

// 弹窗状态
const modalLoading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const showDeleteModal = ref(false);

// DDL ID，用于更新已存在的DDL（优先使用父组件传入的）
const ddlId = ref(props.initialDdlId);

// 日期时间值
const dateValue = ref(''); // 已保存的日期（年-月-日）
const tempDateValue = ref(''); // 临时选择的日期（未保存）
const timeValue = ref('23:59:59'); // 固定为23:59:59
const todayDate = ref('');

// 深色模式
const darkMode = ref(false);

// 预览截止时间（只显示已保存的，不随选择实时更新）
const previewDeadline = computed(() => {
  if (!dateValue.value) {
    return '暂无截止日期设置';
  }
  return `${dateValue.value} 23:59:59`;
});

// 初始化
onMounted(async () => {
  // 设置今日日期
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  todayDate.value = `${year}-${month}-${day}`;
  
  // 加载主题设置
  loadThemeSetting();

  // 加载已保存的设置
  await loadDeadlineSetting();
  
  // 监听全局主题变化
  uni.$on('theme-change', handleThemeChange);
});

// 页面卸载取消监听
onUnmounted(() => {
  uni.$off('theme-change', handleThemeChange);
});

/** 清除本地截止日期缓存（避免接口已删仍读旧缓存） */
const clearLocalDeadlineCache = () => {
  uni.removeStorageSync('paper_deadline');
  const gid = props.groupId;
  if (gid != null && gid !== '') {
    uni.removeStorageSync(`paper_deadline_${gid}`);
    uni.removeStorageSync(`paper_remind_day_${gid}`);
  }
};

// 从接口返回中解析出一条 DDL 记录（GET /papers/ddl/list 多为数组）
const pickDdlRecord = (res, teacherId) => {
  if (Array.isArray(res)) {
    if (res.length === 0) return null;
    return (
      res.find(
        (item) =>
          Number(item.teacher_id) === teacherId || String(item.teacher_id) === String(teacherId)
      ) || res[0]
    );
  }
  if (res && typeof res === 'object') {
    if (res.code === 200 && Array.isArray(res.data)) {
      if (res.data.length === 0) return null;
      return (
        res.data.find(
          (item) =>
            Number(item.teacher_id) === teacherId || String(item.teacher_id) === String(teacherId)
        ) || res.data[0]
      );
    }
    if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
      if (res.data.ddl_time || res.data.ddlid || res.data.defaultDeadline) return res.data;
    }
    if (res.ddl_time || res.ddlid || res.defaultDeadline) return res;
  }
  return null;
};

// 加载截止日期设置
const loadDeadlineSetting = async () => {
  try {
    modalLoading.value = true;

    const userInfo = uni.getStorageSync('userInfo');
    const teacherId = Number(userInfo?.id || 1);

    const params = {
      group_id: props.groupId || teacherId,
      teacher_id: teacherId
    };

    const res = await getDeadlineSetting(params);
    const record = pickDdlRecord(res, teacherId);

    // 接口无记录（如 []）：清空 UI，不要用本地缓存顶替
    if (!record) {
      dateValue.value = '';
      tempDateValue.value = '';
      ddlId.value = null;
      emit('ddl-loaded', null);
      clearLocalDeadlineCache();
      return;
    }

    let loadedDate = '';
    const rawTime = record.ddl_time || record.deadline || record.defaultDeadline;
    if (rawTime) {
      const parts = String(rawTime).split(' ');
      loadedDate = parts.length >= 2 ? parts[0] : String(rawTime);
    }

    dateValue.value = loadedDate;
    tempDateValue.value = loadedDate;

    if (record.ddlid != null && record.ddlid !== '') {
      ddlId.value = record.ddlid;
      emit('ddl-loaded', record.ddlid);
    } else {
      ddlId.value = null;
      emit('ddl-loaded', null);
    }
  } catch (err) {
    console.error('加载截止日期设置失败:', err);
    const savedDeadline =
      props.groupId != null && props.groupId !== ''
        ? uni.getStorageSync(`paper_deadline_${props.groupId}`)
        : '';
    const fallback = savedDeadline || uni.getStorageSync('paper_deadline');
    let loadedDate = '';
    if (fallback && fallback !== '未设置') {
      const parts = String(fallback).split(' ');
      loadedDate = parts.length >= 2 ? parts[0] : String(fallback);
    }
    dateValue.value = loadedDate;
    tempDateValue.value = loadedDate;
  } finally {
    modalLoading.value = false;
  }
};

// 处理日期选择（只更新临时值）
const handleDateChange = (e) => {
  tempDateValue.value = e.detail.value;
};

// 保存设置
const saveSettings = async () => {
  // 使用临时值或已保存的值
  const targetDate = tempDateValue.value || dateValue.value;
  if (!targetDate) {
    uni.showToast({
      title: '请选择截止日期',
      icon: 'none'
    });
    return;
  }

  try {
    saving.value = true;
    
    // 获取教师ID
    const userInfo = uni.getStorageSync('userInfo');
    const teacherId = Number(userInfo?.id || 1);
    
    // 拆分日期，时间固定为23:59:59
    const [year, month, day] = targetDate.split('-');
    
    // 构建符合后端要求的参数
    const params = {
      year: Number(year),
      month: Number(month),
      day: Number(day),
      hour: 23,
      minute: 59,
      second: 59,
      teacher_id: teacherId,
      group_id: props.groupId || teacherId // 如果没有 groupId，使用 teacherId 作为默认值
    };
    
    // 根据是否存在 ddlId 决定是创建还是更新
    if (ddlId.value) {
      // 更新：先删除旧DDL，再创建新DDL
      const oldDdlId = ddlId.value;
      await deleteDeadlineSetting(oldDdlId, { teacher_id: teacherId, group_id: props.groupId || teacherId });
      ddlId.value = null; // 清除旧ID
      
      // 创建新DDL
      const res = await saveDeadlineSetting(params);
      if (res && res.ddlid) {
        ddlId.value = res.ddlid;
      }
    } else {
      // 创建新DDL
      const res = await saveDeadlineSetting(params);
      // 如果接口返回了新创建的ID，保存它
      if (res && res.ddlid) {
        ddlId.value = res.ddlid;
      }
    }
    
    // 保存成功后，更新正式值，清空临时值
    dateValue.value = targetDate;
    tempDateValue.value = '';
    
    const fullDeadline = `${dateValue.value} 23:59:59`;
    uni.setStorageSync('paper_deadline', fullDeadline);
    if (props.groupId != null && props.groupId !== '') {
      uni.setStorageSync(`paper_deadline_${props.groupId}`, fullDeadline);
    }
    
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    });
    
    closeModal();
  } catch (err) {
    console.error('保存截止日期设置失败:', err);
    uni.showToast({
      title: '保存失败',
      icon: 'none'
    });
  } finally {
    saving.value = false;
  }
};

// 关闭弹窗
const closeModal = () => {
  saving.value = false;
  deleting.value = false;
  modalLoading.value = false;
  showDeleteModal.value = false;
  // 触发父组件的关闭事件
  emit('close');
};

// 显示删除确认弹窗
const showDeleteConfirm = () => {
  if (!ddlId.value) return;
  showDeleteModal.value = true;
};

// 取消删除
const cancelDelete = () => {
  showDeleteModal.value = false;
  deleting.value = false;
};

// 确认删除DDL
const confirmDelete = async () => {
  if (!ddlId.value) return;
  
  try {
    deleting.value = true;
    
    // 获取教师ID
    const userInfo = uni.getStorageSync('userInfo');
    const teacherId = Number(userInfo?.id || 1);
    
    // 构建参数
    const params = {
      teacher_id: teacherId,
      group_id: props.groupId || teacherId
    };
    
    // 调用删除接口
    await deleteDeadlineSetting(ddlId.value, params);

    clearLocalDeadlineCache();

    // 重置ddlId
    ddlId.value = null;
    dateValue.value = '';
    tempDateValue.value = '';
    
    uni.showToast({
      title: '删除成功',
      icon: 'success'
    });
    
    // 触发父组件的删除事件
    emit('delete');
    closeModal();
  } catch (err) {
    console.error('删除DDL失败:', err);
    uni.showToast({
      title: '删除失败',
      icon: 'none'
    });
  } finally {
    deleting.value = false;
    showDeleteModal.value = false;
  }
};

// 加载主题设置
const loadThemeSetting = (forcedTheme) => {
  try {
    const savedTheme = forcedTheme ?? uni.getStorageSync('dark_mode');
    if (savedTheme !== null) {
      darkMode.value = savedTheme;
    }
  } catch (err) {
    console.error('加载主题设置失败:', err);
  }
};

// 处理主题变化
const handleThemeChange = (isDark) => {
  darkMode.value = isDark;
  uni.setStorageSync('dark_mode', isDark);
};
</script>

<style scoped>
/* 基础样式 - 浅色模式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* iOS风格：现代化卡片弹窗 */
.modal-content {
  width: 85%;
  max-width: 650rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  z-index: 10000;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: modalSlideIn 0.3s ease forwards;
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

/* iOS风格：简洁的头部 */
.modal-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40rpx 40rpx 20rpx;
  background-color: #fff;
}

.modal-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: 1rpx;
}

/* iOS风格：更紧凑的内容区 */
.modal-body {
  padding: 20rpx 0;
}

.loading-container {
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
  margin-top: 24rpx;
  font-weight: 500;
  letter-spacing: 2rpx;
}

/* iOS风格：列表式表单 */
.form-item {
  padding: 30rpx 40rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  transition: all 0.2s ease;
}

.form-item:last-of-type {
  border-bottom: none;
}

.form-item:active {
  background-color: #f5f5f5;
}

.form-label {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
  font-weight: 400;
}

.picker-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  font-size: 32rpx;
  color: #1a1a1a;
  font-weight: 500;
  cursor: pointer;
}

.picker-display::after {
  content: '>';
  font-size: 28rpx;
  color: #c0c0c0;
  margin-left: 10rpx;
}

/* iOS风格：简洁的预览区 */
.preview-section {
  margin: 20rpx 40rpx;
  padding: 30rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
}

.preview-label {
  font-size: 26rpx;
  color: #999;
  font-weight: 400;
  display: block;
  margin-bottom: 12rpx;
}

.preview-value {
  font-size: 34rpx;
  color: #1a1a1a;
  font-weight: 600;
  letter-spacing: 1rpx;
}

.preview-hint {
  font-size: 28rpx;
  color: #999;
  text-align: center;
  display: block;
  padding: 20rpx 0;
}

/* iOS风格：底部通栏按钮 */
.modal-footer {
  display: flex;
  padding: 0;
  border-top: 1rpx solid #e8e8e8;
  background-color: #fff;
}

.cancel-btn, .save-btn {
  flex: 1;
  padding: 32rpx 40rpx;
  border-radius: 0;
  font-size: 30rpx;
  border: none;
  margin: 0;
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

.cancel-btn:hover:not(:disabled) {
  background: #f8f8f8;
}

/* 保存按钮 - 右侧，蓝色主色调 */
.save-btn {
  background: #fff;
  color: #1890ff;
  font-weight: 600;
}

.save-btn:hover:not(:disabled) {
  background: #f0f8ff;
}

/* 删除按钮 - 中间，红色 */
.delete-btn {
  flex: 1;
  padding: 32rpx 40rpx;
  border-radius: 0;
  font-size: 30rpx;
  border: none;
  margin: 0;
  transition: all 0.2s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #fff;
  color: #ff4d4f;
  border-right: 1rpx solid #e8e8e8;
}

.delete-btn:hover:not(:disabled) {
  background: #fff1f0;
}

/* 删除确认弹窗样式 */
.delete-confirm-overlay {
  z-index: 10001;
}

.delete-confirm-modal {
  max-width: 400rpx;
}

.delete-confirm-text {
  font-size: 28rpx;
  color: #666;
  text-align: center;
  padding: 20rpx 40rpx;
  display: block;
}

.delete-confirm-btn {
  flex: 1;
  padding: 32rpx 40rpx;
  border-radius: 0;
  font-size: 30rpx;
  border: none;
  margin: 0;
  transition: all 0.2s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #fff;
  color: #ff4d4f;
}

.delete-confirm-btn:hover:not(:disabled) {
  background: #fff1f0;
}

.cancel-btn:active:not(:disabled), .save-btn:active:not(:disabled) {
  background: #f0f0f0;
}

.cancel-btn:disabled, .save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 深色模式样式 - iOS风格 */
:deep(.dark-mode) {
  .deadline-setting-btn {
    background: #3F3F3F;
    color: #ffffff;
  }
  .deadline-setting-btn:hover:not(:disabled) {
    background: #4a4a4a;
  }
  .deadline-setting-btn:disabled {
    background: #2D2D2D;
    color: rgba(255, 255, 255, 0.3);
  }
  .modal-overlay {
    background: rgba(0, 0, 0, 0.7);
  }
  .modal-content {
    background: #2D2D2D;
  }
  .modal-header {
    background-color: #2D2D2D;
  }
  .modal-title {
    color: #ffffff;
  }
  .loading-container {
    background-color: #1E1E1E;
  }
  .loading-text {
    color: #bbbbbb;
  }
  .form-item {
    background-color: #2D2D2D;
    border-bottom-color: #3F3F3F;
  }
  .form-item:active {
    background-color: #3F3F3F;
  }
  .form-label {
    color: #999;
  }
  .picker-display {
    color: #ffffff;
  }
  .picker-display::after {
    color: #666;
  }
  .preview-section {
    background: #1E1E1E;
  }
  .preview-label {
    color: #999;
  }
  .preview-value {
    color: #ffffff;
  }
  .preview-hint {
    color: #666;
  }
  .modal-footer {
    background-color: #2D2D2D;
    border-top-color: #3F3F3F;
  }
  .cancel-btn {
    background: #2D2D2D;
    color: #bbbbbb;
    border-right-color: #3F3F3F;
  }
  .cancel-btn:hover:not(:disabled) {
    background: #3F3F3F;
  }
  .save-btn {
    background: #2D2D2D;
    color: #87CEEB;
  }
  .save-btn:hover:not(:disabled) {
    background: #3F3F3F;
  }
  .delete-btn {
    background: #2D2D2D;
    color: #ff7875;
    border-right-color: #3F3F3F;
  }
  .delete-btn:hover:not(:disabled) {
    background: #3F3F3F;
  }
  .delete-confirm-text {
    color: #bbbbbb;
  }
  .delete-confirm-btn {
    background: #2D2D2D;
    color: #ff7875;
  }
  .delete-confirm-btn:hover:not(:disabled) {
    background: #3F3F3F;
  }
  .cancel-btn:disabled, .save-btn:disabled, .delete-btn:disabled, .delete-confirm-btn:disabled {
    background: #2D2D2D;
    color: rgba(255, 255, 255, 0.3);
  }
}
</style>
