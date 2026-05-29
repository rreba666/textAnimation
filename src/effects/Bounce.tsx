import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface Props {
  text: string
  /** 弹跳高度 1~50 px */
  height: number
  /** 弹跳速度 0.5~3 s */
  speed: number
  /** 字符交错延迟 10~200 ms */
  stagger: number
}

/**
 * Bounce 弹跳效果 — GSAP 实现
 * 每个字符独立上下弹跳，利用 GSAP 的 bounce ease 产生自然的物理回弹感
 * stagger 控制字符之间的错落节奏
 */
export default function Bounce({ text, height, speed, stagger }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    el.innerHTML = ''
    // 将文字拆分为独立 span，每个字符独立控制动画
    const chars = Array.from(text || '弹跳文字').map((char) => {
      const span = document.createElement('span')
      span.textContent = char
      span.style.display = 'inline-block'
      span.style.whiteSpace = char === ' ' ? 'pre' : 'normal'
      el.appendChild(span)
      return span
    })

    // GSAP timeline 循环弹跳动画，yoyo 往复
    const tl = gsap.timeline({ repeat: -1, yoyo: true })
    tl.to(chars, {
      y: -height,
      duration: speed,
      ease: 'bounce.out',  // 物理回弹曲线
      stagger: stagger / 1000,  // ms 转 s
    })

    return () => { tl.kill() }
  }, [text, height, speed, stagger])

  return (
    <div
      ref={containerRef}
      className="inline-flex flex-wrap justify-center select-none"
      style={{ fontSize: '3rem', fontWeight: 'bold', color: '#f0c060' }}
    />
  )
}
