// 番茄钟 —— SVG 圆环倒计时，Web Audio 蜂鸣 + Notification，状态持久化

import { useState, useEffect, useRef, useCallback } from 'react'
import { Timer, Play, Pause, RotateCcw, Bell } from 'lucide-react'
import { useDashboardStore } from '../store/useDashboardStore'

const PRESETS = [{ label: '25 分钟', m: 25 }, { label: '15 分钟', m: 15 }, { label: '5 分钟', m: 5 }]

function beep() {
  try {
    const c = new AudioContext()
    const o = c.createOscillator(); const g = c.createGain()
    o.connect(g); g.connect(c.destination)
    o.type = 'sine'; o.frequency.setValueAtTime(800, c.currentTime)
    g.gain.setValueAtTime(0.3, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.01, c.currentTime + 0.5)
    o.start(c.currentTime); o.stop(c.currentTime + 0.5)
  } catch {}
}

function notify(title: string, body: string) {
  if (!('Notification' in window)) return
  if (Notification.permission === 'granted') new Notification(title, { body })
  else if (Notification.permission !== 'denied') Notification.requestPermission().then((p) => { if (p === 'granted') new Notification(title, { body }) })
}

export default function PomodoroTimer() {
  // 从 store 恢复持久化状态
  const storePreset = useDashboardStore((s) => s.pomodoroPreset)
  const storeTimeLeft = useDashboardStore((s) => s.pomodoroTimeLeft)
  const storeRunning = useDashboardStore((s) => s.pomodoroRunning)
  const storeStartedAt = useDashboardStore((s) => s.pomodoroStartedAt)
  const setPomodoroState = useDashboardStore((s) => s.setPomodoroState)

  const [preset, setPreset] = useState(storePreset)
  const [timeLeft, setTimeLeft] = useState(storeTimeLeft)
  const [running, setRunning] = useState(false) // 实际运行状态，恢复时重新计算
  const [done, setDone] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  // 页面加载时：如果之前正在运行，扣除已流逝时间
  useEffect(() => {
    if (storeRunning && storeStartedAt) {
      const elapsed = Math.floor((Date.now() - new Date(storeStartedAt).getTime()) / 1000)
      const remaining = Math.max(0, storeTimeLeft - elapsed)
      if (remaining <= 0) {
        setTimeLeft(0)
        setDone(true)
        setPomodoroState({ preset: storePreset, timeLeft: 0, running: false, startedAt: null })
      } else {
        setPreset(storePreset)
        setTimeLeft(remaining)
        setRunning(true)
      }
    }
  }, []) // 仅首次挂载

  const clear = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = undefined }
  }, [])

  // 倒计时逻辑
  useEffect(() => {
    if (!running) { clear(); return }
    intervalRef.current = setInterval(() => {
      setTimeLeft((p) => {
        if (p <= 1) {
          setRunning(false); setDone(true)
          beep(); notify('番茄钟结束', '专注时间已到，休息一下吧。')
          setPomodoroState({ preset, timeLeft: 0, running: false, startedAt: null })
          return 0
        }
        return p - 1
      })
    }, 1000)
    return clear
  }, [running, clear, preset, setPomodoroState])

  // 保存状态到 store（每 5 秒 + 状态变化时）
  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => {
      setPomodoroState({ preset, timeLeft, running: true, startedAt: storeStartedAt || new Date().toISOString() })
    }, 5000)
    return () => clearInterval(timer)
  }, [running, preset, timeLeft, storeStartedAt, setPomodoroState])

  const mins = Math.floor(timeLeft / 60); const secs = timeLeft % 60
  const prog = 1 - timeLeft / (preset * 60)

  return (
    <div className="card p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Timer size={20} className="text-warm-orange" />
        <h2 className="text-lg font-semibold text-text-primary">番茄钟</h2>
        {running && <span className="ml-auto px-2 py-0.5 text-xs bg-warm-green/15 text-warm-green rounded-full animate-pulse">进行中</span>}
        {done && <span className="ml-auto px-2 py-0.5 text-xs bg-warm-orange/15 text-warm-orange rounded-full flex items-center gap-1"><Bell size={11} />时间到</span>}
      </div>
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgb(var(--check-undone))" strokeWidth="6" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgb(var(--accent-green))" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 42} strokeDashoffset={2 * Math.PI * 42 * (1 - prog)} className="transition-[stroke-dashoffset] duration-1000 ease-linear" />
          </svg>
          <span className={`font-mono text-3xl font-bold tabular-nums ${done ? 'text-warm-orange' : 'text-text-primary'}`}>{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-3 mb-4">
        <button
          onClick={() => {
            const next = !running
            setRunning(next)
            if (done) { setDone(false); setTimeLeft(preset * 60); setPomodoroState({ preset, timeLeft: preset * 60, running: false, startedAt: null }); return }
            if (next) setPomodoroState({ preset, timeLeft, running: true, startedAt: new Date().toISOString() })
            else setPomodoroState({ preset, timeLeft, running: false, startedAt: null })
          }}
          disabled={done}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium text-sm transition-all bg-warm-orange text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {running ? <Pause size={16} /> : <Play size={16} />}
          {running ? '暂停' : done ? '开始' : '开始'}
        </button>
        <button
          onClick={() => { clear(); setRunning(false); setDone(false); setTimeLeft(preset * 60); setPomodoroState({ preset, timeLeft: preset * 60, running: false, startedAt: null }) }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-notebook-bg dark:hover:bg-white/8 transition-colors"
        >
          <RotateCcw size={15} />重置
        </button>
      </div>
      <div className="flex items-center justify-center gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.m}
            onClick={() => { clear(); setRunning(false); setDone(false); setPreset(p.m); setTimeLeft(p.m * 60); setPomodoroState({ preset: p.m, timeLeft: p.m * 60, running: false, startedAt: null }) }}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${preset === p.m && !running ? 'bg-warm-orange/10 text-warm-orange font-medium' : 'bg-notebook-bg text-text-secondary hover:text-text-primary'}`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}
