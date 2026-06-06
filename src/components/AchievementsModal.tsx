// 成就勋章弹窗 —— 手帐风格勋章墙

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { format } from 'date-fns'
import gsap from 'gsap'
import { BADGES, isEarned, getEarnedTime, newlyEarnedInSession, type BadgeData, type Rarity } from '../data/achievements'

interface Props {
  open: boolean
  onClose: () => void
}

// ---- 波浪分割线 SVG ----
function WaveDivider() {
  return (
    <svg width="100%" height="14" viewBox="0 0 400 14" fill="none" preserveAspectRatio="none" className="opacity-30">
      <path d="M0 7 Q20 1 40 7 Q60 13 80 7 Q100 1 120 7 Q140 13 160 7 Q180 1 200 7 Q220 13 240 7 Q260 1 280 7 Q300 13 320 7 Q340 1 360 7 Q380 13 400 7" stroke="rgb(var(--accent-primary))" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

// 图标名称 → SVG 组件映射
const ICON_MAP: Record<string, React.ReactNode> = {
  streak: <BadgeStreak />,
  todo: <BadgeTodo />,
  link: <BadgeLink />,
  note: <BadgeNote />,
  morning: <BadgeMorning />,
  latenight: <BadgeLateNight />,
  passing: <BadgePassing />,
  empty: <BadgeEmpty />,
  lookback: <BadgeLookBack />,
  master: <BadgeMaster />,
}

// ---- SVG 徽章图标 ----
function BadgeStreak() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#D4A5A5" opacity="0.15" />
      <circle cx="24" cy="24" r="22" stroke="#D4A5A5" strokeWidth="2" />
      <path d="M12 28c2 4 5 6 7 8M36 28c-2 4-5 6-7 8" stroke="#D4A5A5" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 20v12M24 16v16M28 18v14" stroke="#D4A5A5" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
function BadgeTodo() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#9CAF88" opacity="0.15" />
      <circle cx="24" cy="24" r="22" stroke="#9CAF88" strokeWidth="2" />
      <path d="M16 24l5 5 11-11" stroke="#9CAF88" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function BadgeLink() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#C4A484" opacity="0.15" />
      <circle cx="24" cy="24" r="22" stroke="#C4A484" strokeWidth="2" />
      <path d="M16 24h16M16 24c0 0 3-6 8-6s8 6 8 6M16 24c0 0 3 6 8 6s8-6 8-6" stroke="#C4A484" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function BadgeNote() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#B5A0D0" opacity="0.15" />
      <circle cx="24" cy="24" r="22" stroke="#B5A0D0" strokeWidth="2" />
      <path d="M14 16h20M14 24h14M14 32h8" stroke="#B5A0D0" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
function BadgeMorning() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#E8B88A" opacity="0.15" />
      <circle cx="24" cy="24" r="22" stroke="#E8B88A" strokeWidth="2" />
      <circle cx="24" cy="22" r="6" stroke="#E8B88A" strokeWidth="2" />
      <path d="M24 6v4M24 34v4M12 22h4M32 22h4M16 14l3 3M29 31l3 3M32 14l-3 3M19 31l-3 3" stroke="#E8B88A" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
function BadgeLateNight() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#7B8DB8" opacity="0.15" />
      <circle cx="24" cy="24" r="22" stroke="#7B8DB8" strokeWidth="2" />
      <path d="M30 10c-8 4-12 12-10 20c-4-4-6-10-4-16c2-4 6-6 10-6c2 0 4 1 4 2z" stroke="#7B8DB8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="24" y1="32" x2="24" y2="36" stroke="#7B8DB8" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="21" y1="38" x2="27" y2="38" stroke="#7B8DB8" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}
function BadgePassing() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#9CAF88" opacity="0.1" />
      <circle cx="24" cy="24" r="22" stroke="#9CAF88" strokeWidth="1.5" strokeDasharray="6 3" />
      <path d="M16 30s3-4 8-4 8 4 8 4" stroke="#9CAF88" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="18" r="2" fill="#9CAF88" opacity="0.5" />
    </svg>
  )
}
function BadgeEmpty() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#B0B8C0" opacity="0.12" />
      <circle cx="24" cy="24" r="22" stroke="#B0B8C0" strokeWidth="2" />
      <rect x="14" y="12" width="20" height="24" rx="3" stroke="#B0B8C0" strokeWidth="2" />
      <path d="M18 22h12M18 28h8" stroke="#B0B8C0" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
