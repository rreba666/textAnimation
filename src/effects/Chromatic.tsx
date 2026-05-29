interface Props {
  text: string
  /** RGB 通道偏移 1~15 px */
  offset: number
  /** 偏移角度 0~360 deg */
  angle: number
}

/**
 * Chromatic 色差效果 — 纯 CSS 实现
 * 将文字拆分为 R/G/B 三个通道层，每层向不同方向偏移
 * 使用 mix-blend-mode: screen 混合 RGB 通道模拟镜头色散
 */
export default function Chromatic({ text, offset, angle }: Props) {
  const displayText = text || '色差文字'

  // 3 个通道的偏移方向：红=角度方向，绿=0，蓝=相反方向
  const rad = (angle * Math.PI) / 180
  const dx = Math.cos(rad) * offset
  const dy = Math.sin(rad) * offset

  // 每层数据：颜色 + 偏移
  const channels = [
    { color: '#ff4444', x: dx, y: dy, label: '红通道' },
    { color: '#44ff44', x: 0, y: 0, label: '绿通道' },
    { color: '#4488ff', x: -dx, y: -dy, label: '蓝通道' },
  ]

  return (
    <span className="relative inline-block select-none" style={{ fontSize: '3rem', fontWeight: 'bold' }}>
      {channels.map((ch) => (
        <span
          key={ch.label}
          className="absolute inset-0 whitespace-nowrap mix-blend-screen"
          style={{
            color: ch.color,
            transform: `translate(${ch.x}px, ${ch.y}px)`,
          }}
          aria-hidden="true"
        >
          {displayText}
        </span>
      ))}
      {/* 占位：保持布局尺寸 */}
      <span className="invisible whitespace-nowrap">{displayText}</span>
    </span>
  )
}
