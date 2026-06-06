# RE:序章

个人仪表盘应用，涵盖待办、习惯打卡、Markdown 笔记、番茄钟等 15 个功能模块。纯前端架构，数据通过 Zustand persist 自动同步到 localStorage。

## 功能模块

| 模块 | 说明 |
|------|------|
| 昼夜问候 | 6 时段自动切换问候语和图标 |
| 月度进度 | 当月已过天数 + 百分比渐变进度条 |
| 每日一言 | hitokoto.cn 免费 API，加载失败回退内置语录 |
| 倒计时 | 今日剩余 HH:MM + 本周剩余 X 天，每分钟更新 |
| 番茄钟 | 25/15/5 分钟倒计时，SVG 圆环，通知 + 蜂鸣提示，刷新状态保持 |
| 本周统计 | 完成待办 / 打卡次数 / 连续天数 / 新增笔记 + 周报弹窗（折线图 + 上周对比） |
| 日历 | 月视图 + 打卡标记圆点 + 前后翻月 + 今日高亮 |
| 天气模块 | Open-Meteo 免费 API，当前天气 + 3 天预报，10 分钟缓存 |
| 待办事项 | CRUD + 进度统计 + 按状态筛选 + 删除撤销 + dnd-kit 拖拽排序 + 月度趋势弹窗 |
| 习惯打卡 | 预设 + 自定义 + 爱心/星星/时钟打卡（补签标识）+ Recharts 月统计 + 连续天数（补签不计入）+ 全年热力图 |
| 快速笔记 | Markdown 编辑 + 实时预览 + JetBrains Mono 代码字体 + 1s 防抖保存 |
| 快捷链接 | Google Favicon + 名称域名双行显示 |
| 时钟日历 | 实时数字时钟（每秒）+ 年月日星期 |
| 主题切换 | 亮色/暗色双主题，CSS 变量(RGB) + 深色联动背景 |
| 治愈语录 | 右下角彩蛋，10 句随机语录 |
| 交互动画 | GSAP 驱动：打卡弹性缩放、待办滑入淡入、卡片依次入场、数字滚动、天气微动画 |
| 光斑背景 | CSS 光斑漂移 + 波动渐变（亮色阳光/暗色月光） |
| 手帐装饰 | 书脊阴影、装订孔、和纸胶带、图钉、纸张堆叠立体感 |
| 键盘快捷键 | N 聚焦笔记 / T 聚焦待办 / E 编辑首个待办，仅在非输入区生效 |
| 加载骨架屏 | GSAP 流光扫过动画 + 7 卡片占位 + 淡出/淡入过渡 |
| 数据导入导出 | 全部数据导出为 JSON 文件 / 从 JSON 文件恢复（二次确认） |
| Markdown 导出 | 周报导出为 .md / 单篇笔记导出为 .md |
| 通知与提醒 | Notification API：番茄钟结束 / 待办提醒 / 每晚 8 点打卡提醒 / 每日首次打开昨日总结 |
| 成就徽章 | 10 个徽章 + 稀有度系统 + Steam 风格解锁通知 + 勋章墙弹窗 + 偷看一眼开关 + 首次引导遮罩 |
| 卡片管理 | 显隐切换 + dnd-kit 拖拽排序 + 布局记忆 |
| 背景切换 | 4 种预设（米白纸纹/淡粉渐变/水墨灰/森林绿）+ 深色主题联动 |
| PWA 支持 | manifest + Service Worker 离线缓存 + 可安装到桌面 + 自定义安装按钮 |

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建工具 | Vite 5 |
| 样式 | TailwindCSS 3.4 + CSS 变量(RGB 通道格式) |
| 状态管理 | Zustand 5（persist 中间件） |
| 动画 | GSAP 3.15 |
| 拖拽 | @dnd-kit/core + @dnd-kit/sortable |
| 图表 | Recharts 2.15 |
| 日期 | date-fns 4 |
| Markdown | react-markdown 10 + remark-gfm 4 |
| 图标 | lucide-react 0.460 |
| 字体 | 钉钉进步体（标题）+ JetBrains Mono（代码/数字）+ 系统默认（正文） |
| 包管理 | pnpm |

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 生产构建
pnpm build
```

## 部署

构建产物在 `dist/` 目录，上传到任意静态服务器即可。Nginx 配置示例：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /www/wwwroot/dashboard;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

HTTPS 部署后 PWA 自动生效（manifest + Service Worker）。

## 项目结构

```
src/
├── App.tsx                     # 根组件：dnd-kit 拖拽排序 + CSS Grid + 全局键盘快捷键
├── main.tsx                    # 入口（无 StrictMode）
├── index.css                   # @font-face + 双主题变量(RGB) + 手帐卡片 + 动画
├── types/index.ts              # 类型定义
├── utils/storage.ts            # localStorage 读写 + ID 生成
├── store/useDashboardStore.ts  # Zustand 全局状态 + persist + HMR 保护
├── hooks/
│   ├── useTodoReminder.ts      # 待办提醒定时检查
│   └── useHabitReminder.ts     # 打卡提醒定时检查
└── components/
    ├── Header.tsx              # 问候 + 时钟 + 天气 + 主题 + 进度条 + 倒计时
    ├── Greeting.tsx            # 昼夜问候（6 时段）
    ├── ProgressBar.tsx         # 月度进度条
    ├── DailyQuote.tsx          # 每日一言
    ├── Countdown.tsx           # 今日/本周倒计时
    ├── Todo.tsx                # 待办 + dnd-kit 拖拽 + 快捷键 T/E
    ├── Habits.tsx              # 习惯打卡 + Recharts 月统计
    ├── Links.tsx               # 快捷链接
    ├── PomodoroTimer.tsx       # 番茄钟 + 状态持久化
    ├── WeekStats.tsx           # 本周统计 + 周报入口
    ├── WeeklyReport.tsx        # 周报弹窗 + 导出 MD
    ├── MonthlyTrend.tsx        # 月度趋势弹窗
    ├── HeatmapModal.tsx        # 热力图 + 数据导入导出
    ├── Calendar.tsx            # 月日历
    ├── Notes.tsx               # Markdown 笔记 + 快捷键 N
    ├── AchievementsModal.tsx   # 成就徽章弹窗（10 个徽章 + 勋章墙）
    ├── AchievementNotify.tsx   # 成就解锁通知
    ├── GuideTour.tsx           # 首次访问引导遮罩
    ├── CardMenu.tsx            # 卡片菜单
    ├── ManageCardsModal.tsx    # 管理卡片弹窗
    ├── BackgroundPicker.tsx    # 背景选择器
    ├── DataTipModal.tsx        # 欢迎弹窗（快捷键 + 数据安全）
    ├── ConfirmDialog.tsx       # 自定义确认弹窗
    ├── Toast.tsx               # 手帐风格 Toast
    ├── AnimatedNumber.tsx      # 数字滚动动画
    ├── Skeleton.tsx            # 加载骨架屏
    ├── EasterEgg.tsx           # 治愈语录彩蛋
    └── ErrorBoundary.tsx       # 错误兜底
```

## 配色方案

亮色主题（手帐/便签风格）和暗色主题（暖亮色系），RGB 通道格式 CSS 变量驱动。卡片 16px 圆角、1px 边框、双层柔和阴影、hover 上浮 2px。

## 数据存储

所有数据通过 Zustand persist 自动同步到 localStorage，无后端依赖。建议定期使用「导出数据」功能备份。

## 注意事项

- 不使用 React.StrictMode（dev 双次渲染干扰外部 store）
- 数据仅存于浏览器本地，清除缓存会丢失
- PWA 需 HTTPS 环境生效
