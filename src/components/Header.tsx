// 顶部栏：问候 + 时间 + 日期 + 天气 + 主题切换 + PWA 安装 + 进度条

// PWA beforeinstallprompt 事件类型（Chrome 非标准 API）
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'
import {
  Clock, Search, X, MapPin, Droplets, Wind,
  Sun, Moon, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning, CloudSun,
  LayoutGrid, Palette, HelpCircle, Award, Smile, Meh, Frown, Zap, BatteryLow,
} from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useDashboardStore } from '../store/useDashboardStore'
import Greeting from './Greeting'
import ProgressBar from './ProgressBar'
import DailyQuote from './DailyQuote'
import Countdown from './Countdown'
import ManageCardsModal from './ManageCardsModal'
import BackgroundPicker from './BackgroundPicker'
import DataTipModal from './DataTipModal'
const AchievementsModal = lazy(() => import('./AchievementsModal'))
import gsap from 'gsap'
import type { WeatherData, ForecastDay } from '../types'

// WMO 天气代码 → 描述
function getWeatherDescription(code: number): string {
  if (code === 0) return '晴天'
  if (code <= 3) return '多云'
  if (code <= 48) return '雾'
  if (code <= 57) return '毛毛雨'
  if (code <= 67) return '雨'
  if (code <= 77) return '雪'
  if (code <= 86) return '阵雨'
  return '雷暴'
}

// WMO 天气代码 → 图标
function WeatherIcon({ code, size }: { code: number; size: number }) {
  const props = { size, className: 'text-warm-orange' }
  if (code === 0) return <Sun {...props} />
  if (code <= 3) return <CloudSun {...props} />
  if (code <= 48) return <CloudFog {...props} />
  if (code <= 57) return <CloudDrizzle {...props} />
  if (code <= 67) return <CloudRain {...props} />
  if (code <= 77) return <CloudSnow {...props} />
  if (code <= 86) return <CloudRain {...props} />
  return <CloudLightning {...props} />
}

