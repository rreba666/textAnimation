// 习惯打卡卡片 —— 含连续天数统计和月统计图表

import { useState, useMemo } from 'react'
import { CheckCircle2, Plus, Trash2, Flame, ChevronLeft, ChevronRight, Heart, Star } from 'lucide-react'
import { format, startOfWeek, addWeeks, subWeeks, isToday, isFuture } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import { useDashboardStore } from '../store/useDashboardStore'

const ICON_OPTIONS = [
  { name: 'Droplets', label: '喝水' },
  { name: 'Dumbbell', label: '运动' },
  { name: 'BookOpen', label: '阅读' },
  { name: 'Moon', label: '早睡' },
  { name: 'Flower2', label: '冥想' },
  { name: 'Heart', label: '爱心' },
  { name: 'Music', label: '音乐' },
  { name: 'Coffee', label: '咖啡' },
  { name: 'Sun', label: '阳光' },
  { name: 'Zap', label: '效率' },
]

const DAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']

export default function Habits() {
  const habits = useDashboardStore((s) => s.habits)
  // 订阅 habitRecords 确保打卡后重新渲染
  const _records = useDashboardStore((s) => s.habitRecords)
  const { getHabitStreak, getWeekRecords, getMonthData, addHabit, deleteHabit, toggleHabitDay } = useDashboardStore.getState()
  const _add = useDashboardStore((s) => s.addHabit)
  const _del = useDashboardStore((s) => s.deleteHabit)
  const _tog = useDashboardStore((s) => s.toggleHabitDay)

  const [showAddForm, setShowAddForm] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitIcon, setNewHabitIcon] = useState('Star')
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [chartMonth, setChartMonth] = useState(() => new Date().getMonth())
  const [chartYear, setChartYear] = useState(() => new Date().getFullYear())
  const [chartHabitId, setChartHabitId] = useState<string | null>(null)

  const handleAddHabit = () => {
    if (!newHabitName.trim()) return
    addHabit(newHabitName.trim(), newHabitIcon)
    setNewHabitName('')
    setNewHabitIcon('Star')
    setShowAddForm(false)
  }

  const handleToggleDay = (habitId: string, dayIndex: number) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + dayIndex)
    if (isFuture(d) && !isToday(d)) return
    toggleHabitDay(habitId, format(d, 'yyyy-MM-dd'))
  }

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(d.getDate() + i); return d }),
  [weekStart])

  const chartData = useMemo(() => {
    if (!chartHabitId) return []
    return getMonthData(chartHabitId, chartYear, chartMonth).map((d) => ({ day: String(d.day), done: d.done ? 1 : 0 }))
  }, [chartHabitId, chartYear, chartMonth, getMonthData])

  // 计算连续天数最高的习惯
  const bestStreak = useMemo(() => {
    if (habits.length === 0) return 0
    return Math.max(...habits.map((h) => getHabitStreak(h.id)))
  }, [habits, getHabitStreak])

  return (
    <div className="card p-5 h-full flex flex-col">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
          <CheckCircle2 size={20} className="text-warm-green" />
          习惯打卡
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex bg-notebook-bg rounded-lg p-0.5">
            <button onClick={() => setViewMode('week')} className={`px-2.5 py-1 text-xs rounded-md transition-colors ${viewMode === 'week' ? 'bg-white text-warm-orange shadow-sm' : 'text-text-secondary'}`}>周视图</button>
            <button onClick={() => setViewMode('month')} className={`px-2.5 py-1 text-xs rounded-md transition-colors ${viewMode === 'month' ? 'bg-white text-warm-orange shadow-sm' : 'text-text-secondary'}`}>月统计</button>
          </div>
          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-warm-green text-white rounded-xl hover:opacity-90 transition-opacity">
            <Plus size={14} /><span className="hidden sm:inline">添加</span>
          </button>
        </div>
      </div>

      {/* 连续天数统计 */}
      {bestStreak > 0 && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-warm-orange/8 rounded-xl text-sm">
          <Flame size={16} className="text-warm-orange" />
          <span className="text-text-primary">
            最高连续打卡 <span className="font-semibold text-warm-orange">{bestStreak}</span> 天
          </span>
        </div>
      )}

      {/* 添加表单 */}
      {showAddForm && (
        <div className="mb-3 p-3 bg-notebook-bg rounded-xl space-y-2 animate-[fade-in-up_0.2s_ease-out]">
          <input
            type="text" value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
            placeholder="习惯名称" autoFocus
            className="w-full px-3 py-2 text-sm border border-border-light rounded-xl outline-none focus:border-warm-orange bg-white text-text-primary placeholder-text-light"
          />
          <div className="flex flex-wrap gap-1.5">
            {ICON_OPTIONS.map((icon) => (
              <button key={icon.name} onClick={() => setNewHabitIcon(icon.name)}
                className={`px-2 py-1 text-xs rounded-lg transition-colors ${newHabitIcon === icon.name ? 'bg-warm-orange text-white' : 'bg-white text-text-secondary hover:bg-warm-pink/20'}`}>
                {icon.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddHabit} className="px-4 py-1.5 text-xs bg-warm-orange text-white rounded-xl hover:opacity-90">确认</button>
            <button onClick={() => setShowAddForm(false)} className="px-4 py-1.5 text-xs text-text-secondary hover:text-text-primary rounded-xl">取消</button>
          </div>
        </div>
      )}

      {/* 周视图 */}
      {viewMode === 'week' && (
        <div className="flex-1 overflow-y-auto custom-scrollbar -mx-1 px-1">
          {habits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-text-light">
              <CheckCircle2 size={40} className="opacity-30 mb-2" />
              <span className="text-sm">还没有习惯，点击添加开始打卡吧</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <button onClick={() => setWeekStart((w) => subWeeks(w, 1))} className="p-1 rounded-lg hover:bg-notebook-bg text-text-secondary"><ChevronLeft size={16} /></button>
                <span className="text-xs text-text-secondary">{format(weekStart, 'M月d日')} - {format(new Date(weekStart.getTime() + 6 * 86400000), 'M月d日')}</span>
                <button onClick={() => setWeekStart((w) => addWeeks(w, 1))} className="p-1 rounded-lg hover:bg-notebook-bg text-text-secondary"><ChevronRight size={16} /></button>
              </div>

              <div className="grid grid-cols-[auto_repeat(7,1fr)_40px] gap-1 mb-2 items-center">
                <div className="w-20" />
                {DAY_LABELS.map((label, i) => {
                  const today_ = isToday(weekDays[i])
                  return (
                    <div key={i} className={`text-center text-xs font-medium py-1 rounded-md ${today_ ? 'bg-warm-orange/10 text-warm-orange' : 'text-text-secondary'}`}>{label}</div>
                  )
                })}
                <div />
              </div>

              {habits.map((habit) => {
                const weekData = getWeekRecords(habit.id, weekStart)
                const streak = getHabitStreak(habit.id)
                return (
                  <div key={habit.id} className="grid grid-cols-[auto_repeat(7,1fr)_40px] gap-1 items-center py-1.5 hover:bg-notebook-bg/50 rounded-xl transition-colors group">
                    <div className="w-20 pr-1 flex items-center gap-1.5">
                      {streak > 0 && <Flame size={11} className="text-warm-orange shrink-0" />}
                      <span className="text-xs font-medium text-text-primary truncate">{habit.name}</span>
                    </div>
                    {weekData.map((done, i) => {
                      const d = weekDays[i]
                      const futureDay = isFuture(d) && !isToday(d)
                      return (
                        <button key={i} onClick={() => handleToggleDay(habit.id, i)} disabled={futureDay}
                          className={`flex items-center justify-center justify-self-center w-7 h-7 rounded-full text-xs font-medium transition-all duration-200 ${
                            futureDay ? 'text-text-light cursor-not-allowed opacity-30' :
                            done ? 'bg-warm-green text-white scale-100 hover:scale-110 active:scale-90' :
                            'bg-[rgb(var(--check-undone))] text-text-light hover:bg-warm-pink/30 hover:text-warm-orange'
                          }`} title={format(d, 'M月d日')}>
                          {done ? <Heart size={11} fill="currentColor" /> : <Star size={11} />}
                        </button>
                      )
                    })}
                    <div className="flex items-center justify-end">
                      <button onClick={() => deleteHabit(habit.id)} className="p-0.5 rounded text-text-light hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}

      {/* 月视图 */}
      {viewMode === 'month' && (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => { if (chartMonth === 0) { setChartMonth(11); setChartYear((y) => y - 1) } else setChartMonth((m) => m - 1) }} className="p-1 rounded-lg hover:bg-notebook-bg text-text-secondary"><ChevronLeft size={16} /></button>
            <span className="text-sm font-medium text-text-primary">{chartYear}年{chartMonth + 1}月</span>
            <button onClick={() => { if (chartMonth === 11) { setChartMonth(0); setChartYear((y) => y + 1) } else setChartMonth((m) => m + 1) }} className="p-1 rounded-lg hover:bg-notebook-bg text-text-secondary"><ChevronRight size={16} /></button>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {habits.map((h) => (
              <button key={h.id} onClick={() => setChartHabitId(h.id)}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${chartHabitId === h.id ? 'bg-warm-orange text-white' : 'bg-notebook-bg text-text-secondary hover:text-text-primary'}`}>{h.name}</button>
            ))}
          </div>

          {chartData.length > 0 && chartHabitId ? (
            <div className="flex-1 min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-light))" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'rgb(var(--text-secondary))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'rgb(var(--text-secondary))' }} axisLine={false} tickLine={false} ticks={[0, 1]} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgb(var(--border-light))', fontSize: 12 }}
                    formatter={(v: number) => [v ? '已打卡' : '未打卡', '']} labelFormatter={(l: string) => `${chartMonth + 1}月${l}日`} />
                  <Bar dataKey="done" fill="#9CAF88" radius={[4, 4, 0, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-text-light">
              {chartHabitId ? '暂无打卡数据' : '请选择一个习惯查看统计'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
