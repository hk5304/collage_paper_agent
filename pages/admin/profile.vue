<template>
	<view class="profile-page">
		<!-- 顶部波浪背景 -->
		<view class="header-wave">
			<view class="wave-bg"></view>
			<view class="header-content">
				<view class="back-wrapper" @click="goBack">
					<text class="back-icon">‹</text>
				</view>
				<text class="header-title">个人中心</text>
				<view class="placeholder"></view>
			</view>
		</view>
		
		<!-- 用户信息卡片 - 悬浮设计 -->
		<view class="profile-card-wrapper">
			<view class="profile-card">
				<view class="card-glow"></view>
				<view class="avatar-wrapper">
					<view class="avatar-ring">
						<view class="avatar">{{ userInfo.username?.charAt(0) || 'A' }}</view>
					</view>
					<view class="status-dot"></view>
				</view>
				<view class="user-info">
					<text class="username">{{ userInfo.username || '系统管理员' }}</text>
					<view class="role-badge">
						<text class="role-icon">●</text>
						<text class="role-text">{{ userInfo.role || '管理员' }}</text>
					</view>
				</view>
				<view class="stats-row">
					<view class="stat-item">
						<text class="stat-value">{{ userInfo.id || '--' }}</text>
						<text class="stat-label">用户ID</text>
					</view>
					<view class="stat-divider"></view>
					<view class="stat-item">
						<text class="stat-value">{{ lastLoginTime }}</text>
						<text class="stat-label">上次登录</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 功能菜单区域 -->
		<view class="menu-section">
			<text class="section-title">功能服务</text>
			<view class="menu-grid">
				<view class="menu-card" @click="goToPersonalInfo">
					<view class="menu-icon-wrapper blue">
						<text class="menu-icon">👤</text>
					</view>
					<view class="menu-content">
						<text class="menu-title">个人资料</text>
						<text class="menu-desc">查看和编辑个人信息</text>
					</view>
					<text class="menu-arrow">›</text>
				</view>
				
				<view class="menu-card" @click="goToSystemSettings">
					<view class="menu-icon-wrapper purple">
						<text class="menu-icon">⚙️</text>
					</view>
					<view class="menu-content">
						<text class="menu-title">系统设置</text>
						<text class="menu-desc">偏好设置和通知管理</text>
					</view>
					<text class="menu-arrow">›</text>
				</view>
				
				<view class="menu-card" @click="goToOperationLogs">
					<view class="menu-icon-wrapper orange">
						<text class="menu-icon">📋</text>
					</view>
					<view class="menu-content">
						<text class="menu-title">操作日志</text>
						<text class="menu-desc">查看系统操作记录</text>
					</view>
					<text class="menu-arrow">›</text>
				</view>
				
				<view class="menu-card" @click="goToHelp">
					<view class="menu-icon-wrapper green">
						<text class="menu-icon">❓</text>
					</view>
					<view class="menu-content">
						<text class="menu-title">帮助中心</text>
						<text class="menu-desc">常见问题和使用指南</text>
					</view>
					<text class="menu-arrow">›</text>
				</view>
			</view>
		</view>
		
		<!-- 退出登录按钮 -->
		<view class="logout-wrapper">
			<view class="logout-btn" @click="handleLogout">
				<text class="logout-icon">↪</text>
				<text class="logout-text">退出登录</text>
			</view>
			<text class="version-text">版本 v1.0.0</text>
		</view>
		
		<!-- 个人资料弹窗 -->
		<view v-if="showProfileModal" class="profile-modal" @click="closeProfileModal">
			<view class="profile-modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">个人资料</text>
					<text class="close-btn" @click="closeProfileModal">×</text>
				</view>
				
				<view class="modal-body">
					<!-- 查看模式 -->
					<view v-if="!isEditing" class="profile-view">
						<view class="profile-item">
							<text class="item-label">邮箱</text>
							<text class="item-value">{{ userInfo.email || '未绑定' }}</text>
						</view>
						<view class="profile-item">
							<text class="item-label">手机号</text>
							<text class="item-value">{{ userInfo.phone || '未绑定' }}</text>
						</view>
						<view class="profile-item">
							<text class="item-label">学校</text>
							<text class="item-value">{{ userInfo.school || '未绑定' }}</text>
						</view>
						<view class="profile-item">
							<text class="item-label">院系</text>
							<text class="item-value">{{ userInfo.department || '未绑定' }}</text>
						</view>
						<button class="edit-btn" @click="switchToEdit">编辑资料</button>
					</view>
					
					<!-- 编辑模式 -->
					<view v-else class="profile-edit">
						<view class="form-item">
							<text class="form-label">邮箱</text>
							<input class="form-input" v-model="profileForm.email" placeholder="请输入邮箱" type="text" />
						</view>
						<view class="form-item">
							<text class="form-label">手机号</text>
							<input class="form-input" v-model="profileForm.phone" placeholder="请输入手机号" type="number" />
						</view>
						<view class="form-item">
							<text class="form-label">学校</text>
							<input class="form-input" v-model="profileForm.school" placeholder="请输入学校" type="text" />
						</view>
						<view class="form-item">
							<text class="form-label">院系</text>
							<input class="form-input" v-model="profileForm.department" placeholder="请输入院系" type="text" />
						</view>
						<view class="form-actions">
							<button class="cancel-btn" @click="cancelEdit">取消</button>
							<button class="save-btn" @click="saveProfile">保存</button>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import config from '@/api/config.js';
	
	export default {
		data() {
			return {
				userInfo: {
					id: '',
					username: '',
					role: '系统管理员',
					avatar: '',
					email: '',
					phone: '',
					school: '',
					department: ''
				},
				lastLoginTime: '--',
				// 个人资料编辑弹窗
				showProfileModal: false,
				isEditing: false,
				profileForm: {
					email: '',
					phone: '',
					school: '',
					department: ''
				}
			}
		},
		onLoad() {
			this.loadUserInfo();
			this.loadLastLoginTime();
		},
		methods: {
			loadUserInfo() {
				const storedUserInfo = uni.getStorageSync('userInfo');
				if (storedUserInfo) {
					this.userInfo = {
						...this.userInfo,
						...storedUserInfo,
						id: storedUserInfo.id || storedUserInfo.sub || '--',
						username: storedUserInfo.username || storedUserInfo.name || '系统管理员'
					};
				}
				// 从后端获取完整的用户信息
				this.fetchUserProfile();
			},
			
			// 从后端获取用户详细信息
			async fetchUserProfile() {
				try {
					const token = uni.getStorageSync('token');
					if (!token) return;
					
					const res = await uni.request({
						url: config.baseURL + '/api/v1/users/me',
						method: 'GET',
						header: {
							'Authorization': `Bearer ${token}`
						}
					});
					
					if (res.statusCode === 200 && res.data) {
						const data = res.data;
						this.userInfo = {
							...this.userInfo,
							email: data.email || '',
							phone: data.phone || '',
							school: data.school || '',
							department: data.department || ''
						};
						// 更新本地存储
						uni.setStorageSync('userInfo', this.userInfo);
					}
				} catch (error) {
					console.error('获取用户信息失败:', error);
				}
			},
			loadLastLoginTime() {
				const lastLogin = uni.getStorageSync('lastLoginTime');
				if (lastLogin) {
					this.lastLoginTime = lastLogin;
				} else {
					// 显示当前日期
					const now = new Date();
					this.lastLoginTime = `${now.getMonth() + 1}/${now.getDate()}`;
				}
			},
			goBack() {
				uni.navigateBack();
			},
			goToPersonalInfo() {
				// 初始化表单数据
				this.profileForm = {
					email: this.userInfo.email || '',
					phone: this.userInfo.phone || '',
					school: this.userInfo.school || '',
					department: this.userInfo.department || ''
				};
				this.isEditing = false;
				this.showProfileModal = true;
			},
			
			// 关闭个人资料弹窗
			closeProfileModal() {
				this.showProfileModal = false;
				this.isEditing = false;
			},
			
			// 切换到编辑模式
			switchToEdit() {
				this.isEditing = true;
			},
			
			// 取消编辑
			cancelEdit() {
				// 恢复原始数据
				this.profileForm = {
					email: this.userInfo.email || '',
					phone: this.userInfo.phone || '',
					school: this.userInfo.school || '',
					department: this.userInfo.department || ''
				};
				this.isEditing = false;
			},
			
			// 保存个人资料
			async saveProfile() {
				try {
					uni.showLoading({ title: '保存中...' });
					
					const token = uni.getStorageSync('token');
					const res = await uni.request({
						url: config.baseURL + '/api/v1/users/me',
						method: 'PUT',
						header: {
							'Authorization': `Bearer ${token}`,
							'Content-Type': 'application/json'
						},
						data: {
							email: this.profileForm.email,
							phone: this.profileForm.phone,
							school: this.profileForm.school,
							department: this.profileForm.department
						}
					});
					
					uni.hideLoading();
					
					if (res.statusCode === 200) {
						// 更新本地数据
						this.userInfo = {
							...this.userInfo,
							...this.profileForm
						};
						uni.setStorageSync('userInfo', this.userInfo);
						
						uni.showToast({ title: '保存成功', icon: 'success' });
						this.isEditing = false;
					} else {
						uni.showToast({ title: '保存失败', icon: 'none' });
					}
				} catch (error) {
					uni.hideLoading();
					console.error('保存个人资料失败:', error);
					uni.showToast({ title: '保存失败', icon: 'none' });
				}
			},
			goToSystemSettings() {
				uni.showToast({
					title: '系统设置功能开发中',
					icon: 'none'
				});
			},
			goToOperationLogs() {
				uni.showToast({
					title: '操作日志功能开发中',
					icon: 'none'
				});
			},
			goToHelp() {
				uni.showToast({
					title: '帮助中心功能开发中',
					icon: 'none'
				});
			},
			handleLogout() {
				uni.showModal({
					title: '确认退出',
					content: '确定要退出登录吗？',
					confirmColor: '#ff4d4f',
					success: (res) => {
						if (res.confirm) {
							uni.removeStorageSync('token');
							uni.removeStorageSync('userInfo');
							uni.removeStorageSync('userRole');
							
							uni.showToast({
								title: '已退出登录',
								icon: 'success'
							});
							
							setTimeout(() => {
								uni.reLaunch({
									url: '/pages/index/index'
								});
							}, 1500);
						}
					}
				});
			}
		}
	}
