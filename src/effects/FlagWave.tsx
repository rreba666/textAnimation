import { useMemo } from 'react'

interface Props {
  text: string
  /** 飘动幅度 5~50 */
  amplitude: number
  /** 波浪频率 1~5 */
  frequency: number
  /** 飘动速度 1~5 */
  speed: number
}

/**
 * FlagWave 旗帜飘动 — 纯 CSS
 * 每个字符独立 rotate + translateY，animation-delay 形成连续波浪飘动
 */
export default function FlagWave({ text, amplitude, frequency, speed }: Props) {
  const chars = Array.from(text || '旗帜飘动')
  const animName = useMemo(() => `flag-${uid++}`, [])
  const dur = Math.max(1, 5 / speed).toFixed(2)

  return (
    <>
      <style>{`@keyframes ${animName} {
  0%,100% { transform: translateY(0) rotate(0deg); }
  25%  { transform: translateY(${-amplitude * 0.6}px) rotate(${frequency * 2}deg); }
  50%  { transform: translateY(0) rotate(0deg); }
  75%  { transform: translateY(${amplitude * 0.6}px) rotate(${-frequency * 2}deg); }
}`}</style>
      <span className="inline-flex select-none" style={{ fontSize: '3rem', fontWeight: 'bold', color: '#f0c060' }}>
        {chars.map((char, i) => (
          <span key={i} className="inline-block"
            style={{
              whiteSpace: char === ' ' ? 'pre' : 'normal',
              animation: `${animName} ${dur}s ease-in-out infinite`,
              animationDelay: `${i * frequency * 0.08}s`,
            }}>
            {char}
          </span>
        ))}
      </span>
    </>
  )
}

let uid = 0
