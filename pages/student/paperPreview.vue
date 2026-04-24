<template>
  <view
    class="paper-preview-page"
    :class="{
      'dark-mode': isDarkMode,
      'has-annotation-panel': annotations.length > 0,
      'annotation-markers-hidden': !showAnnotationUnderline
    }"
  >
    <!-- 顶部标题栏 -->
    <view class="top-header">
      <view class="header-left">
        <view class="back-btn" @tap.stop="goBack" hover-class="back-btn-hover">
          <text class="back-icon material-symbols-outlined">arrow_back</text>
        </view>
        <view class="header-brand">
          <view class="header-brand-icon">
            <text class="material-symbols-outlined">article</text>
          </view>
          <view class="header-brand-text">
            <text class="header-brand-title">{{ pageTitle }}</text>
            <text class="header-brand-subtitle">论文管理系统</text>
          </view>
        </view>
      </view>
      <view class="header-right">
        <view
          v-if="annotations.length > 0"
          class="underline-toggle-btn"
          :class="{ 'is-active': showAnnotationUnderline }"
          @tap.stop="toggleAnnotationUnderline"
        >
          <text class="underline-toggle-icon material-symbols-outlined">
            {{ showAnnotationUnderline ? 'visibility' : 'visibility_off' }}
          </text>
          <text class="underline-toggle-label">
            {{ showAnnotationUnderline ? '隐藏标注' : '显示标注' }}
          </text>
        </view>
      </view>
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

    <!-- 批注列表面板（有批注时常驻显示） -->
    <view v-if="annotations.length > 0" class="annotation-list-panel">
      <view class="annotation-list-header">
        <text class="annotation-list-title">批注列表 ({{ annotations.length }})</text>
      </view>
      <scroll-view
        scroll-y
        class="annotation-list-body"
        :scroll-top="0"
        :show-scrollbar="true"
        :enable-back-to-top="true"
      >
        <view
          v-for="(item, index) in annotations"
          :key="item.id || index"
          :id="'annotation-item-' + index"
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
          <view class="annotation-list-item-body">
            <view v-if="item.selectedText" class="annotation-list-section">
              <text class="annotation-list-section-label">选中原文</text>
              <text class="annotation-list-section-box selected">{{ item.selectedText }}</text>
            </view>
            <view v-if="item.content" class="annotation-list-section">
              <text class="annotation-list-section-label">批注</text>
              <view class="annotation-list-section-box comment">
                <rich-text :nodes="item.content" class="annotation-list-rich-text"></rich-text>
              </view>
            </view>
            <view v-if="item.suggestion" class="annotation-list-section">
              <text class="annotation-list-section-label">建议</text>
              <text class="annotation-list-section-box suggestion">{{ item.suggestion }}</text>
            </view>
          </view>
        </view>
        <view v-if="annotations.length === 0" class="annotation-list-empty">
          <text>暂无批注</text>
        </view>
      </scroll-view>
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
      showAnnotationUnderline: true,
      selectedAnnotation: null,
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
    if (this._annotationFocusTimer) {
      clearTimeout(this._annotationFocusTimer);
      this._annotationFocusTimer = null;
    }
  },

  methods: {
    // ─── 导航 ───────────────────────────────────────────

    goBack() {
      // 尝试返回上一页，如果无法返回则跳转到工作台
      const pages = getCurrentPages();
      if (pages.length > 1) {
        uni.navigateBack();
      } else {
        uni.redirectTo({
          url: '/pages/student/workbench'
        });
      }
    },

    // ─── 数据加载 ───────────────────────────────────────────

    toggleAnnotationUnderline() {
      this.showAnnotationUnderline = !this.showAnnotationUnderline;
    },

    loadPaperData(options) {
      if (options.id) this.paperId = options.id;

      // 根据showAnnotations参数设置页面标题
      if (options.showAnnotations === 'true') {
        this.pageTitle = '论文批注';
      }

      // 尝试读取工作台页面传递过来的批注数据
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
          this.selectAnnotation(annotation, index);
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
        this.selectAnnotation(annotation, index);
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
        this.selectAnnotation(annotation, index);
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

      const { normalizedText: normFull, indexMap } = this._buildNormalizedIndexMap(fullText);
      const { normalizedText: normSearch } = this._buildNormalizedIndexMap(searchText);

      if (!normSearch || normSearch.length < 2) return null;

      // 策略1：精确匹配
      let normIdx = normFull.indexOf(normSearch);
      if (normIdx !== -1) {
        return this._mapNormalizedToOriginal(indexMap, normIdx, normSearch.length);
      }

      // 策略2：前缀匹配（前20个字符）
      if (normSearch.length > 10) {
        const prefix = normSearch.substring(0, 20);
        normIdx = normFull.indexOf(prefix);
        if (normIdx !== -1) {
          const candidate = normFull.substring(normIdx, normIdx + normSearch.length);
          if (
            candidate.length === normSearch.length &&
            this._calculateSimilarity(normSearch, candidate) > 0.72
          ) {
            return this._mapNormalizedToOriginal(indexMap, normIdx, normSearch.length);
          }
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
          const candidate = normFull.substring(bestMatch.idx, bestMatch.idx + normSearch.length);
          if (
            candidate.length === normSearch.length &&
            this._calculateSimilarity(normSearch, candidate) > 0.72
          ) {
            return this._mapNormalizedToOriginal(indexMap, bestMatch.idx, normSearch.length);
          }
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

    _mapNormalizedToOriginal(indexMap, normIdx, normLen) {
      if (
        !Array.isArray(indexMap) ||
        normIdx < 0 ||
        normLen <= 0 ||
        normIdx + normLen - 1 >= indexMap.length
      ) {
        return null;
      }

      const startPos = indexMap[normIdx];
      const endPos = indexMap[normIdx + normLen - 1] + 1;
      return { startPos, endPos };
    },

    _buildNormalizedIndexMap(text) {
      const normalizedChars = [];
      const indexMap = [];
      const source = typeof text === 'string' ? text : '';

      for (let i = 0; i < source.length; i++) {
        const normalizedChar = this._normalizeMatchChar(source[i]);
        if (!normalizedChar) continue;
        normalizedChars.push(normalizedChar);
        indexMap.push(i);
      }

      return {
        normalizedText: normalizedChars.join(''),
        indexMap
      };
    },

    _normalizeMatchChar(char) {
      if (/[\s\u00a0\u200b\u200c\u200d\u2003\u2009\u3000\ufeff]/.test(char)) {
        return '';
      }

      if (/["\u201C\u201D\u201E\u201F]/.test(char)) {
        return '"';
      }

      if (/['\u2018\u2019\u201A\u201B]/.test(char)) {
        return "'";
      }

      if (/[\uFF0C\u3002\uFF01\uFF1F\u3001\uFF1B\uFF1A\u300A\u300B\u3008\u3009\uFF08\uFF09\u3010\u3011\u300C\u300D\u300E\u300F\uFE41\uFE42\uFE43\uFE44\u3014\u3015\uFF3B\uFF3D\uFF5B\uFF5D,.!?;:()[\]{}<>]/.test(char)) {
        return '';
      }

      return char.toLowerCase();
    },

    _wrapRange(nodes, offsets, matchStart, matchEnd, cls, index, clickHandler) {
      const startBoundary = this._resolveTextBoundary(nodes, offsets, matchStart, false);
      const endBoundary = this._resolveTextBoundary(nodes, offsets, matchEnd, true);

      if (!startBoundary || !endBoundary) {
        return false;
      }

      const range = document.createRange();
      range.setStart(startBoundary.node, startBoundary.offset);
      range.setEnd(endBoundary.node, endBoundary.offset);

      if (range.collapsed) {
        return false;
      }

      const mark = document.createElement('mark');
      mark.className = `annotation-highlight ${cls}`;
      mark.setAttribute('data-annotation-index', index);
      mark.addEventListener('click', clickHandler);

      const fragment = range.extractContents();
      if (!fragment || !fragment.childNodes.length) {
        return false;
      }

      mark.appendChild(fragment);
      range.insertNode(mark);
      return true;
    },

    _resolveTextBoundary(nodes, offsets, targetPos, isEnd) {
      for (let i = 0; i < nodes.length; i++) {
        const nodeStart = offsets[i];
        const nodeEnd = nodeStart + nodes[i].nodeValue.length;
        const isInsideNode = isEnd ? targetPos <= nodeEnd : targetPos < nodeEnd;

        if (!isInsideNode) continue;

        return {
          node: nodes[i],
          offset: Math.max(0, Math.min(nodes[i].nodeValue.length, targetPos - nodeStart))
        };
      }

      const lastNode = nodes[nodes.length - 1];
      if (!lastNode) {
        return null;
      }

      return {
        node: lastNode,
        offset: lastNode.nodeValue.length
      };
    },

    selectAnnotation(annotation, index = null, syncList = true) {
      this.selectedAnnotation = annotation;
      if (!syncList || index == null) return;
      this.$nextTick(() => {
        if (typeof document === 'undefined') return;
        const itemEl = document.getElementById(`annotation-item-${index}`);
        if (itemEl && typeof itemEl.scrollIntoView === 'function') {
          itemEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    },

    scrollToAnnotation(annotation, index) {
      this.selectAnnotation(annotation, index, false);

      const container = this.$refs.docxContainer;
      if (!container) return;

      const highlightMarkers = Array.from(
        container.querySelectorAll(`mark.annotation-highlight[data-annotation-index="${index}"]`)
      );
      const markers = highlightMarkers.length > 0
        ? highlightMarkers
        : Array.from(container.querySelectorAll(`.annotation-accent[data-annotation-index="${index}"]`));
      if (markers.length === 0) return;

      markers[0].scrollIntoView({ behavior: 'smooth', block: 'center' });

      container.querySelectorAll('.annotation-locate-active').forEach(el => {
        el.classList.remove('annotation-locate-active');
      });
      if (this._annotationFocusTimer) {
        clearTimeout(this._annotationFocusTimer);
        this._annotationFocusTimer = null;
      }

      markers.forEach(marker => {
        marker.classList.remove('annotation-locate-active');
        void marker.offsetWidth;
        marker.classList.add('annotation-locate-active');
      });

      this._annotationFocusTimer = setTimeout(() => {
        markers.forEach(marker => marker.classList.remove('annotation-locate-active'));
        this._annotationFocusTimer = null;
      }, 1600);
      return;

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

    },

    // ─── 工具方法 ───────────────────────────────────────────

    formatTime(timeStr) {
      if (!timeStr) return '';
      return new Date(timeStr).toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
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
  background: var(--surface-container-lowest);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-8);
  box-sizing: border-box;
  box-shadow: var(--shadow);
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  min-width: 40px;
}

.header-left {
  gap: var(--spacing-3);
  min-width: 0;
  flex: 1;
}

.header-right {
  justify-content: flex-end;
  flex-shrink: 0;
}

.underline-toggle-btn {
  height: 40px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 999px;
  box-sizing: border-box;
  border: 1px solid rgba(212, 160, 23, 0.22);
  background: rgba(255, 255, 255, 0.92);
  color: var(--on-surface-variant);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.underline-toggle-btn:hover {
  background: rgba(212, 160, 23, 0.08);
  border-color: rgba(212, 160, 23, 0.38);
  color: var(--annotation-marker-color-hover);
}

.underline-toggle-btn.is-active {
  background: var(--annotation-marker-color-soft);
  border-color: rgba(212, 160, 23, 0.34);
  color: var(--annotation-marker-color-hover);
  box-shadow: 0 6px 16px rgba(212, 160, 23, 0.18);
}

.underline-toggle-icon {
  font-size: 18px;
  font-family: 'Material Symbols Outlined', sans-serif;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
}

.underline-toggle-label {
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  min-width: 0;
}

.header-brand-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: var(--shadow-primary);
  flex-shrink: 0;
}

.header-brand-icon .material-symbols-outlined {
  font-size: 20px;
}

.header-brand-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.header-brand-title {
  font-size: 18px;
  font-weight: 800;
  font-family: var(--font-display);
  color: var(--primary);
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.header-brand-subtitle {
  font-size: 12px;
  font-weight: 600;
  font-family: var(--font-body);
  color: var(--on-surface-variant);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-top: 2px;
}

.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover,
.back-btn-hover {
  background: var(--surface-container-low);
}

.back-icon {
  font-size: 20px;
  color: var(--on-surface-variant);
  font-family: 'Material Symbols Outlined', sans-serif;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

/* ==================== 基础布局 ==================== */
.paper-preview-page {
  --primary: #005bbf;
  --primary-container: #1a73e8;
  --surface-container-low: #f3f4f5;
  --surface-container-lowest: #ffffff;
  --on-surface-variant: #5f6368;
  --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-primary: 0 4px 16px rgba(0, 91, 191, 0.25);
  --font-display: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --spacing-3: 0.75rem;
  --spacing-8: 2rem;
  --radius-md: 0.75rem;
  --annotation-panel-width: 300px;
  --annotation-panel-gap: 12px;
  --annotation-panel-edge-gap: 8px;
  --annotation-marker-color: #d4a017;
  --annotation-marker-color-hover: #b8860b;
  --annotation-marker-color-soft: rgba(212, 160, 23, 0.14);
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: hidden;
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
  transition: margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
  text-decoration-skip-ink: none !important;
  transition: filter 0.15s ease !important;
  font-style: normal !important;
  font-weight: inherit !important;
}

:deep(mark.annotation-highlight:hover) {
  filter: brightness(0.85) !important;
  text-decoration-thickness: 3px !important;
}

@keyframes annotationUnderlinePulse {
  0% {
    filter: brightness(1) drop-shadow(0 0 0 rgba(212, 160, 23, 0));
  }
  35% {
    filter: brightness(1.08) drop-shadow(0 3px 8px rgba(212, 160, 23, 0.3));
  }
  100% {
    filter: brightness(1) drop-shadow(0 0 0 rgba(212, 160, 23, 0));
  }
}

:deep(mark.highlight-ai) {
  text-decoration-color: var(--annotation-marker-color) !important;
}

:deep(mark.highlight-teacher) {
  text-decoration-color: var(--annotation-marker-color) !important;
}

:deep(mark.annotation-highlight.annotation-locate-active) {
  text-decoration-color: var(--annotation-marker-color) !important;
  text-decoration-thickness: 4px !important;
  text-underline-offset: 5px !important;
  animation: annotationUnderlinePulse 0.8s ease 2 !important;
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
  border-left-color: var(--annotation-marker-color) !important;
}

:deep(.annotation-accent.highlight-teacher) {
  border-left-color: var(--annotation-marker-color) !important;
}

:deep(.annotation-accent.annotation-locate-active) {
  text-decoration: underline !important;
  text-decoration-color: var(--annotation-marker-color) !important;
  text-decoration-thickness: 3px !important;
  text-underline-offset: 5px !important;
  animation: annotationUnderlinePulse 0.8s ease 2 !important;
}

.paper-preview-page.annotation-markers-hidden :deep(mark.annotation-highlight) {
  cursor: inherit !important;
  text-decoration: none !important;
  transition: none !important;
}

.paper-preview-page.annotation-markers-hidden :deep(mark.annotation-highlight:hover) {
  filter: none !important;
  text-decoration-thickness: 0 !important;
}

.paper-preview-page.annotation-markers-hidden :deep(mark.annotation-highlight.annotation-locate-active) {
  text-decoration: underline !important;
  text-decoration-color: var(--annotation-marker-color) !important;
  text-decoration-thickness: 4px !important;
  text-underline-offset: 5px !important;
  animation: annotationUnderlinePulse 0.8s ease 2 !important;
}

.paper-preview-page.annotation-markers-hidden :deep(.annotation-accent) {
  cursor: inherit !important;
  border-left-width: 0 !important;
  border-left-color: transparent !important;
  padding-left: 0 !important;
}

.paper-preview-page.annotation-markers-hidden :deep(.annotation-accent:hover) {
  background-color: transparent !important;
}

.paper-preview-page.annotation-markers-hidden :deep(.annotation-accent.annotation-locate-active) {
  text-decoration: underline !important;
  text-decoration-color: var(--annotation-marker-color) !important;
  text-decoration-thickness: 3px !important;
  text-underline-offset: 5px !important;
  animation: annotationUnderlinePulse 0.8s ease 2 !important;
}

/* ==================== 批注列表面板 ==================== */
.annotation-list-panel {
  position: fixed;
  top: 64px;
  right: var(--annotation-panel-edge-gap);
  width: var(--annotation-panel-width);
  max-width: calc(88vw - 50rpx - var(--annotation-panel-edge-gap));
  height: calc(100vh - 64px);
  background-color: #ffffff;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  z-index: 98;
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

.annotation-list-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx 36rpx;
  background-color: #f8f9fa;
  border-bottom: 1rpx solid #e9ecef;
}

.annotation-list-title {
  width: 100%;
  font-size: 32rpx;
  font-weight: 600;
  color: #2d3748;
  text-align: center;
}

.annotation-list-body {
  flex: 1;
  padding: 20rpx 10px 20rpx 20rpx;
  min-height: 0;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(100vh - 64px - 100rpx);
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.9) transparent;
}

.annotation-list-body::-webkit-scrollbar {
  width: 10px;
}

.annotation-list-body::-webkit-scrollbar-track {
  background: transparent;
}

.annotation-list-body::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.9);
  border-radius: 999px;
  border: 2px solid transparent;
  background-clip: content-box;
}

.annotation-list-body::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.95);
  background-clip: content-box;
}

.annotation-list-item {
  padding: 24rpx;
  background-color: var(--surface-container-lowest);
  border-radius: 12rpx;
  margin-bottom: 16rpx;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1rpx solid #e2e8f0;
  border-left: 4rpx solid transparent;
  transform: translateX(0);
}

.annotation-list-item:hover {
  background-color: var(--surface-container-low);
  transform: translateX(-4rpx);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.annotation-list-item:active {
  transform: translateX(-2rpx) scale(0.98);
  transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
}

.annotation-list-item.active {
  background-color: rgba(0, 91, 191, 0.06);
  border-left-color: var(--primary);
  border-color: rgba(0, 91, 191, 0.16);
}

/* AI批注激活状态边条 */
.annotation-list-item.active.ai-item {
  border-left-color: var(--primary);
  background-color: rgba(0, 91, 191, 0.06);
}

/* 教师批注激活状态边条 */
.annotation-list-item.active.teacher-item {
  border-left-color: var(--primary);
  background-color: rgba(0, 91, 191, 0.06);
}

.annotation-list-empty {
  padding: 40rpx;
  text-align: center;
  color: #a0aec0;
  font-size: 28rpx;
}

.annotation-list-item-header {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 18rpx;
}

.annotation-list-item-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 700;
  line-height: 1.2;
  color: var(--on-surface-variant);
  background-color: var(--surface-container-low);
  border: 1rpx solid rgba(95, 99, 104, 0.16);
}

.annotation-list-item-author {
  font-size: 28rpx;
  font-weight: 500;
  color: #2d3748;
  flex: 1;
  min-width: 180rpx;
}

.annotation-list-item-time {
  font-size: 24rpx;
  color: #a0aec0;
  margin-left: auto;
}

.annotation-list-item-body {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.annotation-list-section {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.annotation-list-section-label {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--on-surface-variant);
}

.annotation-list-section-box {
  display: block;
  padding: 18rpx 20rpx;
  border-radius: 12rpx;
  font-size: 25rpx;
  line-height: 1.7;
  color: #334155;
  word-break: break-word;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
  box-sizing: border-box;
  background-color: var(--surface-container-lowest);
  border: 1rpx solid #e2e8f0;
}

.annotation-list-section-box.selected {
  background-color: #f8fafc;
  border-left: 4rpx solid #94a3b8;
  color: #334155;
}

.annotation-list-section-box.comment {
  border-left: 4rpx solid #cbd5e1;
  color: #334155;
}

.annotation-list-section-box.suggestion {
  border-left: 4rpx solid #cbd5e1;
  color: #334155;
}

.annotation-list-rich-text {
  display: block;
  font-size: 25rpx;
  line-height: 1.7;
  color: inherit;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.annotation-list-section-box.comment :deep(p) {
  margin: 0 0 12rpx;
}

.annotation-list-section-box.comment :deep(p:last-child) {
  margin-bottom: 0;
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
.paper-preview-page.dark-mode {
  background-color: #1a1a1a;
  --annotation-marker-color: #f4c451;
  --annotation-marker-color-hover: #ffd86b;
  --annotation-marker-color-soft: rgba(244, 196, 81, 0.18);
}

/* 深色模式 - 顶部标题栏 */
.dark-mode .top-header {
  background: var(--surface-container-lowest);
  box-shadow: var(--shadow);
}

.dark-mode .back-btn:hover,
.dark-mode .back-btn-hover {
  background: var(--surface-container-low);
}

.dark-mode .back-icon {
  color: var(--on-surface-variant);
}

.dark-mode .header-brand-title { color: var(--primary); }

.dark-mode .underline-toggle-btn {
  background: rgba(17, 24, 39, 0.88);
  border-color: rgba(244, 196, 81, 0.28);
  color: #e2e8f0;
}

.dark-mode .underline-toggle-btn:hover {
  background: rgba(244, 196, 81, 0.14);
  border-color: rgba(244, 196, 81, 0.42);
  color: var(--annotation-marker-color-hover);
}

.dark-mode .underline-toggle-btn.is-active {
  background: var(--annotation-marker-color-soft);
  border-color: rgba(244, 196, 81, 0.42);
  color: #fff3c4;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.28);
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
  background-color: #111827;
  border-color: #374151;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.dark-mode .annotation-list-item:hover {
  background-color: #1f2937;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
}
.dark-mode .annotation-list-item.active {
  background-color: rgba(77, 144, 255, 0.14);
  border-left-color: #4f8edc;
  border-color: rgba(77, 144, 255, 0.26);
}

.dark-mode .annotation-list-item.active.ai-item {
  border-left-color: #4f8edc;
  background-color: rgba(77, 144, 255, 0.14);
}

.dark-mode .annotation-list-item.active.teacher-item {
  border-left-color: #4f8edc;
  background-color: rgba(77, 144, 255, 0.14);
}

.dark-mode .annotation-list-empty {
  color: #718096;
}

.dark-mode .annotation-list-item-author { color: #e2e8f0; }
.dark-mode .annotation-list-item-badge {
  color: #cbd5e1;
  background-color: #1f2937;
  border-color: rgba(148, 163, 184, 0.2);
}

.dark-mode .annotation-list-section-label { color: #cbd5e1; }

.dark-mode .annotation-list-section-box {
  background-color: #111827;
  color: #e2e8f0;
  border-color: #374151;
}

.dark-mode .annotation-list-section-box.selected {
  background-color: #0f172a;
  border-left-color: #64748b;
  color: #e2e8f0;
}

.dark-mode .annotation-list-section-box.comment {
  border-left-color: #475569;
  color: #e2e8f0;
}

.dark-mode .annotation-list-section-box.suggestion {
  border-left-color: #475569;
  color: #e2e8f0;
}

.dark-mode .annotation-list-body {
  scrollbar-color: rgba(100, 116, 139, 0.95) transparent;
}

.dark-mode .annotation-list-body::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.95);
  background-clip: content-box;
}

.dark-mode .annotation-list-body::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.98);
  background-clip: content-box;
}

/* 深色模式 - 下划线批注 */
.dark-mode :deep(mark.highlight-ai) {
  text-decoration-color: var(--annotation-marker-color);
}

.dark-mode :deep(mark.highlight-teacher) {
  text-decoration-color: var(--annotation-marker-color);
}

/* 深色模式 - 段落左边色条 */
.dark-mode :deep(.annotation-accent:hover) {
  background-color: rgba(255, 255, 255, 0.05);
}

.dark-mode :deep(.annotation-accent.highlight-ai) { border-left-color: var(--annotation-marker-color); }
.dark-mode :deep(.annotation-accent.highlight-teacher) { border-left-color: var(--annotation-marker-color); }


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
@media screen and (max-width: 767px) {
  .top-header {
    padding: 0 16rpx;
  }

  .header-left {
    gap: 10px;
  }

  .back-btn {
    width: 36px;
    height: 36px;
  }

  .back-icon {
    font-size: 18px;
  }

  .header-brand-icon {
    width: 36px;
    height: 36px;
  }

  .header-brand-title {
    font-size: 15px;
  }

  .header-brand-subtitle {
    display: none;
  }

  .underline-toggle-btn {
    height: 36px;
    padding: 0 10px;
    gap: 4px;
  }

  .underline-toggle-label {
    font-size: 12px;
  }

  .doc-inner {
    padding: 16rpx;
  }

  .annotation-list-panel {
    width: calc(min(340px, 82vw) - 50rpx);
    max-width: calc(82vw - 50rpx);
  }

  .annotation-list-header {
    padding: 20rpx 22rpx;
  }

  .annotation-list-title {
    font-size: 28rpx;
  }

  .annotation-list-body {
    padding: 16rpx;
    max-height: calc(100vh - 64px - 88rpx);
  }

  .annotation-list-item {
    padding: 18rpx;
  }

  .annotation-list-item-author {
    font-size: 24rpx;
  }

  .annotation-list-item-time {
    font-size: 20rpx;
  }

  .annotation-list-section-label {
    font-size: 22rpx;
  }

  .annotation-list-section-box,
  .annotation-list-rich-text {
    font-size: 22rpx;
  }

  .annotation-modal {
    width: calc(100vw - 24px);
    max-height: 90vh;
    border-radius: 12px;
  }

  .modal-header {
    height: 56px;
    padding: 0 16rpx;
    border-radius: 12px 12px 0 0;
  }

  .modal-title {
    font-size: 15px;
  }

  .modal-body {
    padding: 16rpx;
  }

  .annotation-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 12rpx;
  }

  .annotation-author-section {
    flex-wrap: wrap;
  }

  .annotation-time {
    white-space: normal;
  }

  .section-label {
    font-size: 24rpx;
    margin-bottom: 12rpx;
  }

  .section-box,
  .section-box rich-text,
  .section-box .section-text {
    font-size: 26rpx;
  }
}

@media screen and (min-width: 992px) {
  .paper-preview-page.has-annotation-panel .doc-preview-wrapper {
    margin-right: calc(
      var(--annotation-panel-width) + var(--annotation-panel-gap) + var(--annotation-panel-edge-gap)
    );
  }

  .paper-preview-page.has-annotation-panel .doc-inner {
    padding-right: 20rpx;
  }
}

@media screen and (min-width: 1200px) and (max-width: 1439px) {
  .paper-preview-page {
    --annotation-panel-width: 320px;
    --annotation-panel-gap: 14px;
  }
}

@media screen and (min-width: 1440px) {
  .paper-preview-page {
    --annotation-panel-width: 340px;
    --annotation-panel-gap: 16px;
  }
}

@media screen and (max-width: 479px) {
  .underline-toggle-btn {
    height: 34px;
    padding: 0 8px;
  }

  .underline-toggle-label {
    font-size: 11px;
  }

  .annotation-list-panel {
    width: calc(92vw - 50rpx);
    max-width: calc(92vw - 50rpx);
  }

  .annotation-modal {
    width: calc(100vw - 16px);
  }
}

@media screen and (max-height: 920px) {
  .annotation-list-body {
    max-height: calc(100vh - 64px - 84rpx);
  }

  .section-box {
    max-height: 240rpx;
  }
}

.preview-container,
.modal-container,
.docx-preview-wrapper {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
