<template>
	<view v-if="visible" class="review-grade-mask" @click.self="handleClose">
		<view class="review-grade-wrapper" :class="{ 'in-preview': previewMode }" @click.stop>
			<!-- 头部 -->
			<view class="review-grade-header">
				<view class="header-title-wrap">
					<text class="header-subtitle">附件8  评阅表</text>
					<text class="header-title">中国计量大学毕业设计（论文）评阅表</text>
				</view>
				<view class="header-actions">
					<view
						class="header-toggle-btn"
						:class="{ 'is-preview': previewMode }"
						@click="togglePreview"
					>
						<text class="material-symbols-outlined">{{ previewMode ? 'edit_note' : 'preview' }}</text>
						<text>{{ previewMode ? '返回编辑' : '预览效果' }}</text>
					</view>
					<view class="header-close" @click="handleClose">
						<text class="material-symbols-outlined">close</text>
					</view>
				</view>
			</view>

			<!-- 编辑模式：评分表单 -->
			<view v-if="!previewMode" class="review-grade-body">
				<!-- 基本信息（只读展示，随卡片数据带入） -->
				<view class="info-grid">
					<view class="info-item">
						<text class="info-label">二级学院</text>
						<text class="info-value">{{ displayCollege || '—' }}</text>
					</view>
					<view class="info-item">
						<text class="info-label">指导教师</text>
						<text class="info-value">{{ displayTeacher || '—' }}</text>
					</view>
					<view class="info-item">
						<text class="info-label">姓名</text>
						<text class="info-value">{{ displayName || '—' }}</text>
					</view>
					<view class="info-item">
						<text class="info-label">学号</text>
						<text class="info-value">{{ displayStudentNo || '—' }}</text>
					</view>
					<view class="info-item">
						<text class="info-label">班级</text>
						<text class="info-value">{{ displayClass || '—' }}</text>
					</view>
					<view class="info-item info-item-full">
						<text class="info-label">题目</text>
						<text class="info-value">{{ displayTitle || '—' }}</text>
					</view>
				</view>

				<!-- 评阅表 -->
				<view class="grade-table">
					<view class="grade-row grade-row-head">
						<text class="col col-lv1">一级指标</text>
						<text class="col col-lv2">二级指标</text>
						<text class="col col-desc">评阅要素</text>
						<text class="col col-max">分值</text>
						<text class="col col-score">得分</text>
					</view>
					<view
						v-for="(item, idx) in items"
						:key="item.key"
						class="grade-row"
						:class="{ 'grade-row-error': !!errors[item.key] }"
					>
						<text class="col col-lv1">{{ item.lv1 }}</text>
						<text class="col col-lv2">{{ item.lv2 }}</text>
						<text class="col col-desc">{{ item.desc }}</text>
						<text class="col col-max">{{ item.max }}分</text>
						<view class="col col-score">
							<input
								class="score-input"
								:class="{ 'score-input-error': !!errors[item.key] }"
								type="digit"
								:value="form[item.key]"
								:placeholder="`0~${item.max}`"
								@input="onScoreInput($event, item)"
								@blur="onScoreBlur(item)"
							/>
							<text v-if="errors[item.key]" class="score-error">{{ errors[item.key] }}</text>
						</view>
					</view>
					<!-- 总分 -->
					<view class="grade-row grade-row-total">
						<text class="col col-lv1">总分</text>
						<text class="col col-lv2"></text>
						<text class="col col-desc">按各项得分自动累加（满分 100）</text>
						<text class="col col-max">100分</text>
						<text class="col col-score total-value">{{ totalDisplay }}</text>
					</view>
				</view>

				<!-- 提示 -->
				<view class="tips">
					<text class="material-symbols-outlined tips-icon">info</text>
					<text class="tips-text">每项得分允许一位小数（0 ~ 满分）；总分自动累加，无需手动填写。评分可重复保存与修改。</text>
				</view>
			</view>

			<!-- 预览模式：A4 纸样式还原 -->
			<view v-else class="review-grade-body preview-body">
				<view class="a4-scaler" ref="a4Scaler">
					<view class="a4-frame" :style="{ width: (794 * a4Scale) + 'px', height: (1123 * a4Scale) + 'px' }">
						<view id="paper-review-print-area" class="a4-paper" ref="printArea"
							:style="{ transform: 'scale(' + a4Scale + ')' }">
					<!-- 四角裁切标记 -->
					<view class="a4-crop a4-crop-tl"></view>
					<view class="a4-crop a4-crop-tr"></view>
					<view class="a4-crop a4-crop-bl"></view>
					<view class="a4-crop a4-crop-br"></view>

					<view class="a4-subtitle">附件8  评阅表</view>
					<view class="a4-title">中国计量大学毕业设计（论文）评阅表</view>

					<view class="a4-info-line">
						<text class="a4-label a4-label-w4">二级学院：</text>
						<text class="a4-fill a4-fill-md">{{ displayCollege || '' }}</text>
						<text class="a4-label a4-label-w4 a4-label-gap">指导教师：</text>
						<text class="a4-fill a4-fill-md">{{ displayTeacher || '' }}</text>
					</view>
					<view class="a4-info-line">
						<text class="a4-label a4-label-w4">姓　　名：</text>
						<text class="a4-fill a4-fill-sm">{{ displayName || '' }}</text>
						<text class="a4-label a4-label-w2 a4-label-gap">学号：</text>
						<text class="a4-fill a4-fill-sm">{{ displayStudentNo || '' }}</text>
						<text class="a4-label a4-label-w2 a4-label-gap">班级：</text>
						<text class="a4-fill a4-fill-sm">{{ displayClass || '' }}</text>
					</view>
					<view class="a4-info-line">
						<text class="a4-label a4-label-w4">题　　目：</text>
						<text class="a4-fill a4-fill-long">{{ displayTitle || '' }}</text>
					</view>

					<!-- 用真实 HTML table 实现 rowspan/列宽精确还原 -->
					<table class="a4-html-table">
						<colgroup>
							<col style="width: 11%;" />
							<col style="width: 16%;" />
							<col style="width: 51%;" />
							<col style="width: 10%;" />
							<col style="width: 12%;" />
						</colgroup>
						<tbody>
							<tr class="a4-html-head">
								<td>一级<br/>指标</td>
								<td>二级指标</td>
								<td>评阅要素</td>
								<td>分值</td>
								<td>得分</td>
							</tr>
							<tr>
								<td class="a4-cell-l1">选题<br/>意义</td>
								<td class="a4-cell-l2">选题目的<br/>和意义</td>
								<td class="a4-cell-desc">{{ items[0].desc }}</td>
								<td>10 分</td>
								<td>{{ formatScoreCell('topic_meaning') }}</td>
							</tr>
							<tr>
								<td class="a4-cell-l1">逻辑<br/>能力</td>
								<td class="a4-cell-l2">逻辑与层<br/>次体系</td>
								<td class="a4-cell-desc">{{ items[1].desc }}</td>
								<td>10 分</td>
								<td>{{ formatScoreCell('logic') }}</td>
							</tr>
							<tr>
								<td rowspan="2" class="a4-cell-l1">专业<br/>水平</td>
								<td class="a4-cell-l2">综合应用<br/>知识能力</td>
								<td class="a4-cell-desc">{{ items[2].desc }}</td>
								<td>30 分</td>
								<td>{{ formatScoreCell('application') }}</td>
							</tr>
							<tr>
								<td class="a4-cell-l2">分析解决<br/>问题能力</td>
								<td class="a4-cell-desc">{{ items[3].desc }}</td>
								<td>30 分</td>
								<td>{{ formatScoreCell('analysis') }}</td>
							</tr>
							<tr>
								<td class="a4-cell-l1">学术<br/>规范</td>
								<td class="a4-cell-l2">行文和引<br/>用规范</td>
								<td class="a4-cell-desc">{{ items[4].desc }}</td>
								<td>20 分</td>
								<td>{{ formatScoreCell('format') }}</td>
							</tr>
							<tr class="a4-row-total">
								<td>总分</td>
								<td colspan="3"></td>
								<td>{{ totalDisplay !== '0' ? totalDisplay : '' }}</td>
							</tr>
							<tr class="a4-row-comment">
								<td class="a4-cell-comment-label">修改<br/>意见</td>
								<td colspan="4" class="a4-cell-comment">
									<div class="a4-sign-line">
										<span class="a4-sign-label">评阅教师签名：</span>
										<span class="a4-sign-blank"></span>
									</div>
									<div class="a4-date-line">
										<span class="a4-date-blank"></span>
										<span class="a4-date-text">年</span>
										<span class="a4-date-blank a4-date-blank-sm"></span>
										<span class="a4-date-text">月</span>
										<span class="a4-date-blank a4-date-blank-sm"></span>
										<span class="a4-date-text">日</span>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
						</view>
					</view>
				</view>
			</view>

			<!-- 底部按钮 -->
			<view class="review-grade-footer">
				<button v-if="previewMode" class="btn btn-plain" @click="togglePreview">返回编辑</button>
				<button v-else class="btn btn-plain" @click="handleClose">取消</button>
				<button
					v-if="previewMode"
					class="btn btn-primary"
					@click="handleDownloadPdf"
				>
					<text class="material-symbols-outlined" style="font-size: 30rpx; margin-right: 6rpx;">picture_as_pdf</text>
					<text>下载 PDF</text>
				</button>
				<button
					v-else
					class="btn btn-primary"
					:disabled="!canSubmit || submitting"
					:class="{ 'btn-disabled': !canSubmit || submitting }"
					@click="handleSubmit"
				>
					<text>{{ submitting ? '保存中...' : (isUpdateMode ? '保存修改' : '保存评分') }}</text>
				</button>
			</view>
		</view>
	</view>
