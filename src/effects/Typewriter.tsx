import { useState, useEffect, useRef } from 'react'

interface Props {
  text: string
  /** 打字速度 10~200 ms/字 */
  speed: number
  /** 光标样式 */
  cursorStyle: 'block' | 'line'
}

/**
 * Typewriter 打字机效果 — 纯 JS 实现
 * 使用 setInterval 逐字显示，useRef 持有定时器引用避免闭包陷阱
 * 不需要 GSAP TextPlugin（付费插件），零依赖
 */
export default function Typewriter({ text, speed, cursorStyle }: Props) {
  const displayText = text || '打字机效果...'
  const [visibleCount, setVisibleCount] = useState(0)
  // 用 ref 保存定时器 ID，确保清理函数能正确清除
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // 重置计数
    setVisibleCount(0)

    // 逐字间隔进场
    timerRef.current = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= displayText.length) {
          // 打完后停止定时器
          if (timerRef.current) clearInterval(timerRef.current)
          return prev
        }
        return prev + 1
      })
    }, speed)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [displayText, speed])

  const cursorClass = cursorStyle === 'block' ? 'bg-[#f0c060] w-[0.6em] h-[1em]' : 'bg-[#f0c060] w-[2px] h-[1em]'

  return (
    <span className="select-none" style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fff' }}>
      {displayText.slice(0, visibleCount)}
      {/* 光标闪烁 — 纯 CSS animation */}
      <span
        className={`inline-block align-middle ml-1 ${cursorClass}`}
        style={{ animation: 'cursor-blink 0.8s step-end infinite' }}
      />
      <style>{cursorBlinkKeyframes}</style>
    </span>
  )
}

const cursorBlinkKeyframes = `
@keyframes cursor-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}`
