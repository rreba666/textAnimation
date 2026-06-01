// 昼夜问候组件 —— 根据时段显示不同的问候语和图标

import { Sunrise, Sun, Coffee, CloudSun, Moon, MoonStar } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface GreetingData {
  text: string
  Icon: LucideIcon
}

/** 根据当前小时返回对应的问候语和图标 */
function getGreeting(): GreetingData {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 8)  return { text: '早安', Icon: Sunrise }
  if (hour >= 8 && hour < 11) return { text: '早上好', Icon: Sun }
  if (hour >= 11 && hour < 13) return { text: '午安', Icon: Sun }
  if (hour >= 13 && hour < 18) return { text: '下午好', Icon: Coffee }
  if (hour >= 18 && hour < 20) return { text: '傍晚好', Icon: CloudSun }
  if (hour >= 20 && hour < 24) return { text: '晚安', Icon: Moon }
  return { text: '夜深了', Icon: MoonStar }
}

export default function Greeting() {
  const { text, Icon } = getGreeting()
  return (
    <span className="flex items-center gap-1.5 text-text-primary font-medium">
      <Icon size={20} className="text-warm-orange shrink-0" />
      <span>{text}</span>
    </span>
  )
}
