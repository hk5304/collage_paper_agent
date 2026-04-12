<template>
  <view 
    class="word-preview-modal" 
    v-if="visible" 
    @click="handleMaskClick"
    :class="{ 'fullscreen-mode': isFullscreen }"
  >
    <view 
      class="word-preview-container" 
      @click.stop
      :style="containerStyle"
    >
      <!-- 预览头部 -->
      <view class="preview-header">
        <view class="header-left">
          <text class="preview-icon">📄</text>
          <text class="preview-title">{{ title || '文档预览' }}</text>
        </view>
        <view class="header-center">
          <!-- 翻页控制 -->
          <view class="page-controls" v-if="totalPages > 0">
            <button class="page-btn" @click="prevPage" :disabled="currentPage <= 1">◀</button>
            <text class="page-info">{{ currentPage }} / {{ totalPages }} 页</text>
            <button class="page-btn" @click="nextPage" :disabled="currentPage >= totalPages">▶</button>
          </view>
        </view>
        <view class="header-right">
          <view class="zoom-controls">
            <button class="zoom-btn" @click="zoomOut" :disabled="zoomLevel <= 50">−</button>
            <text class="zoom-level">{{ zoomLevel }}%</text>
            <button class="zoom-btn" @click="zoomIn" :disabled="zoomLevel >= 200">+</button>
          </view>
          <text class="fullscreen-btn" @click="toggleFullscreen">{{ isFullscreen ? '⤓' : '⤢' }}</text>
          <text class="close-btn" @click="close">✕</text>
        </view>
      </view>
      
      <!-- 加载状态 -->
      <view class="loading-container" v-if="loading && !error">
        <view class="loading-spinner"></view>
        <text class="loading-text">正在加载文档...</text>
        <text class="loading-subtext">{{ loadingText }}</text>
      </view>
      
      <!-- 错误状态 -->
      <view class="error-container" v-if="error">
        <text class="error-icon">⚠️</text>
        <text class="error-text">{{ error }}</text>
        <button class="retry-btn" @click="loadDocument">重新加载</button>
      </view>
      
      <!-- 文档预览区域 - 使用独立滚动容器，避免影响头部 -->
      <view class="preview-body" :class="{ 'preview-hidden': loading || error }">
        <scroll-view 
          class="preview-scroll"
          scroll-y
          :scroll-top="scrollTop"
          @scroll="handleScroll"
        >
          <view class="preview-content">
            <!-- 使用 div 而不是 view，确保是标准 DOM 元素 -->
            <div 
              ref="previewContainer"
              id="word-preview-container"
              class="docx-preview-content"
              :style="contentStyle"
            ></div>
          </view>
        </scroll-view>
      </view>
      

    </view>
  </view>
</template>

<script>
/**
 * Word文档预览组件
 * 基于 docx-preview 库实现 .docx 文件的在线预览
 * 
 * 使用方法:
 * <WordPreview
 *   :visible="showPreview"
 *   :fileUrl="paper.fileUrl"
 *   :title="paper.title"
 *   @close="showPreview = false"
 * />
 */

