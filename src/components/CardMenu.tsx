// 卡片右上角「⋯」下拉菜单 —— 隐藏卡片入口

import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, EyeOff } from 'lucide-react'
import { useDashboardStore } from '../store/useDashboardStore'

interface Props {
  cardId: string
}

export default function CardMenu({ cardId }: Props) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleCardVisibility = useDashboardStore((s) => s.toggleCardVisibility)

  // 点击外部关闭
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        className="p-1 rounded-lg hover:bg-notebook-bg dark:hover:bg-white/8 text-text-light hover:text-text-secondary transition-colors"
        title="卡片设置"
      >
        <MoreHorizontal size={15} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-36 py-1 rounded-xl border shadow-lg z-50"
          style={{
            background: 'rgb(var(--bg-card))',
            borderColor: 'rgb(var(--border-light))',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => { toggleCardVisibility(cardId); setOpen(false) }}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-text-secondary hover:bg-notebook-bg dark:hover:bg-white/8 transition-colors"
          >
            <EyeOff size={13} />
            隐藏此卡片
          </button>
        </div>
      )}
    </div>
  )
}
