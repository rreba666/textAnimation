# 语言规范

- 始终使用中文回复
- 代码注释使用中文
- 回答清晰
- 每次更改说明改动的地方

# 文件处理

- 忽略 node_modules 以及各个依赖文件
- 新增修改文件不需要询问，后续告知做了哪些操作即可
- 查看依赖包可以通过 package.json
- 代码要勤写注释，每个函数和关键逻辑必须添加中文注释说明用途
- 确认 import 的内容来源于正确的包，避免引用不存在的模块或路径
- 更新代码后必须同步更新对应的文档

# 开发规范

- **禁止使用 emoji 表情**：使用 lucide-react 图标替代
- **代码更新后及时打包**：`deploy-frontend-{日期}.tar.gz`，排除 `.env`、`node_modules`

# 一、项目概述

儿戏的日常手记是一个纯前端个人仪表盘应用，所有数据通过 Zustand persist 中间件自动同步到 localStorage。涵盖天气、待办、习惯打卡、Markdown 笔记、快捷链接、番茄钟、日历、每日一言等 15 个功能模块。

# 二、核心功能

| 功能模块 | 说明 |
|----------|------|
| 昼夜问候 | 6 时段自动切换问候语和 icon |
| 月度进度 | 当月已过天数 + 百分比渐变进度条 |
| 每日一言 | hitokoto.cn 免费 API，加载失败回退内置语录 |
| 倒计时 | 今日剩余 HH:MM + 本周剩余 X 天，每分钟更新 |
| 番茄钟 | 25/15/5 分钟倒计时，SVG 圆环，通知 + 蜂鸣提示，刷新状态保持 |
| 本周统计 | 完成待办 / 打卡次数 / 连续天数 / 新增笔记 + 周报弹窗（折线图 + 上周对比） |
| 日历 | 月视图 + 打卡标记圆点 + 前后翻月 + 今日高亮 |
| 天气模块 | Open-Meteo 免费 API，当前天气 + 3 天预报，10 分钟缓存 |
| 待办事项 | CRUD + 进度统计条 + 按状态筛选 + 圆角方形复选框 + 删除撤销（GSAP 收缩 + Toast）+ HTML5 拖拽排序 + 月度趋势弹窗 |
| 习惯打卡 | 预设 + 自定义 + 爱心/星星打卡 + Recharts 月统计 + 连续天数 + 全年热力图弹窗 |
| 快速笔记 | Markdown 编辑 + 实时预览 + JetBrains Mono 代码字体 + 1s 防抖保存 |
| 快捷链接 | Google Favicon + 名称域名双行显示 |
| 时钟日历 | 实时数字时钟（每秒）+ 年月日星期 |
| 主题切换 | 亮色/暗色双主题，CSS 变量(RGB) + `!important` 覆盖 Tailwind 硬编码 |
| 治愈语录 | 右下角彩蛋，10 句随机语录 |
| 交互动画 | GSAP 驱动：打卡弹性缩放、待办滑入淡入、快捷键脉冲反馈 |
| 键盘快捷键 | N 聚焦笔记 / T 聚焦待办 / E 编辑首个待办，仅在非输入区生效 |
| 加载骨架屏 | GSAP 流光扫过动画 + 7 卡片占位 + 淡出/淡入过渡 |
| 数据导入导出 | 全部数据导出为 JSON 文件 / 从 JSON 文件恢复（二次确认） |
| Markdown 导出 | 周报导出为 .md / 单篇笔记导出为 .md |
| 通知与提醒 | Notification API：番茄钟结束 / 待办提醒 / 每晚 8 点打卡提醒 / 每日首次打开昨日总结 |
| 卡片管理 | 显隐切换 + 拖拽排序 + 布局记忆 |
| 背景切换 | 4 种预设（米白纸纹/淡粉渐变/水墨灰/森林绿）+ 深色主题联动 |
| PWA 支持 | manifest + Service Worker 离线缓存 + 可安装到桌面 + 自定义安装按钮 |

# 三、技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建工具 | Vite 5 |
| 样式 | TailwindCSS 3.4 + CSS 变量(RGB 通道格式) |
| 状态管理 | Zustand 5（persist 中间件） |
| 图表 | recharts 2.15 |
| 日期 | date-fns 4 |
| Markdown | react-markdown 10 + remark-gfm 4 |
| 图标 | lucide-react 0.460 |
| 字体 | 钉钉进步体（标题）+ JetBrains Mono（代码/数字）+ 系统默认（正文） |
| 拖拽 | @dnd-kit/core + @dnd-kit/sortable（排序动画 + DragOverlay 浮层） |
| PWA | manifest.json + Service Worker（离线缓存 + 可安装） |
| 包管理 | pnpm |

# 四、项目结构

