// 根组件：骨架屏加载 → 内容淡入 → 卡片网格（dnd-kit 拖拽排序）

import { useEffect, useState, useRef, useMemo, lazy, Suspense } from 'react'
import gsap from 'gsap'
import { format, subDays } from 'date-fns'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDashboardStore } from './store/useDashboardStore'
import { useTodoReminder } from './hooks/useTodoReminder'
import { useHabitReminder } from './hooks/useHabitReminder'
import { checkAchievementsRaw } from './data/achievements'
import { showAchievementNotify } from './components/AchievementNotify'
import LightSpotBackground from './components/LightSpotBackground'
import DashboardSkeleton from './components/Skeleton'
import Header from './components/Header'
import CardMenu from './components/CardMenu'
import Todo from './components/Todo'
import Habits from './components/Habits'
import Links from './components/Links'
import PomodoroTimer from './components/PomodoroTimer'
import WeekStats from './components/WeekStats'
import Calendar from './components/Calendar'
import Notes from './components/Notes'
import EasterEgg from './components/EasterEgg'
import ToastContainer from './components/Toast'
import AchievementNotify from './components/AchievementNotify'
import DataTipModal from './components/DataTipModal'
const GuideTour = lazy(() => import('./components/GuideTour'))
const shouldShowGuide = () => localStorage.getItem('re_xuzhang_has_seen_guide') !== '1'
import ConfirmDialog from './components/ConfirmDialog'

// 卡片注册表
const CARD_REGISTRY: Record<string, { Comp: React.ComponentType; className: string }> = {
  todo:       { Comp: Todo,          className: 'min-h-[380px]' },
  habits:     { Comp: Habits,        className: 'min-h-[380px]' },
  links:      { Comp: Links,         className: 'min-h-[280px]' },
  pomodoro:   { Comp: PomodoroTimer, className: '' },
  weekstats:  { Comp: WeekStats,     className: '' },
  calendar:   { Comp: Calendar,      className: '' },
  notes:      { Comp: Notes,         className: 'md:col-span-2 lg:col-span-3 min-h-[420px] max-h-[420px]' },
}

// ---- 可排序卡片包装器 ----
// 图钉颜色变体：清新多彩，降低饱和度不突兀
const PIN_COLORS = [
  ['#e8c8c0', '#d4a5a5', '#c48888'], // 暖粉
  ['#c8d8e0', '#a5c0d4', '#88a8c4'], // 淡蓝
  ['#d0d8c8', '#b0c0a0', '#90a880'], // 浅绿
  ['#e0d8c8', '#d0c0a0', '#c0a880'], // 米黄
  ['#d8d0e0', '#c0b0d0', '#a890c0'], // 淡紫
  ['#e0d4c8', '#d4c0a8', '#c8ac90'], // 杏色
]