export default {
  name: 'WordPreview',
  
  props: {
    // 是否显示预览
    visible: {
      type: Boolean,
      default: false
    },
    // 文档URL
    fileUrl: {
      type: String,
      required: true
    },
    // 文档标题
    title: {
      type: String,
      default: ''
    },
    // 初始缩放级别
    initialZoom: {
      type: Number,
      default: 100
    },
    // 是否允许点击遮罩关闭
    closeOnMaskClick: {
      type: Boolean,
      default: true
    }
  },
  
  data() {
    return {
      loading: false,
      loadingText: '',
      error: null,
      zoomLevel: 100,
      lastZoomLevel: 100, // 记录上次缩放级别，用于计算缩放比例
      scrollTop: 0,
      currentPage: 1,
      totalPages: 0,
      actualTotalPages: 0, // Word实际页数（从文档属性读取）
      renderedBlob: null,
      docxModule: null,
      // 全屏模式
      isFullscreen: false,
      // 性能优化：防抖定时器
      zoomDebounceTimer: null,
      scrollDebounceTimer: null,
      // 页面高度缓存
      pageHeightCache: 0,
      // 文档原始数据
      docxArrayBuffer: null
    };
  },
  
  computed: {
    // 内容区域样式（用于缩放）
    contentStyle() {
      const scale = this.zoomLevel / 100;
      return {
        transform: `scale(${scale})`,
        transformOrigin: 'top center'
      };
    },
    
    // 容器样式
    containerStyle() {
      if (this.isFullscreen) {
        return {};
      }
      return {};
    }
  },
  
  mounted() {
    console.log('WordPreview 组件已挂载，refs:', this.$refs);
  },
  
  watch: {
    visible(newVal) {
      console.log('visible 变化:', newVal, 'refs:', this.$refs);
      if (newVal) {
        // 延迟加载，确保 DOM 完全渲染
        this.$nextTick(() => {
          console.log('nextTick 后 refs:', this.$refs);
          setTimeout(() => {
            console.log('setTimeout 后 refs:', this.$refs);
            this.loadDocument();
          }, 300);
        });
      } else {
        this.cleanup();
      }
    },
    
    fileUrl(newVal) {
      if (this.visible && newVal) {
        this.$nextTick(() => {
          setTimeout(() => {
            this.loadDocument();
          }, 100);
        });
      }
    }
  },
  
  methods: {
    /**
     * 切换全屏模式
     */
    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen;
    },
    
    /**
     * 上一页 - 滚动一个完整的A4页面高度
     */
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.scrollToPage(this.currentPage);
      }
    },
    
    /**
     * 下一页 - 滚动一个完整的A4页面高度
     */
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.scrollToPage(this.currentPage);
      }
    },
    
    /**
     * 获取标准A4页面高度（像素）
     * A4: 210mm x 297mm, 96 DPI下约为 1123px
     */
    getA4PageHeight() {
      // A4高度 297mm = 11.69英寸，96 DPI下 = 1122.24px
      // 加上页面间距和边框
      return 1123 + 50; // A4高度 + 页面间距
    },
    
    /**
     * 滚动到指定页 - 基于标准A4页面高度计算
     */
    scrollToPage(pageNum) {
      // 清除之前的防抖定时器
      if (this.scrollDebounceTimer) {
        clearTimeout(this.scrollDebounceTimer);
      }
      
      this.scrollDebounceTimer = setTimeout(() => {
        // 获取滚动容器
        const scrollView = document.querySelector('.preview-scroll');
        if (!scrollView) {
          console.error('滚动容器不存在');
          return;
        }
        
        // 验证页码范围
        if (pageNum < 1 || pageNum > this.totalPages) {
          console.warn('页码超出范围:', pageNum, '总页数:', this.totalPages);
          return;
        }
        
        const scale = this.zoomLevel / 100;
        
        // 使用标准A4页面高度计算目标位置
        const a4PageHeight = this.getA4PageHeight();
        const scaledPageHeight = a4PageHeight * scale;
        
        // 计算目标滚动位置：(页码-1) * 每页高度
        const targetScrollTop = (pageNum - 1) * scaledPageHeight;
        
        // 应用平滑滚动
        scrollView.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
        
        // 更新当前页码
        this.currentPage = pageNum;
        this.scrollTop = targetScrollTop;
        
        console.log('滚动到页面:', pageNum, '位置:', targetScrollTop, 
                    'A4高度:', a4PageHeight, '缩放:', scale);
      }, 50); // 50ms 防抖
    },
    
    /**
     * 获取预览容器
     */
    getContainer() {
      // 优先使用 $refs，确保获取到 Vue 组件引用的元素
      const ref = this.$refs.previewContainer;
      if (ref) {
        // 如果是 Vue 组件实例，返回 $el；否则直接返回元素
        return ref.$el || ref;
      }
      // 备用方案：通过 id 查找
      return document.getElementById('word-preview-container');
    },
    
    /**
     * 加载并渲染文档
     */
    async loadDocument() {
      if (!this.fileUrl) {
        this.error = '文档地址不能为空';
        return;
      }
      
      this.loading = true;
      this.error = null;
      this.loadingText = '正在获取文档...';
      
      try {
        // 动态导入 docx-preview
        if (!this.docxModule) {
          this.loadingText = '正在加载预览组件...';
          this.docxModule = await import('docx-preview');
        }
        
        // 获取文档数据
        this.loadingText = '正在下载文档...';
        console.log('正在请求文档:', this.fileUrl);
        const response = await fetch(this.fileUrl);
        
        if (!response.ok) {
          // 尝试读取后端返回的错误信息
          let errorMessage = `获取文档失败: HTTP ${response.status}`;
          try {
            const errorData = await response.json();
            if (errorData && errorData.detail) {
              errorMessage = errorData.detail;
            } else if (errorData && errorData.message) {
              errorMessage = errorData.message;
            }
          } catch (e) {
            // 如果不是 JSON 格式，尝试读取文本
            try {
              const errorText = await response.text();
              if (errorText) {
                errorMessage = errorText;
              }
            } catch (e2) {
              // 忽略读取错误
            }
          }
          console.error('文档请求失败:', response.status, errorMessage);
          throw new Error(errorMessage);
        }
        
        // 转换为 ArrayBuffer
        this.loadingText = '正在解析文档...';
        let arrayBuffer = await response.arrayBuffer();
        
        // 验证文件大小
        if (arrayBuffer.byteLength === 0) {
          throw new Error('文档内容为空');
        }
        
        // 验证文件头部（docx 文件应该以 PK 开头，因为是 zip 格式）
        const header = new Uint8Array(arrayBuffer.slice(0, 4));
        const isZip = header[0] === 0x50 && header[1] === 0x4B; // PK
        console.log('文件头部:', Array.from(header).map(b => b.toString(16)).join(' '), '是否是ZIP:', isZip);
        
        if (!isZip) {
          // 尝试读取前200个字节作为文本查看
          const textPreview = new TextDecoder().decode(arrayBuffer.slice(0, 200));
          console.log('文件内容预览:', textPreview);
          
          // 检查是否是错误消息
          if (textPreview.includes('error') || textPreview.includes('Error') || textPreview.includes('不存在')) {
            throw new Error('服务器返回错误: ' + textPreview);
          }
          
          throw new Error('文件格式不正确，可能不是有效的 Word 文档');
        }
        
        // 检查是否是纯 ZIP 压缩包（包含 docx）还是直接的 docx 文件
        // 通过查找 [Content_Types].xml 或 word/document.xml 来判断
        const textPreview = new TextDecoder().decode(arrayBuffer.slice(0, Math.min(arrayBuffer.byteLength, 5000)));
        const isDocx = textPreview.includes('[Content_Types].xml') || textPreview.includes('word/document.xml');
        console.log('是否包含 docx 特征:', isDocx);
        
        if (!isDocx) {
          // 可能是 ZIP 压缩包，需要解压
          console.log('检测到 ZIP 压缩包，尝试解压...');
          try {
            const JSZip = await import('jszip');
            const zip = await JSZip.default.loadAsync(arrayBuffer);
            
            // 查找压缩包中的 docx 文件
            const docxFiles = [];
            zip.forEach((relativePath, file) => {
              if (relativePath.endsWith('.docx') && !file.dir) {
                docxFiles.push({ path: relativePath, file: file });
              }
            });
            
            console.log('找到的 docx 文件:', docxFiles.map(f => f.path));
            
            if (docxFiles.length === 0) {
              throw new Error('压缩包中没有找到 docx 文件');
            }
            
            // 解压第一个 docx 文件
            const docxFile = docxFiles[0].file;
            arrayBuffer = await docxFile.async('arraybuffer');
            
            console.log('解压成功，docx 文件大小:', arrayBuffer.byteLength);
            
          } catch (zipErr) {
            console.error('解压失败:', zipErr);
            // 如果解压失败，可能是文件损坏或格式不支持
            throw new Error('文件可能是压缩包但无法解压，建议下载后手动解压查看');
          }
        }
        
        // 保存原始 docx 数据用于提取页数
        this.docxArrayBuffer = arrayBuffer;
        
        // 创建 Blob 用于渲染
        this.renderedBlob = new Blob([arrayBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
        
        // 渲染文档
        this.loadingText = '正在渲染文档...';
        await this.renderDocx();
        
        this.loading = false;
        
      } catch (err) {
        console.error('文档加载失败:', err);
        this.error = err.message || '文档加载失败，请重试';
        this.loading = false;
      }
    },
    
    /**
     * 使用 docx-preview 渲染文档 - 优化性能
     */
    async renderDocx() {
      // 获取预览容器
      const container = this.getContainer();
      
      if (!container) {
        console.error('预览容器不存在，refs:', this.$refs);
        throw new Error('预览容器不存在');
      }
      
      // 确保容器是标准 DOM 元素
      if (!(container instanceof HTMLElement)) {
        console.error('容器不是标准 DOM 元素:', container);
        throw new Error('预览容器类型不正确');
      }
      
      // 清空容器
      container.innerHTML = '';
      
      // 创建标准的 body 容器，docx-preview 需要这个
      const bodyContainer = document.createElement('div');
      bodyContainer.style.width = '100%';
      bodyContainer.style.minHeight = '100%';
      container.appendChild(bodyContainer);
      
      // 渲染配置 - 优化性能
      const renderOptions = {
        className: 'docx-preview-wrapper',
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
        ignoreFonts: true, // 忽略字体加载，提高渲染速度
        breakPages: true,
        ignoreLastRenderedPageBreak: true,
        trimXmlDeclaration: true,
        useBase64URL: false,
        renderChanges: false,
        renderComments: false
      };
      
      // 创建样式容器，用于 docx-preview 注入样式
      const styleContainer = document.createElement('div');
      styleContainer.style.display = 'none';
      document.body.appendChild(styleContainer);
      
      try {
        // 使用 Promise.race 添加超时控制
        const renderPromise = this.docxModule.renderAsync(
          this.renderedBlob, 
          bodyContainer, 
          styleContainer, 
          renderOptions
        );
        
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('渲染超时，文档可能过大')), 30000);
        });
        
        await Promise.race([renderPromise, timeoutPromise]);
        
      } catch (renderErr) {
        // 清理样式容器
        if (styleContainer.parentNode) {
          styleContainer.parentNode.removeChild(styleContainer);
        }
        console.error('docx-preview 渲染失败:', renderErr);
        
        // 提供更友好的错误信息
        let errorMsg = '文档渲染失败';
        if (renderErr.message && renderErr.message.includes('timeout')) {
          errorMsg = '文档过大，渲染超时，建议下载后查看';
        } else if (renderErr.message && renderErr.message.includes('Cannot read properties of null')) {
          errorMsg = '该文档格式可能不兼容，建议下载后查看';
        } else if (renderErr.message && renderErr.message.includes('appendChild is not a function')) {
          errorMsg = '文档渲染环境不兼容，建议下载后查看';
        } else if (renderErr.message) {
          errorMsg = renderErr.message;
        }
        
        throw new Error(errorMsg);
      }
      
      // 渲染成功，清理样式容器
      if (styleContainer.parentNode) {
        styleContainer.parentNode.removeChild(styleContainer);
      }
      
      // 重置缩放状态
      this.lastZoomLevel = this.zoomLevel;
      
      // 使用 requestAnimationFrame 优化后续操作
      requestAnimationFrame(async () => {
        // 应用缩放
        this.applyZoom();
        
        // 启用文本选择
        this.enableTextSelection(bodyContainer);
        
        // 计算页数（异步）
        await this.calculatePages();
      });
    },
    
    /**
     * 应用缩放 - 固定缩放中心点，保持视窗内容位置不变
     */
    applyZoom() {
      // 清除之前的防抖定时器
      if (this.zoomDebounceTimer) {
        clearTimeout(this.zoomDebounceTimer);
      }
      
      this.zoomDebounceTimer = setTimeout(() => {
        const container = this.getContainer();
        if (!container) return;
        
        // 获取滚动容器
        const scrollView = document.querySelector('.preview-scroll');
        if (!scrollView) return;
        
        const newScale = this.zoomLevel / 100;
        const oldScale = this.lastZoomLevel ? this.lastZoomLevel / 100 : newScale;
        
        // 记录当前视窗中心点对应的文档位置（缩放前）
        const viewportHeight = scrollView.clientHeight;
        const scrollTop = scrollView.scrollTop;
        const documentCenterY = scrollTop + viewportHeight / 2;
        
        // 查找所有页面元素
        const pages = this.getPageElements(container);
        
        if (pages.length > 0) {
          // 应用缩放变换
          pages.forEach((page) => {
            page.style.setProperty('transform', `scale(${newScale})`, 'important');
            page.style.setProperty('transform-origin', 'top center', 'important');
            page.style.setProperty('transition', 'transform 0.2s ease', 'important');
          });
          
          // 更新页面布局
          this.updatePageLayout(newScale, pages);
          
          // 计算并恢复滚动位置，保持视窗中心点内容不变
          this.$nextTick(() => {
            // 计算缩放后的新滚动位置
            const scaleChangeRatio = newScale / oldScale;
            const newDocumentCenterY = documentCenterY * scaleChangeRatio;
            const newScrollTop = newDocumentCenterY - viewportHeight / 2;
            
            // 边界检查并应用
            const maxScrollTop = scrollView.scrollHeight - viewportHeight;
            scrollView.scrollTop = Math.max(0, Math.min(newScrollTop, maxScrollTop));
            
            // 保存当前缩放级别供下次使用
            this.lastZoomLevel = this.zoomLevel;
          });
        }
      }, 30);
    },
    
    /**
     * 获取页面元素 - 带缓存机制
     */
    getPageElements(container) {
      if (!container) return [];
      
      // 尝试从缓存获取
      const wrapper = container.querySelector('.docx-preview-wrapper-wrapper');
      if (wrapper && wrapper.children.length > 0) {
        return Array.from(wrapper.children);
      }
      
      // 动态查找
      const selectors = [
        '.docx > div',
        '.docx-preview-wrapper .docx > div',
        '[class*="docx"] > div'
      ];
      
      for (const selector of selectors) {
        const found = container.querySelectorAll(selector);
        if (found.length > 1) {
          return Array.from(found);
        }
      }
      
      // 兜底方案
      const allDivs = container.querySelectorAll('div');
      return Array.from(allDivs).filter(div => {
        const style = window.getComputedStyle(div);
        const width = parseInt(style.width);
        return width > 500;
      });
    },
    
    /**
     * 更新页面布局 - 设置页面样式，确保居中显示
     */
    updatePageLayout(scale, pages) {
      const container = this.getContainer();
      if (!container || pages.length === 0) return;
      
      // 设置容器样式
      container.style.display = 'block';
      container.style.padding = '20rpx';
      container.style.backgroundColor = '#e8e8e8';
      
      // 设置页面样式
      Array.from(pages).forEach((page, index) => {
        page.style.flex = 'none';
        page.style.margin = '0 auto 20rpx auto';
        page.style.boxShadow = '0 2rpx 8rpx rgba(0, 0, 0, 0.08), 0 8rpx 24rpx rgba(0, 0, 0, 0.12)';
        page.style.backgroundColor = '#fff';
        page.style.borderRadius = '8rpx';
      });
    },
    
    /**
     * 启用文本选择
     */
    enableTextSelection(container) {
      const wrapper = container.querySelector('.docx-preview-wrapper-wrapper');
      if (wrapper) {
        wrapper.style.userSelect = 'text';
        wrapper.style.webkitUserSelect = 'text';
        
        const allElements = wrapper.querySelectorAll('*');
        allElements.forEach(el => {
          el.style.userSelect = 'text';
          el.style.webkitUserSelect = 'text';
        });
      }
    },
    
    /**
     * 从docx文件中提取实际页数
     */
    async extractActualPageCount(arrayBuffer) {
      try {
        // 使用 JSZip 解压 docx 文件
        const JSZip = await import('jszip');
        const zip = await JSZip.default.loadAsync(arrayBuffer);
        
        // 尝试从 app.xml 读取页数
        const appXml = await zip.file('docProps/app.xml')?.async('text');
        if (appXml) {
          // 解析 Pages 标签
          const pagesMatch = appXml.match(/<Pages>(\d+)<\/Pages>/);
          if (pagesMatch) {
            const pageCount = parseInt(pagesMatch[1], 10);
            console.log('从 app.xml 读取到页数:', pageCount);
            return pageCount;
          }
        }
        
        // 备选：从 document.xml 计算段落和分页符
        const documentXml = await zip.file('word/document.xml')?.async('text');
        if (documentXml) {
          // 计算分页符数量
          const pageBreakMatches = documentXml.match(/<w:br\s+[^>]*w:type="page"[^>]*>/gi) || [];
          const sectionBreakMatches = documentXml.match(/<w:sectPr>/gi) || [];
          
          // 页数 = 分页符数量 + 1（至少有一页）
          let estimatedPages = pageBreakMatches.length + 1;
          
          // 如果有多个节，可能需要调整
          if (sectionBreakMatches.length > 1) {
            estimatedPages = Math.max(estimatedPages, sectionBreakMatches.length);
          }
          
          console.log('从 document.xml 估算页数:', estimatedPages, 
                      '分页符:', pageBreakMatches.length, 
                      '节数量:', sectionBreakMatches.length);
          return estimatedPages;
        }
        
        return 0;
      } catch (err) {
        console.error('提取页数失败:', err);
        return 0;
      }
    },
    
    /**
     * 计算总页数 - 优先使用Word实际页数
     */
    async calculatePages() {
      const container = this.getContainer();
      if (!container) return;
      
      // 使用 getPageElements 获取渲染后的页面元素
      const pages = this.getPageElements(container);
      const renderedPageCount = pages.length;
      
      // 如果有文档原始数据，尝试提取实际页数
      let actualPageCount = 0;
      if (this.docxArrayBuffer) {
        actualPageCount = await this.extractActualPageCount(this.docxArrayBuffer);
        this.actualTotalPages = actualPageCount;
      }
      
      // 优先使用Word实际页数，如果获取失败则使用渲染页数
      if (actualPageCount > 0) {
        this.totalPages = actualPageCount;
        console.log('使用Word实际页数:', actualPageCount, '渲染页数:', renderedPageCount);
      } else if (renderedPageCount > 0) {
        this.totalPages = renderedPageCount;
        console.log('使用渲染页数:', renderedPageCount);
      }
      
      // 缓存第一页的高度用于滚动计算
      if (pages[0]) {
        this.pageHeightCache = pages[0].offsetHeight;
      }
    },
    
    /**
     * 处理滚动事件 - 基于A4页面高度计算当前页码
     */
    handleScroll(e) {
      // 使用 requestAnimationFrame 优化滚动性能
      if (this.scrollDebounceTimer) {
        cancelAnimationFrame(this.scrollDebounceTimer);
      }
      
      this.scrollDebounceTimer = requestAnimationFrame(() => {
        this.scrollTop = e.detail.scrollTop;
        
        // 计算当前页码（仅在总页数大于0时）
        if (this.totalPages > 0) {
          const scale = this.zoomLevel / 100;
          const a4PageHeight = this.getA4PageHeight();
          const scaledPageHeight = a4PageHeight * scale;
          
          // 基于A4页面高度计算当前页码
          const newPage = Math.min(
            Math.max(1, Math.floor(this.scrollTop / scaledPageHeight) + 1),
            this.totalPages
          );
          
          // 只在页码变化时更新
          if (newPage !== this.currentPage) {
            this.currentPage = newPage;
          }
        }
      });
    },
    
    /**
     * 放大 - 固定缩放中心点
     */
    zoomIn() {
      if (this.zoomLevel < 200) {
        // 保存当前缩放级别作为参考
        this.lastZoomLevel = this.zoomLevel;
        this.zoomLevel = Math.min(200, this.zoomLevel + 10);
        this.applyZoom();
      }
    },
    
    /**
     * 缩小 - 固定缩放中心点
     */
    zoomOut() {
      if (this.zoomLevel > 50) {
        // 保存当前缩放级别作为参考
        this.lastZoomLevel = this.zoomLevel;
        this.zoomLevel = Math.max(50, this.zoomLevel - 10);
        this.applyZoom();
      }
    },
    
    /**
     * 关闭预览
     */
    close() {
      this.$emit('close');
    },
    
    /**
     * 点击遮罩关闭
     */
    handleMaskClick() {
      if (this.closeOnMaskClick) {
        this.close();
      }
    },
    
    /**
     * 清理资源
     */
    cleanup() {
      this.error = null;
      this.loading = false;
      this.scrollTop = 0;
      this.currentPage = 1;
      this.totalPages = 0;
      this.actualTotalPages = 0;
      this.renderedBlob = null;
      this.docxArrayBuffer = null;
      this.pageHeightCache = 0;
      this.lastZoomLevel = 100;
      
      // 清除所有定时器
      if (this.zoomDebounceTimer) {
        clearTimeout(this.zoomDebounceTimer);
        this.zoomDebounceTimer = null;
      }
      if (this.scrollDebounceTimer) {
        cancelAnimationFrame(this.scrollDebounceTimer);
        this.scrollDebounceTimer = null;
      }
      
      const container = this.getContainer();
      if (container) {
        container.innerHTML = '';
      }
    }
  }
};
</script>

