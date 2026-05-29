import { useEffect, useRef, useCallback } from 'react'

interface Props {
  /** 粒子数量 50~500 */
  count: number
  /** 移动速度 1~5 */
  speed: number
  /** 粒子颜色 */
  color: string
}

interface Particle { x: number; y: number; vx: number; vy: number; r: number; a: number }

/**
 * ParticleField 粒子场 — Canvas 实现
 * 数百个粒子漂浮流动，鼠标靠近时被吸引/排斥，形成动态星场效果
 */
export default function ParticleField({ count, speed, color }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const rafRef = useRef(0)

  // 初始化粒子池
  const initParticles = useCallback((w: number, h: number) => {
    const arr: Particle[] = []
    for (let i = 0; i < count; i++) {
      arr.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        r: Math.random() * 2.5 + 0.8,
        a: Math.random() * 0.6 + 0.4,
      })
    }
    particlesRef.current = arr
  }, [count, speed])

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const parent = canvas.parentElement!
    const resize = () => { canvas.width = parent.clientWidth; canvas.height = parent.clientHeight; initParticles(canvas.width, canvas.height) }
    resize()
    window.addEventListener('resize', resize)

    const handleMouse = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    canvas.addEventListener('mousemove', handleMouse)
    canvas.addEventListener('mouseleave', () => { mouseRef.current = { x: -9999, y: -9999 } })

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const mx = mouseRef.current.x, my = mouseRef.current.y
      for (const p of particlesRef.current) {
        // 鼠标吸引
        const dx = mx - p.x, dy = my - p.y, dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120) {
          p.vx += (dx / dist) * 0.15; p.vy += (dy / dist) * 0.15
        }
        // 速度衰减
        p.vx *= 0.99; p.vy *= 0.99
        p.x += p.vx; p.y += p.vy
        // 边界循环
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0
        // 绘制
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = color; ctx.globalAlpha = p.a; ctx.fill()
        // 连线（近距离粒子）
        for (const q of particlesRef.current) {
          const d = Math.hypot(p.x - q.x, p.y - q.y)
          if (d < 60) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.strokeStyle = color; ctx.globalAlpha = 0.08; ctx.stroke() }
        }
      }
      rafRef.current = requestAnimationFrame(animate)
    }
    animate()
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize); canvas.removeEventListener('mousemove', handleMouse) }
  }, [color, initParticles])

  return <canvas ref={canvasRef} className="w-full h-full absolute inset-0 rounded-lg" />
}
