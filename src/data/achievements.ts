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
    current: () => useDashboardStore.getState().totalTodoCompleted,
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
  // ---- 待办累计类 ----
  {
    id: 'todos200', name: '两百个日常', cond: '累计完成 200 个待办', desc: '两百个小勾勾，拼成一个大大的日子。',
    target: 200, rarity: 'epic', iconName: 'todos200',
    current: () => useDashboardStore.getState().totalTodoCompleted,
  },
  {
    id: 'todos500', name: '五百步', cond: '累计完成 500 个待办', desc: '每一步都很小，但回头看已经走了很远。',
    target: 500, rarity: 'legendary', iconName: 'todos500',
    current: () => useDashboardStore.getState().totalTodoCompleted,
  },
  {
    id: 'todos1000', name: '千帆过', cond: '累计完成 1000 个待办', desc: '一千件小事，你是自己生活的船长。',
    target: 1000, rarity: 'legendary', iconName: 'todos1000',
    current: () => useDashboardStore.getState().totalTodoCompleted,
  },
  // ---- 链接累计类 ----
  {
    id: 'links20', name: '二十枚书签', cond: '新增 20 个链接', desc: '你又捡起了二十片海。',
    target: 20, rarity: 'rare', iconName: 'links20',
    current: () => useDashboardStore.getState().links.length,
  },
  {
    id: 'links50', name: '半百收藏家', cond: '新增 50 个链接', desc: '你的贝壳，已经装满半个小盒子了。',
    target: 50, rarity: 'epic', iconName: 'links50',
    current: () => useDashboardStore.getState().links.length,
  },
  {
    id: 'links100', name: '百宝箱', cond: '新增 100 个链接', desc: '一百次弯腰，世界给了你一百颗糖。',
    target: 100, rarity: 'legendary', iconName: 'links100',
    current: () => useDashboardStore.getState().links.length,
  },
  // ---- 连续打卡类 ----
  {
    id: 'streak15', name: '半个月亮', cond: '连续打卡 15 天', desc: '十五个日出日落，你都在。',
    target: 15, rarity: 'epic', iconName: 'streak15',
    current: () => {
      const { habits, getHabitStreak } = useDashboardStore.getState()
      return habits.length > 0 ? Math.max(...habits.map((h) => getHabitStreak(h.id))) : 0
    },
  },
  {
    id: 'streak30', name: '满月', cond: '连续打卡 30 天', desc: '一个月圆一次，你圆满了一回。',
    target: 30, rarity: 'legendary', iconName: 'streak30',
    current: () => {
      const { habits, getHabitStreak } = useDashboardStore.getState()
      return habits.length > 0 ? Math.max(...habits.map((h) => getHabitStreak(h.id))) : 0
    },
  },
  {
    id: 'habit90', name: '四季如约', cond: '累计打卡 90 天', desc: '一个季节过去了，你没有走散。',
    target: 90, rarity: 'epic', iconName: 'habit90',
    current: () => useDashboardStore.getState().totalHabitCheckDays,
  },
  // ---- 补签类 ----
  {
    id: 'makeup3', name: '缝缝补补', cond: '补打卡成功 3 次', desc: '没有掉队，只是晚到一点。',
    target: 3, rarity: 'normal', iconName: 'makeup3',
    current: () => {
      const { makeupRecords } = useDashboardStore.getState()
      let count = 0
      Object.values(makeupRecords).forEach((ids) => { count += ids.length })
      return count
    },
  },
  {
    id: 'makeup10', name: '慢一拍也没关系', cond: '补打卡成功 10 次', desc: '迟到但没缺席，已经很了不起。',
    target: 10, rarity: 'rare', iconName: 'makeup10',
    current: () => {
      const { makeupRecords } = useDashboardStore.getState()
      let count = 0
      Object.values(makeupRecords).forEach((ids) => { count += ids.length })
      return count
    },
  },
  // ---- 自我照顾类 ----
  {
    id: 'selfcare10', name: '一碗粥', cond: '完成 10 次自我照顾类习惯（喝水/运动/早睡/冥想）', desc: '温温的，稳稳的。',
    target: 10, rarity: 'normal', iconName: 'selfcare10',
    current: () => {
      const { habits, habitRecords } = useDashboardStore.getState()
      const careHabits = habits.filter((h) =>
        ['喝水', '运动', '早睡', '冥想', '咖啡', '阅读'].some((kw) => h.name.includes(kw))
      )
      let count = 0
      careHabits.forEach((h) => {
        Object.values(habitRecords).forEach((ids) => { if (ids.includes(h.id)) count++ })
      })
      return count
    },
  },
  {
    id: 'selfcare30', name: '照顾自己', cond: '完成 30 次自我照顾类习惯打卡', desc: '你把温柔，先给了自己。',
    target: 30, rarity: 'rare', iconName: 'selfcare30',
    current: () => {
      const { habits, habitRecords } = useDashboardStore.getState()
      const careHabits = habits.filter((h) =>
        ['喝水', '运动', '早睡', '冥想', '咖啡', '阅读', '音乐', '阳光'].some((kw) => h.name.includes(kw))
      )
      let count = 0
      careHabits.forEach((h) => {
        Object.values(habitRecords).forEach((ids) => { if (ids.includes(h.id)) count++ })
      })
      return count
    },
  },
  // ---- 心情 + 坚持类 ----
  {
    id: 'rainy3', name: '雨天也有伞', cond: '连续 3 天心情低落但仍完成至少 1 件待办', desc: '难过的日子，你也没有丢下自己。',
    target: 3, rarity: 'epic', iconName: 'rainy3',
    current: () => {
      const { moodRecords, todos } = useDashboardStore.getState()
      const sorted = Object.keys(moodRecords).sort()
      let max = 0, cur = 0
      for (const date of sorted) {
        if (moodRecords[date] === 'sad') {
          const hasTodo = todos.some((t) => t.completed && t.completedAt?.startsWith(date))
          if (hasTodo) { cur++; if (cur > max) max = cur }
          else cur = 0
        } else { cur = 0 }
      }
      return max
    },
  },
  {
    id: 'cloudy5', name: '今天多云', cond: '记录心情为一般/低落但仍完成至少1件待办，累计5次', desc: '不是每天都要晴朗，撑伞走过也很棒。',
    target: 5, rarity: 'rare', iconName: 'cloudy5',
    current: () => {
      const { moodRecords, todos } = useDashboardStore.getState()
      let count = 0
      Object.entries(moodRecords).forEach(([date, mood]) => {
        if (mood === 'calm' || mood === 'sad' || mood === 'tired') {
          if (todos.some((t) => t.completed && t.completedAt?.startsWith(date))) count++
        }
      })
      return count
    },
  },
  {
    id: 'rest3', name: '允许自己停下来', cond: '主动休息一天（未完成任何待办），累计3次', desc: '停下来，不是在后退。',
    target: 3, rarity: 'rare', iconName: 'rest3',
    current: () => {
      const { todos } = useDashboardStore.getState()
      // 统计有过待办但当天一个都没完成的日期数
      const allDates = new Set<string>()
      todos.forEach((t) => { if (t.createdAt) allDates.add(t.createdAt.slice(0, 10)) })
      if (allDates.size === 0) return 0
      const completedDates = new Set<string>()
      todos.forEach((t) => { if (t.completedAt) completedDates.add(t.completedAt.slice(0, 10)) })
      let count = 0
      allDates.forEach((d) => { if (!completedDates.has(d)) count++ })
      return count
    },
  },
  {
    id: 'tears1', name: '泪痕干了', cond: '记录心情低落但次日恢复打卡', desc: '昨天很难，今天你还在。',
    target: 1, rarity: 'rare', iconName: 'tears1',
    current: () => {
      const { moodRecords, habitRecords } = useDashboardStore.getState()
      const sorted = Object.keys(moodRecords).sort()
      for (let i = 0; i < sorted.length - 1; i++) {
        const date = sorted[i], next = sorted[i + 1]
        if (moodRecords[date] === 'sad' && habitRecords[next] && habitRecords[next].length > 0) return 1
      }
      return 0
    },
  },
  {
    id: 'forgive5', name: '小小的原谅', cond: '进行5次补卡', desc: '没做完也没关系，明天继续。',
    target: 5, rarity: 'normal', iconName: 'forgive5',
    current: () => {
      const { makeupRecords } = useDashboardStore.getState()
      let count = 0
      Object.values(makeupRecords).forEach((ids) => { count += ids.length })
      return count
    },
  },
  {
    id: 'blank5', name: '空白许可证', cond: '主动跳过一天且不补卡，累计5次', desc: '你学会了和空白相处，那是很难的一课。',
    target: 5, rarity: 'epic', iconName: 'blank5',
    current: () => {
      const { habitRecords, makeupRecords } = useDashboardStore.getState()
      const dates = Object.keys(habitRecords)
      if (dates.length === 0) return 0
      const sorted = dates.sort()
      const start = new Date(sorted[0])
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      let count = 0
      for (let d = new Date(start); d <= yesterday; d.setDate(d.getDate() + 1)) {
        const key = format(d, 'yyyy-MM-dd')
        if ((!habitRecords[key] || habitRecords[key].length === 0) && (!makeupRecords[key] || makeupRecords[key].length === 0)) count++
      }
      return count
    },
  },
  {
    id: 'goodnight5', name: '晚安信号', cond: '连续5天在22:00-00:00之间完成一件待办', desc: '今天可以安心睡了。',
    target: 5, rarity: 'rare', iconName: 'goodnight5',
    current: () => {
      const { todos } = useDashboardStore.getState()
      const nightTodos = todos
        .filter((t) => t.completedAt)
        .map((t) => {
          const h = new Date(t.completedAt!).getHours()
          const date = t.completedAt!.slice(0, 10)
          return { date, night: h >= 22 || h === 0 }
        })
      const dates = [...new Set(nightTodos.filter((t) => t.night).map((t) => t.date))].sort()
      if (dates.length === 0) return 0
      let max = 1, cur = 1
      for (let i = 1; i < dates.length; i++) {
        const diff = (new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime()) / 86400000
        if (Math.round(diff) === 1) { cur++; if (cur > max) max = cur }
        else cur = 1
      }
      return max
    },
  },
  // ---- 特殊模式类 ----
  {
    id: 'symmetry1', name: '对称日', cond: '在日期对称的日子打卡', desc: '今天左右对称，你也刚刚好。',
    target: 1, rarity: 'rare', iconName: 'symmetry1',
    current: () => {
      const { habitRecords } = useDashboardStore.getState()
      const today = format(new Date(), 'yyyy-MM-dd')
      const parts = today.split('-')
      // 月=日 或 月日对称（如 02-02, 11-11, 12-21）
      const md = parts[1] + parts[2]
      const isSymmetric = parts[1] === parts[2] || md === md.split('').reverse().join('')
      return isSymmetric && habitRecords[today] && habitRecords[today].length > 0 ? 1 : 0
    },
  },
  {
    id: 'midnight10', name: '深夜模式', cond: '累计10次在0点后打开页面', desc: '有人失眠时，你在和自己说话。',
    target: 10, rarity: 'rare', iconName: 'midnight10',
    current: () => useDashboardStore.getState().lateNightVisits,
  },
  // ---- 里程碑类 ----
  {
    id: 'oneyear1', name: '一周年', cond: '使用满 365 天', desc: '一年了，日子没有白过。',
    target: 365, rarity: 'legendary', iconName: 'oneyear1',
    current: () => {
      const first = localStorage.getItem('re_first_visit_date')
      if (!first) return 0
      return Math.floor((Date.now() - new Date(first).getTime()) / 86400000)
    },
  },
  {
    id: 'perfect1', name: '完美一日', cond: '某天完成所有待办 + 新增 1 条笔记 + 新增 1 个链接', desc: '这一天，你什么也没落下。',
    target: 1, rarity: 'epic', iconName: 'perfect1',
    current: () => {
      const { todos, notes, links } = useDashboardStore.getState()
      const activeTodos = todos.filter((t) => !t.completed)
      if (activeTodos.length > 0) return 0
      // 检查是否存在同一天：所有待办完成 + 有笔记 + 有链接
      const completedDates = new Set(todos.filter((t) => t.completedAt).map((t) => t.completedAt!.slice(0, 10)))
      const noteDates = new Set(notes.map((n) => n.updatedAt.slice(0, 10)))
      // 链接没有日期，放宽条件：当天有完成待办 + 有新增笔记
      for (const date of completedDates) {
        if (noteDates.has(date) && links.length > 0) return 1
      }
      return 0
    },
  },
  {
    id: 'badge15', name: '奖状角', cond: '累计获得15个勋章', desc: '贴满了一面墙的小骄傲。',
    target: 15, rarity: 'legendary', iconName: 'badge15',
    current: () => {
      const allIds = BADGES.filter((b) => b.id !== 'badge15').map((b) => b.id)
      return allIds.filter((id) => isEarned(id)).length
    },
  },
  // ---- 元勋章 ----
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
