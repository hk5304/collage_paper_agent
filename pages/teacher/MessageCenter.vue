<template>
	<view class="message-center-container" :class="{ 'dark-mode': darkMode }">
		<!-- 页面加载动画 -->
		<view v-if="loading" class="loading-container">
			<view class="loading-spinner"></view>
			<text class="loading-text">加载中...</text>
		</view>
		
		<view v-else class="message-content">
			<!-- 页面头部 -->
			<view class="page-header">
				<view class="back-btn" @click="goBack">
					<text class="back-btn-icon">←</text>
				</view>
				<text class="header-title">消息中心</text>
				<view class="header-actions">
					<view class="mark-all-read" @click="markAllAsRead" v-if="hasUnread">
						<text class="mark-text">全部已读</text>
					</view>
				</view>
			</view>
			
			<!-- 消息列表 -->
			<view class="message-list">
				<view 
					class="message-item" 
					:class="{unread: !message.read}" 
					v-for="(message, index) in filteredMessages" 
					:key="index" 
					:style="{ animationDelay: index * 0.05 + 's' }"
					@click="viewMessage(message)">
					<view class="message-icon">
						<text class="icon-text">{{ getTypeIcon(message.type) }}</text>
					</view>
					<view class="message-content">
						<view class="message-header">
							<text class="message-title">{{ message.title }}</text>
							<view class="message-time">{{ formatTime(message.time) }}</view>
						</view>
						<text class="message-desc">{{ message.content }}</text>
						<view class="message-footer">
							<text class="message-source">{{ message.source }}</text>
							<view class="unread-dot" v-if="!message.read"></view>
						</view>
					</view>
				</view>
				
				<!-- 空状态 -->
				<view v-if="loadError && filteredMessages.length === 0" class="empty-state">
					<text class="empty-icon">📭</text>
					<text class="empty-text" style="color: #ff4d4f;">加载失败，请刷新后重试</text>
				</view>
				<view v-else-if="filteredMessages.length === 0" class="empty-state">
					<text class="empty-icon">📭</text>
					<text class="empty-text">暂无消息</text>
				</view>
			</view>
			
			<!-- 自定义消息详情弹窗 -->
			<view v-if="showMessageDetail" class="message-detail-modal" @click="closeMessageDetail">
				<view class="message-detail-content" @click.stop>
					<view class="message-detail-header">
						<text class="message-detail-title">{{ currentMessage.title }}</text>
						<view class="close-btn" @click="closeMessageDetail">
							<text class="close-icon">×</text>
						</view>
					</view>
					<view class="message-detail-body">
						<view class="message-detail-info">
							<view class="info-item">
								<text class="info-label">来源：</text>
								<text class="info-value">{{ currentMessage.source }}</text>
							</view>
							<view class="info-item">
								<text class="info-label">时间：</text>
								<text class="info-value">{{ formatTime(currentMessage.time) }}</text>
							</view>
							<view class="info-item">
								<text class="info-label">类型：</text>
								<text class="info-value">{{ getTypeName(currentMessage.type) }}</text>
							</view>
						</view>
						<view class="message-detail-text">
							<text class="text-content">{{ currentMessage.content }}</text>
						</view>
					</view>
					<view class="message-detail-footer">
						<view class="confirm-btn" @click="closeMessageDetail">
							<text class="confirm-text">确定</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { 
	getMessageList, 
	markMessageAsRead, 
	markAllMessagesAsRead, 
	getUnreadMessageCount 
} from './api.js';

