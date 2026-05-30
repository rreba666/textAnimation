import { useMemo } from 'react'

interface Props {
  text: string
  intensity: number
  speed: number
  color1?: string
  color2?: string
}

/**
 * Glitch 故障效果 — 纯 CSS 实现
 * 通过 ::before / ::after 伪元素的分层偏移 + clip-path 切割产生故障感
 * 动态生成 <style> 标签注入关键帧，利用 React 的 useMemo 缓存避免重复计算
 */
export default function Glitch({ text, intensity, speed, color1 = '#ff4444', color2 = '#44ffff' }: Props) {
  const css = useMemo(() => {
    const offset = Math.round(intensity * 0.4)
    const duration = Math.max(0.3, 2 / speed).toFixed(2)

    return `
.glitch-text {
  position: relative;
  display: inline-block;
  animation: glitch-skew ${duration}s infinite linear alternate-reverse;
}
.glitch-text::before,
.glitch-text::after {
  content: '${text.replace(/'/g, "\\'")}';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.glitch-text::before {
  left: ${-offset}px;
  color: ${color1};
  animation: glitch-before ${duration}s infinite linear alternate-reverse;
  clip-path: inset(0 0 50% 0);
}
.glitch-text::after {
  left: ${offset}px;
  color: ${color2};
  animation: glitch-after ${duration}s infinite linear alternate-reverse;
  clip-path: inset(50% 0 0 0);
}
@keyframes glitch-skew {
  0% { transform: skew(0deg); }
  100% { transform: skew(${(intensity * 0.1).toFixed(1)}deg); }
}
@keyframes glitch-before {
  0% { transform: none; opacity: 0.8; }
  100% { transform: translate(${-intensity}px, ${-intensity}px); opacity: 0.5; }
}
@keyframes glitch-after {
  0% { transform: none; opacity: 0.8; }
  100% { transform: translate(${intensity}px, ${intensity}px); opacity: 0.5; }
}`}, [text, intensity, speed])

  return (
    <>
      {/* React 动态注入样式：仅在当前效果激活时渲染 */}
      <style>{css}</style>
      <span
        className="glitch-text select-none"
        style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          color: '#fff',
          textShadow: `2px 2px 0 ${color1}99, -2px -2px 0 ${color2}99`,
        }}
      >
        {text || '预览文字'}
      </span>
    </>
  )
}
