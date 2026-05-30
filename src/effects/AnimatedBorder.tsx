import { useMemo } from 'react'

interface Props {
  text: string; speed: number; width: number; color1: string; color2: string
}

/** Animated Border — CSS 流动渐变动画边框 */
export default function AnimatedBorder({ text, speed, width: borderWidth, color1, color2 }: Props) {
  const animName = useMemo(() => `ab-${uid++}`, [])
  const dur = Math.max(1, 6 / speed).toFixed(1)

  return (
    <>
      <style>{`@keyframes ${animName} {
  0%   { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}`}</style>
      <div className="relative inline-block select-none rounded-xl"
        style={{
          padding: borderWidth * 0.5,
          background: `linear-gradient(90deg, ${color1}, ${color2}, ${color1})`,
          backgroundSize: '200% 100%',
          animation: `${animName} ${dur}s linear infinite`,
        }}>
        <div className="rounded-lg px-8 py-5 bg-[#0a0a1a]">
          <span className="text-xl font-bold text-white">{text || '动态边框'}</span>
        </div>
      </div>
    </>
  )
}

let uid = 0
