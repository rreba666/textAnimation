import { useState, useMemo } from 'react'
import type { EffectType, EffectParams, TextStyle } from './types'
import TextInput from './components/TextInput'
import EffectSelector from './components/EffectSelector'
import ParamPanel from './components/ParamPanel'
import Preview from './components/Preview'
import CodeOutput from './components/CodeOutput'
import StylePanel from './components/StylePanel'
import PresetSelector from './components/PresetSelector'
import ComboRenderer from './components/ComboRenderer'
import type { Preset } from './data/presets'
import { getConflictingEffects } from './data/conflicts'
// GSAP 动效组件
import Wave from './effects/Wave'
import Bounce from './effects/Bounce'
import Stagger from './effects/Stagger'
import Blast from './effects/Blast'
import Float from './effects/Float'
import Shake from './effects/Shake'
import Pulse from './effects/Pulse'
import Skew from './effects/Skew'
import Flip from './effects/Flip'
import Roll from './effects/Roll'
import Glitch from './effects/Glitch'
import Neon from './effects/Neon'
import GlowPulse from './effects/GlowPulse'
import Fire from './effects/Fire'
import Ice from './effects/Ice'
import Typewriter from './effects/Typewriter'
import GradientFlow from './effects/GradientFlow'
import Flicker from './effects/Flicker'
import Sparkle from './effects/Sparkle'
import Phosphor from './effects/Phosphor'
import Liquid from './effects/Liquid'
import Scanline from './effects/Scanline'
import Hologram from './effects/Hologram'
import Chromatic from './effects/Chromatic'
import Metal from './effects/Metal'
import Glass from './effects/Glass'
import Ink from './effects/Ink'
import Warp from './effects/Warp'
import Prism from './effects/Prism'
import Aurora from './effects/Aurora'
import FlagWave from './effects/FlagWave'
import Melt from './effects/Melt'
import Twist from './effects/Twist'
import Drip from './effects/Drip'
// 工具
import { generateCssCode } from './utils/codeGenerator'

const DEFAULT_STYLE: TextStyle = {
  fontFamily: 'sans-serif', fontSize: 48, fontWeight: 700,
  color: '#ffffff', letterSpacing: 0,
}

