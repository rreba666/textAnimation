import { useMemo } from 'react'

interface Props {
  text: string
  /** 滚动距离 100~500 px */
  distance: number
  /** 滚动速度 0.5~5 s */
  speed: number
  /** 滚动方向 */
  direction: 'left' | 'right'
}

/**
 * Roll 滚动效果 — 纯 CSS
 * 文字像轮子一样从侧边旋转滚入，到达位置后停止
 * 使用 translate + rotate 组合动画
 */
export default function Roll({ text, distance, speed, direction }: Props) {
  const animName = useMemo(() => `roll-${uid++}`, [])
  const sign = direction === 'left' ? -1 : 1
  // 滚入距离对应的旋转圈数（弧长 = 半径 * 角度，≈ 文字宽度对应于旋转角度）
  // 简化：distance / (fontSize ~48) * 360 ≈ 每 48px 一圈
  const rotations = Math.round((distance / 50) * 360)

  return (
    <>
      <style>{`@keyframes ${animName} {
  0%   { transform: translateX(${sign * distance}px) rotate(${sign * rotations}deg); opacity: 0; }
  60%  { opacity: 1; }
  100% { transform: translateX(0) rotate(0deg); opacity: 1; }
}`}</style>
      <span
        className="inline-block select-none whitespace-nowrap"
        style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          color: '#f0c060',
          animation: `${animName} ${speed}s ease-out infinite`,
        }}
      >
        {text || '滚动文字'}
      </span>
    </>
  )
}

let uid = 0
