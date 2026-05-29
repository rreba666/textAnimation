import type { EffectType, EffectParams, ParamSlider } from '../types'

interface Props {
  effect: EffectType
  params: EffectParams
  onChange: (key: string, value: number | string | boolean) => void
}

/**
 * 参数调节面板 — 根据当前动效动态显示对应的滑块/颜色/选择器
 * 每种效果只渲染自己需要的参数，避免无效 DOM
 */
export default function ParamPanel({ effect, params, onChange }: Props) {
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

        {/* 霓虹颜色 */}
        {effect === 'neon' && (
          <ColorRow label="辉光颜色" value={params.neonColor ?? '#ff00ff'} onChange={(v) => onChange('neonColor', v)} />
        )}
        {/* 霓虹闪烁开关 */}
        {effect === 'neon' && (
          <ToggleRow label="呼吸闪烁" checked={params.neonFlicker ?? true} onChange={(v) => onChange('neonFlicker', v)} />
        )}

        {/* 聚光灯颜色 */}
        {effect === 'spotlight' && (
          <ColorRow label="光斑颜色" value={params.spotlightColor ?? '#ffffff'} onChange={(v) => onChange('spotlightColor', v)} />
        )}

        {/* 打字机光标样式 */}
        {effect === 'typewriter' && (
          <SelectRow label="光标样式" value={params.cursorStyle ?? 'line'}
            options={[{ value: 'line', label: '竖线 |' }, { value: 'block', label: '方块 █' }]}
            onChange={(v) => onChange('cursorStyle', v)} />
        )}

        {/* 渐变双色 */}
        {effect === 'gradient' && (
          <>
            <ColorRow label="起始色" value={params.gradientColor1 ?? '#ff6b6b'} onChange={(v) => onChange('gradientColor1', v)} />
            <ColorRow label="结束色" value={params.gradientColor2 ?? '#4ecdc4'} onChange={(v) => onChange('gradientColor2', v)} />
          </>
        )}

        {/* 烛光颜色 */}
        {effect === 'flicker' && (
          <ColorRow label="烛光颜色" value={params.flickerColor ?? '#ff8c42'} onChange={(v) => onChange('flickerColor', v)} />
        )}

        {/* 交错方向 */}
        {effect === 'stagger' && (
          <SelectRow label="飞入方向" value={params.staggerDirection ?? 'left'}
            options={[
              { value: 'left', label: '自左' },
              { value: 'right', label: '自右' },
              { value: 'top', label: '自上' },
              { value: 'bottom', label: '自下' },
            ]}
            onChange={(v) => onChange('staggerDirection', v)} />
        )}

        {/* 翻转轴 */}
        {effect === 'flip' && (
          <SelectRow label="翻转轴" value={params.flipAxis ?? 'X'}
            options={[{ value: 'X', label: 'X 轴（水平）' }, { value: 'Y', label: 'Y 轴（垂直）' }]}
            onChange={(v) => onChange('flipAxis', v)} />
        )}

        {/* 全息颜色 */}
        {effect === 'hologram' && (
          <ColorRow label="全息色" value={params.hologramColor ?? '#4dc9f6'} onChange={(v) => onChange('hologramColor', v)} />
        )}

        {/* 扫描线颜色 */}
        {effect === 'scanline' && (
          <ColorRow label="扫描线色" value={params.scanlineColor ?? '#4dff4d'} onChange={(v) => onChange('scanlineColor', v)} />
        )}

        {/* 金属颜色 */}
        {effect === 'metal' && (
          <ColorRow label="金属色" value={params.metalColor ?? '#d4af37'} onChange={(v) => onChange('metalColor', v)} />
        )}

        {/* 毛玻璃色调 */}
        {effect === 'glass' && (
          <ColorRow label="玻璃色调" value={params.glassTint ?? '#ffffff'} onChange={(v) => onChange('glassTint', v)} />
        )}

        {/* 冰晶颜色 */}
        {effect === 'ice' && (
          <ColorRow label="冰晶色" value={params.iceColor ?? '#88ccff'} onChange={(v) => onChange('iceColor', v)} />
        )}

        {/* 光晕脉冲颜色 */}
        {effect === 'glowpulse' && (
          <ColorRow label="光晕颜色" value={params.glowpulseColor ?? '#ff88cc'} onChange={(v) => onChange('glowpulseColor', v)} />
        )}

        {/* 墨迹颜色 */}
        {effect === 'ink' && (
          <ColorRow label="墨色" value={params.inkColor ?? '#ffffff'} onChange={(v) => onChange('inkColor', v)} />
        )}

        {/* 滚动方向 */}
        {effect === 'roll' && (
          <SelectRow label="滚动方向" value={params.rollDirection ?? 'right'}
            options={[{ value: 'left', label: '自左' }, { value: 'right', label: '自右' }]}
            onChange={(v) => onChange('rollDirection', v)} />
        )}

        {/* 激光雨 */}
        {effect === 'rave' && (<>
          <ColorRow label="激光色1" value={params.raveColor1 ?? '#ff0088'} onChange={(v) => onChange('raveColor1', v)} />
          <ColorRow label="激光色2" value={params.raveColor2 ?? '#00ffff'} onChange={(v) => onChange('raveColor2', v)} />
        </>)}
        {/* 粒子 & 代码雨 & 拖尾 & 骨架波浪颜色 */}
        {effect === 'particles' && (
          <ColorRow label="粒子颜色" value={params.particleColor ?? '#4ecdc4'} onChange={(v) => onChange('particleColor', v)} />
        )}
        {effect === 'matrixrain' && (
          <ColorRow label="雨滴颜色" value={params.rainColor ?? '#0f0'} onChange={(v) => onChange('rainColor', v)} />
        )}
        {effect === 'skeletonwave' && (
          <ColorRow label="波浪颜色" value={params.waveColor2 ?? '#b8a0d4'} onChange={(v) => onChange('waveColor2', v)} />
        )}
        {effect === 'noise' && (
          <SelectRow label="噪点模式" value={params.noiseColor ?? 'mono'}
            options={[{ value: 'mono', label: '黑白' }, { value: 'color', label: '彩色' }]}
            onChange={(v) => onChange('noiseColor', v)} />
        )}
        {effect === 'magnet' && (
          <SelectRow label="磁力模式" value={params.magnetMode ?? 'attract'}
            options={[{ value: 'attract', label: '吸引' }, { value: 'repel', label: '排斥' }]}
            onChange={(v) => onChange('magnetMode', v)} />
        )}
        {effect === 'morphing' && (
          <SelectRow label="变形模式" value={params.morphStyle ?? 'all'}
            options={[{ value: 'circle-square', label: '圆⇄方' }, { value: 'circle-triangle', label: '圆⇄三角' }, { value: 'all', label: '全形态' }]}
            onChange={(v) => onChange('morphStyle', v)} />
        )}
        {effect === 'pagetransition' && (
          <SelectRow label="转场方向" value={params.transitionDir ?? 'left'}
            options={['left','right','up','down','fade'].map((d) => ({ value: d, label: {left:'自左',right:'自右',up:'自上',down:'自下',fade:'淡入淡出'}[d] ?? d }))}
            onChange={(v) => onChange('transitionDir', v)} />
        )}
      </div>
    </div>
  )
}

