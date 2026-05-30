import { useMemo } from 'react'

interface Props {
  /** 气泡数量 1~6 */
  count: number
  /** 变形速度 1~5 */
  speed: number
  /** 气泡颜色 */
  color: string
}

/** Blob 变形气泡 — SVG feGaussianBlur + feColorMatrix 实现融合变形 */
export default function Blob({ count, speed, color }: Props) {
  const filterId = useMemo(() => `blob-${uid++}`, [])
  const dur = Math.max(2, 10 / speed).toFixed(1)

  // 按 count 生成不同位置和大小的气泡
  const blobs = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      // 用伪随机分布确保不同 count 下气泡位置不重叠
      const seed = i * 137.5 // 黄金角
      const cx = 30 + (seed % 140)
      const cy = 30 + ((seed * 1.7) % 80)
      const rx = 20 + ((seed * 0.7) % 40)
      const ry = 16 + ((seed * 1.1) % 30)
      return { cx, cy, rx, ry, delay: i * 0.8 }
    })
  }, [count])

  return (
    <>
      <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
        <filter id={filterId}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur" />
          <feColorMatrix in="blur" mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -12" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </svg>
      <style>{`@keyframes blob-move {
  0%,100% { transform: translate(0, 0) scale(1); }
  25%  { transform: translate(20px, -15px) scale(1.1); }
  50%  { transform: translate(-10px, 10px) scale(0.95); }
  75%  { transform: translate(-20px, -5px) scale(1.05); }
}`}</style>
      <div className="relative w-full h-full min-h-[160px] flex items-center justify-center overflow-hidden bg-[#0a0a1a]"
           style={{ filter: `url(#${filterId})` }}>
        {blobs.map((b, i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              width: b.rx * 2, height: b.ry * 2,
              left: `${b.cx}%`, top: `${b.cy}%`,
              background: color,
              animation: `blob-move ${dur}s ease-in-out ${b.delay}s infinite alternate`,
            }} />
        ))}
      </div>
    </>
  )
}

let uid = 0
