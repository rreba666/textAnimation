import { useMemo } from 'react'

interface Props {
  text: string
  color1: string
  color2: string
  /** 流动速度 1~10 s */
  speed: number
  /** 渐变角度 0~360 deg */
  angle: number
}

/**
 * GradientFlow 流动渐变 — 纯 CSS 实现
 * 通过 background-image: linear-gradient + background-clip: text 实现渐变文字
 * 配合 @keyframes 移动 background-position 产生流动感
 * 动态生成 <style> 确保每次参数变更都重新计算关键帧
 */
export default function GradientFlow({ text, color1, color2, speed, angle }: Props) {
  const animationName = useMemo(() => `gf-${Date.now()}`, [color1, color2, speed, angle])

  const css = `@keyframes ${animationName} {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}`

  return (
    <>
      <style>{css}</style>
      <span
        className="select-none"
        style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          backgroundImage: `linear-gradient(${angle}deg, ${color1}, ${color2}, ${color1})`,
          backgroundSize: '200% 100%',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          animation: `${animationName} ${speed}s linear infinite`,
        }}
      >
        {text || '流动渐变'}
      </span>
    </>
  )
}
