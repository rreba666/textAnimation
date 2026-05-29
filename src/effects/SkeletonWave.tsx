import { useMemo } from 'react'

interface Props {
  text: string
  /** 波浪速度 1~5 */
  speed: number
  /** 波浪颜色 */
  color: string
}

/**
 * SkeletonWave 骨架波浪 — 纯 CSS
 * 模拟页面加载骨架屏的闪光波浪效果
 * 多条不同宽度的矩形骨架，渐变扫光循环移动
 */
export default function SkeletonWave({ text, speed, color }: Props) {
  const animName = useMemo(() => `skel-wave-${uid++}`, [])
  const dur = Math.max(1, 5 / speed).toFixed(1)

  // 模拟骨架占位块
  const lines = [
    { w: '80%', h: 16, y: 0 },
    { w: '60%', h: 16, y: 28 },
    { w: '90%', h: 16, y: 56 },
    { w: '40%', h: 16, y: 84 },
  ]

  return (
    <>
      <style>{`@keyframes ${animName} {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}`}</style>
      <div className="relative w-full max-w-md">
        <div className="text-sm text-[#8888aa] mb-3">{text || '加载中...'}</div>
        <div className="space-y-0 relative" style={{ height: 100 }}>
          {lines.map((line, i) => (
            <div
              key={i}
              className="absolute left-0 rounded"
              style={{
                top: line.y, width: line.w, height: line.h,
                background: `linear-gradient(90deg, #1a1a2e 0%, ${color}44 50%, #1a1a2e 100%)`,
                backgroundSize: '200% 100%',
                animation: `${animName} ${dur}s linear infinite`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>
    </>
  )
}

let uid = 0
