import { useMemo } from 'react'

interface Props {
  /** 光晕强度 1~10 */
  intensity: number
  /** 光晕颜色 */
  color: string
  /** 光晕角度 */
  angle: number
}

/**
 * LensFlare 镜头光晕 — CSS
 * 在文字周围生成多层放射状光斑和光环，模拟逆光镜头反光
 * 光斑沿指定角度方向排列
 */
export default function LensFlare({ intensity, color, angle }: Props) {
  const rad = (angle * Math.PI) / 180
  const dx = Math.cos(rad)
  const dy = Math.sin(rad)

  // 环形光晕：多个同心椭圆光斑
  const rings = useMemo(() => {
    const items: { size: number; offset: number; opacity: number; isCircle: boolean }[] = []
    const count = 5
    for (let i = 0; i < count; i++) {
      items.push({
        size: intensity * 6 + i * (intensity * 4),
        offset: (i - count / 2) * intensity * 5,
        opacity: Math.max(0.05, 0.3 - i * 0.05),
        isCircle: i < 2,
      })
    }
    return items
  }, [intensity])

  return (
    <div className="relative inline-block select-none">
      {/* 光斑装饰层 — 位于文字后方 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
           style={{ zIndex: 0 }}>
        {/* 中心光源辉光 */}
        <div className="absolute rounded-full"
          style={{
            width: intensity * 5 + 10, height: intensity * 5 + 10,
            background: `radial-gradient(circle, #fff, ${color}88, transparent)`,
            boxShadow: `0 0 ${intensity * 6}px ${color}, 0 0 ${intensity * 12}px ${color}66`,
            zIndex: 1,
          }} />

        {/* 环形光斑链 — 沿角度方向排列 */}
        {rings.map((r, i) => (
          <div key={i}
            className="absolute rounded-full"
            style={{
              width: r.size,
              height: r.size * (r.isCircle ? 1 : 0.4),
              left: `calc(50% + ${dx * r.offset}px)`,
              top: `calc(50% + ${dy * r.offset}px)`,
              transform: `translate(-50%, -50%) rotate(${angle}deg)`,
              background: `radial-gradient(ellipse, ${color}cc, ${color}22, transparent)`,
              opacity: r.opacity,
              filter: 'blur(1px)',
            }}
          />
        ))}
      </div>

      {/* 文字层 — 位于光斑上方 */}
      <span className="relative text-3xl font-bold text-white"
            style={{
              zIndex: 2,
              textShadow: `0 0 ${intensity * 3}px ${color}, 0 0 ${intensity * 6}px ${color}88`,
            }}>
        镜头光晕
      </span>
    </div>
  )
}
