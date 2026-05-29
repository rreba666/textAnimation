interface Props {
  text: string
  onChange: (text: string) => void
}

/**
 * 文字输入区 — 用户输入自定义文字
 * 实时同步到父组件状态，限制 50 字避免动画性能下降
 */
export default function TextInput({ text, onChange }: Props) {
  const maxLen = 50

  return (
    <div className="w-full">
      <label className="block text-sm text-[#8888aa] mb-1.5">输入文字</label>
      <div className="relative">
        <input
          type="text"
          value={text}
          onChange={(e) => onChange(e.target.value.slice(0, maxLen))}
          placeholder="在这里输入文字..."
          maxLength={maxLen}
          className="w-full bg-[#1a1a2e] border border-[#2a2a4a] rounded-lg px-4 py-3
                     text-white text-lg placeholder-[#555577] outline-none
                     focus:border-[#b8a0d4] transition-colors duration-200"
        />
        {/* 字数统计 */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#555577]">
          {text.length}/{maxLen}
        </span>
      </div>
    </div>
  )
}
