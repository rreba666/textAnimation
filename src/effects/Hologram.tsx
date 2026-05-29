import { useMemo } from 'react'

interface Props {
  text: string
  color: string
  /** 渐变角度 */
  angle: number
  /** 层偏移距离 1~20 px */
  distance: number
}

/**
 * Hologram 全息效果 — 纯 CSS 实现
 * 多层半透明文字叠影 + 对角线渐变扫光，营造全息投影的未来感
 * 使用 mix-blend-mode screen 让叠影产生自发光混合
 */
export default function Hologram({ text, color, angle, distance }: Props) {
  const displayText = text || '全息文字'

  // 计算偏移方向：根据角度转为 x/y 分量
  const rad = (angle * Math.PI) / 180
  const dx = Math.cos(rad) * distance
  const dy = Math.sin(rad) * distance

  // 每层透明度递减
  const layers = [
    { x: 0, y: 0, opacity: 0.9 },
    { x: dx, y: dy, opacity: 0.4 },
    { x: -dx * 0.7, y: -dy * 0.7, opacity: 0.25 },
    { x: dx * 0.5, y: dy * 0.5, opacity: 0.15 },
  ]

  // 扫光关键帧名（唯一性避免冲突）
  const animName = useMemo(() => `hg-sweep-${uid++}`, [])

  return (
    <>
      <style>{`@keyframes ${animName} {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}`}</style>
      {/* 多层叠影 + 渐变扫光 */}
      <span className="relative inline-block select-none" style={{ fontSize: '3rem', fontWeight: 'bold' }}>
        {/* 底层：半透明叠影 */}
        {layers.map((layer, i) => (
          <span
            key={i}
            className="absolute inset-0 whitespace-nowrap"
            style={{
              color,
              opacity: layer.opacity,
              transform: `translate(${layer.x}px, ${layer.y}px)`,
            }}
            aria-hidden="true"
          >
            {displayText}
          </span>
        ))}
        {/* 顶层：渐变扫光文字 */}
        <span
          className="relative whitespace-nowrap"
          style={{
            backgroundImage: `linear-gradient(${angle}deg, ${color}, #fff, ${color})`,
            backgroundSize: '200% 100%',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            animation: `${animName} 2s linear infinite`,
            textShadow: `0 0 10px ${color}80, 0 0 20px ${color}40`,
          }}
        >
          {displayText}
        </span>
      </span>
    </>
  )
}

/** 全局计数器，生成唯一 keyframes 名 */
let uid = 0
