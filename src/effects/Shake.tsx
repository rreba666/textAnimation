import { useMemo } from 'react'

interface Props {
  text: string
  /** 抖动强度 1~10 */
  intensity: number
  /** 抖动速度 1~10 */
  speed: number
}

/**
 * Shake 震动效果 — 纯 CSS
 * 使用多关键帧百分比的微偏移模拟随机地震抖动
 * 每次抖动方向/幅度不同，产生不规则震动感
 */
export default function Shake({ text, intensity, speed }: Props) {
  const duration = Math.max(0.2, 1.5 / speed).toFixed(2)
  const animName = useMemo(() => `shake-${uid++}`, [])

  // 构建不规则的关键帧偏移序列
  const keyframes = buildShakeKeyframes(animName, intensity, duration)

  return (
    <>
      <style>{keyframes}</style>
      <span
        className="inline-block select-none"
        style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          color: '#fff',
          animation: `${animName} ${duration}s infinite`,
        }}
      >
        {text || '震动文字'}
      </span>
    </>
  )
}

/** 生成看起来随机的震动关键帧 */
function buildShakeKeyframes(name: string, intensity: number, _duration: string): string {
  // 生成 20 个关键帧位置，每个位置随机偏移
  const steps = 20
  const frames: string[] = []
  for (let i = 0; i <= steps; i++) {
    const pct = (i / steps * 100).toFixed(0)
    const x = ((Math.sin(i * 7.3) * intensity * 1.2)).toFixed(1)
    const y = ((Math.cos(i * 5.1) * intensity * 0.9)).toFixed(1)
    const deg = ((Math.sin(i * 3.7) * intensity * 0.3)).toFixed(1)
    frames.push(`  ${pct}% { transform: translate(${x}px, ${y}px) rotate(${deg}deg); }`)
  }
  return `@keyframes ${name} {\n${frames.join('\n')}\n}`
}

let uid = 0
