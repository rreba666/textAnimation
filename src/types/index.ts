/** 五种动效类型 */
export type EffectType = 'glitch' | 'wave' | 'neon' | 'typewriter' | 'spotlight'

/** 动效参数 — 各效果共用的可选字段 */
export interface EffectParams {
  // 故障效果 — 强度 1~10，速度 1~5
  glitchIntensity?: number
  glitchSpeed?: number
  // 波浪效果 — 振幅 1~30px，频率 1~5，速度 0.5~5s
  waveAmplitude?: number
  waveFrequency?: number
  waveSpeed?: number
  // 霓虹效果 — 颜色、辉光半径 1~30px、是否闪烁
  neonColor?: string
  neonGlow?: number
  neonFlicker?: boolean
  // 打字机效果 — 打字速度 10~200ms/字、光标样式
  typeSpeed?: number
  cursorStyle?: 'block' | 'line'
  // 聚光灯效果 — 光斑大小 50~300px、颜色
  spotlightSize?: number
  spotlightColor?: string
}

/** 动效完整状态 */
export interface AnimationState {
  text: string
  effect: EffectType
  params: EffectParams
}

/** 效果元信息 — 名称、描述、图标标识 */
export interface EffectMeta {
  key: EffectType
  name: string
  description: string
  /** TailwindCSS 图标类名，用作选择器按钮内的小标识 */
  iconChar: string
}

/** 参数滑块配置 — 用于动态生成调节面板 */
export interface ParamSlider {
  key: string
  label: string
  min: number
  max: number
  step: number
  unit?: string
}
