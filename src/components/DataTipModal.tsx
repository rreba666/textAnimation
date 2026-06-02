// 数据安全提示弹窗 —— 首次访问自动弹出，顶部栏可手动打开

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, Download, ShieldAlert } from 'lucide-react'
import { format } from 'date-fns'
import gsap from 'gsap'
import { useDashboardStore } from '../store/useDashboardStore'

interface Props {
  open: boolean
  onClose: () => void
}

export default function DataTipModal({ open, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const [closing, setClosing] = useState(false)

  // 关闭动画
  const handleClose = useCallback(() => {
    if (closing) return
    setClosing(true)
    if (overlayRef.current) gsap.to(overlayRef.current, { opacity: 0, duration: 0.25, ease: 'power2.in' })
    if (modalRef.current) {
      gsap.to(modalRef.current, { opacity: 0, y: -20, scale: 0.95, duration: 0.3, ease: 'power2.in', onComplete: () => { setClosing(false); onClose() } })
    } else { setClosing(false); onClose() }
  }, [closing, onClose])

  // ESC
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, handleClose])
  useEffect(() => { if (open) setClosing(false) }, [open])

  // 入场动画
  useEffect(() => {
    if (!open || closing) return
    requestAnimationFrame(() => {
      if (overlayRef.current) gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' })
      if (modalRef.current) gsap.fromTo(modalRef.current, { opacity: 0, scale: 0.85, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.6)' })
    })
  }, [open, closing])

  // 导出全部数据为 JSON
  const handleExport = useCallback(() => {
    const state = useDashboardStore.getState()
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      todos: state.todos,
      habits: state.habits,
      habitRecords: state.habitRecords,
      notes: state.notes,
      links: state.links,
      weatherCity: state.weatherCity,
      weatherData: state.weatherData,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `日常手账-备份-${format(new Date(), 'yyyy-MM-dd')}.json`
    a.click()
    URL.revokeObjectURL(url)
    handleClose()
  }, [handleClose])

  if (!open) return null

  return createPortal(
    <div ref={overlayRef} className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.35)' }} onClick={handleClose}>
      <div ref={modalRef}
        className="relative w-full max-w-[400px] max-h-[85vh] overflow-y-auto custom-scrollbar"
        style={{ background: 'rgb(var(--bg-card))', borderRadius: 20, border: '1px solid rgb(var(--border-light))', boxShadow: '0 16px 48px rgba(0,0,0,0.12)', padding: '24px' }}
        onClick={(e) => e.stopPropagation()}>
        {/* 标题 */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold"
            style={{ color: 'rgb(var(--text-primary))', fontFamily: '"DingTalk JinBuTi", system-ui, sans-serif' }}>
            <ShieldAlert size={20} style={{ color: 'rgb(var(--accent-secondary))' }} />
            数据安全提示
          </h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-notebook-bg dark:hover:bg-white/8 text-text-secondary hover:text-text-primary transition-colors"><X size={18} /></button>
        </div>

        {/* 正文 */}
        <div className="text-sm leading-relaxed mb-6 space-y-3" style={{ color: 'rgb(var(--text-primary))' }}>
          <p>当前所有数据（待办 / 习惯 / 笔记 / 打卡记录）仅保存在<strong>当前浏览器</strong>的本地存储中。</p>
          <div className="space-y-2">
            <p className="flex items-start gap-2">
              <span className="text-red-400 shrink-0 mt-0.5">-</span>
              <span>清除浏览器缓存 / 换设备 / 重装系统将<strong style={{ color: 'rgb(var(--accent-primary))' }}>导致数据丢失</strong></span>
            </p>
            <p className="flex items-start gap-2">
              <span style={{ color: 'rgb(var(--accent-green))' }} className="shrink-0 mt-0.5">-</span>
              <span>建议定期使用热力图弹窗底部的「导出数据」功能备份</span>
            </p>
          </div>
        </div>

        {/* 按钮 */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 text-sm rounded-xl transition-colors hover:bg-notebook-bg dark:hover:bg-white/5"
            style={{ color: 'rgb(var(--text-secondary))', border: '1px solid rgb(var(--border-light))' }}>
            知道了
          </button>
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-1.5 flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors text-white"
            style={{ background: 'rgb(var(--accent-green))' }}>
            <Download size={15} />
            导出数据
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
