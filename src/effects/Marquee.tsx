import { useMemo } from 'react'

interface Props {
  text: string
  /** 滚动速度 1~10 */
  speed: number
  /** 滚动方向 */
  direction: 'left' | 'right'
}

/** Marquee 跑马灯 — 纯 CSS 无限横向滚动 */
export default function Marquee({ text, speed, direction }: Props) {
  const animName = useMemo(() => `marquee-${uid++}`, [])
  const dur = Math.max(1, 18 / speed).toFixed(1)

  const displayText = text || '跑马灯效果 · Marquee Effect · 无限滚动 · '
  // 一份内容复制多份确保无缝循环
  const content = displayText.repeat(6)

  return (
    <>
      <style>{`@keyframes ${animName} {
  0%   { transform: translateX(0); }
  100% { transform: translateX(${direction === 'left' ? '-' : ''}50%); }
}`}</style>
      <div className="overflow-hidden select-none w-full">
        <div className="flex whitespace-nowrap" style={{ animation: `${animName} ${dur}s linear infinite` }}>
          <span className="text-2xl font-bold text-[#f0c060]">{content}</span>
          <span className="text-2xl font-bold text-[#f0c060]" aria-hidden="true">{content}</span>
        </div>
      </div>
    </>
  )
}

let uid = 0
