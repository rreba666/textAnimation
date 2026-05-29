import { useMemo } from 'react'

interface Props {
  /** 光球数量 2~8 */
  count: number
  /** 移动速度 1~5 */
  speed: number
  /** 模糊半径 20~100 */
  blur: number
}

/**
 * GradientOrb 渐变光球 — 纯 CSS 实现
 * 多个彩色大光球在背景中缓慢漂移融合，使用 blur + 补间动画
 */
export default function GradientOrb({ count, speed, blur }: Props) {
  // 预定义柔和颜色池
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#a55eea', '#ff9a76', '#6c5ce7', '#00d2d3']
  const dur = Math.max(2, 8 / speed).toFixed(1)

  const orbs = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      color: colors[i % colors.length],
      size: 120 + (i * 47) % 160,
      x1: (i * 23 + 10) % 100, y1: (i * 17 + 5) % 100,
      x2: (i * 31 + 40) % 100, y2: (i * 13 + 60) % 100,
      delay: i * 0.7,
    }))
  }, [count])

  return (
    <>
      <style>{`@keyframes orb-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25%  { transform: translate(30px, -20px) scale(1.15); }
  50%  { transform: translate(-10px, 25px) scale(0.95); }
  75%  { transform: translate(-25px, -10px) scale(1.1); }
}`}</style>
      <div className="w-full h-full absolute inset-0 rounded-lg overflow-hidden bg-[#0a0a1a]">
        {orbs.map((orb, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: orb.size, height: orb.size,
              left: `${orb.x1}%`, top: `${orb.y1}%`,
              background: orb.color,
              filter: `blur(${blur}px)`,
              opacity: 0.5,
              animation: `orb-float ${dur}s ease-in-out ${orb.delay}s infinite alternate`,
            }}
          />
        ))}
      </div>
    </>
  )
}
