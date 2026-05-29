/** 二十五种动效类型 */
export type EffectType =
  | 'glitch' | 'wave' | 'neon' | 'typewriter' | 'spotlight'
  | 'bounce' | 'gradient' | 'flicker' | 'stagger' | 'flip'
  | 'liquid' | 'hologram' | 'chromatic' | 'cube' | 'scanline'
  | 'metal' | 'glass' | 'fire' | 'ice' | 'ink'
  | 'shake' | 'pulse' | 'skew' | 'roll' | 'blast'
  | 'rave' | 'phosphor' | 'prism' | 'aurora'
  | 'warp' | 'glowpulse' | 'twist'
  | 'sparkle' | 'float' | 'drip'

/** 动效参数 — 各效果共用可选字段，切换效果时重置为对应默认值 */
export interface EffectParams {
  // 故障效果
  glitchIntensity?: number
  glitchSpeed?: number
  // 波浪效果
  waveAmplitude?: number
  waveFrequency?: number
  waveSpeed?: number
  // 霓虹效果
  neonColor?: string
  neonGlow?: number
  neonFlicker?: boolean
  // 打字机效果
  typeSpeed?: number
  cursorStyle?: 'block' | 'line'
  // 聚光灯效果
  spotlightSize?: number
  spotlightColor?: string
  // 弹跳效果
  bounceHeight?: number
  bounceSpeed?: number
  bounceStagger?: number
  // 流动渐变
  gradientColor1?: string
  gradientColor2?: string
  gradientSpeed?: number
  gradientAngle?: number
  // 烛光闪烁
  flickerIntensity?: number
  flickerColor?: string
  // 交错动画
  staggerDelay?: number
  staggerDistance?: number
  staggerDirection?: 'left' | 'right' | 'top' | 'bottom'
  // 3D 翻转
  flipAngle?: number
  flipSpeed?: number
  flipAxis?: 'X' | 'Y'
  // 液体效果 — 强度 1~20，速度 1~5，缩放 50~300
  liquidIntensity?: number
  liquidSpeed?: number
  liquidScale?: number
  // 全息效果 — 颜色、角度 0~360、偏移 1~20px
  hologramColor?: string
  hologramAngle?: number
  hologramDistance?: number
  // 色差效果 — RGB 偏移 1~15px、偏移角度 0~360
  chromaticOffset?: number
  chromaticAngle?: number
  // 3D 立方体 — 大小 100~500、速度 1~10s、透视距离 200~1000
  cubeSize?: number
  cubeSpeed?: number
  cubePerspective?: number
  // 扫描线
  scanlineDensity?: number
  scanlineSpeed?: number
  scanlineColor?: string
  // 金属质感 — 颜色、反光角度 0~360、光泽强度 1~10
  metalColor?: string
  metalAngle?: number
  metalShine?: number
  // 毛玻璃 — 模糊 1~10、透明度 0.1~0.9、色调
  glassBlur?: number
  glassOpacity?: number
  glassTint?: string
  // 火焰 — 强度 1~10、燃烧速度 1~5
  fireIntensity?: number
  fireSpeed?: number
  // 冰霜 — 闪烁强度 1~10、冰色、闪烁速度 1~5
  iceSparkle?: number
  iceColor?: string
  iceSpeed?: number
  // 墨迹 — 扩散程度 1~10、墨色、扩散速度 1~5
  inkSpread?: number
  inkColor?: string
  inkSpeed?: number
  // 震动 — 抖动强度 1~10、抖动速度 1~10
  shakeIntensity?: number
  shakeSpeed?: number
  // 脉冲 — 缩放幅度 1.05~1.5、速度 0.5~5s
  pulseScale?: number
  pulseSpeed?: number
  // 倾斜 — 倾斜角度 5~45、速度 0.5~5s
  skewAngle?: number
  skewSpeed?: number
  // 滚动 — 滚动距离 100~500、速度 0.5~5s、方向
  rollDistance?: number
  rollSpeed?: number
  rollDirection?: 'left' | 'right'
  // 爆破
  blastDistance?: number
  blastSpeed?: number
  // 激光雨 — 速度 1~5、激光颜色组
  raveSpeed?: number
  raveColor1?: string
  raveColor2?: string
  // 磷光 — 拖尾长度 1~10、移动速度 1~5
  phosphorTrail?: number
  phosphorSpeed?: number
  // 棱镜 — 色散强度 1~10、角度
  prismIntensity?: number
  prismAngle?: number
  // 极光 — 流速 1~5、带宽 1~10
  auroraSpeed?: number
  auroraWidth?: number
  // 扭曲 — 强度 1~20、半径 50~300
  warpIntensity?: number
  warpRadius?: number
  // 光晕脉冲 — 光晕半径 10~100、速度 0.5~5、光晕颜色
  glowpulseSize?: number
  glowpulseSpeed?: number
  glowpulseColor?: string
  // 扭转 — 扭转角度 10~180、速度 1~5
  twistAngle?: number
  twistSpeed?: number
  // 星光 — 星星数量 5~30、闪烁速度 1~5
  sparkleCount?: number
  sparkleSpeed?: number
  // 漂浮 — 漂浮高度 5~50、速度 1~5
  floatHeight?: number
  floatSpeed?: number
  // 滴落 — 滴落数量 1~10、滴落长度 10~100、速度 1~5
  dripCount?: number
  dripLength?: number
  dripSpeed?: number
}

/** 动效完整状态 */
export interface AnimationState {
  text: string
  effect: EffectType
  params: EffectParams
}

/** 效果元信息 */
export interface EffectMeta {
  key: EffectType
  name: string
  description: string
  iconChar: string
}

/** 参数滑块配置 */
export interface ParamSlider {
  key: string
  label: string
  min: number
  max: number
  step: number
  unit?: string
}
