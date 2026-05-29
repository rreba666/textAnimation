interface Props {
  text: string
  /** 模糊度 1~10 */
  blur: number
  /** 透明度 0.1~0.9 */
  opacity: number
  /** 玻璃色调 */
  tint: string
}

/**
 * Glass 毛玻璃效果 — 纯 CSS
 * 半透明文字 + text-shadow 模拟玻璃厚度 + 内发光边缘
 */
export default function Glass({ text, blur, opacity: glassOpacity, tint }: Props) {
  return (
    <span
      className="relative inline-block select-none rounded-lg px-4 py-2"
      style={{ fontSize: '3rem', fontWeight: 'bold' }}
    >
      {/* 磨砂文字本体 */}
      <span
        className="whitespace-nowrap"
        style={{
          color: `${tint}${decimalToHex(glassOpacity)}`,
          textShadow: [
            `0 0 ${blur}px rgba(255,255,255,0.4)`,
            `0 0 ${blur * 2}px ${tint}44`,
            `1px 1px ${blur * 0.5}px rgba(255,255,255,0.3)`,
            `-1px -1px ${blur * 0.5}px rgba(0,0,0,0.15)`,
            `0 2px ${blur}px rgba(255,255,255,0.2)`,
          ].join(', '),
          // 模拟磨砂的细微纹理
          filter: `blur(${blur * 0.1}px)`,
        }}
      >
        {text || '毛玻璃'}
      </span>
    </span>
  )
}

function decimalToHex(d: number): string {
  const h = Math.round(Math.max(0, Math.min(1, d)) * 255).toString(16)
  return h.length === 1 ? '0' + h : h
}
