import { defineConfig } from 'vitepress'

const SDNNoteItems = [
  { text: 'P4 Language', link: '/sdn/p4' },
  { text: 'P4 Exercise', link: '/sdn/p4_exercise' },
  { text: 'P4 Utils', link: '/sdn/p4_utils' },
  { text: 'Mininet', link: '/sdn/mininet' },
  { text: 'iPerf', link: '/sdn/iperf' },
  {
    text: 'Reading',
    link: '/sdn/reading/',
    items: [
      { text: 'SDN Paper', link: '/sdn/reading/paper' },
      {
        text: 'SDN Monitoring',
        collapsed: true,
        items: [
          { text: 'FlowStalker', link: '/sdn/reading/monitoring/FlowStalker' },
          { text: 'PPM', link: '/sdn/reading/monitoring/ppm' },
        ]
      },
    ]
  },
  { text: 'CCF', link: '/sdn/ccf' },
]
const GoNoteItems = [
  { text: 'GoLang', link: '/go/golang' },
  { text: 'Goroutine', link: '/go/goroutine' },
  { text: 'gRPC', link: '/go/grpc' },
]

export default defineConfig({
  appearance: true,
  cleanUrls: true,
  description: '张恒华的个人网站，存放学习笔记与个人简历。研究领域为软件定义网络（SDN，Software Defined Network）、可编程数据平面（PDP，Programmable Data Plane）。This is Henghua Zhang\'s personal website, where study notes and a resume are stored. The research focus is on SDN and PDP.',
  head: [
    [
      'meta',
      {
        name: 'keywords',
        content: 'Software Defined Network, SDN, Programmable Data Plane, PDP, Programming Protocol-independent Packet Processors, P4, OpenFlow, Mininet, iPerf, Scapy, Ryu, Go, GoLang, RPC, Goroutine, gRPC, Gin, Henghua Zhang, 张恒华, 软件定义网络, 可编程数据平面, Go语言, 笔记, 学习笔记, 读书笔记, 文献阅读, 论文阅读'
      }
    ],
    ['meta', { name: 'google-site-verification', content: 'wMOTcBwCiCMV7ESftQRY3Glvq8UL4xzUKrZ-1wjOpqM' }],
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@200..900&display=swap', rel: 'stylesheet' }],
    ['script', { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-414XCQ3MDV' }],
    ['script', {}, `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-414XCQ3MDV');
    `]
  ],
  ignoreDeadLinks: true,
  lang: 'zh-Hans',
  markdown: {
    languageAlias: {
      'p4': 'c++',
      'pseudo': 'c++'
    },
  },
  themeConfig: {
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '回到顶部',
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    footer: {
      message: '基于 <a href="/mit">MIT 许可</a> 发布',
      copyright: '版权所有 © 2024至今 <a href="/resume">张恒华</a>'
    },
    nav: [
      { text: '首页', link: '/' },
      {
        text: '学习笔记',
        items: [
          {
            text: 'SDN',
            items: SDNNoteItems
          },
          {
            text: 'Go',
            items: GoNoteItems
          }
        ]
      },
      { text: '关于我', link: '/resume' }
    ],
    outlineTitle: '页面导航',
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档'
          },
          modal: {
            displayDetails: '显示详细内容',
            resetButtonTitle: '清除查询条件',
            noResultsText: '无法找到相关结果',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        }
      }
    },
    sidebar: [
      {
        text: 'SDN',
        link: '/sdn/',
        items: SDNNoteItems
      },
      {
        text: 'Go',
        items: GoNoteItems
      }
    ],
    siteTitle: '张恒华',
    notFound: {
      code: '404',
      linkText: '返回首页',
      quote: '请检查页面路径是否正确',
      title: '页面未找到',
    },
    socialLinks: [
      { icon: 'csdn', link: 'https://blog.csdn.net/qq_43133192' },
      { icon: 'github', link: 'https://github.com/zhh2001' },
      { icon: 'qq', link: 'mailto:1652709417@qq.com' },
    ]
  },
  title: '张恒华',
  sitemap: {
    hostname: 'https://zhh2001.github.io'
  }
})
