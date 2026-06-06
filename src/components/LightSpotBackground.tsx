// 静态光斑 + 渐变背景 —— 亮色阳光 / 暗色月光（无持续动画，避免 Painting 开销）

import { useDashboardStore } from '../store/useDashboardStore'

export default function LightSpotBackground() {
  const theme = useDashboardStore((s) => s.theme)
  const isDark = theme === 'dark'

  const colors = isDark
    ? {
        wave1: 'rgba(180,200,230,0.25)',
        wave2: 'rgba(160,180,220,0.2)',
        spot1: 'rgba(190,210,240,0.18)',
        spot2: 'rgba(210,225,245,0.14)',
        spot3: 'rgba(175,200,230,0.12)',
      }
    : {
        wave1: 'rgba(255,240,220,0.4)',
        wave2: 'rgba(255,220,200,0.3)',
        spot1: 'rgba(255,230,180,0.25)',
        spot2: 'rgba(255,245,235,0.2)',
        spot3: 'rgba(255,220,170,0.18)',
      }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* 底层：静态渐变 */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${colors.wave1} 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, ${colors.wave2} 0%, transparent 50%)`,
          opacity: 0.75,
        }}
      />
      {/* 光斑 1 —— 左上 */}
      <div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '300px', height: '300px',
          top: '15%', left: '10%',
          background: `radial-gradient(circle, ${colors.spot1} 0%, transparent 70%)`,
        }}
      />
      {/* 光斑 2 —— 右下 */}
      <div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '250px', height: '250px',
          bottom: '20%', right: '15%',
          background: `radial-gradient(circle, ${colors.spot2} 0%, transparent 70%)`,
        }}
      />
      {/* 光斑 3 —— 中上 */}
      <div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '200px', height: '200px',
          top: '40%', left: '50%',
          background: `radial-gradient(circle, ${colors.spot3} 0%, transparent 70%)`,
        }}
      />
    </div>
  )
}