export default {
	data() {
		return {
			loading: true,
			loadError: false,
			currentFilter: 'all',
			messages: [],
			darkMode: false,
			showMessageDetail: false,
			currentMessage: {}
		}
	},
	computed: {
		filteredMessages() {
			if (this.currentFilter === 'all') {
				return this.messages;
			} else if (this.currentFilter === 'unread') {
				return this.messages.filter(m => !m.read);
			} else {
				return this.messages.filter(m => m.type === this.currentFilter);
			}
		},
		unreadCount() {
			return this.messages.filter(m => !m.read).length;
		},
		hasUnread() {
			return this.unreadCount > 0;
		}
	},
	onLoad() {
		this.loadMessages();
		this.loadThemeSetting();
	},
	methods: {
		goBack() {
			// 尝试返回上一页，如果失败则跳转到教师首页
			const pages = getCurrentPages();
			if (pages.length > 1) {
				uni.navigateBack({
					success: () => {
						console.log('返回成功');
					},
					fail: () => {
						console.log('返回失败，跳转到教师首页');
						uni.redirectTo({
							url: '/pages/teacher/dashboard'
						});
					}
				});
			} else {
				// 没有上一页，直接跳转到教师首页
				console.log('没有上一页，跳转到教师首页');
				uni.redirectTo({
					url: '/pages/teacher/dashboard'
				});
			}
		},
		async loadMessages() {
			try {
				this.loading = true;
				this.loadError = false;
				
				// 获取当前用户ID
				const userInfo = uni.getStorageSync('userInfo');
				const teacherId = userInfo ? (userInfo.id || userInfo.sub || userInfo.user_id) : null;
				
				console.log('当前用户信息:', userInfo);
				console.log('教师ID:', teacherId);
				
				// 构建 current_user 参数
				const currentUser = {
					sub: teacherId || 0,
					username: userInfo ? (userInfo.username || 'teacher') : 'teacher',
					roles: ['teacher']
				};
				
				const params = { 
					filter: this.currentFilter
				};
				
				const res = await getMessageList(params, currentUser);
				
				console.log('消息查询响应:', res);
				
				// 适配后端返回的数据结构
				let messageList = [];
				let apiSuccess = false;
				console.log('完整响应:', res);
					
				// 处理不同可能的响应结构
				let responseData = res;
				if (res && res.statusCode === 200 && res.data) {
					responseData = res.data;
				}
					
				// 后端返回格式: { items: [...], total: 1, ... }
				if (responseData && Array.isArray(responseData.items)) {
					apiSuccess = true;
					console.log('items数组长度:', responseData.items.length);
					messageList = responseData.items.map(item => {
						console.log('处理item:', item);
						return this.formatMessage(item);
					});
				} else if (Array.isArray(responseData)) {
					apiSuccess = true;
					messageList = responseData.map(item => this.formatMessage(item));
				}
					
				if (apiSuccess) {
					this.messages = messageList;
				} else {
					this.loadError = true;
					this.messages = [];
				}
				console.log('最终消息列表:', this.messages);
			} catch (err) {
				console.error('加载消息失败:', err);
				this.loadError = true;
				this.messages = [];
			} finally {
				this.loading = false;
			}
		},
		
		// 格式化后端消息数据为前端需要的格式
		formatMessage(item) {
			console.log('格式化消息item:', item);
			console.log('item字段:', Object.keys(item));
			console.log('title:', item.title, 'content:', item.content);
			
			// 处理时间字段，确保有效
			let timeValue = Date.now();
			try {
				const timeStr = item.received_time || item.operation_time || item.created_at;
				if (timeStr) {
					const parsed = new Date(timeStr).getTime();
					if (!isNaN(parsed)) {
						timeValue = parsed;
					}
				}
			} catch (e) {
				console.warn('时间解析失败:', e);
			}
			
			return {
				id: item.id,
				type: item.source || 'system',
				title: item.title || '无标题',
				content: item.content || '',
				source: item.sender_name || item.username || item.target_username || '系统',
				time: timeValue,
				read: item.status !== 'unread'
			};
		},
		getTypeIcon(type) {
			const iconMap = {
				'upload': '📤',
				'review': '✏️',
				'status': '📋',
				'download': '📥',
				'deadline': '📅'
			};
			return iconMap[type] || '📬';
		},
		getFilterCount(type) {
			return this.messages.filter(m => m.type === type).length;
		},
		formatTime(timestamp) {
			const now = Date.now();
			const diff = now - timestamp;
			const minutes = Math.floor(diff / (1000 * 60));
			const hours = Math.floor(diff / (1000 * 60 * 60));
			const days = Math.floor(diff / (1000 * 60 * 60 * 24));
			
			if (days > 0) {
				return `${days}天前`;
			} else if (hours > 0) {
				return `${hours}小时前`;
			} else if (minutes > 0) {
				return `${minutes}分钟前`;
			} else {
				return '刚刚';
			}
		},
		async viewMessage(message) {
			try {
				if (!message.read) {
					await markMessageAsRead(message.id);
					message.read = true;
				}
				this.currentMessage = message;
				this.showMessageDetail = true;
			} catch (err) {
				console.error('查看消息失败:', err);
				// 降级处理，即使接口失败也显示详情
				this.currentMessage = message;
				this.showMessageDetail = true;
			}
		},
		closeMessageDetail() {
			this.showMessageDetail = false;
			this.currentMessage = {};
		},
		getTypeName(type) {
			const nameMap = {
				'upload': '论文上传',
				'review': '论文批注',
				'status': '状态更新',
				'download': '论文下载',
				'deadline': '截止日期'
			};
			return nameMap[type] || '其他';
		},
		async markAllAsRead() {
			try {
				await markAllMessagesAsRead();
				this.messages.forEach(m => m.read = true);
				uni.showToast({
					title: '已全部标记为已读',
					icon: 'success'
				});
			} catch (err) {
				console.error('标记全部已读失败:', err);
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
/* 全局样式 */
.message-center-container {
	min-height: 100vh;
	background-color: #f5f5f5;
	font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
}

.message-content {
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 加载动画 */
.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 100vh;
	background-color: #f5f5f5;
}

.loading-spinner {
	width: 80rpx;
	height: 80rpx;
	border: 8rpx solid rgba(24, 144, 255, 0.1);
	border-left-color: #1890ff;
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin-bottom: 30rpx;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}

.loading-text {
	font-size: 30rpx;
	color: #666;
	font-weight: 500;
}

/* 页面头部 */
.page-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx;
	background-color: #fff;
	border-bottom: 1px solid #e0e0e0;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	position: sticky;
	top: 0;
	z-index: 10;
}

.back-btn {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	cursor: pointer;
}

.back-btn:hover {
	background-color: #f0f0f0;
	transform: scale(1.1);
}

.back-btn-icon {
	font-size: 40rpx;
	color: #1890ff;
	font-weight: bold;
}

.header-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	flex: 1;
	text-align: center;
	letter-spacing: 2rpx;
}

.header-actions {
	display: flex;
	align-items: center;
}

.mark-all-read {
	padding: 12rpx 24rpx;
	background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
	color: #fff;
	border-radius: 20rpx;
	font-size: 26rpx;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	cursor: pointer;
	box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.2);
}

.mark-all-read:hover {
	transform: translateY(-2rpx);
	box-shadow: 0 6rpx 16rpx rgba(24, 144, 255, 0.3);
}

.mark-text {
	font-weight: 500;
}

/* 筛选标签 */
.filter-tabs {
	display: flex;
	background-color: #fff;
	padding: 20rpx;
	border-bottom: 1px solid #e0e0e0;
	overflow-x: auto;
	white-space: nowrap;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.filter-tab {
	display: flex;
	align-items: center;
	padding: 18rpx 24rpx;
	margin-right: 15rpx;
	border-radius: 25rpx;
	color: #666;
	font-size: 26rpx;
	font-weight: 500;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	cursor: pointer;
	white-space: nowrap;
	position: relative;
	background-color: #fafafa;
}

.filter-tab:last-child {
	margin-right: 0;
}

.filter-tab:hover {
	background-color: #e6f7ff;
	color: #1890ff;
	transform: translateY(-2rpx);
	box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.15);
}

.filter-tab.active {
	background-color: #1890ff;
	color: #fff;
}

.tab-text {
	margin-right: 10rpx;
}

.tab-count {
	background-color: rgba(255, 77, 79, 0.9);
	color: #fff;
	padding: 4rpx 12rpx;
	border-radius: 15rpx;
	font-size: 22rpx;
	font-weight: bold;
	min-width: 30rpx;
	text-align: center;
	box-shadow: 0 2rpx 8rpx rgba(255, 77, 79, 0.2);
}

/* 消息列表 */
.message-list {
	padding: 20rpx;
}

.message-item {
	display: flex;
	background-color: #fff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	animation: messageFadeIn 0.6s ease-out forwards;
	opacity: 0;
	transform: translateY(20rpx);
	cursor: pointer;
	position: relative;
	overflow: hidden;
}

@keyframes messageFadeIn {
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.message-item:hover {
	transform: translateY(-5rpx);
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
}

.message-item.unread {
	background: linear-gradient(135deg, #fff 0%, #f0f8ff 100%);
	border-left: 6rpx solid #1890ff;
}

.message-item.unread::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 4rpx;
	background: linear-gradient(90deg, #1890ff, #40a9ff);
}

.message-icon {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 25rpx;
	flex-shrink: 0;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.message-item:hover .message-icon {
	transform: scale(1.1) rotate(5deg);
}

.icon-text {
	font-size: 48rpx;
}

.message-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;
}

.message-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 15rpx;
}

.message-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	flex: 1;
	margin-right: 20rpx;
	line-height: 1.4;
}

.message-time {
	font-size: 24rpx;
	color: #999;
	white-space: nowrap;
	flex-shrink: 0;
}

.message-desc {
	font-size: 28rpx;
	color: #666;
	line-height: 1.6;
	margin-bottom: 15rpx;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.message-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.message-source {
	font-size: 24rpx;
	color: #999;
	background-color: #f0f0f0;
	padding: 6rpx 16rpx;
	border-radius: 12rpx;
}

.unread-dot {
	width: 12rpx;
	height: 12rpx;
	background-color: #ff4d4f;
	border-radius: 50%;
	box-shadow: 0 2rpx 6rpx rgba(255, 77, 79, 0.3);
	animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
	0%, 100% {
		opacity: 1;
	}
	50% {
		opacity: 0.5;
	}
}

/* 空状态 */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 0;
}

.empty-icon {
	font-size: 120rpx;
	margin-bottom: 30rpx;
	opacity: 0.3;
}

.empty-text {
	font-size: 32rpx;
	color: #999;
	font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 750rpx) {
	.filter-tabs {
		padding: 15rpx;
	}
	
	.filter-tab {
		padding: 15rpx 20rpx;
		margin-right: 10rpx;
		font-size: 24rpx;
	}
	
	.tab-count {
		padding: 3rpx 10rpx;
		font-size: 20rpx;
	}
	
	.message-item {
		padding: 25rpx;
	}
	
	.message-icon {
		width: 80rpx;
		height: 80rpx;
		margin-right: 20rpx;
	}
	
	.icon-text {
		font-size: 40rpx;
	}
	
	.message-title {
		font-size: 28rpx;
	}
	
	.message-desc {
		font-size: 26rpx;
	}
	
	.message-time {
		font-size: 22rpx;
	}
	
	.message-source {
		font-size: 22rpx;
	}
}

/* 深色模式样式 */
.message-center-container.dark-mode {
	background-color: #121212;
}

.message-center-container.dark-mode .loading-container {
	background-color: #121212;
}

.message-center-container.dark-mode .loading-text {
	color: #ffffff;
}

.message-center-container.dark-mode .page-header {
	background-color: #1E1E1E;
	border-bottom-color: #3F3F3F;
}

.message-center-container.dark-mode .back-btn:hover {
	background-color: #2D2D2D;
}

.message-center-container.dark-mode .back-btn-icon {
	color: #87CEEB;
}

.message-center-container.dark-mode .header-title {
	color: #ffffff;
}

.message-center-container.dark-mode .filter-tabs {
	background-color: #1E1E1E;
	border-bottom-color: #3F3F3F;
}

.message-center-container.dark-mode .filter-tab {
	background-color: #2D2D2D;
	color: #ffffff;
}

.message-center-container.dark-mode .filter-tab:hover {
	background-color: #3F3F3F;
	color: #87CEEB;
}

.message-center-container.dark-mode .filter-tab.active {
	background-color: #87CEEB;
	color: #121212;
}

.message-center-container.dark-mode .message-item {
	background-color: #2D2D2D;
}

.message-center-container.dark-mode .message-item:hover {
	background-color: #3F3F3F;
}

.message-center-container.dark-mode .message-item.unread {
	background: linear-gradient(135deg, #2D2D2D 0%, #1E1E1E 100%);
	border-left-color: #87CEEB;
}

.message-center-container.dark-mode .message-item.unread::before {
	background: linear-gradient(90deg, #87CEEB, #98FB98);
}

.message-center-container.dark-mode .message-title {
	color: #ffffff;
}

.message-center-container.dark-mode .message-time {
	color: #ffffff;
}

.message-center-container.dark-mode .message-desc {
	color: #e0e0e0;
}

.message-center-container.dark-mode .message-source {
	background-color: #3F3F3F;
	color: #ffffff;
}

.message-center-container.dark-mode .empty-text {
	color: #ffffff;
}

/* ==================== 消息详情弹窗 ==================== */
.message-detail-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.6);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

.message-detail-content {
	width: 90%;
	max-width: 600rpx;
	max-height: 80vh;
	background-color: #fff;
	border-radius: 20rpx;
	box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.2);
	display: flex;
	flex-direction: column;
	animation: slideUp 0.3s ease-out;
	overflow: hidden;
}

@keyframes slideUp {
	from {
		transform: translateY(50rpx);
		opacity: 0;
	}
	to {
		transform: translateY(0);
		opacity: 1;
	}
}

.message-detail-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx;
	border-bottom: 1px solid #e0e0e0;
	background-color: #f8f8f8;
}

