import { useMemo } from 'react'

interface Props {
  text: string
  /** 扫描线密度 2~20 */
  density: number
  /** 扫描线移动速度 1~10 s */
  speed: number
  /** 荧光颜色 */
  color: string
}

/**
 * Scanline 扫描线效果 — 纯 CSS，模拟 CRT 显示器
 *
 * 三层叠加构建 CRT 质感：
 * 1. 底层：荧光色文字 + 多层辉光（模拟电子束轰击荧光粉）
 * 2. 中层：扫描线遮罩（暗-亮交替的水平条纹）
 * 3. 顶层：整体 CRT 色偏叠加（通过伪元素实现微弱的屏幕弧度感）
 */
export default function Scanline({ text, density, speed, color }: Props) {
  const displayText = text || '扫描线'

  // 密度越高条纹越密：density=2 → stripeH=10px, density=20 → stripeH=2px
  const stripeH = Math.max(1, Math.round(22 - density))
  const animName = useMemo(() => `scan-${uid++}`, [])
  // 扫描线颜色（半透明暗条纹 + 荧光色亮条纹）
  const stripeColor = `${color}55`

  return (
    <>
      <style>{`@keyframes ${animName} {
  0%   { background-position: 0 0; }
  100% { background-position: 0 ${stripeH * 2}px; }
}`}</style>

      <span
        className="relative inline-block select-none"
        style={{ fontSize: '3rem', fontWeight: 'bold' }}
      >
        {/* 底层：荧光辉光文字 */}
        <span
          className="relative whitespace-nowrap"
          style={{
            color: '#e8ffe8',
            textShadow: [
              `0 0 2px ${color}`,
              `0 0 5px ${color}`,
              `0 0 10px ${color}`,
              `0 0 20px ${color}aa`,
              `0 0 35px ${color}66`,
              `2px 0 2px ${color}44`,
              `-1px 0 2px ${color}44`,
            ].join(', '),
          }}
        >
          {displayText}
        </span>

        {/* 中层：扫描线纹理 — 覆盖在文字上方 */}
        <span
          className="absolute inset-0 whitespace-nowrap"
          style={{
            color: 'transparent',
            // 暗条纹略带底色 + 亮条纹高亮，形成明显条纹对比
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent 0px,
              transparent ${Math.max(1, stripeH - 2)}px,
              ${stripeColor} ${stripeH - 1}px,
              ${color}88 ${stripeH}px
            )`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            animation: `${animName} ${speed}s linear infinite`,
          }}
          aria-hidden="true"
        >
          {displayText}
        </span>
      </span>
    </>
  )
}

let uid = 0
