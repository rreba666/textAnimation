import { useCallback, useRef } from 'react'

interface Props {
  text: string
  /** 光斑大小 50~300 px */
  size: number
  /** 光斑颜色 */
  color: string
}

/**
 * Spotlight 聚光灯效果 — CSS + JS 鼠标追踪
 * 利用 CSS radial-gradient 配合自定义属性 --x/--y 实现鼠标跟随
 * React 的 onMouseMove 更新 CSS 变量，GPU 加速的 transform 确保流畅
 */
export default function Spotlight({ text, size, color }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  // 鼠标移动时更新 CSS 自定义属性，GSAP-free 实现
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    e.currentTarget.style.setProperty('--spot-x', `${x}px`)
    e.currentTarget.style.setProperty('--spot-y', `${y}px`)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative inline-block select-none"
      style={{ fontSize: '3rem', fontWeight: 'bold' }}
      onMouseMove={handleMouseMove}
    >
      {/* 底层：暗色文字 */}
      <span style={{ color: '#333', userSelect: 'none' }}>{text || '移动鼠标...'}</span>
      {/* 顶层：被光斑裁剪的亮色文字 — 使用 background-clip: text */}
      <span
        className="absolute inset-0"
        style={{
          color: 'transparent',
          backgroundImage: `radial-gradient(circle ${size}px at var(--spot-x, 50%) var(--spot-y, 50%), ${color} 0%, #f0c060 30%, transparent 70%)`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          userSelect: 'none',
        }}
      >
        {text || '移动鼠标...'}
      </span>
    </div>
  )
}
