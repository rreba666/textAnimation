import { useMemo } from 'react'

interface Props {
  text: string
  /** 扩散程度 1~10 */
  spread: number
  /** 墨色 */
  color: string
  /** 扩散速度 1~5 */
  speed: number
}

/**
 * Ink 墨迹效果 — SVG 滤镜 + CSS
 * feGaussianBlur 模糊模拟墨迹扩散，配合 feTurbulence 增加边缘不规则感
 * CSS animation 控制从模糊→清晰的书写过程
 */
export default function Ink({ text, spread, color, speed }: Props) {
  const filterId = useMemo(() => `ink-filter-${uid++}`, [spread])
  const animName = useMemo(() => `ink-bleed-${uid++}`, [])
  const duration = Math.max(1, 5 / speed).toFixed(2)

  return (
    <>
      <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
        <filter id={filterId}>
          {/* 湍流噪点 + 高斯模糊 → 墨水边缘粗糙感 */}
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves={4} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={spread} result="displaced" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur in="displaced" stdDeviation={spread * 0.3} result="blurred" />
          <feComponentTransfer in="blurred" result="contrasted">
            <feFuncA type="linear" slope={2.5} intercept={-0.5} />
          </feComponentTransfer>
        </filter>
      </svg>
      <style>{`@keyframes ${animName} {
  0%   { filter: url(#${filterId}) blur(${spread}px); opacity: 0.3; }
  100% { filter: url(#${filterId}) blur(0px); opacity: 1; }
}`}</style>
      <span
        className="select-none"
        style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          color,
          animation: `${animName} ${duration}s ease-out infinite alternate`,
          textShadow: `${spread * 0.5}px ${spread * 0.3}px ${spread * 2}px ${color}44`,
        }}
      >
        {text || '墨迹文字'}
      </span>
    </>
  )
}

let uid = 0