</script>

<style scoped>
	.profile-page {
		min-height: 100vh;
		background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
	}
	
	/* 顶部波浪背景 */
	.header-wave {
		position: relative;
		height: 320rpx;
		overflow: hidden;
	}
	
	.wave-bg {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 320rpx;
		background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
		border-radius: 0 0 40rpx 40rpx;
	}
	
	.wave-bg::after {
		content: '';
		position: absolute;
		bottom: -50rpx;
		left: -10%;
		width: 120%;
		height: 100rpx;
		background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%);
		border-radius: 50%;
	}
	
	.header-content {
		position: relative;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 60rpx 30rpx 20rpx;
	}
	
	.back-wrapper {
		width: 70rpx;
		height: 70rpx;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(10rpx);
	}
	
	.back-icon {
		font-size: 40rpx;
		color: #fff;
		font-weight: 300;
	}
	
	.header-title {
		font-size: 36rpx;
		font-weight: 600;
		color: #fff;
	}
	
	.placeholder {
		width: 70rpx;
	}
	
	/* 用户信息卡片 - 悬浮设计 */
	.profile-card-wrapper {
		margin-top: -120rpx;
		padding: 0 30rpx;
		position: relative;
		z-index: 20;
	}
	
	.profile-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 40rpx;
		box-shadow: 0 8rpx 32rpx rgba(24, 144, 255, 0.12);
		position: relative;
		overflow: hidden;
	}
	
	.card-glow {
		position: absolute;
		top: -50%;
		right: -50%;
		width: 200%;
		height: 200%;
		background: radial-gradient(circle, rgba(24, 144, 255, 0.03) 0%, transparent 70%);
	}
	
	.avatar-wrapper {
		display: flex;
		justify-content: center;
		position: relative;
		margin-bottom: 30rpx;
	}
	
	.avatar-ring {
		width: 160rpx;
		height: 160rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
		padding: 6rpx;
		box-shadow: 0 8rpx 24rpx rgba(24, 144, 255, 0.25);
	}
	
	.avatar {
		width: 148rpx;
		height: 148rpx;
		border-radius: 50%;
		background: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 64rpx;
		color: #1890ff;
		font-weight: 600;
	}
	
	.status-dot {
		position: absolute;
		bottom: 10rpx;
		right: calc(50% - 70rpx);
		width: 24rpx;
		height: 24rpx;
		background: #52c41a;
		border-radius: 50%;
		border: 4rpx solid #fff;
	}
	
	.user-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 30rpx;
	}
	
	.username {
		font-size: 40rpx;
		font-weight: 600;
		color: #1a1a1a;
		margin-bottom: 12rpx;
	}
	
	.role-badge {
		display: flex;
		align-items: center;
		background: linear-gradient(135deg, #e6f7ff 0%, #f0f7ff 100%);
		padding: 8rpx 24rpx;
		border-radius: 30rpx;
	}
	
	.role-icon {
		font-size: 16rpx;
		color: #1890ff;
		margin-right: 8rpx;
	}
	
	.role-text {
		font-size: 24rpx;
		color: #1890ff;
		font-weight: 500;
	}
	
	/* 统计信息 */
	.stats-row {
		display: flex;
		align-items: center;
		justify-content: center;
		padding-top: 30rpx;
		border-top: 1rpx solid #f0f0f0;
	}
	
	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0 50rpx;
	}
	
	.stat-value {
		font-size: 32rpx;
		font-weight: 600;
		color: #262626;
		margin-bottom: 8rpx;
	}
	
	.stat-label {
		font-size: 24rpx;
		color: #8c8c8c;
	}
	
	.stat-divider {
		width: 2rpx;
		height: 60rpx;
		background: #e8e8e8;
	}
	
	/* 功能菜单区域 */
	.menu-section {
		padding: 40rpx 30rpx;
	}
	
	.section-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #262626;
		margin-bottom: 24rpx;
		display: block;
	}
	
	.menu-grid {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}
	
	.menu-card {
		display: flex;
		align-items: center;
		background: #fff;
		padding: 30rpx;
		border-radius: 16rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
		transition: all 0.3s ease;
	}
	
	.menu-card:active {
		transform: scale(0.98);
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
	}
	
	.menu-icon-wrapper {
		width: 80rpx;
		height: 80rpx;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 24rpx;
	}
	
	.menu-icon-wrapper.blue {
		background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
	}
	
	.menu-icon-wrapper.purple {
		background: linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%);
	}
	
	.menu-icon-wrapper.orange {
		background: linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%);
	}
	
	.menu-icon-wrapper.green {
		background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
	}
	
	.menu-icon {
		font-size: 40rpx;
	}
	
	.menu-content {
		flex: 1;
	}
	
	.menu-title {
		font-size: 30rpx;
		font-weight: 500;
		color: #262626;
		display: block;
		margin-bottom: 8rpx;
	}
	
	.menu-desc {
		font-size: 24rpx;
		color: #8c8c8c;
	}
	
	.menu-arrow {
		font-size: 36rpx;
		color: #bfbfbf;
		font-weight: 300;
	}
	
	/* 退出登录区域 */
	.logout-wrapper {
		padding: 40rpx 30rpx 60rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	.logout-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		padding: 28rpx;
		background: #fff;
		border-radius: 16rpx;
		box-shadow: 0 2rpx 12rpx rgba(255, 77, 79, 0.1);
		border: 1rpx solid #ffccc7;
	}
	
	.logout-btn:active {
		background: #fff2f0;
	}
	
	.logout-icon {
		font-size: 32rpx;
		color: #ff4d4f;
		margin-right: 12rpx;
	}
	
	.logout-text {
		font-size: 30rpx;
		color: #ff4d4f;
		font-weight: 500;
	}
	
	.version-text {
		margin-top: 30rpx;
		font-size: 24rpx;
		color: #bfbfbf;
	}
	
	/* 个人资料弹窗 */
	.profile-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(8rpx);
		-webkit-backdrop-filter: blur(8rpx);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		animation: fadeIn 0.3s ease;
	}
	
	.profile-modal-content {
		background: #fff;
		border-radius: 24rpx;
		width: 600rpx;
		max-width: 90%;
		box-shadow: 0 24rpx 80rpx rgba(0, 0, 0, 0.2);
		animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		overflow: hidden;
	}
	
	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	
	@keyframes slideUp {
		from {
			transform: translateY(40rpx);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
	
	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx 40rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}
	
	.modal-title {
		font-size: 34rpx;
		font-weight: 600;
		color: #262626;
	}
	
	.close-btn {
		font-size: 40rpx;
		color: #999;
		padding: 10rpx;
	}
	
	.modal-body {
		padding: 40rpx;
	}
	
	/* 查看模式 */
	.profile-view {
		display: flex;
		flex-direction: column;
		gap: 30rpx;
	}
	
	.profile-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #f5f5f5;
	}
	
	.profile-item:last-child {
		border-bottom: none;
	}
	
	.item-label {
		font-size: 28rpx;
		color: #666;
	}
	
	.item-value {
		font-size: 28rpx;
		color: #262626;
		font-weight: 500;
	}
	
	.item-value:empty::after,
	.item-value[data-empty="true"]::after {
		content: '未绑定';
		color: #999;
	}
	
	.edit-btn {
		margin-top: 20rpx;
		background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
		color: #fff;
		font-size: 30rpx;
		padding: 24rpx 0;
		border-radius: 12rpx;
		border: none;
	}
	
	/* 编辑模式 */
	.profile-edit {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}
	
	.form-item {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}
	
	.form-label {
		font-size: 26rpx;
		color: #666;
	}
	
	.form-input {
		background: #f5f5f5;
		padding: 20rpx 24rpx;
		border-radius: 12rpx;
		font-size: 28rpx;
		color: #333;
		height: 80rpx;
	}
	
	.form-actions {
		display: flex;
		gap: 20rpx;
		margin-top: 20rpx;
	}
	
	.form-actions .cancel-btn {
		flex: 1;
		background: #f5f5f5;
		color: #666;
		font-size: 28rpx;
		padding: 24rpx 0;
		border-radius: 12rpx;
		border: none;
	}
	
	.form-actions .save-btn {
		flex: 1;
		background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
		color: #fff;
		font-size: 28rpx;
		padding: 24rpx 0;
		border-radius: 12rpx;
		border: none;
	}
</style>
