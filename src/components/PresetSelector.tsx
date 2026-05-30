import { PRESETS, type Preset } from '../data/presets'

interface Props {
  onApply: (preset: Preset) => void
}

/** 预设选择器 — 点击卡片透传整个 Preset 对象 */
export default function PresetSelector({ onApply }: Props) {
  return (
    <div className="w-full">
      <label className="block text-sm text-[#8888aa] mb-2">
        预设模板（共 {PRESETS.length} 套组合）
        <span className="text-[10px] text-[#555577] ml-1">点击一键应用多层效果</span>
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => onApply(p)}
            className="group relative text-left rounded-xl p-3 border transition-all duration-200
                       hover:scale-[1.03] hover:shadow-lg active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${p.color}11, ${p.color}06)`,
              borderColor: `${p.color}33`,
            }}
          >
            <div className="absolute top-0 left-2 right-2 h-0.5 rounded-full"
                 style={{ background: `linear-gradient(90deg, transparent, ${p.color}, transparent)` }} />
            <div className="text-[13px] font-bold text-white mb-0.5 mt-1">{p.name}</div>
            <div className="text-[10px] text-[#777] leading-tight mb-1.5 line-clamp-2">{p.description}</div>
            <div className="flex flex-wrap gap-0.5">
              {p.tags.map((tag) => (
                <span key={tag} className="text-[9px] px-1 py-0.5 rounded"
                      style={{ background: `${p.color}15`, color: `${p.color}` }}>
                  {tag}
                </span>
              ))}
            </div>
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                 style={{ boxShadow: `inset 0 0 12px ${p.color}22` }} />
          </button>
        ))}
      </div>
    </div>
  )
}
