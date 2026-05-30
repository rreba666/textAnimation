import { useRef, useCallback } from 'react'

interface Props {
  text: string; radius: number; intensity: number; color: string
}

/** Hover Glow — CSS + JS，鼠标悬停时光晕跟随 */
export default function HoverGlow({ text, radius, intensity, color }: Props) {
  const elRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)

  const handleMove = useCallback((e: React.MouseEvent) => {
    const el = elRef.current; const glow = glowRef.current; const txt = textRef.current
    if (!el || !glow || !txt) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    glow.style.opacity = '1'
    glow.style.background = `radial-gradient(circle ${radius}px at ${x}px ${y}px, ${color}${Math.round(intensity * 12)}6, transparent 70%)`
    txt.style.textShadow = `0 0 20px ${color}88`
  }, [radius, intensity, color])

  const handleLeave = useCallback(() => {
    if (glowRef.current) glowRef.current.style.opacity = '0'
    if (textRef.current) textRef.current.style.textShadow = 'none'
  }, [])

  return (
    <div ref={elRef} className="relative inline-block select-none px-10 py-6 rounded-xl cursor-pointer overflow-hidden"
      style={{ background: '#1a1a2e', border: '1px solid #2a2a4a' }}
      onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <div ref={glowRef} className="absolute inset-0 transition-opacity duration-200 pointer-events-none"
        style={{ opacity: 0 }} />
      <span ref={textRef} className="relative text-2xl font-bold text-white z-10 transition-all duration-200">
        {text || '悬停光晕'}
      </span>
    </div>
  )
}
