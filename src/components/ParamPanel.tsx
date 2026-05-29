import type { EffectType, EffectParams } from '../types'
import type { ParamSlider } from '../types'

interface Props {
  effect: EffectType
  params: EffectParams
  onChange: (key: string, value: number | string | boolean) => void
}

/**
 * 参数调节面板 — 根据当前动效动态显示对应的滑块/颜色选择器
 * 每种效果只渲染自己需要的参数，避免无效 DOM
 */
export default function ParamPanel({ effect, params, onChange }: Props) {
  // 根据效果类型获取对应的滑块配置
  const sliders = getSliders(effect)

  if (sliders.length === 0) return null

  return (
    <div className="w-full">
      <label className="block text-sm text-[#8888aa] mb-2">参数调节</label>
      <div className="space-y-3 bg-[#1a1a2e] border border-[#2a2a4a] rounded-lg p-4">
        {sliders.map((s) => (
          <SliderRow
            key={s.key}
            config={s}
            value={getParamValue(params, s.key)}
            onChange={(v) => onChange(s.key, v)}
          />
        ))}

        {/* 霓虹颜色选择器 */}
        {effect === 'neon' && (
          <ColorRow
            label="辉光颜色"
            value={params.neonColor ?? '#ff00ff'}
            onChange={(v) => onChange('neonColor', v)}
          />
        )}

        {/* 霓虹闪烁开关 */}
        {effect === 'neon' && (
          <ToggleRow
            label="呼吸闪烁"
            checked={params.neonFlicker ?? true}
            onChange={(v) => onChange('neonFlicker', v)}
          />
        )}

        {/* 聚光灯颜色 */}
        {effect === 'spotlight' && (
          <ColorRow
            label="光斑颜色"
            value={params.spotlightColor ?? '#ffffff'}
            onChange={(v) => onChange('spotlightColor', v)}
          />
        )}

        {/* 光标样式选择（打字机） */}
        {effect === 'typewriter' && (
          <SelectRow
            label="光标样式"
            value={params.cursorStyle ?? 'line'}
            options={[
              { value: 'line', label: '竖线 |' },
              { value: 'block', label: '方块 █' },
            ]}
            onChange={(v) => onChange('cursorStyle', v)}
          />
        )}
      </div>
    </div>
  )
}

/** 滑块行子组件 — 抽离以减少重复代码 */
function SliderRow({ config, value, onChange }: {
  config: ParamSlider
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#8888aa] w-16 shrink-0">{config.label}</span>
      <input
        type="range"
        min={config.min}
        max={config.max}
        step={config.step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-1.5 rounded-full appearance-none bg-[#2a2a4a] cursor-pointer
                   accent-[#b8a0d4] [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                   [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#b8a0d4]
                   [&::-webkit-slider-thumb]:shadow-md"
      />
      <span className="text-xs text-[#ccc] w-12 text-right tabular-nums">
        {value}{config.unit ?? ''}
      </span>
    </div>
  )
}

/** 颜色选择器行 */
function ColorRow({ label, value, onChange }: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#8888aa] w-16 shrink-0">{label}</span>
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent
                     [&::-webkit-color-swatch-wrapper]:p-0
                     [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-0"
        />
      </div>
      <span className="text-xs text-[#ccc] font-mono">{value}</span>
    </div>
  )
}

/** 开关行 */
function ToggleRow({ label, checked, onChange }: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#8888aa] w-16 shrink-0">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
          checked ? 'bg-[#b8a0d4]' : 'bg-[#2a2a4a]'
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}

/** 下拉选择行 */
function SelectRow({ label, value, options, onChange }: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#8888aa] w-16 shrink-0">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#0a0a1a] border border-[#2a2a4a] rounded px-2 py-1 text-sm text-[#ccc] outline-none
                   focus:border-[#b8a0d4]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

/* ============================================
   参数配置映射
   ============================================ */

/** 根据效果返回对应的滑块配置列表 */
function getSliders(effect: EffectType): ParamSlider[] {
  switch (effect) {
    case 'glitch':
      return [
        { key: 'glitchIntensity', label: '故障强度', min: 1, max: 10, step: 1 },
        { key: 'glitchSpeed', label: '动画速度', min: 1, max: 5, step: 1 },
      ]
    case 'wave':
      return [
        { key: 'waveAmplitude', label: '振幅', min: 1, max: 30, step: 1, unit: 'px' },
        { key: 'waveFrequency', label: '频率', min: 1, max: 5, step: 1 },
        { key: 'waveSpeed', label: '速度', min: 0.5, max: 5, step: 0.5, unit: 's' },
      ]
    case 'neon':
      return [
        { key: 'neonGlow', label: '辉光半径', min: 1, max: 30, step: 1, unit: 'px' },
      ]
    case 'typewriter':
      return [
        { key: 'typeSpeed', label: '打字速度', min: 10, max: 200, step: 10, unit: 'ms' },
      ]
    case 'spotlight':
      return [
        { key: 'spotlightSize', label: '光斑大小', min: 50, max: 300, step: 10, unit: 'px' },
      ]
  }
}

/** 安全获取参数值，带默认值兜底 */
function getParamValue(params: EffectParams, key: string): number {
  const defaults: Record<string, number> = {
    glitchIntensity: 5,
    glitchSpeed: 2,
    waveAmplitude: 10,
    waveFrequency: 2,
    waveSpeed: 1.5,
    neonGlow: 10,
    typeSpeed: 80,
    spotlightSize: 150,
  }
  const val = (params as Record<string, unknown>)[key]
  return typeof val === 'number' ? val : (defaults[key] ?? 0)
}
