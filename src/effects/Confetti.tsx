import { useCallback, useRef, useEffect } from 'react'

interface Props {
  /** 彩带数量 20~200 */
  count: number
  /** 扩散范围 50~300 */
  spread: number
  /** 下落速度 1~5 */
  speed: number
}

interface Particle {
  x: number; y: number; vx: number; vy: number
  w: number; h: number; color: string
  rot: number; rv: number; life: number
  isCircle: boolean; wobble: number; wobbleSpeed: number
}

/**
 * Confetti 彩带爆裂 — Canvas，点击触发
 * 点击后粒子从点击位置爆裂喷射，受重力下落，带旋转、摆动和颜色渐变
 * 支持连续点击叠加粒子，避免旧 RAF 残留
 */
export default function Confetti({ count, spread, speed }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef(0)

  const colors = ['#ff6b6b', '#f0c060', '#4ecdc4', '#b8a0d4', '#ff9a76',
                   '#45b7d1', '#a55eea', '#ffe66d', '#ff88cc', '#00d2d3']

  // 持续驱动 RAF（不是"首次启动"模式）
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const parent = canvas.parentElement!
    const resize = () => { canvas.width = parent.clientWidth; canvas.height = parent.clientHeight }
    resize()
    window.addEventListener('resize', resize)

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const arr = particlesRef.current
      for (let i = arr.length - 1; i >= 0; i--) {
        const p = arr[i]
        p.life -= 0.005 * speed
        if (p.life <= 0) { arr.splice(i, 1); continue }
        // 重力 + 空气阻力
        p.vy += 0.25 * speed
        p.vx *= 0.995
        p.x += p.vx
        p.y += p.vy
        p.rot += p.rv
        // 水平摆动
        p.wobble += p.wobbleSpeed
        const wx = Math.sin(p.wobble) * 3
        // 尺寸随生命衰减
        const scale = p.life
        ctx.save()
        ctx.translate(p.x + wx, p.y)
        ctx.rotate((p.rot * Math.PI) / 180)
        ctx.scale(scale, scale)
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        if (p.isCircle) {
          ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill()
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        }
        ctx.restore()
      }
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [speed])

  const burst = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    // 从点击位置爆发
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top

    const newParticles: Particle[] = Array.from({ length: count }, () => {
      // 随机角度发射，初始速度更大
      const angle = Math.random() * Math.PI * 2
      const power = spread * (0.3 + Math.random() * 0.7) * 0.25
      return {
        x: cx, y: cy,
        vx: Math.cos(angle) * power * (0.5 + Math.random()),
        vy: Math.sin(angle) * power * (0.5 + Math.random()) - spread * 0.08,
        w: Math.random() * 12 + 6,
        h: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * 360,
        rv: (Math.random() - 0.5) * 15,
        life: 1,
        isCircle: Math.random() > 0.65,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.02 + Math.random() * 0.08,
      }
    })
    particlesRef.current.push(...newParticles)
  }, [count, spread, speed])

  return (
    <div className="relative w-full h-full cursor-pointer" onClick={burst}>
      <canvas ref={canvasRef} className="w-full h-full absolute inset-0 rounded-lg pointer-events-none" />
      <div className="flex items-center justify-center h-full select-none">
        <span className="text-2xl font-bold text-[#f0c060] pointer-events-none">点击任意位置放彩带</span>
      </div>
    </div>
  )
}
