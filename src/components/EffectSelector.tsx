import type { EffectType, EffectMeta } from '../types'

interface Props {
  current: EffectType
  onChange: (effect: EffectType) => void
}

/** 动效元数据 — React 组件外部常量，避免重复创建 */
const EFFECTS: EffectMeta[] = [
  { key: 'glitch', name: '故障 Glitch', description: '信号干扰般的抖动错位', iconChar: '~' },
  { key: 'wave', name: '波浪 Wave', description: '逐字起伏的弹性波浪', iconChar: '~' },
  { key: 'neon', name: '霓虹 Neon', description: '多层辉光的灯管效果', iconChar: 'o' },
  { key: 'typewriter', name: '打字机 Typewriter', description: '逐字敲入的复古感', iconChar: '|' },
  { key: 'spotlight', name: '聚光灯 Spotlight', description: '鼠标跟随的光斑探照', iconChar: 'o' },
]

/**
 * 效果选择器 — 垂直排列的按钮组
 * 使用受控组件模式，父组件完全控制选中状态
 */
export default function EffectSelector({ current, onChange }: Props) {
  return (
    <div className="w-full">
      <label className="block text-sm text-[#8888aa] mb-1.5">选择动效</label>
      <div className="flex flex-wrap gap-2">
        {EFFECTS.map((eff) => {
          const isActive = current === eff.key
          return (
            <button
              key={eff.key}
              onClick={() => onChange(eff.key)}
              title={eff.description}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-[#b8a0d4] text-white shadow-lg shadow-[#b8a0d4]/30 scale-105'
                  : 'bg-[#1a1a2e] text-[#8888aa] border border-[#2a2a4a] hover:border-[#b8a0d4] hover:text-[#ccc]'
                }`}
            >
              {/* 小图标标识 — 用字符代替 emoji */}
              <span className="mr-1.5 text-base" aria-hidden="true">
                {eff.iconChar === '~' ? (
                  <svg className="inline w-4 h-4 align-[-1px]" viewBox="0 0 16 16" fill="none">
                    <path d="M2 12 Q6 4 8 10 Q10 16 14 4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                ) : eff.iconChar === 'o' ? (
                  <svg className="inline w-3.5 h-3.5 align-[-1px]" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                ) : (
                  <svg className="inline w-3.5 h-3.5 align-[-1px]" viewBox="0 0 14 14" fill="none">
                    <line x1="7" y1="2" x2="7" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )}
              </span>
              {eff.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
