import { useEffect, useState, useMemo } from 'react'

interface Props {
  /** 进度 0~100 */
  value: number
  /** 动画速度 1~5 */
  speed: number
  /** 进度环颜色 */
  color: string
}

/** Circular Progress — SVG 环形进度条 */
export default function CircularProgress({ value, speed, color }: Props) {
  const [display, setDisplay] = useState(0)
  const r = 45; const circ = 2 * Math.PI * r

  // 动画过渡到目标值
  useEffect(() => {
    let raf = 0; const step = 1.5 * speed
    function tick() {
      setDisplay((prev) => {
        const next = prev + step
        if (next >= value) { cancelAnimationFrame(raf); return value }
        raf = requestAnimationFrame(tick)
        return next
      })
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, speed])

  const offset = useMemo(() => circ - (display / 100) * circ, [display, circ])

  return (
    <div className="flex items-center justify-center gap-4 select-none">
      <svg width="120" height="120" viewBox="0 0 100 100">
        {/* 背景轨道 */}
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1a1a2e" strokeWidth="6" />
        {/* 进度弧 */}
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: `stroke-dashoffset 0.05s linear`, transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
        {/* 中心文字 */}
        <text x="50" y="54" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#fff">
          {Math.round(display)}%
        </text>
      </svg>
    </div>
  )
}
