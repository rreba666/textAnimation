// 月度趋势弹窗 —— 本月每日完成待办折线图 + 月份切换 + 统计摘要

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import { format, eachDayOfInterval, getDaysInMonth } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import gsap from 'gsap'
import { useDashboardStore } from '../store/useDashboardStore'

interface Props {
  open: boolean
  onClose: () => void
}

/** 每日完成数图表数据项 */
interface ChartItem {
  day: number    // 日期（1-31）
  label: string  // M/d
  count: number  // 当天完成待办数
}

export default function MonthlyTrend({ open, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const [closing, setClosing] = useState(false)
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth())

  const todos = useDashboardStore((s) => s.todos)

  // ---- 关闭动画：淡出 + 微上飘 ----
  const handleClose = useCallback(() => {
    if (closing) return
    setClosing(true)
    if (overlayRef.current) {
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.25, ease: 'power2.in' })
    }
    if (modalRef.current) {
      gsap.to(modalRef.current, {
        opacity: 0, y: -20, scale: 0.95,
        duration: 0.3, ease: 'power2.in',
        onComplete: () => { setClosing(false); onClose() },
      })
    } else {
      setClosing(false)
      onClose()
    }
  }, [closing, onClose])

  // ESC 关闭
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, handleClose])

  // 每次打开时重置 closing 状态
  useEffect(() => {
    if (open) setClosing(false)
  }, [open])

  // ---- GSAP 入场动画：遮罩淡入 + 弹窗弹性缩放 ----
  useEffect(() => {
    if (!open || closing) return
    requestAnimationFrame(() => {
      if (overlayRef.current) {
        gsap.fromTo(overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.25, ease: 'power2.out' }
        )
      }
      if (modalRef.current) {
        gsap.fromTo(modalRef.current,
          { opacity: 0, scale: 0.85, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.6)' }
        )
      }
    })
  }, [open, closing])

  // ---- 月份导航 ----
  const goPrev = useCallback(() => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }, [viewMonth])

  const goNext = useCallback(() => {
    const now = new Date()
    if (viewYear === now.getFullYear() && viewMonth >= now.getMonth()) return
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }, [viewYear, viewMonth])

  const goCurrent = useCallback(() => {
    const now = new Date()
    setViewYear(now.getFullYear())
    setViewMonth(now.getMonth())
  }, [])

  const isCurrentMonth = viewYear === new Date().getFullYear() && viewMonth === new Date().getMonth()

  // ---- 计算月度数据 ----
  const report = useMemo(() => {
    const daysInMonth = getDaysInMonth(new Date(viewYear, viewMonth))
    const days = eachDayOfInterval({
      start: new Date(viewYear, viewMonth, 1),
      end: new Date(viewYear, viewMonth, daysInMonth - 1, 23, 59, 59),
    })

    const chartData: ChartItem[] = days.map((d) => ({
      day: d.getDate(),
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      count: todos.filter((t) =>
        t.completed &&
        t.completedAt &&
        format(new Date(t.completedAt), 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd')
      ).length,
    }))

    const total = chartData.reduce((s, d) => s + d.count, 0)
    const avg = daysInMonth > 0 ? total / daysInMonth : 0
    const maxDay = chartData.reduce((a, b) => (b.count >= a.count ? b : a), chartData[0] || { day: -1, label: '', count: -1 })
    const minDay = chartData.reduce((a, b) => (b.count <= a.count ? b : a), chartData[0] || { day: -1, label: '', count: Infinity })

    return { chartData, total, avg, maxDay, minDay, daysInMonth }
  }, [todos, viewYear, viewMonth])

  // X 轴标签间隔：确保显示约 7 个标签
  const xInterval = Math.max(1, Math.floor(report.daysInMonth / 7))

  if (!open) return null

  return createPortal(
    // 遮罩层
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.35)' }}
      onClick={handleClose}
    >
      {/* 弹窗主体 */}
      <div
        ref={modalRef}
        className="relative w-full max-w-[460px] max-h-[90vh] overflow-y-auto custom-scrollbar"
        style={{
          background: 'rgb(var(--bg-card))',
          borderRadius: 20,
          border: '1px solid rgb(var(--border-light))',
          boxShadow: '0 16px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
          padding: '24px 24px 20px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-lg font-semibold"
            style={{ color: 'rgb(var(--text-primary))', fontFamily: '"DingTalk JinBuTi", system-ui, sans-serif' }}
          >
            月度趋势
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-notebook-bg dark:hover:bg-white/8 text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 月份导航 */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goPrev}
            className="p-1 rounded-lg hover:bg-notebook-bg dark:hover:bg-white/8 text-text-secondary transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={goCurrent}
            className="text-sm font-medium px-3 py-1 rounded-lg hover:bg-notebook-bg dark:hover:bg-white/8 transition-colors"
            style={{ color: 'rgb(var(--text-primary))', fontFamily: '"DingTalk JinBuTi", system-ui, sans-serif' }}
          >
            {viewYear}年{viewMonth + 1}月
            {isCurrentMonth && (
              <span className="ml-1.5 text-xs" style={{ color: 'rgb(var(--accent-primary))' }}>本月</span>
            )}
          </button>
          <button
            onClick={goNext}
            disabled={isCurrentMonth}
            className={`p-1 rounded-lg transition-colors ${
              isCurrentMonth
                ? 'text-text-light cursor-not-allowed opacity-40'
                : 'hover:bg-notebook-bg dark:hover:bg-white/8 text-text-secondary'
            }`}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* 统计摘要 4 列 */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          <StatBox label="当月完成" value={report.total} color="rgb(var(--accent-primary))" />
          <StatBox label="日均" value={report.avg.toFixed(1)} color="rgb(var(--accent-green))" />
          <StatBox
            label="最高"
            value={report.maxDay.count >= 0 ? report.maxDay.count : 0}
            sub={report.maxDay.day > 0 ? `${report.maxDay.day}日` : undefined}
            color="rgb(var(--accent-secondary))"
          />
          <StatBox
            label="最低"
            value={report.minDay.count === Infinity ? 0 : report.minDay.count}
            sub={report.minDay.count === Infinity ? undefined : `${report.minDay.day}日`}
            color="rgb(var(--text-secondary))"
          />
        </div>

        {/* 折线图 */}
        <div>
          <h3
            className="text-sm font-medium mb-2"
            style={{ color: 'rgb(var(--text-secondary))', fontFamily: '"DingTalk JinBuTi", system-ui, sans-serif' }}
          >
            每日完成待办
          </h3>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={report.chartData} margin={{ top: 5, right: 8, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-light))" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: 'rgb(var(--text-secondary))' }}
                  axisLine={false}
                  tickLine={false}
                  interval={xInterval}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: 'rgb(var(--text-secondary))' }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid rgb(var(--border-light))',
                    background: 'rgb(var(--bg-card))',
                    fontSize: 12,
                    color: 'rgb(var(--text-primary))',
                    fontFamily: '"DingTalk JinBuTi", system-ui, sans-serif',
                  }}
                  formatter={(value: number) => [`${value} 个待办`, '完成']}
                  labelFormatter={(label: string) => `${viewMonth + 1}月${label}日`}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="rgb(var(--accent-primary))"
                  strokeWidth={2}
                  dot={{ r: 2, fill: 'rgb(var(--accent-primary))', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: 'rgb(var(--accent-primary))', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/** 统计摘要小方块 */
function StatBox({
  label,
  value,
  sub,
  color,
}: {
  label: string
  value: string | number
  sub?: string
  color: string
}) {
  return (
    <div
      className="flex flex-col items-center justify-center p-2 rounded-xl"
      style={{ background: 'rgb(var(--bg-dot))' }}
    >
      <span className="text-lg font-bold tabular-nums" style={{ color }}>{value}</span>
      <span className="text-[10px] mt-0.5" style={{ color: 'rgb(var(--text-secondary))' }}>{label}</span>
      {sub && <span className="text-[10px] mt-px" style={{ color }}>{sub}</span>}
    </div>
  )
}
