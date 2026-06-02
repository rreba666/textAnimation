// 本周统计 —— 4 指标汇总 + 周报弹窗入口

import { useMemo, useState } from 'react'
import { BarChart3, CheckCircle2, Flame, FileText } from 'lucide-react'
import { startOfWeek, endOfWeek, format, isWithinInterval } from 'date-fns'
import { useDashboardStore } from '../store/useDashboardStore'
import WeeklyReport from './WeeklyReport'

/** 右上角图表 SVG 图标 —— 手绘风格迷你折线 */
function MiniChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="4" strokeWidth="1.5" />
      <polyline points="7,15 10,10 13,12 17,6" />
    </svg>
  )
}

export default function WeekStats() {
  const todos = useDashboardStore((s) => s.todos)
  useDashboardStore((s) => s.habitRecords)
  const notes = useDashboardStore((s) => s.notes)
  const habits = useDashboardStore((s) => s.habits)
  const { getHabitStreak } = useDashboardStore.getState()

  const [showReport, setShowReport] = useState(false)

  const stats = useMemo(() => {
    const ws = startOfWeek(new Date(), { weekStartsOn: 1 })
    const we = endOfWeek(new Date(), { weekStartsOn: 1 })
    const completed = todos.filter((t) =>
      t.completed && t.completedAt &&
      isWithinInterval(new Date(t.completedAt), { start: ws, end: we })
    ).length
    let checkins = 0
    const recs = useDashboardStore.getState().habitRecords
    const cursor = new Date(ws)
    while (cursor <= we) {
      checkins += (recs[format(cursor, 'yyyy-MM-dd')] || []).length
      cursor.setDate(cursor.getDate() + 1)
    }
    const streak = habits.length ? Math.max(...habits.map((h) => getHabitStreak(h.id))) : 0
    const nts = notes.filter((n) =>
      isWithinInterval(new Date(n.updatedAt), { start: ws, end: we })
    ).length
    return { completed, checkins, streak, nts }
  }, [todos, notes, habits, getHabitStreak])

  const items = [
    { v: stats.completed, l: '待办完成', Icon: CheckCircle2, c: 'text-warm-orange' },
    { v: stats.checkins, l: '打卡次数', Icon: BarChart3, c: 'text-warm-green' },
    { v: stats.streak, l: '连续天数', Icon: Flame, c: 'text-warm-pink' },
    { v: stats.nts, l: '新增笔记', Icon: FileText, c: 'text-warm-orange' },
  ]

  return (
    <div className="card p-4 h-full flex flex-col">
      {/* 标题栏：标题 + 周报按钮 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-base font-semibold text-text-primary">
          <BarChart3 size={18} className="text-warm-orange" />
          本周统计
        </h2>
        <button
          onClick={() => setShowReport(true)}
          className="p-1.5 rounded-lg hover:bg-notebook-bg dark:hover:bg-white/8 text-text-secondary hover:text-warm-orange transition-colors"
          title="查看周报"
        >
          <MiniChartIcon />
        </button>
      </div>

      {/* 指标网格 */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {items.map(({ v, l, Icon, c }) => (
          <div key={l} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-notebook-bg/60">
            <Icon size={16} className={`${c} mb-1`} />
            <span className={`text-2xl font-bold ${c} tabular-nums`}>{v}</span>
            <span className="text-xs text-text-secondary mt-0.5">{l}</span>
          </div>
        ))}
      </div>

      {/* 周报弹窗 */}
      <WeeklyReport open={showReport} onClose={() => setShowReport(false)} />
    </div>
  )
}
