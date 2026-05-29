import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface Props {
  text: string
  /** 振幅 1~30 px */
  amplitude: number
  /** 频率 1~5 */
  frequency: number
  /** 动画速度 0.5~5 秒 */
  speed: number
}

/**
 * Wave 波浪效果 — GSAP 实现
 * 将文字拆分为独立 <span>，使用 GSAP stagger 实现逐字波浪
 * 通过 useRef 持有 DOM 引用，useEffect 管理动画生命周期
 */
export default function Wave({ text, amplitude, frequency, speed }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // 清除旧内容，重新创建字符 span（React 的声明式渲染 + GSAP 的命令式动画协作）
    el.innerHTML = ''
    const chars = Array.from(text || '预览文字').map((char) => {
      const span = document.createElement('span')
      span.textContent = char
      span.style.display = 'inline-block'
      span.style.whiteSpace = char === ' ' ? 'pre' : 'normal'
      el.appendChild(span)
      return span
    })

    // GSAP 时间线管理动画
    const tl = gsap.timeline({ repeat: -1, yoyo: true })
    tl.to(chars, {
      y: -amplitude,
      duration: speed,
      ease: 'sine.inOut',
      stagger: {
        each: frequency * 0.08,
        repeat: -1,
        yoyo: true,
      },
    })

    // 清理函数：组件卸载或依赖变化时销毁动画
    return () => {
      tl.kill()
    }
  }, [text, amplitude, frequency, speed])

  return (
    <div
      ref={containerRef}
      className="inline-flex flex-wrap justify-center select-none"
      style={{ fontSize: '3rem', fontWeight: 'bold', color: '#f0c060' }}
    />
  )
}
