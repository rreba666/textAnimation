import { useEffect, useRef, useCallback } from 'react'

interface Props {
  /** 流速 1~5 */
  speed: number
  /** 强度 1~10 */
  intensity: number
  /** 颜色 */
  color: string
}

/**
 * Caustics 焦散 — Canvas
 * 模拟水底光线折射形成的光斑网络，使用叠加正弦波产生流动感
 */
export default function Caustics({ speed, intensity, color }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)
  const timeRef = useRef(0)

  const render = useCallback(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const parent = canvas.parentElement!
    canvas.width = parent.clientWidth; canvas.height = parent.clientHeight

    function draw() {
      timeRef.current += 0.01 * speed
      const t = timeRef.current
      const w = canvas.width, h = canvas.height
      // 用两层正弦波叠加生成焦散纹理
      const step = Math.max(2, 10 - intensity)
      ctx.clearRect(0, 0, w, h)
      for (let x = 0; x < w; x += step) {
        for (let y = 0; y < h; y += step) {
          // 两层正弦波叠加模拟水波干涉
          const v1 = Math.sin(x * 0.02 + t) * Math.cos(y * 0.02 + t * 0.7)
          const v2 = Math.sin(x * 0.03 - t * 1.3) * Math.cos(y * 0.03 + t * 0.5)
          const brightness = (v1 + v2) / 2 // -1~1
          if (brightness > 0.3) {
            const alpha = brightness * 0.5 * intensity * 0.1
            ctx.fillStyle = color
            ctx.globalAlpha = alpha
            ctx.fillRect(x, y, step, step)
          }
        }
      }
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [speed, intensity, color])

  useEffect(() => {
    const cleanup = render()
    return () => { cleanup?.() }
  }, [render])

  return <canvas ref={canvasRef} className="w-full h-full absolute inset-0 rounded-lg" />
}
