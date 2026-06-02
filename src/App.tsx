// 根组件：骨架屏加载 → 内容淡入 → 顶部栏 + 卡片网格 + 彩蛋

import { useEffect, useState, useRef } from 'react'
import gsap from 'gsap'
import { useDashboardStore } from './store/useDashboardStore'
import DashboardSkeleton from './components/Skeleton'
import Header from './components/Header'
import Todo from './components/Todo'
import Habits from './components/Habits'
import Links from './components/Links'
import PomodoroTimer from './components/PomodoroTimer'
import WeekStats from './components/WeekStats'
import Calendar from './components/Calendar'
import Notes from './components/Notes'
import EasterEgg from './components/EasterEgg'
import ToastContainer from './components/Toast'

export default function App() {
  const theme = useDashboardStore((s) => s.theme)

  // 加载阶段：skeleton → content
  const [phase, setPhase] = useState<'skeleton' | 'content'>('skeleton')
  const skeletonRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // 同步主题到 DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // 骨架屏最短展示 700ms 后触发过渡
  useEffect(() => {
    const timer = setTimeout(() => {
      // 骨架屏 GSAP 淡出
      if (skeletonRef.current) {
        gsap.to(skeletonRef.current, {
          opacity: 0, duration: 0.3, ease: 'power2.out',
          onComplete: () => setPhase('content'),
        })
      } else {
        setPhase('content')
      }
    }, 700)
    return () => clearTimeout(timer)
  }, [])

  // 内容层 GSAP 淡入
  useEffect(() => {
    if (phase === 'content' && contentRef.current) {
      gsap.fromTo(contentRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      )
    }
  }, [phase])

  // 全局键盘快捷键：分发自定义事件，由各组件监听处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果用户正在输入框或编辑区域中打字，不触发快捷键
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return

      const key = e.key.toLowerCase()
      if (key === 'n') {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('shortcut:focus-note'))
      } else if (key === 't') {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('shortcut:focus-todo'))
      } else if (key === 'e') {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('shortcut:edit-todo'))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="min-h-screen bg-notebook-bg">
      <div className="dot-pattern min-h-screen">
        {/* ---- 骨架屏层 ---- */}
        {phase === 'skeleton' && (
          <div ref={skeletonRef}>
            <DashboardSkeleton />
          </div>
        )}

        {/* ---- 内容层（骨架屏结束后显示） ---- */}
        {phase === 'content' && (
          <div ref={contentRef}>
            <Header />

            <main className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-24">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
                <div className="min-h-[380px]"><Todo /></div>
                <div className="min-h-[380px]"><Habits /></div>
                <div className="min-h-[280px]"><Links /></div>
                <div><PomodoroTimer /></div>
                <div><WeekStats /></div>
                <div><Calendar /></div>
                <div className="md:col-span-2 lg:col-span-3 min-h-[420px]"><Notes /></div>
              </div>
            </main>

            <EasterEgg />
            <ToastContainer />
          </div>
        )}
      </div>
    </div>
  )
}