</template>

<script>
import { getPaperGrade, submitPaperGrade, updatePaperGrade } from '@/api/teacher.js';

const ITEMS = [
	{ key: 'topic_meaning', lv1: '选题意义', lv2: '选题目的和意义', max: 10,
		desc: '符合专业培养目标，体现综合训练基本要求。面向所在专业领域学术问题或行业社会实际问题，有一定的理论或实用价值' },
	{ key: 'logic', lv1: '逻辑能力', lv2: '逻辑与层次体系', max: 10,
		desc: '论点鲜明，论据确凿，论证充分，达到所在专业领域要求。体系完整，层次分明，重点突出' },
	{ key: 'application', lv1: '专业水平', lv2: '综合应用知识能力', max: 30,
		desc: '综合运用工程基础知识、专业知识和技能，对信息与通信及相关领域的复杂工程或科学问题，系统分析各项指标，提出设计方案，实现满足特定需求的系统或单元，完成任务书的技术指标要求，在设计环节中体现创新' },
	{ key: 'analysis', lv1: '专业水平', lv2: '分析解决问题能力', max: 30,
		desc: '针对毕业设计课题的需求，合理选择恰当的软硬件平台、编程语言或设计仿真工具，并熟练运用这些现代工具进行设计开发、仿真分析、测量调试及预测模拟，得到有助于解决问题的有效结论' },
	{ key: 'format', lv1: '学术规范', lv2: '行文和引用规范', max: 20,
		desc: '文字表达、书写格式、图表（图纸）、公式符号、缩略词等方面符合规范。在资料引证、参考文献等方面符合通行学术规范和知识产权相关规定' }
];

