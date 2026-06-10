// 首次访问引导遮罩 —— 逐步介绍右上角按钮功能

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronRight, X } from 'lucide-react'
import gsap from 'gsap'

const STORAGE_KEY = 're_xuzhang_has_seen_guide'

/** 检查是否应该显示引导 */
export function shouldShowGuide(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== '1'
}

interface GuideStep {
  /** CSS 选择器，用于定位目标元素 */
  selector: string
  /** 备用：当找不到目标元素时的回退定位 */
  fallbackTitle: string
  title: string
  description: string
  /** 弹窗相对于目标元素的位置 */
  placement: 'bottom' | 'left'
}

const BASE_STEPS: GuideStep[] = [
  {
    selector: 'button[title="成就徽章"]',
    fallbackTitle: '成就徽章',
    title: '成就徽章',
    description: '完成各项任务解锁专属勋章，记录你的每一个小成就。打开勋章墙查看进度和稀有度。',
    placement: 'bottom',
  },
  {
    selector: 'button[title="帮助与快捷键"]',
    fallbackTitle: '帮助与快捷键',
    title: '帮助与快捷键',
    description: '查看键盘快捷键（N 聚焦笔记 / T 聚焦待办 / E 编辑待办）和数据备份提示，随时回顾不迷路。',
    placement: 'bottom',
  },
  {
    selector: 'button[title="管理卡片"]',
    fallbackTitle: '管理卡片',
    title: '管理卡片',
    description: '自由开关和拖拽排序页面卡片，不想看的模块可以暂时隐藏，定制专属布局。',
    placement: 'bottom',
  },
  {
    selector: 'button[title="切换背景"]',
    fallbackTitle: '切换背景',
    title: '切换背景',
    description: '四款预设背景：米白纸纹、淡粉渐变、水墨灰、森林绿，暗色主题自动联动适配。',
    placement: 'bottom',
  },
  {
    selector: 'header button[title="暗色模式"], header button[title="亮色模式"]',
    fallbackTitle: '主题切换',
    title: '主题切换',
    description: '一键切换亮色 / 暗色模式，暗色模式使用暖亮色系，夜间使用更护眼。',
    placement: 'left',
  },
  {
    selector: 'button[title="安装到桌面"]',
    fallbackTitle: '安装到桌面',
    title: '安装到桌面',
    description: '将 RE:序章 安装到桌面或开始菜单，像原生 App 一样快速打开。支持 Chrome / Edge / 移动浏览器。',
    placement: 'bottom',
  },
]

/** 过滤：PWA 安装按钮不可见时（已安装 / 不支持），跳过对应步骤 */
function getVisibleSteps(): GuideStep[] {
  return BASE_STEPS.filter((s) => {
    if (s.fallbackTitle === '安装到桌面') {
      return !!document.querySelector(s.selector)
    }
    return true
  })
}

/** 标记引导已看完 */
function markGuideSeen() {
  localStorage.setItem(STORAGE_KEY, '1')
}

interface Props {
  open: boolean
  onClose: () => void
}

