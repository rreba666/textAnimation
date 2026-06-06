// 治愈语录彩蛋 —— 点击星星随机显示一句语录

import { useState, useCallback, useRef, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import gsap from 'gsap'

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
  const bubbleRef = useRef<HTMLDivElement>(null)

  // 气泡出现时用 GSAP 入场动画，避免 CSS animate 导致内部绝对定位错位
  useEffect(() => {
    if (showQuote && bubbleRef.current) {
      gsap.fromTo(
        bubbleRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      )
    }
  }, [showQuote])

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
      {/* 语录弹出 —— 使用 CSS 变量适配双主题背景 */}
      {showQuote && (
        <div
          ref={bubbleRef}
          className="relative rounded-2xl px-4 py-2.5 shadow-lg border max-w-[200px]"
          style={{
            backgroundColor: 'rgb(var(--bg-card))',
            borderColor: 'rgb(var(--border-light))',
          }}
        >
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'rgb(var(--text-primary))' }}
          >
            {quote}
          </p>
          {/* 气泡下方小三角箭头 */}
          <div
            className="absolute -bottom-1.5 right-5 w-3 h-3 rotate-45"
            style={{
              backgroundColor: 'rgb(var(--bg-card))',
              borderRight: '1px solid rgb(var(--border-light))',
              borderBottom: '1px solid rgb(var(--border-light))',
            }}
          />
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
