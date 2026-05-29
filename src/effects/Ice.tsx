import { useMemo } from 'react'

interface Props {
  text: string
  /** 闪烁强度 1~10 */
  sparkle: number
  /** 冰晶颜色 */
  color: string
  /** 闪烁速度 1~5 */
  speed: number
}

/**
 * Ice 冰霜效果 — 纯 CSS
 * 冷色多层辉光 + 冰晶闪烁点（通过 background-image 的 radial-gradient 模拟）
 * 缓慢呼吸动画模拟冰面微光反射
 */
export default function Ice({ text, sparkle, color, speed }: Props) {
  const duration = Math.max(1, 5 / speed).toFixed(2)
  const animName = useMemo(() => `ice-shine-${uid++}`, [])

  const shadow = [
    `0 0 ${2 + sparkle}px #fff`,
    `0 0 ${4 + sparkle * 2}px ${color}`,
    `0 0 ${8 + sparkle * 3}px ${color}cc`,
    `0 0 ${14 + sparkle * 4}px ${color}88`,
    `0 ${Math.round(sparkle * 2)}px ${10 + sparkle * 5}px ${color}44`,
    `inset 0 1px 0 rgba(255,255,255,0.3)`,
  ].join(', ')

  // 冰晶表面光点闪烁
  const sparkleDots = useMemo(() => {
    const dots: string[] = []
    for (let i = 0; i < 8; i++) {
      const x = (i * 13 + 7) % 100
      const y = (i * 17 + 3) % 100
      dots.push(`${x}% ${y}%`)
    }
    return dots.join(', ')
  }, [sparkle])

  return (
    <>
      <style>{`@keyframes ${animName} {
  0%, 100% { opacity: 0.3; text-shadow: ${shadow}; }
  50% { opacity: 0.7; text-shadow: ${shadow.replace(/[\d.]+px/, (m) => String(Number(m.replace('px','')) * 1.3) + 'px')}; }
}`}</style>
      <span
        className="relative inline-block select-none"
        style={{ fontSize: '3rem', fontWeight: 'bold' }}
      >
        {/* 冰霜基底 */}
        <span
          className="whitespace-nowrap"
          style={{
            color: '#e8f4ff',
            textShadow: shadow,
            // 模拟冰面纹理的径向渐变闪烁点
            backgroundImage: `radial-gradient(circle 1px at ${sparkleDots}, #ffffffcc, transparent)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            animation: `${animName} ${duration}s ease-in-out infinite`,
          }}
        >
          {text || '冰霜文字'}
        </span>
      </span>
    </>
  )
}

let uid = 0