<style scoped>
/* 遮罩层 */
.word-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

/* 全屏模式 */
.word-preview-modal.fullscreen-mode {
  padding: 0;
}

.fullscreen-mode .word-preview-container {
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  border-radius: 0 !important;
  transform: none !important;
  margin: 0 !important;
  left: 0 !important;
  top: 0 !important;
}

/* 预览容器 - 尺寸扩大一倍，居中显示，平滑圆角（底部无工具栏） */
.word-preview-container {
  width: 1800rpx;
  height: 1200rpx;
  max-width: 95vw;
  max-height: 95vh;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 40rpx 120rpx rgba(0, 0, 0, 0.4);
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 头部 - 与底部对称 */
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 35rpx;
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  color: #fff;
  flex-shrink: 0;
  border-radius: 24rpx 24rpx 0 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
  min-width: 0;
}

.preview-icon {
  font-size: 38rpx;
}

.preview-title {
  font-size: 30rpx;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 中间区域 - 翻页控制 */
.header-center {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.page-controls {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background: rgba(255, 255, 255, 0.2);
  padding: 10rpx 24rpx;
  border-radius: 30rpx;
}

.page-btn {
  width: 46rpx;
  height: 46rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #1890ff;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover {
  background: #fff;
  transform: scale(1.1);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.page-info {
  font-size: 26rpx;
  font-weight: 500;
  min-width: 95rpx;
  text-align: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20rpx;
  flex: 1;
  justify-content: flex-end;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: rgba(255, 255, 255, 0.2);
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}

.zoom-btn {
  width: 46rpx;
  height: 46rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  border-radius: 8rpx;
  color: #fff;
  font-size: 30rpx;
  cursor: pointer;
  transition: all 0.2s;
}

.zoom-btn:active {
  background: rgba(255, 255, 255, 0.5);
}

.zoom-btn[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

.zoom-level {
  font-size: 24rpx;
  font-weight: 500;
  min-width: 68rpx;
  text-align: center;
}

.close-btn {
  font-size: 38rpx;
  padding: 8rpx 16rpx;
  cursor: pointer;
  opacity: 0.9;
  transition: opacity 0.2s;
}

.close-btn:active {
  opacity: 1;
}

/* 全屏按钮 */
.fullscreen-btn {
  font-size: 34rpx;
  padding: 8rpx 16rpx;
  cursor: pointer;
  opacity: 0.9;
  transition: opacity 0.2s;
  margin-right: 8rpx;
}

.fullscreen-btn:active {
  opacity: 1;
}

/* 加载状态 - 更紧凑 */
.loading-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  padding: 40rpx;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 5rpx solid #f0f0f0;
  border-top-color: #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.loading-subtext {
  font-size: 22rpx;
  color: #999;
}

/* 错误状态 - 更紧凑 */
.error-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  padding: 40rpx;
}

.error-icon {
  font-size: 60rpx;
}

.error-text {
  font-size: 26rpx;
  color: #ff4d4f;
  text-align: center;
  line-height: 1.6;
}

.retry-btn {
  padding: 16rpx 40rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn {
  background: #1890ff;
  color: #fff;
  border: none;
  margin-top: 20rpx;
}

.retry-btn:active {
  background: #40a9ff;
}

/* 预览主体区域 - 最大化文档显示空间，启用硬件加速，平滑过渡 */
.preview-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  will-change: transform;
  transform: translateZ(0);
  transition: opacity 0.3s ease;
}

.preview-body.preview-hidden {
  display: none;
  opacity: 0;
}

/* 预览滚动区域 - 类似Word的灰色背景，最小边距，优化滚动性能，平滑过渡 */
.preview-scroll {
  flex: 1;
  background: #e8e8e8;
  height: 100%;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  will-change: scroll-position;
  transition: background-color 0.3s ease;
}

.preview-content {
  padding: 20rpx;
  min-height: 100%;
}

/* docx-preview 内容区域 */
.docx-preview-content {
  background: transparent;
  min-height: 300rpx;
  width: 100%;
  max-width: 100%;
}

/* docx-preview 样式覆盖 - 居中显示，稳定缩放，增强页面分隔 */
:deep(.docx-preview-wrapper-wrapper) {
  background: transparent !important;
  width: 100% !important;
  max-width: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  /* 确保缩放时容器稳定 */
  transform-style: preserve-3d;
  perspective: 1000px;
  padding: 20rpx 0;
}

:deep(.docx-preview-wrapper-wrapper > div) {
  background: #fff;
  box-shadow: 
    0 2rpx 8rpx rgba(0, 0, 0, 0.08),
    0 8rpx 24rpx rgba(0, 0, 0, 0.12);
  margin: 0 auto 50rpx auto !important;
  user-select: text !important;
  -webkit-user-select: text !important;
  /* 标准A4尺寸：210mm x 297mm = 794px x 1123px (96 DPI) */
  width: 794px !important;
  min-width: 794px !important;
  max-width: 794px !important;
  min-height: 1123px !important;
  border-radius: 8rpx;
  /* 优化缩放性能 */
  will-change: transform;
  transform-origin: top center !important;
  backface-visibility: hidden;
  /* 页面分隔 */
  position: relative;
  border: 1rpx solid #e0e0e0;
  box-sizing: border-box;
}

/* 页面页码标签 */
:deep(.docx-preview-wrapper-wrapper > div:not(:last-child))::before {
  content: '';
  position: absolute;
  bottom: -28rpx;
  left: 50%;
  transform: translateX(-50%);
  background: #e8e8e8;
  color: #999;
  font-size: 18rpx;
  padding: 4rpx 16rpx;
  border-radius: 12rpx;
  z-index: 1;
}

/* 页面之间的分隔区域 */
:deep(.docx-preview-wrapper-wrapper > div:not(:last-child)) {
  margin-bottom: 50rpx !important;
}

:deep(.docx-preview-wrapper-wrapper > div:last-child) {
  margin-bottom: 20rpx !important;
}

/* 确保 docx 内容居中显示 */
:deep(.docx) {
  max-width: 100% !important;
  width: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  background-color: #e8e8e8 !important;
  padding: 30rpx 0 !important;
}

:deep(.docx > div) {
  /* 标准A4尺寸：210mm x 297mm = 794px x 1123px (96 DPI) */
  width: 794px !important;
  min-width: 794px !important;
  max-width: 794px !important;
  min-height: 1123px !important;
  margin: 0 auto 50rpx auto !important;
  background: #fff;
  box-shadow: 
    0 2rpx 8rpx rgba(0, 0, 0, 0.08),
    0 8rpx 24rpx rgba(0, 0, 0, 0.12);
  border-radius: 8rpx;
  /* 确保缩放原点一致 */
  transform-origin: top center !important;
  /* 页面分隔 */
  position: relative;
  border: 1rpx solid #e0e0e0;
  box-sizing: border-box;
}

/* 页面之间的分隔区域 */
:deep(.docx > div:not(:last-child)) {
  margin-bottom: 50rpx !important;
}

:deep(.docx > div:last-child) {
  margin-bottom: 20rpx !important;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .word-preview-modal {
    padding: 0;
  }
  
  .word-preview-container {
    width: 100%;
    height: 100vh;
    max-width: 100%;
    border-radius: 0;
    transition: none;
  }
  
  .preview-header {
    padding: 16rpx 20rpx;
    border-radius: 0;
  }
  
  .preview-title {
    font-size: 26rpx;
  }
  
  .header-center {
    display: none;
  }
  
  .zoom-controls {
    display: none;
  }
  
  .preview-content {
    padding: 10rpx;
  }
}

/* ==================== 深色模式 ==================== */
:global(.dark-mode) .word-preview-container {
  background: #252525;
  background-color: #252525;
}

:global(.dark-mode) .preview-header {
  background: #1e3a5f;
  background-color: #1e3a5f;
  border-bottom-color: #2d5a8a;
}

:global(.dark-mode) .preview-title {
  color: #ffffff;
}

:global(.dark-mode) .page-info,
:global(.dark-mode) .zoom-level {
  color: #cccccc;
}

:global(.dark-mode) .page-btn,
:global(.dark-mode) .zoom-btn {
  background: #333333;
  color: #ffffff;
  border-color: #444444;
}

:global(.dark-mode) .page-btn:disabled,
:global(.dark-mode) .zoom-btn:disabled {
  background: #444444;
  color: #888888;
}

:global(.dark-mode) .fullscreen-btn,
:global(.dark-mode) .close-btn {
  color: #ffffff;
}

:global(.dark-mode) .preview-content {
  background-color: #1a1a1a;
}

:global(.dark-mode) .loading-container,
:global(.dark-mode) .error-container {
  background-color: #252525;
}

:global(.dark-mode) .loading-text,
:global(.dark-mode) .error-text {
  color: #ffffff;
}

:global(.dark-mode) .loading-subtext {
  color: #cccccc;
}

:global(.dark-mode) .retry-btn {
  background-color: #1890ff;
  color: #ffffff;
}

:global(.dark-mode) .annotation-panel {
  background-color: #252525;
  border-left-color: #3a3a3a;
}

:global(.dark-mode) .panel-header {
  background-color: #1e3a5f;
  border-bottom-color: #2d5a8a;
}

:global(.dark-mode) .panel-title {
  color: #ffffff;
}

:global(.dark-mode) .annotation-item {
  background-color: #333333;
  border-color: #444444;
}

:global(.dark-mode) .annotation-source {
  color: #aaaaaa;
}

:global(.dark-mode) .annotation-content {
  color: #ffffff;
}

:global(.dark-mode) .annotation-time {
  color: #888888;
}

:global(.dark-mode) .empty-state {
  color: #cccccc;
}

:global(.dark-mode) .process-btn {
  background-color: #1890ff;
  color: #ffffff;
}

:global(.dark-mode) .page-controls {
  background: rgba(255, 255, 255, 0.1);
}

:global(.dark-mode) .page-info {
  color: #ffffff;
}

:global(.dark-mode) .zoom-controls {
  background: rgba(255, 255, 255, 0.1);
}

:global(.dark-mode) .zoom-level {
  color: #ffffff;
}

:global(.dark-mode) .loading-spinner {
  border-color: #444444;
  border-top-color: #1890ff;
}

:global(.dark-mode) .error-icon {
  color: #ff8a80;
}

:global(.dark-mode) .preview-body {
  background-color: #1a1a1a;
}

:global(.dark-mode) .preview-scroll {
  background-color: #1a1a1a;
}

:global(.dark-mode) .docx-preview-content {
  background-color: #ffffff;
}

:global(.dark-mode) .annotation-section {
  background-color: transparent;
}

:global(.dark-mode) .section-title {
  color: #aaaaaa;
}

:global(.dark-mode) .section-content {
  color: #e0e0e0;
  background-color: #2a2a2a;
}

:global(.dark-mode) .selected-content {
  color: #e0e0e0;
  background-color: #2a2a2a;
}

:global(.dark-mode) .annotation-content-text {
  color: #ffffff;
}

:global(.dark-mode) .suggestion-content {
  color: #81c784;
}

:global(.dark-mode) .annotation-footer {
  background-color: transparent;
}

:global(.dark-mode) .annotation-header {
  background-color: transparent;
}

:global(.dark-mode) .annotation-status.status-unprocessed {
  background-color: #4a3a1a;
  color: #ffa726;
}

:global(.dark-mode) .annotation-status.status-processed {
  background-color: #1a4a1a;
  color: #4caf50;
}

:global(.dark-mode) .source-icon {
  color: #ffffff;
}

:global(.dark-mode) .source-text {
  color: #aaaaaa;
}

:global(.dark-mode) .annotation-text {
  color: #ffffff;
}

:global(.dark-mode) .annotation-suggestion {
  color: #63b3ed;
}

:global(.dark-mode) .annotation-badge.ai-badge {
  background-color: #1e3a5f;
  color: #63b3ed;
}

:global(.dark-mode) .annotation-badge.teacher-badge {
  background-color: #1a4a4a;
  color: #4db6ac;
}

:global(.dark-mode) .severity-high {
  color: #ff8a80;
}

:global(.dark-mode) .severity-medium {
  color: #ffb74d;
}

:global(.dark-mode) .severity-low {
  color: #aaaaaa;
}

:global(.dark-mode) .mark-btn {
  background-color: #1890ff;
  color: #ffffff;
}

:global(.dark-mode) .mark-btn.processed {
  background-color: #444444;
  color: #888888;
}
</style>
