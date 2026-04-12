<template>
	<view class="login-container">
		<!-- 背景图片 -->
		<image class="background-image" 
			:src="backgroundImage" 
			mode="aspectFill" 
			@error="onImageError"
			@load="onImageLoad"></image>
		
		<!-- 登录面板 - 放在右侧 -->
		<view class="login-panel">
			<!-- 顶部图标和标题 -->
			<view class="login-header">
				<view class="header-icon">📚</view>
				<text class="system-title">毕业论文管理系统</text>
				<text class="system-subtitle">请选择身份并登录系统</text>
			</view>
			
			<!-- 角色选择标签 -->
			<view class="role-tabs">
				<view class="role-tab" 
					:class="{active: currentRole === 'student'}" 
					@click="switchRole('student')">
					<text class="role-icon">👤</text>
					<text class="role-text">学生登录</text>
				</view>
				<view class="role-tab" 
					:class="{active: currentRole === 'teacher'}" 
					@click="switchRole('teacher')">
					<text class="role-icon">👤</text>
					<text class="role-text">教师登录</text>
				</view>
				<view class="role-tab" 
					:class="{active: currentRole === 'admin'}" 
					@click="switchRole('admin')">
					<text class="role-icon">⚙️</text>
					<text class="role-text">管理员登录</text>
				</view>
			</view>
			
			<!-- 输入表单 -->
			<view class="login-form">
				<!-- 账号输入框 -->
				<view class="input-group">
					<text class="input-icon">👤</text>
					<input class="input-field" 
						v-model="loginForm.username" 
						placeholder="请输入账号" 
						:placeholder-style="placeholderStyle" />
				</view>
				
				<!-- 密码输入框 -->
				<view class="input-group">
					<text class="input-icon">🔒</text>
					<input class="input-field password-field" 
						v-model="loginForm.password" 
						password
						placeholder="请输入密码" 
						:placeholder-style="placeholderStyle" />
				</view>
				
				<!-- 验证码输入框 -->
				<view class="input-group">
					<text class="input-icon">🔐</text>
					<input class="input-field verification-input" 
						v-model="loginForm.captcha" 
						placeholder="请输入验证码" 
						:placeholder-style="placeholderStyle" />
					<view class="captcha-image" @click="refreshCaptcha">
						<text class="captcha-text">{{ captchaCode }}</text>
					</view>
				</view>
				
				<!-- 记住账号 -->
				<view class="form-options">
					<view class="remember-account" @click="toggleRemember">
						<text class="checkbox" :class="{checked: rememberAccount}">
							{{ rememberAccount ? '✓' : '' }}
						</text>
						<text class="option-text">记住账号</text>
					</view>
				</view>
				
				<!-- 登录按钮 -->
				<button class="login-btn" @click="handleLogin">
					{{ getRoleText() }}登录
				</button>
			</view>
		</view>
	</view>
</template>

