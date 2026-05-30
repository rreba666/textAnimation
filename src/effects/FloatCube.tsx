import { useMemo } from 'react'

interface Props {
  /** 立方体大小 100~400 */
  size: number
  /** 漂浮速度 1~5 */
  speed: number
  /** 颜色 */
  color: string
}

/**
 * FloatCube 漂浮立方体 — CSS 3D
 * 3D 立方体缓慢自转 + 上下漂浮，配合阴影模拟悬浮感
 */
export default function FloatCube({ size, speed, color }: Props) {
  const half = size / 2
  const spinName = useMemo(() => `fc-spin-${uid++}`, [])
  const floatName = useMemo(() => `fc-float-${uid++}`, [])
  const dur = Math.max(2, 10 / speed).toFixed(1)

  // 六个面的方向映射
  const faces = [
    { rot: `rotateY(0deg)`, z: half },
    { rot: `rotateY(180deg)`, z: half },
    { rot: `rotateY(90deg)`, z: half },
    { rot: `rotateY(-90deg)`, z: half },
    { rot: `rotateX(90deg)`, z: half },
    { rot: `rotateX(-90deg)`, z: half },
  ]

  return (
    <>
      <style>{`
@keyframes ${spinName} {
  0%   { transform: rotateX(-20deg) rotateY(0deg); }
  100% { transform: rotateX(-20deg) rotateY(360deg); }
}
@keyframes ${floatName} {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-${half*0.25}px); }
}`}</style>
      <div style={{ width: size, height: size, perspective: 800, animation: `${floatName} ${dur}s ease-in-out infinite` }}>
        <div className="relative w-full h-full" style={{
          transformStyle: 'preserve-3d',
          animation: `${spinName} ${dur}s linear infinite`,
        }}>
          {faces.map((f, i) => (
            <div key={i} className="absolute bg-[#1a1a2e] border-2 flex items-center justify-center"
              style={{
                width: size, height: size,
                borderColor: i === 0 ? color : `${color}44`,
                transform: `${f.rot} translateZ(${f.z}px)`,
                boxShadow: i === 0 ? `0 0 ${half*0.3}px ${color}66` : 'none',
              }}
            />
          ))}
        </div>
        {/* 地面阴影 */}
        <div className="mx-auto rounded-full bg-black/30"
          style={{ width: size*0.6, height: half*0.15, marginTop: -half*0.05,
                   filter: 'blur(8px)', animation: `${floatName} ${dur}s ease-in-out infinite` }} />
      </div>
    </>
  )
}

let uid = 0
