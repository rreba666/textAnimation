import { useState, useMemo } from 'react'
import { useClipboard } from '../hooks/useClipboard'
import type { AnimationState } from '../types'

interface Props {
  code: string
  state?: AnimationState
}

/** 将原始生成代码包装为完整 HTML 片段，开箱即用 */
function wrapAsFullHtml(text: string, code: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${text} — 儿戏动画工坊</title>
<style>
/* ===== 从这里开始是核心 CSS ===== */
${code}
</style>
</head>
<body style="background:#0a0a1a;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
  <div class="effect-text">${text}</div>
</body>
</html>`
}

export default function CodeOutput({ code, state }: Props) {
  const { copy, copied } = useClipboard()
  const [mode, setMode] = useState<'full' | 'css'>('full')

  const displayCode = useMemo(() => {
    if (!state) return code
    if (mode === 'full') return wrapAsFullHtml(state.text, code)
    return code
  }, [code, mode, state])

  const handleCopy = () => {
    const toCopy = code && code !== '/* 请选择一种动效 */' ? displayCode : ''
    if (toCopy) copy(toCopy)
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1">
          <label className="text-sm text-[#8888aa]">生成代码</label>
          {/* 模式切换 */}
          <div className="flex rounded-md overflow-hidden border border-[#2a2a4a] text-[11px]">
            <button
              onClick={() => setMode('full')}
              className={`px-2 py-0.5 ${mode === 'full' ? 'bg-[#b8a0d4]/20 text-[#b8a0d4]' : 'bg-transparent text-[#666] hover:text-[#999]'}`}
            >完整 HTML</button>
            <button
              onClick={() => setMode('css')}
              className={`px-2 py-0.5 border-l border-[#2a2a4a] ${mode === 'css' ? 'bg-[#b8a0d4]/20 text-[#b8a0d4]' : 'bg-transparent text-[#666] hover:text-[#999]'}`}
            >仅核心代码</button>
          </div>
        </div>
        <button
          onClick={handleCopy}
          disabled={!code || code === '/* 请选择一种动效 */'}
          className={`px-3 py-1 rounded text-xs font-medium transition-all duration-200
            ${copied
              ? 'bg-green-600/20 text-green-400 border border-green-500/30'
              : 'bg-[#1a1a2e] text-[#b8a0d4] border border-[#2a2a4a] hover:border-[#b8a0d4]'
            }
            disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {copied ? (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              已复制
            </span>
          ) : (
            <span className="flex items-center gap-1">
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
      <pre className="bg-[#0d0d1a] border border-[#2a2a4a] rounded-lg p-4
                      text-sm text-[#aab] font-mono leading-relaxed max-h-72 overflow-y-auto
                      whitespace-pre-wrap break-all
                      selection:bg-[#f0c060]/30">
        <code>{displayCode || '/* 选择一种动效后，此处将生成可直接复制使用的完整代码 */'}</code>
      </pre>

      {/* 使用提示 */}
      {code && code !== '/* 请选择一种动效 */' && (
        <p className="text-[10px] text-[#555577] mt-1">
          {mode === 'full'
            ? '复制后保存为 .html 文件即可在浏览器中预览效果'
            : '复制核心 CSS/JS 代码，粘贴到你的项目中使用'}
        </p>
      )}
    </div>
  )
}
