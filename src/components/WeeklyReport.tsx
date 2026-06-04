// 周报弹窗 —— 本周统计详情 + 每日完成待办折线图

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, TrendingUp, TrendingDown, Minus, FileDown } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import { startOfWeek, endOfWeek, subWeeks, format, isWithinInterval, eachDayOfInterval, getISOWeek } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import gsap from 'gsap'
import { useDashboardStore } from '../store/useDashboardStore'

interface Props {
  open: boolean
  onClose: () => void
}

/** 本周每日待办完成数折线图数据项 */
interface ChartItem {
  day: string    // 星期简称（一/二/三...）
  date: string   // MM-dd
  count: number  // 当天完成待办数
}

export default function WeeklyReport({ open, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // 订阅数据源
  const todos = useDashboardStore((s) => s.todos)
  const notes = useDashboardStore((s) => s.notes)
  const habits = useDashboardStore((s) => s.habits)
  const _records = useDashboardStore((s) => s.habitRecords)

  // ---- 关闭动画：淡出 + 微上飘 ----
  const [closing, setClosing] = useState(false)

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

  // GSAP 入场动画：遮罩淡入 + 弹窗弹性缩放
  useEffect(() => {
    if (!open || closing) return
    // 等待下一帧确保 DOM 已挂载
    requestAnimationFrame(() => {
      if (overlayRef.current) {
        gsap.fromTo(overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.25, ease: 'power2.out' }
        )
      }
      if (modalRef.current) {
        gsap.fromTo(modalRef.current,
          { opacity: 0, scale: 0.85 },
          { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.6)' }
        )
      }
    })
  }, [open])

  // 计算本周 + 上周对比数据
  const report = useMemo(() => {
    const today = new Date()
    const ws = startOfWeek(today, { weekStartsOn: 1 })
    const we = endOfWeek(today, { weekStartsOn: 1 })
    const lws = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 })
    const lwe = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 })

    const store = useDashboardStore.getState()
    const recs = store.habitRecords
    const { getHabitStreak } = store

    // 本周每日完成待办数（折线图数据）
    const days = eachDayOfInterval({ start: ws, end: we })
    const chartData: ChartItem[] = days.map((d) => ({
      day: format(d, 'EEE', { locale: zhCN }),
      date: format(d, 'MM-dd'),
      count: todos.filter((t) =>
        t.completed &&
        t.completedAt &&
        format(new Date(t.completedAt), 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd')
      ).length,
    }))

    // 本周完成待办
    const completed = todos.filter((t) =>
      t.completed && t.completedAt &&
      isWithinInterval(new Date(t.completedAt), { start: ws, end: we })
    ).length

    // 上周完成待办
    const lastCompleted = todos.filter((t) =>
      t.completed && t.completedAt &&
      isWithinInterval(new Date(t.completedAt), { start: lws, end: lwe })
    ).length
    const diff = completed - lastCompleted

    // 本周打卡总次数
    let checkins = 0
    const cursor = new Date(ws)
    while (cursor <= we) {
      checkins += (recs[format(cursor, 'yyyy-MM-dd')] || []).length
      cursor.setDate(cursor.getDate() + 1)
    }

    // 新增笔记
    const newNotes = notes.filter((n) =>
      isWithinInterval(new Date(n.updatedAt), { start: ws, end: we })
    ).length

    // 最高连续打卡
    const streak = habits.length > 0
      ? Math.max(...habits.map((h) => getHabitStreak(h.id)))
      : 0

    // 周报导出用：各习惯本周打卡天数
    const habitDetails = habits.map((h) => {
      let days = 0
      const c = new Date(ws)
      while (c <= we) {
        if (recs[format(c, 'yyyy-MM-dd')]?.includes(h.id)) days++
        c.setDate(c.getDate() + 1)
      }
      return { name: h.name, days }
    })

    // 周报导出用：本周笔记标题
    const weekNoteTitles = notes
      .filter((n) => isWithinInterval(new Date(n.updatedAt), { start: ws, end: we }))
      .map((n) => n.title)

    // ISO 周数 + 日期范围字符串
    const weekNum = getISOWeek(today)
    const dateRange = `${format(ws, 'yyyy-MM-dd')} ~ ${format(we, 'yyyy-MM-dd')}`

    return { chartData, completed, lastCompleted, diff, checkins, newNotes, streak, habitDetails, weekNoteTitles, weekNum, dateRange, ws, we }
  }, [todos, notes, habits, _records])

  // ---- 导出周报为 Markdown ----
  const handleExportMD = useCallback(() => {
    const totalTodos = todos.length
    const rate = totalTodos > 0 ? Math.round((report.completed / totalTodos) * 100) : 0

    const lines = [
      `# 第 ${report.weekNum} 周周报（${report.dateRange}）`,
      '',
      '## 待办完成',
      `- 本周完成：${report.completed} / ${totalTodos} 项`,
      `- 完成率：${rate}%`,
      report.diff !== 0 ? `- 较上周：${report.diff > 0 ? '+' : ''}${report.diff}` : '- 较上周：持平',
      '',
      '## 习惯打卡',
      '| 习惯 | 打卡天数 |',
      '|------|---------|',
      ...report.habitDetails.map((h) => `| ${h.name} | ${h.days} 天 |`),
      `- 本周总计：${report.checkins} 次`,
      `- 连续打卡最高：${report.streak} 天`,
      '',
      '## 笔记',
      report.weekNoteTitles.length > 0
        ? report.weekNoteTitles.map((t) => `- ${t}`).join('\n')
        : '- 本周暂无新笔记',
      '',
      '## 本周总结',
      '> 每一天都是新的开始，继续加油！',
      '',
      `---`,
      `*由「RE:序章」自动生成*`,
    ]

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `周报_${report.weekNum < 10 ? '0' : ''}${report.weekNum}周_${format(report.ws, 'yyyy-MM-dd')}.md`
    a.click()
    URL.revokeObjectURL(url)
  }, [todos, report])

  if (!open) return null

  // 使用 Portal 渲染到 body，避免被父级卡片 hover 样式（translateY/shadow）干扰
  return createPortal(
    // 遮罩层
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.35)' }}
      onClick={handleClose}
    >
      {/* 弹窗主体 —— 阻止冒泡避免点击内部关闭 */}
      <div
        ref={modalRef}
        className="relative w-full max-w-[420px] max-h-[90vh] overflow-y-auto custom-scrollbar"
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
            本周周报
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-notebook-bg dark:hover:bg-white/8 text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 指标网格 2×2 */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* 完成待办（含较上周对比） */}
          <div
            className="flex flex-col items-center justify-center p-3 rounded-2xl"
            style={{ background: 'rgb(var(--bg-dot))' }}
          >
            <span className="text-2xl font-bold tabular-nums" style={{ color: 'rgb(var(--accent-primary))' }}>
              {report.completed}
            </span>
            <span className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-secondary))' }}>完成待办</span>
            {report.diff > 0 ? (
              <span className="flex items-center gap-0.5 text-xs mt-1" style={{ color: 'rgb(var(--accent-green))' }}>
                <TrendingUp size={12} />↑{report.diff} 较上周
              </span>
            ) : report.diff < 0 ? (
              <span className="flex items-center gap-0.5 text-xs mt-1" style={{ color: 'rgb(var(--accent-primary))' }}>
                <TrendingDown size={12} />↓{Math.abs(report.diff)} 较上周
              </span>
            ) : (
              <span className="flex items-center gap-0.5 text-xs mt-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                <Minus size={12} />持平
              </span>
            )}
          </div>

          {/* 打卡总次数 */}
          <div
            className="flex flex-col items-center justify-center p-3 rounded-2xl"
            style={{ background: 'rgb(var(--bg-dot))' }}
          >
            <span className="text-2xl font-bold tabular-nums" style={{ color: 'rgb(var(--accent-green))' }}>
              {report.checkins}
            </span>
            <span className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-secondary))' }}>打卡次数</span>
          </div>

          {/* 新增笔记 */}
          <div
            className="flex flex-col items-center justify-center p-3 rounded-2xl"
            style={{ background: 'rgb(var(--bg-dot))' }}
          >
            <span className="text-2xl font-bold tabular-nums" style={{ color: 'rgb(var(--accent-secondary))' }}>
              {report.newNotes}
            </span>
            <span className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-secondary))' }}>新增笔记</span>
          </div>

          {/* 连续打卡天数 */}
          <div
            className="flex flex-col items-center justify-center p-3 rounded-2xl"
            style={{ background: 'rgb(var(--bg-dot))' }}
          >
            <span className="text-2xl font-bold tabular-nums" style={{ color: 'rgb(var(--accent-primary))' }}>
              {report.streak}
            </span>
            <span className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-secondary))' }}>连续天数</span>
          </div>
        </div>

        {/* 每日完成待办折线图 */}
        <div>
          <h3
            className="text-sm font-medium mb-2"
            style={{ color: 'rgb(var(--text-secondary))', fontFamily: '"DingTalk JinBuTi", system-ui, sans-serif' }}
          >
            每日完成待办
          </h3>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={report.chartData} margin={{ top: 5, right: 8, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-light))" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: 'rgb(var(--text-secondary))' }}
                  axisLine={false}
                  tickLine={false}
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
                  labelFormatter={(label: string, payload: unknown[]) => {
                    const item = (payload as { payload: ChartItem }[])?.[0]?.payload
                    return item ? `${item.date} (${item.day})` : label
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="rgb(var(--accent-primary))"
                  strokeWidth={2}
                  dot={{ r: 3, fill: 'rgb(var(--accent-primary))', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: 'rgb(var(--accent-primary))', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 导出按钮 */}
        <div className="mt-5 pt-4 border-t" style={{ borderColor: 'rgb(var(--border-light))' }}>
          <button
            onClick={handleExportMD}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl transition-colors w-full justify-center"
            style={{
              color: 'rgb(var(--accent-primary))',
              background: 'rgb(var(--accent-primary) / 0.08)',
              border: '1px solid rgb(var(--accent-primary) / 0.18)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgb(var(--accent-primary) / 0.15)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgb(var(--accent-primary) / 0.08)' }}
          >
            <FileDown size={14} />
            导出为 Markdown
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
