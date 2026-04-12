// mockData.js - 本地模拟数据文件
export const dashboardMockData = {
  students: [
    {
      id: '2021001',
      name: '张三',
      paper: {
        id: 1001, // 论文ID
        title: '基于深度学习的图像识别研究',
        version: 2.0,
        status: 'pending',
        updateTime: '2024-01-15 10:30',
        annotationCount: 3,
        paragraphs: [
          {text: '这是第一段内容...'},
          {text: '这是第二段内容...'},
          {text: '这是第三段内容...'}
        ],
        annotations: [
          {
            id: 1,
            source: 'ai',
            severity: 'high',
            paragraph: 1,
            content: '第1段存在格式问题',
            suggestion: '建议调整段落间距'
          },
          {
            id: 2,
            source: 'manual',
            paragraph: 2,
            content: '此处逻辑需要补充说明',
            suggestion: '建议增加实验数据支撑'
          }
        ]
      }
    },
    {
      id: '2021002',
      name: '李四',
      paper: {
        id: 1002, // 论文ID
        title: '机器学习算法优化研究',
        version: 1.5,
        status: 'feedback',
        updateTime: '2024-01-14 15:20',
        annotationCount: 5,
        paragraphs: [
          {text: '这是第一段内容...'},
          {text: '这是第二段内容...'}
        ],
        annotations: []
      }
    },
    {
      id: '2021003',
      name: '王五',
      paper: {
        id: 1003, // 论文ID
        title: '自然语言处理应用研究',
        version: 3.0,
        status: 'pending_final',
        updateTime: '2024-01-16 09:15',
        annotationCount: 2,
        paragraphs: [
          {text: '这是第一段内容...'}
        ],
        annotations: []
      }
    }
  ],
  aiReport: {
    total: 8,
    highRisk: 3,
    mediumRisk: 3,
    lowRisk: 2
  }
};

// 下载相关模拟数据
export const downloadMockData = {
  downloadUrl: 'https://example.com/download/paper',
  batchDownloadUrl: 'https://example.com/download/batch'
};

// 论文预览相关模拟数据
export const previewMockData = {
  pdfPages: [
    {
      paragraphs: [
        {text: '摘要：本文研究了基于深度学习的图像识别技术...', hasIssue: true, severity: 'high'},
        {text: '关键词：深度学习；图像识别；卷积神经网络', hasIssue: false},
        {text: '1. 引言', hasIssue: false}
      ]
    }
  ],
  wordStructure: [
    {title: '摘要', level: 1, content: '本文研究了基于深度学习的图像识别技术...'},
    {title: '1. 引言', level: 1, content: '随着人工智能技术的快速发展...'},
    {title: '1.1 研究背景', level: 2, content: '图像识别在安防、医疗等领域有广泛应用...'}
  ]
};

// 截止日期设置模拟数据
export const deadlineMockData = {
  defaultDeadline: '2024-06-30',
  defaultRemindDay: 2 // 提前2天提醒
};