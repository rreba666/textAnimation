import { useState, useCallback, useMemo } from 'react'

interface Props {
  text: string
  /** 转场方向 */
  direction: 'left' | 'right' | 'up' | 'down' | 'fade'
  /** 转场速度 0.5~3 s */
  speed: number
}

/**
 * PageTransition 页面过渡 — CSS + React
 * 点击触发遮罩滑入覆盖 → 换内容 → 遮罩滑出的完整转场流程
 */
export default function PageTransition({ text, direction, speed }: Props) {
  const [phase, setPhase] = useState<'idle' | 'in' | 'out'>('idle')
  const [content, setContent] = useState(0)
  const messages = useMemo(() => [text || '页面过渡', '新内容已加载', 'React 动效工坊'], [text])

  const trigger = useCallback(() => {
    if (phase !== 'idle') return
    setPhase('in')
    setTimeout(() => { setContent((c) => (c + 1) % messages.length); setPhase('out') }, speed * 1000 * 0.6)
    setTimeout(() => { setPhase('idle') }, speed * 1000)
  }, [phase, speed, messages.length])

  // 遮罩滑动方向
  const overlayStyle = useMemo(() => {
    const base: React.CSSProperties = {
      position: 'absolute', inset: 0, zIndex: 10,
      background: 'linear-gradient(135deg, #b8a0d4, #f0c060)',
      transition: `transform ${speed * 0.5}s ease-in-out, opacity ${speed * 0.5}s ease-in-out`,
    }
    if (direction === 'fade') {
      base.transform = phase === 'in' ? 'none' : 'scaleX(0)'
      base.opacity = phase === 'idle' ? 0 : phase === 'in' ? 1 : 0
      return base
    }
    const map: Record<string, string> = { left: 'translateX(-100%)', right: 'translateX(100%)', up: 'translateY(-100%)', down: 'translateY(100%)' }
    base.transform = phase === 'in' ? 'none' : map[direction] ?? map.left
    return base
  }, [direction, phase, speed])

  return (
    <div className="relative flex items-center justify-center min-h-[120px] select-none cursor-pointer"
         onClick={trigger}>
      <span className="text-2xl font-bold text-[#f0c060]">{messages[content]}</span>
      <div style={overlayStyle} />
      <div className="absolute bottom-2 text-xs text-[#555577]">点击触发转场</div>
    </div>
  )
}
