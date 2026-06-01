// Zustand 全局状态管理 —— 儿戏的日常手记

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

  // --- 习惯打卡 ---
  habits: Habit[]
  habitRecords: HabitRecords
  addHabit: (name: string, icon?: string) => void
  deleteHabit: (id: string) => void
  toggleHabitDay: (habitId: string, date: string) => void
  getHabitStreak: (habitId: string) => number
  getWeekRecords: (habitId: string, weekStart: Date) => boolean[]
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
          return { theme: next }
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
          todos: s.todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
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

      // ===== 习惯打卡 =====
      habits: DEFAULT_HABITS,
      habitRecords: {},

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
          return {
            habitRecords: {
              ...s.habitRecords,
              [date]: exists ? dayRecords.filter((id) => id !== habitId) : [...dayRecords, habitId],
            },
          }
        })
      },

      // 计算习惯连续打卡天数（从今天向前推算）
      getHabitStreak: (habitId: string) => {
        const { habitRecords } = get()
        let streak = 0
        const today = new Date()
        for (let i = 0; i < 365; i++) {
          const d = new Date(today)
          d.setDate(d.getDate() - i)
          const dateStr = format(d, 'yyyy-MM-dd')
          if (habitRecords[dateStr]?.includes(habitId)) {
            streak++
          } else if (i > 0) {
            // 今天还没打卡不算中断
            break
          }
        }
        return streak
      },

      // 获取本周打卡情况（周一到周日）
      getWeekRecords: (habitId: string, weekStart: Date) => {
        const { habitRecords } = get()
        return Array.from({ length: 7 }, (_, i) => {
          const d = new Date(weekStart)
          d.setDate(d.getDate() + i)
          return habitRecords[format(d, 'yyyy-MM-dd')]?.includes(habitId) ?? false
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
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n,
          ),
        }))
      },

      selectNote: (id: string | null) => {
        set({ selectedNoteId: id })
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
    }),
    {
      name: 'dashboard_store',
      // 只持久化数据字段，不持久化方法
      partialize: (state) => ({
        theme: state.theme,
        todos: state.todos,
        habits: state.habits,
        habitRecords: state.habitRecords,
        links: state.links,
        notes: state.notes,
        selectedNoteId: state.selectedNoteId,
        weatherCity: state.weatherCity,
        weatherData: state.weatherData,
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
