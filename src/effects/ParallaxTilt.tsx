import { useRef, useCallback } from 'react'

interface Props {
  text: string
  /** 倾斜角度 5~45 deg */
  angle: number
  /** 透视距离 200~1000 */
  perspective: number
}

/**
 * ParallaxTilt 倾斜视差 — CSS 3D
 * 元素随鼠标位置在 3D 空间倾斜，模拟视差深度
 */
export default function ParallaxTilt({ text, angle, perspective }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMove = useCallback((e: React.MouseEvent) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * angle * 2
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -angle * 2
    card.style.transform = `perspective(${perspective}px) rotateX(${y}deg) rotateY(${x}deg)`
  }, [angle, perspective])

  const handleLeave = useCallback(() => {
    if (cardRef.current) cardRef.current.style.transform = `perspective(${perspective}px) rotateX(0) rotateY(0)`
  }, [perspective])

  return (
    <div
      ref={cardRef}
      className="px-10 py-8 rounded-xl select-none transition-transform duration-100
                 bg-gradient-to-br from-[#1a1a2e] to-[#2a2a4a] border border-[#3a3a5a]
                 shadow-xl"
      style={{ willChange: 'transform', transformStyle: 'preserve-3d' }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div className="text-2xl font-bold text-[#f0c060]" style={{ transform: 'translateZ(30px)' }}>
        {text || '倾斜视差'}
      </div>
      <div className="text-sm text-[#8888aa] mt-2" style={{ transform: 'translateZ(15px)' }}>
        移动鼠标体验 3D 倾斜
      </div>
    </div>
  )
}
