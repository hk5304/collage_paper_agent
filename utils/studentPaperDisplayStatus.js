/**
 * 学生端论文状态：仅前端展示聚合为三种（后端仍返回原有枚举）
 * - 待审阅：已上传 / 已更新 / 待审阅 等「等待教师处理」
 * - 待修改：已审阅 / 待更新（教师已给出审阅，学生可改）
 * - 已定稿
 */

export const STUDENT_DISPLAY_BUCKETS = {
	PENDING_REVIEW: 'ui_pending_review',
	PENDING_REVISION: 'ui_pending_revision',
	FINALIZED: 'ui_finalized'
};

function normKey(s) {
	if (s == null || s === '') return '';
	return String(s).trim().toLowerCase();
}

/**
 * @param {string} status - 后端或列表中的原始 status（中英皆可）
 * @returns {typeof STUDENT_DISPLAY_BUCKETS[keyof typeof STUDENT_DISPLAY_BUCKETS]}
 */
export function mapBackendStatusToStudentDisplayBucket(status) {
	const s = normKey(status);
	const raw = String(status == null ? '' : status).trim();

	if (!s && !raw) return STUDENT_DISPLAY_BUCKETS.PENDING_REVIEW;

	const finalizedKeys = [
		'finalized',
		'completed',
		'done',
		'final',
		'complete',
		'approved',
		'已通过',
		'已定稿',
		'定稿'
	];
	if (finalizedKeys.includes(s) || finalizedKeys.includes(raw)) {
		return STUDENT_DISPLAY_BUCKETS.FINALIZED;
	}

	const revisionKeys = [
		'reviewed',
		'review_complete',
		'feedback',
		'pending_update',
		'update_pending',
		'needs_update',
		'need_revision',
		'revision_required',
		'require_revision',
		'returned',
		'rejected',
		'已审阅',
		'待更新',
		'待修改',
		'需修改',
		'退回修改'
	];
	if (revisionKeys.includes(s) || revisionKeys.includes(raw)) {
		return STUDENT_DISPLAY_BUCKETS.PENDING_REVISION;
	}

	return STUDENT_DISPLAY_BUCKETS.PENDING_REVIEW;
}

/** 列表、进度条旁展示用中文（三种之一） */
export function studentDisplayStatusLabel(status) {
	const b = mapBackendStatusToStudentDisplayBucket(status);
	if (b === STUDENT_DISPLAY_BUCKETS.FINALIZED) return '已定稿';
	if (b === STUDENT_DISPLAY_BUCKETS.PENDING_REVISION) return '待修改';
	return '待审阅';
}

/** 三步进度：1 待审阅 2 待修改 3 已定稿 */
export function studentDisplayStep(status) {
	const b = mapBackendStatusToStudentDisplayBucket(status);
	if (b === STUDENT_DISPLAY_BUCKETS.FINALIZED) return 3;
	if (b === STUDENT_DISPLAY_BUCKETS.PENDING_REVISION) return 2;
	return 1;
}
