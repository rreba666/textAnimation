// 管理卡片弹窗 —— 显隐开关 + 拖拽排序

import { useState, useEffect, useRef, useCallback, type ElementType } from 'react'
import { createPortal } from 'react-dom'
import {
  X, GripVertical, ClipboardList, CheckCircle2, Link, FileText,
  Timer, Calendar, BarChart3, Eye, EyeOff,
} from 'lucide-react'
import gsap from 'gsap'
import { useDashboardStore } from '../store/useDashboardStore'

interface Props {
  open: boolean
  onClose: () => void
}

const CARD_META: { id: string; name: string; Icon: ElementType; color: string }[] = [
  { id: 'todo', name: '待办事项', Icon: ClipboardList, color: 'text-warm-orange' },
  { id: 'habits', name: '习惯打卡', Icon: CheckCircle2, color: 'text-warm-green' },
  { id: 'links', name: '快捷链接', Icon: Link, color: 'text-warm-pink' },
  { id: 'notes', name: '快速笔记', Icon: FileText, color: 'text-warm-orange' },
  { id: 'pomodoro', name: '番茄钟', Icon: Timer, color: 'text-warm-pink' },
  { id: 'calendar', name: '日历', Icon: Calendar, color: 'text-warm-green' },
  { id: 'weekstats', name: '本周统计', Icon: BarChart3, color: 'text-warm-orange' },
]

export default function ManageCardsModal({ open, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const [closing, setClosing] = useState(false)
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const hiddenCards = useDashboardStore((s) => s.hiddenCards)
  const cardOrder = useDashboardStore((s) => s.cardOrder)
  const toggleCardVisibility = useDashboardStore((s) => s.toggleCardVisibility)
  const setCardOrder = useDashboardStore((s) => s.setCardOrder)

  // 按 cardOrder 排序的卡片列表
  const orderedCards = cardOrder.map((id) => CARD_META.find((c) => c.id === id)!).filter(Boolean)

  // 关闭动画
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

  // 入场动画
  useEffect(() => {
    if (!open || closing) return
    requestAnimationFrame(() => {
      if (overlayRef.current) gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' })
      if (modalRef.current) gsap.fromTo(modalRef.current, { opacity: 0, scale: 0.85, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.6)' })
    })
  }, [open, closing])

  // 拖拽排序
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDragId(id)
    e.dataTransfer.effectAllowed = 'move'
  }
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    if (id !== dragId) setDragOverId(id)
  }
  const handleDragLeave = () => setDragOverId(null)
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (dragId && dragId !== targetId) {
      const newOrder = [...cardOrder]
      const fromIdx = newOrder.indexOf(dragId)
      const toIdx = newOrder.indexOf(targetId)
      if (fromIdx !== -1 && toIdx !== -1) {
        newOrder.splice(fromIdx, 1)
        newOrder.splice(toIdx, 0, dragId)
        setCardOrder(newOrder)
      }
    }
    setDragId(null)
    setDragOverId(null)
  }
  const handleDragEnd = () => { setDragId(null); setDragOverId(null) }

  if (!open) return null

  return createPortal(
    <div ref={overlayRef} className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.35)' }} onClick={handleClose}>
      <div ref={modalRef}
        className="relative w-full max-w-[380px] max-h-[85vh] overflow-y-auto custom-scrollbar"
        style={{ background: 'rgb(var(--bg-card))', borderRadius: 20, border: '1px solid rgb(var(--border-light))', boxShadow: '0 16px 48px rgba(0,0,0,0.12)', padding: '24px' }}
        onClick={(e) => e.stopPropagation()}>
        {/* 标题 */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold"
            style={{ color: 'rgb(var(--text-primary))', fontFamily: '"DingTalk JinBuTi", system-ui, sans-serif' }}>
            管理卡片
          </h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-notebook-bg dark:hover:bg-white/8 text-text-secondary hover:text-text-primary transition-colors"><X size={18} /></button>
        </div>

        <p className="text-xs mb-4" style={{ color: 'rgb(var(--text-light))' }}>拖拽调整卡片顺序，点击眼睛切换显隐</p>

        {/* 卡片列表（可拖拽排序） */}
        <div className="flex flex-col gap-1">
          {orderedCards.map((card) => {
            const isHidden = hiddenCards.includes(card.id)
            const { Icon, color } = card
            return (
              <div
                key={card.id}
                draggable
                onDragStart={(e) => handleDragStart(e, card.id)}
                onDragOver={(e) => handleDragOver(e, card.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, card.id)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-grab active:cursor-grabbing ${
                  dragOverId === card.id ? 'bg-notebook-bg dark:bg-white/10' : ''
                } ${dragId === card.id ? 'opacity-40' : ''} ${
                  isHidden ? 'opacity-50' : ''
                }`}
              >
                {/* 拖拽手柄 */}
                <span className="text-text-light shrink-0"><GripVertical size={14} /></span>

                {/* 图标 + 名称 */}
                <Icon size={17} className={color} />
                <span className="flex-1 text-sm" style={{ color: 'rgb(var(--text-primary))' }}>{card.name}</span>

                {/* 显隐开关 */}
                <button
                  onClick={() => toggleCardVisibility(card.id)}
                  className={`p-1.5 rounded-lg transition-colors ${isHidden ? 'text-text-light hover:text-text-secondary' : 'text-warm-green hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                  title={isHidden ? '显示' : '隐藏'}
                >
                  {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>,
    document.body,
  )
}
