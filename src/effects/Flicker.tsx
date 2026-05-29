interface Props {
  text: string
  /** 闪烁强度 1~10 */
  intensity: number
  /** 烛光颜色 */
  color: string
}

/**
 * Flicker 烛光闪烁效果 — 纯 CSS 实现
 * 模拟蜡烛火焰不规则的明暗变化：
 * - 使用多层 text-shadow 营造暖色辉光
 * - @keyframes 采用不均匀百分比模拟火焰随机跳动
 * - intensity 控制辉光扩散范围和亮度
 */
export default function Flicker({ text, intensity, color }: Props) {
  // 根据强度计算辉光层
  const glowLayers = [
    `0 0 ${4 + intensity * 2}px ${color}`,
    `0 0 ${8 + intensity * 3}px ${color}`,
    `0 0 ${12 + intensity * 4}px ${color}99`,
    `0 0 ${20 + intensity * 5}px ${color}66`,
    `0 0 ${30 + intensity * 6}px ${color}33`,
  ].join(', ')

  // 辉光强度影响透明度摆动幅度
  const minOpacity = Math.max(0.3, 1 - intensity * 0.07)

  return (
    <>
      <style>{getFlickerKeyframes(minOpacity)}</style>
      <span
        className="select-none"
        style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          color: '#ffe8c0',
          textShadow: glowLayers,
          animation: 'flicker-flame 0.15s infinite alternate',
        }}
      >
        {text || '烛光闪烁'}
      </span>
    </>
  )
}

/** 烛光闪烁关键帧 — 不均匀分布模拟自然火焰 */
function getFlickerKeyframes(minOpacity: number): string {
  return `@keyframes flicker-flame {
  0%   { opacity: 1; transform: scale(1); }
  15%  { opacity: ${minOpacity}; transform: scale(0.98); }
  30%  { opacity: 0.95; transform: scale(1.01); }
  45%  { opacity: ${minOpacity + 0.05}; transform: scale(0.97); }
  60%  { opacity: 1; transform: scale(1.02); }
  75%  { opacity: ${minOpacity}; transform: scale(0.99); }
  90%  { opacity: 0.9; transform: scale(1); }
  100% { opacity: 1; transform: scale(1.01); }
}`
}
