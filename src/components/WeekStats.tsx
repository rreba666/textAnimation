// 本周统计 —— 4 指标汇总

import { useMemo } from 'react'
import { BarChart3, CheckCircle2, Flame, FileText } from 'lucide-react'
import { startOfWeek, endOfWeek, format, isWithinInterval } from 'date-fns'
import { useDashboardStore } from '../store/useDashboardStore'

export default function WeekStats() {
  const todos = useDashboardStore(s => s.todos)
  useDashboardStore(s => s.habitRecords)
  const notes = useDashboardStore(s => s.notes)
  const habits = useDashboardStore(s => s.habits)
  const { getHabitStreak } = useDashboardStore.getState()

  const stats = useMemo(() => {
    const ws = startOfWeek(new Date(), { weekStartsOn: 1 })
    const we = endOfWeek(new Date(), { weekStartsOn: 1 })
    const completed = todos.filter(t => t.completed && t.completedAt && isWithinInterval(new Date(t.completedAt), { start: ws, end: we })).length
    let checkins = 0; const recs = useDashboardStore.getState().habitRecords
    for (let d = new Date(ws); d <= we; d.setDate(d.getDate() + 1)) checkins += (recs[format(d, 'yyyy-MM-dd')] || []).length
    const streak = habits.length ? Math.max(...habits.map(h => getHabitStreak(h.id))) : 0
    const nts = notes.filter(n => isWithinInterval(new Date(n.updatedAt), { start: ws, end: we })).length
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
      <h2 className="flex items-center gap-2 text-base font-semibold text-text-primary mb-4"><BarChart3 size={18} className="text-warm-orange" />本周统计</h2>
      <div className="grid grid-cols-2 gap-3 flex-1">
        {items.map(({ v, l, Icon, c }) => (
          <div key={l} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-notebook-bg/60">
            <Icon size={16} className={`${c} mb-1`} />
            <span className={`text-2xl font-bold ${c} tabular-nums`}>{v}</span>
            <span className="text-xs text-text-secondary mt-0.5">{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
