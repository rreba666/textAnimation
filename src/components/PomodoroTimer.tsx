// 番茄钟 —— SVG 圆环倒计时，Web Audio 蜂鸣 + Notification

import { useState, useEffect, useRef, useCallback } from 'react'
import { Timer, Play, Pause, RotateCcw, Bell } from 'lucide-react'

const PRESETS = [{ label: '25 分钟', m: 25 }, { label: '15 分钟', m: 15 }, { label: '5 分钟', m: 5 }]

function beep() { try { const c = new AudioContext(); const o = c.createOscillator(); const g = c.createGain(); o.connect(g); g.connect(c.destination); o.type = 'sine'; o.frequency.setValueAtTime(800, c.currentTime); g.gain.setValueAtTime(0.3, c.currentTime); g.gain.exponentialRampToValueAtTime(0.01, c.currentTime + 0.5); o.start(c.currentTime); o.stop(c.currentTime + 0.5) } catch {} }

function notify(title: string, body: string) {
  if (!('Notification' in window)) return
  if (Notification.permission === 'granted') new Notification(title, { body, icon: '/favicon.svg' })
  else if (Notification.permission !== 'denied') Notification.requestPermission().then(p => { if (p === 'granted') new Notification(title, { body, icon: '/favicon.svg' }) })
}

export default function PomodoroTimer() {
  const [preset, setPreset] = useState(25)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const ref = useRef<ReturnType<typeof setInterval>>()
  const clear = useCallback(() => { if (ref.current) { clearInterval(ref.current); ref.current = undefined } }, [])

  useEffect(() => { if (!running) { clear(); return }; ref.current = setInterval(() => { setTimeLeft(p => { if (p <= 1) { setRunning(false); setDone(true); beep(); notify('番茄钟', '时间到！休息一下吧。'); return 0 }; return p - 1 }) }, 1000); return clear }, [running, clear])

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
        <button onClick={() => setRunning(!running)} disabled={done} className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium text-sm transition-all bg-warm-orange text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">{running ? <Pause size={16} /> : <Play size={16} />}{running ? '暂停' : '开始'}</button>
        <button onClick={() => { clear(); setRunning(false); setDone(false); setTimeLeft(preset * 60) }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-notebook-bg transition-colors"><RotateCcw size={15} />重置</button>
      </div>
      <div className="flex items-center justify-center gap-2">
        {PRESETS.map(p => (
          <button key={p.m} onClick={() => { clear(); setRunning(false); setDone(false); setPreset(p.m); setTimeLeft(p.m * 60) }}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${preset === p.m && !running ? 'bg-warm-orange/10 text-warm-orange font-medium' : 'bg-notebook-bg text-text-secondary hover:text-text-primary'}`}>{p.label}</button>
        ))}
      </div>
    </div>
  )
}
