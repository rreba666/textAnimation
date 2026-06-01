// 每日一言 —— hitokoto.cn API + 离线回退

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Quote } from 'lucide-react'

const FALLBACK = [
  { hitokoto: '生活不是等待风暴过去，而是学会在雨中翩翩起舞。', from: '网络' },
  { hitokoto: '每一个不曾起舞的日子，都是对生命的辜负。', from: '尼采' },
  { hitokoto: '愿你历经千帆，归来仍是少年。', from: '网络' },
  { hitokoto: '温柔半两，从容一生。', from: '网络' },
  { hitokoto: '慢慢来，会好的。', from: '网络' },
]

export default function DailyQuote() {
  const [quote, setQuote] = useState<{ hitokoto: string; from: string } | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchQuote = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('https://v1.hitokoto.cn/', { signal: AbortSignal.timeout(5000) })
      if (!res.ok) throw new Error('fetch')
      const data = await res.json()
      setQuote({ hitokoto: data.hitokoto, from: data.from || '佚名' })
    } catch {
      setQuote(FALLBACK[Math.floor(Math.random() * FALLBACK.length)])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchQuote() }, [fetchQuote])

  return (
    <div className="flex items-center gap-2 text-xs text-text-secondary min-w-0">
      <Quote size={14} className="text-warm-pink shrink-0" />
      {loading ? (
        <span className="animate-pulse text-text-light">正在加载一言...</span>
      ) : quote ? (
        <span className="truncate italic">「{quote.hitokoto}」—— {quote.from}</span>
      ) : null}
      <button onClick={fetchQuote} disabled={loading}
        className={`p-0.5 rounded-md hover:bg-notebook-bg dark:hover:bg-white/8 transition-colors shrink-0 ${loading ? 'opacity-30 cursor-not-allowed' : 'text-text-light hover:text-warm-orange'}`}
        title="换一句"><RefreshCw size={13} className={loading ? 'animate-spin' : ''} /></button>
    </div>
  )
}
