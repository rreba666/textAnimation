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
- 更新代码后必须同步更新对应的文档，若尚无文档则按当日日期命名新建于 `docs/logs/` 文件夹下

# 开发规范

- **禁止使用 emoji 表情**：使用 lucide-react 图标替代
- **代码更新后及时打包**：修改完代码必须运行构建并打包为 `deploy-frontend-{日期}.tar.gz`，排除 `.env`、`node_modules` 等敏感/冗余文件

# 一、项目概述

儿戏的日常手记是一个纯前端个人仪表盘应用，所有数据存储在 localStorage 中（通过 Zustand persist 中间件自动同步）。用户可在一页内查看天气、管理待办、打卡习惯、写 Markdown 笔记、保存快捷链接。

# 二、核心功能

| 功能模块 | 说明 |
|----------|------|
| 昼夜问候 | 根据时段（早/中/晚）自动切换问候语和图标 |
| 月度进度 | 显示当月已过天数和百分比进度条 |
| 天气模块 | Open-Meteo 免费 API，显示当前天气 + 3 天预报，缓存 10 分钟 |
| 待办事项 | 添加/删除/编辑/完成，进度统计条，按状态筛选，localStorage 持久化 |
| 习惯打卡 | 预设习惯 + 自定义，每日打卡，连续天数统计，周历 + 月统计图(Recharts) |
| 快速笔记 | Markdown 编辑 + 实时预览（react-markdown + remark-gfm），1 秒防抖自动保存 |
| 快捷链接 | 网站图标(Google Favicon) + 跳转，localStorage 持久化 |
| 时钟日历 | 实时数字时钟（每秒更新）+ 年月日星期 |
| 主题切换 | 亮色/暗色双主题，莫兰迪色系，CSS 变量驱动 |
| 治愈语录 | 右下角彩蛋，点击随机显示 10 句语录 |

# 三、技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建工具 | Vite 5 |
| 样式 | TailwindCSS 3.4（CSS 变量驱动主题切换） |
| 状态管理 | Zustand 5（persist 中间件自动同步 localStorage） |
| 图表 | recharts 2.15 |
| 日期 | date-fns 4 |
| Markdown | react-markdown 10 + remark-gfm 4 |
| 图标 | lucide-react 0.460 |
| 包管理 | pnpm |

# 四、项目结构

```
src/
├── App.tsx                     # 根组件：顶部栏 + CSS Grid 3 列卡片 + 彩蛋
├── main.tsx                    # 入口（不使用 StrictMode，避免 persist 竞态）
├── index.css                   # TailwindCSS + 全局样式 + 亮/暗主题变量 + 动画
├── vite-env.d.ts               # Vite 类型声明
├── types/
│   └── index.ts                # 类型定义（Todo/Note/Habit/LinkItem/WeatherData/ForecastDay）
├── utils/
│   └── storage.ts              # localStorage 读写工具 + ID 生成器
├── store/
│   └── useDashboardStore.ts    # Zustand 全局状态（全模块 CRUD + persist + HMR 保护）
└── components/
    ├── Header.tsx              # 顶部栏：问候 + 标题 + 时钟 + 日期 + 天气 + 主题切换 + 进度条
    ├── Greeting.tsx            # 昼夜问候组件（6 时段，lucide 图标）
    ├── ProgressBar.tsx         # 月度进度条（渐变填充，百分比显示）
    ├── Todo.tsx                # 待办事项卡片（含进度统计）
    ├── Habits.tsx              # 习惯打卡卡片（周历圆点 + 月统计图表 + 连续天数）
    ├── Links.tsx               # 快捷链接卡片（Favicon + 名称 + 域名）
    ├── Notes.tsx               # 快速笔记卡片（左侧列表 + 右侧 Markdown 编辑/预览）
    ├── EasterEgg.tsx           # 治愈语录彩蛋（10 句随机语录）
    └── ErrorBoundary.tsx       # React 错误边界（捕获渲染异常，显示刷新按钮）
```

# 五、配色方案（莫兰迪色系）

| 角色 | 亮色 | 暗色 | CSS 变量 |
|------|------|------|----------|
| 页面背景 | #F5F0E8 | #1E1E2E | --bg-primary |
| 卡片背景 | #FFFFFF | #2A2A3D | --bg-card |
| 主色调（按钮/选中） | #D4A5A5（灰粉） | #C89090 | --accent-primary |
| 强调色（进度条） | #C4A484（暖驼） | #B89878 | --accent-secondary |
| 完成状态 | #9CAF88（鼠尾草绿） | #8FAF80 | --accent-green |
| 主要文字 | #4A4A4A | #E0D8D0 | --text-primary |
| 次要文字 | #9B9B9B | #A09890 | --text-secondary |
| 边框分割线 | #E8E4D9 | #3A3A50 | --border-light |
| 未打卡圆点 | #D9D4C8 | #4A4A5D | --check-undone |

# 六、数据存储

所有数据通过 Zustand persist 中间件自动同步到 localStorage，key 为 `dashboard_store`：

| persist 字段 | 类型 | 说明 |
|-------------|------|------|
| theme | 'light' \| 'dark' | 主题偏好 |
| todos | Todo[] | 待办列表 |
| notes | Note[] | 笔记列表 |
| habits | Habit[] | 习惯列表 |
| habitRecords | HabitRecords | 打卡记录 {日期: [习惯ID]} |
| links | LinkItem[] | 快捷链接 |
| selectedNoteId | string \| null | 当前选中笔记 |
| weatherCity | string | 用户设置的城市 |
| weatherData | WeatherData \| null | 天气数据（含缓存时间戳） |

# 七、构建与部署

- `pnpm dev` 启动开发服务器
- `pnpm build` 构建（TypeScript 严格模式 + Vite，目标 es2020）
- 构建产物打包：`deploy-frontend-YYYYMMDD.tar.gz`
- 天气使用 Open-Meteo 免费 API，无需 API Key
- `.env.example` 仅供参考，`.env` 已被 `.gitignore` 忽略

# 八、已知问题与解决方案

1. **Zustand selector 必须订阅数据源而非函数引用**：函数引用稳定不变，不会触发重渲染。如 Habits 需订阅 `habitRecords` 数据而非 `getWeekRecords` 函数。
2. **不使用 React.StrictMode**：dev 模式双次渲染会与 persist 中间件产生不可预期的交互。
3. **Vite HMR 保护**：`useDashboardStore.ts` 末尾有 `import.meta.hot.accept` 回调，在 HMR 时将旧 store 状态转移到新 store。
4. **persist 不含 version**：不指定 `version` 字段，避免因缺少 `migrate` 函数导致 Zustand v5 丢弃数据。

# 九、文档

- 开发日志：`docs/logs/20260601.md`
- 重难点记录：`docs/开发中遇到的重难点.md`
