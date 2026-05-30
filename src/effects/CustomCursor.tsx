import { useEffect, useRef, useCallback } from 'react'

interface Props {
  size: number; trail: number; color: string
}

interface Dot { x: number; y: number; life: number }

/** Custom Cursor — CSS + JS，自定义光标 + 拖尾粒子 */
export default function CustomCursor({ size, trail, color }: Props) {
  const dotsRef = useRef<Dot[]>([])
  const rafRef = useRef(0)

  const render = useCallback(() => {
    const canvas = document.createElement('canvas')
    canvas.className = 'fixed inset-0 pointer-events-none'; canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;pointer-events:none'
    document.body.appendChild(canvas)
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth; canvas.height = window.innerHeight
    window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight })

    const onMove = (e: MouseEvent) => { dotsRef.current.push({ x: e.clientX, y: e.clientY, life: 1 }) }
    window.addEventListener('mousemove', onMove)

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = dotsRef.current.length - 1; i >= 0; i--) {
        const d = dotsRef.current[i]; d.life -= 0.03
        if (d.life <= 0) { dotsRef.current.splice(i, 1); continue }
        ctx.beginPath(); ctx.arc(d.x, d.y, size * d.life * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = color; ctx.globalAlpha = d.life * 0.6; ctx.fill()
      }
      while (dotsRef.current.length > trail) dotsRef.current.shift()
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('mousemove', onMove); document.body.removeChild(canvas) }
  }, [size, trail, color])

  useEffect(() => { const c = render(); return () => c?.() }, [render])
  return <span className="text-xl font-bold text-[#b8a0d4] select-none">移动鼠标查看自定义光标</span>
}
