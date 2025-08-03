import { defineConfig } from 'vitepress'

const SDNNoteItems = [
  {
    text: 'P4 Language',
    link: '/sdn/p4'
  },
  {
    text: 'P4 Exercise',
    link: '/sdn/p4_exercise'
  },
  {
    text: 'P4 INT',
    link: '/sdn/int'
  },
  {
    text: 'P4 Utils',
    link: '/sdn/p4_utils'
  },
  {
    text: 'Mininet',
    link: '/sdn/mininet'
  },
  {
    text: 'iPerf',
    link: '/sdn/iperf'
  },
  {
    text: 'Reading',
    link: '/sdn/reading/',
    items: [
      {
        text: 'SDN Paper',
        link: '/sdn/reading/paper'
      },
      {
        text: 'SDN Monitoring',
        collapsed: true,
        items: [
          {
            text: 'APAM',
            link: '/sdn/reading/monitoring/apam'
          },
          {
            text: 'DLINT & PLINT',
            link: '/sdn/reading/monitoring/lint'
          },
          {
            text: 'FlowStalker',
            link: '/sdn/reading/monitoring/FlowStalker'
          },
          {
            text: 'FAPM',
            link: '/sdn/reading/monitoring/fapm'
          },
          {
            text: 'FS-INT',
            link: '/sdn/reading/monitoring/FS-INT'
          },
          {
            text: 'Marina',
            link: '/sdn/reading/monitoring/marina'
          },
          {
            text: 'PPM',
            link: '/sdn/reading/monitoring/ppm'
          },
        ]
      },
    ]
  },
  {
    text: 'Writing',
    link: '/sdn/writing/',
    items: [
      {
        text: 'Formula',
        link: '/sdn/writing/formula',
      },
      {
        text: 'Algorithm',
        link: '/sdn/writing/algorithm',
      },
      {
        text: 'Table',
        link: '/sdn/writing/table',
      },
      {
        text: 'Bibliography',
        link: '/sdn/writing/bibliography',
      },
    ],
  },
  {
    text: 'CCF',
    link: '/sdn/ccf'
  },
  {
    text: 'Journal',
    link: '/sdn/journal'
  },
]
const GoNoteItems = [
  {
    text: 'GoLang',
    link: '/go/golang'
  },
  {
    text: 'Goroutine',
    link: '/go/goroutine'
  },
  {
    text: 'Gin',
    link: '/go/gin'
  },
  {
    text: 'gRPC',
    link: '/go/grpc'
  },
]

const keywords = [
  '张恒华',
  '笔记',
  '学习笔记',
  '科研笔记',
  '读书笔记',
  '阅读笔记',
  '文献阅读',
  '论文阅读',
  '软件定义网络',
  '可编程数据平面',
  '带内网络遥测',
  'Go语言',
  'Go协程',
  'Go开发',
  'SDN控制器',
  'SDN仿真实验',
  'SDN网络监控',
  'Henghua Zhang',
  'Software Defined Network',
  'Software-Defined Networking',
  'SDN',
  'Programmable Data Plane',
  'PDP',
  'Programming Protocol-independent Packet Processors',
  'P4',
  'p4app',
  'P4 Lang',
  'P4 Language',
  'P4Runtime',
  'P4Runtime API',
  'V1Model',
  'BMv2',
  'Behavioral Model version 2',
  'INT',
  'In-band Network Telemetry',
  'OpenFlow',
  'Mininet',
  'iPerf',
  'Scapy',
  'Ryu',
  'Go',
  'GoLang',
  'RPC',
  'gRPC',
  'Goroutine',
  'Gin',
]

const description_cn = '张恒华的个人网站，存放学习笔记与个人简历。研究领域为软件定义网络、可编程数据平面。'
const description_en = 'This is Henghua Zhang\'s personal website, where study notes and a resume are stored. The research focus is on SDN (Software-Defined Networking) and PDP (Programmable Data Plane).'

export default defineConfig({
  title: '张恒华',
  lang: 'zh-Hans',
  description: description_cn + description_en,
  appearance: true,
  cleanUrls: true,
  ignoreDeadLinks: true,
  head: [
    [
      'meta',
      {
        name: 'keywords',
        content: keywords.join(', '),
      },
    ],
    [
      'meta',
      {
        name: 'google-site-verification',
        content: 'wMOTcBwCiCMV7ESftQRY3Glvq8UL4xzUKrZ-1wjOpqM',
      },
    ],
    [
      'link',
      {
        rel: 'icon',
        href: '/sues.png',
      },
    ],
    [
      'link',
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
    ],
    [
      'link',
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: '',
      },
    ],
    [
      'link',
      {
        href: 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@200..900&display=swap',
        rel: 'stylesheet',
      },
    ],
    [
      'script',
      {
        async: '',
        src: 'https://www.googletagmanager.com/gtag/js?id=G-414XCQ3MDV',
      },
    ],
    [
      'script',
      {

      },
      `
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      gtag('js', new Date());
      gtag('config', 'G-414XCQ3MDV');
      `,
    ],
  ],
  markdown: {
    container: {
      dangerLabel: '危险',
      detailsLabel: '详细信息',
      infoLabel: '信息',
      tipLabel: '提示',
      warningLabel: '警告',
    },
    math: true,
    languageAlias: {
      'p4': 'c++',
      'pseudo': 'c++',
    },
  },
  themeConfig: {
    siteTitle: '张恒华',
    outlineTitle: '页面导航',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '回到顶部',
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
    footer: {
      message: '基于 <a href="/mit">MIT 许可</a> 发布',
      copyright: '版权所有 © 2024至今 <a href="/resume">张恒华</a>',
    },
    nav: [
      {
        text: '首页',
        link: '/',
      },
      {
        text: '学习笔记',
        items: [
          {
            text: 'SDN',
            items: SDNNoteItems,
          },
          {
            text: 'Go',
            items: GoNoteItems,
          },
        ],
      },
      {
        text: '关于我',
        link: '/resume',
      },
    ],
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
          },
          modal: {
            displayDetails: '显示详细内容',
            resetButtonTitle: '清除查询条件',
            noResultsText: '无法找到相关结果',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭',
            },
          },
        },
      },
    },
    sidebar: [
      {
        text: 'SDN',
        link: '/sdn/',
        items: SDNNoteItems,
      },
      {
        text: 'Go',
        items: GoNoteItems,
      }
    ],
    notFound: {
      code: '404',
      linkText: '返回首页',
      quote: '请检查页面路径是否正确',
      title: '页面未找到',
    },
    socialLinks: [
      {
        icon: 'csdn',
        link: 'https://blog.csdn.net/qq_43133192',
      },
      {
        icon: 'github',
        link: 'https://github.com/zhh2001',
      },
      {
        icon: 'qq',
        link: 'mailto:1652709417@qq.com',
      },
    ],
  },
  sitemap: {
    hostname: 'https://zhh2001.github.io',
  },

  // 构建钩子
  async buildEnd(siteConfig) {
    console.log('Build End')
    console.log(siteConfig)
  },
  async postRender(context) {
    console.log('Post Render')
    console.log(context)
  },
  async transformHead(context) {
    console.log('Transform Head')
    console.log(context)
  },
  async transformHtml(code, id, context) {
    console.log('Transform HTML')
    console.log(code, id, context)
  }
})
