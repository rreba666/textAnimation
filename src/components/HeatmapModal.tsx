// 习惯热力图弹窗 —— GitHub 风格全年打卡热力图 + 数据导入导出

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronLeft, ChevronRight, Download, Upload } from 'lucide-react'
import { format, startOfYear, endOfYear, eachDayOfInterval, startOfWeek, endOfWeek, getISOWeek, getDay } from 'date-fns'
import gsap from 'gsap'
import { useDashboardStore } from '../store/useDashboardStore'

interface Props {
  open: boolean
  onClose: () => void
}

// 一周 7 天、颜色阶梯
const DAY_LABELS = ['一', '', '三', '', '五', '', '日']
const DAY_NAMES_FULL = ['日', '一', '二', '三', '四', '五', '六'] // getDay: 0=Sun

/** 根据打卡次数返回热力图颜色 */
/** 根据打卡次数返回热力图颜色（绿色系，使用 CSS Color Level 4 语法） */
function heatmapColor(count: number): string {
  if (count === 0) return 'rgb(var(--check-undone))'
  const alpha = (0.15 + Math.min(count / 8, 1) * 0.75).toFixed(2)
  // 必须用 rgb(xxx / alpha) 而非 rgba(xxx, alpha)，否则空格+逗号混用导致无效
  return `rgb(var(--accent-green) / ${alpha})`
}

