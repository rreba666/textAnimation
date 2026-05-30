import { useEffect, useRef, useCallback } from 'react'

interface Props {
  size: number; speed: number; color: string
}

/** Ripple Background — Canvas，点击产生水波扩散 */
export default function RippleBg({ size, speed, color }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ripplesRef = useRef<{ x: number; y: number; r: number; life: number }[]>([])
  const rafRef = useRef(0)

  const render = useCallback(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const parent = canvas.parentElement!
    canvas.width = parent.clientWidth; canvas.height = parent.clientHeight
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect()
      ripplesRef.current.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, r: 0, life: 1 })
      if (rafRef.current) return
      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
          const rp = ripplesRef.current[i]
          rp.life -= 0.015 / speed; rp.r += size * 0.02 * speed
          if (rp.life <= 0) { ripplesRef.current.splice(i, 1); continue }
          ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2)
          ctx.strokeStyle = color; ctx.globalAlpha = rp.life; ctx.lineWidth = 2 * rp.life; ctx.stroke()
        }
        rafRef.current = requestAnimationFrame(draw)
      }
      rafRef.current = requestAnimationFrame(draw)
    })
  }, [size, speed, color])

  useEffect(() => { render() }, [render])
  return (
    <div className="relative w-full h-full cursor-pointer" onClick={() => {}}>
      <canvas ref={canvasRef} className="w-full h-full absolute inset-0 rounded-lg" />
      <div className="flex items-center justify-center h-full select-none pointer-events-none">
        <span className="text-xl font-bold text-[#8888aa]">点击产生水波</span>
      </div>
    </div>
  )
}
