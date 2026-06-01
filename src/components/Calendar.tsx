// 月视图日历 + 打卡标记

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfWeek as sow, endOfWeek as eow, addDays, isSameMonth, isToday } from 'date-fns'
import { useDashboardStore } from '../store/useDashboardStore'

const LABELS = ['一', '二', '三', '四', '五', '六', '日']

export default function Calendar() {
  const [vd, setVd] = useState(new Date())
  const records = useDashboardStore(s => s.habitRecords)
  const yr = vd.getFullYear(); const mo = vd.getMonth()

  const days = useMemo(() => {
    const ms = startOfMonth(vd); const me = endOfMonth(vd)
    const cs = sow(ms, { weekStartsOn: 1 }); const ce = eow(me, { weekStartsOn: 1 })
    const arr: Date[] = []; let d = cs
    while (d <= ce) { arr.push(d); d = addDays(d, 1) }
    return arr
  }, [vd])

  const hasCheckin = (d: Date) => { const k = format(d, 'yyyy-MM-dd'); const r = records[k]; return r && r.length > 0 }

  return (
    <div className="card p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-text-primary"><CalendarDays size={18} className="text-warm-pink" />日历</h2>
        <div className="flex items-center gap-1">
          <button onClick={() => setVd(new Date(yr, mo - 1, 1))} className="p-1 rounded-lg hover:bg-notebook-bg dark:hover:bg-white/8 text-text-secondary"><ChevronLeft size={16} /></button>
          <span className="text-sm font-medium text-text-primary w-28 text-center">{yr}年 {mo + 1}月</span>
          <button onClick={() => setVd(new Date(yr, mo + 1, 1))} className="p-1 rounded-lg hover:bg-notebook-bg dark:hover:bg-white/8 text-text-secondary"><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {LABELS.map((l, i) => <div key={i} className={`text-center text-xs font-medium py-1.5 ${i >= 5 ? 'text-warm-pink/70' : 'text-text-secondary'}`}>{l}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5 flex-1">
        {days.map((d, i) => {
          const inM = isSameMonth(d, vd); const td = isToday(d); const ci = hasCheckin(d)
          return (
            <div key={i} className="flex flex-col items-center py-0.5">
              <div className={`w-7 h-7 flex items-center justify-center text-xs rounded-full relative ${td ? 'bg-warm-orange text-white font-semibold' : inM ? 'text-text-primary hover:bg-notebook-bg dark:hover:bg-white/8' : 'text-text-light'}`}>{format(d, 'd')}</div>
              {inM && ci ? <div className="w-1.5 h-1.5 rounded-full bg-warm-green mt-0.5" /> : inM && <div className="w-1.5 h-1.5 mt-0.5" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