export default function HeatmapModal({ open, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const [closing, setClosing] = useState(false)
  const [year, setYear] = useState(() => new Date().getFullYear())

  // 订阅数据
  const _records = useDashboardStore((s) => s.habitRecords)

  // ---- 关闭动画 ----
  const handleClose = useCallback(() => {
    if (closing) return
    setClosing(true)
    if (overlayRef.current) gsap.to(overlayRef.current, { opacity: 0, duration: 0.25, ease: 'power2.in' })
    if (modalRef.current) {
      gsap.to(modalRef.current, {
        opacity: 0, y: -20, scale: 0.95, duration: 0.3, ease: 'power2.in',
        onComplete: () => { setClosing(false); onClose() },
      })
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

  // ---- 入场动画 ----
  useEffect(() => {
    if (!open || closing) return
    requestAnimationFrame(() => {
      if (overlayRef.current) gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' })
      if (modalRef.current) {
        gsap.fromTo(modalRef.current,
          { opacity: 0, scale: 0.85, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.6)' }
        )
      }
    })
  }, [open, closing])

  // ---- 年份导航 ----
  const goPrev = () => setYear((y) => y - 1)
  const goNext = () => { if (year < new Date().getFullYear()) setYear((y) => y + 1) }
  const goCurrent = () => setYear(new Date().getFullYear())
  const isCurrentYear = year === new Date().getFullYear()

  // ---- 构建热力图数据 ----
  const heatmap = useMemo(() => {
    const store = useDashboardStore.getState()
    const recs = store.habitRecords

    // 以年为范围，扩展到完整周（周一开始）
    const yStart = startOfYear(new Date(year, 0, 1))
    const yEnd = endOfYear(new Date(year, 11, 31))
    const gridStart = startOfWeek(yStart, { weekStartsOn: 1 })
    const gridEnd = endOfWeek(yEnd, { weekStartsOn: 1 })

    const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd })
    const weeks: { date: Date; count: number }[][] = []
    let currentWeek: { date: Date; count: number }[] = []

    allDays.forEach((d) => {
      const dateStr = format(d, 'yyyy-MM-dd')
      const count = (recs[dateStr] || []).length
      currentWeek.push({ date: d, count })
      if (getISOWeek(d) !== getISOWeek(allDays[allDays.indexOf(d) + 1] || new Date(3000, 0, 1))) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    })
    if (currentWeek.length > 0) weeks.push(currentWeek)

    // 月标签：每月第一天在第几列
    const monthLabels: { col: number; label: string }[] = []
    for (let m = 0; m < 12; m++) {
      const first = new Date(year, m, 1)
      // 计算该日期在网格中的列索引（从 gridStart 算起）
      const diffDays = Math.floor((first.getTime() - gridStart.getTime()) / 86400000)
      const col = Math.floor(diffDays / 7)
      monthLabels.push({ col, label: `${m + 1}月` })
    }

    // 总打卡天数 + 总打卡次数
    let activeDays = 0
    let totalCheckins = 0
    allDays.forEach((d) => {
      const dateStr = format(d, 'yyyy-MM-dd')
      const count = (recs[dateStr] || []).length
      if (count > 0) activeDays++
      totalCheckins += count
    })

    return { weeks, monthLabels, activeDays, totalCheckins }
  }, [_records, year])

  // ---- 数据导出 ----
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
  }, [])

  // ---- 数据导入 ----
  const handleImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        if (!window.confirm('导入将覆盖当前所有数据（待办、习惯、打卡记录、笔记、链接等），确定继续？')) return
        const store = useDashboardStore.getState()
        if (data.todos) store.todos = data.todos
        if (data.habits) store.habits = data.habits
        if (data.habitRecords) store.habitRecords = data.habitRecords
        if (data.notes) store.notes = data.notes
        if (data.links) store.links = data.links
        if (data.weatherCity) store.weatherCity = data.weatherCity
        if (data.weatherData) store.weatherData = data.weatherData
        useDashboardStore.setState({ ...store })
        window.location.reload()
      } catch {
        alert('文件格式错误，请选择有效的备份文件。')
      }
    }
    input.click()
  }, [])

  if (!open) return null

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.35)' }}
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-[760px] max-h-[90vh] overflow-y-auto custom-scrollbar"
        style={{
          background: 'rgb(var(--bg-card))',
          borderRadius: 20,
          border: '1px solid rgb(var(--border-light))',
          boxShadow: '0 16px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
          padding: '24px 24px 20px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold"
            style={{ color: 'rgb(var(--text-primary))', fontFamily: '"DingTalk JinBuTi", system-ui, sans-serif' }}>
            打卡热力图
          </h2>
          <button onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-notebook-bg dark:hover:bg-white/8 text-text-secondary hover:text-text-primary transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* 年份导航 */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={goPrev}
            className="p-1 rounded-lg hover:bg-notebook-bg dark:hover:bg-white/8 text-text-secondary transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button onClick={goCurrent}
            className="text-sm font-medium px-3 py-1 rounded-lg hover:bg-notebook-bg dark:hover:bg-white/8 transition-colors"
            style={{ color: 'rgb(var(--text-primary))', fontFamily: '"DingTalk JinBuTi", system-ui, sans-serif' }}>
            {year}年 {isCurrentYear && <span className="ml-1 text-xs" style={{ color: 'rgb(var(--accent-primary))' }}>今年</span>}
          </button>
          <button onClick={goNext} disabled={isCurrentYear}
            className={`p-1 rounded-lg transition-colors ${isCurrentYear ? 'text-text-light cursor-not-allowed opacity-40' : 'hover:bg-notebook-bg dark:hover:bg-white/8 text-text-secondary'}`}>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* 统计摘要 */}
        <div className="flex items-center gap-4 mb-4 text-xs"
          style={{ color: 'rgb(var(--text-secondary))' }}>
          <span>打卡天数 <b style={{ color: 'rgb(var(--accent-green))' }}>{heatmap.activeDays}</b></span>
          <span>总次数 <b style={{ color: 'rgb(var(--accent-green))' }}>{heatmap.totalCheckins}</b></span>
        </div>

        {/* 热力图主体：月份标签 + 周标签 + 方格 */}
        <div className="overflow-x-auto custom-scrollbar -mx-1 px-1 pb-2">
          <div className="flex" style={{ minWidth: 720 }}>
            {/* 左侧：星期标签 */}
            <div className="flex flex-col gap-[2px] mr-2 pt-[18px]">
              {DAY_LABELS.map((l, i) => (
                <div key={i} className="h-[11px] text-[9px] leading-[11px]"
                  style={{ color: l ? 'rgb(var(--text-secondary))' : 'transparent' }}>
                  {l}
                </div>
              ))}
            </div>

            <div>
              {/* 月份标签行：绝对定位，每标签精确落在对应列 */}
              <div
                className="relative mb-[3px] text-[9px] leading-[14px]"
                style={{
                  width: heatmap.weeks.length * 13 - 2, // 列数 × (11px + 2px) - 最后一个 gap
                  height: 14,
                  color: 'rgb(var(--text-secondary))',
                }}
              >
                {heatmap.monthLabels.map((m, i) => {
                  const prevCol = i > 0 ? heatmap.monthLabels[i - 1].col : -99
                  if (m.col - prevCol < 3 && i > 0) return null
                  return (
                    <span key={i} className="absolute" style={{ left: m.col * 13 }}>
                      {m.label}
                    </span>
                  )
                })}
              </div>

              {/* 方格网格：7 行 × N 列 */}
              <div className="flex flex-col gap-[2px]">
                {Array.from({ length: 7 }).map((_, row) => (
                  <div key={row} className="flex gap-[2px]">
                    {heatmap.weeks.map((week, col) => {
                      const day = week[row]
                      if (!day) return <div key={col} className="w-[11px] h-[11px]" />
                      const dateStr = format(day.date, 'yyyy-MM-dd')
                      const weekday = DAY_NAMES_FULL[getDay(day.date)]
                      return (
                        <div
                          key={col}
                          className="w-[11px] h-[11px] rounded-[2px]"
                          style={{ background: heatmapColor(day.count) }}
                          title={`${dateStr} (${weekday}) — ${day.count} 次打卡`}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>

              {/* 图例 */}
              <div className="flex items-center gap-1.5 mt-3 text-[10px]"
                style={{ color: 'rgb(var(--text-secondary))' }}>
                <span>少</span>
                {[0, 1, 3, 5, 8].map((n) => (
                  <div key={n} className="w-[11px] h-[11px] rounded-[2px]"
                    style={{ background: heatmapColor(n) }} />
                ))}
                <span>多</span>
              </div>
            </div>
          </div>
        </div>

        {/* 分隔线 */}
        <div className="my-5 border-t" style={{ borderColor: 'rgb(var(--border-light))' }} />

        {/* 数据导入导出 */}
        <div>
          <h3 className="text-sm font-medium mb-3"
            style={{ color: 'rgb(var(--text-secondary))', fontFamily: '"DingTalk JinBuTi", system-ui, sans-serif' }}>
            数据管理
          </h3>
          <div className="flex items-center gap-3">
            {/* 导出按钮 */}
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl transition-colors"
              style={{
                color: 'rgb(var(--accent-green))',
                background: 'rgb(var(--accent-green) / 0.1)',
                border: '1px solid rgb(var(--accent-green) / 0.2)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgb(var(--accent-green) / 0.18)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgb(var(--accent-green) / 0.1)' }}
            >
              <Download size={14} />
              导出全部数据
            </button>

            {/* 导入按钮 */}
            <button
              onClick={handleImport}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl transition-colors"
              style={{
                color: 'rgb(var(--accent-secondary))',
                background: 'rgb(var(--accent-secondary) / 0.1)',
                border: '1px solid rgb(var(--accent-secondary) / 0.2)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgb(var(--accent-secondary) / 0.18)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgb(var(--accent-secondary) / 0.1)' }}
            >
              <Upload size={14} />
              导入备份数据
            </button>
          </div>
          <p className="text-[10px] mt-2" style={{ color: 'rgb(var(--text-light))' }}>
            导入将覆盖当前所有数据，建议先导出备份
          </p>
        </div>
      </div>
    </div>,
    document.body,
  )
}
