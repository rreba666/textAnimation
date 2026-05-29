import { useMemo } from 'react'

interface Props {
  text: string
  /** 立方体大小 100~500 */
  size: number
  /** 旋转速度 1~10 s */
  speed: number
  /** 透视距离 200~1000 */
  perspective: number
}

/**
 * 3D Cube 立方体效果 — 纯 CSS 3D 实现
 * 利用 CSS 3D transform + perspective 构建旋转立方体
 * 文本贴在前表面，随立方体三维旋转
 */
export default function Cube({ text, size, speed, perspective }: Props) {
  const displayText = text || '3D立方体'
  const half = size / 2
  const animName = useMemo(() => `cube-spin-${uid++}`, [])

  return (
    <>
      <style>{`@keyframes ${animName} {
  0%   { transform: rotateX(-10deg) rotateY(0deg); }
  100% { transform: rotateX(-10deg) rotateY(360deg); }
}`}</style>
      {/* 3D 场景容器 */}
      <div
        className="select-none"
        style={{
          width: size,
          height: size,
          perspective,
          perspectiveOrigin: '50% 50%',
        }}
      >
        {/* 旋转层 */}
        <div
          className="relative w-full h-full"
          style={{
            transformStyle: 'preserve-3d',
            animation: `${animName} ${speed}s linear infinite`,
          }}
        >
          {/* 前表面 */}
          <FaceWrapper half={half}>
            <div
              className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e] border-2 border-[#b8a0d4]"
              style={{
                transform: `translateZ(${half}px)`,
                fontSize: `${Math.min(size * 0.16, 36)}px`,
                fontWeight: 'bold',
                color: '#f0c060',
                textShadow: '0 0 10px rgba(240,192,96,0.4)',
              }}
            >
              {displayText}
            </div>
            {/* 后表面（镜像文字） */}
            <div
              className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e] border-2 border-[#b8a0d4]"
              style={{
                transform: `translateZ(${-half}px) rotateY(180deg)`,
                fontSize: `${Math.min(size * 0.16, 36)}px`,
                fontWeight: 'bold',
                color: '#f0c060',
                opacity: 0.6,
              }}
            >
              {displayText}
            </div>
          </FaceWrapper>

          {/* 顶部 */}
          <div className="absolute bg-[#b8a0d4]/20" style={{
            width: size, height: size,
            transform: `rotateX(90deg) translateZ(${half}px)`,
          }} />
          {/* 底部 */}
          <div className="absolute bg-[#b8a0d4]/20" style={{
            width: size, height: size,
            transform: `rotateX(-90deg) translateZ(${half}px)`,
          }} />
        </div>
      </div>
    </>
  )
}

/** 立方体面容器 — 正确定义 3D 上下文 */
function FaceWrapper({ half, children }: { half: number; children: React.ReactNode }) {
  return (
    <div className="absolute" style={{
      width: half * 2,
      height: half * 2,
      transformStyle: 'preserve-3d',
    }}>
      {children}
    </div>
  )
}

let uid = 0
