import { useMemo } from 'react'

interface Props {
  text: string
  /** 拖尾长度 1~10 */
  trail: number
  /** 移动速度 1~5 */
  speed: number
}

/**
 * Phosphor 磷光拖尾 — 纯 CSS
 * 多层延迟跟随的 text-shadow 模拟 CRT 磷光残影
 * 文字水平往复移动，身后留下逐渐淡出的彩色拖尾
 */
export default function Phosphor({ text, trail, speed }: Props) {
  const animName = useMemo(() => `phos-${uid++}`, [])
  const duration = Math.max(0.5, 3 / speed).toFixed(2)

  // 构建拖尾 shadow 层：从近到远，透明度递减
  const trailShadows = useMemo(() => {
    const shadows: string[] = []
    for (let i = 1; i <= trail; i++) {
      const offset = i * 3
      const alpha = 1 - i / (trail + 1)
      const r = Math.round(255 * alpha)
      const g = Math.round(180 * alpha)
      const b = Math.round(255 * alpha)
      shadows.push(`${offset}px 0 ${i * 2}px rgba(${r},${g},${b},${alpha.toFixed(2)})`)
    }
    return shadows.join(', ')
  }, [trail])

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
