import { useMemo } from 'react'

interface Props {
  /** 变形速度 0.5~3 s */
  speed: number
  /** 变形模式 */
  style: 'circle-square' | 'circle-triangle' | 'all'
}

/**
 * MorphingLoader 变形加载 — CSS @keyframes 实现
 * 三个几何图形（圆/方/三角）通过 opacity 交叉淡入淡出模拟变形
 * 现代浏览器支持 CSS d 属性动画，但要求路径指令数一致；
 * 这里使用 opacity 叠化方案保证兼容和可靠。
 */
export default function MorphingLoader({ speed, style }: Props) {
  const animName = useMemo(() => `morph-${uid++}`, [])
  // 速度映射为动画时长
  const dur = Math.max(0.6, speed * 1.5).toFixed(2)

  // 三组图形的显示时间百分比
  const shapes = style === 'all'
    ? [0, 33, 66]    // 圆→方→三角
    : style === 'circle-square' ? [0, 50] : [0, 50]

  const paths = {
    circle: 'M 100 20 A 40 40 0 1 1 99.9 20 Z',
    square: 'M 65 25 L 135 25 L 135 95 L 65 95 Z',
    triangle: 'M 100 15 L 145 95 L 55 95 Z',
  }

  // 构建关键帧：每个图形在指定百分比区间显示，其余区间隐藏
  function buildKeyframes(name: string, idx: number, total: number): string {
    const start = Math.round((idx / total) * 100)
    const mid = Math.round(((idx + 0.5) / total) * 100)
    const end = Math.round(((idx + 1) / total) * 100)
    return `@keyframes ${name}-${idx} {
  0%, ${start}% { opacity: 0; transform: scale(0.7); }
  ${mid}% { opacity: 1; transform: scale(1); }
  ${end}%, 100% { opacity: 0; transform: scale(0.7); }
}`
  }

  return (
    <>
      <style>{`
${buildKeyframes(animName, 0, shapes.length)}
${shapes.length > 1 ? buildKeyframes(animName, 1, shapes.length) : ''}
${shapes.length > 2 ? buildKeyframes(animName, 2, shapes.length) : ''}
      `}</style>
      <div className="flex items-center justify-center">
        <svg width="200" height="110" viewBox="0 0 200 110">
          {/* 辉光背景 — 始终可见的大模糊圆 */}
          <circle cx="100" cy="55" r="35" fill="#b8a0d4" opacity="0.15" style={{ filter: 'blur(12px)' }} />
          {/* 圆形 */}
          <path d={paths.circle} fill="#f0c060" opacity="0"
            style={{ animation: `${animName}-0 ${dur}s ease-in-out infinite` }} />
          {/* 方形（如果模式需要） */}
          {(style === 'circle-square' || style === 'all') && (
            <path d={paths.square} fill="#f0c060" opacity="0"
              style={{ animation: `${animName}-1 ${dur}s ease-in-out infinite` }} />
          )}
          {/* 三角形（如果模式需要） */}
          {(style === 'circle-triangle' || style === 'all') && (
            <path d={paths.triangle} fill="#f0c060" opacity="0"
              style={{ animation: `${animName}-2 ${dur}s ease-in-out infinite` }} />
          )}
        </svg>
      </div>
    </>
  )
}

let uid = 0
