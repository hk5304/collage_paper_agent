<template>
	<view class="management-container admin-curator-layout">
		<!-- 左侧导航：参考「管理员页面设计 / Academic Curator」玻璃侧栏 -->
		<view class="admin-sidebar">
			<view class="sidebar-brand">
				<text class="sidebar-brand-title">学术策展工作台</text>
				<text class="sidebar-brand-en">The Academic Curator</text>
				<text class="sidebar-brand-sub">管理员门户</text>
			</view>
			<view class="sidebar-nav">
				<view
					class="sidebar-nav-item"
					:class="{ active: currentTab === 'group' }"
					@click="currentTab = 'group'"
				>
					<text class="material-symbols-outlined sidebar-nav-icon">groups</text>
					<text class="sidebar-nav-text">群组管理</text>
				</view>
				<view
					class="sidebar-nav-item"
					:class="{ active: currentTab === 'permission' }"
					@click="currentTab = 'permission'"
				>
					<text class="material-symbols-outlined sidebar-nav-icon">manage_accounts</text>
					<text class="sidebar-nav-text">用户与权限</text>
				</view>
				<view
					class="sidebar-nav-item"
					:class="{ active: currentTab === 'notice' }"
					@click="currentTab = 'notice'"
				>
					<text class="material-symbols-outlined sidebar-nav-icon">campaign</text>
					<text class="sidebar-nav-text">公告中心</text>
				</view>
				<view
					class="sidebar-nav-item"
					:class="{ active: currentTab === 'dashboard' }"
					@click="switchToDashboard"
				>
					<text class="material-symbols-outlined sidebar-nav-icon">dashboard</text>
					<text class="sidebar-nav-text">控制台</text>
				</view>
				<view
					class="sidebar-nav-item"
					:class="{ active: currentTab === 'groupRelations' }"
					@click="currentTab = 'groupRelations'"
				>
					<text class="material-symbols-outlined sidebar-nav-icon">account_tree</text>
					<text class="sidebar-nav-text">查看群组关系</text>
				</view>
				<view
					v-if="showSchoolMaintenanceTab"
					class="sidebar-nav-item"
					:class="{ active: currentTab === 'school' }"
					@click="currentTab = 'school'"
				>
					<text class="material-symbols-outlined sidebar-nav-icon">apartment</text>
					<text class="sidebar-nav-text">院校信息维护</text>
				</view>
			</view>
			<view class="sidebar-footer">
				<view class="sidebar-link" @click="onSidebarHelp">
					<text class="material-symbols-outlined">help</text>
					<text>帮助中心</text>
				</view>
				<view class="sidebar-link sidebar-link-danger" @click="showLogoutConfirm">
					<text class="material-symbols-outlined">logout</text>
					<text>退出登录</text>
				</view>
			</view>
		</view>

		<view class="admin-main">
			<view class="admin-topbar">
				<view class="admin-topbar-left">
					<text v-if="currentTab !== 'permission'" class="admin-page-kicker">系统管理</text>
					<text class="admin-page-title">{{ currentPageTitle }}</text>
					<text v-if="currentPageDesc" class="admin-page-desc">{{ currentPageDesc }}</text>
				</view>
				<view class="admin-topbar-right">
					<view class="admin-profile-card-root">
						<view
							class="profile-btn-wrapper"
							@mouseenter="onUserCardEnter"
							@mouseleave="onUserCardLeave"
						>
							<view class="profile-avatar">
								<image
									v-if="adminAvatar"
									class="profile-avatar-img"
									:src="adminAvatar"
									mode="aspectFill"
								/>
								<text v-else class="profile-avatar-letter">{{ userCardLetter }}</text>
							</view>
							<view
								class="user-info-card"
								:class="{ show: showUserCard }"
								@click.stop
								@mouseenter="onUserCardEnter"
								@mouseleave="onUserCardLeave"
							>
								<view class="user-card-header">
									<view class="user-card-avatar">
										<image
											v-if="adminAvatar"
											class="user-card-avatar-img"
											:src="adminAvatar"
											mode="aspectFill"
										/>
										<text v-else class="profile-avatar-letter">{{ userCardLetter }}</text>
									</view>
									<view class="user-card-info">
										<text class="user-name">{{ userCardInfo.name }}</text>
										<text class="user-id">工号：{{ userCardInfo.username || '—' }}</text>
										<view class="user-role-badge">{{ userCardInfo.role }}</view>
									</view>
								</view>
								<view class="user-card-menu">
									<view class="menu-item" @click="openChangePassword">
										<text class="material-symbols-outlined">lock</text>
										<text>修改密码</text>
									</view>
									<view class="menu-item logout" @click="showLogoutConfirm">
										<text class="material-symbols-outlined">logout</text>
										<text>退出登录</text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<view class="admin-content-wrap">
		<!-- 群组管理（含师生关系导入、批量下载、群组列表，布局参考 group_resource_operations） -->
		<view v-if="currentTab === 'group'" class="tab-content tab-content-group-ops">
			<view class="group-ops-page">
				<view class="group-ops-hero">
					<view class="group-ops-hero-text">
						<text class="group-ops-kicker">群组与资源</text>
						<text class="group-ops-title">群组管理</text>
						<text class="group-ops-desc">维护学术群组、批量同步师生关系到群组，并按群组打包下载论文资源。</text>
					</view>
					<button class="group-ops-create-btn" type="default" @click="showCreateGroup">
						<text class="material-symbols-outlined group-ops-create-ic">add</text>
						<text>创建群组</text>
					</button>
				</view>

				<view class="group-ops-bento">
					<view class="group-ops-panel group-ops-panel-import">
						<view class="group-ops-panel-head">
							<text class="group-ops-panel-kicker">Bulk Import</text>
							<text class="group-ops-panel-title">批量导入师生关系</text>
							<text class="group-ops-panel-desc">上传 CSV，将教师、学生与群组关系写入系统。</text>
						</view>
						<view class="import-section group-ops-import-inner">
							<view class="import-tips">
								<text class="tip-title">导入说明：</text>
								<text class="tip-item">1. 支持CSV格式（.csv）和XLSX格式(.xlsx)
								</text>
								<text class="tip-item">2. 文件大小不超过10MB</text>
								<text class="tip-item">3. 必须包含以下列：教师姓名、教师工号、学生姓名、学生学号、群组编号、群组名称</text>
							</view>
							<view class="import-actions">
								<button class="upload-file-btn" @click="chooseImportFile">选择文件上传</button>
							</view>
							<view v-if="selectedImportFile" class="file-info">
								<view class="file-info-content">
									<text class="file-name">📄 {{ selectedImportFile.name }}</text>
									<text class="file-size">大小：{{ formatFileSize(selectedImportFile.size) }}</text>
								</view>
								<button class="remove-file-btn" @click="removeImportFile">移除</button>
							</view>
							<button
								class="submit-import-btn"
								:disabled="!selectedImportFile"
								@click="submitImport"
							>开始导入</button>
							<view v-if="importProgress.show" class="import-progress">
								<text class="progress-text">{{ importProgress.text }}</text>
								<progress
									:percent="importProgress.percent"
									:show-info="true"
									:stroke-width="10"
									activeColor="#005bbf"
								/>
								<view v-if="importProgress.details" class="progress-details">
									<text class="detail-item">成功：{{ importProgress.details.success || 0 }}条</text>
									<text class="detail-item">失败：{{ importProgress.details.failed || 0 }}条</text>
									<text class="detail-item">跳过：{{ importProgress.details.skipped || 0 }}条</text>
								</view>
							</view>
							<view v-if="importResult.show" class="import-result" :class="{ 'import-result--failed': importResult.isFailure }">
								<view class="result-header">
									<text class="result-title">{{ importResult.isFailure ? '导入失败' : '导入完成' }}</text>
									<text class="close-result-btn" @click="closeImportResult">×</text>
								</view>
								<view class="result-content">
									<text class="result-summary">总计：{{ importResult.total }}条</text>
									<text class="result-success">成功：{{ importResult.success }}条</text>
									<text class="result-failed">失败：{{ importResult.failed }}条</text>
									<text class="result-skipped">跳过：{{ importResult.skipped }}条</text>
									<view v-if="importResult.errors && importResult.errors.length > 0" class="error-list">
										<text class="error-title">{{ importResult.isFailure ? '失败原因' : '错误详情' }}</text>
										<view v-for="(error, idx) in importResult.errors" :key="idx" class="error-item">
											<text>{{ error }}</text>
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>

					<view class="group-ops-panel group-ops-panel-download">
						<view class="group-ops-download-card">
							<view class="group-ops-download-icon-wrap">
								<text class="material-symbols-outlined group-ops-download-ms">folder_zip</text>
							</view>
							<text class="group-ops-download-title">论文打包下载</text>
							<text class="group-ops-download-desc">按群组名称或编号查询后，打包为 ZIP 下载。</text>
							<view class="download-section group-ops-download-inner">
								<view class="download-filters">
									<view class="filter-item filter-item-column">
										<text class="filter-label">群组名称</text>
										<view class="filter-input-row">
											<input
												class="download-group-name-input"
												type="text"
												v-model="batchDownloadGroupName"
												placeholder="支持编号或名称（keyword）"
												confirm-type="search"
												@confirm="previewBatchDownloadByGroupName"
											/>
											<button type="default" class="download-preview-count-btn" @click="previewBatchDownloadByGroupName">
												更新预计
											</button>
										</view>
										<text class="download-name-hint">流程：先查询再下载。</text>
									</view>
								</view>
								<view class="download-preview">
									<text class="preview-title">预计下载：{{ downloadCount }} 个文件</text>
								</view>
								<view class="download-options">
									<text class="option-fixed-tip">✔ 打包为ZIP文件</text>
								</view>
								<button class="download-btn group-ops-download-start" @click="startDownload">开始下载</button>
							</view>
						</view>
					</view>
				</view>

				<view class="group-ops-list-section">
					<view class="group-ops-list-head">
						<text class="group-ops-list-title">群组列表</text>
						<text class="group-ops-list-sub">按教师工号或群组名称筛选，或浏览全部群组。</text>
					</view>
					<view class="group-ops-search-bar">
						<text class="group-ops-search-label">查询条件</text>
						<view class="group-ops-search-row">
							<text class="material-symbols-outlined group-ops-search-ic">search</text>
							<input
								class="group-ops-search-input"
								v-model="groupSearchKeyword"
								placeholder="输入教师工号格式或群组名称，留空可加载全部"
								confirm-type="search"
								@confirm="searchGroups"
							/>
							<button class="group-ops-search-submit" type="default" @click="searchGroups">
								<text class="material-symbols-outlined group-ops-search-submit-ic">travel_explore</text>
								<text>查询群组</text>
							</button>
						</view>
					</view>
					<view class="group-list">
						<view v-for="(group, index) in groups" :key="index" class="group-card">
							<view class="group-card-top">
								<view class="group-card-lead">
									<view class="group-card-avatar">
										<text class="material-symbols-outlined group-card-avatar-ic">groups</text>
									</view>
									<view class="group-info">
										<text class="group-name">{{ group.name }}</text>
										<text class="group-code">
											<text class="group-code-kicker">群组编号</text>
											{{ group.code }}
										</text>
									</view>
								</view>
								<view class="group-status" :class="group.active ? 'active' : 'inactive'">
									<text>{{ group.active ? '启用' : '禁用' }}</text>
								</view>
							</view>
							<view class="group-stats">
								<view class="group-stat-pill">
									<text class="material-symbols-outlined group-stat-ic">co_present</text>
									<text class="group-stat-label">教师</text>
									<text class="group-stat-num">{{ group.teacherCount }}</text>
								</view>
								<view class="group-stat-pill">
									<text class="material-symbols-outlined group-stat-ic">school</text>
									<text class="group-stat-label">学生</text>
									<text class="group-stat-num">{{ group.studentCount }}</text>
								</view>
								<view class="group-stat-pill">
									<text class="material-symbols-outlined group-stat-ic">article</text>
									<text class="group-stat-label">论文</text>
									<text class="group-stat-num">{{ group.paperCount }}</text>
								</view>
							</view>
							<view class="group-actions">
								<button class="group-action-btn group-action-btn--secondary" type="default" @click="editGroup(group)">
									<text class="material-symbols-outlined group-action-ic">edit_square</text>
									<text>编辑</text>
								</button>
								<button class="group-action-btn group-action-btn--secondary" type="default" @click="viewGroupDetail(group)">
									<text class="material-symbols-outlined group-action-ic">visibility</text>
									<text>详情</text>
								</button>
								<button class="group-action-btn group-action-btn--danger" type="default" @click="deleteGroup(group)">
									<text class="material-symbols-outlined group-action-ic">delete</text>
									<text>删除</text>
								</button>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 用户与权限（创建账号 + 本页批量导入用户 + 用户目录） -->
		<view v-if="currentTab === 'permission'" class="tab-content tab-content-access">
			<view class="access-page">
				<view class="access-bento">
					<view class="access-panel access-panel-create">
						<view class="access-panel-create-head">
							<view class="access-panel-icon">
								<text class="material-symbols-outlined access-panel-icon-ms">add_moderator</text>
							</view>
							<text class="access-panel-create-title">创建机构账号</text>
						</view>
						<text class="access-panel-create-sub">选择身份类型并填写用户名、密码与姓名，单个创建学生、教师或管理员。</text>
						<view class="role-tabs access-role-tabs">
							<text
								class="role-tab"
								:class="{ active: createRoleType === 'student' }"
								@click="createRoleType = 'student'"
							>学生</text>
							<text
								class="role-tab"
								:class="{ active: createRoleType === 'teacher' }"
								@click="createRoleType = 'teacher'"
							>教师</text>
							<text
								class="role-tab"
								:class="{ active: createRoleType === 'admin' }"
								@click="createRoleType = 'admin'"
							>管理员</text>
						</view>
						<view v-if="createRoleType === 'student'" class="role-form access-role-form">
							<view class="form-item">
								<text class="form-label">学号</text>
								<input class="form-input access-form-input" v-model="studentForm.username" placeholder="学号（必填）" />
							</view>
							<view class="form-item">
								<text class="form-label">密码</text>
								<input class="form-input access-form-input" v-model="studentForm.password" type="password" placeholder="密码（必填）" />
							</view>
							<view class="form-item">
								<text class="form-label">姓名</text>
								<input class="form-input access-form-input" v-model="studentForm.full_name" placeholder="姓名（必填）" />
							</view>
							<button class="submit-btn access-submit-btn" type="default" @click="submitCreateStudent">创建学生</button>
						</view>
						<view v-if="createRoleType === 'teacher'" class="role-form access-role-form">
							<view class="form-item">
								<text class="form-label">工号</text>
								<input class="form-input access-form-input" v-model="teacherForm.username" placeholder="工号（必填）" />
							</view>
							<view class="form-item">
								<text class="form-label">密码</text>
								<input class="form-input access-form-input" v-model="teacherForm.password" type="password" placeholder="密码（必填）" />
							</view>
							<view class="form-item">
								<text class="form-label">姓名</text>
								<input class="form-input access-form-input" v-model="teacherForm.full_name" placeholder="姓名（必填）" />
							</view>
							<button class="submit-btn access-submit-btn" type="default" @click="submitCreateTeacher">创建教师</button>
						</view>
						<view v-if="createRoleType === 'admin'" class="role-form access-role-form">
							<view class="form-item">
								<text class="form-label">账号</text>
								<input class="form-input access-form-input" v-model="adminForm.username" placeholder="账号（必填）" />
							</view>
							<view class="form-item">
								<text class="form-label">密码</text>
								<input class="form-input access-form-input" v-model="adminForm.password" type="password" placeholder="密码（必填）" />
							</view>
							<view class="form-item">
								<text class="form-label">姓名</text>
								<input class="form-input access-form-input" v-model="adminForm.full_name" placeholder="姓名（必填）" />
							</view>
							<button class="submit-btn access-submit-btn" type="default" @click="submitCreateAdmin">创建管理员</button>
						</view>
					</view>

					<view class="access-import-card">
						<view class="access-import-card-head">
							<view class="access-import-icon">
								<text class="material-symbols-outlined">cloud_upload</text>
							</view>
							<view class="access-import-head-text">
								<text class="access-import-title">批量导入用户</text>
								<text class="access-import-lead">通过 CSV 一次写入多条账号，与左侧单条创建互补。</text>
							</view>
						</view>
						<view class="access-import-tips">
							<text class="access-import-tip-line">支持 .csv，单文件不超过 10MB</text>
							<text class="access-import-tip-line">需含列：username, user_type, full_name, role, password</text>
							<text class="access-import-tip-line">user_type / role 取值：student 或 teacher</text>
						</view>
						<view v-if="selectedUserImportFile" class="access-import-file">
							<text class="material-symbols-outlined access-import-file-ic">description</text>
							<view class="access-import-file-meta">
								<text class="access-import-file-name">{{ selectedUserImportFile.name }}</text>
								<text class="access-import-file-size">{{ formatFileSize(selectedUserImportFile.size) }}</text>
							</view>
							<text class="access-import-file-remove" @click="removeUserImportFile">移除</text>
						</view>
						<view class="access-import-actions">
							<button class="access-import-btn-secondary" type="default" @click="chooseUserImportFile">
								<text class="material-symbols-outlined access-import-btn-ic">attach_file</text>
								<text>选择 CSV</text>
							</button>
							<button
								class="access-import-btn-primary"
								type="default"
								:disabled="!selectedUserImportFile"
								:class="{ 'access-import-btn-primary--disabled': !selectedUserImportFile }"
								@click="submitUserImport"
							>
								<text class="material-symbols-outlined access-import-btn-ic">play_arrow</text>
								<text>开始导入用户</text>
							</button>
						</view>
						<view class="access-import-result-section">
							<text class="access-import-section-title">导入结果</text>
							<view v-if="!userImportResult.show" class="access-import-result-placeholder">
								<text class="access-import-result-placeholder-txt">点击「开始导入用户」后，在此查看新建、更新条数及错误明细。</text>
							</view>
							<view v-else class="access-import-outcome">
								<view class="access-import-outcome-top">
									<text class="access-import-outcome-msg">{{ userImportResult.message || '导入已完成' }}</text>
									<text class="access-import-outcome-close" @click="closeUserImportResult">×</text>
								</view>
								<view class="access-import-stat-grid">
									<view class="access-import-stat-card">
										<text class="access-import-stat-num">{{ userImportResult.created }}</text>
										<text class="access-import-stat-label">新建</text>
									</view>
									<view class="access-import-stat-card">
										<text class="access-import-stat-num">{{ userImportResult.updated }}</text>
										<text class="access-import-stat-label">更新</text>
									</view>
									<view
										class="access-import-stat-card access-import-stat-card--muted"
										v-if="userImportResult.failed > 0"
									>
										<text class="access-import-stat-num access-import-stat-num--warn">{{ userImportResult.failed }}</text>
										<text class="access-import-stat-label">失败</text>
									</view>
								</view>
								<text class="access-import-total-line">合计处理 {{ userImportResult.total }} 条</text>
								<view
									v-if="userImportResult.errors && userImportResult.errors.length > 0"
									class="access-import-error-box"
								>
									<text class="access-import-error-title">错误明细</text>
									<view v-for="(error, idx) in userImportResult.errors" :key="idx" class="access-import-error-line">
										<text>{{ error }}</text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>

				<view class="access-directory">
					<view class="access-directory-toolbar">
						<view class="access-directory-title-block">
							<text class="access-directory-title">用户目录</text>
							<view class="access-directory-pills">
								<text class="access-pill access-pill--ok">全量列表</text>
							</view>
						</view>
						<view class="access-directory-segment">
							<view
								class="access-seg-item"
								:class="{ active: accessRoleFilter === 'all' }"
								@click="accessRoleFilter = 'all'"
							><text>全部</text></view>
							<view
								class="access-seg-item"
								:class="{ active: accessRoleFilter === 'student' }"
								@click="accessRoleFilter = 'student'"
							><text>学生</text></view>
							<view
								class="access-seg-item"
								:class="{ active: accessRoleFilter === 'teacher' }"
								@click="accessRoleFilter = 'teacher'"
							><text>教师</text></view>
							<view
								class="access-seg-item"
								:class="{ active: accessRoleFilter === 'admin' }"
								@click="accessRoleFilter = 'admin'"
							><text>管理员</text></view>
						</view>
					</view>
					<view class="access-directory-search-row">
						<view class="access-dir-search">
							<text class="material-symbols-outlined access-dir-search-ic">search</text>
							<input
								class="access-dir-search-input"
								v-model="searchKeyword"
								placeholder="筛选工号 / 学号 / 用户名 / 姓名 / 创建时间"
								confirm-type="search"
							/>
						</view>
						<button
							class="access-dir-search-btn"
							type="default"
							:disabled="userDirectoryLoading"
							@click="loadUserDirectory"
						>
							刷新目录
						</button>
					</view>

					<view class="access-directory-table-shell">
						<view class="access-table-head" v-if="accessDirectoryUsers.length > 0">
							<text class="access-th access-th-user">用户</text>
							<text class="access-th access-th-bizid">学号 / 工号 / 账号</text>
							<text class="access-th access-th-role">角色</text>
							<text class="access-th access-th-created">创建时间</text>
							<text class="access-th access-th-actions">操作</text>
						</view>
						<view class="access-user-rows">
							<view
								v-for="(user, index) in accessDirectoryUsers"
								:key="'u_' + index + '_' + (user.sub ?? '') + '_' + (user.id ?? '') + '_' + (user.role || '')"
								class="access-user-row"
							>
								<view class="access-user-profile">
									<view class="access-user-avatar" :class="'access-user-avatar--' + (user.role || 'student')">
										<text class="access-user-avatar-letter">{{ accessUserInitial(user.name) }}</text>
									</view>
									<view class="access-user-text">
										<text class="access-user-name">{{ user.name || '—' }}</text>
									</view>
								</view>
								<view class="access-user-bizid-cell">
									<text class="access-user-bizid-prefix">{{
										user.role === 'student'
											? '学号'
											: user.role === 'admin'
												? '账号'
												: '工号'
									}}</text>
									<text class="access-user-bizid">{{ user.id || '—' }}</text>
								</view>
								<view class="access-user-role-cell">
									<text class="access-chip" :class="'access-chip--' + (user.role || 'student')">
										{{ user.role === 'teacher' ? '教师' : user.role === 'admin' ? '管理员' : '学生' }}
									</text>
								</view>
								<view class="access-user-created-cell">
									<text class="access-user-created-prefix">创建时间</text>
									<text class="access-user-created">{{ user.createdAtDisplay }}</text>
								</view>
								<view class="access-user-actions">
									<view class="access-row-icon-btn" @click="editUserPermission(user)">
										<text class="material-symbols-outlined">edit_square</text>
									</view>
									<view class="access-row-icon-btn" @click="resetUserPassword(user)">
										<text class="material-symbols-outlined">key</text>
									</view>
								</view>
							</view>
						</view>
					</view>
					<view v-if="userDirectoryLoading && accessDirectoryUsers.length === 0" class="access-directory-empty">
						<text class="material-symbols-outlined access-directory-empty-ic">hourglass_top</text>
						<text class="access-directory-empty-title">正在加载用户目录…</text>
						<text class="access-directory-empty-desc">从服务器拉取全量成员列表。</text>
					</view>
					<view
						v-else-if="!userDirectoryLoading && accessDirectoryUsers.length === 0"
						class="access-directory-empty"
					>
						<text class="material-symbols-outlined access-directory-empty-ic">person_search</text>
						<text class="access-directory-empty-title">暂无符合条件的用户</text>
						<text class="access-directory-empty-desc">
							可调整上方角色筛选或清空筛选关键词；若列表为空，请点击「刷新目录」或稍后在群组/导入中新增用户。
						</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 控制台 -->
		<view v-if="currentTab === 'dashboard'" class="tab-content tab-content-dashboard">
			<view class="dashboard-content">
				<!-- 参考 admin_console_dashboard：英雄标题 + 操作 -->
				<view class="dashboard-hero">
					<view class="dashboard-hero-text">
						<text class="dashboard-kicker">数据概览</text>
						<text class="dashboard-headline">控制台一览</text>
					</view>
					<button class="refresh-btn dashboard-refresh-btn" @click="loadDashboardStats">刷新数据</button>
				</view>

				<!-- Bento 三列核心指标（与参考稿顺序：教师 / 学生 / 论文） -->
				<view class="dashboard-bento">
					<view class="dash-metric-card">
						<view class="dash-metric-top">
							<view class="dash-metric-icon-wrap dash-metric-icon--teacher">
								<text class="material-symbols-outlined dash-metric-ms">school</text>
							</view>
						</view>
						<text class="dash-metric-label">教师总数</text>
						<text class="dash-metric-value">{{ dashboardStats.teacherTotal }}</text>
						<text class="dash-metric-hint">后台实时汇总</text>
					</view>
					<view class="dash-metric-card">
						<view class="dash-metric-top">
							<view class="dash-metric-icon-wrap dash-metric-icon--student">
								<text class="material-symbols-outlined dash-metric-ms">group</text>
							</view>
						</view>
						<text class="dash-metric-label">学生总数</text>
						<text class="dash-metric-value">{{ dashboardStats.studentTotal }}</text>
						<text class="dash-metric-hint">后台实时汇总</text>
					</view>
					<view class="dash-metric-card">
						<view class="dash-metric-top">
							<view class="dash-metric-icon-wrap dash-metric-icon--paper">
								<text class="material-symbols-outlined dash-metric-ms">article</text>
							</view>
						</view>
						<text class="dash-metric-label">论文总数</text>
						<text class="dash-metric-value">{{ dashboardStats.paperTotal }}</text>
						<text class="dash-metric-hint">后台实时汇总</text>
					</view>
				</view>

				<!-- 不对称分栏：截止日期（主） + 论文细项（侧） -->
				<view class="dashboard-split">
					<view class="dash-panel dash-panel--deadlines">
						<view class="dash-panel-head">
							<text class="dash-panel-title">截止日期管理</text>
							<view class="dash-panel-link" @click.stop="showDeadlineManagement">
								<text>进入管理</text>
							</view>
						</view>
						<view class="dash-deadline-row" @click="showDeadlineManagement">
							<view class="dash-deadline-cal">
								<text class="material-symbols-outlined">event</text>
							</view>
							<view class="dash-deadline-copy">
								<text class="dash-deadline-title">查看与管理截止日期</text>
								<text class="dash-deadline-desc">按教师工号查询，维护各教师设置的截止日期</text>
							</view>
							<text class="material-symbols-outlined dash-deadline-chevron">chevron_right</text>
						</view>
					</view>

					<view class="dash-panel dash-panel--papers">
						<view class="dash-panel-head">
							<text class="dash-panel-title">论文详细统计</text>
							<text class="dash-live-pill">实时</text>
						</view>
						<view class="dash-paper-rows">
							<view class="dash-paper-row">
								<view class="dash-paper-row-icon dash-paper-row-icon--upload">
									<text class="material-symbols-outlined">upload</text>
								</view>
								<view class="dash-paper-row-meta">
									<text class="dash-paper-row-label">已上传论文</text>
									<text class="dash-paper-row-value">{{ dashboardStats.paperUploaded }}</text>
								</view>
							</view>
							<view class="dash-paper-row">
								<view class="dash-paper-row-icon dash-paper-row-icon--pending">
									<text class="material-symbols-outlined">hourglass_top</text>
								</view>
								<view class="dash-paper-row-meta">
									<text class="dash-paper-row-label">未审阅论文</text>
									<text class="dash-paper-row-value">{{ dashboardStats.paperUnreviewed }}</text>
								</view>
							</view>
							<view class="dash-paper-row">
								<view class="dash-paper-row-icon dash-paper-row-icon--done">
									<text class="material-symbols-outlined">check_circle</text>
								</view>
								<view class="dash-paper-row-meta">
									<text class="dash-paper-row-label">已更新论文</text>
									<text class="dash-paper-row-value">{{ dashboardStats.paperUpdated }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>

				<view class="update-time dashboard-update-time">
					<text>数据更新时间：{{ dashboardStats.updateTime || '未更新' }}</text>
				</view>
			</view>
		</view>

		<!-- 群组关系：扁平成员表 + 搜索 + 分页 -->
		<view v-if="currentTab === 'groupRelations'" class="tab-content tab-content-group-relations">
			<view class="group-relations-page">
				<view class="dashboard-hero">
					<view class="dashboard-hero-text">
						<text class="dashboard-kicker">成员与归属</text>
						<text class="dashboard-headline">群组关系一览</text>
					</view>
					<button
						class="refresh-btn dashboard-refresh-btn"
						type="default"
						:disabled="loadingGroupRelations"
						@click="loadGroupRelationsFlat"
					>
						刷新列表
					</button>
				</view>

				<view
					v-if="groupRelationsGroupDropdownOpen || groupRelationsRoleDropdownOpen"
					class="group-relations-dropdown-mask"
					@tap="closeGroupRelationsDropdowns"
					@click="closeGroupRelationsDropdowns"
				/>

				<view class="group-relations-toolbar">
					<view
						class="group-relations-select-wrap group-relations-select-wrap--group"
						:class="{ 'is-open': groupRelationsGroupDropdownOpen }"
					>
						<view
							class="group-relations-filter-picker"
							:class="{ 'is-open': groupRelationsGroupDropdownOpen }"
							@tap.stop="toggleGroupRelationsGroupDropdown"
						>
							<text class="group-relations-filter-label">群组</text>
							<text class="group-relations-filter-value">{{ groupRelationsGroupPickerDisplay }}</text>
							<text
								class="material-symbols-outlined group-relations-filter-arrow"
								:class="{ 'is-open': groupRelationsGroupDropdownOpen }"
							>expand_more</text>
						</view>
						<view
							v-if="groupRelationsGroupDropdownOpen"
							class="group-relations-dropdown-panel group-relations-dropdown-panel--group"
							@click.stop
						>
							<view class="group-relations-dropdown-scroll">
								<view
									v-for="(opt, gIdx) in groupRelationsGroupPickerOptions"
									:key="'gr-g-' + gIdx + '-' + String(opt.value)"
									class="group-relations-dropdown-item"
									:class="{ 'is-selected': String(groupRelationsFilterGroupId) === String(opt.value) }"
									@tap.stop="selectGroupRelationsGroup(opt)"
								>
									<text class="group-relations-dropdown-item-text">{{ opt.label }}</text>
								</view>
							</view>
						</view>
					</view>

					<view
						class="group-relations-select-wrap group-relations-select-wrap--role"
						:class="{ 'is-open': groupRelationsRoleDropdownOpen }"
					>
						<view
							class="group-relations-filter-picker"
							:class="{ 'is-open': groupRelationsRoleDropdownOpen }"
							@tap.stop="toggleGroupRelationsRoleDropdown"
						>
							<text class="group-relations-filter-label">角色</text>
							<text class="group-relations-filter-value">{{ groupRelationsRolePickerDisplay }}</text>
							<text
								class="material-symbols-outlined group-relations-filter-arrow"
								:class="{ 'is-open': groupRelationsRoleDropdownOpen }"
							>expand_more</text>
						</view>
						<view
							v-if="groupRelationsRoleDropdownOpen"
							class="group-relations-dropdown-panel group-relations-dropdown-panel--role"
							@click.stop
						>
							<view
								v-for="(opt, rIdx) in groupRelationsRolePickerOptions"
								:key="'gr-r-' + rIdx + '-' + opt.value"
								class="group-relations-dropdown-item"
								:class="{ 'is-selected': groupRelationsFilterRole === opt.value }"
								@tap.stop="selectGroupRelationsRole(opt)"
							>
								<text class="group-relations-dropdown-item-text">{{ opt.label }}</text>
							</view>
						</view>
					</view>
					<input
						class="form-input group-relations-search-input"
						type="text"
						v-model="groupRelationsSearchQuery"
						placeholder="按姓名、工号或学号筛选（实时）"
						confirm-type="search"
						@focus="closeGroupRelationsDropdowns"
					/>
					<button
						class="refresh-btn group-relations-search-btn"
						type="default"
						@click="groupRelationsPage = 1"
					>
						回到第 1 页
					</button>
				</view>

				<view class="group-relations-card">
					<view v-if="loadingGroupRelations" class="loading-container">
						<text>正在加载各群成员…</text>
					</view>
					<view v-else class="group-relations-table-wrap">
						<view class="group-relations-table">
							<view class="gr-tr gr-tr--head">
								<view class="gr-th gr-col-name"><text>群组名称</text></view>
								<view class="gr-th gr-col-code"><text>群组编号</text></view>
								<view class="gr-th gr-col-time"><text>群组创建时间</text></view>
								<view class="gr-th gr-col-mname"><text>姓名</text></view>
								<view class="gr-th gr-col-id"><text>工号/学号</text></view>
								<view class="gr-th gr-col-role"><text>角色类型</text></view>
								<view class="gr-th gr-col-action"><text>操作</text></view>
							</view>
							<view
								v-if="groupRelationsPagedRows.length === 0"
								class="group-relations-empty"
							>
								<text class="material-symbols-outlined group-relations-empty-ic">person_off</text>
								<text class="group-relations-empty-title">暂无数据</text>
								<text class="group-relations-empty-desc">
									{{ groupRelationsAllRows.length ? '没有符合筛选条件的成员' : '暂无群组或成员，请先在群组管理同步列表后刷新' }}
								</text>
							</view>
							<view
								v-for="row in groupRelationsPagedRows"
								:key="row._key"
								class="gr-tr gr-tr--body"
							>
								<text class="gr-td gr-col-name">{{ row.groupName }}</text>
								<text class="gr-td gr-col-code">{{ row.groupCode }}</text>
								<text class="gr-td gr-col-time gr-td--muted">{{ row.groupCreatedAt }}</text>
								<text class="gr-td gr-col-mname">{{ row.memberName }}</text>
								<text class="gr-td gr-col-id gr-td--mono">{{ row.memberBizId }}</text>
								<text class="gr-td gr-col-role">
									<text class="gr-role-pill">{{ row.roleLabel }}</text>
								</text>
								<view class="gr-td gr-col-action">
									<text
										class="gr-remove-link"
										@click="confirmRemoveMemberFromGroup(row)"
									>移出群组</text>
								</view>
							</view>
						</view>
					</view>
				</view>

				<view
					v-if="!loadingGroupRelations && groupRelationsFilteredRows.length > 0"
					class="group-relations-pagination"
				>
					<button
						class="group-relations-page-btn"
						type="default"
						:disabled="groupRelationsEffectivePage <= 1"
						@click="groupRelationsGoPrev"
					>
						上一页
					</button>
					<text class="group-relations-page-info">
						第 {{ groupRelationsEffectivePage }} / {{ groupRelationsTotalPages }} 页 · 每页 {{ groupRelationsPageSize }} 条
					</text>
					<button
						class="group-relations-page-btn"
						type="default"
						:disabled="groupRelationsEffectivePage >= groupRelationsTotalPages"
						@click="groupRelationsGoNext"
					>
						下一页
					</button>
				</view>

				<view class="update-time group-relations-footer-meta">
					<text>
						共 {{ groupRelationsFilteredRows.length }} 条成员关系{{
							groupRelationsSearchQuery.trim() || groupRelationsHasNonSearchFilters
								? '（全量 ' + groupRelationsAllRows.length + ' 条）'
								: ''
						}}
					</text>
				</view>
			</view>
		</view>
		
		<!-- 院校信息维护（与 showSchoolMaintenanceTab 联动，暂不使用时保持 false） -->
		<view v-if="showSchoolMaintenanceTab && currentTab === 'school'" class="tab-content" style="display: block;">
			<view class="section-header">
				<text class="section-title">院校信息维护</text>
			</view>
			
			<view class="school-management-content" v-if="true">
				<!-- 功能卡片网格 -->
				<view class="school-function-grid">
					<!-- 录入学校 -->
					<view class="school-function-card" @click.stop="showAddSchoolModal">
						<view class="function-icon">🏫</view>
						<text class="function-title">录入学校</text>
						<text class="function-desc">添加新的学校信息</text>
					</view>
									
					<!-- 录入院系 -->
					<view class="school-function-card" @click.stop="showAddDepartmentModal">
						<view class="function-icon">🏢</view>
						<text class="function-title">录入院系</text>
						<text class="function-desc">添加新的院系信息</text>
					</view>
									
					<!-- 查询学校ID -->
					<view class="school-function-card" @click.stop="openQuerySchoolModal">
						<view class="function-icon">🔍</view>
						<text class="function-title">查询学校ID</text>
						<text class="function-desc">根据名称查询学校ID</text>
					</view>
													
					<!-- 查询院系ID -->
					<view class="school-function-card" @click.stop="openQueryDepartmentModal">
						<view class="function-icon">📋</view>
						<text class="function-title">查询院系ID</text>
						<text class="function-desc">根据学校查询院系ID</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 公告管理（布局对齐 announcement_center/code.html：英雄区 + Bento + 档案列表） -->
		<view v-if="currentTab === 'notice'" class="tab-content tab-content-notice-center">
			<view class="notice-center-page">
				<view class="notice-center-hero">
					<text class="notice-center-hero-display">Announcement Center</text>
					<text class="notice-center-hero-title">公告中心</text>
					<text class="notice-center-hero-desc">
						以编辑精度向学术社群推送要务与运营更新。
					</text>
				</view>

				<view class="notice-center-bento">
					<view class="notice-center-bento-main">
						<view class="notice-center-bento-toolbar">
							<view class="notice-center-bento-headline">
								<text class="material-symbols-outlined notice-center-bento-ic">edit_note</text>
								<view class="notice-center-bento-headline-text">
									<text class="notice-center-bento-title">撰写新公告</text>
									<text class="notice-center-bento-sub">标题与正文在弹窗中编辑，保存后写入消息中心。</text>
								</view>
							</view>
						</view>
						<button class="notice-center-bento-cta" type="default" @click="startCreateNotice">
							<text class="material-symbols-outlined">add_circle</text>
							<text>打开发布面板</text>
						</button>
					</view>
					<view class="notice-center-bento-side">
						<view class="notice-side-card notice-side-card--audience">
							<text class="notice-side-label">推送范围</text>
							<text class="notice-side-line">· 全员：需选择接收身份（学生 / 教师 / 两者）</text>
							<text class="notice-side-line">· 群组：选择群组并同上选择身份</text>
							<text class="notice-side-line">· 指定人员：学号、工号逗号分隔，可同时填写</text>
						</view>
						<view class="notice-side-card notice-side-card--insight">
							<view class="notice-side-insight-top">
								<text class="material-symbols-outlined notice-side-insight-ic">auto_awesome</text>
								<text class="notice-side-insight-kicker">策展提示</text>
							</view>
							<text class="notice-side-insight-body">工作日上午推送更易被师生阅读；长文请拆段并写好标题。</text>
						</view>
					</view>
				</view>

				<view class="notice-center-toolbar">
					<view class="notice-center-search">
						<text class="material-symbols-outlined notice-center-search-icon">search</text>
						<input
							class="notice-center-search-input"
							v-model="noticeSearchQuery"
							placeholder="搜索标题、正文或接收者…"
							confirm-type="search"
						/>
					</view>
					<view class="notice-center-toolbar-actions">
						<button class="notice-center-btn-ghost" type="default" @click="loadNoticesFromBackend">
							<text class="material-symbols-outlined notice-center-btn-icon">refresh</text>
							<text>同步列表</text>
						</button>
						<button class="notice-center-btn-secondary" type="default" @click="startCreateNotice">
							<text class="material-symbols-outlined notice-center-btn-icon">campaign</text>
							<text>新建公告</text>
						</button>
					</view>
				</view>

				<view class="notice-center-archive-head">
					<view class="notice-center-archive-titles">
						<text class="notice-center-archive-kicker">Published Archives</text>
						<text class="notice-center-archive-title">已发布公告</text>
					</view>
					<view class="notice-center-segment">
						<view
							class="notice-center-segment-item"
							:class="{ active: noticeAudienceFilter === 'all' }"
							@click="noticeAudienceFilter = 'all'"
						>
							<text>全部</text>
						</view>
						<view
							class="notice-center-segment-item"
							:class="{ active: noticeAudienceFilter === 'student' }"
							@click="noticeAudienceFilter = 'student'"
						>
							<text>学生</text>
						</view>
						<view
							class="notice-center-segment-item"
							:class="{ active: noticeAudienceFilter === 'teacher' }"
							@click="noticeAudienceFilter = 'teacher'"
						>
							<text>教师</text>
						</view>
					</view>
				</view>

				<view class="notice-center-list">
					<view
						v-for="row in noticeListRows"
						:key="row.item.id != null ? row.item.id : 'n-' + row.index"
						class="notice-center-row"
						:class="'notice-center-row--' + row.visual.mod"
					>
						<view class="notice-center-row-inner">
							<view class="notice-center-lead">
								<view class="notice-center-lead-avatar" :class="'notice-center-lead-avatar--' + row.visual.mod">
									<text
										class="material-symbols-outlined notice-center-lead-ms"
										:class="{ 'notice-center-lead-ms--fill': row.visual.mod !== 'draft' }"
									>{{ row.visual.icon }}</text>
								</view>
								<view class="notice-center-main">
									<view class="notice-center-title-line">
										<text class="notice-center-item-title">{{ row.item.title || '系统公告' }}</text>
										<text
											v-if="row.visual.mod === 'published'"
											class="notice-center-chip notice-center-chip--published"
										>已发布</text>
										<text
											v-if="noticeAudienceIsTeacherById(row.item)"
											class="notice-center-chip notice-center-chip--teacher"
										>教师</text>
										<text
											v-else
											class="notice-center-chip notice-center-chip--student"
										>学生</text>
										<text v-if="row.item.urgent" class="notice-center-chip notice-center-chip--urgent">紧急</text>
										<text
											v-if="isNoticeRetractedStatus(row.item.status)"
											class="notice-center-chip notice-center-chip--retracted"
										>已撤回</text>
									</view>
									<text class="notice-center-preview">{{ row.item.content }}</text>
									<view class="notice-center-meta">
										<view class="notice-center-meta-item">
											<text class="material-symbols-outlined notice-center-meta-ic">calendar_today</text>
											<text class="notice-center-meta-txt">{{ row.item.time || '—' }}</text>
										</view>
										<view class="notice-center-meta-item">
											<text class="material-symbols-outlined notice-center-meta-ic">group</text>
											<text class="notice-center-meta-txt">{{ noticeCenterAudienceLabel(row.item) }}</text>
										</view>
									</view>
								</view>
							</view>
							<view class="notice-center-actions">
								<view class="notice-center-icon-btn" @click="editNotice(row.index)">
									<text class="material-symbols-outlined">edit</text>
								</view>
								<view class="notice-center-icon-btn notice-center-icon-btn--danger" @click="deleteNotice(row.index)">
									<text class="material-symbols-outlined">delete</text>
								</view>
							</view>
						</view>
					</view>

					<view v-if="adminNotices.length === 0" class="notice-center-empty">
						<text class="material-symbols-outlined notice-center-empty-icon">campaign</text>
						<text class="notice-center-empty-title">暂无公告</text>
						<text class="notice-center-empty-desc">点击「发布公告」撰写第一条策展通知</text>
					</view>
					<view v-else-if="noticeListRows.length === 0" class="notice-center-empty notice-center-empty--filter">
						<text class="material-symbols-outlined notice-center-empty-icon">filter_alt_off</text>
						<text class="notice-center-empty-title">无匹配结果</text>
						<text class="notice-center-empty-desc">尝试调整搜索词或受众筛选</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 群组成员详情弹窗 -->
		<view v-if="showMemberModal" class="member-modal" @click="closeMemberModal">
			<view class="member-modal-content admin-dialog-sheet admin-dialog-sheet--wide" @click.stop>
				<view class="admin-dialog-header">
					<view class="admin-dialog-header-text">
						<text class="admin-dialog-kicker">成员</text>
						<text class="admin-dialog-title">{{ currentGroup?.name }} · 成员列表</text>
					</view>
					<view class="admin-dialog-close" @click="closeMemberModal">
						<text class="material-symbols-outlined">close</text>
					</view>
				</view>
				
				<view class="admin-dialog-body member-modal-scroll-body">
					<!-- 加载状态 -->
					<view v-if="loadingMembers" class="loading-container">
						<text>加载中...</text>
					</view>
					
					<view v-else>
						<!-- 教师列表 -->
						<view class="member-section">
							<view class="section-header-row">
								<text class="section-title">教师列表 ({{ groupMembers.teachers.length }})</text>
								<button class="invite-btn" @click="inviteMember('teacher')">+ 邀请教师</button>
							</view>
							<view class="member-list">
								<view v-for="teacher in groupMembers.teachers" :key="teacher.member_id" class="member-item">
									<view class="member-info">
										<text class="member-name">{{ teacher.name }}</text>
										<text class="member-id">工号: {{ teacher.teacher_id || teacher.account_id || teacher.member_id || '—' }}</text>
									</view>
									<button class="delete-member-btn" @click="deleteMember(teacher, 'teacher')">删除</button>
								</view>
								<view v-if="groupMembers.teachers.length === 0" class="empty-tip">
									<text>暂无教师</text>
								</view>
							</view>
						</view>
						
						<!-- 学生列表 -->
						<view class="member-section">
							<view class="section-header-row">
								<text class="section-title">学生列表 ({{ groupMembers.students.length }})</text>
								<button class="invite-btn" @click="inviteMember('student')">+ 邀请学生</button>
							</view>
							<view class="member-list">
								<view v-for="student in groupMembers.students" :key="student.member_id" class="member-item">
									<view class="member-info">
										<text class="member-name">{{ student.name }}</text>
										<text class="member-id">学号: {{ student.student_id || student.account_id || student.member_id || '—' }}</text>
									</view>
									<button class="delete-member-btn" @click="deleteMember(student, 'student')">删除</button>
								</view>
								<view v-if="groupMembers.students.length === 0" class="empty-tip">
									<text>暂无学生</text>
								</view>
							</view>
						</view>
					</view>
				</view>
				
				<view class="admin-dialog-footer admin-dialog-footer--single">
					<button class="admin-dialog-btn admin-dialog-btn--ghost admin-dialog-btn--block" type="default" @click="closeMemberModal">关闭</button>
				</view>
			</view>
		</view>
		
		<!-- 删除成员确认弹窗 -->
		<view v-if="showDeleteMemberModal" class="delete-member-modal" @click="closeDeleteMemberModal">
			<view class="delete-member-modal-content admin-dialog-sheet admin-dialog-sheet--compact" @click.stop>
				<view class="admin-dialog-header admin-dialog-header--center">
					<text class="admin-dialog-title admin-dialog-title--solo">确认删除成员</text>
				</view>
				<view class="admin-dialog-body admin-dialog-body--center">
					<text class="admin-delete-confirm-text">确定要删除{{ deletingMember?.type === 'teacher' ? '教师' : '学生' }}「{{ deletingMember?.name }}」吗？此操作不可撤销。</text>
				</view>
				<view class="admin-dialog-footer admin-dialog-footer--split">
					<button class="admin-dialog-btn admin-dialog-btn--ghost" type="default" @click="closeDeleteMemberModal">取消</button>
					<button class="admin-dialog-btn admin-dialog-btn--danger" type="default" @click="confirmDeleteMember">删除</button>
				</view>
			</view>
		</view>
		
		<!-- 删除群组确认（与成员删除、Bento 风格一致） -->
		<view v-if="showDeleteGroupModal" class="delete-group-modal" @click="closeDeleteGroupModal">
			<view class="delete-group-modal-content admin-dialog-sheet admin-dialog-sheet--compact" @click.stop>
				<view class="admin-dialog-header">
					<view class="admin-dialog-header-text">
						<text class="admin-dialog-kicker">危险操作</text>
						<text class="admin-dialog-title">确认删除群组</text>
					</view>
					<view class="admin-dialog-close" @click="closeDeleteGroupModal">
						<text class="material-symbols-outlined">close</text>
					</view>
				</view>
				<view class="admin-dialog-body admin-dialog-body--center">
					<view class="admin-dialog-warn-badge">
						<text class="material-symbols-outlined admin-dialog-warn-badge-ic">delete_forever</text>
					</view>
					<text class="admin-delete-confirm-text">
						确定要删除群组「{{ pendingDeleteGroup && pendingDeleteGroup.name }}」吗？删除后将无法恢复。
					</text>
				</view>
				<view class="admin-dialog-footer">
					<button class="admin-dialog-btn admin-dialog-btn--ghost" type="default" @click="closeDeleteGroupModal">取消</button>
					<button class="admin-dialog-btn admin-dialog-btn--danger-solid" type="default" @click="confirmDeleteGroup">确认删除</button>
				</view>
			</view>
		</view>
		
		<!-- 邀请成员弹窗 -->
		<view v-if="showInviteModal" class="invite-modal" @click="closeInviteModal">
			<view class="invite-modal-content admin-dialog-sheet" @click.stop>
				<view class="admin-dialog-header">
					<view class="admin-dialog-header-text">
						<text class="admin-dialog-kicker">邀请</text>
						<text class="admin-dialog-title">邀请{{ inviteType === 'teacher' ? '教师' : '学生' }}</text>
					</view>
					<view class="admin-dialog-close" @click="closeInviteModal">
						<text class="material-symbols-outlined">close</text>
					</view>
				</view>
				<view class="admin-dialog-body">
					<view class="form-item admin-dialog-form-item">
						<text class="form-label">{{ inviteType === 'teacher' ? '教师' : '学生' }} ID</text>
						<input
							class="form-input admin-dialog-input"
							v-model="inviteForm.memberId"
							:type="inviteType === 'teacher' ? 'text' : 'number'"
							:placeholder="inviteType === 'teacher' ? '请输入教师工号' : '请输入学生学号'"
						/>
					</view>
					<view class="form-item admin-dialog-form-item" v-if="inviteType === 'teacher'">
						<text class="form-label">角色</text>
						<picker mode="selector" :range="['member', 'admin']" @change="onInviteRoleChange">
							<view class="picker-view admin-dialog-picker">
								<text>{{ inviteForm.role === 'admin' ? '管理员' : '普通成员' }}</text>
								<text class="material-symbols-outlined admin-dialog-picker-arrow">expand_more</text>
							</view>
						</picker>
					</view>
				</view>
				<view class="admin-dialog-footer">
					<button class="admin-dialog-btn admin-dialog-btn--ghost" type="default" @click="closeInviteModal">取消</button>
					<button class="admin-dialog-btn admin-dialog-btn--primary" type="default" @click="confirmInvite">确认邀请</button>
				</view>
			</view>
		</view>
		
		<!-- 截止日期管理弹窗 -->
		<view v-if="showDeadlineModal" class="deadline-modal" @click="closeDeadlineModal">
			<view class="deadline-modal-content admin-dialog-sheet admin-dialog-sheet--wide" @click.stop>
				<view class="admin-dialog-header">
					<view class="admin-dialog-header-text">
						<text class="admin-dialog-kicker">控制台</text>
						<text class="admin-dialog-title">截止日期管理</text>
					</view>
					<view class="admin-dialog-close" @click="closeDeadlineModal">
						<text class="material-symbols-outlined">close</text>
					</view>
				</view>
				<view class="admin-dialog-body deadline-modal-body">
					<view class="deadline-query-block">
						<text class="deadline-field-label">教师工号 / 用户名</text>
						<view class="deadline-query-row">
							<text class="material-symbols-outlined deadline-query-ic">person_search</text>
							<input
								class="deadline-query-input"
								type="text"
								v-model="teacherIdInput"
								placeholder="例如 t123"
							/>
							<button class="deadline-query-btn" type="default" @click="queryDeadlineByTeacherId">
								<text class="deadline-query-btn-label">查询</text>
							</button>
						</view>
						<text v-if="selectedTeacher" class="deadline-parsed-hint">
							已解析：{{ selectedTeacher.username || selectedTeacher.name }}（sub: {{ selectedTeacher.id }}）
						</text>
					</view>
					<view class="deadline-list-block">
						<text class="deadline-field-label">截止日期列表</text>
						<view class="deadline-list-scroll">
							<view v-if="deadlineList.length === 0" class="deadline-empty">
								<text class="material-symbols-outlined deadline-empty-ic">event_busy</text>
								<text class="deadline-empty-txt">暂无截止日期数据</text>
								<text class="deadline-empty-sub">输入教师工号并查询后将显示该教师的 DDL</text>
							</view>
							<view v-else class="deadline-list">
								<view v-for="(item, index) in deadlineList" :key="item.ddlid || index" class="deadline-item">
									<view class="deadline-item-main">
										<view class="deadline-info-row">
											<text class="deadline-class">DDL ID: {{ item.ddlid }}</text>
											<text class="deadline-time">{{ formatDeadlineTime(item.ddl_time) }}</text>
										</view>
										<view class="deadline-meta" v-if="selectedTeacher">
											<text class="deadline-meta-chip">教师 {{ selectedTeacher.queryInput }}</text>
										</view>
									</view>
									<button class="deadline-item-delete" type="default" @click="showDeleteConfirm(item)">删除</button>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 删除截止日期确认 -->
		<view v-if="showDeleteDeadlineModal" class="confirm-modal" @click="closeDeleteConfirm">
			<view class="confirm-modal-content admin-dialog-sheet admin-dialog-sheet--compact" @click.stop>
				<view class="admin-dialog-header">
					<view class="admin-dialog-header-text">
						<text class="admin-dialog-kicker">截止日期</text>
						<text class="admin-dialog-title">确认删除</text>
					</view>
					<view class="admin-dialog-close" @click="closeDeleteConfirm">
						<text class="material-symbols-outlined">close</text>
					</view>
				</view>
				<view class="admin-dialog-body admin-dialog-body--center">
					<text class="admin-delete-confirm-text">
						确定要删除 DDL ID: {{ deletingItem && deletingItem.ddlid }} 的截止日期吗？
					</text>
					<text class="deadline-delete-time">时间：{{ formatDeadlineTime(deletingItem && deletingItem.ddl_time) }}</text>
				</view>
				<view class="admin-dialog-footer">
					<button class="admin-dialog-btn admin-dialog-btn--ghost" type="default" @click="closeDeleteConfirm">取消</button>
					<button class="admin-dialog-btn admin-dialog-btn--danger-solid" type="default" @click="confirmDeleteDeadline">确定删除</button>
				</view>
			</view>
		</view>
		
		<!-- 创建/编辑群组弹窗 -->
		<view v-if="showGroupModal" class="group-modal" @click="closeGroupModal">
			<view class="group-modal-content admin-dialog-sheet" @click.stop>
				<view class="admin-dialog-header">
					<view class="admin-dialog-header-text">
						<text class="admin-dialog-kicker">群组</text>
						<text class="admin-dialog-title">{{ editingGroup ? '编辑群组' : '创建群组' }}</text>
					</view>
					<view class="admin-dialog-close" @click="closeGroupModal">
						<text class="material-symbols-outlined">close</text>
					</view>
				</view>
				<view class="admin-dialog-body">
					<view class="form-item admin-dialog-form-item">
						<text class="form-label">群组名称</text>
						<input
							class="form-input admin-dialog-input"
							v-model="groupForm.name"
							placeholder="请输入群组名称"
						/>
					</view>
					<view class="form-item admin-dialog-form-item">
						<text class="form-label">群组编号</text>
						<input
							class="form-input admin-dialog-input"
							v-model="groupForm.code"
							placeholder="请输入群组编号"
						/>
					</view>
				</view>
				<view class="admin-dialog-footer">
					<button class="admin-dialog-btn admin-dialog-btn--ghost" type="default" @click="closeGroupModal">取消</button>
					<button class="admin-dialog-btn admin-dialog-btn--primary" type="default" @click="saveGroup">保存</button>
				</view>
			</view>
		</view>
			</view>
		</view>
	</view>
	
	<!-- 录入学校弹窗 -->
	<view v-if="showSchoolMaintenanceTab && showSchoolModal" class="modal-mask" @click="closeSchoolModal">
		<view class="modal-content" @click.stop>
			<view class="modal-header">
				<text class="modal-title">录入学校</text>
				<text class="close-btn" @click="closeSchoolModal">×</text>
			</view>
			<view class="modal-body">
				<view class="form-item">
					<text class="form-label">学校名称</text>
					<input class="form-input" v-model="schoolForm.name" placeholder="请输入学校名称" />
				</view>
				<view class="form-item">
					<text class="form-label">学校所在省份</text>
					<input class="form-input" v-model="schoolForm.province" placeholder="请输入学校所在省份" />
				</view>
				<view class="form-item">
					<text class="form-label">学校所在城市</text>
					<input class="form-input" v-model="schoolForm.city" placeholder="请输入学校所在城市" />
				</view>
			</view>
			<view class="modal-footer">
				<button class="cancel-btn" @click="closeSchoolModal">取消</button>
				<button class="save-btn" @click="submitAddSchool">提交</button>
			</view>
		</view>
	</view>
	
	<!-- 录入院系弹窗 -->
	<view v-if="showSchoolMaintenanceTab && showDepartmentModal" class="modal-mask" @click="closeDepartmentModal">
		<view class="modal-content" @click.stop>
			<view class="modal-header">
				<text class="modal-title">录入院系</text>
				<text class="close-btn" @click="closeDepartmentModal">×</text>
			</view>
			<view class="modal-body">
				<view class="form-item">
					<text class="form-label">院系名称</text>
					<input class="form-input" v-model="departmentForm.name" placeholder="请输入院系名称" />
				</view>
				<view class="form-item">
					<text class="form-label">所属学校ID</text>
					<input class="form-input" v-model="departmentForm.schoolId" placeholder="请输入学校ID" type="number" />
				</view>
			</view>
			<view class="modal-footer">
				<button class="cancel-btn" @click="closeDepartmentModal">取消</button>
				<button class="save-btn" @click="submitAddDepartment">提交</button>
			</view>
		</view>
	</view>
	
	<!-- 编辑权限弹窗 -->
	<view v-if="showPermissionModal" class="modal-mask" @click="closePermissionModal">
		<view class="modal-content" @click.stop>
			<view class="modal-header">
				<text class="modal-title">编辑用户权限</text>
				<text class="close-btn" @click="closePermissionModal">×</text>
			</view>
			<view class="modal-body">
				<!-- 用户信息展示 -->
				<view class="permission-user-info">
					<text class="permission-user-name">{{ permissionUser.name }}</text>
					<text class="permission-user-role" :class="'role-' + permissionUser.role">
						{{ permissionUser.role === 'teacher' ? '教师' : permissionUser.role === 'admin' ? '管理员' : '学生' }}
					</text>
				</view>
				
				<!-- 角色转换 -->
				<view class="permission-section">
					<text class="permission-section-title">角色转换</text>
					<view class="form-item">
						<text class="form-label">转换为</text>
						<view class="custom-select-wrap">
							<view class="picker-display" @click="toggleRoleDropdown">
								<text>{{ selectedRoleIndex >= 0 ? availableRoles[selectedRoleIndex]?.label : '请选择目标角色' }}</text>
								<text class="picker-arrow" :class="{ 'arrow-up': showRoleDropdown }">▼</text>
							</view>
							<view v-if="showRoleDropdown" class="custom-select-dropdown">
								<view 
									v-for="(role, idx) in availableRoles" 
									:key="idx"
									class="dropdown-item"
									:class="{ 'dropdown-item-active': selectedRoleIndex === idx }"
									@click="selectRole(idx)"
								>{{ role.label }}</view>
							</view>
						</view>
					</view>
					<view class="form-item" v-if="selectedRoleIndex !== -1">
						<text class="form-label">新工号/学号</text>
						<input class="form-input" v-model="newBusinessId" placeholder="请输入转换后的新工号或学号" />
					</view>
					<button class="confirm-btn-blue" @click="submitChangeRole">确认转换</button>
				</view>
				
				<view class="permission-divider"></view>
				
				<!-- 删除用户 -->
				<view class="permission-section danger-section">
					<text class="permission-section-title danger-title">删除用户</text>
					<text class="danger-tip">此操作不可恢复，将永久删除该用户</text>
					<button class="danger-btn" @click="confirmDeleteUser">删除用户</button>
				</view>
			</view>
			
			<!-- 内嵌删除确认弹窗 -->
			<view v-if="showDeleteUserConfirm" class="inner-confirm-mask" @click.stop>
				<view class="inner-confirm-box">
					<text class="inner-confirm-title">确认删除</text>
					<text class="inner-confirm-content">确定要永久删除用户「{{ permissionUser.name }}」？此操作不可恢复。</text>
					<view class="inner-confirm-btns">
						<button class="inner-cancel-btn" @click="showDeleteUserConfirm = false">取消</button>
						<button class="inner-danger-btn" @click="doDeleteUser">删除</button>
					</view>
				</view>
			</view>
			
			<!-- 内嵌角色转换确认弹窗 -->
			<view v-if="showChangeRoleConfirm" class="inner-confirm-mask" @click.stop>
				<view class="inner-confirm-box">
					<text class="inner-confirm-title">确认转换</text>
					<text class="inner-confirm-content">确认将「{{ permissionUser.name }}」的角色由 {{ permissionUser.role }} 转换为 {{ pendingNewRole }}？</text>
					<view class="inner-confirm-btns">
						<button class="inner-cancel-btn" @click="showChangeRoleConfirm = false">取消</button>
						<button class="inner-confirm-btn" @click="doChangeRole">确认</button>
					</view>
				</view>
			</view>
		</view>
	</view>
	
	<!-- 查询学校ID弹窗 -->
	<view v-if="showSchoolMaintenanceTab && showQuerySchoolModal" class="modal-mask" @click="closeQuerySchoolModal">
		<view class="modal-content" @click.stop>
			<view class="modal-header">
				<text class="modal-title">查询学校ID</text>
				<text class="close-btn" @click="closeQuerySchoolModal">×</text>
			</view>
			<view class="modal-body">
				<view class="form-item">
					<text class="form-label">学校名称</text>
					<input class="form-input" v-model="querySchoolName" placeholder="请输入学校名称查询" />
				</view>
				<button class="query-btn" @click="executeQuerySchool">查询</button>
				
				<view v-if="querySchoolResult" class="query-result">
					<view v-if="querySchoolResult.notFound" class="result-empty">
						<text>未找到该学校</text>
					</view>
					<view v-else class="result-item">
						<text class="result-label">学校ID：</text>
						<text class="result-value">{{ querySchoolResult.id }}</text>
					</view>
				</view>
			</view>
			<view class="modal-footer">
				<button class="cancel-btn" @click="closeQuerySchoolModal">关闭</button>
			</view>
		</view>
	</view>
	
	<!-- 查询院系ID弹窗 -->
	<view v-if="showSchoolMaintenanceTab && showQueryDepartmentModal" class="modal-mask" @click="closeQueryDepartmentModal">
		<view class="modal-content" @click.stop>
			<view class="modal-header">
				<text class="modal-title">查询院系ID</text>
				<text class="close-btn" @click="closeQueryDepartmentModal">×</text>
			</view>
			<view class="modal-body">
				<view class="form-item">
					<text class="form-label">学校ID</text>
					<input class="form-input" v-model="queryDepartmentSchoolId" placeholder="请输入学校ID查询院系" type="number" />
				</view>
				<button class="query-btn" @click="executeQueryDepartment">查询</button>
				
				<view v-if="queryDepartmentResult.length > 0" class="query-result">
					<view class="result-list">
						<view v-for="(dept, index) in queryDepartmentResult" :key="index" class="result-item">
							<text class="result-label">{{ dept.department_name || dept.name }}：</text>
							<text class="result-value">{{ dept.department_id || dept.id }}</text>
						</view>
					</view>
				</view>
				<view v-else-if="queryDepartmentResult.length === 0 && queryDepartmentSchoolId" class="query-result">
					<view class="result-empty">
						<text>该学校暂无院系信息</text>
					</view>
				</view>
			</view>
			<view class="modal-footer">
				<button class="cancel-btn" @click="closeQueryDepartmentModal">关闭</button>
			</view>
		</view>
	</view>
	
	<!-- 退出登录确认 -->
	<view v-if="showLogoutConfirmModal" class="admin-custom-modal-mask" @click="showLogoutConfirmModal = false">
		<view class="admin-custom-modal-content" @click.stop>
			<view class="admin-custom-modal-header">确认退出</view>
			<view class="admin-custom-modal-body">确定要退出登录吗？</view>
			<view class="admin-custom-modal-footer">
				<view class="admin-modal-btn cancel" @click="showLogoutConfirmModal = false">取消</view>
				<view class="admin-modal-btn confirm danger" @click="logout">退出</view>
			</view>
		</view>
	</view>
	
	<!-- 修改密码 -->
	<view v-if="showPasswordModal" class="admin-custom-modal-mask" @click="closePasswordModal">
		<view class="admin-custom-modal-content admin-password-modal" @click.stop>
			<view class="admin-custom-modal-header">
				<text class="material-symbols-outlined">lock</text>
				<text>修改密码</text>
			</view>
			<view class="admin-password-modal-body">
				<view class="admin-pwd-form-item">
					<text class="admin-pwd-form-label">当前密码</text>
					<input class="admin-pwd-form-input" v-model="passwordForm.oldPassword" placeholder="请输入当前密码" type="password" password />
				</view>
				<view class="admin-pwd-form-item">
					<text class="admin-pwd-form-label">新密码</text>
					<input class="admin-pwd-form-input" v-model="passwordForm.newPassword" placeholder="请输入新密码（至少6位）" type="password" password />
				</view>
				<view class="admin-pwd-form-item">
					<text class="admin-pwd-form-label">确认新密码</text>
					<input
						class="admin-pwd-form-input"
						:class="{ 'pwd-input-error': passwordError }"
						v-model="passwordForm.confirmPassword"
						placeholder="请再次输入新密码"
						type="password"
						password
						@input="passwordError = ''"
					/>
					<text v-if="passwordError" class="admin-pwd-error-tip">{{ passwordError }}</text>
				</view>
			</view>
			<view class="admin-custom-modal-footer">
				<view class="admin-modal-btn cancel" @click="closePasswordModal">取消</view>
				<view class="admin-modal-btn confirm" @click="submitChangePassword">确认修改</view>
			</view>
		</view>
	</view>
	
	<!-- 公告编辑/发布弹窗（列表不滚动，就地弹出） -->
	<view
		v-if="showNoticeForm && currentTab === 'notice'"
		class="modal-mask notice-edit-modal-mask"
		@click="cancelNoticeEdit"
	>
		<view class="modal-content notice-edit-modal-content" @click.stop>
			<view class="modal-header notice-edit-modal-header">
				<view class="notice-edit-modal-head-text">
					<text class="notice-edit-modal-kicker">{{ editingNoticeId != null ? '编辑' : '新建' }}</text>
					<text class="modal-title notice-edit-modal-title">{{ editingNoticeId != null ? '编辑公告' : '发布公告' }}</text>
				</view>
				<view class="notice-edit-modal-close" @click="cancelNoticeEdit">
					<text class="material-symbols-outlined">close</text>
				</view>
			</view>
			<view class="modal-body notice-edit-modal-body">
				<view class="notice-form notice-form--modal notice-form--curator">
					<view class="notice-curator-tip">
						<text class="material-symbols-outlined notice-curator-tip-icon">tips_and_updates</text>
						<text class="notice-curator-tip-text">标题简短有力，正文分段易读；将推送至对应师生的消息中心。</text>
					</view>

					<template v-if="editingNoticeId === null">
						<view class="notice-modal-layout">
							<view class="notice-modal-panel notice-modal-panel--audience">
								<view class="notice-modal-panel-title">
									<text class="material-symbols-outlined notice-modal-panel-ic">campaign</text>
									<text class="notice-modal-panel-title-txt">推送范围</text>
								</view>
								<view class="form-item notice-modal-field">
									<text class="notice-field-label">发送给</text>
									<radio-group class="notice-segment-group" @change="onNoticeSendToChange">
										<label class="notice-segment-item">
											<radio value="all" :checked="noticeForm.send_to === 'all'" />
											<text>全员</text>
										</label>
										<label class="notice-segment-item">
											<radio value="group" :checked="noticeForm.send_to === 'group'" />
											<text>群组</text>
										</label>
										<label class="notice-segment-item">
											<radio value="individual" :checked="noticeForm.send_to === 'individual'" />
											<text>指定人员</text>
										</label>
									</radio-group>
								</view>
								<view
									v-if="noticeForm.send_to === 'all' || noticeForm.send_to === 'group'"
									class="form-item notice-modal-field"
								>
									<text class="notice-field-label">接收身份</text>
									<radio-group class="notice-segment-group notice-segment-group--triple" @change="onNoticeRecipientTypesChange">
										<label class="notice-segment-item notice-segment-item--sm">
											<radio value="students" :checked="noticeForm.recipient_types === 'students'" />
											<text>学生</text>
										</label>
										<label class="notice-segment-item notice-segment-item--sm">
											<radio value="teachers" :checked="noticeForm.recipient_types === 'teachers'" />
											<text>教师</text>
										</label>
										<label class="notice-segment-item notice-segment-item--sm">
											<radio value="both" :checked="noticeForm.recipient_types === 'both'" />
											<text>全部</text>
										</label>
									</radio-group>
								</view>
								<view
									v-if="noticeForm.send_to === 'group'"
									class="form-item notice-modal-field notice-modal-field--group-search"
									@click.stop
								>
									<text class="notice-field-label">群组</text>
									<view class="notice-group-search-block">
										<view class="notice-group-search-row">
											<input
												class="form-input notice-curator-input notice-group-search-input"
												type="text"
												v-model="noticeGroupSearchQuery"
												placeholder="输入群组名称、编号或 ID"
												confirm-type="search"
												@confirm="runNoticeGroupSearch"
												@input="onNoticeGroupQueryInput"
											/>
											<button
												type="default"
												class="notice-group-search-btn"
												@click="runNoticeGroupSearch"
											>
												<text class="material-symbols-outlined notice-group-search-btn-ic">search</text>
												<text>搜索</text>
											</button>
										</view>
										<view
											class="notice-group-result-panel"
											:class="'notice-group-result-panel--' + noticeGroupSearchStatus"
										>
											<template v-if="noticeGroupSearchStatus === 'idle'">
												<text class="notice-group-result-placeholder">
													输入关键词后点「搜索」，在此查看结果；唯一匹配时点卡片确认，多条时请点选其一。
												</text>
											</template>
											<template v-else-if="noticeGroupSearchStatus === 'confirmed'">
												<view class="notice-group-result-confirmed">
													<text class="material-symbols-outlined notice-group-result-confirmed-ic">check_circle</text>
													<view class="notice-group-result-confirmed-text">
														<text class="notice-group-confirmed-line">{{ noticeGroupConfirmedLine }}</text>
														<text class="notice-group-reset-link" @click="resetNoticeGroupSearchForNotice">重新搜索</text>
													</view>
												</view>
											</template>
											<template v-else-if="noticeGroupSearchStatus === 'none'">
												<text class="notice-group-result-none">无匹配群组，请检查名称或编号</text>
											</template>
											<template v-else-if="noticeGroupSearchStatus === 'single'">
												<text class="notice-group-result-hint">找到 1 个群组，点击确认</text>
												<view
													class="notice-group-result-card"
													@click="confirmNoticeGroupPick(noticeGroupSearchResults[0])"
												>
													<text class="notice-group-result-card-name">{{
														noticeGroupSearchResults[0].name
													}}</text>
													<text class="notice-group-result-card-meta">
														编号 {{ noticeGroupSearchResults[0].code }} · ID {{ noticeGroupSearchResults[0].id }}
													</text>
												</view>
											</template>
											<template v-else-if="noticeGroupSearchStatus === 'multiple'">
												<text class="notice-group-result-hint">
													共 {{ noticeGroupSearchResults.length }} 条匹配（名称可能重复），请点选一条
												</text>
												<view class="notice-group-result-scroll">
													<view
														v-for="g in noticeGroupSearchResults"
														:key="g.id"
														class="notice-group-result-card notice-group-result-card--compact"
														@click="confirmNoticeGroupPick(g)"
													>
														<text class="notice-group-result-card-name">{{ g.name }}</text>
														<text class="notice-group-result-card-meta">编号 {{ g.code }} · ID {{ g.id }}</text>
													</view>
												</view>
											</template>
										</view>
									</view>
									<text class="notice-field-hint">
										列表数据与「群组管理」同步；若为空请先到该页点击「查询群组」。
									</text>
								</view>
								<view v-if="noticeForm.send_to === 'individual'" class="form-item notice-modal-field">
									<text class="notice-field-label">学号</text>
									<input
										class="form-input notice-curator-input notice-input-compact"
										v-model="noticeForm.student_ids_raw"
										placeholder="逗号分隔，如 2021001,2021002"
									/>
								</view>
								<view v-if="noticeForm.send_to === 'individual'" class="form-item notice-modal-field">
									<text class="notice-field-label">工号</text>
									<input
										class="form-input notice-curator-input notice-input-compact"
										v-model="noticeForm.teacher_ids_raw"
										placeholder="逗号分隔，可与学号同时填写"
									/>
									<text class="notice-field-hint">至少填写学号或工号之一。</text>
								</view>
							</view>

							<view class="notice-modal-panel notice-modal-panel--compose">
								<view class="notice-modal-panel-title">
									<text class="material-symbols-outlined notice-modal-panel-ic">edit_note</text>
									<text class="notice-modal-panel-title-txt">公告内容</text>
								</view>
								<view class="form-item notice-modal-field">
									<view class="notice-field-head">
										<text class="notice-field-label">标题</text>
										<text
											class="notice-char-count"
											:class="{ 'notice-char-count--warn': noticeTitleLen >= noticeTitleMaxLen }"
										>{{ noticeTitleLen }}/{{ noticeTitleMaxLen }}</text>
									</view>
									<input
										class="form-input notice-curator-input notice-input-compact"
										v-model="noticeForm.title"
										:maxlength="noticeTitleMaxLen"
										placeholder="例如：本学期论文提交流程更新"
									/>
								</view>
								<view class="form-item notice-modal-field notice-modal-field--grow">
									<view class="notice-field-head">
										<text class="notice-field-label">正文</text>
										<text
											class="notice-char-count"
											:class="{ 'notice-char-count--warn': noticeContentLen >= noticeContentMaxLen * 0.9 }"
										>{{ noticeContentLen }}/{{ noticeContentMaxLen }}</text>
									</view>
									<view class="notice-curator-editor-shell notice-editor-modal">
										<textarea
											class="form-textarea notice-curator-textarea"
											v-model="noticeForm.content"
											:maxlength="noticeContentMaxLen"
											placeholder="在此撰写公告正文…"
										/>
									</view>
								</view>
							</view>
						</view>
					</template>

					<template v-else>
						<view class="notice-modal-panel notice-modal-panel--compose notice-modal-panel--solo">
							<view class="notice-modal-panel-title">
								<text class="material-symbols-outlined notice-modal-panel-ic">edit_square</text>
								<text class="notice-modal-panel-title-txt">编辑内容</text>
							</view>
							<view class="form-item notice-modal-field">
								<view class="notice-field-head">
									<text class="notice-field-label">标题</text>
									<text
										class="notice-char-count"
										:class="{ 'notice-char-count--warn': noticeTitleLen >= noticeTitleMaxLen }"
									>{{ noticeTitleLen }}/{{ noticeTitleMaxLen }}</text>
								</view>
								<input
									class="form-input notice-curator-input notice-input-compact"
									v-model="noticeForm.title"
									:maxlength="noticeTitleMaxLen"
									placeholder="公告标题"
								/>
							</view>
							<view class="form-item notice-modal-field notice-modal-field--grow">
								<view class="notice-field-head">
									<text class="notice-field-label">正文</text>
									<text
										class="notice-char-count"
										:class="{ 'notice-char-count--warn': noticeContentLen >= noticeContentMaxLen * 0.9 }"
									>{{ noticeContentLen }}/{{ noticeContentMaxLen }}</text>
								</view>
								<view class="notice-curator-editor-shell notice-editor-modal">
									<textarea
										class="form-textarea notice-curator-textarea"
										v-model="noticeForm.content"
										:maxlength="noticeContentMaxLen"
										placeholder="在此编辑正文…"
									/>
								</view>
							</view>
						</view>
					</template>
				</view>
			</view>
			<view class="modal-footer notice-edit-modal-footer">
				<button class="cancel-btn notice-modal-btn-cancel" type="default" @click="cancelNoticeEdit">取消</button>
				<button class="save-btn notice-modal-btn-submit" type="default" @click="saveNotice">{{ editingNoticeId != null ? '保存修改' : '发布公告' }}</button>
			</view>
		</view>
	</view>
</template>

<script>
	import config from '@/api/config.js';
	import { logout } from '@/api/user.js';
	
	export default {
		data() {
			return {
				adminName: '',
				adminAvatar: '',
				showUserCard: false,
				userCardInfo: {
					name: '',
					username: '',
					role: '管理员'
				},
				showPasswordModal: false,
				passwordForm: {
					oldPassword: '',
					newPassword: '',
					confirmPassword: ''
				},
				passwordError: '',
				showLogoutConfirmModal: false,
				
				currentTab: 'group',
				/** 院校信息维护 Tab + 页面 + 相关弹窗；暂不用时 false，需要时改为 true */
				showSchoolMaintenanceTab: false,
				groupSearchKeyword: '',
				groups: [],
				showGroupModal: false,
				editingGroup: null,
				groupForm: {
					name: '',
					code: '',
					active: true
				},
				// 截止日期管理
				showDeadlineModal: false,
				teacherList: [],
				selectedTeacher: null,
				deadlineList: [],
				teacherIdInput: '',
				// 删除确认弹窗
				showDeleteDeadlineModal: false,
				deletingItem: null,
				// 成员详情弹窗
				showMemberModal: false,
				currentGroup: null,
				groupMembers: {
					teachers: [],
					students: []
				},
				loadingMembers: false,
				// 邀请成员弹窗
				showInviteModal: false,
				inviteType: '', // 'teacher' 或 'student'
				inviteForm: {
					memberId: '',
					role: 'member'
				},
				// 删除成员确认弹窗
				showDeleteMemberModal: false,
				deletingMember: null,
				// 删除群组确认（自定义弹窗，替代 uni.showModal）
				showDeleteGroupModal: false,
				pendingDeleteGroup: null,
				selectedImportFile: null,
				importOptions: {
					skipExisting: true,
					sendNotification: true
				},
				importProgress: {
					show: false,
					text: '',
					percent: 0,
					details: null
				},
				importResult: {
					show: false,
					total: 0,
					success: 0,
					failed: 0,
					skipped: 0,
					errors: [],
					isFailure: false
				},
				// 批量导入用户
				selectedUserImportFile: null,
				userImportProgress: {
					show: false,
					text: '',
					percent: 0
				},
				userImportResult: {
					show: false,
					total: 0,
					created: 0,
					updated: 0,
					failed: 0,
					message: '',
					errors: []
				},
				searchKeyword: '',
				userDirectoryLoading: false,
				accessRoleFilter: 'all',
				users: [],
				selectedGroup: null,
				selectedGroupName: '',
				/** 批量下载：输入名称；解析后的教师 id（论文接口用） */
				batchDownloadGroupName: '',
				batchDownloadTeacherId: '',
				selectedStatus: null,
				selectedStatusLabel: '',
				selectedFormat: '',
				downloadCount: 0,
				downloadSize: 0,
				downloadOptions: {
					zip: true,
					includeHistory: false
				},
				groupOptions: [],
				statusOptions: [
					{label: '全部状态', value: 'all'},
					{label: '待审阅', value: 'pending'},
					{label: '已反馈', value: 'feedback'},
					{label: '已定稿', value: 'finalized'}
				],
				formatOptions: ['docx', 'pdf'],
				selectedActionType: null,
				selectedActionTypeLabel: '',
				selectedRole: null,
				selectedRoleLabel: '',
				startDate: '',
				endDate: '',
				actionTypeOptions: [
					{label: '全部类型', value: 'all'},
					{label: '登录', value: 'login'},
					{label: '上传', value: 'upload'},
					{label: '下载', value: 'download'},
					{label: '批注', value: 'annotation'},
					{label: '定稿', value: 'finalize'}
				],
				roleOptions: [
					{label: '全部角色', value: 'all'},
					{label: '学生', value: 'student'},
					{label: '教师', value: 'teacher'},
					{label: '管理员', value: 'admin'}
				],
				auditLogs: [
					{
						userName: '张三',
						userRole: 'student',
						actionType: 'upload',
						actionDetail: '上传论文：基于深度学习的图像识别研究',
						actionTime: '2024-01-15 10:30:25',
						ipAddress: '192.168.1.100',
						device: 'Windows Chrome'
					},
					{
						userName: '张教授',
						userRole: 'teacher',
						actionType: 'annotation',
						actionDetail: '为学生张三的论文添加批注',
						actionTime: '2024-01-15 11:20:15',
						ipAddress: '192.168.1.101',
						device: 'Windows Chrome'
					}
				],
				currentPage: 1,
				totalPages: 10,
				// 控制台统计数据
				dashboardStats: {
					studentTotal: 0,
					teacherTotal: 0,
					paperTotal: 0,
					paperUploaded: 0,
					paperUnreviewed: 0,
					paperUpdated: 0,
					updateTime: ''
				},
				// 群组关系一览（扁平成员行）
				groupRelationsAllRows: [],
				/** 群组关系一览：按群组 pathId 筛选，'' 表示全部 */
				groupRelationsFilterGroupId: '',
				/** 群组关系一览：all | teacher | student */
				groupRelationsFilterRole: 'all',
				groupRelationsSearchQuery: '',
				groupRelationsPage: 1,
				groupRelationsPageSize: 15,
				loadingGroupRelations: false,
				groupRelationsGroupDropdownOpen: false,
				groupRelationsRoleDropdownOpen: false,
				// 公告管理
				adminNotices: [],
				noticeSearchQuery: '',
				noticeAudienceFilter: 'all',
				showNoticeForm: false,
				editingNoticeIndex: -1,
				editingNoticeId: null, // 正在编辑的通知ID
				noticeForm: {
					send_to: 'individual',
					group_id: '',
					recipient_types: 'both',
					student_ids_raw: '',
					teacher_ids_raw: '',
					target_user_id: '',
					title: '',
					content: '',
					target_type: 'student'
				},
				// 院校信息维护
				showSchoolModal: false,
				showDepartmentModal: false,
				showQuerySchoolModal: false,
				showQueryDepartmentModal: false,
				schoolForm: {
					name: '',
					province: '',
					city: ''
				},
				departmentForm: {
					name: '',
					schoolId: ''
				},
				querySchoolName: '',
				querySchoolResult: null,
				queryDepartmentSchoolId: '',
				queryDepartmentResult: [],
				// 创建角色
				createRoleType: 'student',
				studentForm: {
					username: '',
					password: '',
					phone: '',
					email: '',
					full_name: ''
				},
				teacherForm: {
					username: '',
					password: '',
					phone: '',
					email: '',
					full_name: ''
				},
				adminForm: {
					username: '',
					password: '',
					phone: '',
					email: '',
					full_name: ''
				},
				// 编辑权限弹窗
				showPermissionModal: false,
				permissionUser: {}, // 当前操作的用户
				selectedRoleIndex: -1, // 目标角色索引
				newBusinessId: '', // 新工号/学号
				showRoleDropdown: false, // 自定义角色下拉
				showDeleteUserConfirm: false, // 内嵌删除确认
				showChangeRoleConfirm: false, // 内嵌角色转换确认
				pendingNewRole: '', // 待确认的目标角色
				/** 公告字数上限（uni-app textarea 默认 maxlength 仅 140，必须显式设置） */
				noticeTitleMaxLen: 50,
				noticeContentMaxLen: 800,
				/** 公告弹窗 — 群组搜索（替代 H5 下无效的 picker） */
				noticeGroupSearchQuery: '',
				noticeGroupSearchStatus: 'idle',
				noticeGroupSearchResults: []
			}
		},
		computed: {
			noticeTitleLen() {
				return String(this.noticeForm.title || '').length;
			},
			noticeContentLen() {
				return String(this.noticeForm.content || '').length;
			},
			/** 用户目录：全量 users + 关键词筛选（工号/学号/用户名/姓名） */
			filteredUsers() {
				const list = this.users || [];
				const q = (this.searchKeyword || '').trim().toLowerCase();
				if (!q) return list;
				return list.filter((u) => {
					const id = String(u.id ?? '').toLowerCase();
					const name = String(u.name ?? '').toLowerCase();
					const uname = String(u.username ?? '').toLowerCase();
					const sub = String(u.sub ?? '').toLowerCase();
					const created = String(u.createdAtDisplay ?? '').toLowerCase();
					return (
						id.includes(q) ||
						name.includes(q) ||
						uname.includes(q) ||
						sub.includes(q) ||
						(created !== '—' && created.includes(q))
					);
				});
			},
			accessDirectoryUsers() {
				const base = this.filteredUsers;
				const f = this.accessRoleFilter;
				if (f === 'all') return base;
				return base.filter((u) => (u.role || '') === f);
			},
			// 可转换的角色列表（排除当前角色）
			availableRoles() {
				const all = [
					{ label: '学生', value: 'student' },
					{ label: '教师', value: 'teacher' },
					{ label: '管理员', value: 'admin' }
				];
				return all.filter(r => r.value !== (this.permissionUser.role || ''));
			},
			userCardLetter() {
				const n = this.userCardInfo.name;
				return n && n.length ? n[0] : '管';
			},
			/** 公告中心：筛选 + 行展示数据（对齐 announcement_center 列表态） */
			noticeListRows() {
				const q = (this.noticeSearchQuery || '').trim().toLowerCase();
				const f = this.noticeAudienceFilter;
				const entries = this.adminNotices
					.map((item, index) => ({ item, index }))
					.filter(({ item }) => {
						if (f !== 'all') {
							const kind = this.noticeAudienceIsTeacherById(item) ? 'teacher' : 'student';
							if (kind !== f) return false;
						}
						if (!q) return true;
						const t = (item.title || '').toLowerCase();
						const c = (item.content || '').toLowerCase();
						const u = String(item.target_user_id ?? item.username ?? '').toLowerCase();
						return t.includes(q) || c.includes(q) || u.includes(q);
					});
				return entries.map(({ item, index }) => ({
					item,
					index,
					visual: this.noticeCenterVisual(item)
				}));
			},
			noticeGroupConfirmedLine() {
				if (this.noticeGroupSearchStatus !== 'confirmed') return '';
				const id = this.noticeForm.group_id;
				const g = (this.groups || []).find((x) => String(x.id) === String(id));
				if (g) {
					return `已选择：${g.name}（${g.code}）· ID ${g.id}`;
				}
				return id != null && id !== '' ? `已选择 · ID ${id}` : '';
			},
			/** 群组关系表：下拉（群组、角色）+ 关键词（姓名、工号/学号、群组名称/编号） */
			groupRelationsFilteredRows() {
				let rows = this.groupRelationsAllRows || [];
				const gid = String(this.groupRelationsFilterGroupId || '').trim();
				if (gid) {
					rows = rows.filter((r) => String(r.groupPathId) === gid);
				}
				const role = this.groupRelationsFilterRole;
				if (role && role !== 'all') {
					rows = rows.filter((r) => r.member_type === role);
				}
				const q = (this.groupRelationsSearchQuery || '').trim().toLowerCase();
				if (q) {
					rows = rows.filter((r) => {
						const name = (r.memberName || '').toLowerCase();
						const bid = (r.memberBizId || '').toLowerCase();
						const gname = (r.groupName || '').toLowerCase();
						const gcode = (r.groupCode || '').toLowerCase();
						return (
							name.includes(q) ||
							bid.includes(q) ||
							gname.includes(q) ||
							gcode.includes(q)
						);
					});
				}
				// 排序：先按群组编号排序，同群组内按学号/工号数字大小排序
				rows.sort((a, b) => {
					// 先按群组编号排序
					const groupCodeA = String(a.groupCode || '');
					const groupCodeB = String(b.groupCode || '');
					if (groupCodeA !== groupCodeB) {
						// 尝试数字比较
						const numA = parseInt(groupCodeA, 10);
						const numB = parseInt(groupCodeB, 10);
						if (!isNaN(numA) && !isNaN(numB)) {
							return numA - numB;
						}
						return groupCodeA.localeCompare(groupCodeB);
					}
					// 同群组内按学号/工号数字大小排序
					const bizIdA = String(a.memberBizId || '');
					const bizIdB = String(b.memberBizId || '');
					const numBizA = parseInt(bizIdA, 10);
					const numBizB = parseInt(bizIdB, 10);
					if (!isNaN(numBizA) && !isNaN(numBizB)) {
						return numBizA - numBizB;
					}
					return bizIdA.localeCompare(bizIdB);
				});
				return rows;
			},
			/** 群组下拉选项（来自当前已加载的关系行，去重） */
			groupRelationsGroupPickerOptions() {
				const rows = this.groupRelationsAllRows || [];
				const map = new Map();
				for (const r of rows) {
					const id = String(r.groupPathId ?? '').trim();
					if (!id || map.has(id)) continue;
					map.set(id, {
						value: id,
						label: `${r.groupName || '—'}（${r.groupCode || id}）`
					});
				}
				return [{ value: '', label: '全部群组' }, ...Array.from(map.values())];
			},
			groupRelationsGroupPickerDisplay() {
				const o = this.groupRelationsGroupPickerOptions.find(
					(x) => x.value === String(this.groupRelationsFilterGroupId || '')
				);
				return o ? o.label : '全部群组';
			},
			groupRelationsRolePickerOptions() {
				return [
					{ value: 'all', label: '全部角色' },
					{ value: 'teacher', label: '教师' },
					{ value: 'student', label: '学生' }
				];
			},
			groupRelationsRolePickerDisplay() {
				const o = this.groupRelationsRolePickerOptions.find(
					(x) => x.value === this.groupRelationsFilterRole
				);
				return o ? o.label : '全部角色';
			},
			/** 是否启用关键词以外的筛选（用于底部统计提示） */
			groupRelationsHasNonSearchFilters() {
				return (
					String(this.groupRelationsFilterGroupId || '').trim() !== '' ||
					(this.groupRelationsFilterRole && this.groupRelationsFilterRole !== 'all')
				);
			},
			groupRelationsTotalPages() {
				const n = this.groupRelationsFilteredRows.length;
				const ps = this.groupRelationsPageSize;
				return Math.max(1, Math.ceil(n / ps) || 1);
			},
			groupRelationsEffectivePage() {
				return Math.min(
					Math.max(1, this.groupRelationsPage),
					this.groupRelationsTotalPages
				);
			},
			groupRelationsPagedRows() {
				const list = this.groupRelationsFilteredRows;
				const p = this.groupRelationsEffectivePage;
				const start = (p - 1) * this.groupRelationsPageSize;
				return list.slice(start, start + this.groupRelationsPageSize);
			},
			/** 顶栏标题（中文） */
			currentPageTitle() {
				const m = {
					group: '群组管理',
					import: '群组管理',
					permission: '用户与权限',
					download: '群组管理',
					notice: '公告中心',
					dashboard: '数据控制台',
					groupRelations: '群组关系管理',
					school: '院校信息维护',
					createRole: '用户与权限'
				};
				return m[this.currentTab] || '系统管理';
			},
			currentPageDesc() {
				const m = {
					group: '师生关系 CSV 导入、按群组打包下载论文、维护群组与按教师筛选',
					import: '师生关系 CSV 导入、按群组打包下载论文、维护群组与按教师筛选',
					permission: '创建账号、搜索用户并管理角色与权限',
					download: '师生关系 CSV 导入、按群组打包下载论文、维护群组与按教师筛选',
					notice: '以策展式排版发布与归档，触达师生',
					dashboard: '统览数据与截止日期管理',
					groupRelations: '按群组查看师生归属，支持搜索与将成员移出群组',
					school: '维护学校与院系基础信息',
					createRole: '创建账号、搜索用户并管理角色与权限'
				};
				return m[this.currentTab] || '';
			}
		},
		watch: {
			currentTab(val, oldVal) {
				if (val === 'createRole') {
					this.currentTab = 'permission';
					return;
				}
				if (val === 'import' || val === 'download') {
					this.currentTab = 'group';
					return;
				}
				if (oldVal === 'notice' && val !== 'notice' && this.showNoticeForm) {
					this.cancelNoticeEdit();
				}
				if (!this.showSchoolMaintenanceTab && val === 'school') {
					this.currentTab = 'group';
				}
				if (val === 'notice' && (!this.groups || this.groups.length === 0)) {
					this.loadGroupList();
				}
				if (val === 'groupRelations') {
					this.closeGroupRelationsDropdowns();
					this.$nextTick(() => {
						this.loadGroupRelationsFlat();
					});
				} else {
					this.closeGroupRelationsDropdowns();
				}
				if (val === 'permission') {
					this.$nextTick(() => {
						this.loadUserDirectory();
					});
				}
			},
			groupRelationsSearchQuery() {
				this.groupRelationsPage = 1;
			},
			groupRelationsFilterGroupId() {
				this.groupRelationsPage = 1;
			},
			groupRelationsFilterRole() {
				this.groupRelationsPage = 1;
			}
		},
		methods: {
			closeGroupRelationsDropdowns() {
				this.groupRelationsGroupDropdownOpen = false;
				this.groupRelationsRoleDropdownOpen = false;
			},
			toggleGroupRelationsGroupDropdown() {
				const next = !this.groupRelationsGroupDropdownOpen;
				this.groupRelationsRoleDropdownOpen = false;
				this.groupRelationsGroupDropdownOpen = next;
			},
			toggleGroupRelationsRoleDropdown() {
				const next = !this.groupRelationsRoleDropdownOpen;
				this.groupRelationsGroupDropdownOpen = false;
				this.groupRelationsRoleDropdownOpen = next;
			},
			selectGroupRelationsGroup(opt) {
				if (opt) {
					this.groupRelationsFilterGroupId = opt.value;
				}
				this.groupRelationsGroupDropdownOpen = false;
			},
			selectGroupRelationsRole(opt) {
				if (opt) {
					this.groupRelationsFilterRole = opt.value;
				}
				this.groupRelationsRoleDropdownOpen = false;
			},
			accessUserInitial(name) {
				const s = (name || '').trim();
				return s.length ? s[0] : '?';
			},
			/** 解析 GET /api/v1/users/all 返回中的数组 */
			normalizeAllUsersListPayload(res) {
				if (!res) return [];
				if (Array.isArray(res)) return res;
				if (typeof res.code === 'number' && res.code >= 400) return [];
				const d = res.data;
				if (Array.isArray(d)) return d;
				if (d && typeof d === 'object') {
					const inner =
						d.items ||
						d.users ||
						d.list ||
						d.records ||
						(Array.isArray(d.results) ? d.results : null);
					if (Array.isArray(inner)) return inner;
				}
				if (Array.isArray(res.items)) return res.items;
				if (Array.isArray(res.users)) return res.users;
				if (Array.isArray(res.list)) return res.list;
				return [];
			},
			formatDirectoryUserCreatedAt(v) {
				if (v == null || v === '') return '—';
				const s = String(v).trim();
				if (!s) return '—';
				let t = s.replace('T', ' ');
				t = t.replace(/\.\d{3}\+?\d{2}:?\d{2}$/, '');
				t = t.replace(/\.\d+Z?$/, '');
				if (/^\d{4}-\d{2}-\d{2}/.test(t) && t.length > 19) return t.slice(0, 19);
				return t;
			},
			resolveManagedUserType(user) {
				const rawType = String(
					user?.role || user?.user_type || user?.type || user?.member_type || ''
				).trim().toLowerCase();
				if (
					rawType === 'student' ||
					rawType === '学生' ||
					user?.student_id != null ||
					user?.studentId != null
				) {
					return 'student';
				}
				if (
					rawType === 'teacher' ||
					rawType === '教师' ||
					user?.teacher_id != null ||
					user?.teacherId != null
				) {
					return 'teacher';
				}
				if (
					rawType === 'admin' ||
					rawType === 'administrator' ||
					rawType === '管理员' ||
					user?.admin_id != null ||
					user?.adminId != null
				) {
					return 'admin';
				}
				return '';
			},
			resolveManagedUserBackendId(user) {
				if (user?.backendUserId != null && user.backendUserId !== '') {
					return user.backendUserId;
				}
				if (user?.userId != null && user.userId !== '') {
					return user.userId;
				}
				if (user?.user_id != null && user.user_id !== '') {
					return user.user_id;
				}
				if (user?.account_id != null && user.account_id !== '') {
					return user.account_id;
				}
				if (user?.sub != null && user.sub !== '') {
					return user.sub;
				}
				if (
					user?.id != null &&
					user.id !== '' &&
					(user?.user_type != null ||
						user?.type != null ||
						user?.student_id != null ||
						user?.teacher_id != null ||
						user?.admin_id != null)
				) {
					return user.id;
				}
				return null;
			},
			ensureActionSucceeded(result, fallbackMessage = '操作失败') {
				console.log('[ensureActionSucceeded] 检查结果:', JSON.stringify(result));
				if (!result || typeof result !== 'object') {
					console.log('[ensureActionSucceeded] result 为空或非对象，直接返回');
					return result;
				}
				const detailMessage =
					typeof result.detail === 'string'
						? result.detail
						: Array.isArray(result.detail) && result.detail[0] && typeof result.detail[0].msg === 'string'
							? result.detail[0].msg
							: '';
				const errorMessage = detailMessage || result.message || result.error || fallbackMessage;
				console.log('[ensureActionSucceeded] 解析的 errorMessage:', errorMessage);
				if (typeof result.code === 'number' && result.code >= 400) {
					console.error('[ensureActionSucceeded] 检测到 code >= 400, 抛出错误:', errorMessage);
					throw new Error(errorMessage);
				}
				if (result.success === false || result.error) {
					console.error('[ensureActionSucceeded] 检测到 success=false 或 error, 抛出错误:', errorMessage);
					throw new Error(errorMessage);
				}
				if (result.detail && result.success !== true && !(typeof result.code === 'number' && result.code < 400)) {
					console.error('[ensureActionSucceeded] 检测到 detail 存在但非成功状态, 抛出错误:', errorMessage);
					throw new Error(errorMessage);
				}
				console.log('[ensureActionSucceeded] 检查通过，操作成功');
				return result;
			},
			mapDirectoryUserRow(raw) {
				const role = this.resolveManagedUserType(raw) || 'student';
				const sub = raw.sub ?? raw.user_id ?? raw.id ?? raw.account_id;
				const backendUserId = raw.id ?? raw.user_id ?? raw.account_id ?? raw.sub;
				const username = String(raw.username || raw.login || '').trim();
				const name = String(
					raw.full_name || raw.name || raw.nickname || username || '—'
				).trim();
				let bizId = '';
				if (role === 'student') {
					bizId = String(
						raw.student_id ?? raw.user_id ?? raw.studentId ?? username ?? sub ?? ''
					).trim();
				} else if (role === 'teacher') {
					bizId = String(
						raw.teacher_id ?? raw.user_id ?? raw.teacherId ?? username ?? sub ?? ''
					).trim();
				} else {
					bizId = String(raw.admin_id ?? raw.user_id ?? raw.adminId ?? username ?? sub ?? '').trim();
				}
				if (!bizId) bizId = username || (sub != null ? String(sub) : '');
				const createdAtDisplay = this.formatDirectoryUserCreatedAt(
					raw.created_at ?? raw.create_time ?? raw.createdTime
				);
				return {
					sub,
					backendUserId,
					id: bizId || '—',
					name: name || '—',
					role,
					username,
					groupName: raw.group_name || raw.groupName || '',
					createdAtDisplay
				};
			},
			/**
			 * 用户目录：GET /api/v1/users/all 拉全量，配合角色 Tab + 搜索框筛选
			 */
			async loadUserDirectory() {
				if (this.userDirectoryLoading) return;
				this.userDirectoryLoading = true;
				try {
					const adminInfo = await this.getOrCreateAdmin();
					const currentUser = this.buildCurrentUserFromAdmin(adminInfo);
					const { queryAllUsers } = await import('@/api/admin.js');
					const res = await queryAllUsers({}, currentUser);
					if (res && typeof res.code === 'number' && res.code >= 400) {
						throw new Error(res.message || res.detail || '查询用户失败');
					}
					const arr = this.normalizeAllUsersListPayload(res);
					this.users = arr.map((r) => this.mapDirectoryUserRow(r));
				} catch (e) {
					console.error('加载用户目录失败:', e);
					uni.showToast({
						title: e?.message || '加载用户目录失败',
						icon: 'none'
					});
				} finally {
					this.userDirectoryLoading = false;
				}
			},
			
			checkAdminAuth() {
				const token = uni.getStorageSync('token');
				const role = uni.getStorageSync('userRole');
				if (!token || role !== 'admin') {
					uni.showToast({
						title: '未登录或无权限，请使用管理员账号登录',
						icon: 'none',
						duration: 2000
					});
					setTimeout(() => {
						uni.reLaunch({
							url: '/pages/index/index'
						});
					}, 1500);
					return false;
				}
				return true;
			},
			initAdminInfo() {
				const userInfo = uni.getStorageSync('userInfo') || {};
				this.adminName = userInfo.username || userInfo.name || '管理员';
				this.adminAvatar = userInfo.avatar || '';
				this.userCardInfo = {
					name: userInfo.full_name || userInfo.name || userInfo.nickname || userInfo.username || '管理员',
					username: userInfo.username || '',
					role: '管理员'
				};
			},
			onSidebarHelp() {
				uni.showToast({
					title: '如需帮助请联系系统管理员',
					icon: 'none'
				});
			},
			onUserCardEnter() {
				if (this._userCardHideTimer) {
					clearTimeout(this._userCardHideTimer);
					this._userCardHideTimer = null;
				}
				this._userCardShowTimer = setTimeout(() => {
					this.showUserCard = true;
				}, 300);
			},
			onUserCardLeave() {
				if (this._userCardShowTimer) {
					clearTimeout(this._userCardShowTimer);
					this._userCardShowTimer = null;
				}
				this._userCardHideTimer = setTimeout(() => {
					this.showUserCard = false;
				}, 1500);
			},
			openChangePassword() {
				this.showUserCard = false;
				this.passwordForm = { oldPassword: '', newPassword: '', confirmPassword: '' };
				this.passwordError = '';
				this.showPasswordModal = true;
			},
			closePasswordModal() {
				this.showPasswordModal = false;
				this.passwordForm = { oldPassword: '', newPassword: '', confirmPassword: '' };
				this.passwordError = '';
			},
			async submitChangePassword() {
				const { oldPassword, newPassword, confirmPassword } = this.passwordForm;
				this.passwordError = '';
				if (!oldPassword) {
					return uni.showToast({ title: '请输入当前密码', icon: 'none' });
				}
				if (!newPassword) {
					return uni.showToast({ title: '请输入新密码', icon: 'none' });
				}
				if (newPassword.length < 6) {
					return uni.showToast({ title: '密码至少6位', icon: 'none' });
				}
				if (newPassword !== confirmPassword) {
					this.passwordError = '两次密码不一致，请重新输入';
					return;
				}
				try {
					const { changePassword } = await import('@/api/user.js');
					await changePassword({ old_password: oldPassword, new_password: newPassword });
					uni.showToast({ title: '密码修改成功', icon: 'success' });
					this.closePasswordModal();
				} catch (err) {
					console.error('修改密码失败:', err);
					uni.showToast({ title: err?.message || '修改失败，请重试', icon: 'none' });
				}
			},
			showLogoutConfirm() {
				this.showUserCard = false;
				this.showLogoutConfirmModal = true;
			},
			async logout() {
				try {
					await logout();
					uni.removeStorageSync('token');
					uni.removeStorageSync('userInfo');
					uni.removeStorageSync('userRole');
					uni.removeStorageSync('rememberedUsername');
					uni.removeStorageSync('systemAdminInfo');
					uni.showToast({
						title: '已退出登录',
						icon: 'success'
					});
					setTimeout(() => {
						uni.reLaunch({ url: '/pages/index/index' });
					}, 1000);
				} catch (err) {
					console.error('退出登录失败:', err);
					uni.removeStorageSync('token');
					uni.removeStorageSync('userInfo');
					uni.removeStorageSync('userRole');
					uni.removeStorageSync('systemAdminInfo');
					uni.reLaunch({ url: '/pages/index/index' });
				}
			},
			
			// 切换到控制台标签
			switchToDashboard() {
				this.currentTab = 'dashboard';
				// 延迟加载数据，确保DOM已更新
				setTimeout(() => {
					this.loadDashboardStats();
				}, 100);
			},
			
			// 加载控制台统计数据
			async loadDashboardStats() {
				// 如果数据已经加载过且不是强制刷新，则不再加载
				if (this.dashboardStats.updateTime && this.currentTab !== 'dashboard') {
					return;
				}
				
				try {
					uni.showLoading({ title: '加载统计数据...' });
					
					const adminInfo = await this.getOrCreateAdmin();
					const currentUser = {
						sub: adminInfo.id || 1,
						username: adminInfo.username || 'admin',
						roles: ['admin']
					};
					
					// 并行获取所有统计数据
					const [
						studentRes,
						teacherRes,
						paperTotalRes,
						uploadedRes,
						unreviewedRes,
						updatedRes
					] = await Promise.all([
						this.fetchStats('/api/v1/admin/stats/students/total', currentUser),
						this.fetchStats('/api/v1/admin/stats/teachers/total', currentUser),
						this.fetchStats('/api/v1/admin/dashboard/stats', currentUser), // 论文总数
						this.fetchStats('/api/v1/admin/stats/papers/uploaded/total', currentUser),
						this.fetchStats('/api/v1/admin/stats/papers/unreviewed/total', currentUser),
						this.fetchStats('/api/v1/admin/stats/papers/updated/total', currentUser)
					]);
					
					console.log('学生总数:', studentRes);
					console.log('教师总数:', teacherRes);
					console.log('论文总数:', paperTotalRes);
					console.log('已上传:', uploadedRes);
					console.log('未审阅:', unreviewedRes);
					console.log('已更新:', updatedRes);
					
					// 更新统计数据
					this.dashboardStats = {
						studentTotal: studentRes.total_students || 0,
						teacherTotal: teacherRes.total_teachers || 0,
						paperTotal: paperTotalRes.total_papers || 0,
						paperUploaded: uploadedRes.total_uploaded_papers || 0,
						paperUnreviewed: unreviewedRes.total_unreviewed_papers || 0,
						paperUpdated: updatedRes.total_updated_papers || 0,
						updateTime: new Date().toLocaleString()
					};
					
					console.log('控制台统计数据加载完成:', this.dashboardStats);
				} catch (error) {
					console.error('加载控制台统计数据失败:', error);
					uni.showToast({
						title: '加载统计数据失败',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},
			
			// 辅助方法：获取统计数据
			async fetchStats(url, currentUser) {
				try {
					const params = {
						current_user: JSON.stringify(currentUser)
					};
					const res = await uni.request({
						url: config.baseURL + url,
						method: 'GET',
						data: params
					});
					
					if (res.statusCode === 200) {
						return res.data || {};
					}
					return {};
				} catch (error) {
					console.error(`获取 ${url} 失败:`, error);
					return {};
				}
			},
			
			// 显示截止日期管理
			showDeadlineManagement() {
				this.showDeadlineModal = true;
			},
			
			// 关闭截止日期管理弹窗
			closeDeadlineModal() {
				this.showDeadlineModal = false;
				this.selectedTeacher = null;
				this.deadlineList = [];
				this.teacherIdInput = '';
			},
			
			// 加载教师列表
			async loadTeacherList() {
				try {
					const adminInfo = await this.getOrCreateAdmin();
					const currentUser = {
						sub: adminInfo.id || 1,
						username: adminInfo.username || 'admin',
						roles: ['admin']
					};
					
					const res = await uni.request({
						url: config.baseURL + '/api/v1/admin/teachers',
						method: 'GET',
						data: {
							page: 1,
							page_size: 100,
							current_user: JSON.stringify(currentUser)
						}
					});
					
					if (res.statusCode === 200 && res.data) {
						const data = res.data.data || res.data;
						this.teacherList = (data.teachers || data.list || []).map(t => ({
							id: t.id,
							name: t.name || t.username || `教师${t.id}`,
							username: t.username
						}));
					}
				} catch (error) {
					console.error('加载教师列表失败:', error);
					uni.showToast({ title: '加载教师列表失败', icon: 'none' });
				}
			},
			
			// 选择教师
			onTeacherSelect(e) {
				const index = e.detail.value;
				this.selectedTeacher = this.teacherList[index];
				this.loadDeadlineList();
			},
			
			// 根据工号/用户名查询：先 get-sub-auto 取 sub，再用 teacher_id=sub 拉 DDL
			async queryDeadlineByTeacherId() {
				const username = (this.teacherIdInput || '').trim();
				if (!username) {
					uni.showToast({ title: '请输入教师工号或用户名', icon: 'none' });
					return;
				}
				
				try {
					uni.showLoading({ title: '查询中...' });
					const { getUserSubAuto } = await import('@/api/admin.js');
					const subResult = await getUserSubAuto(username);
					
					if (!subResult || subResult.code !== 200 || !subResult.data) {
						uni.hideLoading();
						uni.showToast({
							title: subResult?.message || '未找到该用户',
							icon: 'none'
						});
						this.selectedTeacher = null;
						this.deadlineList = [];
						return;
					}
					
					const { sub, user_type, username: resolvedName } = subResult.data;
					if (user_type !== 'teacher') {
						uni.hideLoading();
						uni.showToast({ title: '该账号不是教师，无法查询截止日期', icon: 'none' });
						this.selectedTeacher = null;
						this.deadlineList = [];
						return;
					}
					
					const subNum = parseInt(String(sub), 10);
					this.selectedTeacher = {
						id: Number.isNaN(subNum) ? sub : subNum,
						name: resolvedName || username,
						username: resolvedName || username,
						queryInput: username
					};
					
					uni.hideLoading();
					await this.loadDeadlineList();
				} catch (err) {
					uni.hideLoading();
					console.error('查询教师 sub 失败:', err);
					uni.showToast({
						title: err?.message || '查询失败',
						icon: 'none'
					});
					this.selectedTeacher = null;
					this.deadlineList = [];
				}
			},
			
			// 加载截止日期列表
			async loadDeadlineList() {
				if (!this.selectedTeacher) return;
				
				try {
					uni.showLoading({ title: '加载中...' });
					
					const adminInfo = await this.getOrCreateAdmin();
					const currentUser = {
						sub: parseInt(adminInfo.id) || 1,
						username: adminInfo.username || 'admin',
						roles: ['admin']
					};
					
					const res = await uni.request({
						url: config.baseURL + '/api/v1/papers/ddl/list',
						method: 'GET',
						data: {
							teacher_id: this.selectedTeacher.id,
							current_user: JSON.stringify(currentUser)
						}
					});
					
					uni.hideLoading();
					
					if (res.statusCode === 200) {
						const data = res.data;
						this.deadlineList = Array.isArray(data) ? data : (data.ddls || data.list || []);
					} else {
						console.error('加载截止日期失败:', res);
						this.deadlineList = [];
						uni.showToast({ title: '加载失败', icon: 'none' });
					}
				} catch (error) {
					uni.hideLoading();
					console.error('加载截止日期列表失败:', error);
					this.deadlineList = [];
					uni.showToast({ title: '加载失败', icon: 'none' });
				}
			},
			
			// 格式化截止日期时间
			formatDeadlineTime(ddl) {
				if (!ddl) return '未设置';
				const date = new Date(ddl);
				return date.toLocaleString('zh-CN');
			},
			
			// 显示删除确认弹窗
			showDeleteConfirm(item) {
				this.deletingItem = item;
				this.showDeleteDeadlineModal = true;
			},
			
			// 关闭删除确认弹窗
			closeDeleteConfirm() {
				this.showDeleteDeadlineModal = false;
				this.deletingItem = null;
			},
			
			// 确认删除截止日期
			async confirmDeleteDeadline() {
				if (!this.deletingItem) return;
				
				try {
					uni.showLoading({ title: '删除中...' });
					
					const adminInfo = await this.getOrCreateAdmin();
					const currentUser = {
						sub: parseInt(adminInfo.id) || 1,
						username: adminInfo.username || 'admin',
						roles: ['admin']
					};
					
					// 直接使用 uni.request 调用删除接口，传递管理员身份
					// 将 current_user 拼接到 URL 中
					const queryString = `current_user=${encodeURIComponent(JSON.stringify(currentUser))}`;
					const res = await uni.request({
						url: config.baseURL + `/api/v1/papers/ddl/${this.deletingItem.ddlid}?${queryString}`,
						method: 'DELETE'
					});
					
					uni.hideLoading();
					
					if (res.statusCode === 200 || res.statusCode === 204) {
						uni.showToast({ title: '删除成功', icon: 'success' });
						// 关闭确认弹窗
						this.closeDeleteConfirm();
						// 刷新列表
						this.loadDeadlineList();
					} else {
						console.error('删除失败:', res);
						uni.showToast({ title: '删除失败', icon: 'none' });
					}
				} catch (error) {
					uni.hideLoading();
					console.error('删除截止日期失败:', error);
					uni.showToast({ title: '删除失败', icon: 'none' });
				}
			},
			
			// 切换到审计日志标签页
			switchToAuditTab() {
				this.currentTab = 'audit';
				// 如果还没有加载过数据，自动加载
				if (this.auditLogs.length === 0) {
					this.searchAuditLogs();
				}
			},
			showCreateGroup() {
				this.editingGroup = null;
				this.groupForm = {
					name: '',
					code: '',
					active: true
				};
				this.showGroupModal = true;
			},
			editGroup(group) {
				this.editingGroup = group;
				this.groupForm = {
					name: group.name,
					code: group.code,
					active: group.active
				};
				this.showGroupModal = true;
			},
			// 查看群组详情（成员列表）
			async viewGroupDetail(group) {
				this.currentGroup = group;
				this.showMemberModal = true;
				this.loadingMembers = true;
				
				try {
					const { getGroupMembers } = await import('@/api/admin.js');
					const adminInfo = uni.getStorageSync('systemAdminInfo') || {};
					// 根据 Swagger 要求构造 current_user 参数
					const currentUser = {
						sub: adminInfo.id || 1,
						username: adminInfo.username || 'admin',
						roles: ['admin']
					};
					
					// 使用 group.code（即 group_id）作为路径参数，如果没有 code 则使用 id
					const groupId = group.code || group.id;
					console.log('获取群组成员，groupId:', groupId, 'currentUser:', currentUser);
					const result = await getGroupMembers(groupId, {}, currentUser);
					console.log('获取群组成员返回结果:', result);
					
					// 处理返回数据，后端直接返回对象，不是 { code: 200, data: ... } 格式
					const responseData = result.data || result;
					if (responseData && responseData.members) {
						// 处理成员数据
						const members = responseData.members || [];
						this.groupMembers = {
							teachers: members.filter(m => m.member_type === 'teacher'),
							students: members.filter(m => m.member_type === 'student')
						};
						console.log('处理后的成员数据:', this.groupMembers);
					} else {
						this.groupMembers = { teachers: [], students: [] };
					}
				} catch (error) {
					console.error('获取群组成员失败:', error);
					this.groupMembers = { teachers: [], students: [] };
					uni.showToast({
						title: error.message || '获取成员失败',
						icon: 'none'
					});
				} finally {
					this.loadingMembers = false;
				}
			},
			
			// 关闭成员弹窗
			closeMemberModal() {
				this.showMemberModal = false;
				this.currentGroup = null;
				this.groupMembers = { teachers: [], students: [] };
			},
			
			// 删除成员
			deleteMember(member, type) {
				this.deletingMember = { ...member, type };
				this.showDeleteMemberModal = true;
			},
			
			// 关闭删除成员弹窗
			closeDeleteMemberModal() {
				this.showDeleteMemberModal = false;
				this.deletingMember = null;
			},
			
			// 确认删除成员
			async confirmDeleteMember() {
				if (!this.deletingMember) return;
				
				const { member_id, name, type, account_id } = this.deletingMember;
				
				try {
					uni.showLoading({ title: '删除中...' });
					
					// 导入删除成员接口
					const { removeGroupMember } = await import('@/api/admin.js');
					
					// 获取当前登录管理员信息
					const adminInfo = uni.getStorageSync('userInfo') || {};
					const currentUser = {
						sub: parseInt(adminInfo.id) || 1,
						roles: ['admin'],
						username: adminInfo.username || 'admin'
					};
					
					// 调用删除成员接口
					// 使用 account_id 或 member_id 作为要删除的成员ID
					const memberIdToDelete = account_id || member_id;
					
					const result = await removeGroupMember(this.currentGroup.id, {
						current_user: currentUser,
						member_type: type,
						member_id: memberIdToDelete
					});
					
					uni.hideLoading();
					
					// 判断成功 - 支持多种返回格式
					const isSuccess = result && (
						result.code === 200 || 
						result.code === 0 || 
						result.success === true || 
						result.message === 'success' ||
						result.message === '成员删除成功' ||
						result.data ||
						(result && typeof result === 'object' && !result.error)
					);
					
					console.log('删除成员结果:', result, '是否成功:', isSuccess);
					
					if (isSuccess) {
						uni.showToast({
							title: '删除成功',
							icon: 'success'
						});
										
						// 刷新成员列表
						if (type === 'teacher') {
							this.groupMembers.teachers = this.groupMembers.teachers.filter(t => t.member_id !== member_id);
						} else {
							this.groupMembers.students = this.groupMembers.students.filter(s => s.member_id !== member_id);
						}
										
						// 刷新群组列表（更新教师/学生数量）
						this.loadGroupList();
										
						// 关闭删除确认弹窗
						this.showDeleteMemberModal = false;
						this.deletingMember = null;
					} else {
						uni.showToast({
							title: result?.message || '删除失败',
							icon: 'none'
						});
					}
				} catch (error) {
					uni.hideLoading();
					console.error('删除成员失败:', error);
					uni.showToast({
						title: error?.message || '删除失败',
						icon: 'none'
					});
				}
			},
			
			// 邀请成员 - 打开邀请弹窗
			inviteMember(type) {
				this.inviteType = type;
				this.inviteForm.memberId = '';
				this.inviteForm.role = 'member';
				this.showInviteModal = true;
			},
			
			// 关闭邀请弹窗
			closeInviteModal() {
				this.showInviteModal = false;
				this.inviteForm.memberId = '';
				this.inviteForm.role = 'member';
			},
			
			// 选择邀请角色
			onInviteRoleChange(e) {
				const roles = ['member', 'admin'];
				this.inviteForm.role = roles[e.detail.value];
			},
			
			// 确认邀请
			async confirmInvite() {
				if (!this.inviteForm.memberId) {
					uni.showToast({
						title: `请输入${this.inviteType === 'teacher' ? '教师工号' : '学生ID'}`,
						icon: 'none'
					});
					return;
				}
				
				try {
					uni.showLoading({ title: '邀请中...' });
					
					const adminInfo = await this.getOrCreateAdmin();
					const { addGroupMember } = await import('@/api/admin.js');
					
					// 构建请求参数
					const params = {
						member_type: this.inviteType === 'teacher' ? 'teacher' : 'student',
						member_id: this.inviteType === 'student' ? parseInt(this.inviteForm.memberId) : this.inviteForm.memberId,
						role: this.inviteForm.role,
						action: 'add',
						current_user: {
							sub: parseInt(adminInfo.id) || 1,
							roles: ['admin'],
							username: adminInfo.username || 'admin'
						}
					};
					
					const result = await addGroupMember(this.currentGroup.code || this.currentGroup.id, params);
					
					uni.hideLoading();
					
					if (result && (result.code === 200 || result.message)) {
						uni.showToast({
							title: '邀请成功',
							icon: 'success'
						});
						this.closeInviteModal();
						// 刷新群组列表（更新教师/学生数量）
						this.loadGroupList();
						// 刷新成员列表
						if (this.currentGroup) {
							this.viewGroupDetail(this.currentGroup);
						}
					} else {
						uni.showToast({
							title: result?.detail || '邀请失败',
							icon: 'none'
						});
					}
				} catch (error) {
					uni.hideLoading();
					console.error('邀请成员失败:', error);
					uni.showToast({
						title: error.message || '邀请失败',
						icon: 'none'
					});
				}
			},
			deleteGroup(group) {
				this.pendingDeleteGroup = group;
				this.showDeleteGroupModal = true;
			},
			closeDeleteGroupModal() {
				this.showDeleteGroupModal = false;
				this.pendingDeleteGroup = null;
			},
			async confirmDeleteGroup() {
				const group = this.pendingDeleteGroup;
				if (!group) return;
				this.closeDeleteGroupModal();
				try {
					uni.showLoading({ title: '删除中...' });
					const adminInfo = await this.getOrCreateAdmin();
					const { deleteGroupById } = await import('@/api/admin.js');
					const result = await deleteGroupById(group.code || group.id, {}, {
						sub: String(adminInfo.id),
						roles: adminInfo.roles,
						username: String(adminInfo.username)
					});
					uni.hideLoading();
					console.log('删除接口返回结果:', result);
					const isSuccess = result && (
						result.code === 200 ||
						result.code === 0 ||
						result.success === true ||
						result.message ||
						(typeof result === 'string' && result.includes('success'))
					);
					if (isSuccess) {
						const index = this.groups.findIndex((g) => g.id === group.id || g.code === group.code);
						if (index > -1) {
							this.groups.splice(index, 1);
						}
						const optionIndex = this.groupOptions.findIndex(
							(opt) => opt.value === group.id || opt.name === group.name
						);
						if (optionIndex > -1) {
							this.groupOptions.splice(optionIndex, 1);
						}
						uni.showToast({ title: '删除成功', icon: 'success' });
					} else {
						uni.showToast({ title: result?.message || '删除失败', icon: 'none' });
					}
				} catch (error) {
					uni.hideLoading();
					console.error('删除群组失败:', error);
					uni.showToast({
						title: error?.message || '删除失败，请检查网络',
						icon: 'none'
					});
				}
			},
			closeGroupModal() {
				this.showGroupModal = false;
				this.editingGroup = null;
			},
			/**
			 * 当前登录管理员信息（供 API current_user / X-Current-User）
			 * 优先 systemAdminInfo；否则从登录态 userInfo 同步，不调用「创建管理员」接口。
			 * 创建管理员仅在「创建角色 → 创建管理员」submitCreateAdmin 中调用。
			 */
			async getOrCreateAdmin() {
				let adminInfo = uni.getStorageSync('systemAdminInfo');
				if (adminInfo != null && adminInfo.id != null && adminInfo.id !== '') {
					if (!Array.isArray(adminInfo.roles)) {
						adminInfo.roles = [adminInfo.roles || 'admin'];
					}
					return adminInfo;
				}
				const userInfo = uni.getStorageSync('userInfo') || {};
				const rawId = userInfo.id ?? userInfo.sub ?? userInfo.user_id;
				if (rawId != null && rawId !== '') {
					const numId = parseInt(String(rawId), 10);
					const id = Number.isFinite(numId) ? numId : rawId;
					const roleVal = userInfo.role ?? userInfo.roles;
					const roles = Array.isArray(roleVal)
						? roleVal
						: [roleVal || 'admin'];
					adminInfo = {
						id,
						username: String(userInfo.username || 'admin'),
						roles
					};
					uni.setStorageSync('systemAdminInfo', adminInfo);
					console.log('从 userInfo 同步管理员信息:', adminInfo.username);
					return adminInfo;
				}
				console.warn('getOrCreateAdmin: 无 userInfo 与 systemAdminInfo，使用占位');
				adminInfo = { id: 1, username: 'admin', roles: ['admin'] };
				return adminInfo;
			},
			
			async saveGroup() {
				if (!this.groupForm.name) {
					uni.showToast({
						title: '请输入群组名称',
						icon: 'none'
					});
					return;
				}
				
				if (this.editingGroup) {
					// 更新群组 - 调用后端接口
					try {
						uni.showLoading({ title: '更新中...' });
						
						// 获取管理员信息
						const adminInfo = await this.getOrCreateAdmin();
						
						// 调用更新群组接口
						const { updateGroup } = await import('@/api/admin.js');
						const currentUser = {
							sub: String(adminInfo.id),
							roles: ['admin'],
							username: String(adminInfo.username)
						};
						const result = await updateGroup(
							this.editingGroup.code || this.editingGroup.id,
							{
								group_name: this.groupForm.name
								// teacher_id 可选，如果有可以传
							},
							currentUser
						);
						
						uni.hideLoading();
						
						console.log('更新群组响应:', result);
						
						// 判断成功
						const isSuccess = result && (
							result.code === 200 || 
							result.code === 0 || 
							result.success === true ||
							result.data ||
							result.message === 'success' ||
							result.message === '群组更新成功'
						);
						
						console.log('isSuccess:', isSuccess, 'result:', result);
						
						if (isSuccess) {
							// 更新本地数据
							this.editingGroup.name = this.groupForm.name;
							
							uni.showToast({
								title: '更新成功',
								icon: 'success'
							});
							this.closeGroupModal();
						} else {
							uni.showToast({
								title: result?.message || '更新失败',
								icon: 'none'
							});
						}
					} catch (error) {
						uni.hideLoading();
						console.error('更新群组失败:', error);
						uni.showToast({
							title: error?.message || '更新失败，请检查网络',
							icon: 'none'
						});
					}
				} else {
					// 创建新群组 - 先获取/创建管理员，再调用后端接口
					try {
						uni.showLoading({ title: '创建中...' });
						
						// 1. 获取或创建管理员
						const adminInfo = await this.getOrCreateAdmin();
						
						// 2. 创建群组
						const { createGroup } = await import('@/api/admin.js');
						const result = await createGroup({
							group_name: this.groupForm.name,
							group_id: this.groupForm.code,
							current_user: {
								sub: adminInfo.id,
								roles: adminInfo.roles,
								username: adminInfo.username
							}
						});
						
						uni.hideLoading();
						
						console.log('创建群组响应:', result);
						
						// 判断成功：支持多种响应格式
						const isSuccess = result && (
							result.code === 200 || 
							result.code === 0 || 
							result.success === true ||
							result.data ||
							(result.group_id || result.groupId || result.id)
						);
						
						if (isSuccess) {
							// 创建成功，添加到本地列表
							const newGroup = {
								id: result.data?.group_id || result.data?.groupId || result.data?.id || result.group_id || result.groupId || result.id || this.groupForm.code,
								name: this.groupForm.name,
								code: this.groupForm.code,
								active: this.groupForm.active,
								teacherCount: 0,
								studentCount: 0,
								paperCount: 0
							};
							console.log('添加到列表的新群组:', newGroup);
							this.groups.push(newGroup);
							
							// 同时更新 groupOptions
							this.groupOptions.push({
								name: this.groupForm.name,
								value: newGroup.id
							});
							
							uni.showToast({
								title: '创建成功',
								icon: 'success'
							});
							this.closeGroupModal();
													
							// 刷新群组列表
							this.loadGroupList();
						} else {
							uni.showToast({
								title: result?.message || '创建失败',
								icon: 'none'
							});
						}
					} catch (error) {
						uni.hideLoading();
						console.error('创建群组失败:', error);
						uni.showToast({
							title: error?.message || '创建失败，请检查网络',
							icon: 'none'
						});
					}
				}
			},
			downloadTemplate() {
				uni.showToast({
					title: '下载模板文件',
					icon: 'none'
				});
				// 这里应该调用下载接口
			},
			chooseImportFile() {
				uni.chooseFile({
					count: 1,
					type: 'file',
					extension: ['.xlsx', '.xls'],
					success: (res) => {
						const file = res.tempFiles[0];
						if (file.size > 10 * 1024 * 1024) {
							uni.showToast({
								title: '文件大小不能超过10MB',
								icon: 'none'
							});
							return;
						}
						this.selectedImportFile = file;
					}
				});
			},
			removeImportFile() {
				this.selectedImportFile = null;
			},
			
			// 批量导入用户 - 选择文件
			chooseUserImportFile() {
				uni.chooseFile({
					count: 1,
					type: 'file',
					extension: ['.csv', '.tsv'],
					success: (res) => {
						const file = res.tempFiles[0];
						this.selectedUserImportFile = file;
						uni.showToast({
							title: '已选择: ' + file.name,
							icon: 'none'
						});
					},
					fail: (err) => {
						console.error('选择文件失败:', err);
						uni.showToast({
							title: '选择文件失败',
							icon: 'none'
						});
					}
				});
			},
			
			// 批量导入用户 - 移除文件
			removeUserImportFile() {
				this.selectedUserImportFile = null;
			},
			
			// 批量导入用户 - 提交导入
			async submitUserImport() {
				if (!this.selectedUserImportFile) {
					uni.showToast({
						title: '请先选择文件',
						icon: 'none'
					});
					return;
				}
				
				uni.showLoading({ title: '导入中...' });
				
				try {
					// 获取管理员信息
					const adminInfo = await this.getOrCreateAdmin();
					const currentUser = {
						sub: String(adminInfo.id),
						roles: ['admin'],
						username: String(adminInfo.username)
					};
					
					// 调用导入用户接口
					const { importUsers } = await import('@/api/admin.js');
					const result = await importUsers(this.selectedUserImportFile, currentUser);
					
					console.log('导入用户结果:', result);
					
					if (result && result.detail != null && result.created == null && result.updated == null) {
						const d = result.detail;
						const msg = typeof d === 'string'
							? d
							: Array.isArray(d)
								? d.map((x) => (typeof x === 'string' ? x : x?.msg || JSON.stringify(x))).filter(Boolean).join('；')
								: '导入失败';
						throw new Error(msg);
					}
					
					const parsed = this.normalizeUserImportApiResult(result);
					this.userImportResult = {
						show: true,
						total: parsed.total,
						created: parsed.created,
						updated: parsed.updated,
						failed: parsed.failed,
						message: parsed.message || '导入完成',
						errors: parsed.errors
					};
					
					const touched = parsed.created + parsed.updated;
					if (touched > 0) {
						uni.showToast({
							title: `新建 ${parsed.created}，更新 ${parsed.updated}`,
							icon: 'success'
						});
						if (this.currentTab === 'permission') {
							await this.loadUserDirectory();
						}
					}
				} catch (error) {
					console.error('导入用户失败:', error);
					uni.showToast({
						title: error.message || '导入失败',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},
			
			normalizeUserImportApiResult(raw) {
				if (!raw || typeof raw !== 'object') {
					return { total: 0, created: 0, updated: 0, failed: 0, errors: [], message: '' };
				}
				const r =
					raw.data != null && typeof raw.data === 'object' && !Array.isArray(raw.data)
						? { ...raw, ...raw.data }
						: { ...raw };
				const num = (v) => {
					const x = Number(v);
					return Number.isFinite(x) ? x : 0;
				};
				const created = num(r.created ?? r.success_count ?? r.success ?? r.imported);
				const updated = num(r.updated);
				const failed = num(r.failed_count ?? r.failed ?? r.failures);
				let total = num(r.total ?? r.total_count ?? r.total_rows);
				if (!total) total = created + updated + failed;
				let errors = [];
				if (Array.isArray(r.errors)) {
					errors = r.errors.map((e) => (typeof e === 'string' ? e : JSON.stringify(e)));
				} else if (Array.isArray(r.error_list)) {
					errors = r.error_list.map((e) => String(e));
				}
				const message = typeof r.message === 'string' ? r.message : '';
				return { total, created, updated, failed, errors, message };
			},
			
			// 批量导入用户 - 关闭结果
			closeUserImportResult() {
				this.userImportResult = {
					show: false,
					total: 0,
					created: 0,
					updated: 0,
					failed: 0,
					message: '',
					errors: []
				};
				this.selectedUserImportFile = null;
				this.userImportProgress.show = false;
			},
			
			closeImportResult() {
				this.importResult = {
					show: false,
					total: 0,
					success: 0,
					failed: 0,
					skipped: 0,
					errors: [],
					isFailure: false
				};
				this.importProgress = {
					show: false,
					text: '',
					percent: 0,
					details: null
				};
			},
			
			parseGroupImportErrorMessage(result) {
				if (!result || typeof result !== 'object') return '';
				if (typeof result.msg === 'string' && result.msg.trim()) return result.msg.trim();
				if (typeof result.message === 'string' && result.message.trim()) return result.message.trim();
				if (typeof result.detail === 'string' && result.detail.trim()) return result.detail.trim();
				if (Array.isArray(result.detail)) {
					return result.detail
						.map((d) => {
							if (typeof d === 'string') return d;
							if (d && typeof d.msg === 'string') return d.msg;
							return '';
						})
						.filter(Boolean)
						.join('；');
				}
				return '';
			},
			
			formatFileSize(size) {
				if (size < 1024) return size + 'B';
				if (size < 1024 * 1024) return (size / 1024).toFixed(2) + 'KB';
				return (size / (1024 * 1024)).toFixed(2) + 'MB';
			},
			onImportOptionChange(e) {
				const values = e.detail.value;
				this.importOptions.skipExisting = values.includes('skip_existing');
				this.importOptions.sendNotification = values.includes('send_notification');
			},
			async submitImport() {
				if (!this.selectedImportFile) {
					uni.showToast({
						title: '请选择文件',
						icon: 'none'
					});
					return;
				}
				
				this.importResult = {
					show: false,
					total: 0,
					success: 0,
					failed: 0,
					skipped: 0,
					errors: [],
					isFailure: false
				};
				
				this.importProgress = {
					show: true,
					text: '正在导入...',
					percent: 0,
					details: null
				};
				
				try {
					// 获取管理员信息，使用系统管理员角色
					const adminInfo = await this.getOrCreateAdmin();
					const currentUser = {
						sub: String(adminInfo.id),
						roles: ['admin'],  // 使用 admin 角色确保有批量导入权限
						username: String(adminInfo.username)
					};
					
					console.log('导入使用的管理员身份:', currentUser);
					
					// 调用导入接口
					const { importGroupRelations } = await import('@/api/admin.js');
					const result = await importGroupRelations(this.selectedImportFile, currentUser);
					
					console.log('导入结果:', result);
					
					const total = Number(result.total ?? result.imported ?? result.imported_count ?? 0) || 0;
					const success =
						Number(result.success_count ?? result.imported ?? result.imported_count ?? result.success ?? 0) || 0;
					const failed = Number(result.failed_count ?? result.failed ?? 0) || 0;
					const skipped = Number(result.skipped_count ?? result.skipped ?? 0) || 0;
					
					const errMsg = this.parseGroupImportErrorMessage(result);
					let errors = [];
					if (Array.isArray(result.errors) && result.errors.length) {
						errors = result.errors.map((e) =>
							typeof e === 'string' ? e : (e && e.msg) || JSON.stringify(e)
						);
					}
					if (errMsg && !errors.includes(errMsg)) {
						errors.unshift(errMsg);
					}
					if (success === 0 && failed > 0 && errors.length === 0) {
						errors.push(`共 ${failed} 条记录导入失败`);
					}
					
					const codeNum = parseInt(String(result.code), 10);
					const badCode = !Number.isNaN(codeNum) && codeNum !== 200 && codeNum !== 0;
					const isFailure =
						badCode || (success === 0 && errors.length > 0) || (success === 0 && failed > 0);
					
					this.importProgress.percent = 100;
					this.importProgress.text = isFailure ? '导入失败' : '导入完成';
					this.importProgress.details = {
						success,
						failed: isFailure && failed === 0 ? Math.max(errors.length, 1) : failed,
						skipped
					};
					
					this.importResult = {
						show: true,
						total,
						success,
						failed: isFailure && failed === 0 && errors.length ? Math.max(errors.length, 1) : failed,
						skipped,
						errors,
						isFailure
					};
					
					if (isFailure) {
						uni.showToast({
							title: errors[0] ? (errors[0].length > 40 ? '导入失败，请查看下方说明' : errors[0]) : '导入失败',
							icon: 'none',
							duration: 3000
						});
					} else if (success > 0) {
						uni.showToast({
							title: `成功导入 ${success} 条`,
							icon: 'success'
						});
						setTimeout(() => {
							this.loadGroupList();
						}, 1000);
					}
				} catch (error) {
					console.error('导入失败:', error);
					const msg = error.message || '导入失败，请检查文件格式';
					uni.showToast({
						title: msg.length > 40 ? '导入失败，请查看下方说明' : msg,
						icon: 'none',
						duration: 3000
					});
					
					this.importProgress.percent = 100;
					this.importProgress.text = '导入失败';
					this.importProgress.details = { success: 0, failed: 1, skipped: 0 };
					this.importResult = {
						show: true,
						total: 0,
						success: 0,
						failed: 1,
						skipped: 0,
						errors: [msg],
						isFailure: true
					};
				}
				// 搜索逻辑已在computed中实现
			},
			editUserPermission(user) {
				this.permissionUser = {
					...user,
					role: this.resolveManagedUserType(user),
					backendUserId: this.resolveManagedUserBackendId(user)
				};
				this.selectedRoleIndex = -1;
				this.newBusinessId = '';
				this.showPermissionModal = true;
			},
			closePermissionModal() {
				this.showPermissionModal = false;
				this.showRoleDropdown = false;
			},
			toggleRoleDropdown() {
				this.showRoleDropdown = !this.showRoleDropdown;
			},
			selectRole(idx) {
				this.selectedRoleIndex = idx;
				this.showRoleDropdown = false;
			},
			onRolePickerChange(e) {
				this.selectedRoleIndex = e.detail.value;
			},
			async submitChangeRole() {
				if (this.selectedRoleIndex < 0) {
					uni.showToast({ title: '请选择目标角色', icon: 'none' });
					return;
				}
				if (!this.newBusinessId) {
					uni.showToast({ title: '请输入新工号/学号', icon: 'none' });
					return;
				}
				const newRole = this.availableRoles[this.selectedRoleIndex]?.value;
				if (!newRole) return;
				// 展示内嵌确认弹窗
				this.pendingNewRole = newRole;
				this.showChangeRoleConfirm = true;
			},
			async doChangeRole() {
				this.showChangeRoleConfirm = false;
				const newRole = this.pendingNewRole;
				uni.showLoading({ title: '转换中...' });
				try {
					const { changeUserRole } = await import('@/api/admin.js');
					await changeUserRole({
						new_business_id: this.newBusinessId,
						new_role: newRole,
						original_role: this.permissionUser.role,
						original_sub: this.permissionUser.sub
					});
					uni.hideLoading();
					uni.showToast({ title: '角色转换成功', icon: 'success' });
					this.showPermissionModal = false;
					await this.loadUserDirectory();
				} catch (err) {
					uni.hideLoading();
					uni.showToast({ title: err.message || '转换失败', icon: 'none' });
				}
			},
			confirmDeleteUser() {
				// 展示内嵌确认弹窗
				this.showDeleteUserConfirm = true;
			},
			async doDeleteUser() {
				this.showDeleteUserConfirm = false;
				const userType = this.resolveManagedUserType(this.permissionUser);
				const username = this.permissionUser?.id || this.permissionUser?.username;
				console.log('[删除用户调试] permissionUser:', JSON.stringify(this.permissionUser));
				console.log('[删除用户调试] 解析后的 userType:', userType);
				console.log('[删除用户调试] 用于查询的用户名/学号:', username);
				if (!username) {
					console.error('[删除用户调试] 错误: 无法获取用户名/学号');
					uni.showToast({ title: '缺少用户信息，无法删除', icon: 'none' });
					return;
				}
				if (!userType) {
					console.error('[删除用户调试] 错误: userType 为空');
					uni.showToast({ title: '无法识别用户类型，删除失败', icon: 'none' });
					return;
				}
				uni.showLoading({ title: '删除中...' });
				try {
					const { getUserSubAuto, deleteUser } = await import('@/api/admin.js');
					console.log('[删除用户调试] 步骤1: 调用 getUserSubAuto 获取真实 sub, username:', username);
					const subResult = await getUserSubAuto(username);
					console.log('[删除用户调试] getUserSubAuto 返回:', JSON.stringify(subResult));
					let realSub = null;
					if (subResult && typeof subResult === 'object') {
						const data = subResult.data ?? subResult;
						realSub = data?.sub ?? data?.id ?? data?.user_id ?? null;
						console.log('[删除用户调试] 提取的数据对象:', JSON.stringify(data));
					}
					if (!realSub) {
						console.error('[删除用户调试] 错误: 无法从 getUserSubAuto 获取 sub');
						throw new Error('无法获取用户真实ID，删除失败');
					}
					console.log('[删除用户调试] 步骤2: 获取到真实 sub:', realSub);
					console.log('[删除用户调试] 步骤3: 调用 deleteUser:', { realSub, userType });
					const result = await deleteUser(realSub, userType);
					console.log('[删除用户调试] deleteUser 返回结果:', JSON.stringify(result));
					this.ensureActionSucceeded(result, '删除失败');
					uni.hideLoading();
					uni.showToast({ title: '用户已删除', icon: 'success' });
					this.showPermissionModal = false;
					await this.loadUserDirectory();
				} catch (err) {
					uni.hideLoading();
					console.error('[删除用户调试] 异常捕获:', err);
					uni.showToast({ title: err.message || '删除失败', icon: 'none' });
				}
			},
			async resetUserPassword(user) {
				uni.showModal({
					title: '确认重置',
					content: `确定要将用户"${user.name}"的密码重置为 123456 吗？`,
					success: async (res) => {
						if (res.confirm) {
							try {
								const { resetUserPassword: doReset } = await import('@/api/admin.js');
								// user_type：教师传 'teacher'，学生传 'student'
								const userType = user.role === 'teacher' ? 'teacher' : 'student';
								// user_id 使用用户的数字ID（sub）
								const userId = user.sub || null;
								await doReset(userId, userType);
								uni.showToast({
									title: '密码已重置为 123456',
									icon: 'success',
									duration: 2000
								});
							} catch (err) {
								console.error('重置密码失败:', err);
								uni.showToast({
									title: '重置失败，请稍后重试',
									icon: 'none'
								});
							}
						}
					}
				});
			},
			buildCurrentUserFromAdmin(adminInfo) {
				return {
					sub: String(adminInfo.id),
					roles: adminInfo.roles || ['admin'],
					username: String(adminInfo.username || 'admin')
				};
			},
			formatGroupRelationDate(raw) {
				if (raw == null || raw === '') return '—';
				const s = String(raw);
				if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
					return s.replace('T', ' ').replace(/\.\d+Z?$/, '').slice(0, 19);
				}
				return s;
			},
			normalizeGroupMembersResponse(res) {
				const body = res && (res.data !== undefined ? res.data : res);
				if (!body) return [];
				const list = body.members || body.items;
				return Array.isArray(list) ? list : [];
			},
			groupRelationsGoPrev() {
				this.groupRelationsPage = Math.max(1, this.groupRelationsEffectivePage - 1);
			},
			groupRelationsGoNext() {
				this.groupRelationsPage = Math.min(
					this.groupRelationsTotalPages,
					this.groupRelationsEffectivePage + 1
				);
			},
			async loadGroupRelationsFlat() {
				if (this.loadingGroupRelations) return;
				this.loadingGroupRelations = true;
				try {
					if (!this.groups || this.groups.length === 0) {
						await this.loadGroupList(null);
					}
					const groups = this.groups || [];
					if (!groups.length) {
						this.groupRelationsAllRows = [];
						return;
					}
					const adminInfo = await this.getOrCreateAdmin();
					const currentUser = this.buildCurrentUserFromAdmin(adminInfo);
					const { getGroupMembers } = await import('@/api/admin.js');
					const rows = [];
					const chunkSize = 6;
					for (let i = 0; i < groups.length; i += chunkSize) {
						const chunk = groups.slice(i, i + chunkSize);
						await Promise.all(
							chunk.map(async (g) => {
								const groupPathId = String(
									g.code != null && g.code !== '' ? g.code : g.id
								);
							const gname = g.name || '—';
								const gcode = String(g.code != null && g.code !== '' ? g.code : g.id ?? '—');
								const gCreated = this.formatGroupRelationDate(g.created_at);
								try {
									// 使用 member_type=all 一次性获取所有成员
									const res = await getGroupMembers(
										groupPathId,
										{ member_type: 'all' },
										currentUser
									);
									const members = this.normalizeGroupMembersResponse(res);
									for (const m of members) {
										// 根据 member_type 判断角色
										const member_type = m.member_type || 'student';
										const roleLabel = member_type === 'teacher' ? '教师' : (member_type === 'admin' ? '管理员' : '学生');
										// 获取对应角色的ID作为业务ID显示
										let bizId = '';
										if (member_type === 'teacher' && m.teacher_id) {
											bizId = String(m.teacher_id);
										} else if (member_type === 'student' && m.student_id) {
											bizId = String(m.student_id);
										} else if (member_type === 'admin' && m.admin_id) {
											bizId = String(m.admin_id);
										} else {
											// 兜底：使用其他可用字段
											bizId = String(m.member_id ?? m.account_id ?? m.user_id ?? m.username ?? '');
										}
										// 移除成员时使用的ID
										const removeId = m.member_id ?? m.account_id ?? m.user_id ?? m.student_id ?? m.teacher_id ?? m.admin_id;
										const nm = String(m.name ?? m.full_name ?? m.username ?? '—').trim();
										rows.push({
											_key: `${groupPathId}_${member_type}_${bizId || nm}_${rows.length}`,
											groupPathId,
											groupName: gname,
											groupCode: gcode,
											groupCreatedAt: gCreated,
											memberName: nm || '—',
											memberBizId: bizId || '—',
											roleLabel,
											member_type,
											removeMemberId:
												removeId != null && removeId !== '' ? String(removeId) : ''
										});
									}
								} catch (e) {
									console.error('群组关系：加载成员失败', groupPathId, e);
								}
							})
						);
					}
					this.groupRelationsAllRows = rows;
					this.groupRelationsPage = 1;
				} catch (e) {
					console.error('加载群组关系失败:', e);
					uni.showToast({
						title: e?.message || '加载失败',
						icon: 'none'
					});
				} finally {
					this.loadingGroupRelations = false;
				}
			},
			confirmRemoveMemberFromGroup(row) {
				if (!row || !row.removeMemberId) {
					uni.showToast({ title: '无法解析成员编号，无法移出', icon: 'none' });
					return;
				}
				uni.showModal({
					title: '移出群组',
					content: `将「${row.memberName}」从群组「${row.groupName}」中移除？仅解除归属关系，不会删除该用户账号。`,
					success: async (res) => {
						if (!res.confirm) return;
						try {
							uni.showLoading({ title: '处理中...' });
							const adminInfo = await this.getOrCreateAdmin();
							const currentUser = this.buildCurrentUserFromAdmin(adminInfo);
							const { removeGroupMember } = await import('@/api/admin.js');
							const result = await removeGroupMember(row.groupPathId, {
								current_user: currentUser,
								member_type: row.member_type,
								member_id: row.removeMemberId
							});
							uni.hideLoading();
							const ok =
								result &&
								(result.code === 200 ||
									result.code === 0 ||
									result.success === true ||
									result.message === 'success' ||
									result.message === '成员删除成功' ||
									result.data ||
									(typeof result === 'object' && !result.error));
							if (ok) {
								uni.showToast({ title: '已移出群组', icon: 'success' });
								await this.loadGroupRelationsFlat();
								this.loadGroupList(null);
							} else {
								uni.showToast({
									title: result?.message || result?.detail || '操作失败',
									icon: 'none'
								});
							}
						} catch (err) {
							uni.hideLoading();
							console.error('移出群组失败:', err);
							uni.showToast({
								title: err?.message || '操作失败',
								icon: 'none'
							});
						}
					}
				});
			},
			/** 从群组列表接口返回中解析列表数组 */
			normalizeGroupListItems(result) {
				if (!result) return [];
				if (Array.isArray(result)) return result;
				const d = result.data;
				if (Array.isArray(d)) return d;
				if (d && Array.isArray(d.items)) return d.items;
				return result.items || result.groups || result.list || [];
			},
			/** keyword 搜索结果中选定唯一群组（优先名称全匹配） */
			pickGroupFromKeywordList(list, keyword) {
				const q = (keyword || '').trim().toLowerCase();
				const rows = (list || [])
					.map((item) => ({
						item,
						id: item.group_id ?? item.id ?? item.code,
						name: (item.group_name || item.name || '').trim()
					}))
					.filter((x) => x.id != null && x.id !== '');
				if (rows.length === 0) return { error: 'notfound' };
				const exact = rows.filter((x) => x.name.toLowerCase() === q);
				if (exact.length === 1) return { group: exact[0].item };
				if (exact.length > 1) return { error: 'ambiguous', count: exact.length };
				if (rows.length === 1) return { group: rows[0].item };
				return { error: 'ambiguous', count: rows.length };
			},
			teacherIdFromMemberRecord(m) {
				if (!m) return '';
				const v = m.member_id ?? m.account_id;
				return v != null && v !== '' ? String(v) : '';
			},
			/**
			 * 批量下载：① GET /groups/?keyword ② GET /groups/{id}/members?member_type=teacher ③ GET /groups/papers
			 */
			async resolveBatchDownloadContextByApis() {
				const keyword = (this.batchDownloadGroupName || '').trim();
				if (!keyword) return { ok: false, reason: 'empty' };
				const adminInfo = await this.getOrCreateAdmin();
				const currentUser = this.buildCurrentUserFromAdmin(adminInfo);
				const { getGroupList, getGroupMembers } = await import('@/api/admin.js');
				const listRes = await getGroupList(
					{ page: 1, page_size: 100, keyword },
					currentUser
				);
				const rawList = this.normalizeGroupListItems(listRes);
				const picked = this.pickGroupFromKeywordList(rawList, keyword);
				if (picked.error === 'notfound') return { ok: false, reason: 'notfound' };
				if (picked.error === 'ambiguous') {
					return { ok: false, reason: 'ambiguous', count: picked.count };
				}
				const g = picked.group;
				const groupId = String(g.group_id ?? g.id ?? g.code);
				const resolvedName = (g.group_name || g.name || keyword).trim();
				const memRes = await getGroupMembers(
					groupId,
					{ member_type: 'teacher' },
					currentUser
				);
				const members = memRes?.members || memRes?.items || [];
				if (!members.length) {
					return { ok: false, reason: 'no_teacher', message: '该群暂无教师成员' };
				}
				const teacherId = this.teacherIdFromMemberRecord(members[0]);
				if (!teacherId) {
					return { ok: false, reason: 'no_teacher_id', message: '无法解析教师 ID' };
				}
				return {
					ok: true,
					groupId,
					teacherId,
					name: resolvedName
				};
			},
			async previewBatchDownloadByGroupName() {
				try {
					uni.showLoading({ title: '查询群组与论文…' });
					const r = await this.resolveBatchDownloadContextByApis();
					uni.hideLoading();
					if (!r.ok && r.reason === 'empty') {
						uni.showToast({ title: '请输入群组名称或编号', icon: 'none' });
						this._clearBatchDownloadPreview();
						return;
					}
					if (!r.ok && r.reason === 'notfound') {
						uni.showToast({ title: '未找到匹配的群组', icon: 'none' });
						this._clearBatchDownloadPreview();
						return;
					}
					if (!r.ok && r.reason === 'ambiguous') {
						uni.showToast({
							title: `找到 ${r.count} 个候选群组，请输入更精确的编号或名称`,
							icon: 'none'
						});
						this._clearBatchDownloadPreview();
						return;
					}
					if (!r.ok) {
						uni.showToast({ title: r.message || '解析失败', icon: 'none' });
						this._clearBatchDownloadPreview();
						return;
					}
					this.batchDownloadTeacherId = r.teacherId;
					this.selectedGroup = { name: r.name, value: r.groupId };
					this.selectedGroupName = r.name;
					await this.loadGroupPapersCount();
				} catch (e) {
					uni.hideLoading();
					console.error('批量下载预览失败:', e);
					uni.showToast({ title: e?.message || '查询失败', icon: 'none' });
					this._clearBatchDownloadPreview();
				}
			},
			_clearBatchDownloadPreview() {
				this.batchDownloadTeacherId = '';
				this.selectedGroup = null;
				this.selectedGroupName = '';
				this.downloadCount = 0;
				this.downloadSize = 0;
			},
			onStatusSelect(e) {
				const index = e.detail.value;
				this.selectedStatus = this.statusOptions[index].value;
				this.selectedStatusLabel = this.statusOptions[index].label;
			},
			onFormatSelect(e) {
				this.selectedFormat = this.formatOptions[e.detail.value];
			},
			onDownloadOptionChange(e) {
				const values = e.detail.value;
				this.downloadOptions.zip = values.includes('zip');
				this.downloadOptions.includeHistory = values.includes('include_history');
			},
			async loadGroupPapersCount() {
				if (!this.selectedGroup) return;
				try {
					const adminInfo = await this.getOrCreateAdmin();
					const { getGroupPapersList } = await import('@/api/admin.js');
					const teacherId =
						this.batchDownloadTeacherId != null && this.batchDownloadTeacherId !== ''
							? this.batchDownloadTeacherId
							: null;
					const result = await getGroupPapersList(
						this.selectedGroup.value,
						adminInfo,
						teacherId
					);
					const papers = result?.papers || result?.data?.papers || [];
					this.downloadCount = papers.length;
					// 计算总大小：累加每篇论文的 size
					const totalBytes = papers.reduce((sum, p) => sum + (p.size || 0), 0);
					this.downloadSize = totalBytes;
					console.log('论文列表:', papers, '总大小:', totalBytes);
				} catch (err) {
					console.warn('获取论文数量失败:', err);
					this.downloadCount = 0;
					this.downloadSize = 0;
				}
			},
			async startDownload() {
				let groupId;
				let displayName;
				try {
					uni.showLoading({ title: '解析群组…' });
					const r = await this.resolveBatchDownloadContextByApis();
					uni.hideLoading();
					if (!r.ok && r.reason === 'empty') {
						uni.showToast({ title: '请输入群组名称或编号', icon: 'none' });
						return;
					}
					if (!r.ok && r.reason === 'notfound') {
						uni.showToast({ title: '未找到匹配的群组', icon: 'none' });
						return;
					}
					if (!r.ok && r.reason === 'ambiguous') {
						uni.showToast({
							title: `找到 ${r.count} 个候选群组，请缩小范围后重试`,
							icon: 'none'
						});
						return;
					}
					if (!r.ok) {
						uni.showToast({ title: r.message || '无法获取群组或教师信息', icon: 'none' });
						return;
					}
					this.batchDownloadTeacherId = r.teacherId;
					this.selectedGroup = { name: r.name, value: r.groupId };
					this.selectedGroupName = r.name;
					groupId = r.groupId;
					displayName = r.name;
				} catch (e) {
					uni.hideLoading();
					uni.showToast({ title: e?.message || '解析失败', icon: 'none' });
					return;
				}
				if (!this.selectedFormat) {
					// 文件格式已固定为 docx，无需校验
				}
				
				try {
					const adminInfo = await this.getOrCreateAdmin();
					const { batchDownloadGroupPapers, downloadSelectedPapers } = await import('@/api/admin.js');
					
					const fileName = `${displayName}_论文批量下载_${new Date().toLocaleDateString()}.zip`;
					
					// 先弹出保存对话框（必须在用户交互上下文中）
					let fileHandle = null;
					if (window.showSaveFilePicker) {
						try {
							fileHandle = await window.showSaveFilePicker({
								suggestedName: fileName,
								types: [{ description: 'ZIP 文件', accept: { 'application/zip': ['.zip'] } }]
							});
						} catch (pickerErr) {
							if (pickerErr.name === 'AbortError') return;
						}
					}
					
					uni.showLoading({ title: '获取论文列表...' });
					
					// 第一步：获取该群组全部论文ID列表
					const listResult = await batchDownloadGroupPapers(groupId, 'zip', adminInfo);
					
					// listResult 是 JSON （包含 papers 数组）
					let papersData = null;
					if (listResult instanceof ArrayBuffer) {
						// 如果返回的是 ArrayBuffer，尝试解析为 JSON
						try {
							const text = new TextDecoder().decode(listResult);
							papersData = JSON.parse(text);
						} catch (e) {
							console.log('返回的是二进制文件，直接使用');
							papersData = null;
						}
					} else {
						papersData = listResult;
					}
					
					const papers = papersData?.papers || papersData?.data?.papers || [];
					if (papers.length === 0) {
						uni.hideLoading();
						uni.showToast({ title: '该群组暂无论文', icon: 'none' });
						return;
					}
					
					// 提取所有 paper_id，逗号拼接
					const paperIds = papers.map(p => p.paper_id || p.id).filter(Boolean).join(',');
					console.log('准备下载论文 paper_ids:', paperIds);
					
					uni.showLoading({ title: `下载中... (${papers.length}篇论文)` });
					
					// 第二步：调用 /download/selected 真正下载文件
					const response = await downloadSelectedPapers(paperIds, adminInfo);
					
					// 将 arraybuffer 转为 Blob
					const blob = new Blob([response], { type: 'application/zip' });
					
					if (fileHandle) {
						const writable = await fileHandle.createWritable();
						await writable.write(blob);
						await writable.close();
					} else {
						const downloadUrl = URL.createObjectURL(blob);
						const link = document.createElement('a');
						link.href = downloadUrl;
						link.download = fileName;
						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);
						URL.revokeObjectURL(downloadUrl);
					}
					
					uni.hideLoading();
					uni.showToast({ title: '下载成功', icon: 'success' });
				} catch (error) {
					uni.hideLoading();
					console.error('批量下载失败:', error);
					uni.showToast({ title: error.message || '下载失败', icon: 'none' });
				}
			},
			onActionTypeSelect(e) {
				const index = e.detail.value;
				this.selectedActionType = this.actionTypeOptions[index].value;
				this.selectedActionTypeLabel = this.actionTypeOptions[index].label;
			},
			onRoleSelect(e) {
				const index = e.detail.value;
				this.selectedRole = this.roleOptions[index].value;
				this.selectedRoleLabel = this.roleOptions[index].label;
			},
			onStartDateChange(e) {
				this.startDate = e.detail.value;
			},
			onEndDateChange(e) {
				this.endDate = e.detail.value;
			},
			async searchAuditLogs() {
				try {
					uni.showLoading({ title: '加载中...' });
					
					const { getAuditLogs } = await import('@/api/admin.js');
					
					// 构建查询参数
					const params = {
						page: this.currentPage,
						page_size: 10
					};
					
					// 添加筛选条件
					if (this.selectedActionType && this.selectedActionType !== 'all') {
						params.action_type = this.selectedActionType;
					}
					if (this.selectedRole && this.selectedRole !== 'all') {
						params.user_role = this.selectedRole;
					}
					if (this.startDate) {
						params.start_date = this.startDate;
					}
					if (this.endDate) {
						params.end_date = this.endDate;
					}
					
					const result = await getAuditLogs(params);
					
					// 处理响应数据
					if (result && result.code === 200 && result.data) {
						this.auditLogs = result.data.logs || [];
						this.totalPages = result.data.total_pages || 1;
					} else if (Array.isArray(result)) {
						// 直接返回数组的情况
						this.auditLogs = result;
						this.totalPages = 1;
					} else {
						this.auditLogs = [];
						this.totalPages = 1;
					}
					
					uni.hideLoading();
					
					if (this.auditLogs.length === 0) {
						uni.showToast({
							title: '暂无数据',
							icon: 'none'
						});
					}
				} catch (error) {
					uni.hideLoading();
					console.error('获取审计日志失败:', error);
					uni.showToast({
						title: error.message || '获取日志失败',
						icon: 'none'
					});
					// 使用模拟数据作为降级
					this.loadMockAuditLogs();
				}
			},
			
			// 加载模拟审计日志数据（降级方案）
			loadMockAuditLogs() {
				this.auditLogs = [
					{
						userName: '张三',
						userRole: 'student',
						actionType: 'upload',
						actionDetail: '上传论文：基于深度学习的图像识别研究',
						actionTime: '2024-01-15 10:30:25',
						ipAddress: '192.168.1.100',
						device: 'Windows Chrome'
					},
					{
						userName: '张教授',
						userRole: 'teacher',
						actionType: 'annotation',
						actionDetail: '为学生张三的论文添加批注',
						actionTime: '2024-01-15 11:20:15',
						ipAddress: '192.168.1.101',
						device: 'Windows Chrome'
					}
				];
				this.totalPages = 1;
			},
			getActionTypeText(type) {
				const typeMap = {
					'login': '登录',
					'upload': '上传',
					'download': '下载',
					'annotation': '批注',
					'finalize': '定稿'
				};
				return typeMap[type] || type;
			},
			prevPage() {
				if (this.currentPage > 1) {
					this.currentPage--;
					this.searchAuditLogs();
				}
			},
			nextPage() {
				if (this.currentPage < this.totalPages) {
					this.currentPage++;
					this.searchAuditLogs();
				}
			},
			// 批量导入后，模拟向当前群组追加部分师生数据
			appendMockUsersAfterImport() {
				if (!this.selectedGroup) return;
				
				const targetGroup = this.groups.find(g => g.id === this.selectedGroup);
				const groupName = this.selectedGroupName || (targetGroup && targetGroup.name) || '新导入群组';
				
				// 追加两个示例用户
				const newUsers = [
					{
						id: 'T' + Date.now().toString().slice(-3),
						name: '新导入教师',
						role: 'teacher',
						groupName
					},
					{
						id: Date.now().toString().slice(-6),
						name: '新导入学生',
						role: 'student',
						groupName
					}
				];
				
				this.users = this.users.concat(newUsers);
				
				// 同步更新群组统计
				if (targetGroup) {
					targetGroup.teacherCount += 1;
					targetGroup.studentCount += 1;
					targetGroup.paperCount += 1;
				}
			},
			// 公告管理相关
			// 从后端加载通知列表
			/** 是否为后端 user_messages.id（排除曾用 Date.now() 占位导致编辑 404） */
			isLikelyServerMessageId(id) {
				const n = parseInt(String(id), 10);
				if (!Number.isFinite(n) || n <= 0) return false;
				// 毫秒时间戳多为 13 位，远大于正常自增主键，视为无效占位
				if (n > 1000000000000) return false;
				return true;
			},
			/** 后端 user_messages.status 为 retracted / revoked 等时视为已撤回（用于展示角标） */
			isNoticeRetractedStatus(status) {
				if (status == null || status === '') return false;
				const s = String(status).trim().toLowerCase();
				return s === 'retracted' || s === 'revoked' || s === 'revoke';
			},
			/** 用于分类的接收者标识：优先学号/用户 ID，否则用户名/工号 */
			noticeRecipientIdString(item) {
				const uid = item.target_user_id;
				if (uid != null && String(uid).trim() !== '') return String(uid).trim();
				const un = item.username;
				if (un != null && String(un).trim() !== '') return String(un).trim();
				return '';
			},
			/** 纯数字 → 学生；含字母等 → 教师；无 ID 时沿用后端 target_type（群发等） */
			noticeAudienceIsTeacherById(item) {
				const idStr = this.noticeRecipientIdString(item);
				if (!idStr) return (item.target_type || 'student') === 'teacher';
				return !/^\d+$/.test(idStr);
			},
			noticeCenterVisual(item) {
				if (this.isNoticeRetractedStatus(item.status)) {
					return { mod: 'draft', icon: 'history_edu' };
				}
				if (item.urgent) {
					return { mod: 'urgent', icon: 'error' };
				}
				return { mod: 'published', icon: 'check_circle' };
			},
			noticeCenterAudienceLabel(item) {
				const isT = this.noticeAudienceIsTeacherById(item);
				const role = isT ? '教师' : '学生';
				if (item.username) return `${role} · ${item.username}`;
				if (item.target_user_id != null && item.target_user_id !== '') {
					return `${role} · ID ${item.target_user_id}`;
				}
				return role;
			},
			
			async loadNoticesFromBackend(options = {}) {
				const silent = options.silent === true;
				try {
					if (!silent) {
						uni.showLoading({ title: '加载中...' });
					}
					
					// 获取管理员信息
					const adminInfo = await this.getOrCreateAdmin();
					
					// 调用后端接口查询通知
					const { queryNotifications } = await import('@/api/admin.js');
					const res = await queryNotifications({
						page: 1,
						page_size: 50
					}, adminInfo.id);
					
					console.log('公告列表响应:', res);
					
					// 处理两种响应格式：uni.request格式或直接数据格式
					let responseData = res;
					if (res.statusCode === 200 && res.data) {
						responseData = res.data;
					}
					
					// 适配后端返回的数据格式（id 与 PUT /notifications/{id} 一致）
					if (responseData.items && Array.isArray(responseData.items)) {
						this.adminNotices = responseData.items
							.map(item => {
								const rawId = item.id ?? item.notification_id ?? item.message_id;
								const numId = parseInt(String(rawId), 10);
								const id = Number.isFinite(numId) && numId > 0 ? numId : null;
								return {
									id,
									title: item.title,
									content: item.content,
									target_type: item.target_type || 'student',
									target_user_id: item.target_user_id ?? item.user_id,
									time: item.received_time || item.operation_time,
									create_time: item.received_time || item.operation_time,
									status: item.status,
									username: item.username ?? item.target_username
								};
							})
							.filter((row) => row.id != null);
						// 同时保存到本地存储
						this.saveNoticesToStorage();
						console.log('加载公告成功:', this.adminNotices.length, '条');
					} else {
						console.warn('从后端加载通知失败: 响应格式不正确', responseData);
						// 失败后从本地存储加载
						this.loadNoticesFromStorage();
					}
				} catch (err) {
					console.error('加载通知列表失败:', err);
					// 失败后从本地存储加载
					this.loadNoticesFromStorage();
				} finally {
					if (!silent) {
						uni.hideLoading();
					}
				}
			},
			
			loadNoticesFromStorage() {
				try {
					const list = uni.getStorageSync('systemNotices');
					if (Array.isArray(list)) {
						this.adminNotices = list.filter((item) =>
							this.isLikelyServerMessageId(item?.id)
						);
					}
				} catch (e) {
					console.error('加载公告失败:', e);
				}
			},
			saveNoticesToStorage() {
				try {
					uni.setStorageSync('systemNotices', this.adminNotices);
				} catch (e) {
					console.error('保存公告失败:', e);
				}
			},
			startCreateNotice() {
				this.editingNoticeIndex = -1;
				this.editingNoticeId = null;
				this.noticeForm = {
					send_to: 'individual',
					group_id: '',
					recipient_types: 'both',
					student_ids_raw: '',
					teacher_ids_raw: '',
					target_user_id: '',
					title: '',
					content: '',
					target_type: 'student'
				};
				this.resetNoticeGroupSearchForNotice();
				if (!this.groups || this.groups.length === 0) {
					this.loadGroupList();
				}
				this.showNoticeForm = true;
			},
			editNotice(index) {
				const item = this.adminNotices[index];
				if (!item) return;
				if (!this.isLikelyServerMessageId(item.id)) {
					uni.showToast({
						title: '该公告无有效编号，请等待列表刷新后重试',
						icon: 'none'
					});
					this.loadNoticesFromBackend();
					return;
				}
				this.editingNoticeIndex = index;
				this.editingNoticeId = item.id;
				this.noticeForm = {
					send_to: 'individual',
					group_id: '',
					recipient_types: 'both',
					student_ids_raw: '',
					teacher_ids_raw: '',
					target_user_id: item.target_user_id || '',
					title: item.title,
					content: item.content,
					target_type: item.target_type || 'student'
				};
				this.resetNoticeGroupSearchForNotice();
				this.showNoticeForm = true;
			},
			async deleteNotice(index) {
				const item = this.adminNotices[index];
				if (!item) return;
				if (!this.isLikelyServerMessageId(item.id)) {
					uni.showToast({ title: '无法删除：公告编号无效，请刷新列表', icon: 'none' });
					this.loadNoticesFromBackend();
					return;
				}
				
				uni.showModal({
					title: '确认删除',
					content: '确定要删除这条公告吗？删除后将从数据库移除，不可恢复。',
					success: async (res) => {
						if (res.confirm) {
							uni.showLoading({ title: '删除中...' });
							
							try {
								const adminInfo = await this.getOrCreateAdmin();
								const subNum = parseInt(String(adminInfo.id), 10);
								const currentUser = {
									sub: Number.isFinite(subNum) ? subNum : adminInfo.id,
									roles: adminInfo.roles || ['admin'],
									username: String(adminInfo.username || 'admin')
								};
								const { deleteNotification } = await import('@/api/admin.js');
								const result = await deleteNotification(item.id, currentUser);
								
								if (result && typeof result.code === 'number' && result.code >= 400) {
									throw new Error(result.message || '删除失败');
								}
								
								this.adminNotices.splice(index, 1);
								this.saveNoticesToStorage();
								uni.showToast({ title: '已删除', icon: 'success' });
							} catch (err) {
								console.error('删除公告失败:', err);
								uni.showToast({
									title: err.message || '删除失败',
									icon: 'none'
								});
							} finally {
								uni.hideLoading();
							}
						}
					}
				});
			},
			cancelNoticeEdit() {
				this.showNoticeForm = false;
				this.editingNoticeIndex = -1;
				this.editingNoticeId = null;
				this.resetNoticeGroupSearchForNotice();
			},
			onNoticeSendToChange(e) {
				const prev = this.noticeForm.send_to;
				const v = e.detail.value || 'individual';
				if (prev !== v && (prev === 'group' || v === 'group')) {
					this.resetNoticeGroupSearchForNotice();
				}
				this.noticeForm.send_to = v;
			},
			onNoticeRecipientTypesChange(e) {
				this.noticeForm.recipient_types = e.detail.value || 'both';
			},
			resetNoticeGroupSearchForNotice() {
				this.noticeGroupSearchQuery = '';
				this.noticeGroupSearchResults = [];
				this.noticeGroupSearchStatus = 'idle';
				if (this.noticeForm) {
					this.noticeForm.group_id = '';
				}
			},
			onNoticeGroupQueryInput() {
				if (this.noticeGroupSearchStatus === 'confirmed') {
					this.noticeGroupSearchStatus = 'idle';
					this.noticeForm.group_id = '';
					this.noticeGroupSearchResults = [];
				}
			},
			runNoticeGroupSearch() {
				const q = (this.noticeGroupSearchQuery || '').trim();
				if (!q) {
					uni.showToast({ title: '请输入关键词', icon: 'none' });
					return;
				}
				if (!this.groups || !this.groups.length) {
					uni.showToast({ title: '暂无群组，请先到群组管理同步', icon: 'none' });
					return;
				}
				const lower = q.toLowerCase();
				const results = this.groups.filter((g) => {
					const name = String(g.name || '').toLowerCase();
					const code = String(g.code ?? '').toLowerCase();
					const idStr = String(g.id ?? '');
					return name.includes(lower) || code.includes(lower) || idStr.includes(q);
				});
				this.noticeGroupSearchResults = results;
				if (results.length === 0) this.noticeGroupSearchStatus = 'none';
				else if (results.length === 1) this.noticeGroupSearchStatus = 'single';
				else this.noticeGroupSearchStatus = 'multiple';
			},
			confirmNoticeGroupPick(g) {
				if (!g) return;
				this.noticeForm.group_id = g.id;
				this.noticeGroupSearchQuery = `${g.name}（${g.code}）`;
				this.noticeGroupSearchStatus = 'confirmed';
				this.noticeGroupSearchResults = [];
			},
			parseNoticeIdRaw(raw) {
				return String(raw || '')
					.split(/[,，]/)
					.map((s) => s.trim())
					.filter(Boolean);
			},
			async saveNotice() {
				if (this.editingNoticeId == null) {
					const sendTo = this.noticeForm.send_to || 'individual';
					if (sendTo === 'all' || sendTo === 'group') {
						const rt = this.noticeForm.recipient_types;
						if (!rt || !['students', 'teachers', 'both'].includes(rt)) {
							uni.showToast({ title: '请选择接收身份', icon: 'none' });
							return;
						}
					}
					if (sendTo === 'group') {
						if (!this.groups || !this.groups.length) {
							uni.showToast({ title: '暂无群组，请先在群组管理同步', icon: 'none' });
							return;
						}
						if (this.noticeGroupSearchStatus !== 'confirmed') {
							uni.showToast({ title: '请搜索并在结果中确认群组', icon: 'none' });
							return;
						}
						const gid = this.noticeForm.group_id;
						if (gid == null || String(gid).trim() === '') {
							uni.showToast({ title: '请选择群组', icon: 'none' });
							return;
						}
						const inList = (this.groups || []).some((g) => String(g.id) === String(gid));
						if (!inList) {
							uni.showToast({ title: '所选群组不在当前列表，请重新搜索', icon: 'none' });
							return;
						}
					}
					if (sendTo === 'individual') {
						const sids = this.parseNoticeIdRaw(this.noticeForm.student_ids_raw);
						const tids = this.parseNoticeIdRaw(this.noticeForm.teacher_ids_raw);
						if (!sids.length && !tids.length) {
							uni.showToast({ title: '请填写学号或工号', icon: 'none' });
							return;
						}
					}
				}
				
				if (!this.noticeForm.title) {
					uni.showToast({
						title: '请填写公告标题',
						icon: 'none'
					});
					return;
				}
				
				if (!this.noticeForm.content) {
					uni.showToast({
						title: '请填写公告内容',
						icon: 'none'
					});
					return;
				}
				if (this.noticeTitleLen > this.noticeTitleMaxLen) {
					uni.showToast({ title: `标题请控制在${this.noticeTitleMaxLen}字以内`, icon: 'none' });
					return;
				}
				if (this.noticeContentLen > this.noticeContentMaxLen) {
					uni.showToast({ title: `正文请控制在${this.noticeContentMaxLen}字以内`, icon: 'none' });
					return;
				}
				
				uni.showLoading({ title: this.editingNoticeIndex > -1 ? '更新中...' : '发布中...' });
				
				try {
					// 获取管理员信息
					const adminInfo = await this.getOrCreateAdmin();
					
					const isEditing =
						this.editingNoticeIndex > -1 &&
						this.editingNoticeId != null &&
						this.editingNoticeId !== '';
					
					if (isEditing) {
						if (!this.isLikelyServerMessageId(this.editingNoticeId)) {
							uni.showToast({ title: '公告编号无效，请刷新列表后重试', icon: 'none' });
							await this.loadNoticesFromBackend({ silent: true });
							return;
						}
						const noticeId = parseInt(String(this.editingNoticeId), 10);
						// 编辑模式：调用更新接口
						const { updateNotification } = await import('@/api/admin.js');
						const updateData = {
							title: this.noticeForm.title,
							content: this.noticeForm.content
						};
						const res = await updateNotification(noticeId, updateData, adminInfo.id);
						
						console.log('公告更新接口响应:', res);
						
						const responseData = res.statusCode ? res.data : res;
						const isSuccess = res.statusCode === 200 || (res.message && res.message.includes('成功'));
						
						if (isSuccess) {
							uni.showToast({
								title: '公告更新成功',
								icon: 'success'
							});
							
							// 更新本地列表
							if (this.adminNotices[this.editingNoticeIndex]) {
								this.adminNotices[this.editingNoticeIndex].title = this.noticeForm.title;
								this.adminNotices[this.editingNoticeIndex].content = this.noticeForm.content;
								this.adminNotices[this.editingNoticeIndex].target_type = this.noticeForm.target_type;
							}
							this.saveNoticesToStorage();
							
							this.showNoticeForm = false;
							this.editingNoticeIndex = -1;
							this.editingNoticeId = null;
							this.noticeForm = {
								send_to: 'individual',
								group_id: '',
								recipient_types: 'both',
								student_ids_raw: '',
								teacher_ids_raw: '',
								target_user_id: '',
								title: '',
								content: '',
								target_type: 'student'
							};
							this.resetNoticeGroupSearchForNotice();
						} else {
							throw new Error(responseData?.message || '更新失败');
						}
					} else {
						const sendTo = this.noticeForm.send_to || 'individual';
						const noticeData = {
							title: this.noticeForm.title,
							content: this.noticeForm.content,
							send_to: sendTo,
							source: 'admin',
							create_time: new Date().toISOString()
						};
						if (sendTo === 'all' || sendTo === 'group') {
							noticeData.recipient_types = this.noticeForm.recipient_types;
						}
						if (sendTo === 'group') {
							noticeData.group_id = this.noticeForm.group_id;
						}
						if (sendTo === 'individual') {
							const sids = this.parseNoticeIdRaw(this.noticeForm.student_ids_raw);
							const tids = this.parseNoticeIdRaw(this.noticeForm.teacher_ids_raw);
							if (sids.length) noticeData.student_ids = sids.join(',');
							if (tids.length) noticeData.teacher_ids = tids.join(',');
						}
						
						const subNum = parseInt(String(adminInfo.id), 10);
						const currentUser = {
							sub: Number.isNaN(subNum) ? adminInfo.id : subNum,
							username: adminInfo.username || 'admin',
							roles: ['admin']
						};
						const { pushNotification } = await import('@/api/admin.js');
						const res = await pushNotification(noticeData, currentUser);
						
						console.log('公告发布接口响应:', res);
						
						const responseData = res.statusCode ? res.data : res;
						const isSuccess = res.statusCode === 200 || (res.message && res.message.includes('成功'));
						
						if (isSuccess && responseData) {
							uni.showToast({
								title: '公告发布成功',
								icon: 'success'
							});
							
							// 以服务端列表为准，避免用 Date.now() 占位导致编辑时报「通知不存在」
							await this.loadNoticesFromBackend({ silent: true });
							
							this.showNoticeForm = false;
							this.editingNoticeIndex = -1;
							this.noticeForm = {
								send_to: 'individual',
								group_id: '',
								recipient_types: 'both',
								student_ids_raw: '',
								teacher_ids_raw: '',
								target_user_id: '',
								title: '',
								content: '',
								target_type: 'student'
							};
							this.resetNoticeGroupSearchForNotice();
						} else {
							throw new Error(responseData?.message || '发布失败');
						}
					}
				} catch (err) {
					console.error(this.editingNoticeIndex > -1 ? '更新公告失败:' : '发布公告失败:', err);
					uni.showToast({
						title: err.message || (this.editingNoticeIndex > -1 ? '更新公告失败' : '发布公告失败'),
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},
			searchGroupsNormalizeItems(result) {
				return this.normalizeGroupListItems(result).map((item) => ({
					id: String(item.group_id ?? item.id ?? item.code ?? ''),
					name: String(item.group_name ?? item.name ?? '').trim(),
					code: String(item.group_id ?? item.code ?? item.id ?? ''),
					created_at: item.created_at || item.create_time || '',
					active: item.status !== 'inactive',
					teacherCount: item.teacher_count || 0,
					studentCount: item.student_count || 0,
					paperCount: item.paper_count || 0
				}));
			},
			// 查询群组：单输入框支持教师工号格式或群组名称；留空则加载全部
			async searchGroups() {
				const keyword = (this.groupSearchKeyword || '').trim();
				await this.loadGroupList({
					keyword: keyword || null
				});
			},
			
			// 加载群组成员统计信息
			async loadGroupMembersStats() {
				if (!this.groups || this.groups.length === 0) return;
				
				try {
					const adminInfo = await this.getOrCreateAdmin();
					const currentUser = {
						sub: String(adminInfo.id),
						roles: adminInfo.roles,
						username: String(adminInfo.username)
					};
					
					const { getGroupMembers } = await import('@/api/admin.js');
					
					// 并行获取所有群组的成员信息
					await Promise.all(this.groups.map(async (group, index) => {
						try {
							// 获取教师成员
							const teachersResult = await getGroupMembers(
								group.code || group.id,
								{ member_type: 'teacher' },
								currentUser
							);
							
							// 获取学生成员
							const studentsResult = await getGroupMembers(
								group.code || group.id,
								{ member_type: 'student' },
								currentUser
							);
							
							// 更新统计（支持 members 或 items 字段）
							const teacherCount = teachersResult.members?.length || teachersResult.items?.length || 0;
							const studentCount = studentsResult.members?.length || studentsResult.items?.length || 0;
							
							// 更新群组数据
							this.groups[index].teacherCount = teacherCount;
							this.groups[index].studentCount = studentCount;
							
							console.log(`群组 ${group.name} 统计更新: 教师${teacherCount}人, 学生${studentCount}人`);
						} catch (error) {
							console.error(`获取群组 ${group.name} 成员信息失败:`, error);
						}
					}));
					
					console.log('所有群组成员统计更新完成');
				} catch (error) {
					console.error('加载群组成员统计失败:', error);
				}
			},
			
			// 加载群组列表
			async loadGroupList(filters = {}) {
				console.log('开始加载群组列表...');
				const keyword = typeof filters === 'object' && filters !== null
					? ((filters.keyword || '').trim())
					: ((filters || '').trim ? (filters || '').trim() : '');
				const isTeacherIdSearch = /^\d+$/.test(keyword) || /^t\d+$/i.test(keyword);
				const teacherIdValue = /^t\d+$/i.test(keyword) ? keyword : String(keyword || '');
				try {
					uni.showLoading({ title: '加载中...' });
					
					const adminInfo = await this.getOrCreateAdmin();
					const currentUser = this.buildCurrentUserFromAdmin(adminInfo);
					const { getGroupList } = await import('@/api/admin.js');
					let groups = [];
					
					if (!keyword) {
						const result = await getGroupList({ page: 1, page_size: 100 }, currentUser);
						console.log('接口返回结果:', result);
						groups = this.searchGroupsNormalizeItems(result);
					} else if (isTeacherIdSearch) {
						const result = await getGroupList({ page: 1, page_size: 100, teacher_id: teacherIdValue }, currentUser);
						console.log('接口返回结果:', result);
						groups = this.searchGroupsNormalizeItems(result);
					} else {
						const result = await getGroupList({ page: 1, page_size: 100, keyword }, currentUser);
						console.log('接口返回结果:', result);
						groups = this.searchGroupsNormalizeItems(result);
					}
					
					this.groups = groups;
					this.groupOptions = this.groups.map((g) => ({
						name: g.name,
						value: g.id
					}));
					
					if (this.groups.length === 0) {
						let emptyText = '暂无群组数据';
						if (keyword) {
							emptyText = isTeacherIdSearch ? '该工号下暂无群组' : '未找到匹配的群组';
						}
						uni.showToast({
							title: emptyText,
							icon: 'none'
						});
					}
					
					this.loadGroupMembersStats();
				} catch (error) {
					console.error('加载群组列表失败:', error);
					this.groups = [];
					this.groupOptions = [];
					uni.showToast({
						title: error.message || '网络异常，请稍后重试',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},
		
		// ========== 院校信息维护方法 ==========
		// 显示录入学校弹窗
		showAddSchoolModal() {
			console.log('点击录入学校按钮');
			this.schoolForm = { name: '', province: '', city: '' };
			this.showSchoolModal = true;
			console.log('showSchoolModal设置为:', this.showSchoolModal);
		},
		
		// 关闭录入学校弹窗
		closeSchoolModal() {
			this.showSchoolModal = false;
		},
		
		// 提交录入学校
		async submitAddSchool() {
			if (!this.schoolForm.name.trim()) {
				uni.showToast({ title: '请输入学校名称', icon: 'none' });
				return;
			}
			
			uni.showLoading({ title: '提交中...' });
			try {
				const adminInfo = await this.getOrCreateAdmin();
				const { createSchool } = await import('@/api/admin.js');
				const res = await createSchool({
					school_name: this.schoolForm.name.trim(),
					province: this.schoolForm.province.trim() || undefined,
					city: this.schoolForm.city.trim() || undefined
				}, {
					sub: String(adminInfo.id),
					roles: ['admin'],
					username: String(adminInfo.username)
				});
				
				uni.hideLoading();
				if (res && (res.id || res.code === 200)) {
					uni.showToast({ title: '学校录入成功', icon: 'success' });
					this.closeSchoolModal();
				} else {
					throw new Error(res.message || '录入失败');
				}
			} catch (err) {
				uni.hideLoading();
				console.error('录入学校失败:', err);
				uni.showToast({ title: err.message || '录入失败', icon: 'none' });
			}
		},
		
		// 显示录入院系弹窗
		showAddDepartmentModal() {
			this.departmentForm = { name: '', schoolId: '' };
			this.showDepartmentModal = true;
		},
		
		// 关闭录入院系弹窗
		closeDepartmentModal() {
			this.showDepartmentModal = false;
		},
		
		// 提交录入院系
		async submitAddDepartment() {
			if (!this.departmentForm.name.trim()) {
				uni.showToast({ title: '请输入院系名称', icon: 'none' });
				return;
			}
			if (!this.departmentForm.schoolId.trim()) {
				uni.showToast({ title: '请输入学校ID', icon: 'none' });
				return;
			}
			
			uni.showLoading({ title: '提交中...' });
			try {
				const adminInfo = await this.getOrCreateAdmin();
				const { createDepartment } = await import('@/api/admin.js');
				const res = await createDepartment({
					department_name: this.departmentForm.name.trim(),
					school_id: parseInt(this.departmentForm.schoolId.trim())
				}, {
					sub: String(adminInfo.id),
					roles: ['admin'],
					username: String(adminInfo.username)
				});
				
				uni.hideLoading();
				if (res && (res.id || res.code === 200)) {
					uni.showToast({ title: '院系录入成功', icon: 'success' });
					this.closeDepartmentModal();
				} else {
					throw new Error(res.message || '录入失败');
				}
			} catch (err) {
				uni.hideLoading();
				console.error('录入院系失败:', err);
				uni.showToast({ title: err.message || '录入失败', icon: 'none' });
			}
		},
		
		// 显示查询学校ID弹窗
		openQuerySchoolModal() {
			this.querySchoolName = '';
			this.querySchoolResult = null;
			this.showQuerySchoolModal = true;
		},
		
		// 关闭查询学校ID弹窗
		closeQuerySchoolModal() {
			this.showQuerySchoolModal = false;
		},
		
		// 执行查询学校ID
		async executeQuerySchool() {
			if (!this.querySchoolName.trim()) {
				uni.showToast({ title: '请输入学校名称', icon: 'none' });
				return;
			}
			
			uni.showLoading({ title: '查询中...' });
			try {
				const { querySchoolId } = await import('@/api/admin.js');
				const res = await querySchoolId({ school_name: this.querySchoolName.trim() });
				
				uni.hideLoading();
				// 处理响应格式：{message: '查询成功', data: {school_id: 1, school_name: '清华大学'}}
				if (res && res.data && res.data.school_id) {
					this.querySchoolResult = { id: res.data.school_id, name: res.data.school_name || this.querySchoolName.trim() };
				} else if (res && res.school_id) {
					this.querySchoolResult = { id: res.school_id, name: this.querySchoolName.trim() };
				} else {
					this.querySchoolResult = { notFound: true };
				}
			} catch (err) {
				uni.hideLoading();
				console.error('查询学校ID失败:', err);
				uni.showToast({ title: '查询失败', icon: 'none' });
			}
		},
		
		// 显示查询院系ID弹窗
		openQueryDepartmentModal() {
			this.queryDepartmentSchoolId = '';
			this.queryDepartmentResult = [];
			this.showQueryDepartmentModal = true;
		},
		
		// 关闭查询院系ID弹窗
		closeQueryDepartmentModal() {
			this.showQueryDepartmentModal = false;
		},
		
		// 执行查询院系ID
		async executeQueryDepartment() {
			if (!this.queryDepartmentSchoolId.trim()) {
				uni.showToast({ title: '请输入学校ID', icon: 'none' });
				return;
			}
			
			uni.showLoading({ title: '查询中...' });
			try {
				const { queryDepartmentBySchool } = await import('@/api/admin.js');
				const res = await queryDepartmentBySchool({ school_id: parseInt(this.queryDepartmentSchoolId.trim()) });
				
				uni.hideLoading();
				// 处理响应格式：{code: 200, message: '查询成功', data: [{department_id: 1, department_name: '...', school_id: 1}]}
				if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
					this.queryDepartmentResult = res.data;
				} else if (res && Array.isArray(res) && res.length > 0) {
					this.queryDepartmentResult = res;
				} else if (res && res.departments && Array.isArray(res.departments)) {
					this.queryDepartmentResult = res.departments;
				} else {
					this.queryDepartmentResult = [];
				}
			} catch (err) {
				uni.hideLoading();
				console.error('查询院系ID失败:', err);
				uni.showToast({ title: '查询失败', icon: 'none' });
			}
		},
		
		// ========== 创建角色方法 ==========
		// 创建学生
		async submitCreateStudent() {
			const { username, password, phone, email, full_name } = this.studentForm;
			if (!username || !password || !full_name) {
				uni.showToast({ title: '请填写必填项：用户名、密码、姓名', icon: 'none' });
				return;
			}
			uni.showLoading({ title: '创建中...' });
			try {
				const { createStudent } = await import('@/api/admin.js');
				// 手机号和邮箱为空时填入默认值
				const postData = {
					username,
					password,
					full_name,
					phone: phone || 'string',
					email: email || 'user@example.com'
				};
				await createStudent(postData);
				uni.hideLoading();
				uni.showToast({ title: '学生创建成功', icon: 'success' });
				// 清空表单
				this.studentForm = { username: '', password: '', phone: '', email: '', full_name: '' };
				if (this.currentTab === 'permission') await this.loadUserDirectory();
			} catch (err) {
				uni.hideLoading();
				console.error('创建学生失败:', err);
				// 根据错误信息判断是否为重复
				const errMsg = err?.message || '';
				if (errMsg.includes('已存在') || errMsg.includes('exist') || errMsg.includes('duplicate') || errMsg.includes('Conflict')) {
					uni.showToast({ title: '该学号已存在', icon: 'none' });
				} else {
					uni.showToast({ title: errMsg || '创建失败', icon: 'none' });
				}
			}
		},
		
		// 创建教师
		async submitCreateTeacher() {
			const { username, password, phone, email, full_name } = this.teacherForm;
			if (!username || !password || !full_name) {
				uni.showToast({ title: '请填写必填项：用户名、密码、姓名', icon: 'none' });
				return;
			}
			uni.showLoading({ title: '创建中...' });
			try {
				const { createTeacher } = await import('@/api/admin.js');
				// 手机号和邮箱为空时填入默认值
				const postData = {
					username,
					password,
					full_name,
					phone: phone || 'string',
					email: email || 'user@example.com'
				};
				await createTeacher(postData);
				uni.hideLoading();
				uni.showToast({ title: '教师创建成功', icon: 'success' });
				// 清空表单
				this.teacherForm = { username: '', password: '', phone: '', email: '', full_name: '' };
				if (this.currentTab === 'permission') await this.loadUserDirectory();
			} catch (err) {
				uni.hideLoading();
				console.error('创建教师失败:', err);
				// 根据错误信息判断是否为重复
				const errMsg = err?.message || '';
				if (errMsg.includes('已存在') || errMsg.includes('exist') || errMsg.includes('duplicate') || errMsg.includes('Conflict')) {
					uni.showToast({ title: '该工号已存在', icon: 'none' });
				} else {
					uni.showToast({ title: errMsg || '创建失败', icon: 'none' });
				}
			}
		},
		
		// 创建管理员
		async submitCreateAdmin() {
			const { username, password, phone, email, full_name } = this.adminForm;
			if (!username || !password || !full_name) {
				uni.showToast({ title: '请填写必填项：用户名、密码、姓名', icon: 'none' });
				return;
			}
			uni.showLoading({ title: '创建中...' });
			try {
				const { createAdmin } = await import('@/api/admin.js');
				// 手机号和邮箱为空时填入默认值
				const postData = {
					username,
					password,
					full_name,
					phone: phone || 'string',
					email: email || 'user@example.com'
				};
				await createAdmin(postData);
				uni.hideLoading();
				uni.showToast({ title: '管理员创建成功', icon: 'success' });
				// 清空表单
				this.adminForm = { username: '', password: '', phone: '', email: '', full_name: '' };
				if (this.currentTab === 'permission') await this.loadUserDirectory();
			} catch (err) {
				uni.hideLoading();
				console.error('创建管理员失败:', err);
				// 根据错误信息判断是否为重复
				const errMsg = err?.message || '';
				if (errMsg.includes('已存在') || errMsg.includes('exist') || errMsg.includes('duplicate') || errMsg.includes('Conflict')) {
					uni.showToast({ title: '该账号已存在', icon: 'none' });
				} else {
					uni.showToast({ title: errMsg || '创建失败', icon: 'none' });
				}
			}
		}
	},
	
	onLoad() {
		if (this.checkAdminAuth()) {
			this.initAdminInfo();
			this.loadNoticesFromBackend(); // 从后端加载通知列表
			this.loadGroupList();
		}
	}
}
</script>

<style scoped>
	/* ============================================
	   商用级设计系统 - 管理员端
	   ============================================ */
	
	/* Academic Curator：管理员页面设计文件夹 / academic_ivory / DESIGN.md */
	.management-container {
		min-height: 100vh;
		background: #f8f9fa;
	}

	/* 发布公告弹窗内提示条与下方分区留白 */
	.notice-form--curator > .notice-curator-tip {
		margin-bottom: 20rpx;
	}
	
	.admin-curator-layout {
		/* 第二版：统一圆角 / 阴影 / 留白（对齐 DESIGN.md 纸面层级） */
		--ac-radius-sm: 12rpx;
		--ac-radius-md: 20rpx;
		--ac-radius-lg: 24rpx;
		--ac-shadow-card: 0 12rpx 40rpx rgba(15, 23, 42, 0.06);
		--ac-shadow-card-hover: 0 20rpx 56rpx rgba(15, 23, 42, 0.09);
		--ac-surface-card: #ffffff;
		--ac-outline-ghost: rgba(148, 163, 184, 0.22);
		display: flex;
		flex-direction: row;
		align-items: stretch;
		min-height: 100vh;
		font-family: 'Noto Sans SC', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
	}
	
	.admin-sidebar {
		/* 参考 announcement_center 侧栏：约 w-64～w-72，中文标签需略宽于纯英文稿 */
		width: 300px;
		min-width: 300px;
		max-width: 86vw;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		height: 100vh;
		position: sticky;
		top: 0;
		padding: 48rpx 0 calc(28rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
		background: rgba(241, 245, 249, 0.72);
		backdrop-filter: blur(40rpx);
		-webkit-backdrop-filter: blur(40rpx);
		border-right: 1rpx solid rgba(148, 163, 184, 0.22);
		box-shadow: 8rpx 0 32rpx rgba(15, 23, 42, 0.04);
		z-index: 100;
	}

	@media screen and (max-width: 899px) {
		.admin-sidebar {
			width: 540rpx;
			min-width: 540rpx;
			max-width: min(540rpx, 88vw);
		}
	}
	
	.sidebar-brand {
		flex-shrink: 0;
		margin: 0 20rpx 32rpx;
		padding: 0 8rpx 40rpx;
		border-bottom: 1rpx solid rgba(148, 163, 184, 0.18);
	}

	@media screen and (min-width: 900px) {
		.sidebar-brand {
			margin: 0 16px 28px;
			padding: 0 8px 32px;
		}
	}
	
	.sidebar-brand-title {
		font-family: 'Manrope', 'Noto Sans SC', sans-serif;
		font-size: 32rpx;
		font-weight: 800;
		color: #0f172a;
		letter-spacing: -0.03em;
		line-height: 1.3;
		display: block;
	}

	@media screen and (min-width: 900px) {
		.sidebar-brand-title {
			font-size: 20px;
		}
	}

	/* 与参考稿主标题下英文行一致（字号小、略浅） */
	.sidebar-brand-en {
		display: block;
		font-family: 'Manrope', 'Inter', sans-serif;
		font-size: 22rpx;
		font-weight: 600;
		color: #64748b;
		margin-top: 8rpx;
		letter-spacing: 0.02em;
		line-height: 1.35;
		opacity: 0.92;
	}

	@media screen and (min-width: 900px) {
		.sidebar-brand-en {
			font-size: 11px;
			margin-top: 6px;
		}
	}
	
	.sidebar-brand-sub {
		display: block;
		font-size: 20rpx;
		color: rgba(100, 116, 139, 0.85);
		margin-top: 14rpx;
		letter-spacing: 0.24em;
		text-transform: uppercase;
		font-weight: 600;
	}
	
	.sidebar-nav {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 8rpx 20rpx 16rpx;
		-webkit-overflow-scrolling: touch;
	}

	@media screen and (min-width: 900px) {
		.sidebar-nav {
			padding: 4px 12px 16px;
		}
	}
	
	/* 参考稿：mx-2 + space-y-1，条目为圆角 pill，未选中 hover 变主色 */
	.sidebar-nav-item {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 22rpx;
		padding: 26rpx 28rpx;
		margin: 0 8rpx 8rpx;
		border-radius: 20rpx;
		color: #475569;
		transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
	}

	@media screen and (min-width: 900px) {
		.sidebar-nav-item {
			gap: 14px;
			padding: 14px 18px;
			margin: 0 8px 6px;
			border-radius: 12px;
		}
	}
	
	.sidebar-nav-item:active {
		opacity: 0.92;
	}
	
	.sidebar-nav-item:not(.active):hover {
		color: #005bbf;
		background: rgba(0, 91, 191, 0.07);
	}
	
	/* 激活态：纯色蓝底 + 白字，与图一「Announcements」条一致 */
	.sidebar-nav-item.active {
		background: #2563eb;
		color: #ffffff;
		box-shadow: 0 12rpx 32rpx rgba(37, 99, 235, 0.28);
	}

	@media screen and (min-width: 900px) {
		.sidebar-nav-item.active {
			box-shadow: 0 8px 24px rgba(37, 99, 235, 0.22);
		}
	}
	
	.sidebar-nav-item.active .sidebar-nav-icon {
		font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
	}
	
	.sidebar-nav-icon {
		font-size: 44rpx;
		line-height: 1;
		flex-shrink: 0;
		font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
	}

	@media screen and (min-width: 900px) {
		.sidebar-nav-icon {
			font-size: 24px;
		}
	}
	
	.sidebar-nav-text {
		font-size: 28rpx;
		font-weight: 600;
		letter-spacing: 0.02em;
	}

	@media screen and (min-width: 900px) {
		.sidebar-nav-text {
			font-size: 15px;
			font-weight: 500;
		}
	}
	
	.sidebar-footer {
		flex-shrink: 0;
		margin-top: auto;
		padding: 28rpx 28rpx 0;
		border-top: 1rpx solid rgba(148, 163, 184, 0.22);
	}

	@media screen and (min-width: 900px) {
		.sidebar-footer {
			padding: 20px 20px 0;
		}
	}
	
	.sidebar-primary-btn {
		width: 100%;
		border: none;
		background: linear-gradient(135deg, #005bbf 0%, #1a73e8 100%);
		color: #fff;
		border-radius: 20rpx;
		padding: 26rpx 24rpx;
		font-size: 28rpx;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 14rpx;
		box-shadow: 0 14rpx 36rpx rgba(0, 91, 191, 0.25);
		line-height: 1.25;
		margin-bottom: 28rpx;
	}

	@media screen and (min-width: 900px) {
		.sidebar-primary-btn {
			border-radius: 12px;
			padding: 14px 16px;
			font-size: 14px;
			margin-bottom: 22px;
			box-shadow: 0 12px 28px rgba(0, 91, 191, 0.2);
		}
	}
	
	.sidebar-primary-btn::after {
		border: none;
	}
	
	.sidebar-btn-icon {
		font-size: 36rpx;
	}

	@media screen and (min-width: 900px) {
		.sidebar-btn-icon {
			font-size: 20px;
		}
	}
	
	.sidebar-link {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 16rpx;
		padding: 18rpx 16rpx;
		font-size: 24rpx;
		font-weight: 500;
		color: #64748b;
		border-radius: 14rpx;
		transition: color 0.2s ease, background 0.2s ease;
	}

	.sidebar-link .material-symbols-outlined {
		font-size: 32rpx;
		opacity: 0.9;
	}

	.sidebar-link:hover {
		color: #005bbf;
		background: rgba(0, 91, 191, 0.06);
	}
	
	.sidebar-link-danger {
		color: #b91c1c;
	}

	.sidebar-link-danger:hover {
		color: #dc2626;
		background: rgba(185, 28, 28, 0.06);
	}
	
	.admin-main {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background: #f8f9fa;
		/* 自定义导航后：避免内容贴齐状态栏 / 刘海 */
		padding-top: constant(safe-area-inset-top);
		padding-top: env(safe-area-inset-top);
	}
	
	.admin-topbar {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx 36rpx;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(20rpx);
		-webkit-backdrop-filter: blur(20rpx);
		border-bottom: 1rpx solid rgba(148, 163, 184, 0.2);
		position: sticky;
		top: 0;
		/* 须高于 .group-relations-toolbar(100) 等主内容区叠层，否则滚动/层叠时用户信息下拉会被筛选栏压住 */
		z-index: 200;
		box-shadow: 0 4rpx 24rpx rgba(15, 23, 42, 0.04);
	}
	
	.admin-topbar-left {
		flex: 1;
		min-width: 0;
		padding-right: 24rpx;
	}
	
	.admin-page-kicker {
		display: block;
		font-size: 22rpx;
		color: #64748b;
		letter-spacing: 0.14em;
		margin-bottom: 6rpx;
	}
	
	.admin-page-title {
		display: block;
		font-family: 'Manrope', 'Noto Sans SC', sans-serif;
		font-size: 40rpx;
		font-weight: 800;
		color: #0f172a;
		line-height: 1.2;
	}
	
	.admin-page-desc {
		display: block;
		font-size: 24rpx;
		color: #64748b;
		margin-top: 10rpx;
		line-height: 1.55;
		max-width: 960rpx;
	}
	
	.admin-content-wrap {
		flex: 1;
		padding: 28rpx 32rpx 48rpx;
		box-sizing: border-box;
		width: 100%;
		max-width: 100%;
	}
	
	/* 大屏（约 1920×1080）：内容区居中、略增内边距 */
	@media screen and (min-width: 1200px) {
		.admin-content-wrap {
			padding: 40px 48px 56px;
			max-width: 1600px;
			margin-left: auto;
			margin-right: auto;
		}
		.admin-topbar {
			padding-left: 48px;
			padding-right: 48px;
		}
	}
	
	/* ============================================
	   顶部导航栏 - 玻璃拟态效果
	   ============================================ */
	.header {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20rpx);
		-webkit-backdrop-filter: blur(20rpx);
		padding: 30rpx 40rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
		position: sticky;
		top: 0;
		z-index: 200;
		border-bottom: none;
	}
	
	.header-left {
		display: flex;
		align-items: center;
	}
	
	.header-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
	}
	
	.header-right {
		display: flex;
		align-items: center;
	}
	
	.admin-name {
		font-size: 28rpx;
		color: #666;
		margin-right: 20rpx;
	}
	
	.logout-btn {
		padding: 14rpx 28rpx;
		background-color: #ff4d4f;
		color: #fff;
		border-radius: 30rpx;
		font-size: 26rpx;
		border: none;
	}
	
	/* 与教师端 dashboard 一致：悬停用户信息卡片 */
	.admin-profile-card-root {
		--primary: #005bbf;
		--primary-container: #1a73e8;
		--surface-container-low: #f3f4f5;
		--surface-container-high: #e7e8e9;
		--surface-container-lowest: #ffffff;
		--on-surface: #191c1d;
		--on-surface-variant: #414754;
		--outline-variant: #c1c6d6;
		--error: #ba1a1a;
		--error-container: #ffdad6;
		--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
	}
	
	.admin-profile-card-root .material-symbols-outlined {
		font-family: 'Material Symbols Outlined';
		font-weight: normal;
		font-style: normal;
		font-size: 24px;
		line-height: 1;
		letter-spacing: normal;
		text-transform: none;
		display: inline-block;
		white-space: nowrap;
		word-wrap: normal;
		direction: ltr;
		font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
		vertical-align: middle;
	}
	
	.admin-profile-card-root .profile-btn-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		cursor: pointer;
		padding: 6px 12px 6px 6px;
		border-radius: 24px;
		transition: background 0.2s;
		z-index: 1;
	}
	
	.admin-profile-card-root .profile-btn-wrapper:hover {
		background: var(--surface-container-low);
	}
	
	.admin-profile-card-root .profile-avatar {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		overflow: hidden;
		background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fff;
		font-size: 14px;
		font-weight: 600;
		box-shadow: 0 4px 12px rgba(0, 91, 191, 0.25);
	}
	
	.admin-profile-card-root .profile-avatar-img,
	.admin-profile-card-root .user-card-avatar-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	
	.admin-profile-card-root .profile-avatar-letter {
		color: #fff;
		font-size: 14px;
		font-weight: 600;
	}
	
	.admin-profile-card-root .user-info-card {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		width: 280px;
		background: #fff;
		border-radius: 16px;
		box-shadow: var(--shadow-xl);
		z-index: 300;
		overflow: hidden;
		opacity: 0;
		transform: translateY(-10px) scale(0.95);
		transform-origin: top right;
		transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		pointer-events: none;
		visibility: hidden;
	}
	
	.admin-profile-card-root .user-info-card.show {
		opacity: 1;
		transform: translateY(0) scale(1);
		pointer-events: auto;
		visibility: visible;
	}
	
	.admin-profile-card-root .user-card-header {
		padding: 20px;
		background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
		display: flex;
		align-items: center;
		gap: 16px;
	}
	
	.admin-profile-card-root .user-card-avatar {
		width: 48px;
		height: 48px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fff;
		font-size: 18px;
		font-weight: 600;
		border: 2px solid rgba(255, 255, 255, 0.3);
		overflow: hidden;
		flex-shrink: 0;
	}
	
	.admin-profile-card-root .user-card-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
	}
	
	.admin-profile-card-root .user-name {
		font-size: 15px;
		font-weight: 600;
		color: #fff;
	}
	
	.admin-profile-card-root .user-id {
		font-size: 12px;
		color: rgba(255, 255, 255, 0.85);
	}
	
	.admin-profile-card-root .user-role-badge {
		display: inline-flex;
		padding: 2px 8px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 9999px;
		font-size: 11px;
		color: #fff;
		font-weight: 500;
		width: fit-content;
	}
	
	.admin-profile-card-root .user-card-menu {
		padding: 8px;
	}
	
	.admin-profile-card-root .menu-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		border-radius: 8px;
		cursor: pointer;
		transition: background 0.2s;
		font-size: 14px;
		color: var(--on-surface);
	}
	
	.admin-profile-card-root .menu-item:hover {
		background: var(--surface-container-low);
	}
	
	.admin-profile-card-root .menu-item.logout {
		color: var(--error);
	}
	
	.admin-profile-card-root .menu-item.logout:hover {
		background: var(--error-container);
	}
	
	.admin-profile-card-root .menu-item .material-symbols-outlined {
		font-size: 18px;
		color: var(--on-surface-variant);
	}
	
	.admin-profile-card-root .menu-item.logout .material-symbols-outlined {
		color: var(--error);
	}
	
	/* 修改密码 / 退出确认弹窗（与教师端一致） */
	.admin-custom-modal-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2000;
		backdrop-filter: blur(4px);
		--primary: #005bbf;
		--on-surface: #191c1d;
		--on-surface-variant: #414754;
		--surface-container-high: #e7e8e9;
		--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
		--error: #ba1a1a;
		--outline-variant: #c1c6d6;
		--surface-container-lowest: #ffffff;
		--surface-container-low: #f3f4f5;
		--error-container: #ffdad6;
	}
	
	.admin-custom-modal-content {
		background: #fff;
		border-radius: 20px;
		width: 90%;
		max-width: 480px;
		max-height: 90vh;
		overflow: hidden;
		box-shadow: var(--shadow-xl);
	}
	
	.admin-password-modal {
		max-width: 400px;
	}
	
	.admin-custom-modal-header {
		padding: 20px 24px;
		border-bottom: 1px solid var(--surface-container-high);
		font-size: 18px;
		font-weight: 700;
		color: var(--on-surface);
		display: flex;
		align-items: center;
		gap: 12px;
	}
	
	.admin-custom-modal-header .material-symbols-outlined {
		font-family: 'Material Symbols Outlined';
		font-size: 24px;
		color: var(--primary);
		font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
	}
	
	.admin-custom-modal-body {
		padding: 24px;
		font-size: 15px;
		color: var(--on-surface-variant);
	}
	
	.admin-custom-modal-footer {
		display: flex;
		border-top: 1px solid var(--surface-container-high);
	}
	
	.admin-modal-btn {
		flex: 1;
		padding: 16px;
		text-align: center;
		font-size: 15px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}
	
	.admin-modal-btn.cancel {
		color: var(--on-surface-variant);
		border-right: 1px solid var(--surface-container-high);
	}
	
	.admin-modal-btn.cancel:hover {
		background: #f0f0f0;
	}
	
	.admin-modal-btn.confirm {
		color: var(--primary);
	}
	
	.admin-modal-btn.confirm:hover {
		background: rgba(0, 91, 191, 0.08);
	}
	
	.admin-modal-btn.confirm.danger {
		color: #ef4444 !important;
		background: transparent;
	}
	
	.admin-modal-btn.confirm.danger:hover {
		background: rgba(239, 68, 68, 0.08) !important;
	}
	
	.admin-password-modal-body {
		padding: 24px;
	}
	
	.admin-pwd-form-item {
		margin-bottom: 20px;
	}
	
	.admin-pwd-form-label {
		display: block;
		font-size: 13px;
		font-weight: 600;
		color: var(--on-surface-variant);
		margin-bottom: 8px;
	}
	
	.admin-pwd-form-input {
		width: 100%;
		box-sizing: border-box;
		height: 44px;
		padding: 12px 16px;
		border: 1px solid var(--outline-variant);
		border-radius: 12px;
		font-size: 14px;
		background: var(--surface-container-lowest);
		transition: all 0.2s;
	}
	
	.admin-pwd-form-input:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 3px rgba(0, 91, 191, 0.1);
	}
	
	.admin-pwd-form-input.pwd-input-error {
		border-color: var(--error);
		background: var(--error-container);
	}
	
	.admin-pwd-error-tip {
		font-size: 12px;
		color: var(--error);
		margin-top: 6px;
		display: block;
	}
	
	/* ============================================
	   标签页 - 现代悬浮效果
	   ============================================ */
	.tabs-bar {
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10rpx);
		border-bottom: 1rpx solid rgba(0, 0, 0, 0.04);
		padding: 10rpx 0;
	}
	
	.tabs {
		display: flex;
		padding: 0 30rpx;
		overflow-x: auto;
		gap: 10rpx;
	}
	
	.tab {
		padding: 20rpx 32rpx;
		font-size: 28rpx;
		color: #595959;
		white-space: nowrap;
		border-radius: 12rpx;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		font-weight: 500;
	}
	
	.tab:hover {
		background-color: rgba(0, 91, 191, 0.06);
		color: #005bbf;
	}
	
	.tab.active {
		color: #005bbf;
		background: linear-gradient(135deg, rgba(0, 91, 191, 0.1) 0%, rgba(26, 115, 232, 0.05) 100%);
		font-weight: 600;
	}
	
	.tab.active::after {
		content: '';
		position: absolute;
		bottom: 4rpx;
		left: 50%;
		transform: translateX(-50%);
		width: 24rpx;
		height: 4rpx;
		background: linear-gradient(90deg, #005bbf, #1a73e8);
		border-radius: 2rpx;
	}
	
	/* ============================================
	   内容区域 - 舒适间距
	   ============================================ */
	.tab-content {
		padding: 0;
		max-width: 100%;
		margin: 0;
	}

	/* 群组页：参考 group_resource_operations 的顶栏 + Bento + 列表 */
	.tab-content-group-ops {
		padding-bottom: 24rpx;
	}
	.group-ops-page {
		display: flex;
		flex-direction: column;
		gap: 40rpx;
	}
	.group-ops-hero {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		flex-wrap: wrap;
		gap: 24rpx;
	}
	.group-ops-hero-text {
		flex: 1;
		min-width: 280rpx;
	}
	.group-ops-kicker {
		font-size: 22rpx;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-weight: 700;
		display: block;
		margin-bottom: 8rpx;
	}
	.group-ops-title {
		font-family: 'Manrope', 'Noto Sans SC', sans-serif;
		font-size: 48rpx;
		font-weight: 800;
		color: #0f172a;
		display: block;
		line-height: 1.2;
	}
	.group-ops-desc {
		font-size: 26rpx;
		color: #64748b;
		margin-top: 12rpx;
		line-height: 1.5;
		display: block;
		max-width: 620px;
	}
	.group-ops-create-btn {
		display: flex;
		align-items: center;
		gap: 12rpx;
		padding: 20rpx 36rpx;
		border: 2rpx solid rgba(0, 91, 191, 0.22);
		border-radius: 16rpx;
		background: #fff;
		color: #005bbf;
		font-size: 28rpx;
		font-weight: 600;
	}
	.group-ops-create-ic {
		font-size: 36rpx;
	}
	.group-ops-bento {
		display: flex;
		flex-direction: column;
		gap: 32rpx;
		align-items: stretch;
	}
	.group-ops-panel-import {
		flex: 1;
		min-width: 0;
		background: #fff;
		border-radius: var(--ac-radius-lg, 24rpx);
		padding: 48rpx 40rpx;
		border: 1rpx solid rgba(148, 163, 184, 0.28);
		box-shadow: var(--ac-shadow-card, 0 8rpx 28rpx rgba(15, 23, 42, 0.08));
	}
	.group-ops-panel-head {
		margin-bottom: 28rpx;
	}
	.group-ops-panel-kicker {
		font-size: 22rpx;
		color: #006a5f;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		display: block;
		margin-bottom: 8rpx;
	}
	.group-ops-panel-title {
		font-size: 36rpx;
		font-weight: 800;
		color: #0f172a;
		display: block;
		font-family: 'Manrope', 'Noto Sans SC', sans-serif;
	}
	.group-ops-panel-desc {
		font-size: 24rpx;
		color: #64748b;
		margin-top: 10rpx;
		display: block;
		line-height: 1.45;
	}
	.group-ops-import-inner {
		margin-top: 0;
		padding: 0;
		background: transparent;
		border: none;
		box-shadow: none;
	}
	.group-ops-panel-download {
		flex: 1;
		min-width: 0;
	}
	.group-ops-download-card {
		background: linear-gradient(145deg, #1a73e8 0%, #005bbf 100%);
		padding: 48rpx 36rpx;
		border-radius: var(--ac-radius-lg, 24rpx);
		box-shadow: 0 16rpx 48rpx rgba(0, 91, 191, 0.22);
		position: relative;
		min-height: 100%;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	.group-ops-download-icon-wrap {
		width: 96rpx;
		height: 96rpx;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.18);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 24rpx;
	}
	.group-ops-download-ms {
		font-size: 52rpx;
		color: #fff;
	}
	.group-ops-download-title {
		font-size: 34rpx;
		font-weight: 800;
		color: #fff;
		display: block;
		font-family: 'Manrope', 'Noto Sans SC', sans-serif;
	}
	.group-ops-download-desc {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.88);
		margin-top: 12rpx;
		margin-bottom: 8rpx;
		display: block;
		line-height: 1.45;
	}
	.group-ops-download-inner {
		background: transparent !important;
		box-shadow: none !important;
		padding: 0 !important;
		margin-top: 16rpx;
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	.group-ops-download-inner .filter-label,
	.group-ops-download-inner .option-fixed-tip {
		color: rgba(255, 255, 255, 0.92);
	}
	.group-ops-download-inner .download-name-hint {
		color: rgba(255, 255, 255, 0.72);
	}
	/* 预计下载：浅底 + 深色字，避免白字叠在 #f5f5f5 上无法辨认 */
	.group-ops-download-inner .download-preview {
		margin-top: 12rpx;
		margin-bottom: 12rpx;
		padding: 22rpx 24rpx;
		background: rgba(255, 255, 255, 0.97);
		border-radius: 14rpx;
		border: 1rpx solid rgba(255, 255, 255, 0.45);
		box-shadow: 0 4rpx 16rpx rgba(0, 40, 120, 0.12);
	}
	.group-ops-download-inner .download-preview .preview-title {
		color: #0f172a;
		font-weight: 600;
		margin-bottom: 0;
	}
	.group-ops-download-inner .download-options {
		margin-top: 8rpx;
	}
	.group-ops-download-start {
		margin-top: auto;
		background: #fff !important;
		color: #005bbf !important;
		font-weight: 700;
		border: none;
	}
	.group-ops-download-inner .download-preview-count-btn {
		background: rgba(255, 255, 255, 0.22);
		color: #fff;
		border: 1rpx solid rgba(255, 255, 255, 0.35);
	}
	.group-ops-list-section {
		margin-top: 8rpx;
	}
	.group-ops-list-head {
		margin-bottom: 24rpx;
	}
	.group-ops-list-title {
		font-family: 'Manrope', 'Noto Sans SC', sans-serif;
		font-size: 38rpx;
		font-weight: 800;
		color: #0f172a;
		display: block;
	}
	.group-ops-list-sub {
		font-size: 24rpx;
		color: #64748b;
		margin-top: 8rpx;
		display: block;
	}
	@media (min-width: 768px) {
		.group-ops-bento {
			flex-direction: row;
			align-items: stretch;
		}
		.group-ops-panel-import {
			flex: 1.85;
		}
		.group-ops-panel-download {
			flex: 1;
			max-width: 42%;
		}
	}
	
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 28rpx;
		flex-wrap: wrap;
		gap: 16rpx;
	}
	
	/* ============================================
	   页面标题 - 现代字体与间距
	   ============================================ */
	.section-title {
		font-family: 'Manrope', 'Noto Sans SC', sans-serif;
		font-size: 34rpx;
		font-weight: 800;
		color: #0f172a;
		letter-spacing: 0;
		position: relative;
		padding-left: 20rpx;
	}
	
	.section-title::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 6rpx;
		height: 30rpx;
		background: linear-gradient(180deg, #005bbf, #1a73e8);
		border-radius: 4rpx;
	}
	
	/* 群组列表：标签单独一行，图标+输入+按钮同一行等高对齐 */
	.group-ops-search-bar {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 14rpx;
		margin-bottom: 28rpx;
		padding: 24rpx 26rpx 26rpx;
		background: #fff;
		border-radius: var(--ac-radius-lg, 24rpx);
		border: 1rpx solid rgba(148, 163, 184, 0.28);
		box-shadow: var(--ac-shadow-card, 0 8rpx 28rpx rgba(15, 23, 42, 0.08));
		transition: box-shadow 0.25s ease;
	}
	.group-ops-search-bar:hover {
		box-shadow: var(--ac-shadow-card-hover, 0 14rpx 40rpx rgba(15, 23, 42, 0.1));
	}
	.group-ops-search-label {
		font-size: 22rpx;
		font-weight: 700;
		color: #64748b;
		letter-spacing: 0.04em;
		display: block;
		line-height: 1.3;
	}
	.group-ops-search-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 16rpx;
		min-height: 104rpx;
	}
	.group-ops-search-ic {
		font-size: 40rpx;
		color: #94a3b8;
		flex-shrink: 0;
		line-height: 1;
	}
	.group-ops-search-input {
		flex: 1;
		min-width: 0;
		width: 0;
		box-sizing: border-box;
		height: 104rpx;
		min-height: 104rpx;
		line-height: 1.45;
		padding: 22rpx 24rpx;
		border: 1rpx solid #e2e8f0;
		border-radius: 14rpx;
		background: #f8fafc;
		font-size: 30rpx;
		color: #0f172a;
		vertical-align: middle;
		transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
	}
	.group-ops-search-input:focus {
		outline: none;
		background: #fff;
		border-color: #005bbf;
		box-shadow: 0 0 0 3rpx rgba(0, 91, 191, 0.12);
	}
	.group-ops-search-submit {
		flex-shrink: 0;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: 10rpx;
		padding: 0 32rpx;
		height: 104rpx;
		min-height: 104rpx;
		max-height: 104rpx;
		box-sizing: border-box;
		border: none;
		border-radius: 14rpx;
		background: linear-gradient(135deg, #005bbf 0%, #1a73e8 100%);
		color: #fff;
		font-size: 28rpx;
		font-weight: 700;
		line-height: 1;
		box-shadow: 0 8rpx 22rpx rgba(0, 91, 191, 0.28);
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}
	.group-ops-search-submit-ic {
		font-size: 32rpx;
	}
	.group-ops-search-submit:active {
		transform: scale(0.98);
	}
	@media (max-width: 640px) {
		.group-ops-search-row {
			flex-wrap: wrap;
			align-items: stretch;
			min-height: 0;
		}
		.group-ops-search-ic {
			display: none;
		}
		.group-ops-search-input {
			width: 100%;
			flex: 1 1 100%;
		}
		.group-ops-search-submit {
			width: 100%;
			height: 96rpx;
			min-height: 96rpx;
			max-height: 96rpx;
		}
	}
	
	/* ============================================
	   按钮 - 渐变与阴影效果
	   ============================================ */
	.add-btn {
		padding: 16rpx 32rpx;
		background: linear-gradient(135deg, #005bbf 0%, #1a73e8 100%);
		color: #fff;
		border-radius: 14rpx;
		font-size: 28rpx;
		border: none;
		box-shadow: 0 8rpx 24rpx rgba(0, 91, 191, 0.25);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		font-weight: 600;
	}
	
	.add-btn:hover {
		transform: translateY(-2rpx);
		box-shadow: 0 10rpx 28rpx rgba(0, 91, 191, 0.32);
	}
	
	.add-btn:active {
		transform: translateY(0);
		box-shadow: 0 4rpx 14rpx rgba(0, 91, 191, 0.28);
	}
	
	.group-list {
		display: flex;
		flex-direction: column;
	}
	
	/* ============================================
	   卡片 - 悬浮阴影与圆角
	   ============================================ */
	.group-card {
		background: var(--ac-surface-card, #fff);
		padding: 28rpx 30rpx 26rpx;
		border-radius: var(--ac-radius-lg, 24rpx);
		margin-bottom: 20rpx;
		border: 1rpx solid rgba(148, 163, 184, 0.22);
		box-shadow: var(--ac-shadow-card);
		transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.28s ease, border-color 0.28s ease;
		position: relative;
		overflow: hidden;
	}
	
	.group-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 6rpx;
		height: 100%;
		background: linear-gradient(180deg, #005bbf, #1a73e8);
		opacity: 0;
		transition: opacity 0.28s ease;
		border-radius: 0 4rpx 4rpx 0;
	}
	
	.group-card:hover {
		transform: translateY(-3rpx);
		box-shadow: var(--ac-shadow-card-hover);
		border-color: rgba(0, 91, 191, 0.2);
	}
	
	.group-card:hover::before {
		opacity: 1;
	}
	
	.group-card-top {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: flex-start;
		gap: 20rpx;
		margin-bottom: 22rpx;
	}
	
	.group-card-lead {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 20rpx;
		flex: 1;
		min-width: 0;
	}
	
	.group-card-avatar {
		width: 88rpx;
		height: 88rpx;
		border-radius: 20rpx;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(145deg, rgba(0, 91, 191, 0.12) 0%, rgba(26, 115, 232, 0.08) 100%);
		border: 1rpx solid rgba(0, 91, 191, 0.15);
	}
	
	.group-card-avatar-ic {
		font-size: 44rpx;
		color: #005bbf;
	}
	
	.group-info {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
		min-width: 0;
	}
	
	.group-name {
		font-family: 'Manrope', 'Noto Sans SC', sans-serif;
		font-size: 34rpx;
		font-weight: 800;
		color: #0f172a;
		line-height: 1.3;
	}
	
	.group-code {
		font-size: 24rpx;
		color: #64748b;
		line-height: 1.4;
	}
	
	.group-code-kicker {
		display: inline-block;
		margin-right: 8rpx;
		padding: 2rpx 10rpx;
		border-radius: 8rpx;
		background: #f1f5f9;
		color: #475569;
		font-size: 20rpx;
		font-weight: 600;
	}
	
	/* ============================================
	   状态标签 - 精致配色
	   ============================================ */
	.group-status {
		padding: 10rpx 22rpx;
		border-radius: 999rpx;
		font-size: 22rpx;
		font-weight: 700;
		flex-shrink: 0;
		transition: all 0.25s ease;
	}
	
	.group-status.active {
		background: #ecfdf5;
		color: #047857;
		border: 1rpx solid #6ee7b7;
	}
	
	.group-status.inactive {
		background: #fef2f2;
		color: #b91c1c;
		border: 1rpx solid #fecaca;
	}
	
	.group-stats {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: 12rpx;
		margin-bottom: 22rpx;
	}
	
	.group-stat-pill {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 10rpx;
		padding: 12rpx 18rpx;
		border-radius: 999rpx;
		background: #f8fafc;
		border: 1rpx solid #e2e8f0;
	}
	
	.group-stat-ic {
		font-size: 30rpx;
		color: #64748b;
	}
	
	.group-stat-label {
		font-size: 22rpx;
		font-weight: 600;
		color: #64748b;
	}
	
	.group-stat-num {
		font-size: 26rpx;
		font-weight: 800;
		color: #005bbf;
		font-variant-numeric: tabular-nums;
	}
	
	.group-actions {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 14rpx;
	}
	
	.group-action-btn {
		margin: 0;
		padding: 0 12rpx;
		min-height: 76rpx;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
		border-radius: 14rpx;
		font-size: 26rpx;
		font-weight: 700;
		transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.15s ease;
		box-sizing: border-box;
	}
	
	.group-action-ic {
		font-size: 30rpx;
	}
	
	.group-action-btn--secondary {
		background: #fff;
		color: #334155;
		border: 1rpx solid #e2e8f0;
	}
	
	.group-action-btn--secondary:active {
		background: #f1f5f9;
		border-color: #cbd5e1;
	}
	
	.group-action-btn--danger {
		background: #fff;
		color: #dc2626;
		border: 1rpx solid #fecaca;
	}
	
	.group-action-btn--danger:active {
		background: #fef2f2;
		border-color: #f87171;
	}
	
	/* ============================================
	   导入区域 - 卡片式布局
	   ============================================ */
	.import-section {
		background: var(--ac-surface-card, #fff);
		padding: 40rpx;
		border-radius: var(--ac-radius-lg, 24rpx);
		box-shadow: var(--ac-shadow-card, 0 8rpx 28rpx rgba(15, 23, 42, 0.08));
		border: 1rpx solid var(--ac-outline-ghost, rgba(148, 163, 184, 0.2));
	}
	
	.import-tips {
		margin-bottom: 30rpx;
	}
	
	.tip-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
		display: block;
		margin-bottom: 15rpx;
	}
	
	.tip-item {
		font-size: 24rpx;
		color: #666;
		display: block;
		margin-bottom: 10rpx;
		line-height: 1.6;
	}
	
	.import-actions {
		display: flex;
		justify-content: space-around;
		margin-bottom: 30rpx;
	}
	
	.download-template-btn, .upload-file-btn {
		flex: 1;
		padding: 25rpx;
		border-radius: 10rpx;
		font-size: 28rpx;
		border: none;
		margin: 0 10rpx;
	}
	
	.download-template-btn {
		background-color: #f0f0f0;
		color: #666;
	}
	
	.upload-file-btn {
		background: linear-gradient(135deg, #005bbf 0%, #1a73e8 100%);
		color: #fff;
		box-shadow: 0 6rpx 18rpx rgba(0, 91, 191, 0.22);
	}
	
	.file-info {
		display: flex;
		align-items: center;
		padding: 20rpx;
		background-color: #f5f5f5;
		border-radius: 5rpx;
		margin-bottom: 30rpx;
	}
	
	.file-name {
		font-size: 28rpx;
		color: #333;
		flex: 1;
		margin-right: 20rpx;
	}
	
	.file-size {
		font-size: 24rpx;
		color: #999;
		margin-right: 20rpx;
	}
	
	.remove-file-btn {
		padding: 10rpx 20rpx;
		background-color: #ff4d4f;
		color: #fff;
		border-radius: 5rpx;
		font-size: 24rpx;
		border: none;
	}
	
	.import-options {
		margin-bottom: 30rpx;
	}
	
	.checkbox-label {
		display: flex;
		align-items: center;
		margin-bottom: 15rpx;
		font-size: 28rpx;
		color: #333;
	}
	
	.submit-import-btn {
		width: 100%;
		padding: 30rpx;
		background: linear-gradient(135deg, #005bbf 0%, #1a73e8 100%);
		color: #fff;
		border-radius: 12rpx;
		font-size: 32rpx;
		border: none;
		box-shadow: 0 8rpx 22rpx rgba(0, 91, 191, 0.25);
	}
	
	.submit-import-btn[disabled] {
		background-color: #d9d9d9;
		color: #999;
	}
	
	.import-progress {
		margin-top: 30rpx;
		padding: 20rpx;
		background-color: #f5f5f5;
		border-radius: 5rpx;
	}
	
	.progress-text {
		font-size: 28rpx;
		color: #333;
		display: block;
		margin-bottom: 15rpx;
	}
	
	.import-result {
		margin-top: 24rpx;
		padding: 24rpx;
		background: #fafafa;
		border-radius: 12rpx;
		border: 1rpx solid #eee;
	}
	
	.import-result--failed {
		border-color: #ffccc7;
		background: #fff2f0;
	}
	
	.import-result .result-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
	}
	
	.import-result .result-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}
	
	.import-result--failed .result-title {
		color: #cf1322;
	}
	
	.import-result .result-content {
		font-size: 28rpx;
	}
	
	.import-result .result-summary,
	.import-result .result-success,
	.import-result .result-failed,
	.import-result .result-skipped {
		display: block;
		margin-top: 8rpx;
	}
	
	.import-result .error-list {
		margin-top: 16rpx;
		padding-top: 16rpx;
		border-top: 1rpx solid #f0f0f0;
	}
	
	.import-result .error-title {
		font-size: 26rpx;
		color: #666;
		margin-bottom: 8rpx;
	}
	
	.import-result .error-item {
		font-size: 26rpx;
		color: #cf1322;
		margin-bottom: 6rpx;
	}
	
	.import-result .close-result-btn {
		font-size: 40rpx;
		color: #999;
		padding: 0 12rpx;
	}

/* 公告管理（announcement_center 布局 + academic_ivory 纸面 / 无硬分割线） */
.tab-content-notice-center {
		width: 100%;
	}

	.notice-center-page {
		display: flex;
		flex-direction: column;
		gap: 40rpx;
		padding-bottom: 24rpx;
	}

	.notice-center-hero-display {
		display: block;
		font-family: 'Manrope', 'Noto Sans SC', sans-serif;
		font-size: 56rpx;
		font-weight: 800;
		color: rgba(15, 23, 42, 0.88);
		line-height: 1.12;
		letter-spacing: -0.04em;
		margin-bottom: 8rpx;
	}

	.notice-center-hero-title {
		display: block;
		font-family: 'Manrope', 'Noto Sans SC', sans-serif;
		font-size: 34rpx;
		font-weight: 700;
		color: #005bbf;
		line-height: 1.2;
		letter-spacing: -0.02em;
		margin-bottom: 4rpx;
	}

	.notice-center-hero-desc {
		display: block;
		margin-top: 16rpx;
		font-size: 26rpx;
		color: #64748b;
		line-height: 1.65;
		max-width: 920rpx;
	}

	.notice-center-bento {
		display: flex;
		flex-direction: column;
		gap: 28rpx;
	}
	@media screen and (min-width: 900px) {
		.notice-center-bento {
			flex-direction: row;
			align-items: stretch;
		}
		.notice-center-bento-main {
			flex: 1.9;
			min-width: 0;
		}
		.notice-center-bento-side {
			flex: 1;
			min-width: 260rpx;
			max-width: 100%;
		}
	}
	.notice-center-bento-main {
		background: #fff;
		border-radius: var(--ac-radius-lg, 24rpx);
		padding: 36rpx 32rpx 32rpx;
		box-shadow: 0 20rpx 50rpx rgba(30, 58, 138, 0.07);
		border: 1rpx solid rgba(148, 163, 184, 0.2);
	}
	.notice-center-bento-toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: space-between;
		gap: 20rpx;
		margin-bottom: 24rpx;
	}
	.notice-center-bento-headline {
		display: flex;
		align-items: flex-start;
		gap: 16rpx;
		min-width: 0;
		flex: 1;
	}
	.notice-center-bento-ic {
		font-size: 40rpx;
		color: #005bbf;
		flex-shrink: 0;
		margin-top: 4rpx;
	}
	.notice-center-bento-headline-text {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
		min-width: 0;
	}
	.notice-center-bento-title {
		font-family: 'Manrope', 'Noto Sans SC', sans-serif;
		font-size: 32rpx;
		font-weight: 800;
		color: #0f172a;
	}
	.notice-center-bento-sub {
		font-size: 24rpx;
		color: #64748b;
		line-height: 1.5;
	}
	.notice-center-bento-publish {
		padding: 0 36rpx;
		height: 72rpx;
		line-height: 72rpx;
		border-radius: 16rpx;
		font-size: 26rpx;
		font-weight: 700;
		color: #fff;
		background: linear-gradient(90deg, #005bbf 0%, #1a73e8 100%);
		border: none;
		box-shadow: 0 10rpx 28rpx rgba(0, 91, 191, 0.25);
		flex-shrink: 0;
	}
	.notice-center-bento-cta {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		padding: 28rpx;
		border-radius: 16rpx;
		border: 2rpx dashed rgba(0, 91, 191, 0.28);
		background: rgba(0, 91, 191, 0.04);
		font-size: 28rpx;
		font-weight: 600;
		color: #005bbf;
	}
	.notice-center-bento-cta .material-symbols-outlined {
		font-size: 36rpx;
	}
	.notice-center-bento-side {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}
	.notice-side-card {
		border-radius: var(--ac-radius-lg, 24rpx);
		padding: 28rpx 24rpx;
	}
	.notice-side-card--audience {
		background: #fff;
		border: 1rpx solid rgba(148, 163, 184, 0.22);
		box-shadow: 0 12rpx 36rpx rgba(15, 23, 42, 0.05);
	}
	.notice-side-label {
		display: block;
		font-size: 20rpx;
		font-weight: 800;
		color: #64748b;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		margin-bottom: 16rpx;
	}
	.notice-side-line {
		display: block;
		font-size: 24rpx;
		color: #475569;
		line-height: 1.55;
		margin-bottom: 10rpx;
	}
	.notice-side-card--insight {
		background: rgba(0, 91, 191, 0.06);
		border: 1rpx solid rgba(0, 91, 191, 0.12);
	}
	.notice-side-insight-top {
		display: flex;
		align-items: center;
		gap: 10rpx;
		margin-bottom: 12rpx;
	}
	.notice-side-insight-ic {
		font-size: 32rpx;
		color: #005bbf;
	}
	.notice-side-insight-kicker {
		font-size: 20rpx;
		font-weight: 800;
		color: #004493;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.notice-side-insight-body {
		font-size: 24rpx;
		color: #48626e;
		line-height: 1.55;
	}

	.notice-center-toolbar {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	@media screen and (min-width: 900px) {
		.notice-center-toolbar {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
		}
	}

	.notice-center-search {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
		gap: 16rpx;
		padding: 0 24rpx;
		height: 80rpx;
		border-radius: var(--ac-radius-md, 20rpx);
		background: #e7e8e9;
		box-shadow: none;
	}

	.notice-center-search-icon {
		font-size: 36rpx;
		color: #94a3b8;
		flex-shrink: 0;
	}

	.notice-center-search-input {
		flex: 1;
		min-width: 0;
		height: 80rpx;
		font-size: 26rpx;
		color: #0f172a;
		background: transparent;
		border: none;
	}

	.notice-center-toolbar-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 16rpx;
	}

	.notice-center-btn-ghost {
		display: inline-flex;
		align-items: center;
		gap: 10rpx;
		padding: 0 28rpx;
		height: 72rpx;
		border-radius: 16rpx;
		font-size: 26rpx;
		font-weight: 600;
		color: #475569;
		background: #f1f5f9;
		border: none;
	}

	.notice-center-btn-primary {
		display: inline-flex;
		align-items: center;
		gap: 10rpx;
		padding: 0 32rpx;
		height: 72rpx;
		border-radius: 16rpx;
		font-size: 26rpx;
		font-weight: 700;
		color: #fff;
		background: linear-gradient(135deg, #005bbf 0%, #1a73e8 100%);
		border: none;
		box-shadow: 0 10rpx 28rpx rgba(0, 91, 191, 0.22);
	}

	.notice-center-btn-secondary {
		display: inline-flex;
		align-items: center;
		gap: 10rpx;
		padding: 0 28rpx;
		height: 72rpx;
		border-radius: 16rpx;
		font-size: 26rpx;
		font-weight: 600;
		color: #005bbf;
		background: rgba(0, 91, 191, 0.1);
		border: none;
	}

	.notice-center-btn-icon {
		font-size: 32rpx;
		line-height: 1;
	}

	.notice-center-archive-head {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	@media screen and (min-width: 640px) {
		.notice-center-archive-head {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
		}
	}

	.notice-center-archive-titles {
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}
	.notice-center-archive-kicker {
		font-size: 20rpx;
		font-weight: 800;
		color: #94a3b8;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}
	.notice-center-archive-title {
		font-family: 'Manrope', 'Noto Sans SC', sans-serif;
		font-size: 36rpx;
		font-weight: 800;
		color: #0f172a;
	}

	.notice-center-segment {
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 8rpx;
		border-radius: 16rpx;
		background: #e7e8e9;
	}

	.notice-center-segment-item {
		padding: 14rpx 28rpx;
		border-radius: 12rpx;
		font-size: 24rpx;
		font-weight: 600;
		color: #64748b;
		transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
	}

	.notice-center-segment-item.active {
		background: #fff;
		color: #005bbf;
		box-shadow: 0 4rpx 14rpx rgba(15, 23, 42, 0.06);
	}

	.notice-center-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.notice-center-row {
		border-radius: var(--ac-radius-lg, 24rpx);
		background: #fff;
		box-shadow: 0 16rpx 40rpx rgba(30, 58, 138, 0.05);
		overflow: hidden;
		transition: box-shadow 0.25s ease, transform 0.22s ease;
	}

	.notice-center-row:hover {
		box-shadow: 0 22rpx 48rpx rgba(30, 58, 138, 0.08);
		transform: translateY(-2rpx);
	}

	.notice-center-row-inner {
		display: flex;
		align-items: stretch;
		justify-content: space-between;
		gap: 16rpx;
		padding: 28rpx 24rpx 28rpx 28rpx;
		border-left: 8rpx solid transparent;
	}

	.notice-center-row--published .notice-center-row-inner {
		border-left-color: rgba(0, 134, 120, 0.85);
	}

	.notice-center-row--draft .notice-center-row-inner {
		border-left-color: rgba(245, 158, 11, 0.75);
		background: linear-gradient(90deg, rgba(255, 251, 235, 0.35) 0%, #fff 18%);
	}

	.notice-center-row--urgent .notice-center-row-inner {
		border-left-color: #ba1a1a;
		background: linear-gradient(90deg, rgba(255, 218, 214, 0.35) 0%, #fff 20%);
	}

	.notice-center-lead {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: flex-start;
		gap: 22rpx;
	}

	.notice-center-lead-avatar {
		width: 88rpx;
		height: 88rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.notice-center-lead-avatar--published {
		background: rgba(0, 134, 120, 0.1);
		color: #006a5f;
	}

	.notice-center-lead-avatar--draft {
		background: rgba(245, 158, 11, 0.12);
		color: #b45309;
	}

	.notice-center-lead-avatar--urgent {
		background: rgba(186, 26, 26, 0.12);
		color: #ba1a1a;
	}

	.notice-center-lead-ms {
		font-size: 44rpx;
		line-height: 1;
	}

	.notice-center-lead-ms--fill {
		font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
	}

	.notice-center-main {
		flex: 1;
		min-width: 0;
	}

	.notice-center-title-line {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 10rpx;
	}

	.notice-center-item-title {
		font-size: 30rpx;
		font-weight: 700;
		color: #0f172a;
		line-height: 1.35;
	}

	.notice-center-chip {
		font-size: 18rpx;
		font-weight: 800;
		padding: 6rpx 16rpx;
		border-radius: 999rpx;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.notice-center-chip--published {
		background: rgba(0, 134, 120, 0.14);
		color: #006a5f;
	}

	.notice-center-chip--student {
		background: rgba(0, 91, 191, 0.1);
		color: #005bbf;
	}

	.notice-center-chip--teacher {
		background: rgba(72, 98, 110, 0.12);
		color: #48626e;
	}

	.notice-center-chip--urgent {
		background: #ba1a1a;
		color: #fff;
	}

	.notice-center-chip--retracted {
		background: #f1f5f9;
		color: #64748b;
	}

	.notice-center-preview {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		line-clamp: 2;
		-webkit-line-clamp: 2;
		overflow: hidden;
		font-size: 26rpx;
		color: #64748b;
		line-height: 1.55;
		margin-bottom: 14rpx;
	}

	.notice-center-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx 28rpx;
	}

	.notice-center-meta-item {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.notice-center-meta-ic {
		font-size: 26rpx;
		color: #94a3b8;
	}

	.notice-center-meta-txt {
		font-size: 22rpx;
		color: #94a3b8;
	}

	.notice-center-actions {
		display: flex;
		align-items: center;
		gap: 8rpx;
		flex-shrink: 0;
		align-self: center;
	}

	.notice-center-icon-btn {
		width: 72rpx;
		height: 72rpx;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #64748b;
		background: #f1f5f9;
		transition: background 0.2s ease, color 0.2s ease;
	}

	.notice-center-icon-btn .material-symbols-outlined {
		font-size: 36rpx;
	}

	.notice-center-icon-btn:active {
		background: #e2e8f0;
	}

	.notice-center-icon-btn--danger {
		color: #ba1a1a;
		background: rgba(255, 218, 214, 0.35);
	}

	.notice-center-icon-btn--danger:active {
		background: rgba(255, 218, 214, 0.55);
	}

	.notice-center-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80rpx 40rpx;
		border-radius: var(--ac-radius-lg, 24rpx);
		background: #f3f4f5;
		gap: 12rpx;
	}

	.notice-center-empty--filter {
		background: #edeeef;
	}

	.notice-center-empty-icon {
		font-size: 64rpx;
		color: #cbd5e1;
		margin-bottom: 8rpx;
	}

	.notice-center-empty-title {
		font-size: 30rpx;
		font-weight: 700;
		color: #475569;
	}

	.notice-center-empty-desc {
		font-size: 24rpx;
		color: #94a3b8;
		text-align: center;
		max-width: 480rpx;
		line-height: 1.5;
	}

.notice-form {
		background-color: #fff;
		border-radius: 10rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		border: none;
		box-shadow: var(--ac-shadow-card, 0 8rpx 28rpx rgba(15, 23, 42, 0.06));
	}

.notice-form--modal {
		border: none;
		padding: 0;
		margin: 0;
		background: transparent;
		min-width: 0;
		width: 100%;
		box-sizing: border-box;
		box-shadow: none;
	}

.notice-curator-tip {
		display: flex;
		align-items: flex-start;
		gap: 12rpx;
		padding: 20rpx 22rpx;
		margin-bottom: 24rpx;
		border-radius: 16rpx;
		background: rgba(0, 91, 191, 0.06);
		border: 1rpx solid rgba(0, 91, 191, 0.1);
	}

.notice-curator-tip-icon {
		font-size: 32rpx;
		color: #005bbf;
		flex-shrink: 0;
		margin-top: 2rpx;
}

.notice-curator-tip-text {
		font-size: 22rpx;
		color: #475569;
		line-height: 1.55;
		flex: 1;
	}

	/* —— 发布公告弹窗：分区 + 横向分段 —— */
	.notice-edit-modal-header {
		align-items: flex-start;
		padding: 28rpx 32rpx 24rpx !important;
		border-bottom: 1rpx solid rgba(148, 163, 184, 0.22);
		background: linear-gradient(180deg, #fafbfc 0%, #fff 100%);
	}

	.notice-edit-modal-head-text {
		display: flex;
		flex-direction: column;
		gap: 6rpx;
		min-width: 0;
		flex: 1;
		padding-right: 16rpx;
	}

	.notice-edit-modal-kicker {
		font-size: 20rpx;
		font-weight: 700;
		color: #94a3b8;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.notice-edit-modal-title {
		font-family: 'Manrope', 'Noto Sans SC', sans-serif;
		font-size: 34rpx !important;
		font-weight: 800 !important;
		color: #0f172a !important;
		letter-spacing: -0.02em;
	}

	.notice-edit-modal-close {
		width: 64rpx;
		height: 64rpx;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f1f5f9;
		color: #64748b;
		flex-shrink: 0;
	}

	.notice-edit-modal-close .material-symbols-outlined {
		font-size: 36rpx;
	}

	.notice-edit-modal-close:active {
		background: #e2e8f0;
	}

	.notice-modal-layout {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
		margin-top: 8rpx;
	}

	@media screen and (min-width: 640px) {
		.notice-modal-layout {
			flex-direction: row;
			align-items: stretch;
			gap: 28rpx;
		}
		.notice-modal-panel--audience {
			flex: 0 0 300px;
			max-width: 100%;
		}
		.notice-modal-panel--compose {
			flex: 1;
			min-width: 0;
		}
	}

	.notice-modal-panel {
		background: #f8fafc;
		border: 1rpx solid #e2e8f0;
		border-radius: 20rpx;
		padding: 22rpx 20rpx 20rpx;
		box-sizing: border-box;
	}

	.notice-modal-panel--compose {
		background: #fff;
		box-shadow: 0 8rpx 32rpx rgba(15, 23, 42, 0.05);
	}

	.notice-modal-panel-title {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 18rpx;
		padding-bottom: 14rpx;
		border-bottom: 1rpx solid #e2e8f0;
	}

	.notice-modal-panel-ic {
		font-size: 32rpx;
		color: #005bbf;
	}

	.notice-modal-panel-title-txt {
		font-size: 28rpx;
		font-weight: 800;
		color: #0f172a;
		font-family: 'Manrope', 'Noto Sans SC', sans-serif;
	}

	.notice-modal-field {
		margin-bottom: 16rpx !important;
	}

	.notice-modal-field--grow {
		margin-bottom: 0 !important;
	}

	.notice-field-label {
		display: block;
		font-size: 24rpx;
		font-weight: 600;
		color: #475569;
		margin-bottom: 8rpx;
	}

	.notice-field-head {
		display: flex;
		flex-direction: row;
		align-items: baseline;
		justify-content: space-between;
		gap: 12rpx;
		margin-bottom: 8rpx;
	}

	.notice-field-head .notice-field-label {
		margin-bottom: 0;
		flex: 1;
		min-width: 0;
	}

	.notice-char-count {
		flex-shrink: 0;
		font-size: 22rpx;
		font-weight: 500;
		color: #94a3b8;
		font-variant-numeric: tabular-nums;
	}

	.notice-char-count--warn {
		color: #d97706;
	}

	.notice-field-hint {
		display: block;
		font-size: 20rpx;
		color: #94a3b8;
		margin-top: 6rpx;
		line-height: 1.4;
	}

	.notice-segment-group {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: 10rpx;
		width: 100%;
	}

	.notice-segment-item {
		flex: 1;
		min-width: 140rpx;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
		padding: 14rpx 12rpx;
		box-sizing: border-box;
		border-radius: 12rpx;
		background: #fff;
		border: 1rpx solid #e2e8f0;
		font-size: 24rpx;
		font-weight: 600;
		color: #334155;
	}

	.notice-segment-group--triple .notice-segment-item {
		flex: 1 1 calc(33.33% - 8rpx);
		min-width: 120rpx;
		padding: 12rpx 8rpx;
		font-size: 22rpx;
	}

	.notice-input-compact {
		min-height: 72rpx !important;
		padding-top: 16rpx !important;
		padding-bottom: 16rpx !important;
		font-size: 26rpx !important;
	}

	.notice-editor-modal {
		min-height: 200rpx;
		border: 1rpx solid #e2e8f0;
	}

	.notice-editor-modal .notice-curator-textarea {
		min-height: 200rpx !important;
	}

.notice-curator-label {
		font-size: 20rpx;
		font-weight: 800;
		color: #64748b;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		margin-bottom: 10rpx;
	}

.notice-curator-input {
		background: #fff !important;
		border: 1rpx solid #e2e8f0 !important;
		border-radius: 12rpx !important;
		box-shadow: none !important;
	}

.notice-curator-hint {
		font-size: 22rpx;
		color: #94a3b8;
		margin-top: 8rpx;
	}

	.notice-modal-field--group-search {
		width: 100%;
	}

	.notice-group-search-block {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
		margin-top: 8rpx;
	}

	.notice-group-search-row {
		display: flex;
		flex-direction: row;
		align-items: stretch;
		gap: 12rpx;
	}

	.notice-group-search-input {
		flex: 1;
		min-width: 0;
		height: 72rpx;
		line-height: 72rpx;
		padding: 0 20rpx !important;
		font-size: 26rpx !important;
		box-sizing: border-box;
	}

	.notice-group-search-btn {
		flex-shrink: 0;
		display: inline-flex !important;
		align-items: center;
		justify-content: center;
		gap: 6rpx;
		height: 72rpx !important;
		line-height: 72rpx !important;
		padding: 0 22rpx !important;
		margin: 0 !important;
		font-size: 24rpx !important;
		font-weight: 600 !important;
		color: #fff !important;
		background: linear-gradient(135deg, #005bbf 0%, #1a73e8 100%) !important;
		border: none !important;
		border-radius: 12rpx !important;
		box-shadow: 0 4rpx 16rpx rgba(0, 91, 191, 0.22);
	}

	.notice-group-search-btn::after {
		border: none !important;
	}

	.notice-group-search-btn-ic {
		font-size: 32rpx !important;
		color: #fff !important;
	}

	.notice-group-result-panel {
		min-height: 120rpx;
		padding: 18rpx 20rpx;
		background: #f8fafc;
		border: 1rpx solid #e2e8f0;
		border-radius: 12rpx;
		box-sizing: border-box;
	}

	.notice-group-result-panel--confirmed {
		background: #eff6ff;
		border-color: #bfdbfe;
	}

	.notice-group-result-placeholder {
		font-size: 24rpx;
		color: #64748b;
		line-height: 1.55;
	}

	.notice-group-result-confirmed {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		gap: 12rpx;
	}

	.notice-group-result-confirmed-ic {
		font-size: 40rpx !important;
		color: #1a73e8 !important;
		flex-shrink: 0;
		margin-top: 2rpx;
	}

	.notice-group-result-confirmed-text {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.notice-group-confirmed-line {
		font-size: 26rpx;
		color: #0f172a;
		font-weight: 600;
		line-height: 1.45;
		word-break: break-all;
	}

	.notice-group-reset-link {
		font-size: 24rpx;
		color: #1a73e8;
		font-weight: 600;
		align-self: flex-start;
	}

	.notice-group-result-none {
		font-size: 26rpx;
		color: #b45309;
		line-height: 1.5;
	}

	.notice-group-result-hint {
		display: block;
		font-size: 22rpx;
		color: #64748b;
		margin-bottom: 12rpx;
		line-height: 1.45;
	}

	.notice-group-result-card {
		padding: 18rpx 20rpx;
		background: #fff;
		border: 1rpx solid #e2e8f0;
		border-radius: 12rpx;
		margin-bottom: 12rpx;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}

	.notice-group-result-card:last-child {
		margin-bottom: 0;
	}

	.notice-group-result-card--compact {
		padding: 14rpx 18rpx;
		margin-bottom: 10rpx;
	}

	.notice-group-result-card:active {
		border-color: #1a73e8;
		box-shadow: 0 4rpx 14rpx rgba(26, 115, 232, 0.12);
	}

	.notice-group-result-card-name {
		display: block;
		font-size: 28rpx;
		font-weight: 700;
		color: #0f172a;
		margin-bottom: 6rpx;
	}

	.notice-group-result-card-meta {
		display: block;
		font-size: 22rpx;
		color: #64748b;
	}

	.notice-group-result-scroll {
		max-height: 280rpx;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

.notice-curator-editor-shell {
		background: #f8fafc;
		border-radius: 14rpx;
		overflow: hidden;
	}

.notice-curator-textarea {
		background: transparent !important;
		border: none !important;
		min-height: 200rpx;
		margin-top: 0 !important;
	}

	.notice-group-picker-trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 80rpx;
		padding: 16rpx 22rpx;
		background: #f3f4f5;
		border-radius: 14rpx;
		box-sizing: border-box;
	}

	.notice-group-picker-trigger--modal {
		background: #fff;
		border: 1rpx solid #e2e8f0;
		min-height: 72rpx;
		border-radius: 12rpx;
	}

	.notice-group-picker-text {
		flex: 1;
		min-width: 0;
		font-size: 26rpx;
		color: #0f172a;
	}
	.notice-group-picker-arrow {
		font-size: 36rpx;
		color: #64748b;
		flex-shrink: 0;
	}

	.notice-modal-btn-cancel {
		border: 1rpx solid #e2e8f0 !important;
		background: #fff !important;
		color: #475569 !important;
		font-weight: 600 !important;
		border-radius: 14rpx !important;
		padding: 0 36rpx !important;
		height: 80rpx !important;
		line-height: 80rpx !important;
	}

	.notice-modal-btn-submit {
		background: linear-gradient(135deg, #005bbf 0%, #1a73e8 100%) !important;
		color: #fff !important;
		font-weight: 700 !important;
		border-radius: 14rpx !important;
		border: none !important;
		padding: 0 40rpx !important;
		height: 80rpx !important;
		line-height: 80rpx !important;
		box-shadow: 0 8rpx 24rpx rgba(0, 91, 191, 0.28);
	}

.notice-edit-modal-mask {
	z-index: 1100;
	align-items: center;
	padding: 32rpx 24rpx;
	box-sizing: border-box;
}

.form-textarea {
	display: block;
	width: 100%;
	max-width: 100%;
	min-height: 160rpx;
	box-sizing: border-box;
	border: 1px solid #e0e0e0;
	border-radius: 8rpx;
	padding: 20rpx;
	font-size: 26rpx;
	color: #333;
	margin-top: 10rpx;
}

	/* ========== 用户与权限（user_access_management） ========== */
	.tab-content-access {
		width: 100%;
	}

	.access-page {
		display: flex;
		flex-direction: column;
		gap: 32rpx;
		padding-bottom: 32rpx;
	}

	.access-bento {
		display: flex;
		flex-direction: column;
		gap: 28rpx;
	}

	@media screen and (min-width: 1024px) {
		.access-bento {
			flex-direction: row;
			align-items: stretch;
			gap: 32rpx;
		}
		.access-panel-create {
			flex: 2;
			min-width: 0;
		}
		.access-import-card {
			flex: 1;
			min-width: 280rpx;
			max-width: 100%;
		}
	}

	.access-panel-create {
		background: #fff;
		border-radius: var(--ac-radius-lg, 24rpx);
		padding: 36rpx 32rpx 40rpx;
		box-shadow: 0 20rpx 50rpx rgba(30, 58, 138, 0.06);
	}

	.access-panel-create-head {
		display: flex;
		align-items: center;
		gap: 20rpx;
		margin-bottom: 12rpx;
	}

	.access-panel-icon {
		width: 72rpx;
		height: 72rpx;
		border-radius: 16rpx;
		background: rgba(216, 226, 255, 0.9);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #005bbf;
	}

	.access-panel-icon-ms {
		font-size: 40rpx;
		font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
	}

	.access-panel-create-title {
		font-family: 'Manrope', 'Noto Sans SC', sans-serif;
		font-size: 32rpx;
		font-weight: 800;
		color: #0f172a;
	}

	.access-panel-create-sub {
		display: block;
		font-size: 24rpx;
		color: #94a3b8;
		line-height: 1.5;
		margin-bottom: 28rpx;
	}

	.access-role-tabs {
		margin-bottom: 28rpx;
		justify-content: flex-start;
		flex-wrap: wrap;
	}

	.access-role-form {
		margin-top: 0;
	}

	.access-form-input {
		background: #f3f4f5 !important;
		border: none !important;
		border-radius: 14rpx !important;
	}

	.access-submit-btn {
		background: linear-gradient(135deg, #005bbf 0%, #1a73e8 100%) !important;
		box-shadow: 0 8rpx 22rpx rgba(0, 91, 191, 0.22);
		border-radius: 14rpx !important;
	}

	.access-import-card {
		background: #fff;
		border-radius: var(--ac-radius-lg, 24rpx);
		padding: 32rpx 28rpx 28rpx;
		box-shadow: 0 20rpx 50rpx rgba(30, 58, 138, 0.06);
		border-left: 8rpx solid #005bbf;
		display: flex;
		flex-direction: column;
		gap: 22rpx;
	}

	.access-import-card-head {
		display: flex;
		align-items: flex-start;
		gap: 18rpx;
	}

	.access-import-icon {
		width: 64rpx;
		height: 64rpx;
		border-radius: 16rpx;
		background: rgba(0, 91, 191, 0.1);
		color: #005bbf;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.access-import-icon .material-symbols-outlined {
		font-size: 36rpx;
	}

	.access-import-head-text {
		flex: 1;
		min-width: 0;
	}

	.access-import-title {
		display: block;
		font-family: 'Manrope', 'Noto Sans SC', sans-serif;
		font-size: 30rpx;
		font-weight: 800;
		color: #0f172a;
		line-height: 1.3;
	}

	.access-import-lead {
		display: block;
		margin-top: 8rpx;
		font-size: 24rpx;
		color: #64748b;
		line-height: 1.5;
	}

	.access-import-tips {
		display: flex;
		flex-direction: column;
		gap: 10rpx;
		padding: 20rpx 22rpx;
		background: #f3f4f5;
		border-radius: 16rpx;
	}

	.access-import-tip-line {
		display: block;
		font-size: 22rpx;
		color: #475569;
		line-height: 1.45;
		padding-left: 18rpx;
		position: relative;
	}

	.access-import-tip-line::before {
		content: '';
		position: absolute;
		left: 0;
		top: 14rpx;
		width: 8rpx;
		height: 8rpx;
		border-radius: 50%;
		background: #005bbf;
		opacity: 0.55;
	}

	.access-import-file {
		display: flex;
		align-items: center;
		gap: 14rpx;
		padding: 16rpx 18rpx;
		background: rgba(0, 134, 120, 0.06);
		border-radius: 14rpx;
		border: 1rpx solid rgba(0, 134, 120, 0.15);
	}

	.access-import-file-ic {
		font-size: 36rpx;
		color: #006a5f;
		flex-shrink: 0;
	}

	.access-import-file-meta {
		flex: 1;
		min-width: 0;
	}

	.access-import-file-name {
		display: block;
		font-size: 24rpx;
		font-weight: 600;
		color: #0f172a;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.access-import-file-size {
		display: block;
		font-size: 20rpx;
		color: #64748b;
		margin-top: 4rpx;
	}

	.access-import-file-remove {
		font-size: 24rpx;
		color: #ba1a1a;
		font-weight: 600;
		flex-shrink: 0;
		padding: 8rpx 12rpx;
	}

	.access-import-actions {
		display: flex;
		flex-direction: column;
		gap: 14rpx;
	}

	@media screen and (min-width: 560px) {
		.access-import-actions {
			flex-direction: row;
			flex-wrap: wrap;
		}
		.access-import-btn-secondary,
		.access-import-btn-primary {
			flex: 1;
			min-width: 200rpx;
		}
	}

	.access-import-btn-secondary {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10rpx;
		padding: 22rpx 24rpx;
		border-radius: 14rpx;
		font-size: 26rpx;
		font-weight: 700;
		color: #005bbf;
		background: rgba(0, 91, 191, 0.08);
		border: none;
	}

	.access-import-btn-primary {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10rpx;
		padding: 22rpx 24rpx;
		border-radius: 14rpx;
		font-size: 26rpx;
		font-weight: 700;
		color: #fff;
		background: linear-gradient(135deg, #005bbf 0%, #1a73e8 100%);
		border: none;
		box-shadow: 0 8rpx 22rpx rgba(0, 91, 191, 0.22);
	}

	.access-import-btn-primary--disabled {
		opacity: 0.42;
		box-shadow: none;
	}

	.access-import-btn-ic {
		font-size: 30rpx;
		line-height: 1;
	}

	.access-import-result-section {
		margin-top: 28rpx;
		padding-top: 24rpx;
		border-top: 1rpx solid rgba(148, 163, 184, 0.28);
	}

	.access-import-section-title {
		display: block;
		font-family: 'Manrope', 'Noto Sans SC', sans-serif;
		font-size: 26rpx;
		font-weight: 800;
		color: #0f172a;
		letter-spacing: 0.06em;
		margin-bottom: 16rpx;
	}

	.access-import-result-placeholder {
		padding: 28rpx 24rpx;
		background: #f8fafc;
		border-radius: 16rpx;
		border: 1rpx dashed rgba(148, 163, 184, 0.45);
	}

	.access-import-result-placeholder-txt {
		font-size: 24rpx;
		color: #94a3b8;
		line-height: 1.55;
	}

	.access-import-outcome {
		background: #f8fafc;
		border-radius: 18rpx;
		padding: 22rpx 22rpx 20rpx;
		border: 1rpx solid rgba(226, 232, 240, 0.95);
		box-shadow: 0 8rpx 28rpx rgba(15, 23, 42, 0.04);
	}

	.access-import-outcome-top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16rpx;
		margin-bottom: 20rpx;
	}

	.access-import-outcome-msg {
		flex: 1;
		font-size: 28rpx;
		font-weight: 700;
		color: #0f172a;
		line-height: 1.4;
	}

	.access-import-outcome-close {
		width: 48rpx;
		height: 48rpx;
		line-height: 48rpx;
		text-align: center;
		font-size: 36rpx;
		color: #94a3b8;
		border-radius: 12rpx;
		flex-shrink: 0;
	}

	.access-import-outcome-close:active {
		background: rgba(148, 163, 184, 0.15);
	}

	.access-import-stat-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		margin-bottom: 16rpx;
	}

	.access-import-stat-card {
		flex: 1;
		min-width: 140rpx;
		padding: 20rpx 16rpx;
		background: #fff;
		border-radius: 14rpx;
		text-align: center;
		box-shadow: 0 2rpx 12rpx rgba(15, 23, 42, 0.04);
	}

	.access-import-stat-card--muted {
		background: rgba(255, 218, 214, 0.35);
	}

	.access-import-stat-num {
		display: block;
		font-family: 'Manrope', 'Noto Sans SC', sans-serif;
		font-size: 40rpx;
		font-weight: 800;
		color: #005bbf;
		line-height: 1.1;
	}

	.access-import-stat-num--warn {
		color: #ba1a1a;
	}

	.access-import-stat-label {
		display: block;
		margin-top: 8rpx;
		font-size: 22rpx;
		font-weight: 600;
		color: #64748b;
	}

	.access-import-total-line {
		display: block;
		font-size: 22rpx;
		color: #94a3b8;
		margin-bottom: 12rpx;
	}

	.access-import-error-box {
		margin-top: 8rpx;
		padding: 16rpx 18rpx;
		background: #fff;
		border-radius: 12rpx;
		border: 1rpx solid rgba(186, 26, 26, 0.15);
	}

	.access-import-error-title {
		display: block;
		font-size: 22rpx;
		font-weight: 700;
		color: #b91c1c;
		margin-bottom: 10rpx;
	}

	.access-import-error-line {
		font-size: 22rpx;
		color: #64748b;
		line-height: 1.5;
		margin-bottom: 6rpx;
	}

	.access-directory {
		background: #fff;
		border-radius: var(--ac-radius-lg, 24rpx);
		box-shadow: 0 16rpx 44rpx rgba(15, 23, 42, 0.06);
		overflow: hidden;
	}

	.access-directory-toolbar {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		padding: 28rpx 28rpx 20rpx;
		background: rgba(243, 244, 245, 0.65);
	}

	@media screen and (min-width: 720px) {
		.access-directory-toolbar {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
		}
	}

	.access-directory-title-block {
		display: flex;
		align-items: center;
		gap: 16rpx;
		flex-wrap: wrap;
	}

	.access-directory-title {
		font-family: 'Manrope', 'Noto Sans SC', sans-serif;
		font-size: 32rpx;
		font-weight: 800;
		color: #0f172a;
	}

	.access-directory-pills {
		display: flex;
		gap: 10rpx;
	}

	.access-pill {
		font-size: 18rpx;
		font-weight: 800;
		padding: 8rpx 18rpx;
		border-radius: 999rpx;
		letter-spacing: 0.04em;
	}

	.access-pill--ok {
		background: rgba(0, 134, 120, 0.12);
		color: #006a5f;
	}

	.access-directory-segment {
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 6rpx;
		background: #edeeef;
		border-radius: 14rpx;
		flex-wrap: wrap;
	}

	.access-seg-item {
		padding: 12rpx 24rpx;
		border-radius: 10rpx;
		font-size: 22rpx;
		font-weight: 700;
		color: #64748b;
	}

	.access-seg-item.active {
		background: #fff;
		color: #005bbf;
		box-shadow: 0 2rpx 10rpx rgba(15, 23, 42, 0.06);
	}

	.access-directory-search-row {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
		padding: 20rpx 28rpx 24rpx;
		background: #fff;
	}

	@media screen and (min-width: 560px) {
		.access-directory-search-row {
			flex-direction: row;
			align-items: center;
		}
		.access-dir-search {
			flex: 1;
		}
	}

	@media screen and (min-width: 768px) {
		.access-directory-search-row {
			max-width: 1200px;
			margin-left: auto;
			margin-right: auto;
			box-sizing: border-box;
		}
	}

	/* 用户目录表格：限制宽度 + Grid 均分列，避免「用户」列 flex:1 拉出过宽中空 */
	.access-directory-table-shell {
		width: 100%;
		box-sizing: border-box;
	}

	@media screen and (min-width: 768px) {
		.access-directory-table-shell {
			max-width: 1200px;
			margin-left: auto;
			margin-right: auto;
			padding-left: 8rpx;
			padding-right: 8rpx;
		}
	}

	.access-dir-search {
		display: flex;
		align-items: center;
		gap: 12rpx;
		height: 80rpx;
		padding: 0 20rpx;
		border-radius: 14rpx;
		background: #e7e8e9;
	}

	.access-dir-search-ic {
		font-size: 34rpx;
		color: #94a3b8;
	}

	.access-dir-search-input {
		flex: 1;
		min-width: 0;
		height: 80rpx;
		font-size: 26rpx;
		background: transparent;
		border: none;
	}

	.access-dir-search-btn {
		height: 80rpx;
		padding: 0 36rpx;
		border-radius: 14rpx;
		font-size: 26rpx;
		font-weight: 700;
		color: #fff;
		background: linear-gradient(135deg, #005bbf 0%, #1a73e8 100%);
		border: none;
		box-shadow: 0 8rpx 20rpx rgba(0, 91, 191, 0.2);
	}

	.access-table-head {
		display: none;
		padding: 12rpx 28rpx;
		background: rgba(248, 250, 252, 0.95);
		font-size: 20rpx;
		font-weight: 800;
		color: #64748b;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	@media screen and (min-width: 768px) {
		.access-table-head {
			display: grid;
			grid-template-columns:
				minmax(0, 1.25fr) minmax(120px, 0.95fr) minmax(72px, 0.38fr) minmax(138px, 0.92fr)
				minmax(108px, 0.42fr);
			column-gap: 20rpx;
			align-items: center;
			padding: 18rpx 20rpx 14rpx;
			margin: 0 4rpx;
			border-radius: 18rpx 18rpx 0 0;
		}
		.access-th-user {
			justify-self: start;
			min-width: 0;
		}
		.access-th-bizid {
			justify-self: start;
			min-width: 0;
			text-align: left;
			line-height: 1.35;
			white-space: normal;
		}
		.access-th-role {
			width: auto;
			justify-self: center;
			text-align: center;
		}
		.access-th-created {
			width: auto;
			justify-self: center;
			text-align: center;
		}
		.access-th-actions {
			width: auto;
			justify-self: end;
			text-align: right;
			padding-right: 0;
		}
	}

	.access-user-rows {
		padding: 12rpx 20rpx 28rpx;
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.access-user-created-prefix {
		display: none;
	}

	.access-user-created {
		font-size: 24rpx;
		color: #64748b;
		font-variant-numeric: tabular-nums;
		line-height: 1.35;
		text-align: center;
	}

	.access-user-created-cell {
		display: flex;
		flex-direction: row;
		align-items: center;
		flex-wrap: wrap;
		flex-basis: 100%;
		padding-left: 92rpx;
		margin-top: -4rpx;
		justify-content: flex-start;
		gap: 0;
	}

	.access-user-created-cell .access-user-created {
		text-align: left;
	}

	@media screen and (max-width: 767px) {
		.access-user-created-prefix {
			display: inline;
			font-size: 22rpx;
			color: #94a3b8;
			margin-right: 8rpx;
		}
	}

	.access-user-bizid-cell {
		display: flex;
		flex-direction: row;
		align-items: center;
		flex-wrap: wrap;
		flex-basis: 100%;
		padding-left: 92rpx;
		margin-top: -2rpx;
		gap: 6rpx;
	}

	.access-user-bizid-prefix {
		font-size: 22rpx;
		color: #94a3b8;
		flex-shrink: 0;
	}

	.access-user-bizid {
		font-size: 26rpx;
		font-weight: 600;
		color: #334155;
		font-variant-numeric: tabular-nums;
		word-break: break-all;
	}

	.access-user-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 20rpx;
		padding: 24rpx 22rpx;
		background: #f8fafc;
		border-radius: 20rpx;
		transition: background 0.2s ease, box-shadow 0.2s ease;
	}

	.access-user-row:active {
		background: #f1f5f9;
	}

	@media screen and (min-width: 768px) {
		.access-user-rows {
			padding: 0 4rpx 28rpx;
		}
		.access-user-row {
			display: grid;
			grid-template-columns:
				minmax(0, 1.25fr) minmax(120px, 0.95fr) minmax(72px, 0.38fr) minmax(138px, 0.92fr)
				minmax(108px, 0.42fr);
			column-gap: 20rpx;
			align-items: center;
			flex-wrap: unset;
			justify-content: unset;
			padding: 20rpx 20rpx;
			margin-bottom: 2rpx;
		}
		.access-user-profile {
			flex: unset;
			min-width: 0;
			max-width: 100%;
		}
		.access-user-bizid-cell {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: flex-start;
			justify-self: stretch;
			min-width: 0;
			padding-left: 0;
			margin-top: 0;
			flex-basis: auto;
		}
		.access-user-bizid-prefix {
			display: none;
		}
		.access-user-bizid {
			font-size: 26rpx;
			font-weight: 600;
			color: #334155;
			font-variant-numeric: tabular-nums;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.access-user-role-cell {
			width: auto;
			display: flex;
			justify-content: center;
			justify-self: center;
		}
		.access-user-created-cell {
			width: auto;
			max-width: 100%;
			flex-basis: auto;
			flex-shrink: 0;
			display: flex;
			flex-direction: row;
			justify-content: center;
			align-items: center;
			justify-self: center;
			padding-left: 0;
			margin-top: 0;
		}

		.access-user-created-cell .access-user-created-prefix {
			display: none;
		}

		.access-user-created-cell .access-user-created {
			text-align: center;
		}
		.access-user-actions {
			width: auto;
			justify-content: flex-end;
			justify-self: end;
		}
	}

	.access-user-profile {
		display: flex;
		align-items: center;
		gap: 20rpx;
		min-width: 200rpx;
		flex: 1;
	}

	.access-user-avatar {
		width: 72rpx;
		height: 72rpx;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.access-user-avatar-letter {
		font-size: 28rpx;
		font-weight: 800;
		color: #0f172a;
	}

	.access-user-avatar--student {
		background: rgba(203, 231, 245, 0.85);
	}

	.access-user-avatar--teacher {
		background: rgba(141, 245, 228, 0.35);
	}

	.access-user-avatar--admin {
		background: rgba(216, 226, 255, 0.95);
	}

	.access-user-text {
		min-width: 0;
		flex: 1;
		overflow: hidden;
	}

	.access-user-name {
		display: block;
		font-size: 28rpx;
		font-weight: 700;
		color: #0f172a;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.access-user-sub {
		display: block;
		font-size: 22rpx;
		color: #94a3b8;
		margin-top: 4rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.access-chip {
		font-size: 20rpx;
		font-weight: 800;
		padding: 8rpx 20rpx;
		border-radius: 999rpx;
	}

	.access-chip--student {
		background: rgba(203, 231, 245, 0.9);
		color: #48626e;
	}

	.access-chip--teacher {
		background: rgba(0, 134, 120, 0.15);
		color: #006a5f;
	}

	.access-chip--admin {
		background: linear-gradient(135deg, #005bbf 0%, #1a73e8 100%);
		color: #fff;
	}

	.access-user-actions {
		display: flex;
		align-items: center;
		gap: 10rpx;
	}

	.access-row-icon-btn {
		width: 68rpx;
		height: 68rpx;
		border-radius: 14rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #fff;
		color: #005bbf;
		box-shadow: 0 4rpx 14rpx rgba(15, 23, 42, 0.06);
	}

	.access-row-icon-btn .material-symbols-outlined {
		font-size: 34rpx;
	}

	.access-row-icon-btn:active {
		opacity: 0.85;
	}

	.access-directory-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 56rpx 32rpx 64rpx;
		gap: 12rpx;
	}

	.access-directory-empty-ic {
		font-size: 64rpx;
		color: #cbd5e1;
	}

	.access-directory-empty-title {
		font-size: 28rpx;
		font-weight: 700;
		color: #64748b;
	}

	.access-directory-empty-desc {
		font-size: 24rpx;
		color: #94a3b8;
		text-align: center;
		max-width: 520rpx;
		line-height: 1.5;
	}
	
	.permission-section {
		background-color: var(--ac-surface-card, #fff);
		padding: 36rpx 32rpx;
		border-radius: var(--ac-radius-lg, 24rpx);
		box-shadow: var(--ac-shadow-card);
		border: none;
	}
	
	.search-bar {
		display: flex;
		margin-bottom: 30rpx;
	}
	
	.search-input {
		flex: 1;
		padding: 20rpx;
		border: 1px solid #e0e0e0;
		border-radius: 5rpx;
		font-size: 28rpx;
		margin-right: 20rpx;
		height: 88rpx;
		box-sizing: border-box;
	}
	
	.search-btn {
		padding: 20rpx 30rpx;
		height: 88rpx;
		box-sizing: border-box;
		background: linear-gradient(135deg, #005bbf 0%, #1a73e8 100%);
		color: #fff;
		border-radius: 5rpx;
		font-size: 28rpx;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.user-list {
		display: flex;
		flex-direction: column;
	}
	
	.user-card {
		background-color: #f8fafc;
		padding: 28rpx 30rpx;
		border-radius: var(--ac-radius-md, 20rpx);
		margin-bottom: 20rpx;
		border: 1rpx solid var(--ac-outline-ghost, rgba(148, 163, 184, 0.22));
		box-shadow: 0 4rpx 16rpx rgba(15, 23, 42, 0.04);
		transition: box-shadow 0.22s ease;
	}
	
	.user-card:hover {
		box-shadow: var(--ac-shadow-card);
	}
	
	.user-header {
		margin-bottom: 20rpx;
	}
	
	.user-info {
		display: flex;
		align-items: center;
	}
	
	.user-name {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-right: 20rpx;
	}
	
	.user-id {
		font-size: 24rpx;
		color: #999;
		margin-right: 20rpx;
	}
	
	.user-role {
		padding: 5rpx 15rpx;
		border-radius: 5rpx;
		font-size: 22rpx;
	}
	
	.role-teacher {
		background-color: rgba(0, 91, 191, 0.08);
		color: #005bbf;
	}
	
	.role-student {
		background-color: #f6ffed;
		color: #52c41a;
	}
	
	.role-admin {
		background-color: #fff2f0;
		color: #ff4d4f;
	}

	/* 编辑权限弹窗样式 */
	.permission-user-info {
		display: flex;
		align-items: center;
		gap: 20rpx;
		padding: 20rpx 30rpx;
		background-color: #f5f7fa;
		border-radius: 10rpx;
		margin-bottom: 30rpx;
	}
	.permission-user-name {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}
	.permission-user-role {
		padding: 4rpx 16rpx;
		border-radius: 20rpx;
		font-size: 24rpx;
	}
	.permission-section-title {
		display: block;
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
	}
	.permission-divider {
		height: 1px;
		background-color: #f0f0f0;
		margin: 30rpx 0;
	}
	.confirm-btn-blue {
		margin-top: 20rpx;
		background-color: #1677ff;
		color: #fff;
		border-radius: 8rpx;
		font-size: 28rpx;
		padding: 16rpx 0;
	}
	.danger-section {
		background-color: #fff8f8;
		border: 1px solid #ffccc7;
		border-radius: 10rpx;
		padding: 24rpx;
	}
	.danger-title {
		color: #ff4d4f;
	}
	.danger-tip {
		display: block;
		font-size: 24rpx;
		color: #999;
		margin-bottom: 20rpx;
	}
	.danger-btn {
		background-color: #ff4d4f;
		color: #fff;
		border-radius: 8rpx;
		font-size: 28rpx;
		padding: 16rpx 0;
	}
	/* 内嵌确认弹窗 */
	.inner-confirm-mask {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.45);
		border-radius: 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10;
	}
	.inner-confirm-box {
		background: #fff;
		border-radius: 16rpx;
		padding: 40rpx 36rpx 28rpx;
		width: 80%;
		box-shadow: 0 8px 32px rgba(0,0,0,0.18);
	}
	.inner-confirm-title {
		display: block;
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
		text-align: center;
	}
	.inner-confirm-content {
		display: block;
		font-size: 28rpx;
		color: #555;
		text-align: center;
		margin-bottom: 36rpx;
		line-height: 1.6;
	}
	.inner-confirm-btns {
		display: flex;
		gap: 20rpx;
	}
	.inner-cancel-btn {
		flex: 1;
		background: #f5f5f5;
		color: #666;
		border-radius: 8rpx;
		font-size: 28rpx;
		padding: 18rpx 0;
		border: none;
	}
	.inner-danger-btn {
		flex: 1;
		background: #ff4d4f;
		color: #fff;
		border-radius: 8rpx;
		font-size: 28rpx;
		padding: 18rpx 0;
		border: none;
	}
	.inner-confirm-btn {
		flex: 1;
		background: #1677ff;
		color: #fff;
		border-radius: 8rpx;
		font-size: 28rpx;
		padding: 18rpx 0;
		border: none;
	}
	.picker-display {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16rpx 20rpx;
		border: 1px solid #e0e0e0;
		border-radius: 8rpx;
		background-color: #fff;
		color: #333;
		font-size: 28rpx;
	}
	.picker-arrow {
		color: #999;
		font-size: 22rpx;
		transition: transform 0.2s;
	}
	.arrow-up {
		transform: rotate(180deg);
	}
	.custom-select-wrap {
		position: relative;
	}
	.custom-select-dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background-color: #fff;
		border: 1px solid #e0e0e0;
		border-radius: 8rpx;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
		z-index: 9999;
		overflow: hidden;
		margin-top: 4rpx;
	}
	.dropdown-item {
		padding: 20rpx 24rpx;
		font-size: 28rpx;
		color: #333;
		cursor: pointer;
	}
	.dropdown-item:hover {
		background-color: #f0f7ff;
	}
	.dropdown-item-active {
		background-color: #e6f4ff;
		color: #1677ff;
	}
	
	.user-permissions {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}
	
	.permission-label {
		font-size: 28rpx;
		color: #666;
		margin-right: 10rpx;
	}
	
	.permission-value {
		font-size: 28rpx;
		color: #333;
	}
	
	.download-section {
		background-color: var(--ac-surface-card, #fff);
		padding: 36rpx 32rpx;
		border-radius: var(--ac-radius-lg, 24rpx);
		box-shadow: var(--ac-shadow-card);
		border: none;
	}
	
	.download-filters {
		margin-bottom: 30rpx;
	}
	
	.filter-item {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}
	
	.filter-item-column {
		flex-direction: column;
		align-items: stretch;
	}
	
	.filter-item-column .filter-label {
		width: 100%;
		margin-bottom: 12rpx;
	}
	
	.filter-input-row {
		display: flex;
		align-items: stretch;
		gap: 16rpx;
		width: 100%;
		min-width: 0;
	}
	
	/* input 在 flex 里默认高度极易被压扁，需显式高度与盒模型 */
	.download-group-name-input {
		flex: 1;
		min-width: 0;
		min-height: 80rpx;
		height: 80rpx;
		line-height: 44rpx;
		padding: 18rpx 24rpx;
		box-sizing: border-box;
		border: 1px solid #e0e0e0;
		border-radius: 8rpx;
		font-size: 28rpx;
		color: #333;
		background-color: #fff;
	}
	
	.download-preview-count-btn {
		flex-shrink: 0;
		align-self: stretch;
		min-height: 80rpx;
		font-size: 26rpx;
		padding: 0 24rpx;
		line-height: normal;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.download-name-hint {
		display: block;
		font-size: 24rpx;
		color: #888;
		margin-top: 12rpx;
		line-height: 1.4;
	}
	
	.filter-label {
		font-size: 28rpx;
		color: #333;
		width: 200rpx;
	}
	
	.picker-view {
		flex: 1;
		padding: 20rpx;
		border: 1px solid #e0e0e0;
		border-radius: 5rpx;
		font-size: 28rpx;
		color: #333;
	}
	
	.download-preview {
		padding: 20rpx;
		background-color: #f5f5f5;
		border-radius: 5rpx;
		margin-bottom: 30rpx;
	}
	
	.preview-title {
		font-size: 28rpx;
		color: #333;
		display: block;
		margin-bottom: 10rpx;
	}
	
	.preview-size {
		font-size: 24rpx;
		color: #999;
		display: block;
	}
	
	.download-options {
		margin-bottom: 30rpx;
	}
	
	.option-fixed-tip {
		font-size: 28rpx;
		color: #52c41a;
		font-weight: 500;
	}
	
	.download-btn {
		width: 100%;
		padding: 30rpx;
		background: linear-gradient(135deg, #005bbf 0%, #1a73e8 100%);
		color: #fff;
		border-radius: 10rpx;
		font-size: 32rpx;
		border: none;
	}
	
	.audit-section {
		background-color: #fff;
		padding: 30rpx;
		border-radius: 10rpx;
	}
	
	.audit-filters {
		margin-bottom: 30rpx;
	}
	
	.date-separator {
		margin: 0 20rpx;
		font-size: 28rpx;
		color: #666;
	}
	
	.audit-list {
		display: flex;
		flex-direction: column;
	}
	
	.audit-item {
		padding: 30rpx;
		border-bottom: 1px solid #f0f0f0;
	}
	
	.audit-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 15rpx;
	}
	
	.audit-user {
		display: flex;
		align-items: center;
	}
	
	.audit-time {
		font-size: 24rpx;
		color: #999;
	}
	
	.audit-content {
		display: flex;
		align-items: center;
		margin-bottom: 15rpx;
	}
	
	.action-type {
		padding: 5rpx 15rpx;
		border-radius: 5rpx;
		font-size: 22rpx;
		margin-right: 15rpx;
	}
	
	.action-login {
		background-color: rgba(0, 91, 191, 0.08);
		color: #005bbf;
	}
	
	.action-upload {
		background-color: #f6ffed;
		color: #52c41a;
	}
	
	.action-download {
		background-color: #fff7e6;
		color: #fa8c16;
	}
	
	.action-annotation {
		background-color: #f9f0ff;
		color: #722ed1;
	}
	
	.action-finalize {
		background-color: #fff1f0;
		color: #ff4d4f;
	}
	
	.action-detail {
		font-size: 28rpx;
		color: #333;
		flex: 1;
	}
	
	.audit-meta {
		display: flex;
	}
	
	.meta-item {
		font-size: 24rpx;
		color: #999;
		margin-right: 30rpx;
	}
	
	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 30rpx;
		padding: 30rpx 0;
	}
	
	.page-btn {
		padding: 15rpx 30rpx;
		border: 1px solid #e0e0e0;
		border-radius: 5rpx;
		background-color: #fff;
		color: #666;
		font-size: 28rpx;
		margin: 0 20rpx;
	}
	
	.page-btn[disabled] {
		background-color: #f5f5f5;
		color: #d9d9d9;
		border-color: #d9d9d9;
	}
	
	.page-info {
		font-size: 28rpx;
		color: #666;
	}
	
	/* 群组弹窗 */
	/* ============================================
	   群组弹窗 - 现代卡片设计
	   ============================================ */
	.group-modal {
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
	
	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	
	.group-modal-content {
		width: 900rpx;
		max-width: 96vw;
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
	
	/* 群组 / 成员 / 邀请：统一对话框壳（对齐公告中心 Bento 色系） */
	.admin-dialog-sheet {
		background: #fff;
		border-radius: 24rpx;
		display: flex;
		flex-direction: column;
		max-height: 88vh;
		border: 1rpx solid rgba(148, 163, 184, 0.28);
		box-shadow: 0 28rpx 90rpx rgba(15, 23, 42, 0.18);
		animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		overflow: hidden;
	}
	
	.admin-dialog-sheet--wide {
		width: 720rpx;
		max-width: 94vw;
	}
	
	.admin-dialog-sheet--compact {
		width: 600rpx;
		max-width: 90vw;
	}
	
	.admin-dialog-header {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: flex-start;
		padding: 32rpx 36rpx 28rpx;
		background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
		border-bottom: 1rpx solid rgba(148, 163, 184, 0.22);
		flex-shrink: 0;
	}
	
	.admin-dialog-header--center {
		justify-content: center;
		text-align: center;
	}
	
	.admin-dialog-header-text {
		flex: 1;
		min-width: 0;
		padding-right: 16rpx;
	}
	
	.admin-dialog-kicker {
		display: block;
		font-size: 22rpx;
		font-weight: 700;
		color: #64748b;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		margin-bottom: 8rpx;
	}
	
	.admin-dialog-title {
		font-family: 'Manrope', 'Noto Sans SC', sans-serif;
		font-size: 36rpx;
		font-weight: 800;
		color: #0f172a;
		line-height: 1.25;
		display: block;
	}
	
	.admin-dialog-title--solo {
		width: 100%;
		text-align: center;
		padding-right: 0;
	}
	
	.admin-dialog-close {
		width: 64rpx;
		height: 64rpx;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		background: rgba(148, 163, 184, 0.12);
		color: #475569;
		transition: background 0.2s ease, color 0.2s ease;
	}
	
	.admin-dialog-close .material-symbols-outlined {
		font-size: 36rpx;
	}
	
	.admin-dialog-close:active {
		background: rgba(0, 91, 191, 0.12);
		color: #005bbf;
	}
	
	.admin-dialog-body {
		padding: 32rpx 36rpx 36rpx;
		flex-shrink: 0;
	}
	
	.admin-dialog-body--center {
		text-align: center;
		padding-top: 24rpx;
		padding-bottom: 36rpx;
	}
	
	.admin-dialog-form-item {
		margin-bottom: 28rpx;
	}
	
	.admin-dialog-form-item:last-child {
		margin-bottom: 0;
	}
	
	.admin-dialog-input {
		height: auto;
		min-height: 88rpx;
		border-radius: 14rpx;
		border: 1rpx solid #e2e8f0;
		background: #f8fafc;
	}
	
	.admin-dialog-input:focus {
		background: #fff;
		border-color: #005bbf;
		box-shadow: 0 0 0 3rpx rgba(0, 91, 191, 0.1);
	}
	
	.admin-dialog-picker {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		min-height: 88rpx;
		padding: 0 22rpx;
		border: 1rpx solid #e2e8f0;
		border-radius: 14rpx;
		background: #f8fafc;
		font-size: 28rpx;
		color: #0f172a;
		box-sizing: border-box;
	}
	
	.admin-dialog-picker-arrow {
		font-size: 36rpx;
		color: #94a3b8;
	}
	
	.admin-dialog-footer {
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
		align-items: center;
		gap: 16rpx;
		padding: 20rpx 36rpx 28rpx;
		background: #f8fafc;
		border-top: 1rpx solid rgba(148, 163, 184, 0.2);
		flex-shrink: 0;
	}
	
	.admin-dialog-footer--single {
		justify-content: stretch;
	}
	
	.admin-dialog-footer--split {
		justify-content: stretch;
		gap: 0;
		padding: 0;
		border-top: 1rpx solid #e2e8f0;
	}
	
	.admin-dialog-footer--split .admin-dialog-btn {
		flex: 1;
		border-radius: 0;
		min-height: 100rpx;
		margin: 0;
	}
	
	.admin-dialog-footer--split .admin-dialog-btn--ghost {
		border-right: 1rpx solid #e2e8f0;
	}
	
	.admin-dialog-btn {
		margin: 0;
		padding: 0 36rpx;
		min-height: 88rpx;
		line-height: 1.2;
		border-radius: 14rpx;
		font-size: 30rpx;
		font-weight: 700;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: opacity 0.15s ease, transform 0.15s ease;
		box-sizing: border-box;
	}
	
	.admin-dialog-btn:active {
		opacity: 0.92;
		transform: scale(0.99);
	}
	
	.admin-dialog-btn--block {
		width: 100%;
	}
	
	.admin-dialog-btn--ghost {
		background: #fff;
		color: #475569;
		border: 1rpx solid #e2e8f0;
	}
	
	.admin-dialog-btn--primary {
		background: linear-gradient(135deg, #005bbf 0%, #1a73e8 100%);
		color: #fff;
		box-shadow: 0 8rpx 22rpx rgba(0, 91, 191, 0.25);
	}
	
	.admin-dialog-btn--danger {
		background: #fef2f2;
		color: #dc2626;
		border: 1rpx solid #fecaca;
	}
	
	.admin-dialog-btn--danger-solid {
		background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
		color: #fff;
		border: none;
		box-shadow: 0 8rpx 24rpx rgba(220, 38, 38, 0.28);
	}
	
	.admin-dialog-warn-badge {
		width: 104rpx;
		height: 104rpx;
		margin: 0 auto 28rpx;
		border-radius: 50%;
		background: linear-gradient(145deg, #fef2f2 0%, #fee2e2 100%);
		border: 1rpx solid #fecaca;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 24rpx rgba(220, 38, 38, 0.08);
	}
	
	.admin-dialog-warn-badge-ic {
		font-size: 52rpx;
		color: #dc2626;
	}
	
	.admin-delete-confirm-text {
		font-size: 28rpx;
		color: #475569;
		line-height: 1.65;
		display: block;
	}
	
	/* ============================================
	   弹窗头部 - 精致标题与关闭按钮
	   ============================================ */
	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 36rpx 40rpx;
		background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
		border-bottom: 1rpx solid #f0f0f0;
	}
	
	.modal-title {
		font-size: 36rpx;
		font-weight: 700;
		color: #262626;
		letter-spacing: 1rpx;
	}
	
	.close-btn {
		font-size: 44rpx;
		color: #8c8c8c;
		width: 56rpx;
		height: 56rpx;
		text-align: center;
		line-height: 52rpx;
		border-radius: 50%;
		transition: all 0.25s ease;
		cursor: pointer;
	}
	
	.close-btn:hover {
		background: rgba(0, 0, 0, 0.04);
		color: #595959;
	}
	
	.close-btn:active {
		background: rgba(0, 0, 0, 0.08);
	}
	
	/* ============================================
	   弹窗内容区 - 舒适间距
	   ============================================ */
	.modal-body {
		padding: 40rpx 60rpx;
		overflow: hidden;
	}
	
	.form-item {
		margin-bottom: 36rpx;
	}
	
	.form-item:last-child {
		margin-bottom: 0;
	}
	
	/* ============================================
	   表单标签 - 现代字体
	   ============================================ */
	.form-label {
		font-size: 28rpx;
		color: #262626;
		display: block;
		margin-bottom: 16rpx;
		font-weight: 500;
	}
	
	/* ============================================
	   输入框 - 现代边框与焦点效果
	   ============================================ */
	.form-input {
		width: 100%;
		height: 88rpx;
		padding: 0 24rpx;
		border: 2rpx solid #e8e8e8;
		border-radius: 12rpx;
		font-size: 28rpx;
		background: #fafafa;
		transition: all 0.25s ease;
		color: #262626;
		box-sizing: border-box;
	}
	
	.form-input:hover {
		border-color: #d9d9d9;
		background: #fff;
	}
	
	.form-input:focus {
		border-color: #005bbf;
		background: #fff;
		box-shadow: 0 0 0 4rpx rgba(0, 91, 191, 0.12);
		outline: none;
	}
	
	.form-input::placeholder {
		color: #bfbfbf;
	}
	
	/* ============================================
	   单选按钮组 - 卡片式布局
	   ============================================ */
	.radio-label {
		display: flex;
		align-items: center;
		margin-right: 40rpx;
		font-size: 28rpx;
		color: #595959;
		padding: 16rpx 24rpx;
		background: #fafafa;
		border-radius: 12rpx;
		border: 2rpx solid #e8e8e8;
		transition: all 0.25s ease;
		cursor: pointer;
	}
	
	.radio-label:hover {
		border-color: #005bbf;
		background: rgba(0, 91, 191, 0.06);
		color: #005bbf;
	}
	
	radio {
		transform: scale(0.9);
		margin-right: 12rpx;
	}
	
	/* ============================================
	   弹窗底部 - 按钮区域
	   ============================================ */
	.modal-footer {
		display: flex;
		justify-content: flex-end;
		padding: 32rpx 40rpx;
		background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
		border-top: 1rpx solid #f0f0f0;
		gap: 20rpx;
	}
	
	/* ============================================
	   按钮 - 渐变与阴影效果
	   ============================================ */
	.cancel-btn, .save-btn {
		padding: 18rpx 36rpx;
		border-radius: 12rpx;
		font-size: 28rpx;
		border: none;
		font-weight: 500;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		cursor: pointer;
	}
	
	.cancel-btn {
		background: #fff;
		color: #595959;
		border: 2rpx solid #d9d9d9;
	}
	
	.cancel-btn:hover {
		border-color: #005bbf;
		color: #005bbf;
		background: rgba(0, 91, 191, 0.06);
	}
	
	.cancel-btn:active {
		transform: scale(0.98);
	}
	
	.save-btn {
		background: linear-gradient(135deg, #005bbf 0%, #1a73e8 100%);
		color: #fff;
		box-shadow: 0 4rpx 12rpx rgba(0, 91, 191, 0.28);
	}
	
	.save-btn:hover {
		transform: translateY(-2rpx);
		box-shadow: 0 6rpx 20rpx rgba(0, 91, 191, 0.36);
	}
	
	.save-btn:active {
		transform: translateY(0);
	}
	
	/* ============================================
	   成员详情弹窗样式
	   ============================================ */
	.member-modal {
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
	
	.member-modal-content.admin-dialog-sheet {
		width: 1000rpx;
		max-width: 96vw;
		max-height: 90vh;
	}
	
	.member-modal-scroll-body {
		flex: 1;
		min-height: 220rpx;
		max-height: 1000rpx;
		overflow-y: auto;
		padding: 24rpx 36rpx 8rpx;
		-webkit-overflow-scrolling: touch;
	}
	
	/* 成员区域 */
	.member-section {
		margin-bottom: 40rpx;
	}
	
	.member-section:last-child {
		margin-bottom: 0;
	}
	
	.section-header-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
		gap: 16rpx;
		flex-wrap: wrap;
	}
	
	/* 成员弹窗：标题占左、邀请按钮贴右（避免 text/button 在 flex 下未撑满一行） */
	.member-modal .section-header-row {
		width: 100%;
		box-sizing: border-box;
		flex-wrap: nowrap;
	}
	
	.member-modal .section-header-row .section-title {
		flex: 1;
		min-width: 0;
		font-size: 30rpx;
		font-weight: 800;
		color: #0f172a;
		padding-left: 0;
		font-family: 'Manrope', 'Noto Sans SC', sans-serif;
	}
	
	.member-modal .section-header-row .invite-btn {
		margin-left: auto;
		flex-shrink: 0;
		width: auto;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}
	
	.member-modal .section-header-row .section-title::before {
		display: none;
	}
	
	.invite-btn {
		padding: 14rpx 26rpx;
		background: linear-gradient(135deg, #005bbf 0%, #1a73e8 100%);
		color: #fff;
		border: none;
		border-radius: 12rpx;
		font-size: 24rpx;
		font-weight: 700;
		box-shadow: 0 6rpx 18rpx rgba(0, 91, 191, 0.22);
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}
	
	.invite-btn:active {
		transform: scale(0.98);
	}
	
	/* 删除成员 / 删除群组确认 */
	.delete-member-modal,
	.delete-group-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(15, 23, 42, 0.45);
		backdrop-filter: blur(10rpx);
		-webkit-backdrop-filter: blur(10rpx);
		z-index: 2000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 32rpx;
		box-sizing: border-box;
		animation: fadeIn 0.2s ease;
	}
	
	.delete-member-modal-content.admin-dialog-sheet {
		animation: slideUp 0.28s cubic-bezier(0.4, 0, 0.2, 1);
	}
	
	.delete-group-modal-content.admin-dialog-sheet {
		animation: slideUp 0.28s cubic-bezier(0.4, 0, 0.2, 1);
		width: 820rpx;
		max-width: 94vw;
	}
	
	/* 邀请弹窗 */
	.invite-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(8rpx);
		z-index: 1100;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.invite-modal-content.admin-dialog-sheet {
		width: 640rpx;
		max-width: 92vw;
	}
	
	/* 成员列表 */
	.member-list {
		background: #f1f5f9;
		border-radius: 18rpx;
		padding: 14rpx;
		border: 1rpx solid #e2e8f0;
	}
	
	.member-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		box-sizing: border-box;
		padding: 22rpx 20rpx;
		background: #fff;
		border-radius: 14rpx;
		margin-bottom: 12rpx;
		border: 1rpx solid rgba(148, 163, 184, 0.2);
		box-shadow: 0 4rpx 14rpx rgba(15, 23, 42, 0.05);
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}
	
	.member-item:last-child {
		margin-bottom: 0;
	}
	
	.member-item:hover {
		border-color: rgba(0, 91, 191, 0.25);
		box-shadow: 0 8rpx 22rpx rgba(15, 23, 42, 0.08);
	}
	
	.member-info {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
		flex: 1;
		min-width: 0;
	}
	
	.member-name {
		font-size: 30rpx;
		font-weight: 700;
		color: #0f172a;
	}
	
	.member-id {
		font-size: 24rpx;
		color: #64748b;
		font-variant-numeric: tabular-nums;
	}
	
	/* 删除成员按钮 */
	.delete-member-btn {
		padding: 12rpx 22rpx;
		background: #fff;
		color: #dc2626;
		border: 1rpx solid #fecaca;
		border-radius: 12rpx;
		font-size: 24rpx;
		font-weight: 600;
		transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
		margin-left: auto;
		flex-shrink: 0;
		width: auto;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}
	.delete-member-btn:active {
		background: #fef2f2;
		border-color: #f87171;
	}
	
	/* 空状态提示 */
	.empty-tip {
		text-align: center;
		padding: 40rpx;
		color: #8c8c8c;
		font-size: 28rpx;
	}
	
	/* 加载状态 */
	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 80rpx;
		color: #8c8c8c;
		font-size: 28rpx;
	}
	
	/* ============================================
	   控制台样式（对齐 admin_console_dashboard Bento + 分栏）
	   ============================================ */
	.tab-content-dashboard {
		max-width: 100%;
	}

	/* ========== 群组关系一览 ========== */
	.tab-content-group-relations {
		max-width: 100%;
	}

	.group-relations-page {
		display: flex;
		flex-direction: column;
		gap: 32rpx;
		padding-bottom: 24rpx;
	}

	.group-relations-toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: 16rpx;
		position: relative;
		/* 高于下拉遮罩 .group-relations-dropdown-mask(90)，且低于粘性顶栏 .admin-topbar(200)，避免压住右上角菜单 */
		z-index: 95;
	}

	.group-relations-dropdown-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 90;
		background: rgba(15, 23, 42, 0.06);
	}

	.group-relations-select-wrap {
		position: relative;
		flex-shrink: 0;
		width: 280rpx;
		max-width: 36vw;
		z-index: 96;
	}

	.group-relations-select-wrap.is-open {
		z-index: 97;
	}

	.group-relations-select-wrap--role {
		width: 240rpx;
		max-width: 34vw;
	}

	.group-relations-filter-picker {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 12rpx;
		height: 72rpx;
		padding: 0 20rpx;
		background: #fff;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 20rpx rgba(30, 58, 138, 0.08);
		border: 1rpx solid rgba(148, 163, 184, 0.35);
		width: 100%;
		box-sizing: border-box;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
		cursor: pointer;
	}

	.group-relations-filter-picker.is-open {
		border-color: #005bbf;
		box-shadow:
			0 0 0 3rpx rgba(0, 91, 191, 0.12),
			0 8rpx 24rpx rgba(30, 58, 138, 0.1);
	}

	.group-relations-filter-picker:active {
		opacity: 0.96;
	}

	.group-relations-filter-label {
		font-size: 22rpx;
		font-weight: 600;
		color: #64748b;
		flex-shrink: 0;
	}

	.group-relations-filter-value {
		flex: 1;
		min-width: 0;
		font-size: 26rpx;
		color: #0f172a;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.group-relations-filter-arrow {
		font-size: 32rpx;
		color: #94a3b8;
		flex-shrink: 0;
		transition: transform 0.22s ease, color 0.2s ease;
	}

	.group-relations-filter-arrow.is-open {
		transform: rotate(180deg);
		color: #005bbf;
	}

	.group-relations-dropdown-panel {
		position: absolute;
		top: calc(100% + 10rpx);
		left: 0;
		right: 0;
		min-width: 100%;
		background: #fff;
		border-radius: 16rpx;
		border: 1rpx solid rgba(148, 163, 184, 0.28);
		box-shadow:
			0 24rpx 48rpx rgba(15, 23, 42, 0.14),
			0 8rpx 16rpx rgba(15, 23, 42, 0.06);
		overflow: hidden;
	}

	/* 群组列表：面板比触发条更宽，单行展示班级名；可视高度约 5 条 */
	.group-relations-dropdown-panel--group {
		left: 0;
		right: auto;
		width: 620rpx;
		max-width: 92vw;
	}

	.group-relations-dropdown-panel--group .group-relations-dropdown-scroll {
		max-height: 400rpx;
	}

	.group-relations-dropdown-panel--group .group-relations-dropdown-item-text {
		white-space: nowrap;
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.group-relations-dropdown-scroll {
		max-height: 360rpx;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

	.group-relations-dropdown-item {
		padding: 24rpx 28rpx;
		text-align: left;
		border-bottom: 1rpx solid #f1f5f9;
		transition: background 0.15s ease;
		cursor: pointer;
	}

	.group-relations-dropdown-item:last-child {
		border-bottom: none;
	}

	.group-relations-dropdown-item:hover {
		background: #f8fafc;
	}

	.group-relations-dropdown-item:active {
		background: #f1f5f9;
	}

	.group-relations-dropdown-item.is-selected {
		background: linear-gradient(90deg, rgba(0, 91, 191, 0.08) 0%, rgba(0, 91, 191, 0.02) 100%);
	}

	.group-relations-dropdown-item-text {
		font-size: 28rpx;
		color: #334155;
		line-height: 1.4;
		text-align: left;
	}

	.group-relations-dropdown-item.is-selected .group-relations-dropdown-item-text {
		color: #005bbf;
		font-weight: 700;
	}

	.group-relations-search-input {
		flex: 1 1 200rpx;
		min-width: 200rpx;
		height: 72rpx;
		line-height: 72rpx;
		padding: 0 24rpx;
		font-size: 26rpx;
		background: #fff;
		border-radius: 16rpx;
		box-shadow: 0 16rpx 40rpx rgba(30, 58, 138, 0.06);
		border: none;
		box-sizing: border-box;
	}

	.group-relations-search-btn {
		flex-shrink: 0;
		border-radius: 16rpx !important;
		height: 72rpx !important;
		line-height: 72rpx !important;
		padding: 0 28rpx !important;
	}

	.group-relations-card {
		background: var(--ac-surface-card, #fff);
		border-radius: var(--ac-radius-lg, 24rpx);
		padding: 8rpx 0 24rpx;
		box-shadow: 0 24rpx 48rpx rgba(30, 58, 138, 0.06);
		overflow: hidden;
	}

	.group-relations-table-wrap {
		width: 100%;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	.group-relations-table {
		min-width: 960rpx;
		padding: 0 24rpx;
		box-sizing: border-box;
	}

	.gr-tr {
		display: flex;
		flex-direction: row;
		align-items: stretch;
		gap: 0;
	}

	.gr-tr--head {
		padding: 20rpx 16rpx 16rpx;
		margin-bottom: 8rpx;
	}

	.gr-tr--body {
		padding: 20rpx 16rpx;
		margin-bottom: 8rpx;
		border-radius: 16rpx;
		background: #f8fafc;
		transition: background 0.2s ease, box-shadow 0.2s ease;
	}

	.gr-tr--body:active {
		background: #f1f5f9;
	}

	.gr-th {
		display: flex;
		flex-direction: row;
		align-items: center;
		font-size: 22rpx;
		font-weight: 700;
		color: #64748b;
		letter-spacing: 0.04em;
		flex-shrink: 0;
		padding: 0 8rpx;
		box-sizing: border-box;
	}

	.gr-th > text {
		font-size: 22rpx;
		font-weight: 700;
		color: #64748b;
		letter-spacing: 0.04em;
	}

	.gr-th.gr-col-role {
		justify-content: flex-start;
		padding-left: 4rpx;
	}

	.gr-th.gr-col-action {
		justify-content: flex-end;
	}

	/* 与 .gr-remove-link 左右留白一致，表头与「移出群组」右缘对齐 */
	.gr-th.gr-col-action > text {
		padding-right: 12rpx;
	}

	.gr-td {
		font-size: 26rpx;
		color: #0f172a;
		flex-shrink: 0;
		padding: 0 8rpx;
		display: flex;
		align-items: center;
		box-sizing: border-box;
		word-break: break-all;
	}

	.gr-td--muted {
		color: #64748b;
		font-size: 24rpx;
	}

	.gr-td--mono {
		font-variant-numeric: tabular-nums;
	}

	.gr-col-name {
		width: 18%;
		min-width: 140rpx;
	}

	.gr-col-code {
		width: 12%;
		min-width: 100rpx;
	}

	.gr-col-time {
		width: 18%;
		min-width: 160rpx;
	}

	.gr-col-mname {
		width: 14%;
		min-width: 120rpx;
	}

	.gr-col-id {
		width: 14%;
		min-width: 120rpx;
	}

	.gr-col-role {
		width: 10%;
		min-width: 88rpx;
	}

	.gr-col-action {
		width: 14%;
		min-width: 120rpx;
		justify-content: flex-end;
	}

	.gr-role-pill {
		display: inline-block;
		padding: 6rpx 16rpx;
		border-radius: 9999rpx;
		font-size: 22rpx;
		font-weight: 600;
		background: rgba(0, 91, 191, 0.1);
		color: #005bbf;
	}

	.gr-remove-link {
		font-size: 26rpx;
		font-weight: 600;
		color: #b45309;
		padding: 8rpx 12rpx;
	}

	.group-relations-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80rpx 32rpx;
		text-align: center;
	}

	.group-relations-empty-ic {
		font-size: 64rpx;
		color: #cbd5e1;
		margin-bottom: 16rpx;
	}

	.group-relations-empty-title {
		font-size: 30rpx;
		font-weight: 700;
		color: #475569;
		margin-bottom: 8rpx;
	}

	.group-relations-empty-desc {
		font-size: 24rpx;
		color: #94a3b8;
		line-height: 1.5;
		max-width: 520rpx;
	}

	.group-relations-pagination {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 24rpx;
		padding: 8rpx 0;
	}

	.group-relations-page-btn {
		padding: 12rpx 28rpx !important;
		font-size: 26rpx !important;
		border-radius: 14rpx !important;
		background: #fff !important;
		color: #005bbf !important;
		border: 1rpx solid rgba(0, 91, 191, 0.25) !important;
		font-weight: 600 !important;
	}

	.group-relations-page-btn::after {
		border: none !important;
	}

	.group-relations-page-btn[disabled] {
		opacity: 0.4;
	}

	.group-relations-page-info {
		font-size: 24rpx;
		color: #64748b;
		font-variant-numeric: tabular-nums;
	}

	.group-relations-footer-meta {
		text-align: center;
	}

	.dashboard-content {
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 40rpx;
	}

	.dashboard-hero {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: 24rpx;
	}

	.dashboard-hero-text {
		flex: 1;
		min-width: 280rpx;
	}

	.dashboard-kicker {
		display: block;
		font-family: 'Manrope', 'Noto Sans SC', sans-serif;
		font-size: 26rpx;
		font-weight: 600;
		color: #64748b;
		letter-spacing: 0.08em;
		margin-bottom: 8rpx;
	}

	.dashboard-headline {
		display: block;
		font-family: 'Manrope', 'Noto Sans SC', sans-serif;
		font-size: 56rpx;
		font-weight: 800;
		color: #0f172a;
		line-height: 1.15;
		letter-spacing: -0.02em;
	}

	.dashboard-refresh-btn {
		flex-shrink: 0;
		border-radius: 16rpx;
	}

	.dashboard-bento {
		display: grid;
		grid-template-columns: 1fr;
		gap: 24rpx;
	}

	@media screen and (min-width: 768px) {
		.dashboard-bento {
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 28rpx;
		}
	}

	.dash-metric-card {
		background: var(--ac-surface-card, #fff);
		border-radius: var(--ac-radius-lg, 24rpx);
		padding: 40rpx 36rpx 36rpx;
		box-shadow: 0 24rpx 48rpx rgba(30, 58, 138, 0.06);
		border: none;
		transition: background 0.25s ease, box-shadow 0.25s ease, transform 0.22s ease;
	}

	.dash-metric-card:hover {
		background: #fafbfc;
		box-shadow: 0 28rpx 56rpx rgba(30, 58, 138, 0.08);
		transform: translateY(-4rpx);
	}

	.dash-metric-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 20rpx;
	}

	.dash-metric-icon-wrap {
		width: 72rpx;
		height: 72rpx;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.dash-metric-ms {
		font-size: 40rpx;
		line-height: 1;
	}

	.dash-metric-icon--teacher {
		background: rgba(0, 91, 191, 0.1);
		color: #005bbf;
	}

	.dash-metric-icon--student {
		background: rgba(72, 98, 110, 0.12);
		color: #48626e;
	}

	.dash-metric-icon--paper {
		background: rgba(0, 106, 95, 0.1);
		color: #006a5f;
	}

	.dash-metric-label {
		display: block;
		font-size: 26rpx;
		font-weight: 500;
		color: #64748b;
		margin-bottom: 8rpx;
	}

	.dash-metric-value {
		display: block;
		font-family: 'Manrope', 'Noto Sans SC', sans-serif;
		font-size: 64rpx;
		font-weight: 800;
		color: #0f172a;
		line-height: 1.1;
		letter-spacing: -0.03em;
	}

	.dash-metric-hint {
		display: block;
		font-size: 22rpx;
		color: #94a3b8;
		margin-top: 16rpx;
	}

	.dashboard-split {
		display: flex;
		flex-direction: column;
		gap: 28rpx;
		align-items: stretch;
	}

	@media screen and (min-width: 960px) {
		.dashboard-split {
			display: grid;
			grid-template-columns: minmax(0, 1.85fr) minmax(0, 1fr);
			gap: 36rpx;
			align-items: start;
		}
	}

	.dash-panel {
		background: var(--ac-surface-card, #fff);
		border-radius: var(--ac-radius-lg, 24rpx);
		box-shadow: 0 24rpx 48rpx rgba(30, 58, 138, 0.06);
		overflow: hidden;
	}

	.dash-panel-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 28rpx 32rpx;
		background: rgba(243, 244, 246, 0.65);
		border-bottom: 1rpx solid rgba(226, 232, 240, 0.9);
	}

	.dash-panel-title {
		font-family: 'Manrope', 'Noto Sans SC', sans-serif;
		font-size: 32rpx;
		font-weight: 700;
		color: #0f172a;
	}

	.dash-panel-link {
		padding: 8rpx 0;
	}

	.dash-panel-link text {
		font-size: 26rpx;
		font-weight: 600;
		color: #005bbf;
	}

	.dash-panel-link:active text {
		opacity: 0.75;
	}

	.dash-live-pill {
		font-size: 20rpx;
		font-weight: 700;
		color: #64748b;
		background: #e2e8f0;
		padding: 6rpx 16rpx;
		border-radius: 999rpx;
		letter-spacing: 0.06em;
	}

	.dash-deadline-row {
		display: flex;
		align-items: center;
		gap: 24rpx;
		padding: 32rpx;
		transition: background 0.2s ease;
	}

	.dash-deadline-row:active {
		background: #f8fafc;
	}

	.dash-deadline-cal {
		width: 88rpx;
		height: 88rpx;
		border-radius: 18rpx;
		background: rgba(245, 158, 11, 0.12);
		color: #b45309;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.dash-deadline-cal .material-symbols-outlined {
		font-size: 44rpx;
	}

	.dash-deadline-copy {
		flex: 1;
		min-width: 0;
	}

	.dash-deadline-title {
		display: block;
		font-size: 30rpx;
		font-weight: 700;
		color: #0f172a;
		margin-bottom: 8rpx;
	}

	.dash-deadline-desc {
		display: block;
		font-size: 24rpx;
		color: #64748b;
		line-height: 1.5;
	}

	.dash-deadline-chevron {
		font-size: 40rpx;
		color: #94a3b8;
		flex-shrink: 0;
	}

	.dash-panel--papers .dash-panel-head {
		background: rgba(237, 238, 239, 0.85);
	}

	.dash-paper-rows {
		padding: 12rpx 0 8rpx;
	}

	.dash-paper-row {
		display: flex;
		align-items: center;
		gap: 20rpx;
		padding: 24rpx 32rpx;
		border-bottom: 1rpx solid #f1f5f9;
	}

	.dash-paper-row:last-child {
		border-bottom: none;
	}

	.dash-paper-row-icon {
		width: 64rpx;
		height: 64rpx;
		border-radius: 14rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.dash-paper-row-icon .material-symbols-outlined {
		font-size: 32rpx;
	}

	.dash-paper-row-icon--upload {
		background: rgba(0, 91, 191, 0.1);
		color: #005bbf;
	}

	.dash-paper-row-icon--pending {
		background: rgba(250, 140, 22, 0.12);
		color: #c2410c;
	}

	.dash-paper-row-icon--done {
		background: rgba(34, 197, 94, 0.12);
		color: #15803d;
	}

	.dash-paper-row-meta {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16rpx;
	}

	.dash-paper-row-label {
		font-size: 26rpx;
		color: #64748b;
	}

	.dash-paper-row-value {
		font-family: 'Manrope', 'Noto Sans SC', sans-serif;
		font-size: 36rpx;
		font-weight: 800;
		color: #0f172a;
	}

	.dashboard-update-time {
		margin-top: 8rpx;
	}
	
	/* 截止日期管理弹窗（与群组 / admin-dialog 一致） */
	.deadline-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(15, 23, 42, 0.45);
		backdrop-filter: blur(10rpx);
		-webkit-backdrop-filter: blur(10rpx);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 32rpx;
		box-sizing: border-box;
		z-index: 1000;
		animation: fadeIn 0.3s ease;
	}
	
	.deadline-modal-content.admin-dialog-sheet {
		width: 700rpx;
		max-width: 94vw;
		max-height: 85vh;
	}
	
	.deadline-modal-body {
		padding: 28rpx 36rpx 32rpx !important;
		display: flex;
		flex-direction: column;
		gap: 28rpx;
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}
	
	.deadline-field-label {
		display: block;
		font-size: 22rpx;
		font-weight: 700;
		color: #64748b;
		letter-spacing: 0.04em;
		margin-bottom: 12rpx;
	}
	
	.deadline-query-block {
		flex-shrink: 0;
		padding-bottom: 8rpx;
		border-bottom: 1rpx solid rgba(148, 163, 184, 0.22);
	}
	
	.deadline-query-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 16rpx;
	}
	
	.deadline-query-ic {
		font-size: 40rpx;
		color: #94a3b8;
		flex-shrink: 0;
		line-height: 1;
	}
	
	.deadline-query-input {
		flex: 1;
		min-width: 0;
		width: 0;
		box-sizing: border-box;
		height: 104rpx;
		min-height: 104rpx;
		padding: 22rpx 24rpx;
		border: 1rpx solid #e2e8f0;
		border-radius: 14rpx;
		background: #f8fafc;
		font-size: 30rpx;
		color: #0f172a;
		line-height: 1.45;
		transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
	}
	
	.deadline-query-input:focus {
		outline: none;
		background: #fff;
		border-color: #005bbf;
		box-shadow: 0 0 0 3rpx rgba(0, 91, 191, 0.12);
	}
	
	.deadline-query-btn {
		flex-shrink: 0;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		height: 104rpx;
		min-height: 104rpx;
		max-height: 104rpx;
		padding: 0 36rpx;
		margin: 0;
		box-sizing: border-box;
		border: none;
		border-radius: 14rpx;
		background: linear-gradient(135deg, #005bbf 0%, #1a73e8 100%);
		color: #fff;
		font-size: 28rpx;
		font-weight: 700;
		line-height: normal;
		overflow: hidden;
		box-shadow: 0 8rpx 22rpx rgba(0, 91, 191, 0.28);
		transition: transform 0.15s ease, opacity 0.15s ease;
	}
	
	/* 去掉 uni-app / 小程序 button 默认边框与内边距，避免字顶在上方、高度被撑高 */
	.deadline-query-btn::after {
		border: none !important;
	}
	
	.deadline-query-btn-label {
		line-height: 1.2;
		color: inherit;
		font-size: inherit;
		font-weight: inherit;
	}
	
	.deadline-query-btn:active {
		transform: scale(0.98);
		opacity: 0.95;
	}
	
	.deadline-parsed-hint {
		display: block;
		margin-top: 14rpx;
		font-size: 24rpx;
		font-weight: 600;
		color: #047857;
		line-height: 1.5;
	}
	
	.deadline-list-block {
		flex: 1;
		min-height: 200rpx;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	
	.deadline-list-scroll {
		flex: 1;
		min-height: 0;
		max-height: 480rpx;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		padding-right: 4rpx;
	}
	
	.deadline-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 48rpx 24rpx 56rpx;
		text-align: center;
		background: #f8fafc;
		border-radius: 16rpx;
		border: 1rpx dashed #cbd5e1;
	}
	
	.deadline-empty-ic {
		font-size: 56rpx;
		color: #94a3b8;
		margin-bottom: 16rpx;
	}
	
	.deadline-empty-txt {
		font-size: 28rpx;
		font-weight: 700;
		color: #475569;
		margin-bottom: 8rpx;
	}
	
	.deadline-empty-sub {
		font-size: 24rpx;
		color: #94a3b8;
		line-height: 1.5;
	}
	
	.deadline-list {
		display: flex;
		flex-direction: column;
		gap: 14rpx;
	}
	
	.deadline-item {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		gap: 20rpx;
		padding: 20rpx 22rpx;
		background: #fff;
		border-radius: 14rpx;
		border: 1rpx solid rgba(148, 163, 184, 0.22);
		box-shadow: 0 4rpx 14rpx rgba(15, 23, 42, 0.05);
	}
	
	.deadline-item-main {
		flex: 1;
		min-width: 0;
	}
	
	.deadline-info-row {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}
	
	.deadline-class {
		font-size: 28rpx;
		font-weight: 700;
		color: #0f172a;
		font-family: 'Manrope', 'Noto Sans SC', sans-serif;
	}
	
	.deadline-time {
		font-size: 24rpx;
		color: #64748b;
		font-variant-numeric: tabular-nums;
	}
	
	.deadline-meta {
		margin-top: 10rpx;
	}
	
	.deadline-meta-chip {
		display: inline-block;
		font-size: 22rpx;
		font-weight: 600;
		color: #475569;
		background: #f1f5f9;
		padding: 6rpx 14rpx;
		border-radius: 999rpx;
		border: 1rpx solid #e2e8f0;
	}
	
	.deadline-item-delete {
		flex-shrink: 0;
		margin: 0;
		padding: 16rpx 28rpx;
		font-size: 26rpx;
		font-weight: 700;
		color: #dc2626;
		background: #fff;
		border: 1rpx solid #fecaca;
		border-radius: 12rpx;
		line-height: 1;
	}
	
	.deadline-item-delete:active {
		background: #fef2f2;
	}
	
	@media (max-width: 640px) {
		.deadline-query-row {
			flex-wrap: wrap;
		}
		.deadline-query-ic {
			display: none;
		}
		.deadline-query-input {
			width: 100%;
			flex: 1 1 100%;
		}
		.deadline-query-btn {
			width: 100%;
			max-height: 96rpx;
			height: 96rpx;
			min-height: 96rpx;
		}
		.deadline-item {
			flex-direction: column;
			align-items: stretch;
		}
		.deadline-item-delete {
			width: 100%;
		}
	}
	
	/* 删除截止日期确认（壳与群组删除一致） */
	.confirm-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(15, 23, 42, 0.45);
		backdrop-filter: blur(10rpx);
		-webkit-backdrop-filter: blur(10rpx);
		z-index: 2000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 32rpx;
		box-sizing: border-box;
		animation: fadeIn 0.2s ease;
	}
	
	.confirm-modal-content.admin-dialog-sheet {
		animation: slideUp 0.28s cubic-bezier(0.4, 0, 0.2, 1);
	}
	
	.deadline-delete-time {
		display: block;
		margin-top: 16rpx;
		font-size: 26rpx;
		color: #64748b;
		font-variant-numeric: tabular-nums;
	}
	
	/* 刷新按钮 */
	.refresh-btn {
		padding: 16rpx 32rpx;
		background: linear-gradient(135deg, #005bbf 0%, #1a73e8 100%);
		color: #fff;
		border-radius: 30rpx;
		font-size: 26rpx;
		border: none;
		box-shadow: 0 8rpx 24rpx rgba(0, 91, 191, 0.25);
		transition: all 0.3s ease;
	}
	
	.refresh-btn:hover {
		transform: translateY(-2rpx);
		box-shadow: 0 10rpx 28rpx rgba(0, 91, 191, 0.32);
	}
	
	/* 更新时间 */
	.update-time {
		text-align: center;
		padding: 20rpx;
		color: #8c8c8c;
		font-size: 24rpx;
	}
	
	/* ========== 院校信息维护样式 ========== */
	.school-management-content {
		padding: 30rpx;
		width: 100%;
		min-height: 400rpx;
	}
	
	.school-function-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 30rpx;
		width: 100%;
		background-color: #f5f5f5;
		padding: 20rpx;
		border-radius: 12rpx;
	}
	
	.school-function-card {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 40rpx 30rpx;
		text-align: center;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
		transition: all 0.3s ease;
		cursor: pointer;
		position: relative;
		z-index: 10;
		pointer-events: auto;
		min-height: 200rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		border: 2rpx solid #e0e0e0;
	}
	
	.school-function-card:hover {
		transform: translateY(-4rpx);
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
	}
	
	.school-function-card:active {
		transform: translateY(-2rpx);
	}
	
	.school-function-card .function-icon {
		font-size: 60rpx;
		margin-bottom: 20rpx;
	}
	
	.school-function-card .function-title {
		display: block;
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 12rpx;
	}
	
	.school-function-card .function-desc {
		display: block;
		font-size: 24rpx;
		color: #666;
	}
	
	/* 查询按钮（弹窗内全宽，与截止日期行内按钮区分） */
	.modal-body > .query-btn {
		width: 100%;
		height: 80rpx;
		line-height: 80rpx;
		background: linear-gradient(135deg, #005bbf 0%, #1a73e8 100%);
		color: #fff;
		border-radius: 8rpx;
		font-size: 28rpx;
		margin-top: 20rpx;
		border: none;
		box-shadow: 0 8rpx 20rpx rgba(0, 91, 191, 0.22);
	}
	
	.modal-body > .query-btn:active {
		opacity: 0.9;
	}
	
	/* 查询结果 */
	.query-result {
		margin-top: 30rpx;
		padding: 20rpx;
		background: #f6ffed;
		border: 1rpx solid #b7eb8f;
		border-radius: 8rpx;
	}
	
	.query-result .result-empty {
		text-align: center;
		color: #999;
		font-size: 28rpx;
		padding: 20rpx;
	}
	
	.query-result .result-item {
		display: flex;
		align-items: center;
		padding: 16rpx 0;
		border-bottom: 1rpx solid #e8e8e8;
	}
	
	.query-result .result-item:last-child {
		border-bottom: none;
	}
	
	.query-result .result-label {
		font-size: 28rpx;
		color: #666;
		margin-right: 16rpx;
	}
	
	.query-result .result-value {
		font-size: 32rpx;
		font-weight: 600;
		color: #005bbf;
	}
	
	.query-result .result-list {
		max-height: 400rpx;
		overflow-y: auto;
	}
	
	/* 弹窗遮罩层 */
	.modal-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}
	
	/* 弹窗内容 */
	.modal-content {
		width: 600rpx;
		max-width: 90%;
		background: #fff;
		border-radius: 24rpx;
		display: flex;
		flex-direction: column;
		box-shadow: 0 24rpx 80rpx rgba(0, 0, 0, 0.2);
		animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		overflow: visible;
		position: relative;
	}
	
	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx 40rpx;
		border-bottom: 1rpx solid #f0f0f0;
		border-radius: 24rpx 24rpx 0 0;
	}
	
	.modal-title {
		font-size: 36rpx;
		font-weight: 600;
		color: #333;
	}
	
	.close-btn {
		font-size: 48rpx;
		color: #999;
		cursor: pointer;
		line-height: 1;
	}
	
	.close-btn:hover {
		color: #666;
	}
	
	.modal-body {
		padding: 40rpx;
		max-height: 60vh;
		overflow-y: auto;
	}
	
	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 20rpx;
		padding: 30rpx 40rpx;
		border-top: 1rpx solid #f0f0f0;
	}
	
	/* 公告编辑弹窗：覆盖全局 modal-content overflow，保证四角圆角；内容区随表单高度收缩 */
	.modal-content.notice-edit-modal-content {
		overflow: hidden;
		border-radius: 24rpx;
		width: 92vw;
		max-width: 920px;
		max-height: 88vh;
		box-shadow: 0 32rpx 96rpx rgba(15, 23, 42, 0.18), 0 0 0 1rpx rgba(148, 163, 184, 0.12);
	}
	
	.modal-content.notice-edit-modal-content > .modal-header {
		flex-shrink: 0;
		padding: 0;
	}
	
	.modal-content.notice-edit-modal-content .notice-edit-modal-body {
		flex: 0 1 auto;
		min-height: 0;
		min-width: 0;
		max-height: 62vh;
		overflow-x: hidden;
		overflow-y: auto;
		padding: 20rpx 28rpx 20rpx;
		-webkit-overflow-scrolling: touch;
		background: #f8fafc;
	}
	
	.modal-content.notice-edit-modal-content .notice-edit-modal-footer {
		flex-shrink: 0;
		border-radius: 0 0 24rpx 24rpx;
		padding: 20rpx 28rpx 24rpx;
		background: #fff;
		border-top: 1rpx solid #e2e8f0;
		display: flex;
		justify-content: flex-end;
		gap: 16rpx;
	}
	
	.modal-content.notice-edit-modal-content .notice-edit-modal-body .form-textarea {
		min-height: 120rpx;
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;
	}
	
	.modal-content.notice-edit-modal-content .notice-edit-modal-body .form-item {
		margin-bottom: 22rpx;
		min-width: 0;
		width: 100%;
	}
	
	.modal-content.notice-edit-modal-content .notice-edit-modal-body .form-item:last-child {
		margin-bottom: 0;
	}
	
	/* ========== 创建角色 / 用户与权限内嵌表单 ========== */
	.role-tabs {
		display: flex;
		gap: 20rpx;
		margin-bottom: 40rpx;
		justify-content: center;
	}
	
	.role-tab {
		padding: 20rpx 40rpx;
		background: #f5f5f5;
		border-radius: 8rpx;
		font-size: 28rpx;
		color: #666;
		cursor: pointer;
		transition: all 0.3s;
	}
	
	.role-tab.active {
		background: linear-gradient(135deg, #005bbf 0%, #1a73e8 100%);
		color: #fff;
		box-shadow: 0 6rpx 18rpx rgba(0, 91, 191, 0.22);
	}
	
	.role-form {
		background: var(--ac-surface-card, #fff);
		padding: 40rpx;
		border-radius: var(--ac-radius-lg, 24rpx);
		box-shadow: var(--ac-shadow-card, 0 8rpx 28rpx rgba(15, 23, 42, 0.08));
		border: 1rpx solid var(--ac-outline-ghost, rgba(148, 163, 184, 0.2));
	}
	
	.role-form .form-item {
		margin-bottom: 30rpx;
	}
	
	.role-form .form-label {
		display: block;
		font-size: 28rpx;
		color: #333;
		margin-bottom: 12rpx;
		font-weight: 500;
	}
	
	.role-form .form-input {
		width: 100%;
		height: 80rpx;
		padding: 0 24rpx;
		border: 2rpx solid #e0e0e0;
		border-radius: 8rpx;
		font-size: 28rpx;
		box-sizing: border-box;
	}
	
	.role-form .form-input:focus {
		border-color: #005bbf;
		box-shadow: 0 0 0 4rpx rgba(0, 91, 191, 0.1);
	}
	
	.submit-btn {
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
		color: #fff;
		border-radius: 8rpx;
		font-size: 30rpx;
		font-weight: 500;
		margin-top: 20rpx;
		border: none;
	}
	
	.submit-btn:active {
		opacity: 0.9;
	}
</style>