/* ========== 子组件 ========== */

function SliderRow({ config, value, onChange }: {
  config: ParamSlider; value: number; onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#8888aa] w-16 shrink-0">{config.label}</span>
      <input
        type="range" min={config.min} max={config.max} step={config.step}
        value={value} onChange={(e) => onChange(parseFloat(e.target.value))}
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

function ColorRow({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#8888aa] w-16 shrink-0">{label}</span>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent
                   [&::-webkit-color-swatch-wrapper]:p-0
                   [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-0" />
      <span className="text-xs text-[#ccc] font-mono">{value}</span>
    </div>
  )
}

function ToggleRow({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#8888aa] w-16 shrink-0">{label}</span>
      <button onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
          checked ? 'bg-[#b8a0d4]' : 'bg-[#2a2a4a]'}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

function SelectRow({ label, value, options, onChange }: {
  label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#8888aa] w-16 shrink-0">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="bg-[#0a0a1a] border border-[#2a2a4a] rounded px-2 py-1 text-sm text-[#ccc] outline-none focus:border-[#b8a0d4]">
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
    case 'bounce':
      return [
        { key: 'bounceHeight', label: '弹跳高度', min: 1, max: 50, step: 2, unit: 'px' },
        { key: 'bounceSpeed', label: '弹跳速度', min: 0.5, max: 3, step: 0.25, unit: 's' },
        { key: 'bounceStagger', label: '字符延迟', min: 10, max: 200, step: 10, unit: 'ms' },
      ]
    case 'gradient':
      return [
        { key: 'gradientSpeed', label: '流动速度', min: 1, max: 10, step: 1, unit: 's' },
        { key: 'gradientAngle', label: '渐变角度', min: 0, max: 360, step: 15, unit: 'deg' },
      ]
    case 'flicker':
      return [
        { key: 'flickerIntensity', label: '闪烁强度', min: 1, max: 10, step: 1 },
      ]
    case 'stagger':
      return [
        { key: 'staggerDelay', label: '交错延迟', min: 10, max: 200, step: 10, unit: 'ms' },
        { key: 'staggerDistance', label: '位移距离', min: 10, max: 100, step: 10, unit: 'px' },
      ]
    case 'flip':
      return [
        { key: 'flipAngle', label: '翻转角度', min: 30, max: 360, step: 15, unit: 'deg' },
        { key: 'flipSpeed', label: '翻转速度', min: 0.5, max: 5, step: 0.5, unit: 's' },
      ]
    case 'liquid':
      return [
        { key: 'liquidIntensity', label: '扭曲强度', min: 1, max: 20, step: 1 },
        { key: 'liquidSpeed', label: '流动速度', min: 1, max: 5, step: 1 },
        { key: 'liquidScale', label: '噪点缩放', min: 50, max: 300, step: 10 },
      ]
    case 'hologram':
      return [
        { key: 'hologramAngle', label: '扫光角度', min: 0, max: 360, step: 15, unit: 'deg' },
        { key: 'hologramDistance', label: '叠影偏移', min: 1, max: 20, step: 1, unit: 'px' },
      ]
    case 'chromatic':
      return [
        { key: 'chromaticOffset', label: '色散偏移', min: 1, max: 15, step: 1, unit: 'px' },
        { key: 'chromaticAngle', label: '偏移角度', min: 0, max: 360, step: 15, unit: 'deg' },
      ]
    case 'cube':
      return [
        { key: 'cubeSize', label: '立方体大小', min: 100, max: 500, step: 20, unit: 'px' },
        { key: 'cubeSpeed', label: '旋转速度', min: 1, max: 10, step: 1, unit: 's' },
        { key: 'cubePerspective', label: '透视距离', min: 200, max: 1000, step: 50, unit: 'px' },
      ]
    case 'scanline':
      return [
        { key: 'scanlineDensity', label: '扫描线密度', min: 2, max: 20, step: 1 },
        { key: 'scanlineSpeed', label: '移动速度', min: 1, max: 10, step: 1, unit: 's' },
      ]
    case 'metal':
      return [
        { key: 'metalAngle', label: '反光角度', min: 0, max: 360, step: 15, unit: 'deg' },
        { key: 'metalShine', label: '光泽强度', min: 1, max: 10, step: 1 },
      ]
    case 'glass':
      return [
        { key: 'glassBlur', label: '模糊度', min: 1, max: 10, step: 1 },
        { key: 'glassOpacity', label: '透明度', min: 0.1, max: 0.9, step: 0.1 },
      ]
    case 'fire':
      return [
        { key: 'fireIntensity', label: '火焰强度', min: 1, max: 10, step: 1 },
        { key: 'fireSpeed', label: '燃烧速度', min: 1, max: 5, step: 1 },
      ]
    case 'ice':
      return [
        { key: 'iceSparkle', label: '闪烁强度', min: 1, max: 10, step: 1 },
        { key: 'iceSpeed', label: '闪烁速度', min: 1, max: 5, step: 1 },
      ]
    case 'ink':
      return [
        { key: 'inkSpread', label: '扩散程度', min: 1, max: 10, step: 1 },
        { key: 'inkSpeed', label: '扩散速度', min: 1, max: 5, step: 1 },
      ]
    case 'shake':
      return [
        { key: 'shakeIntensity', label: '抖动强度', min: 1, max: 10, step: 1 },
        { key: 'shakeSpeed', label: '抖动速度', min: 1, max: 10, step: 1 },
      ]
    case 'pulse':
      return [
        { key: 'pulseScale', label: '缩放幅度', min: 1.05, max: 1.5, step: 0.05 },
        { key: 'pulseSpeed', label: '脉冲速度', min: 0.5, max: 5, step: 0.5, unit: 's' },
      ]
    case 'skew':
      return [
        { key: 'skewAngle', label: '倾斜角度', min: 5, max: 45, step: 5, unit: 'deg' },
        { key: 'skewSpeed', label: '倾斜速度', min: 0.5, max: 5, step: 0.5, unit: 's' },
      ]
    case 'roll':
      return [
        { key: 'rollDistance', label: '滚动距离', min: 100, max: 500, step: 50, unit: 'px' },
        { key: 'rollSpeed', label: '滚动速度', min: 0.5, max: 5, step: 0.5, unit: 's' },
      ]
    case 'blast':
      return [
        { key: 'blastDistance', label: '炸开距离', min: 50, max: 300, step: 25, unit: 'px' },
        { key: 'blastSpeed', label: '爆破速度', min: 0.5, max: 3, step: 0.25, unit: 's' },
      ]
    case 'rave':
      return [
        { key: 'raveSpeed', label: '激光速度', min: 1, max: 5, step: 0.5, unit: 's' },
      ]
    case 'phosphor':
      return [
        { key: 'phosphorTrail', label: '拖尾长度', min: 1, max: 10, step: 1 },
        { key: 'phosphorSpeed', label: '移动速度', min: 1, max: 5, step: 1 },
      ]
    case 'prism':
      return [
        { key: 'prismIntensity', label: '色散强度', min: 1, max: 10, step: 1 },
        { key: 'prismAngle', label: '色散角度', min: 0, max: 360, step: 15, unit: 'deg' },
      ]
    case 'aurora':
      return [
        { key: 'auroraSpeed', label: '极光流速', min: 1, max: 5, step: 0.5, unit: 's' },
        { key: 'auroraWidth', label: '色带宽度', min: 1, max: 10, step: 1 },
      ]
    case 'warp':
      return [
        { key: 'warpIntensity', label: '扭曲强度', min: 1, max: 20, step: 1 },
        { key: 'warpRadius', label: '扭曲范围', min: 50, max: 300, step: 25, unit: 'px' },
      ]
    case 'glowpulse':
      return [
        { key: 'glowpulseSize', label: '光晕半径', min: 10, max: 100, step: 10, unit: 'px' },
        { key: 'glowpulseSpeed', label: '脉冲速度', min: 0.5, max: 5, step: 0.5, unit: 's' },
      ]
    case 'twist':
      return [
        { key: 'twistAngle', label: '扭转角度', min: 10, max: 180, step: 10, unit: 'deg' },
        { key: 'twistSpeed', label: '扭转速度', min: 1, max: 5, step: 1 },
      ]
    case 'sparkle':
      return [
        { key: 'sparkleCount', label: '星星数量', min: 5, max: 30, step: 5 },
        { key: 'sparkleSpeed', label: '闪烁速度', min: 1, max: 5, step: 1 },
      ]
    case 'float':
      return [
        { key: 'floatHeight', label: '漂浮高度', min: 5, max: 50, step: 5, unit: 'px' },
        { key: 'floatSpeed', label: '漂浮速度', min: 1, max: 5, step: 1, unit: 's' },
      ]
    case 'drip':
      return [
        { key: 'dripCount', label: '滴落数量', min: 1, max: 10, step: 1 },
        { key: 'dripLength', label: '滴落长度', min: 10, max: 100, step: 10, unit: 'px' },
        { key: 'dripSpeed', label: '滴落速度', min: 1, max: 5, step: 1 },
      ]
    case 'particles':
      return [
        { key: 'particleCount', label: '粒子数量', min: 50, max: 500, step: 50 },
        { key: 'particleSpeed', label: '移动速度', min: 1, max: 5, step: 1 },
      ]
    case 'gradientorb':
      return [
        { key: 'orbCount', label: '光球数量', min: 2, max: 8, step: 1 },
        { key: 'orbSpeed', label: '移动速度', min: 1, max: 5, step: 1 },
        { key: 'orbBlur', label: '模糊半径', min: 20, max: 100, step: 10, unit: 'px' },
      ]
    case 'matrixrain':
      return [
        { key: 'rainSpeed', label: '下落速度', min: 1, max: 5, step: 1 },
        { key: 'rainDensity', label: '雨滴密度', min: 10, max: 100, step: 10 },
      ]
    case 'noise':
      return [
        { key: 'noiseIntensity', label: '噪点强度', min: 1, max: 10, step: 1 },
        { key: 'noiseSpeed', label: '闪烁速度', min: 1, max: 5, step: 1 },
      ]
    case 'magnet':
      return [
        { key: 'magnetStrength', label: '磁力强度', min: 1, max: 10, step: 1 },
      ]
    case 'parallaxtilt':
      return [
        { key: 'tiltAngle', label: '倾斜角度', min: 5, max: 45, step: 5, unit: 'deg' },
        { key: 'tiltPerspective', label: '透视距离', min: 200, max: 1000, step: 100, unit: 'px' },
      ]
    case 'morphing':
      return [
        { key: 'morphSpeed', label: '变形速度', min: 0.5, max: 3, step: 0.5, unit: 's' },
      ]
    case 'pagetransition':
      return [
        { key: 'transitionSpeed', label: '转场速度', min: 0.5, max: 3, step: 0.5, unit: 's' },
      ]
    case 'skeletonwave':
      return [
        { key: 'waveSpeed2', label: '波浪速度', min: 1, max: 5, step: 1 },
      ]
  }
}

function getParamValue(params: EffectParams, key: string): number {
  const defaults: Record<string, number> = {
    glitchIntensity: 5, glitchSpeed: 2,
    waveAmplitude: 10, waveFrequency: 2, waveSpeed: 1.5,
    neonGlow: 10,
    typeSpeed: 80,
    spotlightSize: 150,
    bounceHeight: 20, bounceSpeed: 1, bounceStagger: 60,
    gradientSpeed: 4, gradientAngle: 135,
    flickerIntensity: 5,
    staggerDelay: 80, staggerDistance: 50,
    flipAngle: 180, flipSpeed: 2,
    liquidIntensity: 10, liquidSpeed: 3, liquidScale: 150,
    hologramAngle: 135, hologramDistance: 6,
    chromaticOffset: 5, chromaticAngle: 0,
    cubeSize: 200, cubeSpeed: 5, cubePerspective: 500,
    scanlineDensity: 10, scanlineSpeed: 3,
    metalAngle: 135, metalShine: 5,
    glassBlur: 4, glassOpacity: 0.5,
    fireIntensity: 5, fireSpeed: 2,
    iceSparkle: 5, iceSpeed: 2,
    inkSpread: 5, inkSpeed: 2,
    shakeIntensity: 5, shakeSpeed: 5,
    pulseScale: 1.2, pulseSpeed: 1.5,
    skewAngle: 15, skewSpeed: 2,
    rollDistance: 300, rollSpeed: 2,
    blastDistance: 150, blastSpeed: 1,
    raveSpeed: 2,
    phosphorTrail: 5, phosphorSpeed: 2,
    prismIntensity: 5, prismAngle: 0,
    auroraSpeed: 2, auroraWidth: 5,
    warpIntensity: 10, warpRadius: 150,
    glowpulseSize: 40, glowpulseSpeed: 2,
    twistAngle: 60, twistSpeed: 2,
    sparkleCount: 15, sparkleSpeed: 2,
    floatHeight: 20, floatSpeed: 2,
    dripCount: 5, dripLength: 40, dripSpeed: 2,
    particleCount: 200, particleSpeed: 2,
    orbCount: 4, orbSpeed: 2, orbBlur: 60,
    rainSpeed: 2, rainDensity: 40,
    noiseIntensity: 5, noiseSpeed: 2,
    magnetStrength: 5,
    tiltAngle: 20, tiltPerspective: 600,
    morphSpeed: 1,
    transitionSpeed: 1,
    waveSpeed2: 2,
  }
  const val = (params as Record<string, unknown>)[key]
  return typeof val === 'number' ? val : (defaults[key] ?? 0)
}
