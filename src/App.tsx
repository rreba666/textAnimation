import { useState, useMemo } from 'react'
import type { EffectType, EffectParams } from './types'
import TextInput from './components/TextInput'
import EffectSelector from './components/EffectSelector'
import ParamPanel from './components/ParamPanel'
import Preview from './components/Preview'
import CodeOutput from './components/CodeOutput'
// 五種动效组件
import Glitch from './effects/Glitch'
import Wave from './effects/Wave'
import Neon from './effects/Neon'
import Typewriter from './effects/Typewriter'
import Spotlight from './effects/Spotlight'
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
  // 核心状态 — React useState Hook
  const [text, setText] = useState('Hello World')
  const [effect, setEffect] = useState<EffectType>('glitch')
  const [params, setParams] = useState<EffectParams>(defaultParams('glitch'))

  /**
   * 切换动效时重置为对应默认参数
   * React 设计思路：effect 变化 → 同步重置参数 → 预览区和代码区自动更新
   */
  function handleEffectChange(next: EffectType) {
    setEffect(next)
    setParams(defaultParams(next))
  }

  /** 参数变更回调 — 合并到当前 params 对象 */
  function handleParamChange(key: string, value: number | string | boolean) {
    setParams((prev) => ({ ...prev, [key]: value }))
  }

  // 根据当前参数生成代码 — useMemo 缓存避免每次渲染重复计算
  const code = useMemo(
    () => generateCssCode({ text, effect, params }),
    [text, effect, params],
  )

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-[#e8e8f0]">
      {/* ===== 顶部标题栏 ===== */}
      <header className="border-b border-[#2a2a4a] bg-[#0d0d1f] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          {/* 魔杖 SVG 图标 */}
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
        </div>
      </header>

      {/* ===== 主内容区 ===== */}
      <main className="max-w-4xl mx-auto px-6 py-6 space-y-5">
        {/* 第一行：输入 + 效果选择 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TextInput text={text} onChange={setText} />
          <EffectSelector current={effect} onChange={handleEffectChange} />
        </div>

        {/* 预览区 — 核心展示舞台 */}
        <Preview>
          <EffectRenderer effect={effect} text={text} params={params} />
        </Preview>

        {/* 参数面板 */}
        <ParamPanel effect={effect} params={params} onChange={handleParamChange} />

        {/* 代码输出区 */}
        <CodeOutput code={code} />
      </main>

      {/* ===== 页脚 ===== */}
      <footer className="text-center py-6 text-xs text-[#555577]">
        儿戏的文字动画工坊 — React + TypeScript + GSAP
      </footer>
    </div>
  )
}

/**
 * 根据当前动效类型渲染对应的动画组件
 * 抽离为独立子组件，避免 App 组件内 switch 过长
 */
function EffectRenderer({ effect, text, params }: {
  effect: EffectType
  text: string
  params: EffectParams
}) {
  switch (effect) {
    case 'glitch':
      return (
        <Glitch
          text={text}
          intensity={params.glitchIntensity ?? 5}
          speed={params.glitchSpeed ?? 2}
        />
      )
    case 'wave':
      return (
        <Wave
          text={text}
          amplitude={params.waveAmplitude ?? 10}
          frequency={params.waveFrequency ?? 2}
          speed={params.waveSpeed ?? 1.5}
        />
      )
    case 'neon':
      return (
        <Neon
          text={text}
          color={params.neonColor ?? '#ff00ff'}
          glow={params.neonGlow ?? 10}
          flicker={params.neonFlicker ?? true}
        />
      )
    case 'typewriter':
      return (
        <Typewriter
          text={text}
          speed={params.typeSpeed ?? 80}
          cursorStyle={params.cursorStyle ?? 'line'}
        />
      )
    case 'spotlight':
      return (
        <Spotlight
          text={text}
          size={params.spotlightSize ?? 150}
          color={params.spotlightColor ?? '#ffffff'}
        />
      )
  }
}

/** 获取某效果的默认参数 — 切换效果时调用 */
function defaultParams(effect: EffectType): EffectParams {
  switch (effect) {
    case 'glitch':
      return { glitchIntensity: 5, glitchSpeed: 2 }
    case 'wave':
      return { waveAmplitude: 10, waveFrequency: 2, waveSpeed: 1.5 }
    case 'neon':
      return { neonColor: '#ff00ff', neonGlow: 10, neonFlicker: true }
    case 'typewriter':
      return { typeSpeed: 80, cursorStyle: 'line' }
    case 'spotlight':
      return { spotlightSize: 150, spotlightColor: '#ffffff' }
  }
}