.message-detail-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	flex: 1;
	margin-right: 20rpx;
	line-height: 1.4;
}

.close-btn {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background-color: #f0f0f0;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	cursor: pointer;
}

.close-btn:hover {
	background-color: #e0e0e0;
	transform: scale(1.1);
}

.close-icon {
	font-size: 50rpx;
	color: #666;
	font-weight: bold;
	line-height: 1;
}

.message-detail-body {
	padding: 30rpx;
	overflow-y: auto;
	flex: 1;
}

.message-detail-info {
	display: flex;
	flex-direction: column;
	gap: 15rpx;
	margin-bottom: 30rpx;
	padding: 20rpx;
	background-color: #f8f8f8;
	border-radius: 12rpx;
}

.info-item {
	display: flex;
	align-items: center;
}

.info-label {
	font-size: 26rpx;
	color: #666;
	font-weight: 500;
	margin-right: 10rpx;
	flex-shrink: 0;
}

.info-value {
	font-size: 26rpx;
	color: #333;
	flex: 1;
}

.message-detail-text {
	padding: 20rpx;
	background-color: #fafafa;
	border-radius: 12rpx;
	border-left: 4rpx solid #1890ff;
}

.text-content {
	font-size: 28rpx;
	color: #333;
	line-height: 1.8;
	word-wrap: break-word;
}

