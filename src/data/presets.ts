import type { EffectType, EffectParams } from '../types'

export interface ComboEffect {
  effect: EffectType
  params: EffectParams
}

export interface Preset {
  id: string
  name: string
  description: string
  tags: string[]
  text: string
  combo: ComboEffect[]
  bg: ComboEffect[]
  color: string
}

export const PRESETS: Preset[] = [
  {
    id: 'cyberpunk',
    name: '赛博朋克',
    description: 'Neon 霓虹辉光 + Scanline 扫描线 + Glitch 故障文字',
    tags: ['科技', '酷炫', '暗黑'],
    color: '#ff00ff',
    text: 'CYBERPUNK',
    combo: [
      { effect: 'neon', params: { neonColor: '#ff00ff', neonGlow: 10, neonFlicker: true } },
      { effect: 'scanline', params: { scanlineDensity: 14, scanlineSpeed: 3, scanlineColor: '#ff44ff' } },
      { effect: 'glitch', params: { glitchIntensity: 6, glitchSpeed: 3 } },
    ],
    bg: [],
  },
  {
    id: 'magical-girl',
    name: '魔法少女',
    description: 'Sparkle 星光 + GlowPulse 光晕 + Ice 冰晶光环',
    tags: ['可爱', '梦幻', '少女'],
    color: '#ff88cc',
    text: '魔法少女',
    combo: [
      { effect: 'ice', params: { iceSparkle: 6, iceColor: '#ffaadd', iceSpeed: 2 } },
      { effect: 'sparkle', params: { sparkleCount: 24, sparkleSpeed: 2 } },
      { effect: 'glowpulse', params: { glowpulseSize: 35, glowpulseSpeed: 1.5, glowpulseColor: '#ff88cc' } },
    ],
    bg: [],
  },
  {
    id: 'matrix',
    name: '黑客帝国',
    description: 'Scanline 扫描 + Neon 绿辉光 + Phosphor 拖尾 + Shake 抖动',
    tags: ['复古', '极客', '终端'],
    color: '#00ff41',
    text: '> MATRIX _',
    combo: [
      { effect: 'neon', params: { neonColor: '#00ff41', neonGlow: 6, neonFlicker: false } },
      { effect: 'scanline', params: { scanlineDensity: 16, scanlineSpeed: 3, scanlineColor: '#00ff41' } },
      { effect: 'shake', params: { shakeIntensity: 1, shakeSpeed: 8 } },
      { effect: 'phosphor', params: { phosphorTrail: 8, phosphorSpeed: 2 } },
    ],
    bg: [],
  },
  {
    id: 'neon-city',
    name: '霓虹都市',
    description: 'GlowPulse 脉冲辉光 + Neon 霓虹 + Sparkle 星点',
    tags: ['炫酷', '都市', '夜景'],
    color: '#4488ff',
    text: 'NEON CITY',
    combo: [
      { effect: 'glowpulse', params: { glowpulseSize: 20, glowpulseSpeed: 2, glowpulseColor: '#4488ff' } },
      { effect: 'sparkle', params: { sparkleCount: 15, sparkleSpeed: 2 } },
      { effect: 'neon', params: { neonColor: '#4488ff', neonGlow: 16, neonFlicker: true } },
    ],
    bg: [],
  },
  {
    id: 'fire-storm',
    name: '火焰风暴',
    description: 'Fire 火焰辉光 + Sparkle 火星 + Glitch 故障',
    tags: ['激烈', '热血', '震撼'],
    color: '#ff4400',
    text: 'FIRE STORM',
    combo: [
      { effect: 'fire', params: { fireIntensity: 8, fireSpeed: 3 } },
      { effect: 'sparkle', params: { sparkleCount: 30, sparkleSpeed: 3 } },
      { effect: 'glitch', params: { glitchIntensity: 3, glitchSpeed: 4 } },
    ],
    bg: [],
  },
  {
    id: 'ice-castle',
    name: '冰霜城堡',
    description: 'Ice 冰霜辉光 + GlowPulse 极光 + Sparkle 冰晶',
    tags: ['冷艳', '梦幻', '纯净'],
    color: '#88ccff',
    text: 'ICE CASTLE',
    combo: [
      { effect: 'glowpulse', params: { glowpulseSize: 25, glowpulseSpeed: 2, glowpulseColor: '#88ccff' } },
      { effect: 'sparkle', params: { sparkleCount: 20, sparkleSpeed: 1.5 } },
      { effect: 'ice', params: { iceSparkle: 7, iceColor: '#88ccff', iceSpeed: 1.5 } },
    ],
    bg: [],
  },
  {
    id: 'liquid-metal',
    name: '液态金属',
    description: 'Neon 冷光 + Scanline + Liquid 液体扭曲 + Glitch',
    tags: ['科幻', '质感', '硬核'],
    color: '#c0c0d0',
    text: 'T-1000',
    combo: [
      { effect: 'neon', params: { neonColor: '#88ccff', neonGlow: 4, neonFlicker: false } },
      { effect: 'scanline', params: { scanlineDensity: 10, scanlineSpeed: 2, scanlineColor: '#c0c0d0' } },
      { effect: 'liquid', params: { liquidIntensity: 12, liquidSpeed: 2, liquidScale: 120 } },
    ],
    bg: [],
  },
  {
    id: 'retro-tv',
    name: '复古电视',
    description: 'Fire 暖光 + Scanline + Shake 抖动 + Phosphor 拖尾',
    tags: ['复古', '怀旧', '故障'],
    color: '#8a8a8a',
    text: 'CH 03',
    combo: [
      { effect: 'fire', params: { fireIntensity: 3, fireSpeed: 1 } },
      { effect: 'shake', params: { shakeIntensity: 3, shakeSpeed: 5 } },
      { effect: 'phosphor', params: { phosphorTrail: 4, phosphorSpeed: 1.5 } },
      { effect: 'scanline', params: { scanlineDensity: 10, scanlineSpeed: 2, scanlineColor: '#cccccc' } },
    ],
    bg: [],
  },
  {
    id: 'digital-rain',
    name: '数字暴雨',
    description: 'Neon 红辉光 + Scanline + Glitch + Shake',
    tags: ['故障', '数码', '混乱'],
    color: '#ff0044',
    text: 'ERROR 404',
    combo: [
      { effect: 'neon', params: { neonColor: '#ff0044', neonGlow: 8, neonFlicker: true } },
      { effect: 'scanline', params: { scanlineDensity: 18, scanlineSpeed: 5, scanlineColor: '#ff0044' } },
      { effect: 'shake', params: { shakeIntensity: 2, shakeSpeed: 7 } },
      { effect: 'glitch', params: { glitchIntensity: 8, glitchSpeed: 4 } },
    ],
    bg: [],
  },
  {
    id: 'ghost-light',
    name: '幽灵荧光',
    description: 'GlowPulse 脉冲 + Neon 霓虹 + Phosphor 拖尾幻影',
    tags: ['诡异', '神秘', '超现实'],
    color: '#4dc9f6',
    text: 'GHOST',
    combo: [
      { effect: 'glowpulse', params: { glowpulseSize: 20, glowpulseSpeed: 2, glowpulseColor: '#4dc9f6' } },
      { effect: 'neon', params: { neonColor: '#4dc9f6', neonGlow: 14, neonFlicker: true } },
      { effect: 'phosphor', params: { phosphorTrail: 8, phosphorSpeed: 2 } },
    ],
    bg: [],
  },
  {
    id: 'acid-trip',
    name: '迷幻酸浪',
    description: 'Neon 绿辉光 + Fire 热浪 + Liquid 液体扭曲',
    tags: ['迷幻', '疯狂', '实验'],
    color: '#88ff00',
    text: 'ACID',
    combo: [
      { effect: 'neon', params: { neonColor: '#88ff00', neonGlow: 6, neonFlicker: true } },
      { effect: 'fire', params: { fireIntensity: 4, fireSpeed: 4 } },
      { effect: 'liquid', params: { liquidIntensity: 15, liquidSpeed: 3, liquidScale: 80 } },
    ],
    bg: [],
  },
  {
    id: 'arctic-blast',
    name: '极地风暴',
    description: 'Ice 冰霜 + GlowPulse 寒光 + Sparkle 暴雪 + Shake 震动',
    tags: ['严寒', '风暴', '纯净'],
    color: '#ddeeff',
    text: 'BLIZZARD',
    combo: [
      { effect: 'glowpulse', params: { glowpulseSize: 18, glowpulseSpeed: 3, glowpulseColor: '#ddeeff' } },
      { effect: 'sparkle', params: { sparkleCount: 30, sparkleSpeed: 4 } },
      { effect: 'shake', params: { shakeIntensity: 4, shakeSpeed: 6 } },
      { effect: 'ice', params: { iceSparkle: 9, iceColor: '#ddeeff', iceSpeed: 2 } },
    ],
    bg: [],
  },
]
