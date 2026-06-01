// 今日剩余 + 本周剩余倒计时，每分钟更新

import { useState, useEffect, useMemo } from 'react'
import { Clock, CalendarDays } from 'lucide-react'

export default function Countdown() {
  const [now, setNow] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t) }, [])

  const { hrs, mins, weekLeft } = useMemo(() => {
    const eod = new Date(now); eod.setHours(23, 59, 59, 999)
    const ms = eod.getTime() - now.getTime()
    const dow = now.getDay()
    return { hrs: Math.floor(ms / 3600000), mins: Math.floor((ms % 3600000) / 60000), weekLeft: dow === 0 ? 0 : 7 - dow }
  }, [now])

  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
        <Clock size={13} className="text-warm-orange shrink-0" />
        <span>距今日结束</span>
        <span className="font-mono text-sm font-medium text-text-primary tabular-nums">{String(hrs).padStart(2, '0')}:{String(mins).padStart(2, '0')}</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
        <CalendarDays size={13} className="text-warm-green shrink-0" />
        <span>本周还剩</span><span className="font-medium text-text-primary">{weekLeft}</span><span>天</span>
      </div>
    </div>
  )
}
