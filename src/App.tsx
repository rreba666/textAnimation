// 根组件：骨架屏加载 → 内容淡入 → 卡片网格（支持显隐/排序/拖拽）

import { useEffect, useState, useRef, useMemo } from 'react'
import gsap from 'gsap'
import { format, startOfWeek, endOfWeek, isWithinInterval, subDays } from 'date-fns'
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

// 卡片注册表：id → 组件 + 尺寸
const CARD_REGISTRY: Record<string, { Comp: React.ComponentType; className: string }> = {
  todo:       { Comp: Todo,          className: 'min-h-[380px]' },
  habits:     { Comp: Habits,        className: 'min-h-[380px]' },
  links:      { Comp: Links,         className: 'min-h-[280px]' },
  pomodoro:   { Comp: PomodoroTimer, className: '' },
  weekstats:  { Comp: WeekStats,     className: '' },
  calendar:   { Comp: Calendar,      className: '' },
  notes:      { Comp: Notes,         className: 'md:col-span-2 lg:col-span-3 min-h-[420px]' },
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

  // 卡片拖拽排序状态
  const [cardDragId, setCardDragId] = useState<string | null>(null)
  const [cardDragOverId, setCardDragOverId] = useState<string | null>(null)
  const [showAutoTip, setShowAutoTip] = useState(false)

  // 可见且按序排列的卡片列表
  const visibleCards = useMemo(
    () => cardOrder.filter((id) => CARD_REGISTRY[id] && !hiddenCards.includes(id)),
    [cardOrder, hiddenCards],
  )

  // ---- 主题同步 ----
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // ---- 动态背景（仅非默认预设时覆盖 dot-pattern，纸纹跟随 CSS 变量） ----
  const bgStyle = useMemo(() => {
    // 默认纸纹：不设内联样式，让 dot-pattern 的 CSS 变量随主题自动变色
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

  useEffect(() => {
    if (phase === 'content' && contentRef.current) {
      gsap.fromTo(contentRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' })
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

  // ---- 通知权限请求（延迟 2 秒） ----
  useEffect(() => {
    if (!('Notification' in window)) return
    if (Notification.permission !== 'default') return
    const timer = setTimeout(() => {
      Notification.requestPermission()
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  // ---- 每日首次打开：弹出昨日总结 ----
  useEffect(() => {
    const KEY = 'daily_summary_last_date'
    const today = format(new Date(), 'yyyy-MM-dd')
    const lastDate = localStorage.getItem(KEY)
    if (lastDate === today) return

    // 标记今天已展示
    localStorage.setItem(KEY, today)

    // 延迟等页面加载完成后弹出
    const timer = setTimeout(() => {
      if (!('Notification' in window) || Notification.permission !== 'granted') return

      const store = useDashboardStore.getState()
      const yesterday = subDays(new Date(), 1)

      // 昨日完成待办
      const doneTodos = store.todos.filter(
        (t) => t.completed && t.completedAt && format(new Date(t.completedAt), 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd'),
      ).length

      // 昨日打卡次数
      const dateStr = format(yesterday, 'yyyy-MM-dd')
      const checkins = (store.habitRecords[dateStr] || []).length

      // 当前连续天数
      const streak = store.habits.length > 0
        ? Math.max(...store.habits.map((h) => store.getHabitStreak(h.id)))
        : 0

      const body = `完成待办：${doneTodos} 项\n打卡次数：${checkins} 次\n连续打卡：${streak} 天`
      new Notification('昨日总结', { body })
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  // ---- 首次访问：自动弹出数据安全提示 ----
  useEffect(() => {
    const KEY = 'hasSeenDataTip'
    if (localStorage.getItem(KEY)) return
    const timer = setTimeout(() => {
      setShowAutoTip(true)
      localStorage.setItem(KEY, '1')
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // ---- 后台提醒 hooks ----
  useTodoReminder()
  useHabitReminder()

  // ---- 卡片拖拽排序（增强视觉反馈） ----
  const handleCardDragStart = (e: React.DragEvent, id: string) => {
    setCardDragId(id)
    e.dataTransfer.effectAllowed = 'move'
    // 拖拽中：提亮阴影 + 抬高层级
    const el = e.currentTarget as HTMLElement
    el.style.zIndex = '100'
    el.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)'
    el.style.transition = 'box-shadow 0.15s ease-out'
  }

  const handleCardDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    if (id !== cardDragId) setCardDragOverId(id)
  }

  const handleCardDragLeave = () => setCardDragOverId(null)

  const handleCardDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (cardDragId && cardDragId !== targetId) {
      const ids = visibleCards.filter((id) => !hiddenCards.includes(id))
      const fromIdx = ids.indexOf(cardDragId)
      const toIdx = ids.indexOf(targetId)
      if (fromIdx !== -1 && toIdx !== -1) {
        const newOrder = [...cardOrder]
        const globalFrom = newOrder.indexOf(cardDragId)
        const globalTo = newOrder.indexOf(targetId)
        newOrder.splice(globalFrom, 1)
        newOrder.splice(globalTo, 0, cardDragId)
        setCardOrder(newOrder)
      }
    }
    setCardDragId(null)
    setCardDragOverId(null)
  }

  // 拖拽结束：清理样式 + GSAP 弹性回弹
  const handleCardDragEnd = (e: React.DragEvent) => {
    const el = e.currentTarget as HTMLElement
    el.style.zIndex = ''
    el.style.boxShadow = ''
    // GSAP 弹性落位
    gsap.fromTo(el,
      { scale: 1.03 },
      { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.3)' }
    )
    setCardDragId(null)
    setCardDragOverId(null)
  }

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
                {visibleCards.map((id) => {
                  const card = CARD_REGISTRY[id]
                  if (!card) return null
                  const { Comp, className } = card
                  return (
                    <div
                      key={id}
                      draggable
                      onDragStart={(e) => handleCardDragStart(e, id)}
                      onDragOver={(e) => handleCardDragOver(e, id)}
                      onDragLeave={handleCardDragLeave}
                      onDrop={(e) => handleCardDrop(e, id)}
                      onDragEnd={handleCardDragEnd}
                      className={`relative group/card cursor-grab active:cursor-grabbing transition-all duration-200 ${
                        cardDragId === id ? 'opacity-60' : ''
                      } ${
                        cardDragOverId === id
                          ? 'rounded-2xl border-2 border-dashed'
                          : ''
                      } ${className}`}
                      style={cardDragOverId === id ? { borderColor: 'rgb(var(--accent-primary))', background: 'rgb(var(--accent-primary) / 0.06)' } : undefined}
                    >
                      {/* 卡片菜单（hover 时显示） */}
                      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover/card:opacity-100 transition-opacity">
                        <CardMenu cardId={id} />
                      </div>
                      <Comp />
                    </div>
                  )
                })}
              </div>
            </main>

            <EasterEgg />
            <ToastContainer />
            <DataTipModal open={showAutoTip} onClose={() => setShowAutoTip(false)} />
          </div>
        )}
      </div>
    </div>
  )
}

/** 背景预设 CSS 映射 */
const bgPresets: Record<string, string> = {
  paper:  '#F8F5EF',
  pink:   'linear-gradient(135deg, #FDE8E8, #F5F0E8)',
  ink:    '#E8E6E1',
  forest: '#DCE8D9',
}
