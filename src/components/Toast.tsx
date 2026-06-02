// 手帐风格 Toast 提示组件 —— GSAP 驱动入场/出场动画，支持撤销操作 + 倒计时进度条

import { useState, useRef, useEffect, useCallback } from 'react'
import gsap from 'gsap'

/** Toast 配置选项 */
interface ToastOptions {
  message: string
  showUndo?: boolean
  onUndo?: () => void
  duration?: number
}

// 全局触发函数引用（模块级单例，确保同一时间只有一个 Toast）
let showToastFn: ((opts: ToastOptions) => void) | null = null

/** 全局调用：显示 Toast 提示 */
export function showToast(opts: ToastOptions) {
  showToastFn?.(opts)
}

/** Toast 容器组件 —— 手帐风格，右侧滑入，自带倒计时进度条 */
export default function ToastContainer() {
  const [toast, setToast] = useState<ToastOptions | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const tweenRef = useRef<gsap.core.Tween>()
  const progressTweenRef = useRef<gsap.core.Tween>()

  // 组件挂载时注册全局 showToast 函数，卸载时清理
  useEffect(() => {
    showToastFn = (opts) => {
      // 新 Toast 替换旧 Toast：先杀旧定时器和动画
      if (timerRef.current) clearTimeout(timerRef.current)
      if (tweenRef.current) tweenRef.current.kill()
      if (progressTweenRef.current) progressTweenRef.current.kill()
      setToast(opts)
    }
    return () => { showToastFn = null }
  }, [])

  // 数据变化时：入场动画 + 进度条动画 + 自动消失定时器
  useEffect(() => {
    if (toast && containerRef.current) {
      const dur = (toast.duration || 3000) / 1000

      // 入场动画：从右侧滑入
      tweenRef.current = gsap.fromTo(containerRef.current,
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' }
      )

      // 进度条动画：宽度从 100% → 0%，线性递减
      if (progressRef.current) {
        progressRef.current.style.width = '100%'
        progressTweenRef.current = gsap.to(progressRef.current, {
          width: '0%',
          duration: dur,
          ease: 'linear',
        })
      }

      // 自动消失
      timerRef.current = setTimeout(() => {
        dismissToast()
      }, toast.duration || 3000)
    }
  }, [toast])

  // 出场动画：淡出 + 右滑
  const dismissToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (progressTweenRef.current) progressTweenRef.current.kill()
    if (containerRef.current) {
      tweenRef.current = gsap.to(containerRef.current, {
        opacity: 0, x: 50, duration: 0.3, ease: 'power2.in',
        onComplete: () => setToast(null),
      })
    } else {
      setToast(null)
    }
  }, [])

  // 点击撤销：触发回调 + 关闭 Toast
  const handleUndo = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (progressTweenRef.current) progressTweenRef.current.kill()
    toast?.onUndo?.()
    dismissToast()
  }, [toast, dismissToast])

  // 无 Toast 时不渲染
  if (!toast) return null

  return (
    <div ref={containerRef} className="fixed top-6 right-6 z-50 pointer-events-auto">
      <div
        className="flex items-center gap-3 rounded-full border relative overflow-hidden"
        style={{
          background: 'rgb(var(--bg-card))',
          padding: '12px 20px 15px 20px',
          borderColor: 'rgb(var(--border-light))',
          boxShadow: '0 4px 20px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        {/* SVG 装饰：手绘风格小星形 */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--accent-primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v4M12 19v4M1 12h4M19 12h4" />
        </svg>

        {/* 提示文字 */}
        <span
          className="text-sm whitespace-nowrap"
          style={{ fontFamily: '"DingTalk JinBuTi", system-ui, sans-serif', color: 'rgb(var(--text-primary))' }}
        >
          {toast.message}
        </span>

        {/* 撤销按钮（胶囊形，hover 变色） */}
        {toast.showUndo && (
          <button
            onClick={handleUndo}
            className="px-4 py-1.5 text-xs font-medium rounded-full transition-colors duration-200 shrink-0"
            style={{ color: 'rgb(var(--accent-primary))', background: 'rgb(var(--accent-primary) / 0.12)' }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'rgb(var(--accent-primary) / 0.24)' }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'rgb(var(--accent-primary) / 0.12)' }}
          >
            撤销
          </button>
        )}

        {/* 倒计时进度条 —— 底部细线，从左到右递减 */}
        <div className="absolute bottom-0 left-3 right-3 h-[3px] rounded-full overflow-hidden">
          <div
            ref={progressRef}
            className="h-full rounded-full"
            style={{ width: '100%', background: 'rgb(var(--accent-primary))' }}
          />
        </div>
      </div>
    </div>
  )
}
