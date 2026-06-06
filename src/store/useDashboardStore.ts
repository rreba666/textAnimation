// Zustand 全局状态管理 —— RE:序章

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Todo, Note, Habit, LinkItem, HabitRecords, FilterType, WeatherData } from '../types'
import { generateId } from '../utils/storage'
import { format } from 'date-fns'

interface DashboardState {
  // --- 主题 ---
  theme: 'light' | 'dark'
  toggleTheme: () => void

  // --- 待办事项 ---
  todos: Todo[]
  addTodo: (text: string) => void
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void
  editTodo: (id: string, text: string) => void
  reorderTodos: (fromId: string, toId: string) => void
  setTodoReminder: (id: string, reminderAt: string | null) => void

  // --- 习惯打卡 ---
  habits: Habit[]
  habitRecords: HabitRecords
  makeupRecords: Record<string, string[]>  // 补签记录：日期 → 习惯ID数组
  addHabit: (name: string, icon?: string) => void
  deleteHabit: (id: string) => void
  toggleHabitDay: (habitId: string, date: string) => void
  getHabitStreak: (habitId: string) => number
  getWeekRecords: (habitId: string, weekStart: Date) => { done: boolean; makeup: boolean }[]
  getMonthData: (habitId: string, year: number, month: number) => { day: number; done: boolean }[]

  // --- 快捷链接 ---
  links: LinkItem[]
  addLink: (name: string, url: string) => void
  deleteLink: (id: string) => void
  editLink: (id: string, name: string, url: string) => void

  // --- 快速笔记 ---
  notes: Note[]
  selectedNoteId: string | null
  addNote: () => string
  deleteNote: (id: string) => void
  updateNote: (id: string, data: { title?: string; content?: string }) => void
  selectNote: (id: string | null) => void

  // --- 天气 ---
  weatherCity: string
  weatherData: WeatherData | null
  setWeatherCity: (city: string) => void
  setWeatherData: (data: WeatherData | null) => void

  // --- 卡片显隐 & 布局 ---
  hiddenCards: string[]
  toggleCardVisibility: (cardId: string) => void
  cardOrder: string[]
  setCardOrder: (order: string[]) => void

  // --- 背景 ---
  background: { type: string; value?: string }
  setBackground: (bg: { type: string; value?: string }) => void

  // --- 番茄钟持久化 ---
  pomodoroPreset: number
  pomodoroTimeLeft: number
  pomodoroRunning: boolean
  pomodoroStartedAt: string | null
  setPomodoroState: (s: { preset: number; timeLeft: number; running: boolean; startedAt: string | null }) => void

  // --- 成就追踪 ---
  earlyCheckinDates: string[]
  lateNightNoteDates: string[]
  viewedOldNoteDates: string[]
}

