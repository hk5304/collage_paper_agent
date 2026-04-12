<template>
	<view class="forgot-password-container">
		<!-- 背景图片 -->
		<image class="background-image" 
			:src="backgroundImage" 
			mode="aspectFill" 
			@error="onImageError"
			@load="onImageLoad"></image>
		
		<!-- 忘记密码面板 -->
		<view class="forgot-panel">
			<!-- 返回按钮 -->
			<view class="back-header" @click="goBack">
				<text class="back-icon">←</text>
				<text class="back-text">返回登录</text>
			</view>
			
			<!-- 标题 -->
			<view class="forgot-header">
				<view class="header-icon">🔑</view>
				<text class="forgot-title">忘记密码</text>
				<text class="forgot-subtitle">请输入您的账号信息以找回密码</text>
			</view>
			
			<!-- 表单 -->
			<view class="forgot-form">
				<!-- 账号输入框 -->
				<view class="input-group">
					<text class="input-icon">👤</text>
					<input class="input-field" 
						v-model="forgotForm.username" 
						placeholder="请输入账号" 
						:placeholder-style="placeholderStyle" />
				</view>
				
				<!-- 验证码输入框 -->
				<view class="input-group">
					<text class="input-icon">🔐</text>
					<input class="input-field verification-input" 
						v-model="forgotForm.captcha" 
						placeholder="请输入验证码" 
						:placeholder-style="placeholderStyle" />
					<view class="captcha-image" @click="refreshCaptcha">
						<text class="captcha-text">{{ captchaCode }}</text>
					</view>
				</view>
				
				<!-- 身份选择 -->
				<view class="role-select">
					<text class="select-label">身份类型：</text>
					<view class="role-options">
						<view class="role-option" 
							:class="{active: forgotForm.role === 'student'}" 
							@click="forgotForm.role = 'student'">
							<text>学生</text>
						</view>
						<view class="role-option" 
							:class="{active: forgotForm.role === 'teacher'}" 
							@click="forgotForm.role = 'teacher'">
							<text>教师</text>
						</view>
						<view class="role-option" 
							:class="{active: forgotForm.role === 'admin'}" 
							@click="forgotForm.role = 'admin'">
							<text>管理员</text>
						</view>
					</view>
				</view>
				
				<!-- 提交按钮 -->
				<button class="submit-btn" @click="handleSubmit">提交</button>
				
				<!-- 提示信息 -->
				<view class="tips">
					<text class="tip-text">提示：</text>
					<text class="tip-content">提交后，系统将向您的注册邮箱发送密码重置链接，请查收邮件并按照提示操作。</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	// import { forgotPassword, getCaptcha, verifyCaptcha } from '@/api/user.js'; // 取消注释以使用API接口
	
	export default {
		data() {
			return {
				captchaCode: '1234',
				captchaId: '', // 验证码ID（后端返回）
				forgotForm: {
					username: '',
					captcha: '',
					role: 'student'
				},
				placeholderStyle: 'color: #999;',
				backgroundImage: '/static/777.jpg',
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
			goBack() {
				uni.navigateBack();
			},
			refreshCaptcha() {
				// 生成新的验证码
				this.captchaCode = Math.floor(1000 + Math.random() * 9000).toString();
				this.forgotForm.captcha = '';
				
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
			handleSubmit() {
				// 验证表单
				if (!this.forgotForm.username) {
					uni.showToast({
						title: '请输入账号',
						icon: 'none'
					});
					return;
				}
				
				if (!this.forgotForm.captcha) {
					uni.showToast({
						title: '请输入验证码',
						icon: 'none'
					});
					return;
				}
				
				// 前端验证码校验（使用API时注释掉）
				if (this.forgotForm.captcha !== this.captchaCode) {
					uni.showToast({
						title: '验证码错误',
						icon: 'none'
					});
					this.refreshCaptcha();
					return;
				}
				
				// ========== 以下为API接口调用代码（注释状态，需要时取消注释） ==========
				// // 先验证验证码
				// verifyCaptcha(this.forgotForm.captcha, this.captchaId).then(res => {
				// 	if (res.statusCode === 200 && res.data.code === 200) {
				// 		// 验证码验证通过，调用忘记密码接口
				// 		forgotPassword({
				// 			username: this.forgotForm.username,
				// 			captcha: this.forgotForm.captcha,
				// 			role: this.forgotForm.role
				// 		}).then(forgotRes => {
				// 			if (forgotRes.statusCode === 200 && forgotRes.data.code === 200) {
				// 				uni.showModal({
				// 					title: '提交成功',
				// 					content: forgotRes.data.message || '密码重置链接已发送至您的注册邮箱，请查收邮件并按照提示操作。',
				// 					showCancel: false,
				// 					success: (modalRes) => {
				// 						if (modalRes.confirm) {
				// 							// 返回登录页面
				// 							uni.navigateBack();
				// 						}
				// 					}
				// 				});
				// 			} else {
				// 				uni.showToast({
				// 					title: forgotRes.data.message || '提交失败',
				// 					icon: 'none'
				// 				});
				// 				this.refreshCaptcha();
				// 			}
				// 		}).catch(err => {
				// 			console.error('提交失败:', err);
				// 			uni.showToast({
				// 				title: '提交失败，请重试',
				// 				icon: 'none'
				// 			});
				// 			this.refreshCaptcha();
				// 		});
				// 	} else {
				// 		uni.showToast({
				// 			title: res.data.message || '验证码错误',
				// 			icon: 'none'
				// 		});
				// 		this.refreshCaptcha();
				// 	}
				// }).catch(err => {
				// 	console.error('验证码验证失败:', err);
				// 	uni.showToast({
				// 		title: '验证码验证失败，请重试',
				// 		icon: 'none'
				// 	});
				// 	this.refreshCaptcha();
				// });
				// ========== API接口调用代码结束 ==========
				
				// 以下为模拟提交代码（使用API时注释掉）
				// 模拟提交成功
				uni.showModal({
					title: '提交成功',
					content: '密码重置链接已发送至您的注册邮箱，请查收邮件并按照提示操作。',
					showCancel: false,
					success: (res) => {
						if (res.confirm) {
							// 返回登录页面
							uni.navigateBack();
						}
					}
				});
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
			this.backgroundImage = this.imagePaths[this.currentImagePathIndex];
			
			// ========== 以下为API接口调用代码（注释状态，需要时取消注释） ==========
			// // 页面加载时获取验证码
			// this.refreshCaptcha();
			// ========== API接口调用代码结束 ==========
		}
	}
</script>

<style scoped>
	.forgot-password-container {
		min-height: 100vh;
		width: 100%;
		position: relative;
		display: flex;
		justify-content: flex-end;
		align-items: center;
		padding: 40rpx 60rpx;
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
	
	.forgot-panel {
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
	
	.back-header {
		display: flex;
		align-items: center;
		margin-bottom: 40rpx;
		cursor: pointer;
	}
	
	.back-icon {
		font-size: 40rpx;
		color: #1890ff;
		margin-right: 10rpx;
	}
	
	.back-text {
		font-size: 28rpx;
		color: #1890ff;
	}
	
	.forgot-header {
		text-align: center;
		margin-bottom: 50rpx;
	}
	
	.header-icon {
		font-size: 80rpx;
		margin-bottom: 20rpx;
		display: block;
	}
	
	.forgot-title {
		display: block;
		font-size: 48rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 15rpx;
	}
	
	.forgot-subtitle {
		display: block;
		font-size: 26rpx;
		color: #999;
	}
	
	.forgot-form {
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
	
	.role-select {
		margin-bottom: 40rpx;
	}
	
	.select-label {
		display: block;
		font-size: 28rpx;
		color: #333;
		margin-bottom: 20rpx;
	}
	
	.role-options {
		display: flex;
		gap: 20rpx;
	}
	
	.role-option {
		flex: 1;
		padding: 20rpx;
		border: 2rpx solid #e0e0e0;
		border-radius: 10rpx;
		text-align: center;
		font-size: 28rpx;
		color: #666;
		background-color: #fff;
		cursor: pointer;
		transition: all 0.3s;
	}
	
	.role-option.active {
		border-color: #1890ff;
		background-color: #e6f7ff;
		color: #1890ff;
		font-weight: 500;
	}
	
	.submit-btn {
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
		margin-bottom: 30rpx;
	}
	
	.submit-btn:active {
		background-color: #40a9ff;
		transform: translateY(2rpx);
		box-shadow: 0 2rpx 8rpx rgba(24, 144, 255, 0.2);
	}
	
	.tips {
		padding: 20rpx;
		background-color: #f0f7ff;
		border-radius: 10rpx;
		border-left: 4rpx solid #1890ff;
	}
	
	.tip-text {
		display: block;
		font-size: 26rpx;
		color: #1890ff;
		font-weight: 500;
		margin-bottom: 10rpx;
	}
	
	.tip-content {
		display: block;
		font-size: 24rpx;
		color: #666;
		line-height: 1.6;
	}
</style>