function BadgeLookBack() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#C8A86B" opacity="0.12" />
      <circle cx="24" cy="24" r="22" stroke="#C8A86B" strokeWidth="2" />
      <circle cx="22" cy="18" r="4" stroke="#C8A86B" strokeWidth="2" />
      <circle cx="23" cy="17" r="1.5" fill="#C8A86B" />
      <path d="M10 36c4-8 10-12 16-10" stroke="#C8A86B" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 36c2-4 5-6 9-5" stroke="#C8A86B" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
function BadgeMaster() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#D4A540" opacity="0.12" />
      <circle cx="24" cy="24" r="22" stroke="#D4A540" strokeWidth="2" />
      <rect x="12" y="10" width="24" height="28" rx="3" stroke="#D4A540" strokeWidth="2" />
      <path d="M16 20h16M16 26h12" stroke="#D4A540" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M28 30l4 4M32 30l-4 4" stroke="#D4A540" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

// ---- 标题装饰 SVG ----
function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[rgb(var(--accent-secondary))]">
      <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z" fill="currentColor" opacity="0.6" />
    </svg>
  )
}
function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[rgb(var(--accent-primary))]">
      <circle cx="12" cy="7" r="3" fill="currentColor" opacity="0.7" />
      <path d="M12 10v10M8 16l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    </svg>
  )
}

