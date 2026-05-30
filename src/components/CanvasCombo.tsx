import { useEffect, useRef, useCallback } from 'react'
import type { EffectType, EffectParams } from '../types'

interface Props {
  text: string
  effects: { effect: EffectType; params: EffectParams }[]
}

/**
 * CanvasCombo — 同一段文字叠加多个视觉效果
 * 分层策略：
 *   1. 辉光层（Neon/GlowPulse/Fire/Ice）→ 只画 shadowBlur，文字用极低透明度
 *   2. 文字层（Glitch/Liquid/Shake/Phosphor）→ 画实际可见文字
 *   3. 装饰层（Scanline/Sparkle）→ 条纹和闪光点叠加
 */
export default function CanvasCombo({ text, effects }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)
  const frameRef = useRef(0)

  const draw = useCallback(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const parent = canvas.parentElement!
    canvas.width = parent.clientWidth
    canvas.height = parent.clientHeight

    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const fontSize = Math.min(48, Math.max(20, canvas.width / (text.length + 2) * 2))

    // 分类效果
    const glows = effects.filter((e) => ['neon', 'glowpulse', 'fire', 'ice'].includes(e.effect))
    const texts = effects.filter((e) => ['glitch', 'liquid', 'shake', 'phosphor'].includes(e.effect))
    const decos = effects.filter((e) => ['scanline', 'sparkle'].includes(e.effect))

    function frame() {
      frameRef.current++
      const t = frameRef.current * 0.016
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.font = `bold ${fontSize}px sans-serif`

      // 第一遍：辉光层 — 只画发光 blur，不画实体文字
      for (const { effect, params } of glows) {
        drawGlow(ctx, effect, text, cx, cy, t, params)
      }

      // 第二遍：文字层 — 画实际可见的文字（会覆盖辉光之上的位置）
      for (const { effect, params } of texts) {
        drawTextFx(ctx, effect, text, cx, cy, fontSize, t, params)
      }

      // 第三遍：装饰层 — 扫描线/闪光点叠加在文字上方
      for (const { effect, params } of decos) {
        drawDeco(ctx, effect, text, cx, cy, fontSize, t, params)
      }

      rafRef.current = requestAnimationFrame(frame)
    }
    frame()
    return () => cancelAnimationFrame(rafRef.current)
  }, [text, effects])

  useEffect(() => { const c = draw(); return () => c?.() }, [draw])

  return <canvas ref={canvasRef} className="w-full h-full absolute inset-0 rounded-lg" />
}

/* ============================================
   辉光层 — 只画 shadowBlur，文字透明
   ============================================ */

function drawGlow(ctx: CanvasRenderingContext2D, effect: EffectType, text: string, cx: number, cy: number, t: number, params: EffectParams) {
  let color = '#fff'
  let size = 10
  let flicker = false
  let speed = 2

  switch (effect) {
    case 'neon':
      color = params.neonColor ?? '#ff00ff'; size = params.neonGlow ?? 10; flicker = params.neonFlicker ?? true
      break
    case 'glowpulse':
      color = params.glowpulseColor ?? '#ff88cc'; size = params.glowpulseSize ?? 40; speed = params.glowpulseSpeed ?? 2
      break
    case 'fire':
      color = '#ff4400'; size = (params.fireIntensity ?? 5) * 4; speed = params.fireSpeed ?? 2
      break
    case 'ice':
      color = params.iceColor ?? '#88ccff'; size = (params.iceSparkle ?? 5) * 2; speed = params.iceSpeed ?? 2
      break
  }

  for (let i = 6; i >= 0; i--) {
    const blur = i * size * 1.5
    const baseAlpha = 0.08 + (1 - i * 0.13) * 0.6
    const alpha = flicker ? baseAlpha * (0.7 + 0.3 * Math.sin(t * 5 + i)) : baseAlpha

    // 辉光层：文字颜色设为透明，只让 shadowBlur 可见
    ctx.shadowColor = color; ctx.shadowBlur = blur
    ctx.fillStyle = i === 0 && effect !== 'neon'
      ? `rgba(255,255,255,${(alpha * 0.05).toFixed(2)})`
      : `rgba(0,0,0,0)`
    ctx.globalAlpha = alpha
    ctx.fillText(text, cx, cy + Math.sin(t * speed + i) * size * 0.05)
  }

  // 重置 shadow 避免污染后续绘制
  ctx.shadowBlur = 0; ctx.globalAlpha = 1
}

/* ============================================
   文字层 — 画实际可见的文字效果
   ============================================ */

function drawTextFx(ctx: CanvasRenderingContext2D, effect: EffectType, text: string, cx: number, cy: number, fs: number, t: number, params: EffectParams) {
  switch (effect) {
    case 'glitch':
      drawGlitchText(ctx, text, cx, cy, fs, t, params); break
    case 'liquid':
      drawLiquidText(ctx, text, cx, cy, t, params); break
    case 'shake':
      drawShakeText(ctx, text, cx, cy, t, params); break
    case 'phosphor':
      drawPhosphorText(ctx, text, cx, cy, t, params); break
  }
}

