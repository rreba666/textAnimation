import type { AnimationState } from '../types'

/**
 * 根据当前动效状态生成对应的 CSS 代码
 * 每种动效的输出格式独立，便于用户直接复制使用
 */
export function generateCssCode(state: AnimationState): string {
  const { text, effect, params } = state

  switch (effect) {
    case 'glitch':
      return generateGlitchCss(text, params.glitchIntensity ?? 5, params.glitchSpeed ?? 2)

    case 'neon':
      return generateNeonCss(params.neonColor ?? '#ff00ff', params.neonGlow ?? 10, params.neonFlicker ?? true)

    case 'wave':
    case 'typewriter':
    case 'spotlight':
      // 这些效果依赖 JS，返回 GSAP 代码
      return generateGsapCode(state)

    default:
      return '/* 请选择一种动效 */'
  }
}

/**
 * 生成 GSAP 动画代码
 */
function generateGsapCode(state: AnimationState): string {
  const { text, effect, params } = state

  switch (effect) {
    case 'wave':
      return `// GSAP 波浪动画 — 需要 gsap 库
import gsap from 'gsap'

const textEl = document.querySelector('.wave-text')
// 将文字拆分为单个字符
const chars = textEl.textContent.split('').map((char, i) => {
  const span = document.createElement('span')
  span.textContent = char
  span.style.display = 'inline-block'
  textEl.appendChild(span)
  return span
})

gsap.to(chars, {
  y: ${params.waveAmplitude ?? 10},
  duration: ${params.waveSpeed ?? 1.5},
  ease: 'sine.inOut',
  yoyo: true,
  repeat: -1,
  stagger: {
    each: ${(params.waveFrequency ?? 2) * 0.1},
    repeat: -1,
    yoyo: true,
  },
})`

    case 'typewriter':
      return `// GSAP 打字机动画 — 需要 gsap 库
import gsap from 'gsap'

const text = '${text}'
const el = document.querySelector('.typewriter-text')
let index = 0

const timer = setInterval(() => {
  if (index < text.length) {
    el.textContent += text[index]
    index++
  } else {
    clearInterval(timer)
  }
}, ${params.typeSpeed ?? 80})`

    case 'spotlight':
      return `// 聚光灯效果 — 需要 GSAP 实现平滑跟随
import gsap from 'gsap'

const textEl = document.querySelector('.spotlight-text')
document.addEventListener('mousemove', (e) => {
  gsap.to(textEl, {
    '--x': e.clientX + 'px',
    '--y': e.clientY + 'px',
    duration: 0.3,
    ease: 'power2.out',
  })
})`

    default:
      return '/* 暂不支持 */'
  }
}

/* ============================================
   各动效 CSS 生成函数
   ============================================ */

/**
 * Glitch 故障效果 — 纯 CSS
 * 核心技法：两个 ::before / ::after 伪元素分别偏移 + skew
 */
function generateGlitchCss(text: string, intensity: number, speed: number): string {
  const offset = Math.round(intensity * 0.4)
  const duration = 2 / speed

  return `/* Glitch 故障效果 — 纯 CSS */
.glitch-text {
  position: relative;
  display: inline-block;
  color: #fff;
  font-size: 3rem;
  font-weight: bold;
  /* 文字本身微弱的 text-shadow */
  text-shadow: 2px 2px 0 rgba(255, 0, 0, 0.6),
               -2px -2px 0 rgba(0, 255, 255, 0.6);
  animation: glitch-skew ${duration.toFixed(2)}s infinite linear alternate-reverse;
}

.glitch-text::before,
.glitch-text::after {
  content: '${text}';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* 红色伪元素 — 向左偏移 */
.glitch-text::before {
  left: ${-offset}px;
  color: #f00;
  animation: glitch-before ${duration.toFixed(2)}s infinite linear alternate-reverse;
  clip-path: inset(0 0 50% 0);
}

/* 青色伪元素 — 向右偏移 */
.glitch-text::after {
  left: ${offset}px;
  color: #0ff;
  animation: glitch-after ${duration.toFixed(2)}s infinite linear alternate-reverse;
  clip-path: inset(50% 0 0 0);
}

@keyframes glitch-skew {
  0% { transform: skew(0deg); }
  100% { transform: skew(${(intensity * 0.1).toFixed(1)}deg); }
}
@keyframes glitch-before {
  0% { transform: none; opacity: 0.8; }
  100% { transform: translate(${-intensity}px, ${-intensity}px); opacity: 0.6; }
}
@keyframes glitch-after {
  0% { transform: none; opacity: 0.8; }
  100% { transform: translate(${intensity}px, ${intensity}px); opacity: 0.6; }
}`
}

/**
 * Neon 霓虹效果 — 纯 CSS
 * 核心技法：多层 text-shadow 叠加营造辉光
 */
function generateNeonCss(color: string, glow: number, flicker: boolean): string {
  const layers = 5
  const shadowParts: string[] = []
  for (let i = 1; i <= layers; i++) {
    const blur = i * glow * 1.2
    const alpha = (1 - i * 0.15).toFixed(2)
    shadowParts.push(`0 0 ${blur.toFixed(0)}px ${color}${decimalToHex(Math.max(0, parseFloat(alpha)))}`)
  }

  return `/* Neon 霓虹效果 — 纯 CSS */
.neon-text {
  color: #fff;
  font-size: 3rem;
  font-weight: bold;
  text-shadow:
    ${shadowParts.join(',\n    ')};
  ${flicker ? 'animation: neon-flicker 1.5s infinite alternate;' : ''}
}

${flicker ? `@keyframes neon-flicker {
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
    text-shadow:
      ${shadowParts.join(',\n      ')};
  }
  20%, 24%, 55% {
    text-shadow: none;
  }
}` : ''
}`
}

/** 0~1 小数转十六进制（用于 rgba hex） */
function decimalToHex(d: number): string {
  const hex = Math.round(d * 255).toString(16)
  return hex.length === 1 ? '0' + hex : hex
}