export default function AchievementsModal({ open, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const bannerRef = useRef<HTMLDivElement>(null)
  const [closing, setClosing] = useState(false)
  const [peek, setPeek] = useState(false)
  const [newBadgeNames, setNewBadgeNames] = useState<string[]>([])

  const handleClose = useCallback(() => {
    if (closing) return
    setClosing(true)
    if (overlayRef.current) gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, ease: 'power2.in' })
    if (modalRef.current) {
      gsap.to(modalRef.current, { opacity: 0, y: -20, scale: 0.95, duration: 0.25, ease: 'power2.in', onComplete: () => { setClosing(false); onClose() } })
    } else { setClosing(false); onClose() }
  }, [closing, onClose])

  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, handleClose])

  // 弹窗打开时：播放入场动画 + 检测新获得勋章
  useEffect(() => {
    if (!open || closing) return

    // 检测本次会话中新获得的勋章
    const newlyEarned = BADGES.filter((b) => isEarned(b.id) && newlyEarnedInSession.has(b.id))
    if (newlyEarned.length > 0) {
      setNewBadgeNames(newlyEarned.map((b) => b.name))
      // 播放完动画后清除标记
      setTimeout(() => newlyEarned.forEach((b) => newlyEarnedInSession.delete(b.id)), 3000)
    } else {
      setNewBadgeNames([])
    }

    requestAnimationFrame(() => {
      // 遮罩淡入
      if (overlayRef.current) gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power2.out' })
      // 弹窗进入
      if (modalRef.current) gsap.fromTo(modalRef.current, { opacity: 0, scale: 0.85, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.6)' })

      // 卡片依次淡入上浮（stagger 0.03）
      const cards = Array.from(cardRefs.current.values()).filter(Boolean)
      gsap.fromTo(cards, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.03, ease: 'power2.out', delay: 0.15 })

      // 新获得勋章弹跳 + 发光效果
      newlyEarned.forEach((b) => {
        const el = cardRefs.current.get(b.id)
        if (!el) return
        // 弹跳动画
        gsap.fromTo(el, { scale: 1 }, { scale: 1.05, duration: 0.3, ease: 'back.out(3)', delay: 0.4 })
        gsap.to(el, { scale: 1, duration: 0.25, ease: 'power2.out', delay: 0.7 })
        // 发光脉冲
        const glow = el.querySelector('.badge-glow') as HTMLElement
        if (glow) {
          gsap.fromTo(glow, { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.4 })
          gsap.to(glow, { opacity: 0, duration: 0.6, delay: 1.0 })
        }
      })

      // 新获得提示横幅
      if (newlyEarned.length > 0 && bannerRef.current) {
        gsap.fromTo(bannerRef.current, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.2 })
        gsap.to(bannerRef.current, { opacity: 0, y: -10, duration: 0.4, delay: 2.5 })
      }
    })
  }, [open, closing])

  if (!open) return null

  const earned = BADGES.filter((b) => isEarned(b.id))
  const unearned = BADGES.filter((b) => !isEarned(b.id))

  // 按稀有度排序勋章卡片
  const rarityOrder: Record<Rarity, number> = { legendary: 0, epic: 1, rare: 2, normal: 3 }
  const allSorted = [...BADGES].sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity])

  return createPortal(
    <div ref={overlayRef} className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.3)' }} onClick={handleClose}>
      {/* 外层：圆角 + 边框 + 阴影 + overflow-hidden 裁切滚动条 */}
      <div
        ref={modalRef}
        className="relative w-full max-w-[480px] overflow-hidden"
        style={{
          background: 'rgb(var(--bg-card))',
          borderRadius: 20,
          border: '2px solid #FFFEF9',
          boxShadow: '0 0 0 1px #EFECE3, 0 16px 48px rgba(0,0,0,0.12)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 双层边框内层 —— 暗色模式适配 */}
        <div className="absolute inset-0 rounded-[20px] pointer-events-none"
          style={{ border: '2px solid rgb(var(--bg-card))', zIndex: 1 }} />

        {/* 四角折角装饰 —— 固定于四角，不随内容滚动 */}
        <div className="absolute top-0 left-0 w-5 h-5 pointer-events-none z-[2]"
          style={{
            background: 'linear-gradient(135deg, rgb(var(--border-light)) 40%, transparent 40%)',
            borderRadius: '0 0 8px 0',
            opacity: 0.5,
          }} />
        <div className="absolute top-0 right-0 w-5 h-5 pointer-events-none z-[2]"
          style={{
            background: 'linear-gradient(225deg, rgb(var(--border-light)) 40%, transparent 40%)',
            borderRadius: '0 0 0 8px',
            opacity: 0.5,
          }} />
        <div className="absolute bottom-0 left-0 w-5 h-5 pointer-events-none z-[2]"
          style={{
            background: 'linear-gradient(45deg, rgb(var(--border-light)) 40%, transparent 40%)',
            borderRadius: '0 8px 0 0',
            opacity: 0.5,
          }} />
        <div className="absolute bottom-0 right-0 w-5 h-5 pointer-events-none z-[2]"
          style={{
            background: 'linear-gradient(315deg, rgb(var(--border-light)) 40%, transparent 40%)',
            borderRadius: '8px 0 0 0',
            opacity: 0.5,
          }} />

        {/* 内层：滚动容器 */}
        <div className="relative z-[3] max-h-[85vh] overflow-y-auto overflow-x-hidden custom-scrollbar-badge"
          style={{ padding: '28px 24px 24px' }}>
          {/* 新获得勋章提示横幅 */}
          {newBadgeNames.length > 0 && (
            <div ref={bannerRef}
              className="flex items-center justify-center gap-1.5 mb-4 py-2 px-4 rounded-xl text-sm font-medium"
              style={{
                background: 'rgb(var(--accent-primary) / 0.12)',
                color: 'rgb(var(--accent-primary))',
                fontFamily: '"DingTalk JinBuTi", system-ui, sans-serif',
              }}>
              <SparkleIcon />
              恭喜获得：{newBadgeNames.join('、')}
              <SparkleIcon />
            </div>
          )}

          {/* 标题栏 */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="flex items-center gap-1.5 text-lg font-semibold shrink-0"
              style={{ color: 'rgb(var(--text-primary))', fontFamily: '"DingTalk JinBuTi", system-ui, sans-serif' }}>
              <SparkleIcon />
              勋章墙
              <PinIcon />
            </h2>
            <div className="flex items-center gap-2">
              {/* 偷看一眼开关 */}
              <button
                onClick={() => setPeek(!peek)}
                className="flex flex-col items-end gap-0.5 shrink-0"
                style={{ color: peek ? 'rgb(var(--accent-primary))' : 'rgb(var(--text-light))' }}>
                <span className="flex items-center gap-1 text-[10px] transition-colors">
                  <span className={`w-7 h-[14px] rounded-full transition-colors relative ${peek ? 'bg-[rgb(var(--accent-primary))]' : 'bg-[rgb(var(--check-undone))]'}`}>
                    <span className={`absolute top-[2px] w-[10px] h-[10px] rounded-full bg-white transition-all ${peek ? 'left-[15px]' : 'left-[2px]'}`} />
                  </span>
                  偷看一眼
                </span>
                <span className="text-[9px] italic hidden sm:block" style={{ color: 'rgb(var(--text-light))' }}>偷看一下也没关系</span>
              </button>
              {/* 进度统计 */}
              <span className="text-xs shrink-0" style={{ color: 'rgb(var(--text-secondary))' }}>
                {earned.length}/{BADGES.length}
              </span>
              {/* 手绘风格关闭按钮 */}
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 hover:rotate-90 shrink-0"
                style={{
                  border: '2px solid rgb(var(--border-light))',
                  background: 'rgb(var(--bg-card))',
                  color: 'rgb(var(--text-secondary))',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgb(var(--accent-primary) / 0.1)'; e.currentTarget.style.borderColor = 'rgb(var(--accent-primary))' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgb(var(--bg-card))'; e.currentTarget.style.borderColor = 'rgb(var(--border-light))' }}
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* 波浪分割线 */}
          <div className="mb-4"><WaveDivider /></div>

          {/* 勋章网格 */}
          <div className="grid grid-cols-2 gap-2.5"
            style={{
              backgroundImage: 'radial-gradient(circle, rgb(var(--bg-dot) / 0.3) 0.5px, transparent 0.5px)',
              backgroundSize: '14px 14px',
              padding: '4px',
              borderRadius: 12,
            }}>
            {allSorted.map((b) => {
              const earned = isEarned(b.id)
              const cur = Math.min(b.current(), b.target)
              const pct = Math.round((cur / b.target) * 100)
              const earnedTime = getEarnedTime(b.id)
              const isNew = newlyEarnedInSession.has(b.id)

              return (
                <div
                  key={b.id}
                  ref={(el) => { if (el) cardRefs.current.set(b.id, el) }}
                  className="relative rounded-2xl p-3 flex flex-col items-center text-center gap-1.5 transition-all duration-300"
                  style={{
                    background: earned ? 'rgb(var(--bg-card))' : 'rgb(var(--bg-card))',
                    border: earned
                      ? `1.5px solid ${b.rarity === 'legendary' ? 'transparent' : b.rarity === 'epic' ? 'rgb(184 160 212)' : b.rarity === 'rare' ? 'rgb(147 180 210)' : 'rgb(var(--border-light))'}`
                      : '1px solid rgb(var(--border-light))',
                    boxShadow: earned ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    filter: earned ? 'none' : 'grayscale(0.6)',
                    opacity: earned ? 1 : 0.6,
                    // 传说级彩虹边框
                    ...(earned && b.rarity === 'legendary' ? {
                      backgroundImage: 'linear-gradient(rgb(var(--bg-card)), rgb(var(--bg-card))), linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888, #9b4dca, #5b6ef5, #38bdf8)',
                      backgroundOrigin: 'border-box',
                      backgroundClip: 'padding-box, border-box',
                    } : {}),
                  }}
                >
                  {/* 新获得发光层 */}
                  {isNew && (
                    <div className="badge-glow absolute inset-0 rounded-2xl pointer-events-none opacity-0"
                      style={{ boxShadow: '0 0 20px 4px rgb(var(--accent-primary) / 0.4)', zIndex: -1 }} />
                  )}
                  {/* 图标 */}
                  <div className={earned ? '' : 'grayscale opacity-50'} style={{ filter: earned ? undefined : 'grayscale(1) opacity(0.5)' }}>
                    {ICON_MAP[b.iconName]}
                  </div>
                  {/* 名称 */}
                  <div className="text-xs font-medium leading-tight"
                    style={{ color: earned ? 'rgb(var(--text-primary))' : 'rgb(var(--text-secondary))', fontFamily: '"DingTalk JinBuTi", system-ui, sans-serif' }}>
                    {b.name}
                  </div>
                  {/* 条件常驻显示 */}
                  <div className="text-[9px]" style={{ color: 'rgb(var(--text-primary))', opacity: 0.55 }}>{b.cond}</div>
                  {/* 获得日期 + 寄语常驻 */}
                  {earned ? (
                    <>
                      {earnedTime ? (
                        <div className="text-[9px]" style={{ color: 'rgb(var(--text-light))' }}>
                          {format(new Date(earnedTime), 'yyyy/MM/dd')} 获得
                        </div>
                      ) : (
                        <div className="text-[9px]" style={{ color: 'rgb(var(--accent-green))' }}>已获得</div>
                      )}
                      {/* 已获得勋章常驻显示寄语 */}
                      <div className="text-[9px] italic" style={{ color: 'rgb(var(--text-primary))', opacity: 0.45 }}>{b.desc}</div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center gap-1 w-full">
                      {/* 进度条 */}
                      <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgb(var(--check-undone))' }}>
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: 'rgb(var(--accent-primary))' }} />
                      </div>
                      <span className="text-[9px] tabular-nums" style={{ color: 'rgb(var(--text-secondary))' }}>
                        {cur}/{b.target}
                      </span>
                      {/* 偷看一眼：仅显示寄语 */}
                      {peek && (
                        <div className="text-[9px] italic" style={{ color: 'rgb(var(--text-primary))', opacity: 0.4 }}>{b.desc}</div>
                      )}
                    </div>
                  )}
                  {/* 稀有度标签 */}
                  {earned && b.rarity !== 'normal' && (
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full"
                      style={{
                        background: b.rarity === 'legendary' ? 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' :
                                     b.rarity === 'epic' ? 'rgb(184 160 212 / 0.2)' : 'rgb(147 180 210 / 0.2)',
                        color: b.rarity === 'legendary' ? '#fff' : b.rarity === 'epic' ? '#9b7ec4' : '#7ba0c7',
                        border: b.rarity === 'legendary' ? 'none' : `1px solid ${b.rarity === 'epic' ? 'rgb(184 160 212 / 0.4)' : 'rgb(147 180 210 / 0.4)'}`,
                      }}>
                      {b.rarity === 'legendary' ? '传说' : b.rarity === 'epic' ? '史诗' : '稀有'}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* 空状态 */}
          {BADGES.length === 0 && (
            <div className="text-center py-8 text-text-light text-sm">暂无成就</div>
          )}
        </div>{/* 内层滚动容器结束 */}
      </div>{/* 外层圆角容器结束 */}

      {/* 自定义滚动条样式注入 */}
      <style>{`
        .custom-scrollbar-badge::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar-badge::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-badge::-webkit-scrollbar-thumb { background: rgb(var(--scrollbar-thumb)); border-radius: 8px; }
        .custom-scrollbar-badge::-webkit-scrollbar-thumb:hover { background: rgb(var(--scrollbar-thumb-hover)); }
      `}</style>
    </div>,
    document.body,
  )
}