/** Glitch 文字 — 红蓝偏移 + 随机切片 */
function drawGlitchText(ctx: CanvasRenderingContext2D, text: string, cx: number, cy: number, _fs: number, t: number, params: EffectParams) {
  const i = params.glitchIntensity ?? 5
  const s = params.glitchSpeed ?? 2

  // 青色偏移
  ctx.fillStyle = '#44ffff'; ctx.globalAlpha = 0.5
  ctx.fillText(text, cx + i * 0.4, cy)

  // 红色偏移
  ctx.fillStyle = '#ff4444'; ctx.globalAlpha = 0.5
  ctx.fillText(text, cx - i * 0.4, cy)

  // 主体白色文字
  ctx.fillStyle = '#fff'; ctx.globalAlpha = 1
  ctx.fillText(text, cx, cy)

  // 随机水平切片
  const sliceH = 6
  for (let j = 0; j < 50; j++) {
    const sy = cy - 25 + j * sliceH
    const trigger = Math.sin(j * 7.3 + t * s * 3) > 0.72
    if (trigger) {
      ctx.save()
      ctx.beginPath(); ctx.rect(cx - 160, sy, 320, sliceH); ctx.clip()
      ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.9
      // 切片内文字微偏移
      ctx.fillText(text, cx + Math.sin(j + t * s) * i * 0.6, cy)
      ctx.restore()
    }
  }
}

/** Liquid 液体文字 — 正弦波位移 + 多层渐淡副本 */
function drawLiquidText(ctx: CanvasRenderingContext2D, text: string, cx: number, cy: number, t: number, params: EffectParams) {
  const intensity = params.liquidIntensity ?? 10

  // 拖尾副本
  for (let i = 3; i >= 0; i--) {
    const ox = Math.sin(t * 2 + i * 0.5) * intensity * 0.8
    const oy = Math.cos(t * 1.7 + i * 0.5) * intensity * 0.4
    ctx.fillStyle = '#4dc9f6'; ctx.globalAlpha = 0.08 + (3 - i) * 0.04
    ctx.fillText(text, cx + ox, cy + oy)
  }

  // 主体文字
  ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.9
  ctx.fillText(text, cx + Math.sin(t * 2) * intensity * 0.4, cy + Math.cos(t * 1.7) * intensity * 0.2)
}

/** Shake 抖动文字 */
function drawShakeText(ctx: CanvasRenderingContext2D, text: string, cx: number, cy: number, t: number, params: EffectParams) {
  const i = params.shakeIntensity ?? 5
  const sx = Math.sin(t * 13.7) * i * 1.2
  const sy = Math.cos(t * 9.3) * i * 0.9
  ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.95
  ctx.fillText(text, cx + sx, cy + sy)
}

/** Phosphor 磷光拖尾文字 */
function drawPhosphorText(ctx: CanvasRenderingContext2D, text: string, cx: number, cy: number, t: number, params: EffectParams) {
  const trail = params.phosphorTrail ?? 5
  const speed = params.phosphorSpeed ?? 2
  const ox = Math.sin(t * speed) * 20

  // 拖尾副本
  for (let i = trail; i > 0; i--) {
    const alpha = (trail - i + 1) / (trail + 1) * 0.35
    ctx.fillStyle = `rgba(${Math.round(255 * alpha)},${Math.round(180 * alpha)},255,${alpha})`
    ctx.fillText(text, cx + ox - i * 4, cy)
  }

  // 主体
  ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.9
  ctx.fillText(text, cx + ox, cy)
}

/* ============================================
   装饰层 — 扫描线 / 闪光点
   ============================================ */

function drawDeco(ctx: CanvasRenderingContext2D, effect: EffectType, text: string, cx: number, cy: number, _fs: number, t: number, params: EffectParams) {
  switch (effect) {
    case 'scanline': {
      const color = params.scanlineColor ?? '#4dff4d'
      const density = params.scanlineDensity ?? 10
      const stripeH = Math.max(1, 22 - density)
      const offset = (t * 40 * (params.scanlineSpeed ?? 3) / 3) % (stripeH * 2)

      // 先画荧光文字作遮罩
      ctx.save()
      ctx.shadowColor = color; ctx.shadowBlur = 6
      ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.05
      ctx.fillText(text, cx, cy)
      ctx.shadowBlur = 0

      // 裁剪到文字区域后画扫描线
      ctx.globalCompositeOperation = 'source-atop'
      for (let y = cy - 30 + offset; y < cy + 30; y += stripeH) {
        ctx.fillStyle = color + '44'
        ctx.fillRect(cx - 160, y, 320, Math.max(1, stripeH * 0.4))
      }
      ctx.restore()
      break
    }
    case 'sparkle': {
      const count = params.sparkleCount ?? 15
      for (let i = 0; i < count; i++) {
        const sx = cx - 80 + (i * 37 + 13) % 160
        const sy = cy - 25 + (i * 53 + 7) % 50
        const sa = Math.sin(t * 4 + i * 2.3) * 0.5 + 0.5
        if (sa > 0.5) {
          ctx.fillStyle = '#fff'; ctx.globalAlpha = sa * 0.8
          ctx.beginPath(); ctx.arc(sx, sy, 1.5, 0, Math.PI * 2); ctx.fill()
        }
      }
      // 文字微光
      ctx.shadowColor = '#fff'; ctx.shadowBlur = 3
      ctx.fillStyle = 'rgba(0,0,0,0)'; ctx.globalAlpha = 0.15
      ctx.fillText(text, cx, cy)
      ctx.shadowBlur = 0
      break
    }
  }
}
