// 治愈语录彩蛋 —— 点击星星随机显示一句语录

import { useState, useCallback } from 'react'
import { Sparkles } from 'lucide-react'

// 语录库（10 句治愈语录）
const QUOTES = [
  '今天也是美好的一天',
  '慢慢来，不着急',
  '你已经做得很好了',
  '累了就休息一下，没关系',
  '每一个小坚持都值得被看见',
  '生活不是比赛，按自己的节奏走',
  '微小的幸福就在身边',
  '没关系，明天又是新的一天',
  '认真生活的你，真的在发光',
  '照顾好自己，是最好的事',
]

export default function EasterEgg() {
  const [showQuote, setShowQuote] = useState(false)
  const [quote, setQuote] = useState('')
  const [animating, setAnimating] = useState(false)

  // 随机选一句语录
  const handleClick = useCallback(() => {
    if (animating) return
    setAnimating(true)

    // 随机选一句（避免与上一句相同）
    let newQuote: string
    do {
      newQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)]
    } while (newQuote === quote && QUOTES.length > 1)

    setQuote(newQuote)
    setShowQuote(true)

    // 2.5 秒后自动隐藏
    setTimeout(() => {
      setShowQuote(false)
      setAnimating(false)
    }, 2500)
  }, [quote, animating])

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* 语录弹出 */}
      {showQuote && (
        <div className="animate-[fade-in-up_0.4s_ease-out] bg-white rounded-2xl px-4 py-2.5 shadow-card-hover border border-border-light max-w-[200px]">
          <p className="text-sm text-text-primary leading-relaxed">{quote}</p>
          <div className="absolute -bottom-1.5 right-5 w-3 h-3 bg-white border-r border-b border-border-light rotate-45" />
        </div>
      )}

      {/* 点击按钮 */}
      <button
        onClick={handleClick}
        className={`
          flex items-center justify-center w-11 h-11 rounded-full
          bg-white shadow-card hover:shadow-card-hover
          transition-all duration-300 hover:-translate-y-1
          ${animating ? 'animate-[heartbeat_0.6s_ease-in-out]' : ''}
        `}
        title="点我试试"
      >
        <Sparkles
          size={20}
          className={`text-warm-orange transition-transform duration-300 ${
            animating ? 'rotate-180' : 'hover:rotate-12'
          }`}
        />
      </button>
    </div>
  )
}