export default function App() {
  const [text, setText] = useState('Hello World')
  const [style, setStyle] = useState<TextStyle>(DEFAULT_STYLE)
  const [activeEffects, setActiveEffects] = useState<EffectType[]>(['wave'])
  const [params, setParams] = useState<EffectParams>(defaultParams('wave'))
  const [combo, setCombo] = useState<Preset | null>(null)

  const primaryEffect = activeEffects[activeEffects.length - 1] ?? 'wave'

  function handleEffectToggle(e: EffectType) {
    setCombo(null)
    setActiveEffects((prev) => {
      if (prev.includes(e)) {
        const next = prev.filter((x) => x !== e)
        return next.length > 0 ? next : prev
      }
      const conflicts = getConflictingEffects(e, prev)
      return [...prev.filter((x) => !conflicts.includes(x)), e]
    })
  }

  function handleParamChange(key: string, value: number | string | boolean) {
    setParams((prev) => ({ ...prev, [key]: value }))
  }

  function handlePresetApply(preset: Preset) {
    setCombo(preset)
    setText(preset.text)
    const all = [...preset.bg, ...preset.combo]
    setActiveEffects([...new Set(all.map((c) => c.effect))])
    setParams(preset.combo[0]?.params ?? {})
  }

  const code = useMemo(
    () => generateCssCode({ text, effect: primaryEffect, params }),
    [text, primaryEffect, params],
  )

  // 文字样式对象
  const textStyle: React.CSSProperties = {
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    color: style.color,
    letterSpacing: style.letterSpacing,
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-[#e8e8f0] overflow-x-hidden flex flex-col">
      {/* 顶部标题栏 */}
      <header className="border-b border-[#2a2a4a] bg-[#0d0d1f] px-4 py-2 shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[#f0c060]" viewBox="0 0 24 24" fill="none">
            <path d="M15 4l5 5L8 21l-5-5L15 4z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
          <h1 className="text-sm font-bold"><span className="text-[#f0c060]">儿戏</span><span className="text-[#ccc]">动画工坊</span></h1>
          <div className="ml-auto">
            <PresetSelector onApply={handlePresetApply} />
          </div>
        </div>
      </header>

      {/* 主体：左右两栏 */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-3 p-3 max-w-[1400px] mx-auto w-full">
        {/* 左栏：预览 + 样式 */}
        <div className="flex flex-col gap-3">
          {/* 文字输入 */}
          <TextInput text={text} onChange={setText} />

          {/* 实时预览 */}
          <div className="flex-1 min-h-[200px]">
            <Preview>
              {combo ? (
                <ComboRenderer text={combo.text} combo={combo.combo} bg={combo.bg} />
              ) : (
                <EffectRenderer effect={primaryEffect} text={text} params={params} textStyle={textStyle} />
              )}
            </Preview>
          </div>

          {/* 样式调节面板 */}
          <StylePanel style={style} onChange={setStyle} />

          {/* 代码输出 */}
          <CodeOutput code={code} state={{ text, effect: primaryEffect, params }} />
        </div>

        {/* 右栏：效果选择 + 参数 + 组合 */}
        <div className="flex flex-col gap-3">
          {/* 动画效果选择 */}
          <EffectSelector selected={activeEffects} onToggle={handleEffectToggle} />

          {/* 动画参数调节 */}
          <ParamPanel effect={primaryEffect} params={params} onChange={handleParamChange} />

          {/* 组合模式状态 */}
          <div className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-lg p-3">
            <div className="text-xs text-[#8888aa] font-medium mb-1.5">组合/混搭</div>
            <div className="flex flex-wrap gap-1 min-h-[24px]">
              {activeEffects.map((e) => (
                <span key={e} className="text-[10px] px-1.5 py-0.5 rounded bg-[#b8a0d4]/20 text-[#b8a0d4] border border-[#b8a0d4]/30">
                  {e}
                </span>
              ))}
            </div>
            <div className="text-[10px] text-[#555] mt-1.5">
              {activeEffects.length > 1
                ? `${activeEffects.length} 种效果组合中`
                : '点击左侧效果标签叠加更多动画'}
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-2 text-[10px] text-[#444] border-t border-[#1a1a2e] shrink-0">
        儿戏动画工坊 — GSAP Timeline | {activeEffects.length} 种效果激活
      </footer>
    </div>
  )
}

/** 单效果渲染器 */
function EffectRenderer({ effect, text, params, textStyle }: {
  effect: EffectType; text: string; params: EffectParams; textStyle: React.CSSProperties
}) {
  // 应用用户文字样式到效果的容器上
  const wrap = (el: React.ReactNode, key?: string) => <span key={key} style={textStyle}>{el}</span>

  switch (effect) {
    case 'wave': return wrap(<Wave text={text} amplitude={params.waveAmplitude ?? 10} frequency={params.waveFrequency ?? 2} speed={params.waveSpeed ?? 1.5} />)
    case 'bounce': return wrap(<Bounce text={text} height={params.bounceHeight ?? 20} speed={params.bounceSpeed ?? 1} stagger={params.bounceStagger ?? 60} />)
    case 'stagger': return wrap(<Stagger text={text} delay={params.staggerDelay ?? 80} distance={params.staggerDistance ?? 50} direction={params.staggerDirection ?? 'left'} />)
    case 'blast': return wrap(<Blast text={text} distance={params.blastDistance ?? 150} speed={params.blastSpeed ?? 1} />)
    case 'float': return wrap(<Float text={text} height={params.floatHeight ?? 20} speed={params.floatSpeed ?? 2} />)
    case 'shake': return wrap(<Shake text={text} intensity={params.shakeIntensity ?? 5} speed={params.shakeSpeed ?? 5} />)
    case 'pulse': return wrap(<Pulse text={text} scale={params.pulseScale ?? 1.2} speed={params.pulseSpeed ?? 1.5} />)
    case 'skew': return wrap(<Skew text={text} angle={params.skewAngle ?? 15} speed={params.skewSpeed ?? 2} />)
    case 'flip': return wrap(<Flip text={text} angle={params.flipAngle ?? 180} speed={params.flipSpeed ?? 2} axis={params.flipAxis ?? 'X'} />)
    case 'roll': return wrap(<Roll text={text} distance={params.rollDistance ?? 300} speed={params.rollSpeed ?? 2} direction={params.rollDirection ?? 'right'} />)
    case 'glitch': return wrap(<Glitch text={text} intensity={params.glitchIntensity ?? 5} speed={params.glitchSpeed ?? 2} color1={params.glitchColor1} color2={params.glitchColor2} />)
    case 'neon': return wrap(<Neon text={text} color={params.neonColor ?? '#ff00ff'} glow={params.neonGlow ?? 10} flicker={params.neonFlicker ?? true} />)
    case 'glowpulse': return wrap(<GlowPulse text={text} size={params.glowpulseSize ?? 40} speed={params.glowpulseSpeed ?? 2} color={params.glowpulseColor ?? '#ff88cc'} />)
    case 'fire': return wrap(<Fire text={text} intensity={params.fireIntensity ?? 5} speed={params.fireSpeed ?? 2} />)
    case 'ice': return wrap(<Ice text={text} sparkle={params.iceSparkle ?? 5} color={params.iceColor ?? '#88ccff'} speed={params.iceSpeed ?? 2} />)
    case 'typewriter': return wrap(<Typewriter text={text} speed={params.typeSpeed ?? 80} cursorStyle={params.cursorStyle ?? 'line'} />)
    case 'gradient': return wrap(<GradientFlow text={text} color1={params.gradientColor1 ?? '#ff6b6b'} color2={params.gradientColor2 ?? '#4ecdc4'} speed={params.gradientSpeed ?? 4} angle={params.gradientAngle ?? 135} />)
    case 'flicker': return wrap(<Flicker text={text} intensity={params.flickerIntensity ?? 5} color={params.flickerColor ?? '#ff8c42'} />)
    case 'sparkle': return wrap(<Sparkle text={text} count={params.sparkleCount ?? 15} speed={params.sparkleSpeed ?? 2} />)
    case 'phosphor': return wrap(<Phosphor text={text} trail={params.phosphorTrail ?? 5} speed={params.phosphorSpeed ?? 2} color={params.phosphorColor} />)
    case 'liquid': return wrap(<Liquid text={text} intensity={params.liquidIntensity ?? 10} speed={params.liquidSpeed ?? 3} scale={params.liquidScale ?? 150} color={params.liquidColor} />)
    case 'scanline': return wrap(<Scanline text={text} density={params.scanlineDensity ?? 10} speed={params.scanlineSpeed ?? 3} color={params.scanlineColor ?? '#4dff4d'} />)
    case 'hologram': return wrap(<Hologram text={text} color={params.hologramColor ?? '#4dc9f6'} angle={params.hologramAngle ?? 135} distance={params.hologramDistance ?? 6} />)
    case 'chromatic': return wrap(<Chromatic text={text} offset={params.chromaticOffset ?? 5} angle={params.chromaticAngle ?? 0} />)
    case 'metal': return wrap(<Metal text={text} color={params.metalColor ?? '#d4af37'} angle={params.metalAngle ?? 135} shine={params.metalShine ?? 5} />)
    case 'glass': return wrap(<Glass text={text} blur={params.glassBlur ?? 4} opacity={params.glassOpacity ?? 0.5} tint={params.glassTint ?? '#ffffff'} />)
    case 'ink': return wrap(<Ink text={text} spread={params.inkSpread ?? 5} color={params.inkColor ?? '#ffffff'} speed={params.inkSpeed ?? 2} />)
    case 'warp': return wrap(<Warp text={text} intensity={params.warpIntensity ?? 10} radius={params.warpRadius ?? 150} />)
    case 'prism': return wrap(<Prism text={text} intensity={params.prismIntensity ?? 5} angle={params.prismAngle ?? 0} />)
    case 'aurora': return wrap(<Aurora text={text} speed={params.auroraSpeed ?? 2} width={params.auroraWidth ?? 5} />)
    case 'flagwave': return wrap(<FlagWave text={text} amplitude={params.flagAmplitude ?? 20} frequency={params.flagFrequency ?? 2} speed={params.flagSpeed ?? 2} />)
    case 'melt': return wrap(<Melt text={text} amount={params.meltAmount ?? 5} speed={params.meltSpeed ?? 2} color={params.meltColor ?? '#ff6b6b'} />)
    case 'twist': return wrap(<Twist text={text} angle={params.twistAngle ?? 60} speed={params.twistSpeed ?? 2} />)
    case 'drip': return wrap(<Drip text={text} count={params.dripCount ?? 5} length={params.dripLength ?? 40} speed={params.dripSpeed ?? 2} />)
    default: return <span style={textStyle}>{text || '选择一种动效'}</span>
  }
}

function defaultParams(effect: EffectType): EffectParams {
  switch (effect) {
    case 'wave': return { waveAmplitude: 10, waveFrequency: 2, waveSpeed: 1.5 }
    case 'bounce': return { bounceHeight: 20, bounceSpeed: 1, bounceStagger: 60 }
    case 'stagger': return { staggerDelay: 80, staggerDistance: 50, staggerDirection: 'left' }
    case 'blast': return { blastDistance: 150, blastSpeed: 1 }
    case 'float': return { floatHeight: 20, floatSpeed: 2 }
    case 'shake': return { shakeIntensity: 5, shakeSpeed: 5 }
    case 'pulse': return { pulseScale: 1.2, pulseSpeed: 1.5 }
    case 'skew': return { skewAngle: 15, skewSpeed: 2 }
    case 'flip': return { flipAngle: 180, flipSpeed: 2, flipAxis: 'X' }
    default: return {}
  }
}
