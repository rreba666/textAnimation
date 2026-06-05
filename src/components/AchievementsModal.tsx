// 成就徽章弹窗 —— 已获得 / 未获得 + 进度条

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, Award } from 'lucide-react'
import gsap from 'gsap'
import { useDashboardStore } from '../store/useDashboardStore'
import { showToast } from './Toast'

interface Props {
  open: boolean
  onClose: () => void
}

interface Badge {
  id: string
  name: string
  cond: string  // 达成条件
  desc: string  // 文案意义
  target: number
  current: () => number
  icon: React.ReactNode
}

// ---- SVG 徽章图标 ----
function BadgeStreak() {
  return (
    <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#D4A5A5" opacity="0.15" />
      <circle cx="24" cy="24" r="22" stroke="#D4A5A5" strokeWidth="2" />
      <path d="M12 28c2 4 5 6 7 8M36 28c-2 4-5 6-7 8" stroke="#D4A5A5" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 20v12M24 16v16M28 18v14" stroke="#D4A5A5" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
function BadgeTodo() {
  return (
    <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#9CAF88" opacity="0.15" />
      <circle cx="24" cy="24" r="22" stroke="#9CAF88" strokeWidth="2" />
      <path d="M16 24l5 5 11-11" stroke="#9CAF88" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function BadgeLink() {
  return (
    <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#C4A484" opacity="0.15" />
      <circle cx="24" cy="24" r="22" stroke="#C4A484" strokeWidth="2" />
      <path d="M16 24h16M16 24c0 0 3-6 8-6s8 6 8 6M16 24c0 0 3 6 8 6s8-6 8-6" stroke="#C4A484" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function BadgeNote() {
  return (
    <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#B5A0D0" opacity="0.15" />
      <circle cx="24" cy="24" r="22" stroke="#B5A0D0" strokeWidth="2" />
      <path d="M14 16h20M14 24h14M14 32h8" stroke="#B5A0D0" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

const BADGES: Badge[] = [
  {
    id: 'streak7',
    name: '第七个早安',
    cond: '连续打卡 7 天',
    desc: '一周的晨光，你都接住了。',
    target: 7,
    current: () => {
      const { habits, getHabitStreak } = useDashboardStore.getState()
      return habits.length > 0 ? Math.max(...habits.map((h) => getHabitStreak(h.id))) : 0
    },
    icon: <BadgeStreak />,
  },
  {
    id: 'todos100',
    name: '一百件小事',
    cond: '完成 100 个待办',
    desc: '大事轮不到我，但小事被我做完了。',
    target: 100,
    current: () => useDashboardStore.getState().todos.filter((t) => t.completed).length,
    icon: <BadgeTodo />,
  },
  {
    id: 'links10',
    name: '拾贝',
    cond: '新增 10 个链接',
    desc: '小小的收集，不为什么，只是喜欢。',
    target: 10,
    current: () => useDashboardStore.getState().links.length,
    icon: <BadgeLink />,
  },
  {
    id: 'notes20',
    name: '笔尖漫步',
    cond: '新增 20 篇笔记',
    desc: '字迹歪歪扭扭也没关系，你走过的路，笔都记得。',
    target: 20,
    current: () => useDashboardStore.getState().notes.length,
    icon: <BadgeNote />,
  },
]

function isEarned(id: string) {
  return localStorage.getItem(`achievement_${id}`) === '1'
}

export default function AchievementsModal({ open, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const [closing, setClosing] = useState(false)
  const [peek, setPeek] = useState(false)

  // 强制刷新进度
  const [, setTick] = useState(0)
  useEffect(() => { if (open) setTick((t) => t + 1) }, [open])

  const handleClose = useCallback(() => {
    if (closing) return
    setClosing(true)
    if (overlayRef.current) gsap.to(overlayRef.current, { opacity: 0, duration: 0.25, ease: 'power2.in' })
    if (modalRef.current) {
      gsap.to(modalRef.current, { opacity: 0, y: -20, scale: 0.95, duration: 0.3, ease: 'power2.in', onComplete: () => { setClosing(false); onClose() } })
    } else { setClosing(false); onClose() }
  }, [closing, onClose])

  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, handleClose])

  useEffect(() => {
    if (!open || closing) return
    requestAnimationFrame(() => {
      if (overlayRef.current) gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' })
      if (modalRef.current) gsap.fromTo(modalRef.current, { opacity: 0, scale: 0.85, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.6)' })
    })
  }, [open, closing])

  if (!open) return null

  const earned = BADGES.filter((b) => isEarned(b.id))
  const unearned = BADGES.filter((b) => !isEarned(b.id))

  return createPortal(
    <div ref={overlayRef} className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.35)' }} onClick={handleClose}>
      <div ref={modalRef}
        className="relative w-full max-w-[400px] max-h-[85vh] overflow-y-auto custom-scrollbar"
        style={{ background: 'rgb(var(--bg-card))', borderRadius: 20, border: '1px solid rgb(var(--border-light))', boxShadow: '0 16px 48px rgba(0,0,0,0.12)', padding: '24px' }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold"
            style={{ color: 'rgb(var(--text-primary))', fontFamily: '"DingTalk JinBuTi", system-ui, sans-serif' }}>
            <Award size={20} style={{ color: 'rgb(var(--accent-secondary))' }} />成就徽章
          </h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-notebook-bg dark:hover:bg-white/8 text-text-secondary hover:text-text-primary transition-colors"><X size={18} /></button>
        </div>

        {/* 已获得 */}
        {earned.length > 0 && (
          <>
            <h3 className="text-xs font-medium mb-3" style={{ color: 'rgb(var(--accent-green))' }}>
              已获得 · {earned.length}/{BADGES.length}
            </h3>
            <div className="space-y-2 mb-5">
              {earned.map((b) => (
                <div key={b.id} className="flex items-center gap-3 p-3 rounded-2xl"
                  style={{ background: 'rgb(var(--accent-green) / 0.08)', border: '1px solid rgb(var(--accent-green) / 0.15)' }}>
                  <span className="opacity-90">{b.icon}</span>
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'rgb(var(--text-primary))' }}>{b.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-primary))', opacity: 0.7 }}>{b.cond}</div>
                    <div className="text-xs mt-0.5 italic" style={{ color: 'rgb(var(--text-primary))', opacity: 0.55 }}>{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 未获得 */}
        {unearned.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>
                未获得 · {unearned.length}/{BADGES.length}
              </h3>
              {/* 偷看一眼开关 */}
              <button
                onClick={() => setPeek(!peek)}
                className="flex flex-col items-end gap-0.5"
                style={{ color: peek ? 'rgb(var(--accent-primary))' : 'rgb(var(--text-light))' }}>
                <span className="flex items-center gap-1 text-[10px] transition-colors">
                  <span className={`w-7 h-[14px] rounded-full transition-colors relative ${peek ? 'bg-[rgb(var(--accent-primary))]' : 'bg-[rgb(var(--check-undone))]'}`}>
                    <span className={`absolute top-[2px] w-[10px] h-[10px] rounded-full bg-white transition-all ${peek ? 'left-[15px]' : 'left-[2px]'}`} />
                  </span>
                  偷看一眼
                </span>
                <span className="text-[9px] italic" style={{ color: 'rgb(var(--text-light))' }}>偷看一下也没关系</span>
              </button>
            </div>
            <div className="space-y-3">
              {unearned.map((b) => {
                const cur = Math.min(b.current(), b.target)
                const pct = Math.round((cur / b.target) * 100)
                return (
                  <div key={b.id} className="flex items-center gap-3 p-3 rounded-2xl"
                    style={{ background: 'rgb(var(--bg-dot))' }}>
                    <span className={`${peek ? 'opacity-60' : 'opacity-30'} grayscale transition-opacity`}>{b.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="mb-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium" style={{ color: 'rgb(var(--text-primary))' }}>{b.name}</span>
                          <span className="text-xs tabular-nums shrink-0 ml-2" style={{ color: 'rgb(var(--text-secondary))' }}>{cur}/{b.target}</span>
                        </div>
                        <div className="text-[10px] mt-0.5" style={{ color: 'rgb(var(--text-primary))', opacity: 0.65 }}>{b.cond}</div>
                        {peek && (
                          <div className="text-[10px] italic" style={{ color: 'rgb(var(--text-primary))', opacity: 0.45 }}>{b.desc}</div>
                        )}
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgb(var(--check-undone))' }}>
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: 'rgb(var(--accent-primary))' }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {earned.length === 0 && (
          <div className="text-center py-8 text-text-light text-sm">还没有获得任何徽章，继续加油</div>
        )}
        {BADGES.length === 0 && (
          <div className="text-center py-8 text-text-light text-sm">暂无成就</div>
        )}
      </div>
    </div>,
    document.body,
  )
}

/** 在 App 层调用：检查是否达成新成就，弹出 Toast */
export function checkAchievements() {
  const earned = (id: string) => localStorage.getItem(`achievement_${id}`) === '1'
  BADGES.forEach((b) => {
    if (earned(b.id)) return
    if (b.current() >= b.target) {
      localStorage.setItem(`achievement_${b.id}`, '1')
      showToast({ message: `成就解锁：${b.name}！`, duration: 3000 })
    }
  })
}
