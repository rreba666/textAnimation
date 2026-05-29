import { useState, useMemo } from 'react'
import type { EffectType, EffectParams } from './types'
import TextInput from './components/TextInput'
import EffectSelector from './components/EffectSelector'
import ParamPanel from './components/ParamPanel'
import Preview from './components/Preview'
import CodeOutput from './components/CodeOutput'
// 十种动效组件
import Glitch from './effects/Glitch'
import Wave from './effects/Wave'
import Neon from './effects/Neon'
import Typewriter from './effects/Typewriter'
import Spotlight from './effects/Spotlight'
import Bounce from './effects/Bounce'
import GradientFlow from './effects/GradientFlow'
import Flicker from './effects/Flicker'
import Stagger from './effects/Stagger'
import Flip from './effects/Flip'
import Liquid from './effects/Liquid'
import Hologram from './effects/Hologram'
import Chromatic from './effects/Chromatic'
import Cube from './effects/Cube'
import Scanline from './effects/Scanline'
import Metal from './effects/Metal'
import Glass from './effects/Glass'
import Fire from './effects/Fire'
import Ice from './effects/Ice'
import Ink from './effects/Ink'
import Shake from './effects/Shake'
import Pulse from './effects/Pulse'
import Skew from './effects/Skew'
import Roll from './effects/Roll'
import Blast from './effects/Blast'
import Rave from './effects/Rave'
import Phosphor from './effects/Phosphor'
import Prism from './effects/Prism'
import Aurora from './effects/Aurora'
import Warp from './effects/Warp'
import GlowPulse from './effects/GlowPulse'
import Twist from './effects/Twist'
import Sparkle from './effects/Sparkle'
import Float from './effects/Float'
import Drip from './effects/Drip'
import ParticleField from './effects/ParticleField'
import GradientOrb from './effects/GradientOrb'
import MatrixRain from './effects/MatrixRain'
import Noise from './effects/Noise'
import MagneticButton from './effects/MagneticButton'
import ParallaxTilt from './effects/ParallaxTilt'
import MorphingLoader from './effects/MorphingLoader'
import PageTransition from './effects/PageTransition'
import SkeletonWave from './effects/SkeletonWave'
// 工具函数
import { generateCssCode } from './utils/codeGenerator'

/**
 * App 根组件 — 文字动画工坊主控台
 *
 * React 核心优势体现：
 * 1. 单向数据流：状态集中在顶层，通过 props 下传，数据流向清晰可追踪
 * 2. 组件化：每个 UI 模块独立封装，职责单一，便于复用和测试
 * 3. 声明式渲染：根据 effect 状态自动切换动画组件，无需手动操作 DOM
 * 4. useMemo 缓存：代码生成结果仅在参数变化时重新计算，避免不必要开销
 */