export default function GuideTour({ open, onClose }: Props) {
  const [stepIndex, setStepIndex] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [targetFound, setTargetFound] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const [animating, setAnimating] = useState(false)

  const visibleSteps = getVisibleSteps()
  const step = visibleSteps[stepIndex]
  const isLast = stepIndex === visibleSteps.length - 1

  // 定位当前步骤的目标元素
  const locateTarget = useCallback(() => {
    // 尝试匹配选择器（支持逗号分隔的多选择器）
    const selectors = step.selector.split(', ')
    let el: Element | null = null
    for (const sel of selectors) {
      el = document.querySelector(sel)
      if (el) break
    }
    if (!el) {
      // 回退：通过 title 属性查找
      el = document.querySelector(`button[title="${step.fallbackTitle}"]`)
    }
    if (el) {
      setTargetRect(el.getBoundingClientRect())
      setTargetFound(true)
    } else {
      setTargetFound(false)
    }
  }, [step])

  // 步骤变化时：定位 + 动画
  useEffect(() => {
    if (!open) return
    setAnimating(true)
    // 等待一帧让 DOM 稳定
    requestAnimationFrame(() => {
      locateTarget()
      requestAnimationFrame(() => {
        // 聚光灯动画
        if (spotlightRef.current && targetRect) {
          gsap.fromTo(spotlightRef.current,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }
          )
        }
        // 弹窗动画
        if (popupRef.current) {
          gsap.fromTo(popupRef.current,
            { opacity: 0, y: 12, scale: 0.92 },
            { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'back.out(1.4)', delay: 0.1,
              onComplete: () => setAnimating(false) }
          )
        }
      })
    })
  }, [open, stepIndex, locateTarget])

  // ESC 键关闭
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { markGuideSeen(); onClose() }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  // 窗口尺寸变化时重新定位
  useEffect(() => {
    if (!open) return
    const h = () => locateTarget()
    window.addEventListener('resize', h)
    window.addEventListener('scroll', h)
    return () => {
      window.removeEventListener('resize', h)
      window.removeEventListener('scroll', h)
    }
  }, [open, locateTarget])

  const goNext = () => {
    if (animating) return
    if (isLast) {
      markGuideSeen()
      onClose()
    } else {
      setStepIndex((s) => s + 1)
    }
  }

  const handleSkip = () => {
    markGuideSeen()
    onClose()
  }

  if (!open) return null

  // 计算弹窗位置
  const popupStyle: React.CSSProperties = {}
  const arrowStyle: React.CSSProperties = {}

  if (targetRect && targetFound) {
    if (step.placement === 'bottom') {
      popupStyle.top = targetRect.bottom + 12
      popupStyle.left = Math.max(16, targetRect.left + targetRect.width / 2 - 160)
      // 限制不超出视口右边界
      if (popupStyle.left && (popupStyle.left as number) + 320 > window.innerWidth - 16) {
        popupStyle.left = window.innerWidth - 336
      }
      arrowStyle.top = -6
      arrowStyle.left = targetRect.left + targetRect.width / 2 - (popupStyle.left as number)
    } else {
      // left: 弹窗在目标左侧
      popupStyle.top = targetRect.top + targetRect.height / 2 - 50
      popupStyle.right = window.innerWidth - targetRect.left + 12
      arrowStyle.top = 50
      arrowStyle.right = -6
    }
  }

  return createPortal(
    <div ref={overlayRef} className="fixed inset-0 z-[100]" onClick={handleSkip}>
      {/* 暗色遮罩层 */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.45)' }} />

      {/* 聚光灯（镂空高亮区） */}
      {targetRect && targetFound && (
        <div
          ref={spotlightRef}
          className="absolute rounded-xl"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
            background: 'transparent',
            zIndex: 1,
            // 脉冲边框动画
            animation: 'guide-pulse 2s ease-in-out infinite',
          }}
        />
      )}

      {/* 脉冲边框动画 keyframes 注入 */}
      <style>{`
        @keyframes guide-pulse {
          0%, 100% { outline: 2px solid rgba(255,255,255,0.3); outline-offset: 2px; }
          50% { outline: 2px solid rgba(255,255,255,0.7); outline-offset: 4px; }
        }
      `}</style>

      {/* 弹窗 */}
      {targetRect && targetFound && (
        <div
          ref={popupRef}
          className="fixed z-[2]"
          style={{
            ...popupStyle,
            width: 320,
            background: 'rgb(var(--bg-card))',
            border: '1px solid rgb(var(--border-light))',
            borderRadius: 16,
            boxShadow: '0 12px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)',
            padding: '20px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 小三角箭头 */}
          <div
            className="absolute w-3 h-3 rotate-45"
            style={{
              ...arrowStyle,
              background: 'rgb(var(--bg-card))',
              border: '1px solid rgb(var(--border-light))',
              borderRight: 'none',
              borderBottom: 'none',
            }}
          />

          {/* 步骤指示器 */}
          <div className="flex items-center gap-1.5 mb-3">
            {visibleSteps.map((_, i) => (
              <div
                key={i}
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  width: i === stepIndex ? 20 : 6,
                  background: i <= stepIndex ? 'rgb(var(--accent-primary))' : 'rgb(var(--check-undone))',
                }}
              />
            ))}
          </div>

          {/* 标题 */}
          <h3
            className="text-base font-semibold mb-1.5"
            style={{ color: 'rgb(var(--text-primary))', fontFamily: '"DingTalk JinBuTi", system-ui, sans-serif' }}
          >
            {step.title}
          </h3>

          {/* 描述 */}
          <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgb(var(--text-secondary))' }}>
            {step.description}
          </p>

          {/* 底部按钮区 */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-notebook-bg dark:hover:bg-white/8"
              style={{ color: 'rgb(var(--text-light))' }}
            >
              跳过
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: 'rgb(var(--text-light))' }}>
                {stepIndex + 1} / {visibleSteps.length}
              </span>
              <button
                onClick={goNext}
                className="flex items-center gap-1 text-xs font-medium px-4 py-1.5 rounded-full transition-all duration-200 hover:opacity-90"
                style={{
                  background: 'rgb(var(--accent-primary))',
                  color: '#fff',
                }}
              >
                {isLast ? '开始使用' : '下一步'}
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 目标未找到时的回退：简单弹窗居中显示 */}
      {!targetFound && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2] w-[320px]"
          style={{
            background: 'rgb(var(--bg-card))',
            border: '1px solid rgb(var(--border-light))',
            borderRadius: 16,
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
            padding: '24px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-base font-semibold mb-2" style={{ fontFamily: '"DingTalk JinBuTi", system-ui, sans-serif' }}>
            {step.title}
          </h3>
          <p className="text-sm mb-5" style={{ color: 'rgb(var(--text-secondary))' }}>{step.description}</p>
          <div className="flex items-center justify-between">
            <button onClick={handleSkip} className="text-xs text-text-light hover:text-text-primary">跳过</button>
            <button onClick={goNext} className="flex items-center gap-1 text-xs font-medium px-4 py-1.5 rounded-full text-white"
              style={{ background: 'rgb(var(--accent-primary))' }}>
              {isLast ? '开始使用' : '下一步'} <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 右上角关闭按钮 */}
      <button
        onClick={handleSkip}
        className="fixed top-4 right-4 z-[3] w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 hover:rotate-90"
        style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(8px)',
          color: '#fff',
        }}
      >
        <X size={18} />
      </button>
    </div>,
    document.body,
  )
}
