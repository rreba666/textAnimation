// 顶部栏：问候 + 时间 + 日期 + 天气 + 主题切换 + 进度条

import { useState, useEffect, useCallback } from 'react'
import {
  Clock, Search, X, MapPin, Droplets, Wind,
  Sun, Moon, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning, CloudSun,
} from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useDashboardStore } from '../store/useDashboardStore'
import Greeting from './Greeting'
import ProgressBar from './ProgressBar'
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
            <span className="hidden sm:inline">儿戏的日常手记</span>
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
              <WeatherIcon code={weatherData.wmoCode} size={36} />
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
                    <WeatherIcon code={day.wmoCode} size={22} />
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
              <button onClick={handleCitySubmit} className="p-1 rounded-lg hover:bg-notebook-bg text-warm-orange"><Search size={16} /></button>
              <button onClick={() => setShowCityInput(false)} className="p-1 rounded-lg hover:bg-notebook-bg text-text-secondary"><X size={16} /></button>
            </div>
          ) : (
            <button
              onClick={() => setShowCityInput(true)}
              className="flex items-center gap-1 text-xs text-text-secondary hover:text-warm-orange transition-colors px-2 py-1 rounded-lg hover:bg-notebook-bg"
            >
              <MapPin size={14} /><span>{weatherData?.city || weatherCity}</span>
            </button>
          )}

          {/* 主题切换 */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-notebook-bg transition-colors text-text-secondary hover:text-warm-orange shrink-0"
            title={theme === 'light' ? '暗色模式' : '亮色模式'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </div>

      {/* 第二行：本月进度条 */}
      <div className="px-4 sm:px-6 pb-3">
        <ProgressBar />
      </div>

      {/* 分隔线 */}
      <div className="h-px mx-4 sm:mx-6 bg-gradient-to-r from-transparent via-warm-orange/20 to-transparent" />
    </header>
  )
}