export default function App() {
  const [text, setText] = useState('Hello World')
  const [effect, setEffect] = useState<EffectType>('glitch')
  const [params, setParams] = useState<EffectParams>(defaultParams('glitch'))

  /** 切换动效时同步重置默认参数 */
  function handleEffectChange(next: EffectType) {
    setEffect(next)
    setParams(defaultParams(next))
  }

  /** 参数变更 — 浅合并到当前 params */
  function handleParamChange(key: string, value: number | string | boolean) {
    setParams((prev) => ({ ...prev, [key]: value }))
  }

  const code = useMemo(
    () => generateCssCode({ text, effect, params }),
    [text, effect, params],
  )

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-[#e8e8f0]">
      {/* 顶部标题栏 */}
      <header className="border-b border-[#2a2a4a] bg-[#0d0d1f] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <svg className="w-7 h-7 text-[#f0c060]" viewBox="0 0 24 24" fill="none">
            <path d="M15 4l5 5L8 21l-5-5L15 4z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <circle cx="7" cy="7" r="1.5" fill="#b8a0d4"/>
            <circle cx="13" cy="12" r="1" fill="#f0c060"/>
            <line x1="2" y1="22" x2="6" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <h1 className="text-xl font-bold tracking-wide">
            <span className="text-[#f0c060]">儿戏</span>
            <span className="text-[#ccc]">的文字动画工坊</span>
          </h1>
          <span className="ml-auto text-xs text-[#555577]">44 种动效</span>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-5xl mx-auto px-6 py-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TextInput text={text} onChange={setText} />
          <EffectSelector current={effect} onChange={handleEffectChange} />
        </div>

        <Preview>
          <EffectRenderer effect={effect} text={text} params={params} />
        </Preview>

        <ParamPanel effect={effect} params={params} onChange={handleParamChange} />

        <CodeOutput code={code} />
      </main>

      <footer className="text-center py-6 text-xs text-[#555577]">
        儿戏的动画工坊 — React + TypeScript + GSAP | 35 种文字动效，所见即所得
      </footer>
    </div>
  )
}

/**
 * 动效渲染器 — 根据 effect 类型渲染对应组件
 * 抽离为独立组件，保持 App 简洁
 */
function EffectRenderer({ effect, text, params }: {
  effect: EffectType; text: string; params: EffectParams
}) {
  switch (effect) {
    case 'glitch':
      return <Glitch text={text} intensity={params.glitchIntensity ?? 5} speed={params.glitchSpeed ?? 2} />
    case 'wave':
      return <Wave text={text} amplitude={params.waveAmplitude ?? 10} frequency={params.waveFrequency ?? 2} speed={params.waveSpeed ?? 1.5} />
    case 'neon':
      return <Neon text={text} color={params.neonColor ?? '#ff00ff'} glow={params.neonGlow ?? 10} flicker={params.neonFlicker ?? true} />
    case 'typewriter':
      return <Typewriter text={text} speed={params.typeSpeed ?? 80} cursorStyle={params.cursorStyle ?? 'line'} />
    case 'spotlight':
      return <Spotlight text={text} size={params.spotlightSize ?? 150} color={params.spotlightColor ?? '#ffffff'} />
    case 'bounce':
      return <Bounce text={text} height={params.bounceHeight ?? 20} speed={params.bounceSpeed ?? 1} stagger={params.bounceStagger ?? 60} />
    case 'gradient':
      return <GradientFlow text={text} color1={params.gradientColor1 ?? '#ff6b6b'} color2={params.gradientColor2 ?? '#4ecdc4'} speed={params.gradientSpeed ?? 4} angle={params.gradientAngle ?? 135} />
    case 'flicker':
      return <Flicker text={text} intensity={params.flickerIntensity ?? 5} color={params.flickerColor ?? '#ff8c42'} />
    case 'stagger':
      return <Stagger text={text} delay={params.staggerDelay ?? 80} distance={params.staggerDistance ?? 50} direction={params.staggerDirection ?? 'left'} />
    case 'flip':
      return <Flip text={text} angle={params.flipAngle ?? 180} speed={params.flipSpeed ?? 2} axis={params.flipAxis ?? 'X'} />
    case 'liquid':
      return <Liquid text={text} intensity={params.liquidIntensity ?? 10} speed={params.liquidSpeed ?? 3} scale={params.liquidScale ?? 150} />
    case 'hologram':
      return <Hologram text={text} color={params.hologramColor ?? '#4dc9f6'} angle={params.hologramAngle ?? 135} distance={params.hologramDistance ?? 6} />
    case 'chromatic':
      return <Chromatic text={text} offset={params.chromaticOffset ?? 5} angle={params.chromaticAngle ?? 0} />
    case 'cube':
      return <Cube text={text} size={params.cubeSize ?? 200} speed={params.cubeSpeed ?? 5} perspective={params.cubePerspective ?? 500} />
    case 'scanline':
      return <Scanline text={text} density={params.scanlineDensity ?? 10} speed={params.scanlineSpeed ?? 3} color={params.scanlineColor ?? '#4dff4d'} />
    case 'metal':
      return <Metal text={text} color={params.metalColor ?? '#d4af37'} angle={params.metalAngle ?? 135} shine={params.metalShine ?? 5} />
    case 'glass':
      return <Glass text={text} blur={params.glassBlur ?? 4} opacity={params.glassOpacity ?? 0.5} tint={params.glassTint ?? '#ffffff'} />
    case 'fire':
      return <Fire text={text} intensity={params.fireIntensity ?? 5} speed={params.fireSpeed ?? 2} />
    case 'ice':
      return <Ice text={text} sparkle={params.iceSparkle ?? 5} color={params.iceColor ?? '#88ccff'} speed={params.iceSpeed ?? 2} />
    case 'ink':
      return <Ink text={text} spread={params.inkSpread ?? 5} color={params.inkColor ?? '#ffffff'} speed={params.inkSpeed ?? 2} />
    case 'shake':
      return <Shake text={text} intensity={params.shakeIntensity ?? 5} speed={params.shakeSpeed ?? 5} />
    case 'pulse':
      return <Pulse text={text} scale={params.pulseScale ?? 1.2} speed={params.pulseSpeed ?? 1.5} />
    case 'skew':
      return <Skew text={text} angle={params.skewAngle ?? 15} speed={params.skewSpeed ?? 2} />
    case 'roll':
      return <Roll text={text} distance={params.rollDistance ?? 300} speed={params.rollSpeed ?? 2} direction={params.rollDirection ?? 'right'} />
    case 'blast':
      return <Blast text={text} distance={params.blastDistance ?? 150} speed={params.blastSpeed ?? 1} />
    case 'rave':
      return <Rave text={text} speed={params.raveSpeed ?? 2} color1={params.raveColor1 ?? '#ff0088'} color2={params.raveColor2 ?? '#00ffff'} />
    case 'phosphor':
      return <Phosphor text={text} trail={params.phosphorTrail ?? 5} speed={params.phosphorSpeed ?? 2} />
    case 'prism':
      return <Prism text={text} intensity={params.prismIntensity ?? 5} angle={params.prismAngle ?? 0} />
    case 'aurora':
      return <Aurora text={text} speed={params.auroraSpeed ?? 2} width={params.auroraWidth ?? 5} />
    case 'warp':
      return <Warp text={text} intensity={params.warpIntensity ?? 10} radius={params.warpRadius ?? 150} />
    case 'glowpulse':
      return <GlowPulse text={text} size={params.glowpulseSize ?? 40} speed={params.glowpulseSpeed ?? 2} color={params.glowpulseColor ?? '#ff88cc'} />
    case 'twist':
      return <Twist text={text} angle={params.twistAngle ?? 60} speed={params.twistSpeed ?? 2} />
    case 'sparkle':
      return <Sparkle text={text} count={params.sparkleCount ?? 15} speed={params.sparkleSpeed ?? 2} />
    case 'float':
      return <Float text={text} height={params.floatHeight ?? 20} speed={params.floatSpeed ?? 2} />
    case 'drip':
      return <Drip text={text} count={params.dripCount ?? 5} length={params.dripLength ?? 40} speed={params.dripSpeed ?? 2} />
    case 'particles':
      return <ParticleField count={params.particleCount ?? 200} speed={params.particleSpeed ?? 2} color={params.particleColor ?? '#4ecdc4'} />
    case 'gradientorb':
      return <GradientOrb count={params.orbCount ?? 4} speed={params.orbSpeed ?? 2} blur={params.orbBlur ?? 60} />
    case 'matrixrain':
      return <MatrixRain speed={params.rainSpeed ?? 2} density={params.rainDensity ?? 40} color={params.rainColor ?? '#0f0'} />
    case 'noise':
      return <Noise intensity={params.noiseIntensity ?? 5} speed={params.noiseSpeed ?? 2} color={params.noiseColor ?? 'mono'} />
    case 'magnet':
      return <MagneticButton text={text} strength={params.magnetStrength ?? 5} mode={params.magnetMode ?? 'attract'} />
    case 'parallaxtilt':
      return <ParallaxTilt text={text} angle={params.tiltAngle ?? 20} perspective={params.tiltPerspective ?? 600} />
    case 'morphing':
      return <MorphingLoader speed={params.morphSpeed ?? 1} style={params.morphStyle ?? 'all'} />
    case 'pagetransition':
      return <PageTransition text={text} direction={params.transitionDir ?? 'left'} speed={params.transitionSpeed ?? 1} />
    case 'skeletonwave':
      return <SkeletonWave text={text} speed={params.waveSpeed2 ?? 2} color={params.waveColor2 ?? '#b8a0d4'} />
  }
}

/** 默认参数映射 — 切换效果时重置 */
function defaultParams(effect: EffectType): EffectParams {
  switch (effect) {
    case 'glitch': return { glitchIntensity: 5, glitchSpeed: 2 }
    case 'wave': return { waveAmplitude: 10, waveFrequency: 2, waveSpeed: 1.5 }
    case 'neon': return { neonColor: '#ff00ff', neonGlow: 10, neonFlicker: true }
    case 'typewriter': return { typeSpeed: 80, cursorStyle: 'line' }
    case 'spotlight': return { spotlightSize: 150, spotlightColor: '#ffffff' }
    case 'bounce': return { bounceHeight: 20, bounceSpeed: 1, bounceStagger: 60 }
    case 'gradient': return { gradientColor1: '#ff6b6b', gradientColor2: '#4ecdc4', gradientSpeed: 4, gradientAngle: 135 }
    case 'flicker': return { flickerIntensity: 5, flickerColor: '#ff8c42' }
    case 'stagger': return { staggerDelay: 80, staggerDistance: 50, staggerDirection: 'left' }
    case 'flip': return { flipAngle: 180, flipSpeed: 2, flipAxis: 'X' }
    case 'liquid': return { liquidIntensity: 10, liquidSpeed: 3, liquidScale: 150 }
    case 'hologram': return { hologramColor: '#4dc9f6', hologramAngle: 135, hologramDistance: 6 }
    case 'chromatic': return { chromaticOffset: 5, chromaticAngle: 0 }
    case 'cube': return { cubeSize: 200, cubeSpeed: 5, cubePerspective: 500 }
    case 'scanline': return { scanlineDensity: 10, scanlineSpeed: 3, scanlineColor: '#4dff4d' }
    case 'metal': return { metalColor: '#d4af37', metalAngle: 135, metalShine: 5 }
    case 'glass': return { glassBlur: 4, glassOpacity: 0.5, glassTint: '#ffffff' }
    case 'fire': return { fireIntensity: 5, fireSpeed: 2 }
    case 'ice': return { iceSparkle: 5, iceColor: '#88ccff', iceSpeed: 2 }
    case 'ink': return { inkSpread: 5, inkColor: '#ffffff', inkSpeed: 2 }
    case 'shake': return { shakeIntensity: 5, shakeSpeed: 5 }
    case 'pulse': return { pulseScale: 1.2, pulseSpeed: 1.5 }
    case 'skew': return { skewAngle: 15, skewSpeed: 2 }
    case 'roll': return { rollDistance: 300, rollSpeed: 2, rollDirection: 'right' }
    case 'blast': return { blastDistance: 150, blastSpeed: 1 }
    case 'rave': return { raveSpeed: 2, raveColor1: '#ff0088', raveColor2: '#00ffff' }
    case 'phosphor': return { phosphorTrail: 5, phosphorSpeed: 2 }
    case 'prism': return { prismIntensity: 5, prismAngle: 0 }
    case 'aurora': return { auroraSpeed: 2, auroraWidth: 5 }
    case 'warp': return { warpIntensity: 10, warpRadius: 150 }
    case 'glowpulse': return { glowpulseSize: 40, glowpulseSpeed: 2, glowpulseColor: '#ff88cc' }
    case 'twist': return { twistAngle: 60, twistSpeed: 2 }
    case 'sparkle': return { sparkleCount: 15, sparkleSpeed: 2 }
    case 'float': return { floatHeight: 20, floatSpeed: 2 }
    case 'drip': return { dripCount: 5, dripLength: 40, dripSpeed: 2 }
    case 'particles': return { particleCount: 200, particleSpeed: 2, particleColor: '#4ecdc4' }
    case 'gradientorb': return { orbCount: 4, orbSpeed: 2, orbBlur: 60 }
    case 'matrixrain': return { rainSpeed: 2, rainDensity: 40, rainColor: '#0f0' }
    case 'noise': return { noiseIntensity: 5, noiseSpeed: 2, noiseColor: 'mono' }
    case 'magnet': return { magnetStrength: 5, magnetMode: 'attract' }
    case 'parallaxtilt': return { tiltAngle: 20, tiltPerspective: 600 }
    case 'morphing': return { morphSpeed: 1, morphStyle: 'all' }
    case 'pagetransition': return { transitionDir: 'left', transitionSpeed: 1 }
    case 'skeletonwave': return { waveSpeed2: 2, waveColor2: '#b8a0d4' }
  }
}
