import { useMemo } from 'react'

interface Props {
  text: string
  /** 扭转角度 10~180 deg */
  angle: number
  /** 扭转速度 1~5 */
  speed: number
}

/**
 * Twist 扭转效果 — 纯 CSS 3D
 * 每个字符独立 rotateY，角度从中心向两端梯度递减
 * 动画整体扭转来回，模拟麻花旋转
 */
export default function Twist({ text, angle, speed }: Props) {
  const displayText = text || '扭转文字'
  const chars = Array.from(displayText)
  const center = (chars.length - 1) / 2
  const dur = Math.max(0.5, 3 / speed).toFixed(2)
  const animName = useMemo(() => `twist-${uid++}`, [])

  return (
    <>
      <style>{`@keyframes ${animName} {
  0%, 100% { transform: rotateY(0deg); }
  50% { transform: rotateY(${angle}deg); }
}`}</style>
      <span className="inline-flex flex-wrap justify-center select-none"
            style={{ fontSize: '3rem', fontWeight: 'bold', color: '#f0c060', perspective: '600px' }}>
        {chars.map((char, i) => {
          // 越靠近中间，扭转幅度越大
          const factor = 1 - Math.abs(i - center) / (center + 1)
          return (
            <span key={i} className="inline-block"
              style={{
                whiteSpace: char === ' ' ? 'pre' : 'normal',
                animation: `${animName} ${dur}s ease-in-out infinite`,
                // 每个字符按位置缩放角度
                transform: `rotateY(${angle * factor}deg)`,
                animationDelay: `${i * 0.05}s`,
              }}>
              {char}
            </span>
          )
        })}
      </span>
    </>
  )
}

let uid = 0
