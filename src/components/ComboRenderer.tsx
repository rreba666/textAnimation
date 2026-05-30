import type { ComboEffect } from '../data/presets'
import Glitch from '../effects/Glitch'
import Neon from '../effects/Neon'
import GlowPulse from '../effects/GlowPulse'
import Fire from '../effects/Fire'
import Ice from '../effects/Ice'
import Sparkle from '../effects/Sparkle'
import Liquid from '../effects/Liquid'
import Phosphor from '../effects/Phosphor'
import Shake from '../effects/Shake'
import type { EffectType, EffectParams } from '../types'

interface Props {
  text: string
  combo: ComboEffect[]
  bg: ComboEffect[]
}

/**
 * ComboRenderer — 独立图层叠加
 * glow 层文字透明只留光晕，text 层显示实际效果
 * scanline 作为全屏叠加层单独处理，不依赖 background-clip:text
 */
export default function ComboRenderer({ text, combo, bg }: Props) {
  const all = [...bg, ...combo]

  // 分离扫描线（特殊处理）和普通效果
  const scanlineCfg = all.find((c) => c.effect === 'scanline')
  const layers = all.filter((c) => c.effect !== 'scanline').map((c) => ({
    ...c,
    kind: getLayerKind(c.effect),
  }))

  return (
    <div className="relative w-full min-h-[160px]">
      <style>{`
.combo-glow * { color: transparent !important; -webkit-text-fill-color: transparent !important; }
.combo-deco { pointer-events: none; }
@keyframes combo-scan-move {
  0%   { background-position: 0 0; }
  100% { background-position: 0 ${(Math.max(1, 22 - (scanlineCfg?.params.scanlineDensity ?? 10))) * 2}px; }
}
      `}</style>

      {/* 普通图层 */}
      {layers.map((c, i) => {
        const z = c.kind === 'text' ? 200 + i : c.kind === 'deco' ? 100 + i : i
        return (
          <div key={i} className={`absolute inset-0 flex items-center justify-center combo-${c.kind}`}
               style={{ zIndex: z }}>
            <EffectWrap effect={c.effect} text={text} params={c.params} />
          </div>
        )
      })}

      {/* 扫描线全屏叠加层 */}
      {scanlineCfg && (
        <div className="absolute inset-0 pointer-events-none rounded-lg overflow-hidden"
             style={{ zIndex: 300 }}>
          <ScanlineOverlay
            density={scanlineCfg.params.scanlineDensity ?? 10}
            speed={scanlineCfg.params.scanlineSpeed ?? 3}
            color={scanlineCfg.params.scanlineColor ?? '#4dff4d'}
          />
        </div>
      )}
    </div>
  )
}

/**
 * 扫描线全屏叠加 — 纯 CSS repeating-linear-gradient + mix-blend-mode
 * 不依赖 background-clip:text，可覆盖在任意内容上方
 */
function ScanlineOverlay({ density, speed, color }: { density: number; speed: number; color: string }) {
  const stripeH = Math.max(1, 22 - density)
  const dur = Math.max(0.5, 6 / speed).toFixed(2)

  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent ${stripeH - 1}px,
          ${color}33 ${stripeH}px
        )`,
        backgroundSize: `100% ${stripeH * 2}px`,
        animation: `combo-scan-move ${dur}s linear infinite`,
        mixBlendMode: 'screen',
      }}
    />
  )
}

function getLayerKind(effect: EffectType): 'glow' | 'deco' | 'text' {
  if (['neon', 'glowpulse', 'fire', 'ice'].includes(effect)) return 'glow'
  if (['sparkle', 'noise', 'particles', 'matrixrain', 'confetti', 'gradientorb', 'spiralgalaxy', 'caustics'].includes(effect)) return 'deco'
  return 'text'
}

function EffectWrap({ effect, text, params }: { effect: EffectType; text: string; params: EffectParams }) {
  switch (effect) {
    case 'glitch': return <Glitch text={text} intensity={params.glitchIntensity ?? 5} speed={params.glitchSpeed ?? 2} />
    case 'neon': return <Neon text={text} color={params.neonColor ?? '#ff00ff'} glow={params.neonGlow ?? 10} flicker={params.neonFlicker ?? true} />
    case 'glowpulse': return <GlowPulse text={text} size={params.glowpulseSize ?? 40} speed={params.glowpulseSpeed ?? 2} color={params.glowpulseColor ?? '#ff88cc'} />
    case 'fire': return <Fire text={text} intensity={params.fireIntensity ?? 5} speed={params.fireSpeed ?? 2} />
    case 'ice': return <Ice text={text} sparkle={params.iceSparkle ?? 5} color={params.iceColor ?? '#88ccff'} speed={params.iceSpeed ?? 2} />
    case 'sparkle': return <Sparkle text={text} count={params.sparkleCount ?? 15} speed={params.sparkleSpeed ?? 2} />
    case 'liquid': return <Liquid text={text} intensity={params.liquidIntensity ?? 10} speed={params.liquidSpeed ?? 3} scale={params.liquidScale ?? 150} />
    case 'phosphor': return <Phosphor text={text} trail={params.phosphorTrail ?? 5} speed={params.phosphorSpeed ?? 2} />
    case 'shake': return <Shake text={text} intensity={params.shakeIntensity ?? 5} speed={params.shakeSpeed ?? 5} />
    default: return <></>
  }
}
