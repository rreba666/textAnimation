import { useMemo } from 'react'

interface Props {
  text: string
  /** 光晕半径 10~100 px */
  size: number
  /** 脉冲速度 0.5~5 s */
  speed: number
  /** 光晕颜色 */
  color: string
}

/**
 * GlowPulse 光晕脉冲 — 纯 CSS
 * 文字周围多层光晕像心跳一样扩散收缩
 * 使用 text-shadow 多层辉光 + scale 缩放动画，模拟心脏搏动
 */
export default function GlowPulse({ text, size, speed, color }: Props) {
  const animName = useMemo(() => `glowpulse-${uid++}`, [])

  // 多层辉光用于外圈：不同半径，依次收缩
  const shadows = useMemo(() => {
    const layers = 3
    const parts: string[] = []
    for (let i = 0; i < layers; i++) {
      const r = size * (0.4 + i * 0.3)
      const a = (1 - i * 0.25).toFixed(2)
      parts.push(`0 0 ${r.toFixed(0)}px ${color}${decimalToHex(parseFloat(a))}`)
    }
    return parts.join(', ')
  }, [size, color])

  return (
    <>
      <style>{`@keyframes ${animName} {
  0%, 100% { transform: scale(1); text-shadow: ${shadows}; }
  15%  { transform: scale(1.03); text-shadow: ${shadows.replace(/[\\d.]+px/, (m) => (parseFloat(m) * 1.5) + 'px')}; }
  30%  { transform: scale(1); text-shadow: ${shadows}; }
  45%  { transform: scale(1.02); text-shadow: ${shadows.replace(/[\\d.]+px/, (m) => (parseFloat(m) * 1.3) + 'px')}; }
  60%  { transform: scale(1); text-shadow: ${shadows}; }
}`}</style>
      <span
        className="inline-block select-none"
        style={{
          fontSize: '3rem', fontWeight: 'bold', color: '#fff',
          textShadow: shadows,
          animation: `${animName} ${speed}s ease-in-out infinite`,
        }}
      >
        {text || '光晕脉冲'}
      </span>
    </>
  )
}

function decimalToHex(d: number): string {
  const h = Math.round(Math.max(0, Math.min(1, d)) * 255).toString(16)
  return h.length === 1 ? '0' + h : h
}

let uid = 0
