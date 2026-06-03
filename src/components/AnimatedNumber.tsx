// 数字滚动动画组件 —— 值变化时从旧值平滑滚动到新值

import { useRef, useEffect } from 'react'
import gsap from 'gsap'

interface Props {
  value: number
  className?: string
  duration?: number
}

export default function AnimatedNumber({ value, className = '', duration = 0.8 }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const prevRef = useRef(value)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const prev = prevRef.current
    prevRef.current = value
    if (prev === value) return

    // GSAP 数字滚动：从旧值 tween 到新值，更新 innerText
    gsap.fromTo(
      { val: prev },
      { val: value },
      {
        duration,
        ease: 'power2.out',
        onUpdate: function () {
          const target = this.targets?.()?.[0] as { val: number } | undefined
          if (target && el) el.innerText = String(Math.round(target.val))
        },
      }
    )
  }, [value, duration])

  return <span ref={ref} className={className}>{value}</span>
}