<script>
	// import { login, getCaptcha, verifyCaptcha } from '@/api/user.js'; // 取消注释以使用API接口
	
	export default {
		data() {
			return {
				currentRole: 'student', // 默认选中学生
				rememberAccount: false,
				captchaCode: Math.floor(1000 + Math.random() * 9000).toString(), // 初始随机验证码
				captchaId: '', // 验证码ID（后端返回）
				loginForm: {
					username: '',
					password: '',
					captcha: ''
				},
				placeholderStyle: 'color: #999;',
				backgroundImage: '/static/777.png',
				currentImagePathIndex: 0,
				imagePaths: [
					'/static/777.jpg',
					'../../static/777.jpg',
					'@/static/777.jpg',
					'static/777.jpg'
				]
			}
		},
		methods: {
			switchRole(role) {
				this.currentRole = role;
			},
			onUsernameInput(e) {
				this.loginForm.username = e.detail.value;
			},
			toggleRemember() {
				this.rememberAccount = !this.rememberAccount;
			},
			refreshCaptcha() {
				// 生成新的验证码
				this.captchaCode = Math.floor(1000 + Math.random() * 9000).toString();
				this.loginForm.captcha = '';
				
				// ========== 以下为API接口调用代码（注释状态，需要时取消注释） ==========
				// getCaptcha().then(res => {
				// 	if (res.statusCode === 200 && res.data.code === 200) {
				// 		// 如果后端返回图片，使用图片URL
				// 		// this.captchaImageUrl = res.data.data.imageUrl;
				// 		// this.captchaId = res.data.data.captchaId;
				// 		
				// 		// 如果后端返回验证码字符串
				// 		// this.captchaCode = res.data.data.captcha;
				// 		// this.captchaId = res.data.data.captchaId;
				// 	} else {
				// 		uni.showToast({
				// 			title: res.data.message || '获取验证码失败',
				// 			icon: 'none'
				// 		});
				// 	}
				// }).catch(err => {
				// 	console.error('获取验证码失败:', err);
				// 	uni.showToast({
				// 		title: '获取验证码失败，请重试',
				// 		icon: 'none'
				// 	});
				// });
				// ========== API接口调用代码结束 ==========
			},
			getRoleText() {
				const roleMap = {
					'student': '学生',
					'teacher': '教师',
					'admin': '管理员'
				};
				return roleMap[this.currentRole] || '用户';
			},
			
			async handleLogin() {
				// 验证表单
				if (!this.loginForm.username) {
					uni.showToast({
						title: '请输入用户名',
						icon: 'none'
					});
					return;
				}
				
				if (!this.loginForm.password) {
					uni.showToast({
						title: '请输入密码',
						icon: 'none'
					});
					return;
				}
				
				if (!this.loginForm.captcha) {
					uni.showToast({
						title: '请输入验证码',
						icon: 'none'
					});
					return;
				}
				
				// 前端验证码校验（使用API时注释掉）
				if (this.loginForm.captcha !== this.captchaCode) {
					uni.showToast({
						title: '验证码错误',
						icon: 'none'
					});
					this.refreshCaptcha();
					return;
				}
				
				// 调用后端登录接口
				try {
					const { login } = await import('@/api/user.js');
					
					uni.showLoading({ title: '登录中...' });
					
					const loginRes = await login({
						username: this.loginForm.username,
						password: this.loginForm.password,
						role: this.currentRole
					});
					
					uni.hideLoading();
					
					// 处理登录响应
					if (loginRes && (loginRes.code === 200 || loginRes.access_token)) {
						// 保存token
						const token = loginRes.access_token || loginRes.token;
						if (token) {
							uni.setStorageSync('token', token);
						}
						
						// 保存角色
						uni.setStorageSync('userRole', this.currentRole);
						
						// 保存用户信息（使用后端返回的或构建的）
						// 后端返回格式: { access_token, token_type, user: { id, username, full_name, role } }
						const userData = loginRes.user || {};
						const teacherId = Number(userData.id) || 0;
						let userInfo = {
							id: teacherId,
							sub: teacherId,
							username: userData.username || this.loginForm.username,
							full_name: userData.full_name || '',
							role: userData.role || this.currentRole,
							...userData
						};
						
						// 如果是教师角色，保存 teacher_id 供教师端API使用
						if (this.currentRole === 'teacher' && teacherId > 0) {
							uni.setStorageSync('teacher_id', teacherId);
							uni.setStorageSync('teacher_username', userInfo.username);
							console.log('保存教师ID:', teacherId);
						}
						
						uni.setStorageSync('userInfo', userInfo);
						
						// 保存登录时间
						const now = new Date();
						uni.setStorageSync('lastLoginTime', `${now.getMonth() + 1}/${now.getDate()}`);
						
						// 记住账号
						if (this.rememberAccount) {
							uni.setStorageSync('rememberedUsername', this.loginForm.username);
						} else {
							uni.removeStorageSync('rememberedUsername');
						}
						
						uni.showToast({
							title: '登录成功',
							icon: 'success',
							duration: 1500
						});
						
						setTimeout(() => {
							// 根据角色跳转
							if (this.currentRole === 'student') {
								uni.reLaunch({ url: '/pages/student/workbench' });
							} else if (this.currentRole === 'teacher') {
								uni.reLaunch({ url: '/pages/teacher/dashboard' });
							} else if (this.currentRole === 'admin') {
								uni.reLaunch({ url: '/pages/admin/management' });
							}
						}, 1500);
					} else {
						// 登录失败
						const errorMsg = loginRes?.detail || loginRes?.message || '登录失败，请检查账号密码';
						uni.showToast({
							title: errorMsg,
							icon: 'none'
						});
						this.refreshCaptcha();
					}
				} catch (error) {
					uni.hideLoading();
					console.error('登录失败:', error);
					
					// 显示错误信息
					const errorMsg = error?.message || '登录失败，请检查网络连接';
					uni.showToast({
						title: errorMsg,
						icon: 'none'
					});
				}
			},
			onImageError(e) {
				console.log('背景图片加载失败，当前路径:', this.backgroundImage, e);
				if (this.currentImagePathIndex < this.imagePaths.length - 1) {
					this.currentImagePathIndex++;
					this.backgroundImage = this.imagePaths[this.currentImagePathIndex];
					console.log('尝试新路径:', this.backgroundImage);
				}
			},
			onImageLoad() {
				console.log('背景图片加载成功:', this.backgroundImage);
			}
		},
		onLoad() {
			// 检查是否有记住的账号
			const rememberedUsername = uni.getStorageSync('rememberedUsername');
			// 如果存储的是无效值（如"1"或"admin"），清除它
			if (rememberedUsername === '1' || rememberedUsername === 'admin' || !rememberedUsername || rememberedUsername.trim() === '') {
				uni.removeStorageSync('rememberedUsername');
				this.loginForm.username = '';
				this.rememberAccount = false;
			} else {
				// 只有有效的用户名才填充
				this.loginForm.username = rememberedUsername;
				this.rememberAccount = true;
			}
			this.backgroundImage = this.imagePaths[this.currentImagePathIndex];
			
			// ========== 以下为API接口调用代码（注释状态，需要时取消注释） ==========
			// // 页面加载时获取验证码
			// this.refreshCaptcha();
			// ========== API接口调用代码结束 ==========
		}
	}
