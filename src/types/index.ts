// 类型定义 —— 儿戏的日常手记

/** 待办事项 */
export interface Todo {
  id: string
  text: string
  completed: boolean
  completedAt?: string // 完成时间（ISO），未完成时为 undefined
  createdAt: string // ISO 日期字符串
}

/** 笔记 */
export interface Note {
  id: string
  title: string
  content: string
  updatedAt: string // ISO 日期字符串
}

/** 习惯 */
export interface Habit {
  id: string
  name: string
  icon: string // 图标名称（lucide-react 图标名）
}

/** 快捷链接 */
export interface LinkItem {
  id: string
  name: string
  url: string
}

/** 打卡记录：日期 -> 习惯ID数组 */
export type HabitRecords = Record<string, string[]>

/** 筛选类型 */
export type FilterType = 'all' | 'active' | 'completed'

/** 天气预报单日数据 */
export interface ForecastDay {
  date: string
  tempMin: number
  tempMax: number
  wmoCode: number // WMO 天气代码
  description: string
}

/** 天气数据（含缓存时间戳） */
export interface WeatherData {
  city: string
  temp: number
  description: string
  wmoCode: number // WMO 天气代码
  humidity: number
  windSpeed: number
  forecast: ForecastDay[]
  timestamp: number // 缓存时间戳
}