function SortableCard({ id, children, className, isAnyDragging }: { id: string; children: React.ReactNode; className: string; isAnyDragging: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  // 根据卡片 ID 哈希取图钉颜色
  const pinColor = useMemo(() => {
    let hash = 0; for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
    return PIN_COLORS[Math.abs(hash) % PIN_COLORS.length]
  }, [id])

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-card-id={id}
      className={`relative group/card card-item ${className}`}
    >
      {/* 拖拽手柄：顶部居中 pill，hover 显示 */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover/card:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <div
          className="h-1.5 w-10 rounded-full"
          style={{ background: 'rgb(var(--border-light))' }}
        />
      </div>

      {/* 图钉装饰：左右各一个，拖拽时变空心圆孔，hover 微抬微旋 */}
      <div className="absolute top-1.5 z-10 group-hover/card:-translate-y-[2px] group-hover/card:rotate-[-8deg]"
        style={{ left: '18%', transition: 'transform 0.3s ease' }}>
        <div className={`transition-all duration-300 ${isAnyDragging ? 'opacity-70 scale-75' : 'opacity-90 scale-100'}`}>
          {isAnyDragging ? (
            <svg width="9" height="9" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="none" stroke="rgb(var(--border-light))" strokeWidth="1" strokeDasharray="2 1.5"/></svg>
          ) : (
            <div className="w-[9px] h-[9px] rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.15),0_0.5px_1px_rgba(0,0,0,0.06)] relative"
              style={{ background: `radial-gradient(circle at 35% 30%, ${pinColor[0]}, ${pinColor[1]} 55%, ${pinColor[2]} 100%)` }}>
              <div className="absolute w-[4px] h-[4px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ background: `radial-gradient(circle, ${pinColor[2]}, ${pinColor[1]} 50%, transparent 100%)` }} />
            </div>
          )}
        </div>
      </div>
      <div className="absolute top-1.5 z-10 group-hover/card:-translate-y-[2px] group-hover/card:rotate-[8deg]"
        style={{ right: '18%', transition: 'transform 0.3s ease' }}>
        <div className={`transition-all duration-300 ${isAnyDragging ? 'opacity-70 scale-75' : 'opacity-90 scale-100'}`}>
          {isAnyDragging ? (
            <svg width="9" height="9" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="none" stroke="rgb(var(--border-light))" strokeWidth="1" strokeDasharray="2 1.5"/></svg>
          ) : (
            <div className="w-[9px] h-[9px] rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.15),0_0.5px_1px_rgba(0,0,0,0.06)] relative"
              style={{ background: `radial-gradient(circle at 35% 30%, ${pinColor[0]}, ${pinColor[1]} 55%, ${pinColor[2]} 100%)` }}>
              <div className="absolute w-[4px] h-[4px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ background: `radial-gradient(circle, ${pinColor[2]}, ${pinColor[1]} 50%, transparent 100%)` }} />
            </div>
          )}
        </div>
      </div>

      {/* 卡片菜单：置于卡片顶部外侧，避免遮挡内容按钮 */}
      <div className="absolute -top-1 right-2 z-10 opacity-0 group-hover/card:opacity-100 transition-opacity">
        <CardMenu cardId={id} />
      </div>

      {children}
    </div>
  )
}

export default function App() {
  const theme = useDashboardStore((s) => s.theme)
  const background = useDashboardStore((s) => s.background)
  const hiddenCards = useDashboardStore((s) => s.hiddenCards)
  const cardOrder = useDashboardStore((s) => s.cardOrder)
  const setCardOrder = useDashboardStore((s) => s.setCardOrder)

  const [phase, setPhase] = useState<'skeleton' | 'content'>('skeleton')
  const skeletonRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [showAutoTip, setShowAutoTip] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const guideEverShown = useRef(false)

  // dnd-kit 拖拽状态
  const [activeId, setActiveId] = useState<string | null>(null)

  // 可见卡片列表
  const visibleCards = useMemo(
    () => cardOrder.filter((id) => CARD_REGISTRY[id] && !hiddenCards.includes(id)),
    [cardOrder, hiddenCards],
  )

  // dnd-kit 传感器：8px 移动阈值区分点击与拖拽，支持键盘
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // 拖拽开始：DragOverlay 入场弹性动画
  const overlayRef = useRef<HTMLDivElement>(null)
  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(e.active.id as string)
    requestAnimationFrame(() => {
      if (overlayRef.current) {
        gsap.fromTo(overlayRef.current,
          { scale: 0.9, opacity: 0.6 },
          { scale: 1.03, opacity: 0.9, duration: 0.2, ease: 'back.out(2)' }
        )
      }
    })
  }

  // 拖拽结束：更新顺序 + GSAP 弹性回弹动画
  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    const draggedId = active.id as string
    setActiveId(null)

    if (!over || active.id === over.id) return

    const oldIdx = cardOrder.indexOf(draggedId)
    const newIdx = cardOrder.indexOf(over.id as string)
    if (oldIdx === -1 || newIdx === -1) return

    setCardOrder(arrayMove(cardOrder, oldIdx, newIdx))

    // 等待 dnd-kit transition 完成后再播 GSAP 回弹
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-card-id="${draggedId}"]`) as HTMLElement
        if (!el) return
        gsap.fromTo(el,
          { scale: 1.04, boxShadow: '0 12px 40px rgba(0,0,0,0.10)' },
          { scale: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', duration: 0.35, ease: 'elastic.out(1, 0.3)' }
        )
      })
    })
  }

  // ---- 主题同步 ----
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // ---- 动态背景（自定义预设仅在亮色模式生效，暗色统一纸纹） ----
  const bgStyle = useMemo(() => {
    if (theme === 'dark') return undefined  // 暗色：纸纹跟随 CSS 变量
    if (!background || background.type === 'paper') return undefined
    return { background: bgPresets[background.type] || bgPresets.paper }
  }, [background, theme])

  // ---- 根据时间微调卡片底色（时间段 data 属性） ----
  useEffect(() => {
    const hour = new Date().getHours()
    let period = 'morning'     // 5-11
    if (hour >= 11 && hour < 13) period = 'noon'
    else if (hour >= 13 && hour < 18) period = 'afternoon'
    else if (hour >= 18 || hour < 5) period = 'night'
    document.documentElement.setAttribute('data-time-period', period)
  }, [])

  // ---- 骨架屏 ----
  useEffect(() => {
    const timer = setTimeout(() => {
      if (skeletonRef.current) {
        gsap.to(skeletonRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out', onComplete: () => setPhase('content') })
      } else { setPhase('content') }
    }, 700)
    return () => clearTimeout(timer)
  }, [])

  // 卡片依次淡入 + 上浮（骨架屏消失后）
  useEffect(() => {
    if (phase === 'content' && contentRef.current) {
      const cards = contentRef.current.querySelectorAll('.card-item')
      gsap.fromTo(cards,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'back.out(1.2)' }
      )
    }
  }, [phase])

  // ---- 键盘快捷键 ----
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return
      const key = e.key.toLowerCase()
      if (key === 'n') { e.preventDefault(); window.dispatchEvent(new CustomEvent('shortcut:focus-note')) }
      else if (key === 't') { e.preventDefault(); window.dispatchEvent(new CustomEvent('shortcut:focus-todo')) }
      else if (key === 'e') { e.preventDefault(); window.dispatchEvent(new CustomEvent('shortcut:edit-todo')) }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // ---- 通知权限请求 ----
  useEffect(() => {
    if (!('Notification' in window)) return
    if (Notification.permission !== 'default') return
    const timer = setTimeout(() => { Notification.requestPermission() }, 2000)
    return () => clearTimeout(timer)
  }, [])

  // ---- 每日总结 ----
  useEffect(() => {
    const KEY = 'daily_summary_last_date'
    const today = format(new Date(), 'yyyy-MM-dd')
    if (localStorage.getItem(KEY) === today) return
    localStorage.setItem(KEY, today)
    const timer = setTimeout(() => {
      if (!('Notification' in window) || Notification.permission !== 'granted') return
      const store = useDashboardStore.getState()
      const yesterday = subDays(new Date(), 1)
      const doneTodos = store.todos.filter((t) => t.completed && t.completedAt && format(new Date(t.completedAt), 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')).length
      const checkins = (store.habitRecords[format(yesterday, 'yyyy-MM-dd')] || []).length
      const streak = store.habits.length > 0 ? Math.max(...store.habits.map((h) => store.getHabitStreak(h.id))) : 0
      new Notification('昨日总结', { body: `完成待办：${doneTodos} 项\n打卡次数：${checkins} 次\n连续打卡：${streak} 天` })
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  // ---- 成就检测：用 vanilla subscribe 在 React 渲染周期外运行，避免每次状态变更引发全树重渲染 ----
  const runAchievementCheck = useRef(() => {
    const newBadges = checkAchievementsRaw()
    newBadges.forEach((b) => showAchievementNotify({ id: b.id, name: b.name, iconName: b.iconName, rarity: b.rarity }))
  })

  useEffect(() => {
    if (phase !== 'content') return
    // 立即执行一次
    runAchievementCheck.current()
    // Zustand vanilla subscribe：状态变化时静默检查，不触发 React 重渲染
    const unsub = useDashboardStore.subscribe(() => runAchievementCheck.current())
    const timer = setInterval(() => runAchievementCheck.current(), 30_000)
    return () => { unsub(); clearInterval(timer) }
  }, [phase])

  // ---- 首次访问引导遮罩 ----
  useEffect(() => {
    if (!shouldShowGuide()) return
    const timer = setTimeout(() => { setShowGuide(true); guideEverShown.current = true }, 1800)
    return () => clearTimeout(timer)
  }, [])

  // ---- 首次访问数据提示（引导关闭后再弹出） ----
  useEffect(() => {
    const KEY = 'hasSeenDataTip'
    if (localStorage.getItem(KEY)) return

    // 应该显示引导且引导尚未关闭 → 等待引导结束
    if (shouldShowGuide() && !guideEverShown.current) return
    // 引导已关闭（或不需要引导）→ 弹出数据提示
    if (shouldShowGuide() && showGuide) return // 引导还在显示中

    const timer = setTimeout(() => { setShowAutoTip(true); localStorage.setItem(KEY, '1') }, 600)
    return () => clearTimeout(timer)
  }, [showGuide])

  // ---- 后台提醒 ----
  useTodoReminder()
  useHabitReminder()

  // 当前被拖拽的卡片组件（用于 DragOverlay）
  const activeCard = activeId ? CARD_REGISTRY[activeId] : null

  return (
    <div id="app-root" className="min-h-screen">
      <div className="dot-pattern min-h-screen relative" style={bgStyle}>
        {/* 光斑漂移 + 波动渐变背景 */}
        <LightSpotBackground />
        {phase === 'skeleton' && (
          <div ref={skeletonRef}><DashboardSkeleton /></div>
        )}

        {phase === 'content' && (
          <div ref={contentRef}>
            {/* 装订孔装饰 */}
            <div className="page-binding hidden sm:flex">
              <div className="hole" /><div className="hole" /><div className="hole" /><div className="hole" />
            </div>
            {/* 和纸胶带 */}
            <div className="washi-tape" />

            <Header />

            <main className="main-wrapper max-w-[1200px] mx-auto px-4 sm:px-6 pb-24">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={visibleCards} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
                    {visibleCards.map((id) => {
                      const card = CARD_REGISTRY[id]
                      if (!card) return null
                      return (
                        <SortableCard key={id} id={id} className={card.className} isAnyDragging={!!activeId}>
                          <card.Comp />
                        </SortableCard>
                      )
                    })}
                  </div>
                </SortableContext>

                {/* 拖拽浮层：被拖拽卡片的半透明副本 */}
                <DragOverlay dropAnimation={null}>
                  {activeCard ? (
                    <div
                      ref={overlayRef}
                      className={`${activeCard.className} opacity-90`}
                      style={{
                        boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 8px 20px rgba(0,0,0,0.1)',
                        borderRadius: 18,
                        transform: 'scale(1.03) rotate(1deg)',
                      }}
                    >
                      <activeCard.Comp />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </main>

            <EasterEgg />
            <ToastContainer />
            <AchievementNotify />
            <ConfirmDialog />
            <DataTipModal open={showAutoTip} onClose={() => setShowAutoTip(false)} />
            <Suspense fallback={null}><GuideTour open={showGuide} onClose={() => setShowGuide(false)} /></Suspense>
          </div>
        )}
      </div>
    </div>
  )
}

const bgPresets: Record<string, string> = {
  paper:  '#F8F5EF',
  pink:   'linear-gradient(135deg, #FDE8E8, #F5F0E8)',
  ink:    '#E8E6E1',
  forest: '#DCE8D9',
}
