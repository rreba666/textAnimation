import { useMemo } from 'react'

interface Props {
  text: string
  /** 星星数量 5~30 */
  count: number
  /** 闪烁速度 1~5 */
  speed: number
}

/**
 * Sparkle 星光效果 — 纯 CSS，在文字上方随机分布闪烁星点
 * 使用绝对定位的 span 元素作为星点，每个独立控制动画延迟
 */
export default function Sparkle({ text, count, speed }: Props) {
  const dur = Math.max(0.5, 3 / speed).toFixed(2)

  // 生成随机位置和延迟的星点
  const sparkles = useMemo(() => {
    const dots: { x: number; y: number; size: number; delay: number }[] = []
    for (let i = 0; i < count; i++) {
      dots.push({
        x: (i * 37 + 13) % 90 + 5,       // 5%~95% 水平范围
        y: (i * 53 + 7) % 80 + 5,         // 5%~85% 垂直范围（留底部给文字）
        size: (i % 3) + 2,                // 2~4px
        delay: parseFloat(((i * 0.43) % 2).toFixed(2)), // 错开闪烁时间
      })
    }
    return dots
  }, [count])

  return (
    <span className="relative inline-block select-none"
          style={{ fontSize: '3rem', fontWeight: 'bold', color: '#e8c060' }}>
      {text || '星光文字'}
      {/* 星点层 — 绝对定位在每个随机位置 */}
      {sparkles.map((dot, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: dot.size,
            height: dot.size,
            background: '#fff',
            boxShadow: `0 0 ${dot.size * 2}px #fff, 0 0 ${dot.size * 4}px #ffe8a0`,
            animation: `sparkle-twinkle ${dur}s ease-in-out ${dot.delay}s infinite alternate`,
          }}
        />
      ))}
      <style>{twinkleKeyframes}</style>
    </span>
  )
}

const twinkleKeyframes = `
@keyframes sparkle-twinkle {
  0%, 30% { opacity: 0; transform: scale(0.3); }
  50% { opacity: 1; transform: scale(1.2); }
  70%, 100% { opacity: 0; transform: scale(0.3); }
}`
