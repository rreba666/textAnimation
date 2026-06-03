// 根组件：骨架屏加载 → 内容淡入 → 卡片网格（dnd-kit 拖拽排序）

import { useEffect, useState, useRef, useMemo } from 'react'
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
import DataTipModal from './components/DataTipModal'
import ConfirmDialog from './components/ConfirmDialog'

// 卡片注册表
const CARD_REGISTRY: Record<string, { Comp: React.ComponentType; className: string }> = {
  todo:       { Comp: Todo,          className: 'min-h-[380px]' },
  habits:     { Comp: Habits,        className: 'min-h-[380px]' },
  links:      { Comp: Links,         className: 'min-h-[280px]' },
  pomodoro:   { Comp: PomodoroTimer, className: '' },
  weekstats:  { Comp: WeekStats,     className: '' },
  calendar:   { Comp: Calendar,      className: '' },
  notes:      { Comp: Notes,         className: 'md:col-span-2 lg:col-span-3 min-h-[420px]' },
}

// ---- 可排序卡片包装器 ----
function SortableCard({ id, children, className }: { id: string; children: React.ReactNode; className: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

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

      {/* 卡片菜单 */}
      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover/card:opacity-100 transition-opacity">
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

  // ---- 动态背景 ----
  const bgStyle = useMemo(() => {
    if (!background || background.type === 'paper') return undefined
    return { background: bgPresets[background.type] || bgPresets.paper }
  }, [background])

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

  // ---- 首次访问数据提示 ----
  useEffect(() => {
    const KEY = 'hasSeenDataTip'
    if (localStorage.getItem(KEY)) return
    const timer = setTimeout(() => { setShowAutoTip(true); localStorage.setItem(KEY, '1') }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // ---- 后台提醒 ----
  useTodoReminder()
  useHabitReminder()

  // 当前被拖拽的卡片组件（用于 DragOverlay）
  const activeCard = activeId ? CARD_REGISTRY[activeId] : null

  return (
    <div id="app-root" className="min-h-screen">
      <div className="dot-pattern min-h-screen" style={bgStyle}>
        {phase === 'skeleton' && (
          <div ref={skeletonRef}><DashboardSkeleton /></div>
        )}

        {phase === 'content' && (
          <div ref={contentRef}>
            <Header />

            <main className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-24">
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
                        <SortableCard key={id} id={id} className={card.className}>
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
            <ConfirmDialog />
            <DataTipModal open={showAutoTip} onClose={() => setShowAutoTip(false)} />
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
