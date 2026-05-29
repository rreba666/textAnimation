import { useEffect, useRef, useCallback } from 'react'

interface Props {
  /** 强度 1~10 */
  intensity: number
  /** 闪烁速度 1~5 */
  speed: number
  /** 噪点颜色模式 */
  color: string
}

/**
 * Noise 噪点效果 — Canvas 实现
 * 模拟老电视雪花屏，随机像素噪点 + 扫描线
 */
export default function Noise({ intensity, speed, color: mode }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)
  const frameRef = useRef(0)

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const parent = canvas.parentElement!
    canvas.width = parent.clientWidth; canvas.height = parent.clientHeight

    const imageData = ctx.createImageData(canvas.width, canvas.height)
    const data = imageData.data
    const step = Math.max(1, Math.round(11 - intensity)) // 密度：强度越高像素越密

    function draw() {
      frameRef.current++
      // 仅每 (6-speed) 帧更新一次，速度控制
      const skip = Math.max(1, 6 - speed)
      if (frameRef.current % skip !== 0) { rafRef.current = requestAnimationFrame(draw); return }

      // 随机噪点
      for (let i = 0; i < data.length; i += 4 * step) {
        const v = Math.random() * intensity * 25
        const isColor = mode !== 'mono'
        data[i] = isColor ? Math.random() * v : v        // R
        data[i + 1] = isColor ? Math.random() * v : v    // G
        data[i + 2] = isColor ? Math.random() * v : v    // B
        data[i + 3] = Math.random() * intensity * 25     // A
      }
      ctx.putImageData(imageData, 0, 0)
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [intensity, speed, mode])

  useEffect(() => {
    const cleanup = render()
    return () => { cleanup?.() }
  }, [render])

  return <canvas ref={canvasRef} className="w-full h-full absolute inset-0 rounded-lg" />
}
