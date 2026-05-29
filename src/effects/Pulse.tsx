import { useMemo } from 'react'

interface Props {
  text: string
  /** 缩放幅度 1.05~1.5 */
  scale: number
  /** 脉冲速度 0.5~5 s */
  speed: number
}

/**
 * Pulse 脉冲效果 — 纯 CSS
 * 模拟心跳：快速放大 + 缓慢回弹 + 短暂停顿
 * 使用三段关键帧模拟一次完整心跳周期
 */
export default function Pulse({ text, scale, speed }: Props) {
  // 三次心跳为一组，用不同幅度模拟不规则心跳
  const animName = useMemo(() => `pulse-${uid++}`, [])

  // 一个心跳周期：放大→回弹→停顿→再放大（用百分比分配节奏）
  const s1 = scale
  const s2 = scale * 0.7  // 第二次稍弱
  const s3 = scale * 0.85 // 第三次中等

  return (
    <>
      <style>{`@keyframes ${animName} {
  0%   { transform: scale(1); }
  8%   { transform: scale(${s1}); }
  16%  { transform: scale(1); }
  24%  { transform: scale(${s2}); }
  32%  { transform: scale(1); }
  40%  { transform: scale(${s3}); }
  48%  { transform: scale(1); }
  100% { transform: scale(1); }
}`}</style>
      <span
        className="inline-block select-none"
        style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          color: '#ff6b6b',
          textShadow: '0 0 10px rgba(255,107,107,0.4)',
          animation: `${animName} ${speed}s ease-in-out infinite`,
        }}
      >
        {text || '脉冲文字'}
      </span>
    </>
  )
}

let uid = 0
