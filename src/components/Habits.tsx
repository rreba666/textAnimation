// 习惯打卡卡片 —— 含连续天数统计和月统计图表

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { CheckCircle2, Plus, Trash2, Flame, ChevronLeft, ChevronRight, Heart, Star } from 'lucide-react'
import { format, startOfWeek, addWeeks, subWeeks, isToday, isFuture } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import gsap from 'gsap'
import { useDashboardStore } from '../store/useDashboardStore'
import { showToast } from './Toast'
import HeatmapModal from './HeatmapModal'
import AnimatedNumber from './AnimatedNumber'

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
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitIcon, setNewHabitIcon] = useState('Star')
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [chartMonth, setChartMonth] = useState(() => new Date().getMonth())
  const [chartYear, setChartYear] = useState(() => new Date().getFullYear())
  const [chartHabitId, setChartHabitId] = useState<string | null>(null)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const habitRowRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const cardRef = useRef<HTMLDivElement>(null)
  const prevHabitsLen = useRef(habits.length)

  // 点击卡片外取消选中
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setSelectedHabitId(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // 新习惯入场动画（新习惯在最前面）
  useEffect(() => {
    if (habits.length > prevHabitsLen.current) {
      const newHabit = habits[0]
      requestAnimationFrame(() => {
        const el = habitRowRefs.current.get(newHabit.id)
        if (el) gsap.from(el, { opacity: 0, y: -10, duration: 0.3, ease: 'power2.out' })
      })
    }
    prevHabitsLen.current = habits.length
  }, [habits])

  // 删除习惯（含 GSAP 退场动画 + 撤销 Toast）
  const handleDeleteHabit = useCallback((id: string) => {
    const el = habitRowRefs.current.get(id)
    const habit = habits.find((h) => h.id === id)
    if (!habit) { deleteHabit(id); return }
    const snapshot = { name: habit.name, icon: habit.icon }
    const doRemove = () => {
      deleteHabit(id)
      setSelectedHabitId(null)
      showToast({
        message: `已删除「${snapshot.name}」`,
        showUndo: true,
        onUndo: () => { useDashboardStore.getState().addHabit(snapshot.name, snapshot.icon) },
      })
    }
    if (el) {
      gsap.to(el, { opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0, duration: 0.25, ease: 'power2.in', onComplete: doRemove })
    } else {
      doRemove()
    }
  }, [habits, deleteHabit])

  // Delete 键删除选中习惯
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Del') return
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      if (selectedHabitId) handleDeleteHabit(selectedHabitId)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedHabitId, handleDeleteHabit])

  const handleAddHabit = () => {
    if (!newHabitName.trim()) return
    addHabit(newHabitName.trim(), newHabitIcon)
    setNewHabitName('')
    setNewHabitIcon('Star')
    setShowAddForm(false)
  }

  // 打卡点击：切换打卡状态 + GSAP 弹性缩放动画
  const handleToggleDay = (habitId: string, dayIndex: number, e: React.MouseEvent<HTMLButtonElement>) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + dayIndex)
    if (isFuture(d) && !isToday(d)) return
    toggleHabitDay(habitId, format(d, 'yyyy-MM-dd'))
    // GSAP 弹性缩放：点击时先缩小再弹回，模拟弹性反馈
    gsap.fromTo(e.currentTarget,
      { scale: 1 },
      { scale: 0.5, duration: 0.12, ease: 'back.out(3)', yoyo: true, repeat: 1 }
    )
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
    <div ref={cardRef} className="card p-5 h-full flex flex-col">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
          <CheckCircle2 size={20} className="text-warm-green" />
          习惯打卡
        </h2>
        <div className="flex items-center gap-2">
          {/* 热力图图标按钮 */}
          <button
            onClick={() => setShowHeatmap(true)}
            className="p-1.5 rounded-lg hover:bg-notebook-bg dark:hover:bg-white/8 text-text-secondary hover:text-warm-green transition-colors"
            title="打卡热力图"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3" strokeWidth="1.5" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
              <rect x="11" y="11" width="3" height="3" rx="0.5" />
              <rect x="15" y="11" width="3" height="3" rx="0.5" />
              <rect x="11" y="15" width="3" height="3" rx="0.5" />
            </svg>
          </button>
          <div className="flex bg-notebook-bg rounded-lg p-0.5">
            <button onClick={() => setViewMode('week')} className={`px-2.5 py-1 text-xs rounded-md transition-colors ${viewMode === 'week' ? 'bg-[rgb(var(--bg-card))] text-warm-orange shadow-sm' : 'text-text-secondary'}`}>周视图</button>
            <button onClick={() => setViewMode('month')} className={`px-2.5 py-1 text-xs rounded-md transition-colors ${viewMode === 'month' ? 'bg-[rgb(var(--bg-card))] text-warm-orange shadow-sm' : 'text-text-secondary'}`}>月统计</button>
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
            最高连续打卡 <AnimatedNumber value={bestStreak} className="font-semibold text-warm-orange" /> 天
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
            className="w-full px-3 py-2 text-sm border border-border-light rounded-xl outline-none focus:border-warm-orange bg-[rgb(var(--bg-card))] text-text-primary placeholder-text-light"
          />
          <div className="flex flex-wrap gap-1.5">
            {ICON_OPTIONS.map((icon) => (
              <button key={icon.name} onClick={() => setNewHabitIcon(icon.name)}
                className={`px-2 py-1 text-xs rounded-lg transition-colors ${newHabitIcon === icon.name ? 'bg-warm-orange text-white' : 'bg-[rgb(var(--bg-card))] text-text-secondary hover:bg-warm-pink/20'}`}>
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
        <div className="flex-1 overflow-y-auto custom-scrollbar -mx-1 px-1 min-h-0 max-h-[400px]">
          {habits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-text-light">
              <CheckCircle2 size={40} className="opacity-30 mb-2" />
              <span className="text-sm">还没有习惯，点击添加开始打卡吧</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <button onClick={() => setWeekStart((w) => subWeeks(w, 1))} className="p-1 rounded-lg hover:bg-notebook-bg dark:hover:bg-white/8 text-text-secondary"><ChevronLeft size={16} /></button>
                <span className="text-xs text-text-secondary">{format(weekStart, 'M月d日')} - {format(new Date(weekStart.getTime() + 6 * 86400000), 'M月d日')}</span>
                <button onClick={() => setWeekStart((w) => addWeeks(w, 1))} className="p-1 rounded-lg hover:bg-notebook-bg dark:hover:bg-white/8 text-text-secondary"><ChevronRight size={16} /></button>
              </div>

              <div className="grid grid-cols-[auto_repeat(7,1fr)_40px] gap-1 mb-2 items-center">
                <div className="w-24 px-2" />
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
                  <div
                    key={habit.id}
                    ref={(el) => { if (el) habitRowRefs.current.set(habit.id, el) }}
                    className={`grid grid-cols-[auto_repeat(7,1fr)_40px] gap-1 items-center py-1.5 rounded-xl transition-colors group cursor-pointer ${
                      selectedHabitId === habit.id
                        ? 'bg-[rgb(var(--accent-primary)/0.12)] ring-1 ring-[rgb(var(--accent-primary)/0.3)]'
                        : 'hover:bg-notebook-bg/50 dark:hover:bg-white/5'
                    }`}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('button')) return
                      setSelectedHabitId(selectedHabitId === habit.id ? null : habit.id)
                    }}
                  >
                    <div className="w-24 pl-2 pr-1 flex items-center gap-1">
                      {streak > 0 && <Flame size={11} className="text-warm-orange shrink-0" />}
                      <span className="text-xs font-medium text-text-primary truncate">{habit.name}</span>
                    </div>
                    {weekData.map(({ done, makeup }, i) => {
                      const d = weekDays[i]
                      const futureDay = isFuture(d) && !isToday(d)
                      // 补签使用不同颜色标识（琥珀色背景 + 时钟图标）
                      const isMakeup = done && makeup
                      return (
                        <button key={i} onClick={(e) => handleToggleDay(habit.id, i, e)} disabled={futureDay}
                          className={`flex items-center justify-center justify-self-center w-7 h-7 rounded-full text-xs font-medium transition-all duration-200 ${
                            futureDay ? 'text-text-light cursor-not-allowed opacity-30' :
                            isMakeup ? 'bg-[rgb(var(--accent-secondary))] text-white scale-100 hover:scale-110 active:scale-90' :
                            done ? 'bg-warm-green text-white scale-100 hover:scale-110 active:scale-90' :
                            'bg-[rgb(var(--check-undone))] text-text-light hover:bg-warm-pink/30 hover:text-warm-orange'
                          }`} title={`${format(d, 'M月d日')}${isMakeup ? '（补签）' : ''}`}>
                          {isMakeup ? (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                          ) : done ? (
                            <Heart size={11} fill="currentColor" />
                          ) : (
                            <Star size={11} />
                          )}
                        </button>
                      )
                    })}
                    <div className="flex items-center justify-end">
                      <button onClick={() => handleDeleteHabit(habit.id)} className="p-0.5 rounded text-text-light hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
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
            <button onClick={() => { if (chartMonth === 0) { setChartMonth(11); setChartYear((y) => y - 1) } else setChartMonth((m) => m - 1) }} className="p-1 rounded-lg hover:bg-notebook-bg dark:hover:bg-white/8 text-text-secondary"><ChevronLeft size={16} /></button>
            <span className="text-sm font-medium text-text-primary">{chartYear}年{chartMonth + 1}月</span>
            <button onClick={() => { if (chartMonth === 11) { setChartMonth(0); setChartYear((y) => y + 1) } else setChartMonth((m) => m + 1) }} className="p-1 rounded-lg hover:bg-notebook-bg dark:hover:bg-white/8 text-text-secondary"><ChevronRight size={16} /></button>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {habits.map((h) => (
              <button key={h.id} onClick={() => setChartHabitId(h.id)}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${chartHabitId === h.id ? 'bg-warm-orange text-white' : 'bg-notebook-bg text-text-secondary hover:text-text-primary'}`}>{h.name}</button>
            ))}
          </div>

          {chartData.length > 0 && chartHabitId ? (
            <div className="flex-1 min-h-[160px] max-h-[260px]">
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

      {/* 热力图弹窗 */}
      <HeatmapModal open={showHeatmap} onClose={() => setShowHeatmap(false)} />
    </div>
  )
}
