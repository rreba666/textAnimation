import type { TextStyle } from '../types'

interface Props {
  style: TextStyle
  onChange: (style: TextStyle) => void
}

const FONTS = [
  { value: 'sans-serif', label: '系统默认' },
  { value: 'serif', label: '衬线体' },
  { value: 'monospace', label: '等宽' },
  { value: '"Microsoft YaHei", sans-serif', label: '微软雅黑' },
  { value: '"PingFang SC", sans-serif', label: '苹方' },
  { value: '"Noto Serif SC", serif', label: '思源宋体' },
]
const WEIGHTS = [300, 400, 500, 700, 900]
const SIZES = [16, 20, 24, 32, 40, 48, 56, 64, 72]

export default function StylePanel({ style, onChange }: Props) {
  const set = (k: keyof TextStyle, v: string | number) => onChange({ ...style, [k]: v })

  return (
    <div className="w-full space-y-2.5 bg-[#1a1a2e] border border-[#2a2a4a] rounded-lg p-3">
      <label className="text-xs text-[#8888aa] font-medium">文字样式</label>

      {/* 字体 */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[#777] w-12 shrink-0">字体</span>
        <select value={style.fontFamily} onChange={(e) => set('fontFamily', e.target.value)}
          className="flex-1 bg-[#0a0a1a] border border-[#2a2a4a] rounded px-2 py-1 text-[12px] text-[#ccc] outline-none focus:border-[#b8a0d4]">
          {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>

      {/* 字号 */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[#777] w-12 shrink-0">字号</span>
        <div className="flex flex-1 gap-1">
          {SIZES.map((s) => (
            <button key={s} onClick={() => set('fontSize', s)}
              className={`flex-1 text-[10px] py-0.5 rounded ${style.fontSize === s ? 'bg-[#b8a0d4] text-white' : 'bg-[#0a0a1a] text-[#777] hover:text-[#bbb]'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 字重 */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[#777] w-12 shrink-0">字重</span>
        <div className="flex flex-1 gap-1">
          {WEIGHTS.map((w) => (
            <button key={w} onClick={() => set('fontWeight', w)}
              className={`flex-1 text-[10px] py-0.5 rounded ${style.fontWeight === w ? 'bg-[#b8a0d4] text-white' : 'bg-[#0a0a1a] text-[#777] hover:text-[#bbb]'}`}>
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* 颜色 */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[#777] w-12 shrink-0">颜色</span>
        <input type="color" value={style.color} onChange={(e) => set('color', e.target.value)}
          className="w-7 h-6 rounded cursor-pointer border-0 bg-transparent
                     [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-0" />
        <span className="text-[10px] text-[#888] font-mono">{style.color}</span>
      </div>

      {/* 字间距 */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[#777] w-12 shrink-0">间距</span>
        <input type="range" min={-2} max={10} step={0.5} value={style.letterSpacing}
          onChange={(e) => set('letterSpacing', parseFloat(e.target.value))}
          className="flex-1 h-1 rounded-full appearance-none bg-[#2a2a4a] accent-[#b8a0d4]" />
        <span className="text-[10px] text-[#888] w-8 text-right">{style.letterSpacing}</span>
      </div>
    </div>
  )
}
