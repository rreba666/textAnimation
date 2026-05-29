import { useMemo } from 'react'

interface Props {
  text: string
  /** 滴落数量 1~10 */
  count: number
  /** 滴落长度 10~100 px */
  length: number
  /** 滴落速度 1~5 */
  speed: number
}

/**
 * Drip 滴落效果 — SVG + CSS
 * 在文字下方生成墨水滴滴落动画
 * 使用 SVG 路径模拟水滴拉伸→断开→下坠的过程
 */
export default function Drip({ text, count, length, speed }: Props) {
  const dur = Math.max(0.3, 2 / speed).toFixed(2)

  // 生成随机位置和延迟的墨滴
  const drips = useMemo(() => {
    const result: { x: number; delay: number; id: string }[] = []
    for (let i = 0; i < count; i++) {
      result.push({
        x: ((i * 37 + 15) % 80) + 10, // 10%~90% 范围内
        delay: parseFloat(((i * 0.7) % 3).toFixed(1)),
        id: `drip-${i}`,
      })
    }
    return result
  }, [count])

  return (
    <>
      <style>{`@keyframes drip-fall {
  0%   { transform: scaleY(0); opacity: 0; }
  15%  { transform: scaleY(1); opacity: 0.7; }
  40%  { transform: translateY(${length}px) scaleY(0.3); opacity: 0.5; }
  100% { transform: translateY(${length + 40}px) scaleY(0); opacity: 0; }
}`}</style>
      <span className="relative inline-block select-none"
            style={{ fontSize: '3rem', fontWeight: 'bold', color: '#334' }}>
        {text || '滴落文字'}
        {/* 墨滴渲染在文字下方 */}
        <span className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {drips.map((d) => (
            <span key={d.id}
              className="absolute top-full"
              style={{
                left: `${d.x}%`,
                width: '4px', height: `${length}px`,
                background: `linear-gradient(180deg, #334, transparent)`,
                borderRadius: '0 0 50% 50%',
                animation: `drip-fall ${dur}s ease-in infinite`,
                animationDelay: `${d.delay}s`,
                transformOrigin: 'top center',
              }} />
          ))}
        </span>
      </span>
    </>
  )
}
