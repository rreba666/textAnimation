// 数据安全提示 + 快捷键帮助弹窗 —— 首次访问自动弹出，3 秒倒计时后才可确认

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, Download, ShieldAlert, Keyboard } from 'lucide-react'
import { format } from 'date-fns'
import gsap from 'gsap'
import { useDashboardStore } from '../store/useDashboardStore'

interface Props {
  open: boolean
  onClose: () => void
}

const SHORTCUTS = [
  { key: 'N', desc: '新建笔记' },
  { key: 'T', desc: '聚焦待办' },
  { key: 'E', desc: '编辑待办' },
  { key: '', desc: '拖拽卡片可调整顺序' },
]

export default function DataTipModal({ open, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const [closing, setClosing] = useState(false)
  const [countdown, setCountdown] = useState(3)

  // 3 秒倒计时
  useEffect(() => {
    if (!open) { setCountdown(3); return }
    if (countdown <= 0) return
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [open, countdown])

  // 关闭动画
  const handleClose = useCallback(() => {
    if (closing || countdown > 0) return
    setClosing(true)
    if (overlayRef.current) gsap.to(overlayRef.current, { opacity: 0, duration: 0.25, ease: 'power2.in' })
    if (modalRef.current) {
      gsap.to(modalRef.current, { opacity: 0, y: -20, scale: 0.95, duration: 0.3, ease: 'power2.in', onComplete: () => { setClosing(false); onClose() } })
    } else { setClosing(false); onClose() }
  }, [closing, countdown, onClose])

  // ESC（倒计时结束后可用）
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && countdown <= 0) handleClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, countdown, handleClose])

  // 入场动画
  useEffect(() => {
    if (!open || closing) return
    setCountdown(3)
    requestAnimationFrame(() => {
      if (overlayRef.current) gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' })
      if (modalRef.current) gsap.fromTo(modalRef.current, { opacity: 0, scale: 0.85, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.6)' })
    })
  }, [open, closing])

  // 导出数据
  const handleExport = useCallback(() => {
    const state = useDashboardStore.getState()
    const data = {
      version: 1, exportedAt: new Date().toISOString(),
      todos: state.todos, habits: state.habits, habitRecords: state.habitRecords,
      notes: state.notes, links: state.links,
      weatherCity: state.weatherCity, weatherData: state.weatherData,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `日常手账-备份-${format(new Date(), 'yyyy-MM-dd')}.json`; a.click()
    URL.revokeObjectURL(url)
    handleClose()
  }, [handleClose])

  if (!open) return null

  return createPortal(
    <div ref={overlayRef} className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.35)' }} onClick={countdown > 0 ? undefined : handleClose}>
      <div ref={modalRef}
        className="relative w-full max-w-[400px] max-h-[85vh] overflow-y-auto custom-scrollbar"
        style={{ background: 'rgb(var(--bg-card))', borderRadius: 20, border: '1px solid rgb(var(--border-light))', boxShadow: '0 16px 48px rgba(0,0,0,0.12)', padding: '24px' }}
        onClick={(e) => e.stopPropagation()}>
        {/* 标题 */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold"
            style={{ color: 'rgb(var(--text-primary))', fontFamily: '"DingTalk JinBuTi", system-ui, sans-serif' }}>
            <ShieldAlert size={20} style={{ color: 'rgb(var(--accent-secondary))' }} />欢迎使用
          </h2>
          {countdown <= 0 && (
            <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-notebook-bg dark:hover:bg-white/8 text-text-secondary hover:text-text-primary transition-colors"><X size={18} /></button>
          )}
        </div>

        {/* 数据安全 */}
        <div className="mb-5">
          <h3 className="text-sm font-medium mb-2" style={{ color: 'rgb(var(--accent-secondary))' }}>数据安全</h3>
          <div className="text-sm leading-relaxed space-y-2" style={{ color: 'rgb(var(--text-primary))' }}>
            <p>所有数据仅保存在<strong>当前浏览器</strong>的本地存储中。</p>
            <p className="flex items-start gap-1.5">
              <span className="text-red-400 shrink-0 mt-0.5">-</span>
              <span>清除缓存 / 换设备将<strong style={{ color: 'rgb(var(--accent-primary))' }}>导致数据丢失</strong></span>
            </p>
            <p className="flex items-start gap-1.5">
              <span style={{ color: 'rgb(var(--accent-green))' }} className="shrink-0 mt-0.5">-</span>
              <span>建议定期使用「导出数据」功能备份</span>
            </p>
          </div>
        </div>

        {/* 快捷键 */}
        <div className="mb-5 p-4 rounded-2xl" style={{ background: 'rgb(var(--bg-dot))' }}>
          <h3 className="flex items-center gap-1.5 text-sm font-medium mb-3" style={{ color: 'rgb(var(--text-secondary))' }}>
            <Keyboard size={15} /> 快捷操作
          </h3>
          <div className="space-y-1.5">
            {SHORTCUTS.map((s) => (
              <div key={s.key || 'drag'} className="flex items-center gap-3 text-sm">
                {s.key ? (
                  <kbd className="w-7 h-6 flex items-center justify-center rounded-md text-xs font-mono font-bold"
                    style={{ background: 'rgb(var(--bg-card))', border: '1px solid rgb(var(--border-light))', color: 'rgb(var(--accent-primary))' }}>
                    {s.key}
                  </kbd>
                ) : (
                  <span className="w-7 h-6 flex items-center justify-center text-xs" style={{ color: 'rgb(var(--text-light))' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="8" cy="8" r="1"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="8" r="1"/><circle cx="16" cy="16" r="1"/></svg>
                  </span>
                )}
                <span style={{ color: 'rgb(var(--text-primary))' }}>{s.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 按钮 */}
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-1.5 flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors text-white"
            style={{ background: 'rgb(var(--accent-green))' }}>
            <Download size={15} />导出数据
          </button>
          <button
            onClick={handleClose}
            disabled={countdown > 0}
            className="flex-1 py-2.5 text-sm rounded-xl transition-all"
            style={{
              background: countdown > 0 ? 'rgb(var(--check-undone))' : 'rgb(var(--accent-primary))',
              color: countdown > 0 ? 'rgb(var(--text-light))' : '#fff',
              cursor: countdown > 0 ? 'not-allowed' : 'pointer',
            }}>
            {countdown > 0 ? `${countdown} 秒后可确认` : '知道了'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
