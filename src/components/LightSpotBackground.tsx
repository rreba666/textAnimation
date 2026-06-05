// 光斑漂移 + 波动渐变背景 —— 亮色阳光 / 暗色月光

import { useDashboardStore } from '../store/useDashboardStore'

export default function LightSpotBackground() {
  const theme = useDashboardStore((s) => s.theme)
  const isDark = theme === 'dark'

  // 阳光色 → 月光色
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

      {/* 底层：波动渐变 */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${colors.wave1} 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, ${colors.wave2} 0%, transparent 50%)`,
          animation: 'wave-drift 20s ease-in-out infinite',
        }}
      />

      {/* 光斑 1 */}
      <div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '300px', height: '300px',
          background: `radial-gradient(circle, ${colors.spot1} 0%, transparent 70%)`,
          animation: 'spot-drift-1 18s ease-in-out infinite',
        }}
      />
      {/* 光斑 2 */}
      <div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '250px', height: '250px',
          background: `radial-gradient(circle, ${colors.spot2} 0%, transparent 70%)`,
          animation: 'spot-drift-2 22s ease-in-out infinite',
        }}
      />
      {/* 光斑 3 */}
      <div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '200px', height: '200px',
          background: `radial-gradient(circle, ${colors.spot3} 0%, transparent 70%)`,
          animation: 'spot-drift-3 25s ease-in-out infinite',
        }}
      />

      <style>{`
        @keyframes wave-drift {
          0%, 100% { opacity: 0.6; transform: scale(1) rotate(0deg); }
          25%      { opacity: 0.9; transform: scale(1.05) rotate(1deg); }
          50%      { opacity: 0.5; transform: scale(0.97) rotate(-0.5deg); }
          75%      { opacity: 0.85; transform: scale(1.03) rotate(0.5deg); }
        }
        @keyframes spot-drift-1 {
          0%   { top: -10%; left: -5%; }
          25%  { top: 40%; left: 30%; }
          50%  { top: 70%; left: 60%; }
          75%  { top: 20%; left: 80%; }
          100% { top: -10%; left: -5%; }
        }
        @keyframes spot-drift-2 {
          0%   { top: 60%; left: 90%; }
          33%  { top: 10%; left: 50%; }
          66%  { top: 50%; left: 0%; }
          100% { top: 60%; left: 90%; }
        }
        @keyframes spot-drift-3 {
          0%   { top: 30%; left: 20%; }
          50%  { top: 60%; left: 40%; }
          100% { top: 30%; left: 20%; }
        }
      `}</style>
    </div>
  )
}
