import { useMemo } from 'react'

interface Props {
  text: string
  speed: number
  color1: string
  color2: string
}

/**
 * Rave 激光雨 — 纯 CSS
 * 彩色激光束从文字上方交替扫过，模拟电子音乐现场的激光氛围
 */
export default function Rave({ text, speed, color1, color2 }: Props) {
  const animName = useMemo(() => `rave-${uid++}`, [])

  // 多道激光束，不同位置/角度/颜色
  const beams = [
    { top: '0%', left: '20%', width: '2px', color: color1, delay: '0s', angle: 5 },
    { top: '0%', left: '50%', width: '1.5px', color: color2, delay: '0.3s', angle: -3 },
    { top: '0%', left: '75%', width: '2.5px', color: color1, delay: '0.6s', angle: 8 },
    { top: '0%', left: '35%', width: '1px', color: color2, delay: '0.9s', angle: -6 },
  ]

  return (
    <>
      <style>{`@keyframes ${animName}-beam {
  0%   { transform: translateY(-100%) rotate(var(--ra)); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateY(400%) rotate(var(--ra)); opacity: 0; }
}`}</style>
      <span className="relative inline-block select-none overflow-hidden"
            style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fff' }}>
        {text || '激光雨'}
        {/* 激光束扫过文字上方 */}
        {beams.map((b, i) => (
          <span key={i} className="absolute inset-0 pointer-events-none"
                style={{ '--ra': `${b.angle}deg` } as React.CSSProperties}>
            <span
              className="absolute h-[300%] rounded-full opacity-70"
              style={{
                left: b.left, width: b.width,
                background: `linear-gradient(180deg, transparent, ${b.color}, transparent)`,
                animation: `${animName}-beam ${speed}s linear infinite`,
                animationDelay: b.delay,
              }}
            />
          </span>
        ))}
      </span>
    </>
  )
}

let uid = 0
