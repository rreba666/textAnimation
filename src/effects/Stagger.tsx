import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface Props {
  text: string
  /** 交错延迟 10~200 ms */
  delay: number
  /** 交错位移 10~100 px */
  distance: number
  /** 入场方向 */
  direction: 'left' | 'right' | 'top' | 'bottom'
}

/** 方向 → GSAP 位移起始值映射 */
const DIRECTION_MAP: Record<string, { x: number; y: number }> = {
  left:   { x: -1, y: 0 },
  right:  { x: 1,  y: 0 },
  top:    { x: 0,  y: -1 },
  bottom: { x: 0,  y: 1 },
}

/**
 * Stagger 交错效果 — GSAP 实现
 * 字符从指定方向逐个飞入，形成错落有致的入场动画
 * 循环播放，每次循环会 re-stagger
 */
export default function Stagger({ text, delay, distance, direction }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    el.innerHTML = ''
    const displayText = text || '交错动画'
    const chars = Array.from(displayText).map((char) => {
      const span = document.createElement('span')
      span.textContent = char
      span.style.display = 'inline-block'
      span.style.whiteSpace = char === ' ' ? 'pre' : 'normal'
      el.appendChild(span)
      return span
    })

    const { x, y } = DIRECTION_MAP[direction] ?? DIRECTION_MAP.left

    // GSAP 构建入场→停留→退场的循环动画
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 })
    // 初始位置：所有字符隐藏于起始方向
    tl.set(chars, { opacity: 0, x: x * distance, y: y * distance })
    // 依次飞入
    tl.to(chars, {
      opacity: 1,
      x: 0,
      y: 0,
      duration: 0.4,
      ease: 'back.out(1.7)',
      stagger: delay / 1000,
    })
    // 停留一会后反向飞出
    tl.to(chars, {
      opacity: 0,
      x: -x * distance,
      y: -y * distance,
      duration: 0.3,
      ease: 'power2.in',
      stagger: delay / 2000,
    }, '+=0.3')

    return () => { tl.kill() }
  }, [text, delay, distance, direction])

  return (
    <div
      ref={containerRef}
      className="inline-flex flex-wrap justify-center select-none"
      style={{ fontSize: '3rem', fontWeight: 'bold', color: '#e8e8f0' }}
    />
  )
}
