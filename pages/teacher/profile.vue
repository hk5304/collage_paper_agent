<template>
	<view class="profile-container" :class="{ 'dark-mode': darkMode }">
		<!-- 页面加载动画 -->
		<view v-if="loading" class="loading-container">
			<view class="loading-spinner"></view>
			<text class="loading-text">加载中...</text>
		</view>
		
		<view v-else class="profile-content">
			<view class="profile-header">
				<view class="back-btn" @click="goBack">
					<text class="back-btn-icon">←</text>
				</view>
				<text class="header-title">个人中心</text>
				<view class="header-right"></view>
			</view>
			
			<!-- 用户信息卡片 -->
			<view class="user-card">
				<view class="avatar-section">
					<view class="avatar">
						<text class="avatar-text">{{ userInfo.name ? userInfo.name.charAt(0) : '教' }}</text>
					</view>
					<view class="user-info">
						<text class="user-name">{{ userInfo.name || '教师' }}</text>
						<text class="user-id">工号：{{ userInfo.username || '未设置' }}</text>
						<text class="user-role">教师</text>
					</view>
				</view>
			</view>
			
			<!-- 统计信息 -->
			<view class="stats-grid">
				<view class="stat-item" v-for="(stat, index) in statItems" :key="index" :style="{ animationDelay: index * 0.1 + 's' }">
					<text class="stat-value">{{ stat.value }}</text>
					<text class="stat-label">{{ stat.label }}</text>
					<view class="stat-icon">{{ stat.icon }}</view>
				</view>
			</view>
			
			<!-- 功能菜单 -->
			<view class="menu-section">
				<view class="menu-item" v-for="(menu, index) in menuItems" :key="index" @click="handleMenuClick(menu.action)">
					<text class="menu-icon">{{ menu.icon }}</text>
					<text class="menu-text">{{ menu.text }}</text>
					<view class="menu-arrow">
						<text class="arrow-icon">›</text>
					</view>
				</view>
			</view>
			
			<!-- 退出登录按钮 -->
			<view class="logout-section">
				<button class="logout-btn" @click="showLogoutConfirm">退出登录</button>
			</view>
		</view>
		
		<!-- 退出确认弹窗 -->
		<view v-if="showLogoutModal" class="logout-modal-mask" @click="showLogoutModal = false">
			<view class="logout-modal-content" @click.stop>
				<view class="logout-modal-title">确认退出</view>
				<view class="logout-modal-body">
					<text class="logout-modal-text">确定要退出登录吗？</text>
				</view>
				<view class="logout-modal-footer">
					<text class="logout-cancel-btn" @click="showLogoutModal = false">取消</text>
					<text class="logout-confirm-btn" @click="confirmLogout">确定</text>
				</view>
			</view>
		</view>
		
		<!-- 关于系统弹窗 -->
		<view v-if="showAboutModal" class="about-modal-mask" @click="showAboutModal = false">
			<view class="about-modal-content" @click.stop>
				<view class="about-modal-title">关于系统</view>
				<view class="about-modal-body">
					<text class="about-version">毕业论文管理系统 v1.0</text>
					<text class="about-desc">为学生和教师提供论文管理、审阅和反馈功能。</text>
				</view>
				<view class="about-modal-footer">
					<text class="about-confirm-btn" @click="showAboutModal = false">确定</text>
				</view>
			</view>
		</view>
		
		<!-- 完善个人资料弹窗 -->
		<view v-if="showProfileEditModal" class="profile-modal-mask" @click="showProfileEditModal = false">
			<view class="profile-modal-content" @click.stop>
				<view class="profile-modal-title">完善个人资料</view>
				<view class="profile-modal-body">
					<view class="profile-form-item">
						<text class="profile-form-label">绑定学校</text>
						<input class="profile-form-input" v-model="profileForm.school" placeholder="请输入学校名称" />
					</view>
					<view class="profile-form-item">
						<text class="profile-form-label">绑定院系</text>
						<input class="profile-form-input" v-model="profileForm.department" placeholder="请输入院系名称" />
					</view>
					<view class="profile-form-item">
						<text class="profile-form-label">绑定手机号</text>
						<input class="profile-form-input" v-model="profileForm.phone" placeholder="请输入手机号" type="number" />
					</view>
					<view class="profile-form-item">
						<text class="profile-form-label">绑定邮箱</text>
						<input class="profile-form-input" v-model="profileForm.email" placeholder="请输入邮箱地址" type="text" />
					</view>
				</view>
				<view class="profile-modal-footer">
					<text class="profile-cancel-btn" @click="showProfileEditModal = false">取消</text>
					<text class="profile-confirm-btn" @click="saveProfile">保存</text>
				</view>
			</view>
		</view>
		
		<!-- 修改密码弹窗 -->
		<view v-if="showChangePasswordModal" class="password-modal-mask" @click="showChangePasswordModal = false">
			<view class="password-modal-content" @click.stop>
				<view class="password-modal-title">修改密码</view>
				<view class="password-modal-body">
					<view class="password-form-item">
						<text class="password-form-label">当前密码</text>
						<input class="password-form-input" v-model="passwordForm.oldPassword" placeholder="请输入当前密码" type="password" password />
					</view>
					<view class="password-form-item">
						<text class="password-form-label">新密码</text>
						<input class="password-form-input" v-model="passwordForm.newPassword" placeholder="请输入新密码" type="password" password />
					</view>
					<view class="password-form-item">
						<text class="password-form-label">确认新密码</text>
						<input class="password-form-input" v-model="passwordForm.confirmPassword" placeholder="请再次输入新密码" type="password" password />
						<text v-if="passwordError" class="password-error-text">{{ passwordError }}</text>
					</view>
				</view>
				<view class="password-modal-footer">
					<text class="password-cancel-btn" @click="showChangePasswordModal = false">取消</text>
					<text class="password-confirm-btn" @click="submitChangePassword">确认修改</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { changePassword } from '../../api/user.js';

