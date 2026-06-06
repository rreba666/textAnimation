// 成就解锁通知 —— Steam 风格，右下角弹出，队列管理，Web Audio 提示音

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Award } from 'lucide-react'
import gsap from 'gsap'

/** 通知数据结构 */
export interface AchievementNotifyData {
  id: string
  name: string
  iconName?: string
  rarity: 'normal' | 'rare' | 'epic' | 'legendary'
}

// 稀有度图标颜色
const RARITY_ICON_COLOR: Record<string, string> = {
  normal: 'rgb(var(--accent-primary))',
  rare: '#7ba0c7',
  epic: '#9b7ec4',
  legendary: '#d4a540',
}

// ---- 模块级队列与守卫 ----
let notifyQueue: AchievementNotifyData[] = []
let isNotifying = false
const shownIds = new Set<string>()

// 全局触发函数
let notifyFn: ((data: AchievementNotifyData) => void) | null = null

/** 外部调用：显示成就解锁通知 */
export function showAchievementNotify(data: AchievementNotifyData) {
  // 本次会话已弹出过的不再弹出
  if (shownIds.has(data.id)) return
  shownIds.add(data.id)
  notifyFn?.(data)
}

// ---- Web Audio 提示音 ----
function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    // C5 → E5 → G5 → C6 上行和弦
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      const t = ctx.currentTime + i * 0.1
      gain.gain.setValueAtTime(0.12, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
      osc.start(t)
      osc.stop(t + 0.35)
    })
    // 清理 AudioContext（延迟释放，等所有 oscillator 播完）
    setTimeout(() => ctx.close(), 1200)
  } catch {
    // 静默失败：浏览器不支持 Web Audio
  }
}

/** 成就通知容器组件 */
export default function AchievementNotify() {
  const [current, setCurrent] = useState<AchievementNotifyData | null>(null)
  const [exiting, setExiting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  // 注册全局触发函数
  useEffect(() => {
    notifyFn = (data) => {
      notifyQueue.push(data)
      if (!isNotifying) processNext()
    }
    return () => { notifyFn = null }
  }, [])

  // 取队列下一个并显示
  const processNext = useCallback(() => {
    if (notifyQueue.length === 0) {
      isNotifying = false
      return
    }
    isNotifying = true
    const next = notifyQueue.shift()!
    setExiting(false)
    setCurrent(next)
  }, [])

  // current 变化时：播放声音 + 入场动画 + 自动消失
  useEffect(() => {
    if (!current || !containerRef.current) return
    playChime()

    // 入场：右侧滑入 + 弹性回弹
    gsap.fromTo(containerRef.current,
      { x: 140, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.55, ease: 'back.out(1.4)' }
    )

    // 3 秒后自动消失
    timerRef.current = setTimeout(() => {
      setExiting(true)
    }, 3000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [current])

  // exiting 变化时：出场动画 → 显示下一个
  useEffect(() => {
    if (!exiting || !containerRef.current) return
    gsap.to(containerRef.current, {
      x: 140, opacity: 0, duration: 0.3, ease: 'power2.in',
      onComplete: () => {
        setExiting(false)
        setCurrent(null)
        // 延迟一小段再出下一个，避免视觉连续
        setTimeout(() => processNext(), 200)
      },
    })
  }, [exiting, processNext])

  if (!current) return null

  return createPortal(
    <div
      ref={containerRef}
      className="fixed z-[70] pointer-events-none"
      style={{ bottom: 24, right: 24 }}
    >
      <div
        className="flex items-center gap-3 rounded-2xl pointer-events-auto"
        style={{
          width: 280,
          background: 'rgb(var(--bg-card))',
          border: '1.5px solid rgb(var(--border-light))',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.06)',
          padding: '14px 16px',
        }}
      >
        {/* 左侧图标区 + 稀有度光晕 */}
        <div className="relative shrink-0">
          <div
            className="absolute inset-0 rounded-full blur-sm"
            style={{
              background: current.rarity === 'legendary'
                ? 'linear-gradient(135deg, #f09433, #e6683c, #cc2366, #9b4dca, #38bdf8)'
                : current.rarity === 'epic' ? 'rgb(184 160 212 / 0.6)'
                : current.rarity === 'rare' ? 'rgb(147 180 210 / 0.5)'
                : 'transparent',
              opacity: 0.5,
              transform: 'scale(1.4)',
            }}
          />
          <div className="relative">
            <Award size={32} style={{ color: RARITY_ICON_COLOR[current.rarity] || RARITY_ICON_COLOR.normal }} />
          </div>
        </div>

        {/* 右侧文字 */}
        <div className="flex-1 min-w-0">
          <div
            className="text-[10px] uppercase tracking-wider mb-0.5"
            style={{ color: 'rgb(var(--accent-primary))', fontFamily: '"DingTalk JinBuTi", system-ui, sans-serif' }}
          >
            成就解锁
          </div>
          <div
            className="text-sm font-semibold truncate"
            style={{ color: 'rgb(var(--text-primary))', fontFamily: '"DingTalk JinBuTi", system-ui, sans-serif' }}
          >
            {current.name}
          </div>
          {current.rarity !== 'normal' && (
            <span
              className="inline-block text-[9px] px-1.5 py-0.5 rounded-full mt-0.5"
              style={{
                background: current.rarity === 'legendary'
                  ? 'linear-gradient(135deg, #f09433, #e6683c)'
                  : current.rarity === 'epic' ? 'rgb(184 160 212 / 0.25)' : 'rgb(147 180 210 / 0.25)',
                color: current.rarity === 'legendary' ? '#fff' : current.rarity === 'epic' ? '#9b7ec4' : '#7ba0c7',
              }}
            >
              {current.rarity === 'legendary' ? '传说' : current.rarity === 'epic' ? '史诗' : '稀有'}
            </span>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
