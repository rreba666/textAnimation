import { PRESETS, type Preset } from '../data/presets'

interface Props {
  onApply: (preset: Preset) => void
}

export default function PresetSelector({ onApply }: Props) {
  return (
    <div className="flex items-center gap-2 w-full max-w-full overflow-hidden">
      <span className="text-[11px] text-[#666] shrink-0 whitespace-nowrap">预设模板</span>
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none max-w-full">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => onApply(p)}
            title={p.description}
            className="group shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all duration-200
                       hover:scale-[1.03] active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${p.color}11, ${p.color}06)`,
              borderColor: `${p.color}33`,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="text-[12px] font-medium text-white whitespace-nowrap">{p.name}</span>
            <span className="text-[10px] text-[#555] whitespace-nowrap">{p.combo.length + p.bg.length}层</span>
          </button>
        ))}
      </div>
    </div>
  )
}
