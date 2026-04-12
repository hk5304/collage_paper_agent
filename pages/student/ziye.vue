/* 上传弹窗 - 优化：表单样式统一，按钮正式 */
<template>
  <view>
    页面内容
  </view>
</template>

<script>
export default {
  data() {
    return {}
  }
}
</script>

<style>
</style>
.upload-form {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}
.upload-tips {
	display: flex;
	justify-content: space-between;
	font-size: 22rpx;
	color: #6c757d;
	padding: 16rpx;
	background-color: #f8f9fa;
	border-radius: 8rpx;
	border: 1rpx solid #e9ecef;
}
.select-file-btn {
	padding: 24rpx;
	background-color: #2c5282;
	color: #ffffff;
	border-radius: 8rpx;
	font-size: 28rpx;
	border: none;
}
.select-file-btn:active {
	background-color: #234369;
}
.file-info {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 16rpx;
	background-color: #f8f9fa;
	border-radius: 8rpx;
	border: 1rpx solid #e9ecef;
}
.file-name {
	font-size: 24rpx;
	color: #2d3748;
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.file-size {
	font-size: 22rpx;
	color: #6c757d;
}
.final-version-checkbox {
	padding: 16rpx 0;
}
.checkbox-label {
	display: flex;
	align-items: center;
	font-size: 26rpx;
	color: #2d3748;
}
checkbox {
	margin-right: 12rpx;
}
.submit-btn {
	padding: 24rpx;
	background-color: #2c5282;
	color: #ffffff;
	border-radius: 8rpx;
	font-size: 28rpx;
	border: none;
}
.submit-btn:disabled {
	background-color: #adb5bd;
	cursor: not-allowed;
}

/* 版本对比弹窗 - 优化：布局清晰，样式统一 */
.version-selectors {
	display: flex;
	gap: 24rpx;
	margin-bottom: 24rpx;
}
.version-select {
	flex: 1;
}
.version-picker {
	width: 100%;
}
.compare-result {
	padding: 24rpx 16rpx;
	background-color: #f8f9fa;
	border-radius: 8rpx;
	border: 1rpx solid #e9ecef;
}
.diff-content {
	margin-top: 16rpx;
	font-size: 26rpx;
	color: #2d3748;
	line-height: 1.6;
}

/* 教师选择弹窗 - 优化：输入框样式正式 */
.teacher-input {
	margin-bottom: 24rpx;
}
.input-text {
	width: 100%;
	padding: 24rpx;
	border-radius: 8rpx;
	border: 1rpx solid #e9ecef;
	font-size: 28rpx;
	color: #2d3748;
	background-color: #f8f9fa;
}
.input-text::placeholder {
	color: #adb5bd;
}
.confirm-teacher-btn {
	width: 100%;
	padding: 24rpx;
	background-color: #2c5282;
	color: #ffffff;
	border-radius: 8rpx;
	font-size: 28rpx;
	border: none;
}
.confirm-teacher-btn:active {
	background-color: #234369;
}

/* 适配小屏设备 - 计测学院师生多端使用兼容 */
@media (max-width: 750rpx) {
	.main-layout {
		flex-direction: column;
	}
	.sidebar {
		width: 100%;
	}
	.version-selectors {
		flex-direction: column;
	}
	.paper-actions {
		flex-direction: column;
	}
	.action-btn {
		width: 100%;
	}
}