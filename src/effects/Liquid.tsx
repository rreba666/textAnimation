import { useMemo } from 'react'

interface Props {
  text: string
  /** 扭曲强度 1~20 */
  intensity: number
  /** 流动速度 1~5 */
  speed: number
  /** 噪点缩放 50~300（越小越细密） */
  scale: number
}

let uid = 0

/**
 * Liquid 液体效果 — SVG feTurbulence + feDisplacementMap
 * 利用 SVG 滤镜的湍流噪点 + 位移映射实现有机液体扭曲
 * 纯声明式，无需 JS 动画循环
 */
export default function Liquid({ text, intensity, speed, scale }: Props) {
  // 每次参数变化生成唯一 filter ID，避免多实例冲突
  const filterId = useMemo(() => `liquid-filter-${uid++}`, [intensity, speed, scale])

  const baseFreq = (scale / 10000).toFixed(4)

  return (
    <>
      {/* 隐藏的 SVG 滤镜定义 — React 可声明式注入任意 DOM */}
      <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
        <filter id={filterId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency={baseFreq}
            numOctaves={3}
            result="noise"
          >
            {/* SVG animate 驱动湍流噪点连续变化 → 液体流动感 */}
            <animate
              attributeName="baseFrequency"
              values={`${baseFreq} ${baseFreq};${(scale / 5000).toFixed(4)} ${(scale / 5000).toFixed(4)};${baseFreq} ${baseFreq}`}
              dur={`${Math.max(0.5, 6 / speed).toFixed(1)}s`}
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={intensity}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      <span
        className="select-none"
        style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          color: '#4dc9f6',
          filter: `url(#${filterId})`,
        }}
      >
        {text || '液体文字'}
      </span>
    </>
  )
}