</script>

<style scoped>
	.login-container {
		min-height: 100vh;
		width: 100%;
		position: relative;
		display: flex;
		justify-content: flex-end;
		align-items: center;
		padding: 40rpx 150rpx 40rpx 40rpx;
		overflow: hidden;
	}
	
	.background-image {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 0;
		object-fit: cover;
	}
	
	.login-panel {
		width: 100%;
		max-width: 600rpx;
		background-color: #fff;
		border-radius: 20rpx;
		padding: 60rpx 50rpx;
		box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
		position: relative;
		z-index: 1;
		margin-right: 250rpx;
	}
	
	.login-header {
		text-align: center;
		margin-bottom: 50rpx;
	}
	
	.header-icon {
		font-size: 80rpx;
		margin-bottom: 20rpx;
		display: block;
	}
	
	.system-title {
		display: block;
		font-size: 48rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 15rpx;
	}
	
	.system-subtitle {
		display: block;
		font-size: 26rpx;
		color: #999;
	}
	
	.role-tabs {
		display: flex;
		justify-content: space-between;
		margin-bottom: 50rpx;
		border-bottom: 2px solid #f0f0f0;
	}
	
	.role-tab {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 25rpx 10rpx;
		cursor: pointer;
		position: relative;
		transition: all 0.3s;
	}
	
	.role-tab.active {
		color: #1890ff;
	}
	
	.role-tab.active::after {
		content: '';
		position: absolute;
		bottom: -2px;
		left: 0;
		right: 0;
		height: 4rpx;
		background-color: #1890ff;
		border-radius: 2rpx 2rpx 0 0;
	}
	
	.role-icon {
		font-size: 40rpx;
		margin-bottom: 10rpx;
	}
	
	.role-text {
		font-size: 28rpx;
		color: #666;
	}
	
	.role-tab.active .role-text {
		color: #1890ff;
		font-weight: 500;
	}
	
	.login-form {
		width: 100%;
	}
	
	.input-group {
		position: relative;
		display: flex;
		align-items: center;
		margin-bottom: 30rpx;
		border: 2rpx solid #e0e0e0;
		border-radius: 10rpx;
		background-color: #fff;
		padding: 0 20rpx;
		transition: border-color 0.3s;
	}
	
	.input-group:focus-within {
		border-color: #1890ff;
	}
	
	.input-icon {
		font-size: 36rpx;
		margin-right: 20rpx;
		color: #999;
	}
	
	.input-field {
		flex: 1;
		height: 90rpx;
		font-size: 28rpx;
		color: #333;
	}
	
	.verification-input {
		flex: 1;
	}
	
	.password-toggle {
		font-size: 36rpx;
		color: #999;
		cursor: pointer;
		padding: 10rpx;
	}
	
	.captcha-image {
		width: 150rpx;
		height: 60rpx;
		border: 2rpx solid #e0e0e0;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #f5f5f5;
		cursor: pointer;
		margin-left: 20rpx;
		position: relative;
		overflow: hidden;
	}
	
	.captcha-image::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(45deg, transparent 48%, #000 49%, #000 51%, transparent 52%);
		opacity: 0.3;
	}
	
	.captcha-text {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		letter-spacing: 5rpx;
		position: relative;
		z-index: 1;
	}
	
	.form-options {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 40rpx;
	}
	
	.remember-account {
		display: flex;
		align-items: center;
		cursor: pointer;
	}
	
	.checkbox {
		width: 32rpx;
		height: 32rpx;
		border: 2rpx solid #d9d9d9;
		border-radius: 4rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 10rpx;
		font-size: 24rpx;
		color: #fff;
		background-color: #fff;
		transition: all 0.3s;
	}
	
	.checkbox.checked {
		background-color: #1890ff;
		border-color: #1890ff;
	}
	
	.option-text {
		font-size: 26rpx;
		color: #666;
	}
	
	.forgot-password {
		font-size: 26rpx;
		color: #1890ff;
		cursor: pointer;
	}
	
	.login-btn {
		width: 100%;
		height: 90rpx;
		background-color: #1890ff;
		color: #fff;
		border-radius: 10rpx;
		font-size: 32rpx;
		font-weight: 500;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.3);
		transition: all 0.3s;
	}
	
	.login-btn:active {
		background-color: #40a9ff;
		transform: translateY(2rpx);
		box-shadow: 0 2rpx 8rpx rgba(24, 144, 255, 0.2);
	}
</style>