// 预设习惯列表
const DEFAULT_HABITS: Habit[] = [
  { id: 'habit-1', name: '喝水 8 杯', icon: 'Droplets' },
  { id: 'habit-2', name: '运动 30 分钟', icon: 'Dumbbell' },
  { id: 'habit-3', name: '阅读 30 分钟', icon: 'BookOpen' },
  { id: 'habit-4', name: '早睡早起', icon: 'Moon' },
  { id: 'habit-5', name: '冥想 10 分钟', icon: 'Flower2' },
]

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      // ===== 主题 =====
      theme: 'light',

      toggleTheme: () => {
        set((s) => {
          const next = s.theme === 'light' ? 'dark' : 'light'
          document.documentElement.setAttribute('data-theme', next)
          return { theme: next, background: next === 'dark' ? { type: 'paper' } : s.background }
        })
      },

      // ===== 待办事项 =====
      todos: [],

      addTodo: (text: string) => {
        if (!text.trim()) return
        const todo: Todo = {
          id: generateId(),
          text: text.trim(),
          completed: false,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ todos: [...s.todos, todo] }))
      },

      toggleTodo: (id: string) => {
        set((s) => ({
          todos: s.todos.map((t) =>
            t.id === id
              ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined }
              : t,
          ),
        }))
      },

      deleteTodo: (id: string) => {
        set((s) => ({ todos: s.todos.filter((t) => t.id !== id) }))
      },

      editTodo: (id: string, text: string) => {
        if (!text.trim()) return
        set((s) => ({
          todos: s.todos.map((t) => (t.id === id ? { ...t, text: text.trim() } : t)),
        }))
      },

      // 设置待办提醒时间（HH:mm 或 null 清除）
      setTodoReminder: (id: string, reminderAt: string | null) => {
        set((s) => ({
          todos: s.todos.map((t) => (t.id === id ? { ...t, reminderAt: reminderAt || undefined } : t)),
        }))
      },

      // 拖拽排序：将 fromId 项移动到 toId 项的位置
      reorderTodos: (fromId: string, toId: string) => {
        set((s) => {
          const fromIndex = s.todos.findIndex((t) => t.id === fromId)
          const toIndex = s.todos.findIndex((t) => t.id === toId)
          if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return s
          const newTodos = [...s.todos]
          const [moved] = newTodos.splice(fromIndex, 1)
          newTodos.splice(toIndex, 0, moved)
          return { todos: newTodos }
        })
      },

      // ===== 习惯打卡 =====
      habits: DEFAULT_HABITS,
      habitRecords: {},
      makeupRecords: {},

      addHabit: (name: string, icon?: string) => {
        if (!name.trim()) return
        const habit: Habit = {
          id: generateId(),
          name: name.trim(),
          icon: icon || 'Star',
        }
        set((s) => ({ habits: [...s.habits, habit] }))
      },

      deleteHabit: (id: string) => {
        set((s) => ({
          habits: s.habits.filter((h) => h.id !== id),
          // 同时清理该习惯的打卡记录
          habitRecords: Object.fromEntries(
            Object.entries(s.habitRecords).map(([date, ids]) => [date, ids.filter((hid) => hid !== id)]),
          ),
        }))
      },

      toggleHabitDay: (habitId: string, date: string) => {
        set((s) => {
          const dayRecords = s.habitRecords[date] || []
          const exists = dayRecords.includes(habitId)
          // 判断是否为补签：日期不是今天
          const todayStr = format(new Date(), 'yyyy-MM-dd')
          const isMakeup = date !== todayStr
          // 补签记录单独追踪
          const makeupDayRecords = s.makeupRecords[date] || []
          const newMakeupRecords = { ...s.makeupRecords }
          if (!exists && isMakeup) {
            newMakeupRecords[date] = [...makeupDayRecords, habitId]
          } else if (exists) {
            // 取消打卡时同步清除补签标记
            newMakeupRecords[date] = makeupDayRecords.filter((id) => id !== habitId)
            if (newMakeupRecords[date].length === 0) delete newMakeupRecords[date]
          }
          // 追踪早起打卡（早上 8 点前）—— 成就：晨间诗人
          const now = new Date()
          const isEarly = now.getHours() < 8
          const newEarlyDates = !exists && isEarly && !s.earlyCheckinDates.includes(todayStr)
            ? [...s.earlyCheckinDates, todayStr]
            : s.earlyCheckinDates
          return {
            habitRecords: {
              ...s.habitRecords,
              [date]: exists ? dayRecords.filter((id) => id !== habitId) : [...dayRecords, habitId],
            },
            makeupRecords: newMakeupRecords,
            earlyCheckinDates: newEarlyDates,
          }
        })
      },

      // 计算习惯连续打卡天数（从今天向前推算，补签不计入连续）
      getHabitStreak: (habitId: string) => {
        const { habitRecords, makeupRecords } = get()
        let streak = 0
        const today = new Date()
        for (let i = 0; i < 365; i++) {
          const d = new Date(today)
          d.setDate(d.getDate() - i)
          const dateStr = format(d, 'yyyy-MM-dd')
          // 该日有打卡且不是补签，才算连续
          if (habitRecords[dateStr]?.includes(habitId) && !makeupRecords[dateStr]?.includes(habitId)) {
            streak++
          } else if (i > 0) {
            break
          }
        }
        return streak
      },

      // 获取本周打卡情况（周一到周日），含补签标记
      getWeekRecords: (habitId: string, weekStart: Date) => {
        const { habitRecords, makeupRecords } = get()
        return Array.from({ length: 7 }, (_, i) => {
          const d = new Date(weekStart)
          d.setDate(d.getDate() + i)
          const dateStr = format(d, 'yyyy-MM-dd')
          const done = habitRecords[dateStr]?.includes(habitId) ?? false
          const makeup = makeupRecords[dateStr]?.includes(habitId) ?? false
          return { done, makeup }
        })
      },

      // 获取月度打卡数据
      getMonthData: (habitId: string, year: number, month: number) => {
        const { habitRecords } = get()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        return Array.from({ length: daysInMonth }, (_, i) => ({
          day: i + 1,
          done: habitRecords[format(new Date(year, month, i + 1), 'yyyy-MM-dd')]?.includes(habitId) ?? false,
        }))
      },

      // ===== 快捷链接 =====
      links: [],

      addLink: (name: string, url: string) => {
        if (!name.trim() || !url.trim()) return
        // 自动补全协议
        let finalUrl = url.trim()
        if (!/^https?:\/\//i.test(finalUrl)) {
          finalUrl = 'https://' + finalUrl
        }
        const link: LinkItem = {
          id: generateId(),
          name: name.trim(),
          url: finalUrl,
        }
        set((s) => ({ links: [...s.links, link] }))
      },

      deleteLink: (id: string) => {
        set((s) => ({ links: s.links.filter((l) => l.id !== id) }))
      },

      editLink: (id: string, name: string, url: string) => {
        set((s) => ({
          links: s.links.map((l) => (l.id === id ? { ...l, name: name.trim(), url: url.trim() } : l)),
        }))
      },

      // ===== 快速笔记 =====
      notes: [],
      selectedNoteId: null,

      addNote: () => {
        const id = generateId()
        const note: Note = {
          id,
          title: '新笔记',
          content: '',
          updatedAt: new Date().toISOString(),
        }
        set((s) => ({ notes: [note, ...s.notes], selectedNoteId: id }))
        return id
      },

      deleteNote: (id: string) => {
        set((s) => ({
          notes: s.notes.filter((n) => n.id !== id),
          selectedNoteId: s.selectedNoteId === id ? null : s.selectedNoteId,
        }))
      },

      updateNote: (id: string, data: { title?: string; content?: string }) => {
        set((s) => {
          // 追踪深夜记录（23 点后）—— 成就：深夜抄经人
          const now = new Date()
          const isLate = now.getHours() >= 23
          const todayStr = format(now, 'yyyy-MM-dd')
          const newLateDates = isLate && !s.lateNightNoteDates.includes(todayStr)
            ? [...s.lateNightNoteDates, todayStr]
            : s.lateNightNoteDates
          return {
            notes: s.notes.map((n) =>
              n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n,
            ),
            lateNightNoteDates: newLateDates,
          }
        })
      },

      selectNote: (id: string | null) => {
        set((s) => {
          // 追踪阅读 7 天前的笔记 —— 成就：回头看一眼
          if (id) {
            const note = s.notes.find((n) => n.id === id)
            if (note) {
              const noteDate = new Date(note.updatedAt)
              const now = new Date()
              const diffDays = (now.getTime() - noteDate.getTime()) / (1000 * 60 * 60 * 24)
              if (diffDays >= 7) {
                const todayStr = format(now, 'yyyy-MM-dd')
                if (!s.viewedOldNoteDates.includes(todayStr)) {
                  return { selectedNoteId: id, viewedOldNoteDates: [...s.viewedOldNoteDates, todayStr] }
                }
              }
            }
          }
          return { selectedNoteId: id }
        })
      },

      // ===== 天气 =====
      weatherCity: '北京',
      weatherData: null,

      setWeatherCity: (city: string) => {
        set({ weatherCity: city })
      },

      setWeatherData: (data: WeatherData | null) => {
        set({ weatherData: data })
      },

      // ===== 卡片显隐 & 布局 =====
      hiddenCards: [],
      cardOrder: ['todo', 'habits', 'links', 'pomodoro', 'weekstats', 'calendar', 'notes'],

      toggleCardVisibility: (cardId: string) => {
        set((s) => {
          const hidden = s.hiddenCards.includes(cardId)
            ? s.hiddenCards.filter((id) => id !== cardId)
            : [...s.hiddenCards, cardId]
          return { hiddenCards: hidden }
        })
      },

      setCardOrder: (order: string[]) => {
        set({ cardOrder: order })
      },

      // ===== 背景 =====
      background: { type: 'paper' },

      setBackground: (bg: { type: string; value?: string }) => {
        set({ background: bg })
      },

      // ===== 番茄钟持久化 =====
      pomodoroPreset: 25,
      pomodoroTimeLeft: 25 * 60,
      pomodoroRunning: false,
      pomodoroStartedAt: null,

      setPomodoroState: (s) => {
        set({
          pomodoroPreset: s.preset,
          pomodoroTimeLeft: s.timeLeft,
          pomodoroRunning: s.running,
          pomodoroStartedAt: s.startedAt,
        })
      },

      // ===== 成就追踪 =====
      earlyCheckinDates: [],
      lateNightNoteDates: [],
      viewedOldNoteDates: [],
    }),
    {
      name: 'dashboard_store',
      // 只持久化数据字段，不持久化方法
      partialize: (state) => ({
        theme: state.theme,
        todos: state.todos,
        habits: state.habits,
        habitRecords: state.habitRecords,
        makeupRecords: state.makeupRecords,
        links: state.links,
        notes: state.notes,
        selectedNoteId: state.selectedNoteId,
        weatherCity: state.weatherCity,
        weatherData: state.weatherData,
        hiddenCards: state.hiddenCards,
        cardOrder: state.cardOrder,
        background: state.background,
        pomodoroPreset: state.pomodoroPreset,
        pomodoroTimeLeft: state.pomodoroTimeLeft,
        pomodoroRunning: state.pomodoroRunning,
        pomodoroStartedAt: state.pomodoroStartedAt,
        earlyCheckinDates: state.earlyCheckinDates,
        lateNightNoteDates: state.lateNightNoteDates,
        viewedOldNoteDates: state.viewedOldNoteDates,
      }),
    },
  ),
)

// Vite HMR 保护：模块热替换时保留当前状态，防止 store 被重建为默认值
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    if (newModule) {
      const currentState = useDashboardStore.getState()
      newModule.useDashboardStore.setState(currentState)
    }
  })
}
