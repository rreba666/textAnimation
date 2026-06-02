// 待办提醒 hook —— 每分钟检查是否有到期的待办提醒

import { useEffect, useRef } from 'react'
import { useDashboardStore } from '../store/useDashboardStore'

/** 弹出浏览器通知 */
function notify(title: string, body: string) {
  if (!('Notification' in window)) return
  if (Notification.permission === 'granted') {
    new Notification(title, { body })
  }
}

/** 每分钟检查一次，到期的待办提醒弹出通知并自动清除 */
export function useTodoReminder() {
  const firedRef = useRef<Set<string>>(new Set()) // 已触发的提醒 ID

  useEffect(() => {
    const check = () => {
      const now = new Date()
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

      const store = useDashboardStore.getState()
      store.todos.forEach((todo) => {
        // 跳过已完成、无提醒、已触发过的
        if (todo.completed || !todo.reminderAt) return
        if (firedRef.current.has(todo.id)) return
        if (todo.reminderAt === timeStr) {
          firedRef.current.add(todo.id)
          notify('待办提醒', `「${todo.text.slice(0, 30)}」`)
          // 触发后清除提醒时间
          store.setTodoReminder(todo.id, null)
        }
      })
    }

    check() // 首次立即检查
    const timer = setInterval(check, 60_000) // 每分钟
    return () => clearInterval(timer)
  }, [])
}
