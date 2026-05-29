import { useRef, useCallback } from 'react'

interface Props {
  text: string
  /** 磁力强度 1~10 */
  strength: number
  /** 吸引/排斥 */
  mode: 'attract' | 'repel'
}

/**
 * MagneticButton 磁吸按钮 — CSS + JS
 * 按钮受鼠标位置影响，靠近时被吸引（或排斥）偏移
 */
export default function MagneticButton({ text, strength, mode }: Props) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const sign = mode === 'attract' ? 1 : -1

  const handleMove = useCallback((e: React.MouseEvent) => {
    const btn = btnRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) * sign * strength * 0.5
    const dy = (e.clientY - cy) * sign * strength * 0.5
    btn.style.transform = `translate(${dx}px, ${dy}px)`
  }, [strength, sign])

  const handleLeave = useCallback(() => {
    if (btnRef.current) btnRef.current.style.transform = 'translate(0, 0)'
  }, [])

  return (
    <button
      ref={btnRef}
      className="px-8 py-4 rounded-xl text-xl font-bold select-none
                 bg-gradient-to-br from-[#b8a0d4] to-[#f0c060] text-[#0a0a1a]
                 shadow-lg shadow-[#b8a0d4]/30 transition-transform duration-75"
      style={{ willChange: 'transform' }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {text || '磁吸按钮'}
    </button>
  )
}
