import { useClipboard } from '../hooks/useClipboard'

interface Props {
  code: string
}

/**
 * 代码输出区 — 展示生成的 CSS/GSAP 代码
 * 使用 useClipboard Hook 实现一键复制，复制按钮为 SVG 图标（遵守无 emoji 规范）
 */
export default function CodeOutput({ code }: Props) {
  const { copy, copied } = useClipboard()

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm text-[#8888aa]">生成代码</label>
        <button
          onClick={() => copy(code)}
          disabled={!code}
          className={`px-3 py-1 rounded text-xs font-medium transition-all duration-200
            ${copied
              ? 'bg-green-600/20 text-green-400 border border-green-500/30'
              : 'bg-[#1a1a2e] text-[#b8a0d4] border border-[#2a2a4a] hover:border-[#b8a0d4] hover:bg-[#b8a0d4]/10'
            }
            disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {copied ? (
            <span className="flex items-center gap-1">
              {/* 对勾 SVG 图标 */}
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              已复制
            </span>
          ) : (
            <span className="flex items-center gap-1">
              {/* 复制 SVG 图标 */}
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M3 11V3h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              复制代码
            </span>
          )}
        </button>
      </div>
      {/* 代码展示区 */}
      <pre className="bg-[#0d0d1a] border border-[#2a2a4a] rounded-lg p-4 overflow-x-auto
                      text-sm text-[#aab] font-mono leading-relaxed max-h-64 overflow-y-auto
                      selection:bg-[#f0c060]/30">
        <code>{code || '/* 请先选择一种动效 */'}</code>
      </pre>
    </div>
  )
}
