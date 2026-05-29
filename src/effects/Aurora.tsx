import { useMemo } from 'react'

interface Props {
  text: string
  /** 流速 1~5 */
  speed: number
  /** 带宽 1~10 */
  width: number
}

/**
 * Aurora 极光效果 — 纯 CSS
 * 青绿蓝紫渐变在文字表面流淌，模拟北极光
 * background-clip + 大尺寸渐变 + 位移动画
 */
export default function Aurora({ text, speed, width }: Props) {
  const animName = useMemo(() => `aurora-${uid++}`, [])
  const bandWidth = width * 30

  // 极光色带：绿→青→蓝→紫
  const colors = [
    '#00ff88', // 翠绿
    '#00e5ff', // 青
    '#4488ff', // 蓝
    '#aa44ff', // 紫
    '#00ff88', // 循环回绿
  ]

  return (
    <>
      <style>{`@keyframes ${animName} {
  0%   { background-position: 0% 50%; }
  100% { background-position: ${bandWidth * 2}px 50%; }
}`}</style>
      <span
        className="select-none"
        style={{
          fontSize: '3rem', fontWeight: 'bold',
          backgroundImage: `linear-gradient(90deg, ${colors.join(', ')})`,
          backgroundSize: `${bandWidth * 2}px 100%`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          textShadow: '0 0 20px rgba(0,255,136,0.3)',
          filter: 'brightness(1.2)',
          animation: `${animName} ${speed}s linear infinite`,
        }}
      >
        {text || '极光文字'}
      </span>
    </>
  )
}

let uid = 0