.message-detail-footer {
	padding: 20rpx 30rpx;
	border-top: 1px solid #e0e0e0;
	background-color: #f8f8f8;
	display: flex;
	justify-content: flex-end;
}

.confirm-btn {
	padding: 15rpx 40rpx;
	background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
	color: #fff;
	border-radius: 25rpx;
	font-size: 28rpx;
	font-weight: 500;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	cursor: pointer;
	box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.3);
}

.confirm-btn:hover {
	transform: translateY(-2rpx);
	box-shadow: 0 6rpx 16rpx rgba(24, 144, 255, 0.4);
}

.confirm-btn:active {
	transform: translateY(0);
	box-shadow: 0 2rpx 8rpx rgba(24, 144, 255, 0.2);
}

.confirm-text {
	font-weight: 500;
}

/* ==================== 消息详情弹窗深色模式 ==================== */
.message-center-container.dark-mode .message-detail-modal {
	background-color: rgba(0, 0, 0, 0.8);
}

.message-center-container.dark-mode .message-detail-content {
	background-color: #1E1E1E;
	box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.5);
}

.message-center-container.dark-mode .message-detail-header {
	background-color: #2D2D2D;
	border-bottom-color: #3F3F3F;
}

.message-center-container.dark-mode .message-detail-title {
	color: #ffffff;
}

