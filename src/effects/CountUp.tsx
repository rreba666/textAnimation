import { useEffect, useState } from 'react'

interface Props {
  /** 起始值 */
  from: number
  /** 目标值 */
  to: number
  /** 动画速度 1~5 */
  speed: number
}

/** Count Up — JS 数字滚动计数 */
export default function CountUp({ from, to, speed }: Props) {
  const [display, setDisplay] = useState(from)

  useEffect(() => {
    const range = to - from; const step = Math.max(1, Math.abs(range) / (40 / speed))
    let raf = 0
    function tick() {
      setDisplay((prev) => {
        const sign = range > 0 ? 1 : -1
        const next = prev + step * sign
        if ((sign > 0 && next >= to) || (sign < 0 && next <= to)) { cancelAnimationFrame(raf); return to }
        raf = requestAnimationFrame(tick)
        return next
      })
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [from, to, speed])

  // 添加千分位分隔符
  const formatted = Math.round(display).toLocaleString()

  return (
    <div className="flex items-center justify-center select-none">
      <span className="text-5xl font-bold text-[#f0c060] tabular-nums"
            style={{ textShadow: '0 0 20px rgba(240,192,96,0.3)', fontVariantNumeric: 'tabular-nums' }}>
        {formatted}
      </span>
    </div>
  )
}
