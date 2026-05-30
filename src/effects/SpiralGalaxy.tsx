import { useEffect, useRef, useCallback } from 'react'

interface Props {
  /** 粒子数 100~500 */
  particles: number
  /** 旋转速度 1~5 */
  speed: number
  /** 色调 */
  color: string
}

interface Star { angle: number; radius: number; r: number; a: number; speed: number }

/**
 * SpiralGalaxy 螺旋星系 — Canvas
 * 粒子绕中心螺旋旋转，半径越大的越慢，模拟银河系旋臂
 */
export default function SpiralGalaxy({ particles, speed, color }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)

  const render = useCallback(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const parent = canvas.parentElement!
    canvas.width = parent.clientWidth; canvas.height = parent.clientHeight
    const cx = canvas.width / 2, cy = canvas.height / 2, maxR = Math.min(cx, cy) * 0.8

    // 生成螺旋粒子：随机半径 + 对应初始角度（螺旋分布）
    const stars: Star[] = Array.from({ length: particles }, () => {
      const radius = Math.random() * maxR
      return {
        radius,
        angle: Math.random() * Math.PI * 2 + radius * 0.05, // 螺旋偏移
        r: Math.random() * 1.5 + 0.3,
        a: Math.random() * 0.6 + 0.2,
        speed: (1 - radius / maxR) * 0.03 * speed + 0.001,
      }
    })

    let frame = 0
    function draw() {
      frame++
      ctx.fillStyle = 'rgba(5,5,20,0.15)'; ctx.fillRect(0, 0, canvas.width, canvas.height)
      for (const s of stars) {
        s.angle += s.speed
        const x = cx + Math.cos(s.angle) * s.radius
        const y = cy + Math.sin(s.angle) * s.radius
        ctx.beginPath(); ctx.arc(x, y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = color; ctx.globalAlpha = s.a; ctx.fill()
        // 中心亮光
        if (s.radius < maxR * 0.15) {
          ctx.beginPath(); ctx.arc(x, y, s.r * 0.5, 0, Math.PI * 2)
          ctx.fillStyle = '#fff'; ctx.globalAlpha = s.a * 0.8; ctx.fill()
        }
      }
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [particles, speed, color])

  useEffect(() => {
    const cleanup = render()
    return () => { cleanup?.() }
  }, [render])

  return <canvas ref={canvasRef} className="w-full h-full absolute inset-0 rounded-lg" />
}
