import { useMemo } from 'react'

interface Props {
  text: string
  /** 扭曲强度 1~20 */
  intensity: number
  /** 扭曲半径 50~300 px */
  radius: number
}

/**
 * Warp 扭曲效果 — SVG 滤镜
 * 利用 feDisplacementMap + 径向渐变 displacement 模拟黑洞引力扭曲
 * 中心区域拉伸、边缘区域压缩
 */
export default function Warp({ text, intensity, radius }: Props) {
  const filterId = useMemo(() => `warp-filter-${uid++}`, [intensity, radius])

  return (
    <>
      <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          {/* 径向渐变定义位移强度：中心最强，边缘为0 */}
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={2} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise"
            scale={intensity * 3}
            xChannelSelector="R" yChannelSelector="G"
            result="warped" />
          {/* 二次位移放大中心扭曲 */}
          <feDisplacementMap in="warped" in2="noise"
            scale={intensity * 1.5}
            xChannelSelector="G" yChannelSelector="B" />
        </filter>
      </svg>
      <span
        className="inline-block select-none"
        style={{
          fontSize: '3rem', fontWeight: 'bold', color: '#fff',
          filter: `url(#${filterId})`,
          padding: `${radius * 0.2}px`,
        }}
      >
        {text || '扭曲文字'}
      </span>
    </>
  )
}

let uid = 0