```
src/
├── App.tsx                     # 根组件：dnd-kit 拖拽排序 + CSS Grid 3 列 + 全局键盘快捷键
├── main.tsx                    # 入口（无 StrictMode）
├── index.css                   # @font-face + 双主题变量(RGB) + 手帐卡片 + 覆盖规则 + 动画
├── vite-env.d.ts
├── types/index.ts              # Todo(含completedAt/reminderAt)/Note/Habit/LinkItem/WeatherData
├── utils/storage.ts            # localStorage 读写 + ID 生成
├── store/useDashboardStore.ts  # Zustand 全局状态 + persist + HMR 保护
├── hooks/
│   ├── useTodoReminder.ts      # 待办提醒定时检查
│   └── useHabitReminder.ts     # 打卡提醒定时检查
└── components/
    ├── Header.tsx              # 问候 + 时钟 + 日期 + 天气 + 每日一言 + 主题切换 + 进度条 + 倒计时
    ├── Greeting.tsx            # 昼夜问候（6 时段）
    ├── ProgressBar.tsx         # 月度进度条
    ├── DailyQuote.tsx          # 每日一言（API + 离线回退）
    ├── Countdown.tsx           # 今日/本周倒计时
    ├── Todo.tsx                # 待办 + 进度统计 + GSAP 入场动画 + 快捷键 T/E + 拖拽排序
    ├── Habits.tsx              # 习惯打卡（爱心/星星 + Recharts + GSAP 弹性缩放）
    ├── Links.tsx               # 快捷链接
    ├── PomodoroTimer.tsx       # 番茄钟（SVG 圆环 + 蜂鸣 + Notification + 状态持久化）
    ├── WeekStats.tsx           # 本周统计（4 指标 + 周报入口）
    ├── WeeklyReport.tsx        # 周报弹窗（折线图 + 上周对比 + 导出 MD + GSAP 入场/退场）
    ├── MonthlyTrend.tsx        # 月度趋势弹窗（折线图 + 月份切换 + 统计摘要 + GSAP 入场/退场）
    ├── HeatmapModal.tsx        # 热力图弹窗（全年热力图 + 数据导入导出 + GSAP 动画）
    ├── CardMenu.tsx            # 卡片「⋯」下拉菜单
    ├── ManageCardsModal.tsx    # 管理卡片弹窗（显隐开关 + 拖拽排序）
    ├── BackgroundPicker.tsx    # 背景选择器（4 种预设 + GSAP 动画）
    ├── Calendar.tsx            # 月日历 + 打卡标记
    ├── Notes.tsx               # Markdown 笔记 + 快捷键 N 聚焦 + 导出 MD
    ├── EasterEgg.tsx           # 治愈语录彩蛋
    ├── Toast.tsx               # 手帐风格 Toast（GSAP 滑入/淡出 + 撤销按钮）
    ├── Skeleton.tsx            # 骨架屏（GSAP 流光 + 7 卡片占位）
    ├── ConfirmDialog.tsx       # 自定义确认弹窗（函数式调用）
    ├── AnimatedNumber.tsx      # 数字滚动动画（GSAP）
    └── ErrorBoundary.tsx       # 渲染错误兜底
```

# 五、配色方案与字体

亮色主题（手帐/便签风格）和暗色主题（暖亮色系），RGB 通道格式 CSS 变量驱动。

| 变量 | 亮色 | 暗色 | 用途 |
|------|------|------|------|
| --bg-primary | 248 245 239 | 22 22 36 | 页面背景 |
| --bg-card | 255 254 249 | 32 32 54 | 卡片背景 |
| --bg-dot | 230 226 216 | 50 50 78 | 点阵纹理 |
| --text-primary | 74 74 74 | 242 238 228 | 主文字 |
| --text-secondary | 155 155 155 | 242 238 228 | 辅助文字（暗色同主文字） |
| --text-light | 180 175 165 | 210 200 185 | 占位符 |
| --accent-primary | 212 165 165 | 238 178 178 | 主色调（按钮/选中） |
| --accent-secondary | 196 164 132 | 218 182 150 | 强调色（进度条） |
| --accent-green | 156 175 136 | 168 214 150 | 完成状态（打卡/进度） |
| --border-light | 239 236 227 | 72 72 104 | 边框 |
| --check-undone | 230 225 218 | 78 78 108 | 未打卡 |

| 用途 | 字体 |
|------|------|
| 卡片标题 | 钉钉进步体 (DingTalk JinBuTi) |
| 数字/时间/代码 | JetBrains Mono |
| 正文 | 系统默认 |

卡片：16px 圆角、1px 边框、双层柔和阴影、右上角折角装饰、hover 上浮 2px。

# 六、数据存储

Zustand persist 自动同步到 localStorage，key `dashboard_store`：

| 字段 | 类型 | 说明 |
|------|------|------|
| theme | 'light' \| 'dark' | 主题偏好 |
| todos | Todo[]（含 completedAt） | 待办列表 |
| habits | Habit[] | 习惯列表 |
| habitRecords | Record<string, string[]> | 打卡记录 |
| notes | Note[] | 笔记列表 |
| selectedNoteId | string \| null | 当前笔记 |
| links | LinkItem[] | 快捷链接 |
| weatherCity | string | 城市 |
| weatherData | WeatherData \| null | 天气缓存 |

# 七、构建与部署

- `pnpm dev` 开发服务器
- `pnpm build` 生产构建（TypeScript 严格模式，es2020）
- `deploy-frontend-YYYYMMDD.tar.gz`

# 八、关键问题与解决方案

1. **Zustand selector 订阅函数引用不触发重渲染**：必须订阅数据源（如 `habitRecords`）而非 getter 函数
2. **TailwindCSS 把 CSS 变量解析为硬编码 RGB**：改用 RGB 通道格式 + `!important` 覆盖规则
3. **暗色 hover 不可见**：`hover:bg-notebook-bg` 在暗色下变黑，需加 `dark:hover:bg-white/8`
4. **不使用 React.StrictMode**：dev 双次渲染干扰外部 store
5. **Vite HMR 保护**：`import.meta.hot.accept` 转移旧 store 状态
6. **persist 不含 version**：无 `migrate` 时 Zustand v5 丢弃数据

# 九、文档

- 开发日志：`docs/logs/20260601.md`
- 重难点记录：`docs/开发中遇到的重难点.md`
