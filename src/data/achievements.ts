// 勋章数据与检测逻辑 —— 不包含 JSX，可被 App.tsx 轻量导入

import { format } from 'date-fns'
import { useDashboardStore } from '../store/useDashboardStore'

export type Rarity = 'normal' | 'rare' | 'epic' | 'legendary'

export interface BadgeData {
  id: string
  name: string
  cond: string
  desc: string
  target: number
  rarity: Rarity
  iconName: string  // 图标名称字符串，JSX 由各组件自行映射
  current: () => number
}

// 辅助函数：计算日期数组中最长连续天数
function getLongestStreak(dates: string[]): number {
  if (dates.length === 0) return 0
  const sorted = [...new Set(dates)].sort()
  let max = 1, cur = 1
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86400000
    if (Math.round(diff) === 1) { cur++; if (cur > max) max = cur }
    else { cur = 1 }
  }
  return max
}

// 辅助函数：计算连续"只完成 1 个待办"的天数
function getConsecutiveSingleTodoDays(): number {
  const { todos } = useDashboardStore.getState()
  const byDate: Record<string, number> = {}
  for (const t of todos) {
    if (!t.completed || !t.completedAt) continue
    const d = t.completedAt.slice(0, 10)
    byDate[d] = (byDate[d] || 0) + 1
  }
  const dates = Object.entries(byDate)
    .filter(([, c]) => c === 1)
    .map(([d]) => d)
    .sort()
  if (dates.length === 0) return 0
  let max = 1, cur = 1
  for (let i = 1; i < dates.length; i++) {
    const diff = (new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime()) / 86400000
    if (Math.round(diff) === 1) { cur++; if (cur > max) max = cur }
    else { cur = 1 }
  }
  return max
}

export const BADGES: BadgeData[] = [
  {
    id: 'streak7', name: '第七个早安', cond: '连续打卡 7 天', desc: '一周的晨光，你都接住了。',
    target: 7, rarity: 'rare', iconName: 'streak',
    current: () => {
      const { habits, getHabitStreak } = useDashboardStore.getState()
      return habits.length > 0 ? Math.max(...habits.map((h) => getHabitStreak(h.id))) : 0
    },
  },
  {
    id: 'todos100', name: '一百件小事', cond: '完成 100 个待办', desc: '大事轮不到我，但小事被我做完了。',
    target: 100, rarity: 'epic', iconName: 'todo',
    current: () => useDashboardStore.getState().todos.filter((t) => t.completed).length,
  },
  {
    id: 'links10', name: '拾贝', cond: '新增 10 个链接', desc: '小小的收集，不为什么，只是喜欢。',
    target: 10, rarity: 'normal', iconName: 'link',
    current: () => useDashboardStore.getState().links.length,
  },
  {
    id: 'notes20', name: '笔尖漫步', cond: '新增 20 篇笔记', desc: '字迹歪歪扭扭也没关系，你走过的路，笔都记得。',
    target: 20, rarity: 'rare', iconName: 'note',
    current: () => useDashboardStore.getState().notes.length,
  },
  {
    id: 'morning5', name: '晨间诗人', cond: '连续 5 天在早上 8 点前打卡', desc: '你见过早晨的温柔光线。',
    target: 5, rarity: 'rare', iconName: 'morning',
    current: () => getLongestStreak(useDashboardStore.getState().earlyCheckinDates),
  },
  {
    id: 'latenight10', name: '深夜抄经人', cond: '累计 10 次在 23 点后记录', desc: '把心事写进夜里。',
    target: 10, rarity: 'rare', iconName: 'latenight',
    current: () => useDashboardStore.getState().lateNightNoteDates.length,
  },
  {
    id: 'passing3', name: '恰好路过', cond: '连续 3 天只完成 1 个待办', desc: '今天不想努力，也没关系。',
    target: 3, rarity: 'normal', iconName: 'passing',
    current: () => getConsecutiveSingleTodoDays(),
  },
  {
    id: 'skip1', name: '空页允许证', cond: '有一天没有任何打卡', desc: '空白也是一种记录。',
    target: 1, rarity: 'normal', iconName: 'empty',
    current: () => {
      const { habitRecords } = useDashboardStore.getState()
      const dates = Object.keys(habitRecords)
      if (dates.length === 0) return 0
      const sorted = dates.sort()
      const start = new Date(sorted[0])
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      for (let d = new Date(start); d <= yesterday; d.setDate(d.getDate() + 1)) {
        const key = format(d, 'yyyy-MM-dd')
        if (!habitRecords[key] || habitRecords[key].length === 0) return 1
      }
      return 0
    },
  },
  {
    id: 'lookback1', name: '回头看一眼', cond: '阅读自己 7 天前的笔记', desc: '你看，那时候的你也很认真。',
    target: 1, rarity: 'normal', iconName: 'lookback',
    current: () => useDashboardStore.getState().viewedOldNoteDates.length,
  },
  {
    id: 'master6', name: '手账小当家', cond: '同时拥有以上任意 6 个勋章', desc: '你把日子过成了一本书。',
    target: 6, rarity: 'legendary', iconName: 'master',
    current: () => {
      const allIds = BADGES.filter((b) => b.id !== 'master6').map((b) => b.id)
      return allIds.filter((id) => isEarned(id)).length
    },
  },
]

export function isEarned(id: string) {
  return localStorage.getItem(`achievement_${id}`) === '1'
}

export function getEarnedTime(id: string): string | null {
  return localStorage.getItem(`achievement_${id}_time`)
}

// 模块级变量：本次会话中新获得的勋章 ID
export const newlyEarnedInSession = new Set<string>()

/** 检查是否达成新成就，调用方需自行处理通知 */
export function checkAchievementsRaw(): BadgeData[] {
  const earned = (id: string) => localStorage.getItem(`achievement_${id}`) === '1'
  const result: BadgeData[] = []
  BADGES.forEach((b) => {
    if (earned(b.id)) return
    if (newlyEarnedInSession.has(b.id)) return
    if (b.current() < b.target) return
    newlyEarnedInSession.add(b.id)
    localStorage.setItem(`achievement_${b.id}`, '1')
    localStorage.setItem(`achievement_${b.id}_time`, new Date().toISOString())
    result.push(b)
  })
  return result
}
