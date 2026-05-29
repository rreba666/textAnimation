import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface Props {
  text: string
  /** 漂浮高度 5~50 px */
  height: number
  /** 漂浮速度 1~5 */
  speed: number
}

/**
 * Float 漂浮效果 — GSAP 实现
 * 文字像羽毛轻轻上下漂浮，叠加微小的水平晃动
 * 使用 GSAP 多重叠加动画实现自然漂浮感
 */
export default function Float({ text, height, speed }: Props) {
  const elRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = elRef.current
    if (!el) return

    const tl = gsap.timeline({ repeat: -1, yoyo: true })
    // 主体上下漂浮
    tl.to(el, {
      y: -height,
      duration: speed,
      ease: 'sine.inOut',
    }, 0)
    // 叠加微小水平漂移
    tl.to(el, {
      x: height * 0.3,
      duration: speed * 1.3,
      ease: 'sine.inOut',
    }, 0)
    // 叠加轻微旋转
    tl.to(el, {
      rotation: height * 0.1,
      duration: speed * 1.7,
      ease: 'sine.inOut',
    }, 0)

    return () => { tl.kill() }
  }, [height, speed])

  return (
    <span
      ref={elRef}
      className="inline-block select-none"
      style={{ fontSize: '3rem', fontWeight: 'bold', color: '#b8d0ff',
               textShadow: '0 4px 20px rgba(184,208,255,0.3)' }}
    >
      {text || '漂浮文字'}
    </span>
  )
}
