import { useMemo } from 'react'

interface Props {
  text: string
  /** 倾斜角度 5~45 deg */
  angle: number
  /** 倾斜速度 0.5~5 s */
  speed: number
}

/**
 * Skew 倾斜效果 — 纯 CSS
 * 左右交替 skewX 变换，配合 ease-in-out 产生摇摆感
 */
export default function Skew({ text, angle, speed }: Props) {
  const animName = useMemo(() => `skew-${uid++}`, [])

  return (
    <>
      <style>{`@keyframes ${animName} {
  0%   { transform: skewX(0deg); }
  25%  { transform: skewX(${angle}deg); }
  50%  { transform: skewX(0deg); }
  75%  { transform: skewX(${-angle}deg); }
  100% { transform: skewX(0deg); }
}`}</style>
      <span
        className="inline-block select-none"
        style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          color: '#f0c060',
          animation: `${animName} ${speed}s ease-in-out infinite`,
        }}
      >
        {text || '倾斜文字'}
      </span>
    </>
  )
}

let uid = 0