.message-center-container.dark-mode .close-btn {
	background-color: #3F3F3F;
}

.message-center-container.dark-mode .close-btn:hover {
	background-color: #4F4F4F;
}

.message-center-container.dark-mode .close-icon {
	color: #ffffff;
}

.message-center-container.dark-mode .message-detail-info {
	background-color: #2D2D2D;
}

.message-center-container.dark-mode .info-label {
	color: #e0e0e0;
}

.message-center-container.dark-mode .info-value {
	color: #ffffff;
}

.message-center-container.dark-mode .message-detail-text {
	background-color: #2D2D2D;
	border-left-color: #87CEEB;
}

.message-center-container.dark-mode .text-content {
	color: #e0e0e0;
}

.message-center-container.dark-mode .message-detail-footer {
	background-color: #2D2D2D;
	border-top-color: #3F3F3F;
}

.message-center-container.dark-mode .confirm-btn {
	background: linear-gradient(135deg, #87CEEB 0%, #98FB98 100%);
	color: #121212;
	box-shadow: 0 4rpx 12rpx rgba(135, 206, 235, 0.3);
}

.message-center-container.dark-mode .confirm-btn:hover {
	box-shadow: 0 6rpx 16rpx rgba(135, 206, 235, 0.4);
}

.message-center-container.dark-mode .confirm-btn:active {
	box-shadow: 0 2rpx 8rpx rgba(135, 206, 235, 0.2);
}
</style>