// 骨架屏加载组件 —— 页面初始加载时显示，GSAP 流光扫过动画

import { useRef, useEffect, type ReactNode } from 'react'
import gsap from 'gsap'

// ---- 基础流光骨架块 ----

/** 独立流光方块：GSAP 驱动白色光带从左扫到右，循环播放 */
function Shimmer({ className = '' }: { className?: string }) {
  const sweepRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sweepRef.current
    if (!el) return
    const tl = gsap.timeline({ repeat: -1 })
    tl.fromTo(el, { left: '-50%' }, { left: '100%', duration: 1.8, ease: 'power2.inOut' })
    return () => { tl.kill() }
  }, [])

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: 'rgb(var(--check-undone))' }}
    >
      <div
        ref={sweepRef}
        className="absolute top-0 bottom-0 w-1/2 skew-x-[-15deg]"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.14) 40%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.14) 60%, transparent 100%)',
        }}
      />
    </div>
  )
}

// ---- 卡片标题占位 ----

/** 骨架卡片标题：小圆 + 矩形 */
function SkeletonTitle() {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Shimmer className="w-5 h-5 rounded-full" />
      <Shimmer className="w-20 h-4 rounded-md" />
    </div>
  )
}

// ---- 各卡片骨架 ----

/** 待办事项卡片骨架 */
function TodoSkeleton() {
  return (
    <div className="card p-5 min-h-[380px] flex flex-col">
      <SkeletonTitle />
      {/* 筛选标签 */}
      <div className="flex gap-1.5 mb-3">
        <Shimmer className="w-11 h-6 rounded-md" />
        <Shimmer className="w-14 h-6 rounded-md" />
        <Shimmer className="w-14 h-6 rounded-md" />
      </div>
      {/* 进度条 */}
      <Shimmer className="w-full h-1.5 rounded-full mb-3" />
      {/* 输入框 */}
      <Shimmer className="w-full h-9 rounded-xl mb-3" />
      {/* 列表项 */}
      <div className="flex flex-col gap-2 flex-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Shimmer className="w-5 h-5 rounded-md shrink-0" />
            <Shimmer className="flex-1 h-5 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}

/** 习惯打卡卡片骨架 */
function HabitsSkeleton() {
  return (
    <div className="card p-5 min-h-[380px] flex flex-col">
      <SkeletonTitle />
      {/* 视图切换 */}
      <div className="flex gap-1.5 mb-3">
        <Shimmer className="w-14 h-6 rounded-md" />
        <Shimmer className="w-14 h-6 rounded-md" />
      </div>
      {/* 习惯行 */}
      <div className="flex flex-col gap-3 flex-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-1.5">
            <Shimmer className="w-16 h-4 rounded-md shrink-0" />
            {[1, 2, 3, 4, 5, 6, 7].map((j) => (
              <Shimmer key={j} className="w-7 h-7 rounded-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/** 快捷链接卡片骨架 */
function LinksSkeleton() {
  return (
    <div className="card p-5 min-h-[280px]">
      <SkeletonTitle />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Shimmer className="w-5 h-5 rounded-full shrink-0" />
            <div className="flex flex-col gap-1 flex-1">
              <Shimmer className="w-full h-3 rounded-md" />
              <Shimmer className="w-3/4 h-2.5 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** 番茄钟卡片骨架 */
function PomodoroSkeleton() {
  return (
    <div className="card p-5">
      <SkeletonTitle />
      <div className="flex flex-col items-center gap-4">
        <Shimmer className="w-32 h-32 rounded-full" />
        <div className="flex gap-2">
          <Shimmer className="w-16 h-7 rounded-lg" />
          <Shimmer className="w-16 h-7 rounded-lg" />
          <Shimmer className="w-16 h-7 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

/** 本周统计卡片骨架 */
function WeekStatsSkeleton() {
  return (
    <div className="card p-5">
      <SkeletonTitle />
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 p-2">
            <Shimmer className="w-10 h-10 rounded-full" />
            <Shimmer className="w-12 h-6 rounded-md" />
            <Shimmer className="w-16 h-3 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}

/** 日历卡片骨架 */
function CalendarSkeleton() {
  return (
    <div className="card p-5">
      <SkeletonTitle />
      {/* 月份导航 */}
      <div className="flex items-center justify-between mb-3">
        <Shimmer className="w-5 h-5 rounded-md" />
        <Shimmer className="w-20 h-4 rounded-md" />
        <Shimmer className="w-5 h-5 rounded-md" />
      </div>
      {/* 日期网格 7x5 */}
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 35 }).map((_, i) => (
          <Shimmer key={i} className="aspect-square rounded-md" />
        ))}
      </div>
    </div>
  )
}

/** 快速笔记卡片骨架 */
function NotesSkeleton() {
  return (
    <div className="card p-5 min-h-[420px] flex flex-col">
      <SkeletonTitle />
      <div className="flex gap-4 flex-1">
        {/* 左侧列表 */}
        <div className="w-32 sm:w-44 flex flex-col gap-2">
          <Shimmer className="w-full h-14 rounded-xl" />
          <Shimmer className="w-full h-14 rounded-xl" />
          <Shimmer className="w-full h-14 rounded-xl" />
          <Shimmer className="w-full h-14 rounded-xl" />
        </div>
        {/* 右侧编辑区 */}
        <div className="flex-1 flex flex-col gap-2">
          <Shimmer className="w-full h-7 rounded-lg" />
          <Shimmer className="flex-1 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

// ---- 完整仪表盘骨架 ----

/** 仪表盘骨架屏：7 张卡片占位，GSAP 流光扫过动画 */
export default function DashboardSkeleton() {
  const containerRef = useRef<HTMLDivElement>(null)

  // 容器入场：微淡入
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: 'power2.out' }
      )
    }
  }, [])

  return (
    <div ref={containerRef}>
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
          <div className="min-h-[380px]"><TodoSkeleton /></div>
          <div className="min-h-[380px]"><HabitsSkeleton /></div>
          <div className="min-h-[280px]"><LinksSkeleton /></div>
          <div><PomodoroSkeleton /></div>
          <div><WeekStatsSkeleton /></div>
          <div><CalendarSkeleton /></div>
          <div className="md:col-span-2 lg:col-span-3 min-h-[420px]"><NotesSkeleton /></div>
        </div>
      </main>
    </div>
  )
}

// ---- 过渡动画包装器 ----

/** 骨架屏 → 内容切换动画容器 */
export function SkeletonFadeWrapper({
  showContent,
  skeleton,
  children,
}: {
  showContent: boolean
  skeleton: ReactNode
  children: ReactNode
}) {
  const skeletonRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (showContent) {
      // 骨架屏淡出
      if (skeletonRef.current) {
        gsap.to(skeletonRef.current, {
          opacity: 0, duration: 0.3, ease: 'power2.out',
          onComplete: () => {
            // 内容淡入 + 微上移
            if (contentRef.current) {
              gsap.fromTo(contentRef.current,
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
              )
            }
          },
        })
      }
    }
  }, [showContent])

  return (
    <div className="relative">
      {/* 骨架屏层 */}
      {!showContent && (
        <div ref={skeletonRef} className="relative z-10">
          {skeleton}
        </div>
      )}

      {/* 内容层 */}
      <div
        ref={contentRef}
        className="relative z-0"
        style={{ display: showContent ? 'block' : 'none' }}
      >
        {children}
      </div>
    </div>
  )
}
