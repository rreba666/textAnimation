import { useMemo } from 'react'

interface Props {
  text: string
  /** 火焰强度 1~10 */
  intensity: number
  /** 燃烧速度 1~5 */
  speed: number
}

/**
 * Fire 火焰效果 — 纯 CSS
 * 多层暖色 text-shadow 模拟火焰层次（焰心→内焰→外焰）
 * 配合不规则关键帧动画模拟火焰跳动
 */
export default function Fire({ text, intensity, speed }: Props) {
  const duration = Math.max(0.3, 2 / speed).toFixed(2)
  const animName = useMemo(() => `fire-flicker-${uid++}`, [])

  // 火焰色阶：白（焰心）→ 黄 → 橙 → 红（外焰）
  const shadow = [
    `0 0 ${4 + intensity}px #fff`,
    `0 0 ${7 + intensity * 2}px #ff0`,
    `0 0 ${12 + intensity * 3}px #f80`,
    `0 0 ${18 + intensity * 4}px #f40`,
    `0 ${Math.round(intensity * 1.5)}px ${20 + intensity * 5}px #c008`,
    `0 -${Math.round(intensity * 1.2)}px ${15 + intensity * 3}px #f60`,
  ].join(', ')

  // 火焰跳动关键帧 — 多处不规则变化模拟真实火焰
  const keyframes = `@keyframes ${animName} {
  0%   { text-shadow: ${shadow}; transform: scale(1, 1); }
  12%  { text-shadow: ${shadow.replace(/18\+[\d.]+px/, '22px')}; transform: scale(1.02, 0.98); }
  25%  { text-shadow: ${shadow}; transform: scale(0.99, 1.01); }
  37%  { text-shadow: ${shadow.replace(/12\+[\d.]+px/, '15px')}; transform: scale(1.01, 0.99); }
  50%  { text-shadow: ${shadow}; transform: scale(1, 1.02); }
  62%  { text-shadow: ${shadow.replace(/20\+[\d.]+px/, '25px')}; transform: scale(0.98, 1); }
  75%  { text-shadow: ${shadow}; transform: scale(1.02, 0.98); }
  87%  { text-shadow: ${shadow.replace(/7\+[\d.]+px/, '9px')}; transform: scale(1, 1); }
  100% { text-shadow: ${shadow}; transform: scale(1, 1); }
}`

  return (
    <>
      <style>{keyframes}</style>
      <span
        className="select-none"
        style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          color: '#fff',
          textShadow: shadow,
          animation: `${animName} ${duration}s infinite alternate`,
        }}
      >
        {text || '火焰文字'}
      </span>
    </>
  )
}

let uid = 0