export default {
	name: 'PaperReviewModal',
	props: {
		visible: { type: Boolean, default: false },
		paperId: { type: [String, Number], default: '' },
		student: { type: Object, default: () => ({}) },
		paper: { type: Object, default: () => ({}) }
	},
	emits: ['close', 'saved'],
	data() {
		return {
			items: ITEMS,
			form: {
				topic_meaning: '',
				logic: '',
				application: '',
				analysis: '',
				format: ''
			},
			errors: {
				topic_meaning: '',
				logic: '',
				application: '',
				analysis: '',
				format: ''
			},
			isUpdateMode: false,
			submitting: false,
			loading: false,
			previewMode: false,
			a4Scale: 1,
			_a4ResizeHandler: null
		};
	},
	computed: {
		displayCollege() {
			return this.student?.college || this.paper?.college || this.student?.department || '';
		},
		displayTeacher() {
			const userInfo = uni.getStorageSync('userInfo') || {};
			return this.paper?.teacher_name || this.student?.teacher_name || userInfo?.name || userInfo?.username || '';
		},
		displayName() {
			return this.student?.name || this.student?.student_name || '';
		},
		displayStudentNo() {
			return this.student?.studentNumber || this.student?.student_number || this.student?.username || this.student?.id || '';
		},
		displayClass() {
			return this.student?.className || this.student?.class_name || this.student?.group_name || '';
		},
		displayTitle() {
			return this.paper?.title || '';
		},
		total() {
			return this.items.reduce((sum, item) => {
				const v = parseFloat(this.form[item.key]);
				return sum + (Number.isFinite(v) ? v : 0);
			}, 0);
		},
		totalDisplay() {
			// 保留一位小数，如果是整数则不带小数
			const t = this.total;
			if (!Number.isFinite(t)) return '0';
			return Number.isInteger(t) ? String(t) : t.toFixed(1);
		},
		hasAnyError() {
			return this.items.some(item => !!this.errors[item.key]);
		},
		allFilled() {
			return this.items.every(item => {
				const v = this.form[item.key];
				return v !== '' && v !== null && v !== undefined;
			});
		},
		canSubmit() {
			return this.allFilled && !this.hasAnyError;
		}
	},
	watch: {
		visible(v) {
			if (v) {
				this.previewMode = false;
				this.initForm();
			}
		},
		previewMode(v) {
			if (v) {
				this.$nextTick(() => this.updateA4Scale());
			}
		}
	},
	mounted() {
		// #ifdef H5
		if (typeof window !== 'undefined') {
			this._a4ResizeHandler = () => this.updateA4Scale();
			window.addEventListener('resize', this._a4ResizeHandler);
		}
		// #endif
	},
	beforeUnmount() {
		// #ifdef H5
		if (typeof window !== 'undefined' && this._a4ResizeHandler) {
			window.removeEventListener('resize', this._a4ResizeHandler);
			this._a4ResizeHandler = null;
		}
		// #endif
	},
	beforeDestroy() {
		// Vue2 兼容
		// #ifdef H5
		if (typeof window !== 'undefined' && this._a4ResizeHandler) {
			window.removeEventListener('resize', this._a4ResizeHandler);
			this._a4ResizeHandler = null;
		}
		// #endif
	},
	methods: {
		initForm() {
			// 重置
			this.items.forEach(item => {
				this.form[item.key] = '';
				this.errors[item.key] = '';
			});
			this.isUpdateMode = false;
			this.loadExistingGrade();
		},
		async loadExistingGrade() {
			if (!this.paperId) return;
			this.loading = true;
			try {
				const res = await getPaperGrade(this.paperId);
				const data = (res && (res.data || res)) || {};
				const grade = data.data || data;
				if (grade && (grade.total_score !== undefined || grade.topic_meaning !== undefined)) {
					this.items.forEach(item => {
						const v = grade[item.key];
						if (v !== undefined && v !== null && v !== '') {
							this.form[item.key] = String(v);
						}
					});
					this.isUpdateMode = true;
				}
			} catch (e) {
				// 接口未就绪或暂无评分，忽略
				console.warn('[PaperReviewModal] 加载已有评分失败或不存在:', e && e.message);
			} finally {
				this.loading = false;
			}
		},
		onScoreInput(e, item) {
			// 清洗：只允许数字和一个小数点，最多一位小数
			let val = String(e.detail.value || '').trim();
			val = val.replace(/[^0-9.]/g, '');
			// 只保留第一个小数点
			const dotIdx = val.indexOf('.');
			if (dotIdx !== -1) {
				val = val.slice(0, dotIdx + 1) + val.slice(dotIdx + 1).replace(/\./g, '');
				// 只允许一位小数
				const parts = val.split('.');
				if (parts[1] && parts[1].length > 1) {
					val = parts[0] + '.' + parts[1].slice(0, 1);
				}
			}
			this.form[item.key] = val;
			this.validateOne(item);
		},
		onScoreBlur(item) {
			this.validateOne(item, true);
		},
		validateOne(item, finalize = false) {
			const raw = this.form[item.key];
			if (raw === '' || raw === null || raw === undefined) {
				this.errors[item.key] = finalize ? '请填写得分' : '';
				return;
			}
			if (raw === '.') {
				this.errors[item.key] = '请输入有效数字';
				return;
			}
			const num = parseFloat(raw);
			if (!Number.isFinite(num)) {
				this.errors[item.key] = '请输入有效数字';
				return;
			}
			if (num < 0) {
				this.errors[item.key] = '得分不能小于 0';
				return;
			}
			if (num > item.max) {
				this.errors[item.key] = `不能超过 ${item.max}`;
				return;
			}
			// 一位小数
			if (/^\d+\.\d{2,}$/.test(raw)) {
				this.errors[item.key] = '最多一位小数';
				return;
			}
			this.errors[item.key] = '';
		},
		validateAll() {
			this.items.forEach(item => this.validateOne(item, true));
			return !this.hasAnyError && this.allFilled;
		},
		handleClose() {
			if (this.submitting) return;
			this.previewMode = false;
			this.$emit('close');
		},
		togglePreview() {
			this.previewMode = !this.previewMode;
		},
		updateA4Scale() {
			// #ifdef H5
			if (!this.previewMode) return;
			this.$nextTick(() => {
				const ref = this.$refs.a4Scaler;
				const el = ref && (ref.$el || ref);
				if (!el || !el.clientWidth || !el.clientHeight) return;
				// 留 8px 内边距，避免贴边
				const w = el.clientWidth - 8;
				const h = el.clientHeight - 8;
				const sx = w / 794;
				const sy = h / 1123;
				const s = Math.min(sx, sy);
				this.a4Scale = Math.max(0.3, Math.min(1.5, s));
			});
			// #endif
		},
		formatScoreCell(key) {
			const raw = this.form[key];
			if (raw === '' || raw === null || raw === undefined) return '';
			const num = parseFloat(raw);
			if (!Number.isFinite(num)) return '';
			return Number.isInteger(num) ? String(num) : num.toFixed(1);
		},
		handleDownloadPdf() {
			// #ifdef H5
			try {
				const node = document.getElementById('paper-review-print-area');
				if (!node) {
					uni.showToast({ title: '预览节点未就绪', icon: 'none' });
					return;
				}
				const html = node.outerHTML;
				// 抓取页面中评阅表组件相关的样式（scoped 样式靠 data-v 属性已带在 outerHTML 里）
				const styles = Array.from(document.querySelectorAll('style'))
					.map(s => s.innerHTML)
					.join('\n');
				const linkTags = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
					.map(l => l.outerHTML)
					.join('\n');
				const title = `评阅表_${this.displayName || ''}_${this.displayStudentNo || ''}`.replace(/_+$/, '');
				const win = window.open('', '_blank', 'width=900,height=1200');
				if (!win) {
					uni.showToast({ title: '请允许弹出窗口后重试', icon: 'none' });
					return;
				}
				win.document.open();
				win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>${linkTags}<style>${styles}</style><style>
@page { size: A4; margin: 0; }
html, body { margin: 0; padding: 0; background: #fff; font-family: "SimSun","宋体","Songti SC",serif; }
body { padding: 18mm 16mm; }
#paper-review-print-area { box-shadow: none !important; border: none !important; padding: 56px 64px 60px !important; margin: 0 auto !important; width: auto !important; min-height: auto !important; transform: none !important; position: relative !important; top: auto !important; left: auto !important; }
.review-grade-mask, .review-grade-wrapper, .review-grade-header, .review-grade-footer { display: none !important; }
@media print { body { padding: 16mm 14mm; } }
</style></head><body>${html}</body></html>`);
				win.document.close();
				// 等待样式加载后触发打印
				setTimeout(() => {
					try {
						win.focus();
						win.print();
					} catch (e) { /* ignore */ }
				}, 350);
			} catch (e) {
				console.warn('[PaperReviewModal] 下载 PDF 失败:', e && e.message);
				uni.showToast({ title: '下载失败，请重试', icon: 'none' });
			}
			// #endif
			// #ifndef H5
			uni.showToast({ title: 'PDF 下载仅在 H5 端可用', icon: 'none' });
			// #endif
		},
		async handleSubmit() {
			if (!this.validateAll()) {
				uni.showToast({ title: '请先完整填写并修正错误', icon: 'none' });
				return;
			}
			const payload = {
				topic_meaning: parseFloat(this.form.topic_meaning),
				logic: parseFloat(this.form.logic),
				application: parseFloat(this.form.application),
				analysis: parseFloat(this.form.analysis),
				format: parseFloat(this.form.format),
				total_score: Number(this.totalDisplay)
			};
			this.submitting = true;
			try {
				const api = this.isUpdateMode ? updatePaperGrade : submitPaperGrade;
				await api(this.paperId, payload);
				uni.showToast({ title: '评分已保存', icon: 'success' });
				this.$emit('saved', { paperId: this.paperId, ...payload });
				this.$emit('close');
			} catch (e) {
				// 后端接口尚未就绪时，允许回退到本地存储，保证前端可体验
				console.warn('[PaperReviewModal] 接口保存失败，回退本地存储:', e && e.message);
				try {
					const key = `paper_grade_${this.paperId}`;
					uni.setStorageSync(key, { ...payload, _local: true, ts: Date.now() });
					uni.showToast({ title: '已暂存（本地）', icon: 'none' });
					this.$emit('saved', { paperId: this.paperId, ...payload, _local: true });
					this.$emit('close');
				} catch (err) {
					uni.showToast({ title: '保存失败，请稍后再试', icon: 'none' });
				}
			} finally {
				this.submitting = false;
			}
		}
	}
};
</script>

<style lang="scss" scoped>
.review-grade-mask {
	position: fixed;
	inset: 0;
	background: rgba(15, 23, 42, 0.55);
	backdrop-filter: blur(8rpx);
	-webkit-backdrop-filter: blur(8rpx);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
	padding: 40rpx 24rpx;
	box-sizing: border-box;
}

.review-grade-wrapper {
	width: 100%;
	max-width: 1100rpx;
	max-height: 92vh;
	background: #fff;
	border-radius: 20rpx;
	box-shadow: 0 20rpx 60rpx rgba(15, 23, 42, 0.2);
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

/* 预览模式：弹窗外框严格按 A4 比例 210:297（约 1:1.4143） */
.review-grade-wrapper.in-preview {
	width: auto;
	max-width: 95vw;
	height: 94vh;
	max-height: 94vh;
	aspect-ratio: 210 / 297;
}

.review-grade-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 28rpx 40rpx 20rpx;
	border-bottom: 1rpx solid #eef0f3;
	background: linear-gradient(180deg, #f8fafc 0%, #fff 100%);

	.header-title-wrap { display: flex; flex-direction: column; gap: 6rpx; }
	.header-subtitle { font-size: 22rpx; color: #94a3b8; letter-spacing: 1rpx; }
	.header-title { font-size: 34rpx; color: #0f172a; font-weight: 700; }

	.header-actions {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.header-toggle-btn {
		display: inline-flex;
		align-items: center;
		gap: 6rpx;
		padding: 8rpx 18rpx;
		height: 56rpx;
		border-radius: 28rpx;
		background: #eff6ff;
		color: #1d4ed8;
		font-size: 24rpx;
		cursor: pointer;
		border: 1rpx solid #bfdbfe;
		transition: background .2s;
		.material-symbols-outlined { font-size: 30rpx; }
		&:hover { background: #dbeafe; }
		&.is-preview {
			background: #fef3c7;
			color: #b45309;
			border-color: #fde68a;
			&:hover { background: #fde68a; }
		}
	}

	.header-close {
		width: 56rpx; height: 56rpx;
		display: flex; align-items: center; justify-content: center;
		border-radius: 50%;
		cursor: pointer;
		transition: background .2s;
		.material-symbols-outlined { font-size: 36rpx; color: #64748b; }
		&:hover { background: #f1f5f9; }
	}
}

.review-grade-body {
	flex: 1 1 auto;
	min-height: 0;
	padding: 24rpx 40rpx 12rpx;
	overflow-y: auto;
	overflow-x: hidden;
	-webkit-overflow-scrolling: touch;
}

.info-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 12rpx 24rpx;
	padding: 20rpx 24rpx;
	background: #f8fafc;
	border: 1rpx solid #e2e8f0;
	border-radius: 12rpx;
	margin-bottom: 20rpx;

	.info-item {
		display: flex;
		align-items: baseline;
		gap: 12rpx;
		min-width: 0;
	}
	.info-item-full {
		grid-column: 1 / -1;
	}
	.info-label {
		flex-shrink: 0;
		color: #64748b;
		font-size: 24rpx;
	}
	.info-value {
		color: #0f172a;
		font-size: 26rpx;
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
	}
}

.grade-table {
	border: 1rpx solid #e2e8f0;
	border-radius: 12rpx;
	overflow: hidden;
	background: #fff;
}

.grade-row {
	display: grid;
	grid-template-columns: 120rpx 180rpx 1fr 100rpx 200rpx;
	border-bottom: 1rpx solid #e2e8f0;
	transition: background .2s;

	&:last-child { border-bottom: none; }

	.col {
		padding: 20rpx 16rpx;
		font-size: 24rpx;
		color: #334155;
		display: flex;
		align-items: center;
		border-right: 1rpx solid #e2e8f0;
		min-height: 80rpx;

		&:last-child { border-right: none; }
	}
	.col-desc {
		color: #475569;
		line-height: 1.6;
		display: block;
		white-space: normal;
	}
	.col-max { justify-content: center; color: #64748b; }
	.col-score { flex-direction: column; align-items: stretch; justify-content: center; gap: 6rpx; }
}

.grade-row-head {
	background: #f1f5f9;
	.col {
		color: #0f172a;
		font-weight: 600;
		justify-content: center;
	}
	.col-desc { justify-content: flex-start; }
}

.grade-row-error {
	background: #fef2f2;
}

.grade-row-total {
	background: #eff6ff;
	.col { color: #1d4ed8; font-weight: 600; }
	.total-value {
		justify-content: center;
		font-size: 32rpx;
		color: #1d4ed8;
		font-weight: 700;
	}
}

.score-input {
	width: 100%;
	height: 56rpx;
	padding: 0 16rpx;
	border: 1rpx solid #cbd5e1;
	border-radius: 8rpx;
	font-size: 26rpx;
	color: #0f172a;
	background: #fff;
	box-sizing: border-box;
	transition: border-color .2s, box-shadow .2s;

	&:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3rpx rgba(59, 130, 246, 0.15);
	}
}
.score-input-error {
	border-color: #ef4444;
	background: #fff;
}
.score-error {
	color: #ef4444;
	font-size: 22rpx;
	line-height: 1.3;
}

.tips {
	display: flex;
	align-items: flex-start;
	gap: 10rpx;
	margin: 20rpx 0 10rpx;
	padding: 16rpx 20rpx;
	background: #fffbeb;
	border: 1rpx solid #fde68a;
	border-radius: 10rpx;

	.tips-icon { font-size: 30rpx; color: #d97706; }
	.tips-text { font-size: 22rpx; color: #92400e; line-height: 1.6; }
}

.review-grade-footer {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 16rpx;
	padding: 20rpx 40rpx;
	border-top: 1rpx solid #eef0f3;
	background: #fff;
}

.btn {
	min-width: 180rpx;
	height: 72rpx;
	line-height: 72rpx;
	border-radius: 10rpx;
	font-size: 26rpx;
	padding: 0 28rpx;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border: 1rpx solid transparent;
	cursor: pointer;
	transition: all .2s;
}
.btn-plain {
	background: #fff;
	border-color: #cbd5e1;
	color: #475569;
	&:hover { background: #f1f5f9; }
}
.btn-primary {
	background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
	color: #fff;
	&:hover { filter: brightness(1.05); }
}
.btn-disabled {
	opacity: 0.55;
	cursor: not-allowed;
	&:hover { filter: none; }
}

/* 小屏自适应 */
@media (max-width: 720px) {
	.info-grid { grid-template-columns: 1fr; }
	.grade-row {
		grid-template-columns: 120rpx 1fr 200rpx;
		.col-lv2 { display: none; }
		.col-max { display: none; }
	}
	.grade-row-head .col-lv2,
	.grade-row-head .col-max { display: none; }
}

/* ====== 预览模式：A4 还原样式 ====== */
.preview-body {
	background: #e2e8f0;
	padding: 12rpx;
	display: flex;
	justify-content: center;
	align-items: flex-start;
	overflow: hidden;
	flex: 1 1 auto;
	min-height: 0;
}
.a4-scaler {
	flex: 1 1 auto;
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: flex-start;
	overflow: hidden;
}
.a4-frame {
	position: relative;
	flex-shrink: 0;
	background: #fff;
	box-shadow: 0 6rpx 24rpx rgba(15, 23, 42, 0.18);
}

.a4-paper {
	position: absolute;
	top: 0;
	left: 0;
	width: 794px;          /* A4 宽 210mm @ 96dpi */
	min-height: 1123px;    /* A4 高 297mm @ 96dpi */
	background: #fff;
	padding: 56px 64px 60px;
	box-sizing: border-box;
	font-family: "SimSun", "宋体", "Songti SC", "Noto Serif CJK SC", serif;
	color: #000;
	font-size: 14px;
	line-height: 1.7;
	transform-origin: top left;
}

/* 四角裁切标记 */
.a4-crop {
	position: absolute;
	width: 22px;
	height: 22px;
}
.a4-crop::before,
.a4-crop::after {
	content: '';
	position: absolute;
	background: #000;
}
.a4-crop::before { /* 横线 */
	height: 1px;
	width: 22px;
	left: 0;
}
.a4-crop::after { /* 竖线 */
	width: 1px;
	height: 22px;
	top: 0;
}
.a4-crop-tl { top: 18px; left: 22px; }
.a4-crop-tl::before { top: 0; }
.a4-crop-tl::after { left: 0; }
.a4-crop-tr { top: 18px; right: 22px; }
.a4-crop-tr::before { top: 0; right: 0; left: auto; }
.a4-crop-tr::after { right: 0; top: 0; }
.a4-crop-bl { bottom: 18px; left: 22px; }
.a4-crop-bl::before { bottom: 0; top: auto; }
.a4-crop-bl::after { left: 0; bottom: 0; top: auto; }
.a4-crop-br { bottom: 18px; right: 22px; }
.a4-crop-br::before { bottom: 0; top: auto; right: 0; left: auto; }
.a4-crop-br::after { right: 0; bottom: 0; top: auto; }

.a4-subtitle {
	font-size: 12px;
	margin: 0 0 6px 4px;
	color: #000;
}
.a4-title {
	text-align: center;
	font-size: 24px;
	font-weight: 700;
	margin-bottom: 22px;
	letter-spacing: 4px;
	font-family: "SimHei", "黑体", "SimSun", "宋体", serif;
}

.a4-info-line {
	display: flex;
	align-items: flex-end;
	flex-wrap: nowrap;
	margin-bottom: 14px;
	font-size: 14px;
	gap: 0;
	letter-spacing: 1px;
}
.a4-label {
	flex-shrink: 0;
	color: #000;
	white-space: nowrap;
	font-family: "SimSun", "宋体", serif;
}
/* label 字距对齐：让冒号位置整齐 */
.a4-label-w4 {
	display: inline-block;
	letter-spacing: 0;
}
.a4-label-w2 {
	display: inline-block;
	letter-spacing: 0;
}
.a4-label-gap { margin-left: 22px; }

.a4-fill {
	border-bottom: 1px solid #000;
	display: inline-block;
	padding: 0 6px;
	text-align: center;
	line-height: 22px;
	min-height: 22px;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
.a4-fill-md {
	flex: 1 1 0;
	min-width: 140px;
}
.a4-fill-sm {
	flex: 1 1 0;
	min-width: 90px;
}
.a4-fill-long {
	flex: 1 1 auto;
	min-width: 0;
}

/* HTML 原生 table 样式（支持 rowspan/colspan） */
.a4-html-table {
	width: 100%;
	border-collapse: collapse;
	margin-top: 6px;
	font-size: 14px;
	font-family: "SimSun", "宋体", serif;
	table-layout: fixed;
}
.a4-html-table td {
	border: 1px solid #000;
	padding: 8px 6px;
	vertical-align: middle;
	text-align: center;
	color: #000;
	line-height: 1.55;
	word-break: keep-all;
	overflow-wrap: break-word;
	white-space: normal;
}
.a4-html-head td {
	font-weight: 700;
	height: 38px;
	padding: 6px 4px;
}
.a4-cell-l1 {
	letter-spacing: 2px;
}
.a4-cell-l2 {
	padding: 8px 4px !important;
}
.a4-cell-desc {
	text-align: left !important;
	padding: 8px 10px !important;
	line-height: 1.7 !important;
	word-break: normal;
	overflow-wrap: break-word;
}
.a4-row-total td {
	height: 36px;
}
.a4-row-comment {
	height: 240px;
}
.a4-row-comment .a4-cell-comment-label {
	vertical-align: middle;
	overflow: hidden !important;
	box-sizing: border-box;
	letter-spacing: 2px;
}
.a4-cell-comment {
	vertical-align: bottom !important;
	padding: 12px 12px !important;
	height: 240px;
	overflow: hidden !important;
	box-sizing: border-box;
	text-align: right !important;
}
.a4-sign-line {
	display: block;
	text-align: right;
	font-size: 14px;
	line-height: 1.6;
	white-space: nowrap;
	margin-top: 0;
}
.a4-sign-label {
	display: inline-block;
	font-weight: 600;
	vertical-align: bottom;
}
.a4-sign-blank {
	display: inline-block;
	width: 110px;
	border-bottom: 1px solid #000;
	height: 20px;
	vertical-align: bottom;
}
.a4-date-line {
	display: block;
	text-align: right;
	font-size: 14px;
	line-height: 1.6;
	white-space: nowrap;
	margin-top: 12px;
}
.a4-date-text {
	display: inline-block;
	vertical-align: bottom;
	padding: 0 2px;
}
.a4-date-blank {
	display: inline-block;
	width: 50px;
	border-bottom: 1px solid #000;
	height: 18px;
	vertical-align: bottom;
	margin: 0 2px;
}
.a4-date-blank-sm {
	width: 26px !important;
}

@media (max-width: 900px) {
	.preview-body { padding: 20rpx 10rpx; }
	.a4-paper {
		width: 100%;
		min-height: auto;
		padding: 36px 24px;
	}
}
</style>
