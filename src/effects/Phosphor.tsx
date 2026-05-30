import { useMemo } from 'react'

interface Props {
  text: string
  trail: number
  speed: number
  color?: string
}

/**
 * Phosphor 磷光拖尾 — 纯 CSS
 * 多层延迟跟随的 text-shadow 模拟 CRT 磷光残影
 * 文字水平往复移动，身后留下逐渐淡出的彩色拖尾
 */
export default function Phosphor({ text, trail, speed, color = '#b4b4ff' }: Props) {
  const animName = useMemo(() => `phos-${uid++}`, [])
  const duration = Math.max(0.5, 3 / speed).toFixed(2)

  // 从 hex 颜色提取 RGB
  const trailShadows = useMemo(() => {
    const hex = color.replace('#', '')
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    const shadows: string[] = []
    for (let i = 1; i <= trail; i++) {
      const offset = i * 3
      const alpha = (1 - i / (trail + 1)).toFixed(2)
      shadows.push(`${offset}px 0 ${i * 2}px rgba(${r},${g},${b},${alpha})`)
    }
    return shadows.join(', ')
  }, [trail, color])

  return (
    <>
      <style>{`@keyframes ${animName} {
  0%, 100% { transform: translateX(-30px); }
  50% { transform: translateX(30px); }
}`}</style>
      <span
        className="inline-block select-none"
        style={{
          fontSize: '3rem', fontWeight: 'bold', color: '#fff',
          textShadow: trailShadows,
          animation: `${animName} ${duration}s ease-in-out infinite`,
        }}
      >
        {text || '磷光文字'}
      </span>
    </>
  )
}

let uid = 0
