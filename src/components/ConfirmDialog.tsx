// 自定义确认弹窗 —— 函数式调用，替代 window.confirm

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void
}

// 模块级状态
let showFn: ((opts: ConfirmState) => void) | null = null

/** 函数式调用：显示确认弹窗，返回 Promise<boolean> */
export function showConfirm(opts: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    showFn?.({ ...opts, resolve })
  })
}

export default function ConfirmDialog() {
  const [state, setState] = useState<ConfirmState | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  // 注册全局 showFn
  useEffect(() => {
    showFn = (opts) => { setState(opts); setVisible(true) }
    return () => { showFn = null }
  }, [])

  // 入场动画
  useEffect(() => {
    if (!visible || !modalRef.current) return
    requestAnimationFrame(() => {
      if (overlayRef.current) gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power2.out' })
      if (modalRef.current) gsap.fromTo(modalRef.current, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.6)' })
    })
  }, [visible])

  // 关闭（带动画）
  const close = useCallback((result: boolean) => {
    if (overlayRef.current) gsap.to(overlayRef.current, { opacity: 0, duration: 0.15, ease: 'power2.in' })
    if (modalRef.current) {
      gsap.to(modalRef.current, { opacity: 0, scale: 0.92, duration: 0.2, ease: 'power2.in', onComplete: () => {
        setVisible(false)
        state?.resolve(result)
        setState(null)
      }})
    } else {
      setVisible(false)
      state?.resolve(result)
      setState(null)
    }
  }, [state])

  // ESC 关闭（等同取消）
  useEffect(() => {
    if (!visible) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') close(false) }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [visible, close])

  if (!visible || !state) return null

  return createPortal(
    <div ref={overlayRef}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.35)' }}
      onClick={() => close(false)}>
      <div ref={modalRef}
        className="relative w-full max-w-[360px]"
        style={{
          background: 'rgb(var(--bg-card))',
          borderRadius: 20,
          border: '1px solid rgb(var(--border-light))',
          boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
          padding: '28px 24px 20px',
        }}
        onClick={(e) => e.stopPropagation()}>
        {/* 标题 */}
        <h3 className="text-base font-semibold mb-3"
          style={{ color: 'rgb(var(--text-primary))', fontFamily: '"DingTalk JinBuTi", system-ui, sans-serif' }}>
          {state.title}
        </h3>

        {/* 内容 */}
        <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgb(var(--text-secondary))' }}>
          {state.message}
        </p>

        {/* 按钮 */}
        <div className="flex gap-3">
          <button
            onClick={() => close(false)}
            className="flex-1 py-2.5 text-sm rounded-xl transition-colors hover:bg-notebook-bg dark:hover:bg-white/5"
            style={{ color: 'rgb(var(--text-secondary))', border: '1px solid rgb(var(--border-light))' }}>
            {state.cancelText || '取消'}
          </button>
          <button
            onClick={() => close(true)}
            className="flex-1 py-2.5 text-sm font-medium rounded-xl transition-opacity hover:opacity-90 text-white"
            style={{ background: 'rgb(var(--accent-primary))' }}>
            {state.confirmText || '确认'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
