import { useMemo } from 'react'

interface Props {
  text: string
  /** 翻转角度 30~360 deg */
  angle: number
  /** 翻转速度 0.5~5 s */
  speed: number
  /** 翻转轴 X 或 Y */
  axis: 'X' | 'Y'
}

/**
 * Flip 3D 翻转效果 — 纯 CSS 实现
 * 使用 CSS 3D perspective + rotateX/rotateY 实现三维翻转
 * 每个字符独立翻转，通过 animation-delay 制造逐字波次效果
 */
export default function Flip({ text, angle, speed, axis }: Props) {
  const displayText = text || '3D翻转'
  const chars = Array.from(displayText)

  // 根据速度计算每字符延迟，制造波次
  const perCharDelay = speed / Math.max(chars.length, 1)

  // 动态生成关键帧（angle 参数变化时重新生成）
  const keyframes = useMemo(() => {
    const name = `flip-${axis}-${angle}`
    const css = `@keyframes ${name} {
  0%   { transform: perspective(400px) rotate${axis}(0deg); }
  50%  { transform: perspective(400px) rotate${axis}(${angle}deg); }
  100% { transform: perspective(400px) rotate${axis}(0deg); }
}`
    return { name, css }
  }, [angle, axis])

  return (
    <>
      <style>{keyframes.css}</style>
      <span className="inline-flex flex-wrap justify-center select-none"
            style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fff' }}>
        {chars.map((char, i) => (
          <span
            key={i}
            className="inline-block"
            style={{
              whiteSpace: char === ' ' ? 'pre' : 'normal',
              width: char === ' ' ? '0.5em' : 'auto',
              animation: `${keyframes.name} ${speed}s ease-in-out infinite`,
              // 逐字延迟，形成翻转波次 —— 核心技法
              animationDelay: `${i * perCharDelay}s`,
            }}
          >
            {char}
          </span>
        ))}
      </span>
    </>
  )
}
