import { useRef, useCallback } from 'react'

interface Props {
  /** 层数 2~6 */
  layers: number
  /** 倾斜角度 5~30 */
  angle: number
  /** 动画速度 1~5 */
  speed: number
}

/**
 * DepthCards 深度卡片 — CSS 3D + JS 鼠标视差
 * 多层卡片在 3D 空间中有不同 translateZ，鼠标移动时各层独立偏移产生景深感
 */
export default function DepthCards({ layers, angle, speed }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  // speed 控制过渡时间：速度越快过渡越短
  const transitionMs = Math.round(200 / speed)

  const handleMove = useCallback((e: React.MouseEvent) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    const cards = el.querySelectorAll<HTMLElement>('.depth-card')
    cards.forEach((card, i) => {
      const factor = (i + 1) * (angle / layers) * 0.8
      card.style.transform = `translateX(${x * factor}px) translateY(${y * factor}px)`
    })
  }, [angle, layers])

  const handleLeave = useCallback(() => {
    const cards = containerRef.current?.querySelectorAll<HTMLElement>('.depth-card')
    cards?.forEach((c) => { c.style.transform = '' })
  }, [])

  const colors = ['#f0c060', '#b8a0d4', '#4ecdc4', '#ff6b6b', '#45b7d1', '#a55eea']

  return (
    <div ref={containerRef} className="relative select-none" style={{ width: 240, height: 150, perspective: 800 }}
         onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {Array.from({ length: layers }, (_, i) => {
        const z = (layers - i) * 20
        const sz = 200 - i * 16
        const h = 120 - i * 12
        return (
          <div key={i} className="depth-card absolute rounded-xl border"
            style={{
              width: sz, height: h,
              left: (240 - sz) / 2, top: (150 - h) / 2,
              background: `${colors[i % colors.length]}15`,
              borderColor: `${colors[i % colors.length]}44`,
              transform: `translateZ(${z}px)`,
              transition: `transform ${transitionMs}ms ease-out`,
              willChange: 'transform',
              zIndex: layers - i,
            }}
          />
        )
      })}
    </div>
  )
}
