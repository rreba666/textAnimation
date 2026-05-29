import { useMemo } from 'react'

interface Props {
  text: string
  color: string
  /** 反光角度 */
  angle: number
  /** 光泽强度 1~10 */
  shine: number
}

/**
 * Metal 金属质感 — 纯 CSS
 * 多层 linear-gradient 模拟拉丝金属反光带，配合 text-shadow 营造高光
 */
export default function Metal({ text, color, angle, shine }: Props) {
  // 构建金属色阶：暗→亮→暗→亮，模拟多道反光带
  const gradient = useMemo(() => {
    const stops = [
      `${darken(color, 0.6)} 0%`,
      `${lighten(color, 0.3)} 20%`,
      `${darken(color, 0.5)} 30%`,
      `${lighten(color, 0.5)} 45%`,
      `${darken(color, 0.4)} 55%`,
      `${lighten(color, 0.3)} 70%`,
      `${darken(color, 0.6)} 85%`,
      `${lighten(color, 0.2)} 100%`,
    ]
    return `linear-gradient(${angle}deg, ${stops.join(', ')})`
  }, [color, angle])

  return (
    <span
      className="select-none"
      style={{
        fontSize: '3rem',
        fontWeight: 'bold',
        backgroundImage: gradient,
        backgroundSize: '200% 100%',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        textShadow: `${1 + shine * 0.8}px ${1 + shine * 0.8}px ${shine * 2}px rgba(255,255,255,0.15)`,
        filter: `drop-shadow(0 ${shine}px ${shine}px rgba(0,0,0,0.5))`,
      }}
    >
      {text || '金属质感'}
    </span>
  )
}

/** 简单颜色明度调节 */
function darken(hex: string, amount: number): string {
  const r = Math.round(parseInt(hex.slice(1, 3), 16) * (1 - amount))
  const g = Math.round(parseInt(hex.slice(3, 5), 16) * (1 - amount))
  const b = Math.round(parseInt(hex.slice(5, 7), 16) * (1 - amount))
  return `rgb(${r},${g},${b})`
}
function lighten(hex: string, amount: number): string {
  const r = Math.min(255, Math.round(parseInt(hex.slice(1, 3), 16) * (1 + amount)))
  const g = Math.min(255, Math.round(parseInt(hex.slice(3, 5), 16) * (1 + amount)))
  const b = Math.min(255, Math.round(parseInt(hex.slice(5, 7), 16) * (1 + amount)))
  return `rgb(${r},${g},${b})`
}
