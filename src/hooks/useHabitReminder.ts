// 打卡提醒 hook —— 每天晚上 8 点检查未打卡习惯并弹通知

import { useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { useDashboardStore } from '../store/useDashboardStore'

const REMINDER_KEY = 'habit_reminder_last_date'
const REMINDER_HOUR = 20

function notify(title: string, body: string) {
  if (!('Notification' in window)) return
  if (Notification.permission === 'granted') {
    new Notification(title, { body })
  }
}

/** 每小时检查一次，晚上 8 点提醒未打卡习惯（每天仅一次） */
export function useHabitReminder() {
  const lastCheckRef = useRef('')

  useEffect(() => {
    const check = () => {
      const now = new Date()
      const today = format(now, 'yyyy-MM-dd')
      const hour = now.getHours()

      // 仅在晚 8 点（20:00~20:59）检查
      if (hour !== REMINDER_HOUR) return
      // 今天已提醒过
      if (lastCheckRef.current === today) return

      const lastDate = localStorage.getItem(REMINDER_KEY)
      if (lastDate === today) return

      const store = useDashboardStore.getState()
      const { habits, habitRecords } = store

      if (habits.length === 0) return

      // 找出今天未打卡的习惯
      const todayRecs = habitRecords[today] || []
      const unchecked = habits.filter((h) => !todayRecs.includes(h.id))

      if (unchecked.length > 0) {
        const names = unchecked.map((h) => h.name).join('、')
        notify('习惯打卡提醒', `今天还有 ${unchecked.length} 个习惯未打卡：${names}`)
      }

      localStorage.setItem(REMINDER_KEY, today)
      lastCheckRef.current = today
    }

    check()
    const timer = setInterval(check, 3_600_000) // 每小时
    return () => clearInterval(timer)
  }, [])
}
