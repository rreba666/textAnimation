/** 动效分类 */
export type EffectCategory = 'text' | 'background' | 'interaction' | 'transition' | '3d' | 'light' | 'distort' | 'creative' | 'scroll' | 'decor'

/** 五十三种动效类型 */
export type EffectType =
  // 文字动效
  | 'glitch' | 'wave' | 'neon' | 'typewriter' | 'spotlight'
  | 'bounce' | 'gradient' | 'flicker' | 'stagger' | 'flip'
  | 'liquid' | 'hologram' | 'chromatic' | 'cube' | 'scanline'
  | 'metal' | 'glass' | 'fire' | 'ice' | 'ink'
  | 'shake' | 'pulse' | 'skew' | 'roll' | 'blast'
  | 'rave' | 'phosphor' | 'prism' | 'aurora'
  | 'warp' | 'glowpulse' | 'twist'
  | 'sparkle' | 'float' | 'drip'
  // 背景特效
  | 'particles' | 'gradientorb' | 'matrixrain' | 'noise'
  // 鼠标交互
  | 'magnet' | 'parallaxtilt'
  // 加载/转场
  | 'morphing' | 'pagetransition' | 'skeletonwave'
  // 3D 空间
  | 'floatcube' | 'depthcards' | 'spiralgalaxy'
  // 光影/反射
  | 'glossy' | 'lensflare' | 'caustics'
  // 扭曲/变形
  | 'flagwave' | 'melt'
  // 创意/趣味
  | 'confetti'
  // 鼠标交互（扩展）
  | 'ripplebg' | 'customcursor' | 'hoverglow' | 'dragrotate'
  // 加载/进度
  | 'circularprogress'
  // 数字/滚动
  | 'countup' | 'marquee'
  // 背景/装饰
  | 'animatedborder' | 'blob'

/** 动效参数 */
export interface EffectParams {
  // ===== 文字动效 =====
  glitchIntensity?: number; glitchSpeed?: number; glitchColor1?: string; glitchColor2?: string
  waveAmplitude?: number; waveFrequency?: number; waveSpeed?: number
  neonColor?: string; neonGlow?: number; neonFlicker?: boolean
  typeSpeed?: number; cursorStyle?: 'block' | 'line'
  spotlightSize?: number; spotlightColor?: string
  bounceHeight?: number; bounceSpeed?: number; bounceStagger?: number
  gradientColor1?: string; gradientColor2?: string; gradientSpeed?: number; gradientAngle?: number
  flickerIntensity?: number; flickerColor?: string
  staggerDelay?: number; staggerDistance?: number; staggerDirection?: 'left' | 'right' | 'top' | 'bottom'
  flipAngle?: number; flipSpeed?: number; flipAxis?: 'X' | 'Y'
  liquidIntensity?: number; liquidSpeed?: number; liquidScale?: number; liquidColor?: string
  hologramColor?: string; hologramAngle?: number; hologramDistance?: number
  chromaticOffset?: number; chromaticAngle?: number
  cubeSize?: number; cubeSpeed?: number; cubePerspective?: number
  scanlineDensity?: number; scanlineSpeed?: number; scanlineColor?: string
  metalColor?: string; metalAngle?: number; metalShine?: number
  glassBlur?: number; glassOpacity?: number; glassTint?: string
  fireIntensity?: number; fireSpeed?: number
  iceSparkle?: number; iceColor?: string; iceSpeed?: number
  inkSpread?: number; inkColor?: string; inkSpeed?: number
  shakeIntensity?: number; shakeSpeed?: number
  pulseScale?: number; pulseSpeed?: number
  skewAngle?: number; skewSpeed?: number
  rollDistance?: number; rollSpeed?: number; rollDirection?: 'left' | 'right'
  blastDistance?: number; blastSpeed?: number
  raveSpeed?: number; raveColor1?: string; raveColor2?: string
  phosphorTrail?: number; phosphorSpeed?: number; phosphorColor?: string
  prismIntensity?: number; prismAngle?: number
  auroraSpeed?: number; auroraWidth?: number
  warpIntensity?: number; warpRadius?: number
  glowpulseSize?: number; glowpulseSpeed?: number; glowpulseColor?: string
  twistAngle?: number; twistSpeed?: number
  sparkleCount?: number; sparkleSpeed?: number
  floatHeight?: number; floatSpeed?: number
  dripCount?: number; dripLength?: number; dripSpeed?: number
  // ===== 背景特效 =====
  particleCount?: number; particleSpeed?: number; particleColor?: string
  orbCount?: number; orbSpeed?: number; orbBlur?: number
  rainSpeed?: number; rainDensity?: number; rainColor?: string
  noiseIntensity?: number; noiseSpeed?: number; noiseColor?: string
  // ===== 鼠标交互 =====
  magnetStrength?: number; magnetMode?: 'attract' | 'repel'
  tiltAngle?: number; tiltPerspective?: number
  // ===== 加载/转场 =====
  morphSpeed?: number; morphStyle?: 'circle-square' | 'circle-triangle' | 'all'
  transitionDir?: 'left' | 'right' | 'up' | 'down' | 'fade'; transitionSpeed?: number
  waveSpeed2?: number; waveColor2?: string
  // ===== 3D 空间 =====
  cubeFloatSize?: number; cubeFloatSpeed?: number; cubeFloatColor?: string
  depthLayers?: number; depthAngle?: number; depthSpeed?: number
  galaxyParticles?: number; galaxySpeed?: number; galaxyColor?: string
  // ===== 光影/反射 =====
  reflectBlur?: number; reflectDistance?: number; reflectOpacity?: number
  flareIntensity?: number; flareColor?: string; flareAngle?: number
  causticSpeed?: number; causticIntensity?: number; causticColor?: string
  // ===== 扭曲/变形 =====
  flagAmplitude?: number; flagFrequency?: number; flagSpeed?: number
  meltAmount?: number; meltSpeed?: number; meltColor?: string
  // ===== 创意/趣味 =====
  confettiCount?: number; confettiSpread?: number; confettiSpeed?: number
  // ===== 鼠标交互（扩展） =====
  rippleBgSize?: number; rippleBgSpeed?: number; rippleBgColor?: string
  cursorSize?: number; cursorTrail?: number; cursorColor?: string
  glowRadius?: number; glowIntensity?: number; glowColor?: string
  dragSpeed?: number; dragAxis?: 'xy' | 'x' | 'y'
  // ===== 加载/进度 =====
  progressValue?: number; progressSpeed?: number; progressColor?: string
  // ===== 数字/滚动 =====
  countFrom?: number; countTo?: number; countSpeed?: number
  marqueeSpeed?: number; marqueeDirection?: 'left' | 'right'
  // ===== 背景/装饰 =====
  borderSpeed?: number; borderWidth?: number; borderColor1?: string; borderColor2?: string
  blobCount?: number; blobSpeed?: number; blobColor?: string
}

export interface AnimationState {
  text: string
  effect: EffectType
  params: EffectParams
}

export interface EffectMeta {
  key: EffectType
  name: string
  description: string
  category: EffectCategory
  iconChar: string
}

export interface ParamSlider {
  key: string; label: string; min: number; max: number; step: number; unit?: string
}
