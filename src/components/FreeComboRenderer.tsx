import type { EffectType } from '../types'
import Glitch from '../effects/Glitch'
import Neon from '../effects/Neon'
import Scanline from '../effects/Scanline'
import GlowPulse from '../effects/GlowPulse'
import Fire from '../effects/Fire'
import Ice from '../effects/Ice'
import Sparkle from '../effects/Sparkle'
import Liquid from '../effects/Liquid'
import Phosphor from '../effects/Phosphor'
import Shake from '../effects/Shake'
import GradientFlow from '../effects/GradientFlow'
import Flicker from '../effects/Flicker'
import Hologram from '../effects/Hologram'
import Chromatic from '../effects/Chromatic'
import Metal from '../effects/Metal'
import Glass from '../effects/Glass'
import Ink from '../effects/Ink'
import Warp from '../effects/Warp'
import Prism from '../effects/Prism'
import Aurora from '../effects/Aurora'
import FlagWave from '../effects/FlagWave'
import Melt from '../effects/Melt'
import Float from '../effects/Float'
import Twist from '../effects/Twist'
import Typewriter from '../effects/Typewriter'
import Bounce from '../effects/Bounce'
import Stagger from '../effects/Stagger'
import Flip from '../effects/Flip'
import Skew from '../effects/Skew'
import Roll from '../effects/Roll'
import Pulse from '../effects/Pulse'
import Blast from '../effects/Blast'
import ParticleField from '../effects/ParticleField'
import GradientOrb from '../effects/GradientOrb'
import MatrixRain from '../effects/MatrixRain'
import Noise from '../effects/Noise'
import Confetti from '../effects/Confetti'
import SpiralGalaxy from '../effects/SpiralGalaxy'
import Caustics from '../effects/Caustics'
import Drip from '../effects/Drip'
import Wave from '../effects/Wave'

interface Props {
  text: string
  effects: EffectType[]
}

/**
 * FreeComboRenderer — 用户自由组合渲染器
 * 每个效果渲染在独立的绝对定位层中，层与层互不干扰
 * 背景类效果（Canvas）铺满区域且仅渲染在最底层
 * 文字类效果层叠在上方
 */
export default function FreeComboRenderer({ text, effects }: Props) {
  // 分离背景层和文字层
  const bgEffects = effects.filter((e) =>
    ['particles', 'matrixrain', 'noise', 'gradientorb', 'spiralgalaxy', 'caustics', 'confetti'].includes(e)
  )
  const textEffects = effects.filter((e) => !bgEffects.includes(e))

  return (
    <div className="relative w-full min-h-[160px]">
      {/* 背景层：Canvas 全铺 */}
      {bgEffects.map((e, i) => (
        <div key={e} className="absolute inset-0 overflow-hidden rounded-lg" style={{ zIndex: i }}>
          <BgLayer effect={e} />
        </div>
      ))}
      {/* 文字层：每个效果独立一层 */}
      {textEffects.map((e, i) => (
        <div key={e} className="absolute inset-0 flex items-center justify-center" style={{ zIndex: bgEffects.length + i }}>
          <TextLayer effect={e} text={text} />
        </div>
      ))}
    </div>
  )
}

function BgLayer({ effect }: { effect: EffectType }) {
  switch (effect) {
    case 'particles': return <ParticleField count={200} speed={2} color="#4ecdc4" />
    case 'matrixrain': return <MatrixRain speed={3} density={40} color="#0f0" />
    case 'noise': return <Noise intensity={5} speed={2} color="mono" />
    case 'gradientorb': return <GradientOrb count={4} speed={2} blur={60} />
    case 'spiralgalaxy': return <SpiralGalaxy particles={200} speed={2} color="#b8a0d4" />
    case 'caustics': return <Caustics speed={2} intensity={5} color="#4ecdc4" />
    case 'confetti': return <Confetti count={80} spread={200} speed={2} />
    default: return <></>
  }
}

function TextLayer({ effect, text }: { effect: EffectType; text: string }) {
  switch (effect) {
    case 'glitch': return <Glitch text={text} intensity={5} speed={2} />
    case 'neon': return <Neon text={text} color="#ff00ff" glow={10} flicker />
    case 'scanline': return <Scanline text={text} density={10} speed={3} color="#4dff4d" />
    case 'glowpulse': return <GlowPulse text={text} size={30} speed={2} color="#ff88cc" />
    case 'fire': return <Fire text={text} intensity={5} speed={2} />
    case 'ice': return <Ice text={text} sparkle={5} color="#88ccff" speed={2} />
    case 'sparkle': return <Sparkle text={text} count={15} speed={2} />
    case 'liquid': return <Liquid text={text} intensity={10} speed={3} scale={150} />
    case 'phosphor': return <Phosphor text={text} trail={5} speed={2} />
    case 'shake': return <Shake text={text} intensity={5} speed={5} />
    case 'gradient': return <GradientFlow text={text} color1="#ff6b6b" color2="#4ecdc4" speed={4} angle={135} />
    case 'flicker': return <Flicker text={text} intensity={5} color="#ff8c42" />
    case 'hologram': return <Hologram text={text} color="#4dc9f6" angle={135} distance={6} />
    case 'chromatic': return <Chromatic text={text} offset={5} angle={0} />
    case 'metal': return <Metal text={text} color="#d4af37" angle={135} shine={5} />
    case 'glass': return <Glass text={text} blur={4} opacity={0.5} tint="#fff" />
    case 'ink': return <Ink text={text} spread={5} color="#fff" speed={2} />
    case 'warp': return <Warp text={text} intensity={10} radius={150} />
    case 'prism': return <Prism text={text} intensity={5} angle={0} />
    case 'aurora': return <Aurora text={text} speed={2} width={5} />
    case 'flagwave': return <FlagWave text={text} amplitude={20} frequency={2} speed={2} />
    case 'melt': return <Melt text={text} amount={5} speed={2} color="#ff6b6b" />
    case 'float': return <Float text={text} height={20} speed={2} />
    case 'typewriter': return <Typewriter text={text} speed={80} cursorStyle="line" />
    case 'twist': return <Twist text={text} angle={60} speed={2} />
    case 'flip': return <Flip text={text} angle={180} speed={2} axis="X" />
    case 'skew': return <Skew text={text} angle={15} speed={2} />
    case 'roll': return <Roll text={text} distance={300} speed={2} direction="right" />
    case 'pulse': return <Pulse text={text} scale={1.2} speed={1.5} />
    case 'bounce': return <Bounce text={text} height={20} speed={1} stagger={60} />
    case 'stagger': return <Stagger text={text} delay={80} distance={50} direction="left" />
    case 'blast': return <Blast text={text} distance={150} speed={1} />
    case 'wave': return <Wave text={text} amplitude={10} frequency={2} speed={1.5} />
    case 'drip': return <Drip text={text} count={5} length={40} speed={2} />
    default: return <></>
  }
}
