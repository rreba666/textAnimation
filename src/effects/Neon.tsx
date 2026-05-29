import { useMemo } from 'react'

interface Props {
  text: string
  /** 辉光颜色 */
  color: string
  /** 辉光半径 1~30 px */
  glow: number
  /** 是否闪烁 */
  flicker: boolean
}

/** 0~1 转两位 hex */
function toHex(v: number): string {
  const h = Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16)
  return h.length === 1 ? '0' + h : h
}

/**
 * Neon 霓虹效果 — 纯 CSS 实现
 * 多层 text-shadow 叠加形成辉光，可选呼吸闪烁动画
 * 利用 React useMemo 缓存 text-shadow 字符串计算
 */
export default function Neon({ text, color, glow, flicker }: Props) {
  // 计算多层辉光 text-shadow
  const textShadow = useMemo(() => {
    const layers = 6
    const parts: string[] = []
    for (let i = 1; i <= layers; i++) {
      const blur = i * glow * 1.3
      const alpha = Math.max(0, 1 - i * 0.18)
      parts.push(`0 0 ${blur.toFixed(1)}px ${color}${toHex(alpha)}`)
    }
    // 最内层白光
    parts.push(`0 0 ${glow * 0.5}px #fff`)
    return parts.join(', ')
  }, [color, glow])

  return (
    <>
      {flicker && <style>{neonFlickerKeyframes}</style>}
      <span
        className="select-none"
        style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          color: '#fff',
          textShadow,
          animation: flicker ? 'neon-flicker 1.5s infinite alternate' : 'none',
        }}
      >
        {text || '霓虹文字'}
      </span>
    </>
  )
}

/** 霓虹闪烁关键帧 — 独立常量，避免每次渲染重新生成 */
const neonFlickerKeyframes = `
@keyframes neon-flicker {
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
  20%, 24%, 55% { opacity: 0.4; }
}`
