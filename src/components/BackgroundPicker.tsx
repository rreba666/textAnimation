// 背景选择器 —— 5 种预设，独立于主题，默认纸纹跟随主题变色

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import gsap from 'gsap'
import { useDashboardStore } from '../store/useDashboardStore'

interface Props {
  open: boolean
  onClose: () => void
}

interface Preset {
  type: string
  name: string
  css: string
  isDark?: boolean
}

const PRESETS: Preset[] = [
  { type: 'paper', name: '米白纸纹', css: '#F8F5EF' },
  { type: 'pink', name: '淡粉渐变', css: 'linear-gradient(135deg, #FDE8E8, #F5F0E8)' },
  { type: 'ink', name: '水墨灰', css: '#E8E6E1' },
  { type: 'dark', name: '星空深色', css: '#1a1a2e', isDark: true },
  { type: 'forest', name: '森林绿', css: '#DCE8D9' },
]

export default function BackgroundPicker({ open, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const [closing, setClosing] = useState(false)

  const background = useDashboardStore((s) => s.background)
  const setBackground = useDashboardStore((s) => s.setBackground)

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
  useEffect(() => { if (open) setClosing(false) }, [open])

  useEffect(() => {
    if (!open || closing) return
    requestAnimationFrame(() => {
      if (overlayRef.current) gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' })
      if (modalRef.current) gsap.fromTo(modalRef.current, { opacity: 0, scale: 0.85, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.6)' })
    })
  }, [open, closing])

  // 选择预设（不自动切换主题，背景与主题独立）
  const selectPreset = (preset: Preset) => {
    setBackground({ type: preset.type })
    handleClose()
  }

  // 重置为默认
  const handleReset = () => {
    setBackground({ type: 'paper' })
    handleClose()
  }

  const bgStyle = (p: Preset) => ({
    background: p.css,
    boxShadow: p.type === background.type
      ? '0 0 0 2px rgb(var(--accent-primary)), 0 2px 8px rgba(0,0,0,0.1)'
      : '0 1px 3px rgba(0,0,0,0.08)',
  })

  if (!open) return null

  return createPortal(
    <div ref={overlayRef} className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.35)' }} onClick={handleClose}>
      <div ref={modalRef}
        className="relative w-full max-w-[400px] max-h-[85vh] overflow-y-auto custom-scrollbar"
        style={{ background: 'rgb(var(--bg-card))', borderRadius: 20, border: '1px solid rgb(var(--border-light))', boxShadow: '0 16px 48px rgba(0,0,0,0.12)', padding: '24px' }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold"
            style={{ color: 'rgb(var(--text-primary))', fontFamily: '"DingTalk JinBuTi", system-ui, sans-serif' }}>
            切换背景
          </h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-notebook-bg dark:hover:bg-white/8 text-text-secondary hover:text-text-primary transition-colors"><X size={18} /></button>
        </div>

        {/* 预设背景 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {PRESETS.map((p) => (
            <button
              key={p.type}
              onClick={() => selectPreset(p)}
              className="relative h-20 rounded-xl border transition-all hover:scale-[1.02]"
              style={{
                ...bgStyle(p),
                borderColor: 'rgb(var(--border-light))',
              }}
            >
              <span className="absolute inset-x-0 bottom-2 text-xs font-medium"
                style={{ color: p.isDark ? 'rgba(255,255,255,0.85)' : 'rgb(var(--text-primary))' }}>
                {p.name}
              </span>
            </button>
          ))}
        </div>

        {/* 提示 */}
        <p className="text-xs mb-3" style={{ color: 'rgb(var(--text-light))' }}>
          选择「米白纸纹」后，背景将跟随亮/暗主题自动变色
        </p>

        {/* 重置 */}
        <button
          onClick={handleReset}
          className="w-full py-2 text-xs rounded-xl transition-colors hover:bg-notebook-bg dark:hover:bg-white/5"
          style={{ color: 'rgb(var(--text-secondary))' }}>
          恢复默认背景
        </button>
      </div>
    </div>,
    document.body,
  )
}
