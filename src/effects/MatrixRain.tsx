import { useEffect, useRef, useCallback } from 'react'

interface Props {
  /** 下落速度 1~5 */
  speed: number
  /** 密度（列数）10~100 */
  density: number
  /** 雨滴颜色 */
  color: string
}

/**
 * MatrixRain 代码雨 — Canvas 实现
 * 黑客帝国风格绿色字符瀑布，每列独立速度和亮度
 */
export default function MatrixRain({ speed, density, color }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)

  // 片假名 + 数字字符集
  const chars = 'ｦｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789'

  const render = useCallback(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const parent = canvas.parentElement!
    canvas.width = parent.clientWidth; canvas.height = parent.clientHeight

    const fontSize = 14
    const cols = Math.floor(canvas.width / fontSize * density / 20)
    // 每列的 Y 坐标数组
    const drops: number[] = Array.from({ length: cols }, () => Math.random() * canvas.height)

    function draw() {
      ctx.fillStyle = `rgba(0,0,0,0.05)`; ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = `${fontSize}px monospace`
      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        const x = i * (canvas.width / cols)
        const y = drops[i]
        ctx.fillStyle = color; ctx.globalAlpha = 0.9; ctx.fillText(char, x, y)
        // 首字符高亮
        ctx.fillStyle = '#fff'; ctx.globalAlpha = 1; ctx.fillText(char, x, y)
        drops[i] += fontSize * speed * 0.6
        if (drops[i] > canvas.height && Math.random() > 0.975) drops[i] = 0
      }
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()
  }, [speed, density, color])

  useEffect(() => {
    render()
    return () => cancelAnimationFrame(rafRef.current)
  }, [render])

  return <canvas ref={canvasRef} className="w-full h-full absolute inset-0 rounded-lg" />
}