export default {
	data() {
		return {
			loading: true,
			userInfo: {},
			stats: {
				totalStudents: 0,
				pendingReview: 0,
				feedback: 0,
				finalized: 0
			},
			darkMode: false,
			showAboutModal: false,
			showProfileEditModal: false,
			showLogoutModal: false,
			showChangePasswordModal: false,
			profileForm: {
				school: '',
				department: '',
				phone: '',
				email: ''
			},
			passwordForm: {
				oldPassword: '',
				newPassword: '',
				confirmPassword: ''
			},
			passwordError: ''
		}
	},
	computed: {
		statItems() {
			return [
				{ value: this.stats.totalStudents, label: '指导学生', icon: '👥' },
				{ value: this.stats.pendingReview, label: '待审阅', icon: '📝' },
				{ value: this.stats.feedback, label: '已反馈', icon: '✅' },
				{ value: this.stats.finalized, label: '已定稿', icon: '📋' }
			]
		},
		menuItems() {
			return [
				{ text: '指导看板', icon: '📊', action: 'goToDashboard' },
				{ text: '完善个人资料', icon: '👤', action: 'showProfileEdit' },
				{ text: '修改密码', icon: '🔒', action: 'showChangePassword' },
				{ text: '关于系统', icon: 'ℹ️', action: 'showAbout' }
			]
		}
	},
	onLoad() {
		// 模拟加载延迟，显示加载动画
		setTimeout(() => {
			this.loadUserInfo();
			this.loadStats();
		}, 800);
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
				console.log('页面栈只有当前页面，跳转到教师首页');
				uni.redirectTo({
					url: '/pages/teacher/dashboard'
				});
			}
		},
		loadUserInfo() {
			// ========== 以下为API接口调用代码（注释状态，需要时取消注释） ==========
			// import { getUserInfo } from '@/api/user.js';
			// 
			// const token = uni.getStorageSync('token');
			// getUserInfo(token).then(res => {
			// 	if(res.code === 200 && res.data) {
			// 		this.userInfo = res.data;
			// 	}
			// }).catch(err => {
			// 	console.error('加载用户信息失败:', err);
			// 	this.userInfo = uni.getStorageSync('userInfo') || {};
			// }).finally(() => {
			// 	this.loading = false;
			// });
			// ========== API接口调用代码结束 ==========
			
			// 以下为模拟数据（使用API时注释掉）
			this.userInfo = uni.getStorageSync('userInfo') || {
				name: '张教授',
				id: 'T001',
				role: 'teacher'
			};
			this.loading = false;
		},
		loadStats() {
			// 从看板获取统计数据
			this.stats = {
				totalStudents: 25,
				pendingReview: 5,
				feedback: 15,
				finalized: 5
			};
		},
		// 处理菜单点击
		handleMenuClick(action) {
			if (this[action]) {
				this[action]();
			}
		},
		goToDashboard() {
			uni.navigateTo({url: '/pages/teacher/dashboard'});
		},
		showChangePassword() {
			// 重置密码表单
			this.passwordForm = {
				oldPassword: '',
				newPassword: '',
				confirmPassword: ''
			};
			this.showChangePasswordModal = true;
		},
		async submitChangePassword() {
			const { oldPassword, newPassword, confirmPassword } = this.passwordForm;
			
			// 重置错误提示
			this.passwordError = '';
			
			// 表单验证
			if (!oldPassword) {
				uni.showToast({ title: '请输入当前密码', icon: 'none' });
				return;
			}
			if (!newPassword) {
				uni.showToast({ title: '请输入新密码', icon: 'none' });
				return;
			}
			if (newPassword.length < 6) {
				uni.showToast({ title: '新密码长度不能少于6位', icon: 'none' });
				return;
			}
			if (newPassword !== confirmPassword) {
				this.passwordError = '两次输入的新密码不一致';
				return;
			}
			
			uni.showLoading({ title: '修改中...' });
			
			try {
				const res = await changePassword({
					old_password: oldPassword,
					new_password: newPassword
				});
				
				uni.hideLoading();
				
				if (res && (res.code === 200 || res.status === 200 || res.message === 'success' || res.message === '密码修改成功' || res.data)) {
					uni.showToast({
						title: '密码修改成功',
						icon: 'success'
					});
					this.showChangePasswordModal = false;
					// 清空表单和错误提示
					this.passwordForm = {
						oldPassword: '',
						newPassword: '',
						confirmPassword: ''
					};
					this.passwordError = '';
				} else {
					uni.showToast({
						title: res?.message || res?.detail || '密码修改失败',
						icon: 'none'
					});
				}
			} catch (error) {
				uni.hideLoading();
				console.error('修改密码失败:', error);
				uni.showToast({
					title: error?.message || error?.detail || '修改密码失败，请检查当前密码是否正确',
					icon: 'none'
				});
			}
		},
		showAbout() {
			this.showAboutModal = true;
		},
		showProfileEdit() {
			this.showProfileEditModal = true;
		},
		saveProfile() {
			// 保存个人资料
			uni.showToast({
				title: '保存成功',
				icon: 'success'
			});
			this.showProfileEditModal = false;
		},
		showLogoutConfirm() {
			this.showLogoutModal = true;
		},
		confirmLogout() {
			this.showLogoutModal = false;
			this.logout();
		},
		logout() {
			// ========== 以下为API接口调用代码（注释状态，需要时取消注释） ==========
			// import { logout } from '@/api/user.js';
			// 
			// const token = uni.getStorageSync('token');
			// logout(token).then(res => {
			// 	if(res.code === 200) {
			// 		uni.removeStorageSync('token');
			// 		uni.removeStorageSync('userInfo');
			// 		uni.removeStorageSync('userRole');
			// 		uni.reLaunch({url: '/pages/index/index'});
			// 	}
			// }).catch(err => {
			// 	console.error('退出登录失败:', err);
			// 	uni.removeStorageSync('token');
			// 	uni.removeStorageSync('userInfo');
			// 	uni.removeStorageSync('userRole');
			// 	uni.reLaunch({url: '/pages/index/index'});
			// });
			// ========== API接口调用代码结束 ==========
			
			// 以下为模拟退出代码（使用API时注释掉）
			uni.removeStorageSync('token');
			uni.removeStorageSync('userInfo');
			uni.removeStorageSync('userRole');
			uni.removeStorageSync('rememberedUsername');
			uni.showToast({
				title: '已退出登录',
				icon: 'success'
			});
			setTimeout(() => {
				uni.reLaunch({url: '/pages/index/index'});
			}, 1000);
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
.profile-container {
	min-height: 100vh;
	background-color: #f5f5f5;
	font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
}

.profile-content {
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
.profile-header {
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

.header-right {
	width: 60rpx;
}

/* 用户信息卡片 */
.user-card {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 50rpx 30rpx;
	margin: 20rpx;
	border-radius: 20rpx;
	box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.15);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	animation: cardSlideIn 0.6s ease-out;
}

.user-card:hover {
	transform: translateY(-5rpx);
	box-shadow: 0 15rpx 40rpx rgba(0, 0, 0, 0.2);
}

@keyframes cardSlideIn {
	from {
		opacity: 0;
		transform: translateY(30rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.avatar-section {
	display: flex;
	align-items: center;
}

.avatar {
	width: 140rpx;
	height: 140rpx;
	border-radius: 50%;
	background-color: rgba(255, 255, 255, 0.3);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 30rpx;
	border: 4rpx solid rgba(255, 255, 255, 0.5);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.avatar:hover {
	transform: scale(1.05);
	box-shadow: 0 6rpx 25rpx rgba(0, 0, 0, 0.15);
}

.avatar-text {
	font-size: 56rpx;
	color: #fff;
	font-weight: bold;
	text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
}

.user-info {
	display: flex;
	flex-direction: column;
	flex: 1;
}

.user-name {
	font-size: 44rpx;
	color: #fff;
	font-weight: bold;
	margin-bottom: 12rpx;
	text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
	letter-spacing: 2rpx;
}

.user-id {
	font-size: 28rpx;
	color: rgba(255, 255, 255, 0.8);
	margin-bottom: 10rpx;
	text-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.1);
}

.user-role {
	font-size: 26rpx;
	color: rgba(255, 255, 255, 0.7);
	background-color: rgba(255, 255, 255, 0.2);
	padding: 6rpx 20rpx;
	border-radius: 25rpx;
	width: fit-content;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-role:hover {
	background-color: rgba(255, 255, 255, 0.3);
	transform: scale(1.05);
}

/* 统计信息 */
.stats-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 20rpx;
	padding: 30rpx 20rpx;
	margin-bottom: 30rpx;
}

.stat-item {
	background-color: #fff;
	padding: 35rpx 20rpx;
	border-radius: 16rpx;
	text-align: center;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	animation: statItemFadeIn 0.6s ease-out forwards;
	opacity: 0;
	transform: translateY(20rpx);
	position: relative;
	overflow: hidden;
}

@keyframes statItemFadeIn {
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.stat-item:hover {
	transform: translateY(-8rpx);
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
}

.stat-item::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 4rpx;
	background: linear-gradient(90deg, #1890ff, #40a9ff);
	transform: scaleX(0);
	transform-origin: left;
	transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-item:hover::before {
	transform: scaleX(1);
}

.stat-value {
	display: block;
	font-size: 40rpx;
	font-weight: bold;
	color: #1890ff;
	margin-bottom: 12rpx;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	text-shadow: 0 1rpx 4rpx rgba(24, 144, 255, 0.2);
}

.stat-item:hover .stat-value {
	transform: scale(1.1);
	color: #40a9ff;
}

.stat-label {
	display: block;
	font-size: 24rpx;
	color: #999;
	margin-bottom: 16rpx;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-item:hover .stat-label {
	color: #666;
}

.stat-icon {
	font-size: 36rpx;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-item:hover .stat-icon {
	transform: scale(1.2) rotate(10deg);
}

/* 功能菜单 */
.menu-section {
	background-color: #fff;
	margin: 0 20rpx 30rpx;
	border-radius: 16rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.menu-item {
	display: flex;
	align-items: center;
	padding: 35rpx 30rpx;
	border-bottom: 1px solid #f0f0f0;
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	position: relative;
	overflow: hidden;
}

.menu-item:last-child {
	border-bottom: none;
}

.menu-item:hover {
	background-color: #f8f9fa;
	transform: translateX(8rpx);
	box-shadow: inset 4rpx 0 0 #1890ff;
}

.menu-item:active {
	background-color: #e6f7ff;
	transform: translateX(4rpx);
}

.menu-icon {
	font-size: 44rpx;
	margin-right: 25rpx;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-item:hover .menu-icon {
	transform: scale(1.1) rotate(5deg);
}

.menu-text {
	font-size: 32rpx;
	color: #333;
	flex: 1;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	font-weight: 500;
}

.menu-item:hover .menu-text {
	color: #1890ff;
}

.menu-arrow {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-item:hover .menu-arrow {
	background-color: rgba(24, 144, 255, 0.1);
}

.arrow-icon {
	font-size: 44rpx;
	color: #999;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-item:hover .arrow-icon {
	color: #1890ff;
	transform: translateX(4rpx);
}

/* 退出登录 */
.logout-section {
	padding: 0 20rpx 60rpx;
}

.logout-btn {
	width: 100%;
	padding: 30rpx;
	background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
	color: #fff;
	border-radius: 16rpx;
	font-size: 32rpx;
	border: none;
	font-weight: 500;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	box-shadow: 0 6rpx 20rpx rgba(255, 77, 79, 0.3);
	letter-spacing: 2rpx;
}

.logout-btn:hover {
	transform: translateY(-8rpx);
	box-shadow: 0 10rpx 30rpx rgba(255, 77, 79, 0.4);
	background: linear-gradient(135deg, #ff7875 0%, #ff4d4f 100%);
}

.logout-btn:active {
	transform: translateY(-4rpx);
	box-shadow: 0 6rpx 20rpx rgba(255, 77, 79, 0.3);
}

/* 响应式设计 */
@media (max-width: 750rpx) {
	.stats-grid {
		grid-template-columns: repeat(2, 1fr);
		gap: 15rpx;
	}
	
	.user-card {
		padding: 40rpx 25rpx;
		margin: 15rpx;
	}
	
	.avatar {
		width: 120rpx;
		height: 120rpx;
	}
	
	.avatar-text {
		font-size: 48rpx;
	}
	
	.user-name {
		font-size: 36rpx;
	}
	
	.user-id {
		font-size: 24rpx;
	}
	
	.user-role {
		font-size: 22rpx;
	}
	
	.stat-value {
		font-size: 36rpx;
	}
	
	.stat-label {
		font-size: 22rpx;
	}
	
	.menu-item {
		padding: 30rpx 25rpx;
	}
	
	.menu-text {
		font-size: 28rpx;
	}
	
	.logout-btn {
		padding: 25rpx;
		font-size: 28rpx;
	}
}

/* 深色模式样式 */
.profile-container.dark-mode {
	background-color: #121212;
}

.profile-container.dark-mode .loading-container {
	background-color: #121212;
}

.profile-container.dark-mode .loading-text {
	color: #ffffff;
}

.profile-container.dark-mode .profile-header {
	background-color: #1E1E1E;
	border-bottom-color: #3F3F3F;
}

.profile-container.dark-mode .back-btn:hover {
	background-color: #2D2D2D;
}

.profile-container.dark-mode .back-btn-icon {
	color: #87CEEB;
}

.profile-container.dark-mode .header-title {
	color: #ffffff;
}

.profile-container.dark-mode .stat-item {
	background-color: #2D2D2D;
}

.profile-container.dark-mode .stat-item:hover {
	background-color: #3F3F3F;
}

.profile-container.dark-mode .stat-item::before {
	background: linear-gradient(90deg, #87CEEB, #98FB98);
}

.profile-container.dark-mode .stat-value {
	color: #87CEEB;
}

.profile-container.dark-mode .stat-item:hover .stat-value {
	color: #98FB98;
}

.profile-container.dark-mode .stat-label {
	color: #ffffff;
}

.profile-container.dark-mode .stat-item:hover .stat-label {
	color: #e0e0e0;
}

.profile-container.dark-mode .menu-section {
	background-color: #2D2D2D;
}

.profile-container.dark-mode .menu-item {
	border-bottom-color: #3F3F3F;
}

.profile-container.dark-mode .menu-item:hover {
	background-color: #3F3F3F;
	box-shadow: inset 4rpx 0 0 #87CEEB;
}

.profile-container.dark-mode .menu-item:active {
	background-color: #2D2D2D;
}

.profile-container.dark-mode .menu-text {
	color: #ffffff;
}

.profile-container.dark-mode .menu-item:hover .menu-text {
	color: #87CEEB;
}

.profile-container.dark-mode .menu-item:hover .menu-arrow {
	background-color: rgba(135, 206, 235, 0.1);
}

.profile-container.dark-mode .arrow-icon {
	color: #ffffff;
}

.profile-container.dark-mode .menu-item:hover .arrow-icon {
	color: #87CEEB;
}

/* 退出确认弹窗样式 */
.logout-modal-mask {
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
}

.logout-modal-content {
	width: 560rpx;
	background-color: #ffffff;
	border-radius: 24rpx;
	overflow: hidden;
	animation: modalShow 0.3s ease;
}

.logout-modal-title {
	padding: 40rpx 40rpx 20rpx;
	text-align: center;
	font-size: 36rpx;
	font-weight: 600;
	color: #333333;
}

.logout-modal-body {
	padding: 20rpx 40rpx 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.logout-modal-text {
	font-size: 30rpx;
	color: #666666;
	text-align: center;
}

.logout-modal-footer {
	border-top: 1rpx solid #e8e8e8;
	padding: 0;
	display: flex;
}

.logout-cancel-btn,
.logout-confirm-btn {
	flex: 1;
	font-size: 32rpx;
	font-weight: 500;
	padding: 30rpx 40rpx;
	text-align: center;
	cursor: pointer;
	transition: all 0.2s ease;
}

.logout-cancel-btn {
	color: #666666;
	border-right: 1rpx solid #e8e8e8;
}

.logout-cancel-btn:hover {
	background-color: #f5f5f5;
}

.logout-confirm-btn {
	color: #1890ff;
}

.logout-confirm-btn:hover {
	background-color: #f5f5f5;
}

/* 退出确认弹窗深色模式 */
.profile-container.dark-mode .logout-modal-content {
	background-color: #2D2D2D;
}

.profile-container.dark-mode .logout-modal-title {
	color: #ffffff;
}

.profile-container.dark-mode .logout-modal-text {
	color: #bbbbbb;
}

.profile-container.dark-mode .logout-modal-footer {
	border-top-color: #3F3F3F;
}

.profile-container.dark-mode .logout-cancel-btn {
	color: #bbbbbb;
	border-right-color: #3F3F3F;
}

.profile-container.dark-mode .logout-cancel-btn:hover {
	background-color: #3F3F3F;
}

.profile-container.dark-mode .logout-confirm-btn {
	color: #87CEEB;
}

.profile-container.dark-mode .logout-confirm-btn:hover {
	background-color: #3F3F3F;
}

/* 关于系统弹窗样式 */
.about-modal-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

.about-modal-content {
	width: 560rpx;
	background-color: #ffffff;
	border-radius: 24rpx;
	overflow: hidden;
	animation: modalShow 0.3s ease;
}

@keyframes modalShow {
	from {
		opacity: 0;
		transform: scale(0.9);
	}
	to {
		opacity: 1;
		transform: scale(1);
	}
}

.about-modal-title {
	padding: 40rpx 40rpx 20rpx;
	text-align: center;
	font-size: 36rpx;
	font-weight: 600;
	color: #333333;
}

.about-modal-body {
	padding: 20rpx 40rpx 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.about-version {
	font-size: 32rpx;
	color: #666666;
	margin-bottom: 16rpx;
}

.about-desc {
	font-size: 28rpx;
	color: #999999;
	text-align: center;
	line-height: 1.6;
}

.about-modal-footer {
	border-top: 1rpx solid #e8e8e8;
	padding: 0;
	display: flex;
	justify-content: center;
}

.about-confirm-btn {
	width: 100%;
	font-size: 32rpx;
	color: #1890ff;
	font-weight: 500;
	padding: 30rpx 40rpx;
	text-align: center;
	transition: all 0.2s ease;
}

.about-confirm-btn:active {
	background-color: rgba(24, 144, 255, 0.15);
}

/* 深色模式适配 */
.profile-container.dark-mode .about-modal-content {
	background-color: #2D2D2D;
}

.profile-container.dark-mode .about-modal-title {
	color: #ffffff;
}

.profile-container.dark-mode .about-version {
	color: #e0e0e0;
}

.profile-container.dark-mode .about-desc {
	color: #a0a0a0;
}

.profile-container.dark-mode .about-modal-footer {
	border-top-color: #3F3F3F;
}

.profile-container.dark-mode .about-confirm-btn {
	color: #87CEEB;
}

.profile-container.dark-mode .about-confirm-btn:active {
	background-color: rgba(135, 206, 235, 0.15);
}

/* 完善个人资料弹窗样式 */
.profile-modal-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

.profile-modal-content {
	width: 600rpx;
	background-color: #ffffff;
	border-radius: 24rpx;
	overflow: hidden;
	animation: modalShow 0.3s ease;
}

.profile-modal-title {
	padding: 40rpx 40rpx 20rpx;
	text-align: center;
	font-size: 36rpx;
	font-weight: 600;
	color: #333333;
}

.profile-modal-body {
	padding: 20rpx 40rpx 40rpx;
}

.profile-form-item {
	margin-bottom: 30rpx;
}

.profile-form-item:last-child {
	margin-bottom: 0;
}

.profile-form-label {
	display: block;
	font-size: 28rpx;
	color: #666666;
	margin-bottom: 12rpx;
}

.profile-form-input {
	width: 100%;
	height: 80rpx;
	padding: 0 24rpx;
	border: 1rpx solid #e0e0e0;
	border-radius: 12rpx;
	font-size: 28rpx;
	color: #333333;
	background-color: #f5f5f5;
	box-sizing: border-box;
}

.profile-form-input:focus {
	border-color: #1890ff;
	background-color: #ffffff;
}

.profile-modal-footer {
	border-top: 1rpx solid #e8e8e8;
	padding: 0;
	display: flex;
}

.profile-cancel-btn,
.profile-confirm-btn {
	flex: 1;
	font-size: 32rpx;
	font-weight: 500;
	padding: 30rpx 40rpx;
	text-align: center;
	transition: all 0.2s ease;
}

.profile-cancel-btn {
	color: #666666;
	border-right: 1rpx solid #e8e8e8;
}

.profile-confirm-btn {
	color: #1890ff;
}

.profile-cancel-btn:active {
	background-color: rgba(0, 0, 0, 0.05);
}

.profile-confirm-btn:active {
	background-color: rgba(24, 144, 255, 0.15);
}

/* 深色模式适配 */
.profile-container.dark-mode .profile-modal-content {
	background-color: #2D2D2D;
}

.profile-container.dark-mode .profile-modal-title {
	color: #ffffff;
}

.profile-container.dark-mode .profile-form-label {
	color: #e0e0e0;
}

.profile-container.dark-mode .profile-form-input {
	background-color: #3F3F3F;
	border-color: #4F4F4F;
	color: #ffffff;
}

.profile-container.dark-mode .profile-modal-footer {
	border-top-color: #3F3F3F;
}

.profile-container.dark-mode .profile-cancel-btn {
	color: #a0a0a0;
	border-right-color: #3F3F3F;
}

.profile-container.dark-mode .profile-confirm-btn {
	color: #87CEEB;
}

.profile-container.dark-mode .profile-cancel-btn:active {
	background-color: rgba(255, 255, 255, 0.05);
}

.profile-container.dark-mode .profile-confirm-btn:active {
	background-color: rgba(135, 206, 235, 0.15);
}

/* 修改密码弹窗样式 */
.password-modal-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

.password-modal-content {
	width: 600rpx;
	background-color: #ffffff;
	border-radius: 24rpx;
	overflow: hidden;
	animation: modalShow 0.3s ease;
}

.password-modal-title {
	padding: 40rpx 40rpx 20rpx;
	text-align: center;
	font-size: 36rpx;
	font-weight: 600;
	color: #333333;
}

.password-modal-body {
	padding: 20rpx 40rpx 40rpx;
}

.password-form-item {
	margin-bottom: 30rpx;
}

.password-form-item:last-child {
	margin-bottom: 0;
}

.password-form-label {
	display: block;
	font-size: 28rpx;
	color: #666666;
	margin-bottom: 12rpx;
}

.password-form-input {
	width: 100%;
	height: 80rpx;
	padding: 0 24rpx;
	border: 1rpx solid #e0e0e0;
	border-radius: 12rpx;
	font-size: 28rpx;
	color: #333333;
	background-color: #f5f5f5;
	box-sizing: border-box;
}

.password-form-input:focus {
	border-color: #1890ff;
	background-color: #ffffff;
}

.password-error-text {
	font-size: 24rpx;
	color: #ff4d4f;
	margin-top: 10rpx;
	display: block;
}

.password-modal-footer {
	border-top: 1rpx solid #e8e8e8;
	padding: 0;
	display: flex;
}

.password-cancel-btn,
.password-confirm-btn {
	flex: 1;
	font-size: 32rpx;
	font-weight: 500;
	padding: 30rpx 40rpx;
	text-align: center;
	transition: all 0.2s ease;
}

.password-cancel-btn {
	color: #666666;
	border-right: 1rpx solid #e8e8e8;
}

.password-confirm-btn {
	color: #1890ff;
}

.password-cancel-btn:active {
	background-color: rgba(0, 0, 0, 0.05);
}

.password-confirm-btn:active {
	background-color: rgba(24, 144, 255, 0.15);
}

/* 深色模式适配 */
.profile-container.dark-mode .password-modal-content {
	background-color: #2D2D2D;
}

.profile-container.dark-mode .password-modal-title {
	color: #ffffff;
}

.profile-container.dark-mode .password-form-label {
	color: #e0e0e0;
}

.profile-container.dark-mode .password-form-input {
	background-color: #3F3F3F;
	border-color: #4F4F4F;
	color: #ffffff;
}

.profile-container.dark-mode .password-modal-footer {
	border-top-color: #3F3F3F;
}

.profile-container.dark-mode .password-cancel-btn {
	color: #a0a0a0;
	border-right-color: #3F3F3F;
}

.profile-container.dark-mode .password-confirm-btn {
	color: #87CEEB;
}

.profile-container.dark-mode .password-cancel-btn:active {
	background-color: rgba(255, 255, 255, 0.05);
}

.profile-container.dark-mode .password-confirm-btn:active {
	background-color: rgba(135, 206, 235, 0.15);
}
</style>
