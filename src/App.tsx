// 根组件：顶部栏 + 卡片网格布局 + 彩蛋

import { useEffect } from 'react'
import { useDashboardStore } from './store/useDashboardStore'
import Header from './components/Header'
import Todo from './components/Todo'
import Habits from './components/Habits'
import Links from './components/Links'
import PomodoroTimer from './components/PomodoroTimer'
import WeekStats from './components/WeekStats'
import Calendar from './components/Calendar'
import Notes from './components/Notes'
import EasterEgg from './components/EasterEgg'

export default function App() {
  const theme = useDashboardStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div className="min-h-screen bg-notebook-bg">
      <div className="dot-pattern min-h-screen">
        <Header />

        <main className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
            <div className="min-h-[380px]"><Todo /></div>
            <div className="min-h-[380px]"><Habits /></div>
            <div className="min-h-[280px]"><Links /></div>
            <div><PomodoroTimer /></div>
            <div><WeekStats /></div>
            <div><Calendar /></div>
            <div className="md:col-span-2 lg:col-span-3 min-h-[420px]"><Notes /></div>
          </div>
        </main>

        <EasterEgg />
      </div>
    </div>
  )
}
