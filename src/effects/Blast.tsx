import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface Props {
  text: string
  /** 炸开距离 50~300 px */
  distance: number
  /** 爆破速度 0.5~3 s */
  speed: number
}

/**
 * Blast 爆破效果 — GSAP 实现
 * 文字炸开成碎片四散飞出，每个字符飞向随机方向
 * 使用 GSAP 物理缓动 + 随机角度 + 透明淡出
 */
export default function Blast({ text, distance, speed }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    el.innerHTML = ''
    const displayText = text || '爆破文字'
    const chars = Array.from(displayText).map((char) => {
      const span = document.createElement('span')
      span.textContent = char
      span.style.display = 'inline-block'
      span.style.whiteSpace = char === ' ' ? 'pre' : 'normal'
      el.appendChild(span)
      return span
    })

    // GSAP timeline: 聚合→炸开→聚合 循环
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 })

    // 起始：聚合状态
    tl.set(chars, { opacity: 1, x: 0, y: 0 })

    // 炸开：每个字符飞向随机方向
    chars.forEach((span) => {
      const angle = Math.random() * Math.PI * 2
      const dist = distance * (0.5 + Math.random() * 0.5) // 50%~100% 距离
      const dx = Math.cos(angle) * dist
      const dy = Math.sin(angle) * dist
      // 随机旋转
      const rot = (Math.random() - 0.5) * 720
      tl.to(span, {
        x: dx,
        y: dy,
        rotation: rot,
        opacity: 0,
        duration: speed,
        ease: 'power3.out',
      }, 0) // 全部同时开始
    })

    // 聚合收回
    tl.to(chars, {
      x: 0,
      y: 0,
      rotation: 0,
      opacity: 1,
      duration: speed * 1.2,
      ease: 'back.out(1.5)',
    })

    return () => { tl.kill() }
  }, [text, distance, speed])

  return (
    <div
      ref={containerRef}
      className="inline-flex flex-wrap justify-center select-none"
      style={{ fontSize: '3rem', fontWeight: 'bold', color: '#ff6b4a' }}
    />
  )
}
