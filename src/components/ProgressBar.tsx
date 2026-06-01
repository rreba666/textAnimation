// 本月进度条组件 —— 显示当月已过百分比

import { useMemo } from 'react'

export default function ProgressBar() {
  const { monthLabel, currentDay, remainingDays, percent } = useMemo(() => {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const day = now.getDate()
    return {
      monthLabel: `${month + 1}月`,
      currentDay: day,
      remainingDays: daysInMonth - day,
      percent: Math.round((day / daysInMonth) * 100),
    }
  }, [])

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-text-secondary">
          {monthLabel} 已过 {currentDay} 天，还剩 {remainingDays} 天
        </span>
        <span className="text-xs font-medium text-warm-pink">{percent}%</span>
      </div>
      <div className="h-1.5 bg-[rgb(var(--border-light))] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percent}%`,
            background: 'linear-gradient(90deg, rgb(var(--accent-green)), rgb(var(--accent-secondary)))',
          }}
        />
      </div>
    </div>
  )
}
