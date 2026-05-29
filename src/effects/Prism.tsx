import { useMemo } from 'react'

interface Props {
  text: string
  /** 色散强度 1~10 */
  intensity: number
  /** 色散角度 */
  angle: number
}

/**
 * Prism 棱镜效果 — 纯 CSS
 * 模拟白光通过棱镜后折射出的彩虹色散
 * 多层 text-shadow，每层不同颜色+间距，形成连续光谱
 */
export default function Prism({ text, intensity, angle }: Props) {
  // 彩虹光谱：红橙黄绿青蓝紫
  const spectrum = [
    '#ff0000', '#ff4400', '#ff8800', '#ffcc00',
    '#88ff00', '#00ff44', '#00ffcc',
    '#0088ff', '#4400ff', '#8800ff',
  ]

  const rad = (angle * Math.PI) / 180

  // 每层光谱色以不同偏移量排列
  const shadows = useMemo(() => {
    return spectrum.map((color, i) => {
      const offset = (i - spectrum.length / 2) * intensity * 0.5
      const dx = Math.cos(rad) * offset
      const dy = Math.sin(rad) * offset
      return `${dx.toFixed(1)}px ${dy.toFixed(1)}px ${intensity * 0.5}px ${color}`
    }).join(', ')
  }, [intensity, angle])

  return (
    <span
      className="select-none"
      style={{
        fontSize: '3rem', fontWeight: 'bold',
        color: '#fff',
        textShadow: shadows,
      }}
    >
      {text || '棱镜文字'}
    </span>
  )
}
