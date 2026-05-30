import { useMemo } from 'react'

interface Props {
  text: string
  /** 融化程度 1~10 */
  amount: number
  /** 融化速度 1~5 */
  speed: number
  /** 熔融颜色 */
  color: string
}

/**
 * Melt 融化效果 — SVG 滤镜 + CSS
 * 使用 feDisplacementMap 产生垂直偏移，模拟蜡烛融化向下流淌
 * 配合 feGaussianBlur 让边缘变模糊
 */
export default function Melt({ text, amount, speed, color }: Props) {
  const filterId = useMemo(() => `melt-${uid++}`, [amount])
  const animName = useMemo(() => `melt-drip-${uid++}`, [])
  const dur = Math.max(1, 5 / speed).toFixed(2)

  return (
    <>
      <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
        <filter id={filterId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.04" numOctaves={3} result="noise">
            <animate attributeName="baseFrequency" values="0.02 0.04;0.03 0.06;0.02 0.04"
                     dur="3s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={amount * 3} xChannelSelector="R" yChannelSelector="G" result="melted" />
          <feGaussianBlur in="melted" stdDeviation={amount * 0.3} result="blurred" />
          <feComponentTransfer in="blurred">
            <feFuncA type="linear" slope={1.5} intercept={-0.2} />
          </feComponentTransfer>
        </filter>
      </svg>
      <style>{`@keyframes ${animName} {
  0%,100% { filter: url(#${filterId}) brightness(1); }
  50% { filter: url(#${filterId}) brightness(0.85); }
}`}</style>
      <span
        className="select-none"
        style={{
          fontSize: '3rem', fontWeight: 'bold', color,
          animation: `${animName} ${dur}s ease-in-out infinite`,
          textShadow: `0 ${amount * 3}px ${amount * 2}px ${color}44`,
        }}
      >
        {text || '融化文字'}
      </span>
    </>
  )
}

let uid = 0
