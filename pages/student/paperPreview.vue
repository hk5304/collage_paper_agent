<template>
  <view class="paper-preview-page" :class="{ 'dark-mode': isDarkMode }">
    <!-- 顶部标题栏 -->
    <view class="top-header">
      <view class="header-left">
        <view class="back-btn" @tap.stop="goBack" hover-class="back-btn-hover">
          <text class="back-icon material-symbols-outlined">arrow_back</text>
        </view>
      </view>
      <text class="header-title">{{ pageTitle }}</text>
      <view class="header-right"></view>
    </view>

    <!-- 加载中 -->
    <view v-if="loading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">正在加载论文内容...</text>
    </view>

    <!-- 错误提示 -->
    <view v-else-if="error" class="error-container">
      <text class="error-text">{{ error }}</text>
      <button class="retry-btn" @click="loadContent">重新加载</button>
    </view>

    <!-- Docx 文档预览 -->
    <view v-else class="doc-preview-wrapper">
      <scroll-view scroll-y class="doc-scroll">
        <view class="doc-inner">
          <div ref="docxContainer" class="docx-content"></div>
        </view>
      </scroll-view>
    </view>

    <!-- 批注列表面板（有批注时展示，可折叠） -->
    <view v-if="annotations.length > 0" class="annotation-list-panel" :class="{ collapsed: !showAnnotationList }">
      <view class="annotation-list-header">
        <text class="annotation-list-title">
          {{ showAnnotationList ? '批注列表' : '批注' }} ({{ annotations.length }})
        </text>
        <text class="annotation-list-toggle-btn" @click="showAnnotationList = !showAnnotationList">
          {{ showAnnotationList ? '收起' : '展开' }}
        </text>
      </view>
      <scroll-view scroll-y class="annotation-list-body" v-if="showAnnotationList" :scroll-top="0">
        <view
          v-for="(item, index) in annotations"
          :key="item.id || index"
          class="annotation-list-item"
          :class="{ 
            active: selectedAnnotation && selectedAnnotation.id === item.id,
            'ai-item': item.source === 'ai',
            'teacher-item': item.source === 'teacher'
          }"
          @click="scrollToAnnotation(item, index)"
        >
          <view class="annotation-list-item-header">
            <text class="annotation-list-item-badge" :class="item.source">
              {{ item.source === 'ai' ? 'AI' : '教师' }}
            </text>
            <text class="annotation-list-item-author">{{ item.author }}</text>
            <text class="annotation-list-item-time">{{ formatTime(item.created_at) }}</text>
          </view>
          <text class="annotation-list-item-preview">
            {{ truncate(item.selectedText || item.content, 60) }}
          </text>
        </view>
        <view v-if="annotations.length === 0" class="annotation-list-empty">
          <text>暂无批注</text>
        </view>
      </scroll-view>
    </view>

    <!-- 批注详情弹窗 -->
    <view v-if="showDetailModal" class="annotation-modal-backdrop" @click.self="closeDetailModal">
      <view class="annotation-modal">
        <view class="modal-header">
          <view class="modal-header-left"></view>
          <text class="modal-title">论文批注</text>
          <view class="modal-header-right">
            <text class="modal-close material-symbols-outlined" @click="closeDetailModal">close</text>
          </view>
        </view>
        <scroll-view scroll-y class="modal-body">
          <!-- 元信息 -->
          <view class="annotation-meta">
            <view class="annotation-author-section">
              <text class="annotation-source-badge" :class="currentAnnotation.source">
                {{ currentAnnotation.source === 'ai' ? 'AI' : '教师' }}
              </text>
              <text class="annotation-author">{{ currentAnnotation.author || '教师' }}</text>
            </view>
            <text class="annotation-time">{{ formatTime(currentAnnotation.created_at) }}</text>
          </view>
          <!-- 选中内容 -->
          <view class="annotation-section" v-if="currentAnnotation.selectedText">
            <text class="section-label">选中内容</text>
            <view class="section-box selected-box">
              <text class="section-text">{{ currentAnnotation.selectedText }}</text>
            </view>
          </view>
          <!-- 批注内容 -->
          <view class="annotation-section" v-if="currentAnnotation.content">
            <text class="section-label">批注</text>
            <view class="section-box comment-box">
              <rich-text :nodes="currentAnnotation.content" class="section-text"></rich-text>
            </view>
          </view>
          <!-- 建议 -->
          <view class="annotation-section" v-if="currentAnnotation.suggestion">
            <text class="section-label">建议</text>
            <view class="section-box suggestion-box">
              <text class="section-text">{{ currentAnnotation.suggestion }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
import { getPaperDetail, getAnnotationsByPaperId } from '../../api/student.js';
import { config } from '../../api/config.js';

// 文档服务基础地址
const DOC_BASE_URL = `${config.baseURL}/doc/essay/`;

export default {
  data() {
    return {
      paperId: null,
      loading: true,
      error: '',
      isDarkMode: false,
      docxUrl: '',
      docxModule: null,
      annotations: [],
      selectedAnnotation: null,
      showDetailModal: false,
      showAnnotationList: false,
      currentAnnotation: {},
      pageTitle: '论文预览'
    };
  },

  onLoad(options) {
    this.isDarkMode = uni.getStorageSync('theme') === 'dark';
    uni.$on('themeChanged', ({ isDarkMode }) => { this.isDarkMode = isDarkMode; });
    this.loadPaperData(options);
  },

  onUnload() {
    uni.$off('themeChanged');
    // 清理批注重试定时器
    if (this._annotationRetryTimer) {
      clearTimeout(this._annotationRetryTimer);
      this._annotationRetryTimer = null;
    }
  },

  methods: {
    // ─── 导航 ───────────────────────────────────────────

    goBack() {
      // 尝试返回上一页，如果无法返回则跳转到论文列表页
      const pages = getCurrentPages();
      if (pages.length > 1) {
        uni.navigateBack();
      } else {
        uni.redirectTo({
          url: '/pages/student/paperList'
        });
      }
    },

    // ─── 数据加载 ───────────────────────────────────────────

    loadPaperData(options) {
      if (options.id) this.paperId = options.id;

      // 根据showAnnotations参数设置页面标题
      if (options.showAnnotations === 'true') {
        this.pageTitle = '论文批注';
      }

      // 尝试读取 paperList 页面传递过来的批注数据
      const app = getApp();
      if (app.globalData?.previewAnnotations) {
        this.annotations = app.globalData.previewAnnotations.map(item => this.parseAnnotation(item));
        app.globalData.previewAnnotations = null;
      }

      this.loadContent();
    },

    async loadContent() {
      if (!this.paperId) {
        this.error = '论文ID不能为空';
        this.loading = false;
        return;
      }

      this.loading = true;
      this.error = '';

      try {
        const res = await getPaperDetail(this.paperId);

        if (!res?.id) {
          this.error = '获取论文详情失败';
          this.loading = false;
          return;
        }

        // 构建文档下载 URL
        const ossKey = res.oss_key || res.pdf_oss_key;
        if (!ossKey) {
          this.error = '该论文暂无可预览文件';
          this.loading = false;
          return;
        }
        this.docxUrl = DOC_BASE_URL + ossKey.split('/').pop();

        // 加载批注（若尚未从全局数据获取）
        if (this.annotations.length === 0) {
          await this.loadAnnotations();
        }

        // 渲染文档
        this.loading = false;
        await this.$nextTick();
        await this.renderDocx();

      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[Preview] 加载预览失败:', err);
        }
        this.error = err.message || '加载预览失败';
        this.loading = false;
      }
    },

    async loadAnnotations() {
      try {
        const res = await getAnnotationsByPaperId(this.paperId);
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        this.annotations = list.map(item => this.parseAnnotation(item));
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[Annotation] 加载批注失败');
        }
        this.annotations = [];
      }
    },

    // ─── 数据解析 ───────────────────────────────────────────

    /**
     * 解析后端批注数据
     * content 格式："选中内容：...\n批注：<HTML>\n建议：..."
     * 改进：支持更多格式，清理selectedText中的多余空白
     */
    parseAnnotation(item) {
      const coords = item.coordinates || item.coordinates_json || {};
      const x = parseFloat(coords.x) || 0;
      const y = parseFloat(coords.y) || 0;

      const raw = item.rawContent || item.content || '';
      
      // 改进：更灵活地提取选中内容
      let selectedText = '';
      const selectedTextPatterns = [
        /选中内容：([\s\S]+?)(?:\n批注：|$)/,
        /选中内容[:：]\s*([\s\S]+?)(?:\n|$)/,
        /"selectedText"[:：]\s*"([^"]+)"/,
        /"text"[:：]\s*"([^"]+)"/
      ];
      
      for (const pattern of selectedTextPatterns) {
        const match = raw.match(pattern);
        if (match && match[1]) {
          selectedText = match[1].trim();
          break;
        }
      }
      
      // 清理选中内容中的多余空白和换行
      selectedText = selectedText
        .replace(/\s+/g, ' ')  // 多个空白合并为一个空格
        .replace(/\n+/g, ' ')  // 换行转为空格
        .trim();

      const commentMatch = raw.match(/批注：([\s\S]+?)(?:\n建议：|$)/);
      const comment = commentMatch ? commentMatch[1].trim() : (selectedText ? '' : raw);
      const suggestion = raw.match(/建议：([\s\S]+?)$/)?.[1]?.trim() ?? '';

      const authorId = item.author_id || item.authorId;
      const source = authorId ? 'teacher' : 'ai';

      return {
        id: item.id,
        paperId: item.paper_id || item.paperId,
        authorId,
        author: item.author_name || (source === 'ai' ? 'AI助手' : '指导教师'),
        source,
        x, y,
        content: comment,
        selectedText,
        suggestion,
        created_at: item.created_at,
        updated_at: item.updated_at
      };
    },

    // ─── 文档渲染 ───────────────────────────────────────────

    async renderDocx() {
      const container = this.$refs.docxContainer;
      if (!container) {
        this.error = '渲染容器初始化失败';
        return;
      }

      try {
        if (!this.docxModule) {
          this.docxModule = await import('docx-preview');
        }

        const response = await fetch(this.docxUrl);
        if (!response.ok) throw new Error(`下载失败: HTTP ${response.status}`);

        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength === 0) throw new Error('文档内容为空');

        container.innerHTML = '';
        await this.docxModule.renderAsync(
          new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
          container,
          null,
          { className: 'docx', inWrapper: true, ignoreWidth: false, ignoreHeight: false, defaultTabStop: 720, enableExperimentalFeatures: true }
        );

        await this.$nextTick();
        await new Promise(resolve => setTimeout(resolve, 300));
        this.applyAnnotationMarkers();

      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[Docx] 文档渲染失败');
        }
        this.error = '文档渲染失败：' + (err.message || '未知错误');
      }
    },

    // ─── 批注标记 ───────────────────────────────────────────

    /**
     * 递归累加 offsetTop，获取元素相对指定容器的真实偏移量
     */
    getOffsetTopRelative(el, container) {
      let top = 0;
      let current = el;
      while (current && current !== container && current !== document.body) {
        top += current.offsetTop;
        current = current.offsetParent;
      }
      return top;
    },

    /**
     * 渲染完成后，对匹配段落插入批注标记
     * 重构策略：
     * 1. 首先使用坐标定位到文档的大致位置
     * 2. 在该位置范围内进行局部文本匹配
     * 3. 实现精确的下划线标注
     */
    applyAnnotationMarkers(retryCount = 0) {
      const container = this.$refs.docxContainer;
      if (!container) {
        return;
      }
      
      if (this.annotations.length === 0) {
        return;
      }

      const totalHeight = container.scrollHeight;
      if (totalHeight === 0) {
        if (retryCount < 3) {
          this._annotationRetryTimer = setTimeout(() => {
            this._annotationRetryTimer = null;
            this.applyAnnotationMarkers(retryCount + 1);
          }, 1000);
        }
        return;
      }

      // 获取所有文本元素并计算位置
      const textElements = Array.from(
        container.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6, td, th, div[class*="paragraph"], div[class*="text"], span[class*="text"]')
      ).filter(el => el.textContent.trim().length > 0);

      if (textElements.length === 0) {
        return;
      }

      // 预计算所有元素位置
      const positions = textElements
        .map(el => ({ 
          el, 
          top: this.getOffsetTopRelative(el, container),
          height: el.offsetHeight,
          text: el.textContent.trim()
        }))
        .sort((a, b) => a.top - b.top);

      // 清理旧高亮
      this._clearExistingHighlights(container);

      // 处理每个批注
      this.annotations.forEach((annotation, index) => {
        this._processAnnotation(annotation, index, positions, totalHeight);
      });
    },

    /**
     * 清理现有高亮标记
     */
    _clearExistingHighlights(container) {
      container.querySelectorAll('.annotation-side-marker').forEach(el => el.remove());
      container.querySelectorAll('mark.annotation-highlight').forEach(mark => {
        const parent = mark.parentNode;
        while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
        parent.removeChild(mark);
        parent.normalize();
      });
      container.querySelectorAll('.annotation-accent').forEach(el => {
        el.classList.remove('annotation-accent', 'highlight-ai', 'highlight-teacher');
        el.removeAttribute('data-annotation-index');
      });
    },

    /**
     * 处理单个批注的定位和标注
     */
    _processAnnotation(annotation, index, positions, totalHeight) {
      // 步骤1：解析坐标
      const targetY = this._parseCoordinate(annotation.y, totalHeight);
      
      // 步骤2：使用坐标定位候选元素（在坐标附近300px范围内）
      const candidates = this._findCandidatesByPosition(positions, targetY, 300);
      
      // 步骤3：在候选元素中进行文本匹配
      let matchResult = null;
      
      if (annotation.selectedText && annotation.selectedText.trim().length >= 3) {
        // 优先在候选元素中匹配
        matchResult = this._matchTextInCandidates(candidates, annotation.selectedText);
        
        // 如果在候选元素中未找到，尝试全局匹配
        if (!matchResult) {
          matchResult = this._matchTextGlobally(positions, annotation.selectedText);
        }
      }
      
      // 步骤4：应用标注
      if (matchResult) {
        // 成功匹配，应用精确下划线标注
        const { element, matchedText } = matchResult;
        const cls = annotation.source === 'ai' ? 'highlight-ai' : 'highlight-teacher';
        const clickHandler = e => {
          e.stopPropagation();
          this.showAnnotationDetail(annotation);
        };
        
        // 使用实际匹配的文本进行高亮
        const success = this._highlightWithUnderline(
          element, 
          matchedText || annotation.selectedText, 
          cls, 
          index, 
          clickHandler
        );
        
        if (!success) {
          // 下划线失败时回退到色条
          this._applySideMarker(element, annotation, index);
        }
      } else if (candidates.length > 0) {
        // 文本匹配失败，但找到了坐标附近的元素，显示色条
        const closest = candidates[0];
        this._applySideMarker(closest.el, annotation, index);
      }
    },

    /**
     * 解析坐标值（支持像素和百分比）
     */
    _parseCoordinate(y, totalHeight) {
      if (!y || y <= 0) return 0;
      // 如果y>100认为是像素值，否则是百分比
      return y > 100 ? y : totalHeight * (y / 100);
    },

    /**
     * 根据位置查找候选元素
     */
    _findCandidatesByPosition(positions, targetY, maxDistance) {
      return positions
        .map(p => ({
          ...p,
          distance: Math.abs(p.top + p.height / 2 - targetY)
        }))
        .filter(p => p.distance < maxDistance)
        .sort((a, b) => a.distance - b.distance);
    },

    /**
     * 在候选元素中匹配文本
     */
    _matchTextInCandidates(candidates, searchText) {
      const normalize = s => s.replace(/[\s\u00a0\u200b\u200c\u200d\u2003\u2009\u3000\ufeff]+/g, '');
      const normSearch = normalize(searchText);
      
      for (const candidate of candidates) {
        const normText = normalize(candidate.text);
        
        // 尝试完整匹配
        if (normText.includes(normSearch)) {
          return { element: candidate.el, matchedText: searchText };
        }
        
        // 尝试前缀匹配（前30个字符）
        if (normSearch.length > 10) {
          const prefix = normSearch.substring(0, 30);
          if (normText.includes(prefix)) {
            return { element: candidate.el, matchedText: searchText };
          }
        }
        
        // 尝试相似度匹配
        if (normSearch.length >= 10) {
          const similarity = this._calculateTextSimilarity(normText, normSearch);
          if (similarity > 0.7) {
            return { element: candidate.el, matchedText: searchText };
          }
        }
      }
      
      return null;
    },

    /**
     * 全局文本匹配（当局部匹配失败时）
     */
    _matchTextGlobally(positions, searchText) {
      const normalize = s => s.replace(/[\s\u00a0\u200b\u200c\u200d\u2003\u2009\u3000\ufeff]+/g, '');
      const normSearch = normalize(searchText);
      
      // 按文本长度排序，优先匹配较长的元素（更可能是完整段落）
      const sortedByLength = [...positions].sort((a, b) => b.text.length - a.text.length);
      
      for (const pos of sortedByLength) {
        const normText = normalize(pos.text);
        
        if (normText.includes(normSearch)) {
          return { element: pos.el, matchedText: searchText };
        }
        
        // 前缀匹配
        if (normSearch.length > 15) {
          const prefix = normSearch.substring(0, 30);
          if (normText.includes(prefix)) {
            return { element: pos.el, matchedText: searchText };
          }
        }
      }
      
      return null;
    },

    /**
     * 计算文本相似度
     */
    _calculateTextSimilarity(text1, text2) {
      const longer = text1.length > text2.length ? text1 : text2;
      const shorter = text1.length > text2.length ? text2 : text1;
      
      if (longer.length === 0) return 1.0;
      
      // 使用最长公共子序列计算相似度
      const lcs = this._longestCommonSubsequence(longer, shorter);
      return lcs / longer.length;
    },

    /**
     * 最长公共子序列
     */
    _longestCommonSubsequence(a, b) {
      const m = a.length, n = b.length;
      const dp = Array(2).fill(null).map(() => Array(n + 1).fill(0));
      
      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          if (a[i - 1] === b[j - 1]) {
            dp[i % 2][j] = dp[(i - 1) % 2][j - 1] + 1;
          } else {
            dp[i % 2][j] = Math.max(dp[(i - 1) % 2][j], dp[i % 2][j - 1]);
          }
        }
      }
      
      return dp[m % 2][n];
    },

    /**
     * 应用下划线高亮
     */
    _highlightWithUnderline(element, searchText, cls, index, clickHandler) {
      return this.highlightTextInElement(element, searchText, cls, index, clickHandler);
    },

    /**
     * 应用侧边色条标记
     */
    _applySideMarker(element, annotation, index) {
      const cls = annotation.source === 'ai' ? 'highlight-ai' : 'highlight-teacher';
      const clickHandler = e => {
        e.stopPropagation();
        this.showAnnotationDetail(annotation);
      };
      
      element.classList.add('annotation-accent', cls);
      element.setAttribute('data-annotation-index', index);
      element.addEventListener('click', clickHandler);
    },

    /**
     * 对目标段落应用荧光笔高亮
     * 1. 有 selectedText 且匹配成功 → 精确 <mark> 高亮（下划线形式）
     * 2. 匹配失败 / 无 selectedText → 段落左边色条
     */
    applyTextHighlight(targetEl, annotation, index) {
      // 参数校验
      if (!targetEl || !targetEl.nodeType) {
        return;
      }

      const cls = annotation.source === 'ai' ? 'highlight-ai' : 'highlight-teacher';
      const clickHandler = e => {
        e.stopPropagation();
        this.showAnnotationDetail(annotation);
      };

      // 尝试精确文字高亮（下划线形式）
      if (annotation.selectedText && typeof annotation.selectedText === 'string') {
        const done = this.highlightTextInElement(targetEl, annotation.selectedText, cls, index, clickHandler);
        if (done) {
          return;
        }
      }

      // 退回：段落左边色条（不加背景色，不影响文字阅读）
      targetEl.classList.add('annotation-accent', cls);
      targetEl.setAttribute('data-annotation-index', index);
      targetEl.addEventListener('click', clickHandler);
    },

    /**
     * 在元素内精确匹配 searchText，用 <mark> 包裹
     * 重构：采用多策略匹配，优先精确匹配，支持智能容错
     */
    highlightTextInElement(el, searchText, cls, index, clickHandler) {
      if (!el || !searchText || typeof searchText !== 'string') {
        return false;
      }

      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
      const nodes = [];
      let node;
      while ((node = walker.nextNode())) nodes.push(node);

      if (nodes.length === 0) return false;

      // 拼接原始文本
      let fullText = '';
      const offsets = [];
      for (const n of nodes) {
        offsets.push(fullText.length);
        fullText += n.nodeValue;
      }

      // 多策略匹配
      const matchResult = this._findBestMatch(fullText, searchText);
      if (!matchResult) return false;

      const { startPos, endPos } = matchResult;
      return this._wrapRange(nodes, offsets, startPos, endPos, cls, index, clickHandler);
    },

    /**
     * 多策略文本匹配 - 找到最佳匹配位置
     */
    _findBestMatch(fullText, searchText) {
      // 规范化函数
      const normalize = s => s.replace(/[\s\u00a0\u200b\u200c\u200d\u2003\u2009\u3000\ufeff]+/g, '')
                              .replace(/[\"\"''']/g, '"')
                              .replace(/[''']/g, "'")
                              .replace(/[，。！？、；：""''（）【】]/g, '')
                              .toLowerCase();

      const normFull = normalize(fullText);
      const normSearch = normalize(searchText);

      if (!normSearch || normSearch.length < 2) return null;

      // 策略1：精确匹配
      let normIdx = normFull.indexOf(normSearch);
      if (normIdx !== -1) {
        return this._mapNormalizedToOriginal(fullText, normIdx, normSearch.length);
      }

      // 策略2：前缀匹配（前20个字符）
      if (normSearch.length > 10) {
        const prefix = normSearch.substring(0, 20);
        normIdx = normFull.indexOf(prefix);
        if (normIdx !== -1) {
          return this._mapNormalizedToOriginal(fullText, normIdx, prefix.length);
        }
      }

      // 策略3：滑动窗口相似度匹配
      if (normSearch.length >= 8) {
        const windowSize = Math.min(normSearch.length, 30);
        let bestMatch = { idx: -1, similarity: 0, length: 0 };

        for (let i = 0; i <= normFull.length - windowSize; i++) {
          const window = normFull.substring(i, i + windowSize);
          const similarity = this._calculateSimilarity(normSearch.substring(0, windowSize), window);
          
          if (similarity > bestMatch.similarity) {
            bestMatch = { idx: i, similarity, length: windowSize };
          }
        }

        if (bestMatch.similarity > 0.85) {
          return this._mapNormalizedToOriginal(fullText, bestMatch.idx, bestMatch.length);
        }
      }

      return null;
    },

    /**
     * 将规范化后的位置映射回原始文本位置
     */
    _mapNormalizedToOriginal(fullText, normIdx, normLen) {
      const isSpace = c => /[\s\u00a0\u200b\u200c\u200d\u2003\u2009\u3000\ufeff]/.test(c);
      
      let charCount = 0, startPos = -1, endPos = -1;
      
      for (let i = 0; i < fullText.length; i++) {
        if (!isSpace(fullText[i])) {
          if (charCount === normIdx) startPos = i;
          if (charCount === normIdx + normLen - 1) {
            endPos = i + 1;
            break;
          }
          charCount++;
        }
      }
      
      // 如果找不到结束位置，使用文本末尾
      if (startPos !== -1 && endPos === -1) {
        endPos = fullText.length;
      }
      
      if (startPos === -1 || endPos === -1 || startPos >= endPos) {
        return null;
      }

      return { startPos, endPos };
    },

    /**
     * 计算字符串相似度（基于字符匹配率）
     */
    _calculateSimilarity(a, b) {
      if (a.length !== b.length) {
        // 长度不同时，使用较短的长度
        const minLen = Math.min(a.length, b.length);
        a = a.substring(0, minLen);
        b = b.substring(0, minLen);
      }
      
      let matches = 0;
      for (let i = 0; i < a.length; i++) {
        if (a[i] === b[i]) matches++;
      }
      
      return matches / a.length;
    },

    /** 将文字节点在 [matchStart, matchEnd) 范围内用 <mark> 包裹 */
    _wrapRange(nodes, offsets, matchStart, matchEnd, cls, index, clickHandler) {
      for (let i = 0; i < nodes.length; i++) {
        const nodeStart = offsets[i];
        const nodeEnd   = nodeStart + nodes[i].nodeValue.length;
        if (nodeEnd <= matchStart || nodeStart >= matchEnd) continue;

        const cutStart = Math.max(matchStart, nodeStart) - nodeStart;
        const cutEnd   = Math.min(matchEnd,   nodeEnd)   - nodeStart;
        const text     = nodes[i].nodeValue;

        const mark = document.createElement('mark');
        mark.className = `annotation-highlight ${cls}`;
        mark.setAttribute('data-annotation-index', index);
        mark.textContent = text.slice(cutStart, cutEnd);
        mark.addEventListener('click', clickHandler);

        const parent = nodes[i].parentNode;
        if (cutStart > 0) parent.insertBefore(document.createTextNode(text.slice(0, cutStart)), nodes[i]);
        parent.insertBefore(mark, nodes[i]);
        if (cutEnd < text.length) parent.insertBefore(document.createTextNode(text.slice(cutEnd)), nodes[i]);
        parent.removeChild(nodes[i]);
      }
      return true;
    },

    // ─── 交互操作 ───────────────────────────────────────────

    showAnnotationDetail(annotation) {
      this.currentAnnotation = annotation;
      this.selectedAnnotation = annotation;
      this.showDetailModal = true;
    },

    closeDetailModal() {
      this.showDetailModal = false;
      this.selectedAnnotation = null;
      this.currentAnnotation = {};
    },

    scrollToAnnotation(annotation, index) {
      this.selectedAnnotation = annotation;
      this.showAnnotationList = false;

      const container = this.$refs.docxContainer;
      if (!container) return;

      // 优先找精确 <mark> 高亮，其次找左边色条元素
      const marker =
        container.querySelector(`mark.annotation-highlight[data-annotation-index="${index}"]`) ||
        container.querySelector(`.annotation-accent[data-annotation-index="${index}"]`);
      if (!marker) return;

      marker.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // 临时加深高亮动画
      const originalOutline = marker.style.outline;
      const originalOutlineOffset = marker.style.outlineOffset;
      marker.style.transition = 'outline 0.2s ease';
      marker.style.outline = '3px solid currentColor';
      marker.style.outlineOffset = '3px';

      // 恢复原始样式
      setTimeout(() => {
        marker.style.outline = originalOutline;
        marker.style.outlineOffset = originalOutlineOffset;
      }, 1500);

      // 延迟展示详情弹窗
      setTimeout(() => { this.showAnnotationDetail(annotation); }, 500);
    },

    // ─── 工具方法 ───────────────────────────────────────────

    formatTime(timeStr) {
      if (!timeStr) return '';
      return new Date(timeStr).toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
    },

    /** 截取文本预览，超出部分加省略号 */
    truncate(text, len = 50) {
      if (!text) return '';
      return text.length > len ? text.substring(0, len) + '...' : text;
    }
  }
};
</script>

<style scoped>
/* ==================== 顶部标题栏 ==================== */
.top-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 64px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  min-width: 40px;
}

.header-right {
  justify-content: flex-end;
}

.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover,
.back-btn-hover {
  background: #f5f5f5;
}

.back-icon {
  font-size: 20px;
  color: #5f6368;
  font-family: 'Material Symbols Outlined', sans-serif;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.header-title {
  font-size: 18px;
  font-weight: 800;
  color: #005bbf;
  line-height: 1.2;
  letter-spacing: -0.01em;
  text-align: center;
  flex: 1;
}

/* ==================== 基础布局 ==================== */
.paper-preview-page {
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-top: 64px;
}

.loading-container,
.error-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #e2e8f0;
  border-top-color: #1677ff;
  border-radius: 50%;
  animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  margin-bottom: 30rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container {
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.error-container {
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.loading-text {
  font-size: 28rpx;
  color: #718096;
}

.error-text {
  font-size: 30rpx;
  color: #e53e3e;
  margin-bottom: 30rpx;
  text-align: center;
}

.retry-btn {
  padding: 20rpx 60rpx;
  background-color: #1677ff;
  color: #fff;
  border-radius: 8rpx;
  font-size: 30rpx;
  border: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.retry-btn:hover {
  background-color: #4096ff;
  transform: translateY(-2rpx);
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.3);
}

.retry-btn:active {
  transform: translateY(0) scale(0.98);
  transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ==================== Docx 预览 ==================== */
.doc-preview-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background-color: #e8e8e8;
}

.doc-scroll { height: 100%; }

.doc-inner {
  position: relative;
  min-height: 100%;
  padding: 20rpx;
  box-sizing: border-box;
}

.docx-content {
  width: 100%;
  background-color: #fff;
  animation: contentFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes contentFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ==================== 下划线批注标记 ==================== */

/* 精确文字下划线 <mark> - 使用 !important 确保优先级 */
:deep(mark.annotation-highlight) {
  background-color: transparent !important;
  color: inherit !important;
  cursor: pointer !important;
  padding: 0 !important;
  margin: 0 !important;
  text-decoration: underline !important;
  text-decoration-thickness: 2px !important;
  text-underline-offset: 3px !important;
  transition: filter 0.15s ease !important;
  font-style: normal !important;
  font-weight: inherit !important;
}

:deep(mark.annotation-highlight:hover) {
  filter: brightness(0.85) !important;
  text-decoration-thickness: 3px !important;
}

:deep(mark.highlight-ai) {
  text-decoration-color: #1890ff !important;
}

:deep(mark.highlight-teacher) {
  text-decoration-color: #faad14 !important;
}

/* 整段高亮块样式已移除，仅保留精确文字 <mark> 高亮 */

/* 退回：段落左边色条（无 selectedText 或匹配失败时） */
:deep(.annotation-accent) {
  cursor: pointer !important;
  border-left: 3px solid transparent !important;
  padding-left: 6px !important;
  transition: background-color 0.15s ease !important;
}

:deep(.annotation-accent:hover) {
  background-color: rgba(0, 0, 0, 0.04) !important;
}

:deep(.annotation-accent.highlight-ai) {
  border-left-color: #1890ff !important;
}

:deep(.annotation-accent.highlight-teacher) {
  border-left-color: #faad14 !important;
}

/* ==================== 批注列表面板 ==================== */
.annotation-list-panel {
  position: fixed;
  top: 64px;
  right: 0;
  width: 320px;
  max-width: 85vw;
  height: calc(100vh - 64px);
  background-color: #ffffff;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  z-index: 900;
  display: flex;
  flex-direction: column;
  border-radius: 12px 0 0 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(0);
  animation: slideInRight 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.annotation-list-panel.collapsed {
  width: auto;
  min-width: 100px;
  height: auto;
  max-height: 60px;
}

.annotation-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  background-color: #f8f9fa;
  border-bottom: 1rpx solid #e9ecef;
}

.annotation-list-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2d3748;
}

.annotation-list-toggle-btn {
  font-size: 24rpx;
  color: #1890ff;
  padding: 8rpx 16rpx;
  cursor: pointer;
  background-color: rgba(24, 144, 255, 0.1);
  border-radius: 8rpx;
  font-weight: 500;
}

.annotation-list-body {
  flex: 1;
  padding: 20rpx;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(100vh - 64px - 100rpx);
}

.annotation-list-item {
  padding: 24rpx;
  background-color: #f8f9fa;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 4rpx solid transparent;
  transform: translateX(0);
}

.annotation-list-item:hover {
  background-color: #e9ecef;
  transform: translateX(-4rpx);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.annotation-list-item:active {
  transform: translateX(-2rpx) scale(0.98);
  transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
}

.annotation-list-item.active {
  background-color: #e3f2fd;
  border-left-color: #1890ff;
}

/* AI批注激活状态边条 */
.annotation-list-item.active.ai-item {
  border-left-color: #1890ff;
  background-color: rgba(24, 144, 255, 0.08);
}

/* 教师批注激活状态边条 */
.annotation-list-item.active.teacher-item {
  border-left-color: #faad14;
  background-color: rgba(250, 173, 20, 0.08);
}

.annotation-list-empty {
  padding: 40rpx;
  text-align: center;
  color: #a0aec0;
  font-size: 28rpx;
}

.annotation-list-item-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.annotation-list-item-badge { font-size: 28rpx; }

.annotation-list-item-author {
  font-size: 28rpx;
  font-weight: 500;
  color: #2d3748;
  flex: 1;
}

.annotation-list-item-time {
  font-size: 24rpx;
  color: #a0aec0;
}

.annotation-list-item-preview {
  font-size: 26rpx;
  color: #718096;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ==================== 批注详情弹窗 ==================== */
.annotation-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  box-sizing: border-box;
  animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.annotation-modal {
  position: relative;
  width: calc(100vw - 40px);
  max-width: 700px;
  background-color: #ffffff;
  border-radius: 16px;
  overflow: visible;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  box-sizing: border-box;
  animation: modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 24px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
  border-radius: 16px 16px 0 0;
  box-sizing: border-box;
}

.modal-header-left,
.modal-header-right {
  display: flex;
  align-items: center;
  min-width: 40px;
}

.modal-header-right {
  justify-content: flex-end;
}

.modal-title {
  font-size: 16px;
  font-weight: 800;
  color: #005bbf;
  line-height: 1.2;
  letter-spacing: -0.01em;
  text-align: center;
  flex: 1;
}

.modal-close {
  font-size: 20px;
  color: #5f6368;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: transparent;
  font-family: 'Material Symbols Outlined', sans-serif;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.modal-close:hover {
  color: #1f1f1f;
  background-color: #f5f5f5;
}

.dark-mode .modal-close:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 30rpx;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
}

/* ==================== 批注元信息 ==================== */
.annotation-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #e9ecef;
  gap: 20rpx;
}

.annotation-author-section {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex-shrink: 0;
}

.annotation-source-badge {
  font-size: 22rpx;
  padding: 6rpx 18rpx;
  border-radius: 20rpx;
  font-weight: 700;
  letter-spacing: 1px;
}

.annotation-source-badge.ai {
  background-color: rgba(24, 144, 255, 0.15);
  color: #1890ff;
  border: 1rpx solid rgba(24, 144, 255, 0.4);
}

.annotation-source-badge.teacher {
  background-color: rgba(255, 193, 7, 0.15);
  color: #d97706;
  border: 1rpx solid rgba(255, 193, 7, 0.4);
}

.annotation-author {
  font-size: 28rpx;
  color: #4a5568;
  font-weight: 500;
}

.annotation-time {
  font-size: 26rpx;
  color: #a0aec0;
  flex-shrink: 0;
  white-space: nowrap;
}

/* ==================== 批注内容区块 ==================== */
.annotation-section { margin-bottom: 24rpx; }

.section-label {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 16rpx;
}

.section-box {
  padding: 24rpx;
  border-radius: 12rpx;
  font-size: 30rpx;
  line-height: 1.8;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  box-sizing: border-box;
  max-height: 300rpx;
  overflow-y: auto;
}

.section-box rich-text {
  display: block;
  max-width: 100%;
  font-size: 30rpx;
  line-height: 1.8;
}

.section-box .section-text {
  display: block;
  word-break: break-word;
  overflow-wrap: break-word;
  font-size: 30rpx;
  line-height: 1.8;
}

.selected-box { background-color: #fff8e1; border-left: 4rpx solid #ffc107; }
.selected-box .section-text { color: #5d4037; }

.comment-box { background-color: #f0f7ff; border-left: 4rpx solid #1890ff; }
.comment-box .section-text { color: #1a3c6e; }

.suggestion-box { background-color: #f0fff4; border-left: 4rpx solid #38a169; }
.suggestion-box .section-text { color: #1c4532; }

/* ==================== 深色模式 ==================== */
.paper-preview-page.dark-mode { background-color: #1a1a1a; }

/* 深色模式 - 顶部标题栏 */
.dark-mode .top-header {
  background: #2d3748;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.dark-mode .back-btn:hover,
.dark-mode .back-btn-hover {
  background: #383838;
}

.dark-mode .back-icon {
  color: #9aa0a6;
}

.dark-mode .header-title {
  color: #8ab4f8;
}

.dark-mode .loading-container,
.dark-mode .error-container { background-color: #1a1a1a; }

.dark-mode .loading-spinner {
  border-color: #444444;
  border-top-color: #4db3ff;
}

.dark-mode .loading-text { color: #a0aec0; }

.dark-mode .error-text {
  color: #ff8a80;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.dark-mode .retry-btn {
  background-color: #1890ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.dark-mode .retry-btn:hover {
  background-color: #4db3ff;
  box-shadow: 0 6px 16px rgba(77, 179, 255, 0.4);
}

.dark-mode .doc-preview-wrapper { background-color: #1a1a1a; }

.dark-mode .docx-content {
  background-color: #2d2d2d;
  color: #e0e0e0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.dark-mode .doc-inner {
  background-color: #1a1a1a;
}

.dark-mode .annotation-list-panel {
  background-color: #2d3748;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.5);
}

.dark-mode .annotation-list-header {
  background-color: #1a202c;
  border-bottom-color: #4a5568;
}

.dark-mode .annotation-list-title { color: #ffffff; }

.dark-mode .annotation-list-item {
  background-color: #1a202c;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.dark-mode .annotation-list-item:hover {
  background-color: #2d3748;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
}
.dark-mode .annotation-list-item.active {
  background-color: rgba(24, 144, 255, 0.2);
  border-left-color: #1890ff;
}

.dark-mode .annotation-list-item.active.ai-item {
  border-left-color: #4db3ff;
  background-color: rgba(77, 179, 255, 0.15);
}

.dark-mode .annotation-list-item.active.teacher-item {
  border-left-color: #ffd54f;
  background-color: rgba(255, 213, 79, 0.15);
}

.dark-mode .annotation-list-empty {
  color: #718096;
}

.dark-mode .annotation-list-item-author { color: #e2e8f0; }
.dark-mode .annotation-list-item-preview { color: #a0aec0; }
.dark-mode .annotation-list-toggle-btn {
  color: #4db3ff;
  background-color: rgba(24, 144, 255, 0.2);
}

/* 深色模式 - 下划线批注 */
.dark-mode :deep(mark.highlight-ai) {
  text-decoration-color: #4db3ff;
}

.dark-mode :deep(mark.highlight-teacher) {
  text-decoration-color: #ffd54f;
}

/* 深色模式 - 段落左边色条 */
.dark-mode :deep(.annotation-accent:hover) {
  background-color: rgba(255, 255, 255, 0.05);
}

.dark-mode :deep(.annotation-accent.highlight-ai) { border-left-color: #4db3ff; }
.dark-mode :deep(.annotation-accent.highlight-teacher) { border-left-color: #ffd54f; }


.dark-mode .annotation-modal {
  background-color: #2d3748;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.dark-mode .modal-header {
  background-color: #2d3748;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.dark-mode .modal-title { color: #8ab4f8; }

.dark-mode .modal-close { color: #9aa0a6; }

.dark-mode .modal-close:hover {
  color: #ffffff;
  background-color: #383838;
}

.dark-mode .modal-body {
  scrollbar-width: thin;
  scrollbar-color: #4a5568 #2d3748;
}

.dark-mode .modal-body::-webkit-scrollbar {
  width: 8px;
}

.dark-mode .modal-body::-webkit-scrollbar-track {
  background: #2d3748;
}

.dark-mode .modal-body::-webkit-scrollbar-thumb {
  background: #4a5568;
  border-radius: 4px;
}

.dark-mode .modal-body::-webkit-scrollbar-thumb:hover {
  background: #718096;
}

.dark-mode .annotation-meta { border-bottom-color: #4a5568; }
.dark-mode .annotation-author { color: #e2e8f0; }

.dark-mode .annotation-source-badge.ai {
  background-color: rgba(24, 144, 255, 0.25);
  color: #4db3ff;
}

.dark-mode .annotation-source-badge.teacher {
  background-color: rgba(255, 193, 7, 0.25);
  color: #ffd54f;
}

.dark-mode .annotation-time { color: #718096; }

/* ==================== 响应式设计 ==================== */

/* 大屏幕 (>1200px) */
@media screen and (min-width: 1200px) {
  .preview-container {
    max-width: 1000px;
  }
  
  .docx-preview-wrapper {
    padding: 48px;
  }
}

/* 中等屏幕 (768px-1199px) */
@media screen and (max-width: 1199px) and (min-width: 768px) {
  .preview-container {
    max-width: 90%;
    margin: 80px auto 40px;
  }
  
  .docx-preview-wrapper {
    padding: 32px;
  }
  
  .preview-toolbar {
    padding: 12px 20px;
  }
  
  .toolbar-title {
    font-size: 15px;
  }
}

/* 小屏幕手机 (<768px) */
@media screen and (max-width: 767px) {
  .preview-page {
    padding: 0;
    background: #ffffff;
  }
  
  .preview-container {
    max-width: 100%;
    margin: 64px 0 0;
    border-radius: 0;
    box-shadow: none;
  }
  
  .preview-toolbar {
    padding: 10px 16rpx;
    flex-wrap: wrap;
    gap: 10rpx;
    height: auto;
    min-height: 56px;
  }
  
  .toolbar-left,
  .toolbar-right {
    flex: 1;
    min-width: 120rpx;
  }
  
  .toolbar-title {
    font-size: 14px;
    order: -1;
    width: 100%;
    text-align: center;
    margin-bottom: 8rpx;
  }
  
  .back-btn,
  .toolbar-btn {
    padding: 8rpx 16rpx;
    font-size: 24rpx;
  }
  
  .btn-icon {
    font-size: 18px;
  }
  
  .docx-preview-wrapper {
    padding: 20rpx;
    min-height: calc(100vh - 120px);
  }
  
  /* 弹窗适配 */
  .modal-overlay {
    padding: 16rpx;
  }
  
  .modal-container {
    width: 95%;
    max-width: 95%;
    max-height: 90vh;
  }
  
  .modal-header {
    height: 56px;
    padding: 0 16rpx;
  }
  
  .modal-title {
    font-size: 15px;
  }
  
  .modal-body {
    padding: 16rpx;
  }
  
  .annotation-item {
    padding: 16rpx;
  }
  
  .annotation-header {
    flex-direction: column;
    gap: 12rpx;
  }
  
  .annotation-content {
    font-size: 14px;
  }
}

/* 超小屏幕 (<480px) */
@media screen and (max-width: 479px) {
  .preview-toolbar {
    padding: 8rpx 12rpx;
  }
  
  .toolbar-title {
    font-size: 13px;
  }
  
  .back-btn,
  .toolbar-btn {
    padding: 6rpx 12rpx;
    font-size: 22rpx;
  }
  
  .btn-icon {
    font-size: 16px;
  }
  
  .docx-preview-wrapper {
    padding: 16rpx;
  }
  
  .modal-container {
    width: 98%;
    border-radius: 12px;
  }
  
  .modal-header {
    height: 52px;
  }
  
  .modal-title {
    font-size: 14px;
  }
}

/* 窗口缩放时的过渡动画 */
.preview-container,
.modal-container,
.docx-preview-wrapper {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