// GSAP 天气微动画：根据天气类型播放循环效果
function AnimatedWeatherIcon({ code, size }: { code: number; size: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const tweenRef = useRef<gsap.core.Tween>()

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // 先杀旧动画
    if (tweenRef.current) { tweenRef.current.kill(); tweenRef.current = undefined }

    // 根据天气选择动画
    if (code === 0) {
      // 晴天：无限旋转 + 脉冲光晕
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 })
      tl.to(el, { rotation: 360, duration: 8, ease: 'none' }, 0)
      tl.to(el, { scale: 1.15, duration: 1.5, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0)
    } else if (code <= 3) {
      // 多云：左右缓动
      tweenRef.current = gsap.to(el, { x: 3, duration: 2.5, ease: 'sine.inOut', yoyo: true, repeat: -1 })
    } else if (code <= 48) {
      // 雾：透明度闪烁
      tweenRef.current = gsap.to(el, { opacity: 0.55, duration: 2.5, ease: 'sine.inOut', yoyo: true, repeat: -1 })
    } else if (code >= 51 && code <= 86) {
      // 雨：上下跳动 + 透明度闪烁
      const tl = gsap.timeline({ repeat: -1 })
      tl.to(el, { y: -3, duration: 0.4, ease: 'power2.out', yoyo: true, repeat: 1 }, 0)
      tl.to(el, { opacity: 0.7, duration: 0.5, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0.8)
    } else if (code <= 77) {
      // 雪：缓慢旋转 + 左右摆动
      const tl = gsap.timeline({ repeat: -1 })
      tl.to(el, { rotation: 15, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0)
      tl.to(el, { x: 2, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0)
    }

    return () => { if (tweenRef.current) tweenRef.current.kill() }
  }, [code])

  return (
    <span ref={ref} className="inline-flex">
      <WeatherIcon code={code} size={size} />
    </span>
  )
}

export default function Header() {
  const [now, setNow] = useState(new Date())
  const [cityInput, setCityInput] = useState('')
  const [showCityInput, setShowCityInput] = useState(false)
  const [weatherError, setWeatherError] = useState('')

  const weatherCity = useDashboardStore((s) => s.weatherCity)
  const weatherData = useDashboardStore((s) => s.weatherData)
  const setWeatherCity = useDashboardStore((s) => s.setWeatherCity)
  const setWeatherData = useDashboardStore((s) => s.setWeatherData)
  const theme = useDashboardStore((s) => s.theme)
  const toggleTheme = useDashboardStore((s) => s.toggleTheme)
  const [showCardManager, setShowCardManager] = useState(false)
  const [showBgPicker, setShowBgPicker] = useState(false)
  const [showDataTip, setShowDataTip] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)

  // PWA 安装：读取 index.html 预捕获的全局变量 + 监听后续事件
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => (window as any).__pwaInstallPrompt || null
  )
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // 如果在 index.html 脚本中已捕获到，直接使用
    if ((window as any).__pwaInstallPrompt && !installPrompt) {
      setInstallPrompt((window as any).__pwaInstallPrompt)
    }
    const handler = (e: Event) => {
      e.preventDefault()
      ;(window as any).__pwaInstallPrompt = e
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => { setInstalled(true); setInstallPrompt(null) })
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // 仅当浏览器提供原生安装事件时才显示按钮
  const showInstallBtn = !installed && !!installPrompt

  const handleInstall = useCallback(async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const result = await installPrompt.userChoice
    if (result.outcome === 'accepted') {
      setInstallPrompt(null)
      setInstalled(true)
    }
  }, [installPrompt])

  // 时钟
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // 同步主题
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const timeStr = format(now, 'HH:mm:ss')
  const dateStr = format(now, 'yyyy年M月d日')
  const weekStr = format(now, 'EEEE', { locale: zhCN })

  // Open-Meteo 天气（10 分钟缓存）
  const fetchWeather = useCallback(async (city: string) => {
    const cached = useDashboardStore.getState().weatherData
    if (cached && cached.city === city && Date.now() - cached.timestamp < 10 * 60 * 1000) return

    try {
      setWeatherError('')
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh`,
      )
      if (!geoRes.ok) throw new Error('geo')
      const geoData = await geoRes.json()
      if (!geoData.results?.length) { setWeatherError('未找到该城市'); return }
      const { latitude, longitude } = geoData.results[0]
      const cityName = geoData.results[0].country === 'China' ? (geoData.results[0].name || city) : city

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m` +
        `&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=4`,
      )
      if (!weatherRes.ok) throw new Error('weather')
      const wj = await weatherRes.json()

      const forecast: ForecastDay[] = wj.daily.time.slice(1, 4).map((date: string, i: number) => ({
        date,
        tempMin: Math.round(wj.daily.temperature_2m_min[i + 1]),
        tempMax: Math.round(wj.daily.temperature_2m_max[i + 1]),
        wmoCode: wj.daily.weather_code[i + 1],
        description: getWeatherDescription(wj.daily.weather_code[i + 1]),
      }))

      setWeatherData({
        city: cityName,
        temp: Math.round(wj.current.temperature_2m),
        description: getWeatherDescription(wj.current.weather_code),
        wmoCode: wj.current.weather_code,
        humidity: wj.current.relative_humidity_2m,
        windSpeed: Math.round(wj.current.wind_speed_10m * 10) / 10,
        forecast,
        timestamp: Date.now(),
      })
    } catch {
      setWeatherError('网络请求失败')
    }
  }, [setWeatherData])

  useEffect(() => {
    if (weatherCity) fetchWeather(weatherCity)
  }, [weatherCity, fetchWeather])

  const handleCitySubmit = () => {
    const city = cityInput.trim()
    if (city) {
      setWeatherCity(city)
      setWeatherData(null)
      setCityInput('')
      setShowCityInput(false)
    }
  }

  return (
    <header className="w-full">
      {/* 第一行 */}
      <div className="flex items-center justify-between flex-wrap gap-3 px-4 sm:px-6 pt-5 pb-3">
        {/* 左侧：问候 + 时间 */}
        <div className="flex items-center gap-4">
          <h1 className="text-lg sm:text-xl font-bold text-text-primary tracking-wide whitespace-nowrap flex items-center gap-2">
            <Greeting />
            <span className="hidden sm:inline text-text-light font-normal">|</span>
            <span className="hidden sm:inline">RE:序章</span>
          </h1>
        </div>

        {/* 中间：时钟 */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-warm-orange" />
            <span className="font-mono text-xl sm:text-2xl font-semibold text-text-primary tracking-wider tabular-nums">
              {timeStr}
            </span>
          </div>
          <div className="hidden md:block text-text-secondary">
            <span className="text-sm">{dateStr}</span>
            <span className="mx-2 text-border-light">|</span>
            <span className="text-sm">{weekStr}</span>
          </div>
        </div>

        {/* 右侧：天气 + 主题切换 */}
        <div className="flex items-center gap-2">
          {/* 天气 */}
          {weatherData && !weatherError ? (
            <div className="flex items-center gap-2 bg-notebook-bg/60 rounded-xl px-3 py-1.5">
              <AnimatedWeatherIcon code={weatherData.wmoCode} size={36} />
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-semibold text-text-primary">{weatherData.temp}°C</span>
                  <span className="text-xs text-text-secondary">{weatherData.description}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-secondary">
                  <span className="flex items-center gap-0.5"><Droplets size={10} />{weatherData.humidity}%</span>
                  <span className="flex items-center gap-0.5"><Wind size={10} />{weatherData.windSpeed} m/s</span>
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-1 ml-2 pl-2 border-l border-border-light">
                {weatherData.forecast.slice(0, 3).map((day) => (
                  <div key={day.date} className="text-center px-1">
                    <div className="text-xs text-text-light">{format(new Date(day.date), 'M/d')}</div>
                    <AnimatedWeatherIcon code={day.wmoCode} size={22} />
                    <div className="text-xs text-text-secondary">{day.tempMin}°/{day.tempMax}°</div>
                  </div>
                ))}
              </div>
            </div>
          ) : weatherError ? (
            <div className="text-text-secondary text-sm bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">{weatherError}</div>
          ) : (
            <div className="flex items-center gap-2 text-text-light text-sm"><Cloud size={18} /><span>加载天气中...</span></div>
          )}

          {/* 城市切换 */}
          {showCityInput ? (
            <div className="flex items-center gap-1">
              <input
                type="text" value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCitySubmit()}
                placeholder="输入城市名"
                className="w-24 px-2 py-1 text-sm border border-border-light rounded-lg outline-none focus:border-warm-orange bg-notebook-card text-text-primary"
                autoFocus
              />
              <button onClick={handleCitySubmit} className="p-1 rounded-lg hover:bg-notebook-bg dark:hover:bg-white/8 text-warm-orange"><Search size={16} /></button>
              <button onClick={() => setShowCityInput(false)} className="p-1 rounded-lg hover:bg-notebook-bg dark:hover:bg-white/8 text-text-secondary"><X size={16} /></button>
            </div>
          ) : (
            <button
              onClick={() => setShowCityInput(true)}
              className="flex items-center gap-1 text-xs text-text-secondary hover:text-warm-orange transition-colors px-2 py-1 rounded-lg hover:bg-notebook-bg dark:hover:bg-white/8"
            >
              <MapPin size={14} /><span>{weatherData?.city || weatherCity}</span>
            </button>
          )}

          {/* 成就徽章 */}
          <button
            onClick={() => setShowAchievements(true)}
            className="p-2 rounded-xl hover:bg-notebook-bg dark:hover:bg-white/8 transition-colors text-text-secondary hover:text-warm-orange shrink-0"
            title="成就徽章"
          >
            <Award size={18} />
          </button>

          {/* 帮助（重新打开欢迎弹窗） */}
          <button
            onClick={() => setShowDataTip(true)}
            className="p-2 rounded-xl hover:bg-notebook-bg dark:hover:bg-white/8 transition-colors text-text-secondary hover:text-warm-orange shrink-0"
            title="帮助与快捷键"
          >
            <HelpCircle size={18} />
          </button>

          {/* 管理卡片 */}
          <button
            onClick={() => setShowCardManager(true)}
            className="p-2 rounded-xl hover:bg-notebook-bg dark:hover:bg-white/8 transition-colors text-text-secondary hover:text-warm-orange shrink-0"
            title="管理卡片"
          >
            <LayoutGrid size={18} />
          </button>

          {/* 背景切换 */}
          <button
            onClick={() => setShowBgPicker(true)}
            className="p-2 rounded-xl hover:bg-notebook-bg dark:hover:bg-white/8 transition-colors text-text-secondary hover:text-warm-orange shrink-0"
            title="切换背景"
          >
            <Palette size={18} />
          </button>

          {/* 主题切换 */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-notebook-bg dark:hover:bg-white/8 transition-colors text-text-secondary hover:text-warm-orange shrink-0"
            title={theme === 'light' ? '暗色模式' : '亮色模式'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* PWA 安装按钮：线上 HTTPS 可安装时显示，localhost 开发环境常显 */}
          {showInstallBtn && (
            <button
              onClick={handleInstall}
              className="p-2 rounded-xl hover:bg-warm-orange/10 transition-colors text-warm-orange shrink-0"
              title="安装到桌面"
            >
              {/* 手绘风格安装图标：笔记本 + 向下箭头 */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="3" width="16" height="18" rx="3" />
                <path d="M8 8h8M8 12h6" />
                <path d="M12 16v5M9 19l3 3 3-3" />
              </svg>
            </button>
          )}

          {/* 弹窗 */}
          <Suspense fallback={null}><AchievementsModal open={showAchievements} onClose={() => setShowAchievements(false)} /></Suspense>
          <DataTipModal open={showDataTip} onClose={() => setShowDataTip(false)} />
          <ManageCardsModal open={showCardManager} onClose={() => setShowCardManager(false)} />
          <BackgroundPicker open={showBgPicker} onClose={() => setShowBgPicker(false)} />
        </div>

        {/* 每日一言 + 心情选择器（两端对齐） */}
        <div className="w-full hidden sm:flex items-center justify-between">
          <DailyQuote />
          <MoodPicker />
        </div>
      </div>

      {/* 第二行：本月进度条 + 倒计时 */}
      <div className="px-4 sm:px-6 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[200px]"><ProgressBar /></div>
          <Countdown />
        </div>
      </div>

      {/* 分隔线 */}
      <div className="h-px mx-4 sm:mx-6 bg-gradient-to-r from-transparent via-warm-orange/20 to-transparent" />
    </header>
  )
}

/** 每日心情选择器 */
function MoodPicker() {
  const moodRecords = useDashboardStore((s) => s.moodRecords)
  const setTodayMood = useDashboardStore((s) => s.setTodayMood)
  const today = format(new Date(), 'yyyy-MM-dd')
  const current = moodRecords[today] || ''

  const moods = [
    { key: 'happy', icon: <Smile size={14} />, label: '开心' },
    { key: 'calm', icon: <Meh size={14} />, label: '平静' },
    { key: 'sad', icon: <Frown size={14} />, label: '难过' },
    { key: 'energy', icon: <Zap size={14} />, label: '干劲' },
    { key: 'tired', icon: <BatteryLow size={14} />, label: '疲惫' },
  ]

  return (
    <div className="flex items-center gap-0.5 bg-notebook-bg/60 rounded-lg p-0.5">
      {moods.map((m) => (
        <button
          key={m.key}
          onClick={() => setTodayMood(current === m.key ? '' : m.key)}
          className={`p-1 rounded-md transition-colors ${
            current === m.key
              ? 'bg-[rgb(var(--bg-card))] shadow-sm'
              : 'text-text-light hover:text-text-secondary'
          }`}
          title={m.label}
        >
          {m.icon}
        </button>
      ))}
    </div>
  )
}
