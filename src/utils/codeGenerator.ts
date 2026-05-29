import type { AnimationState } from '../types'

/**
 * 根据当前动效状态生成对应的 CSS/JS 代码
 * 纯 CSS 效果返回 CSS 代码，JS 依赖效果返回 JS 代码
 */
export function generateCssCode(state: AnimationState): string {
  const { text, effect, params } = state

  switch (effect) {
    // 纯 CSS 效果
    case 'glitch':
      return generateGlitchCss(text, params.glitchIntensity ?? 5, params.glitchSpeed ?? 2)
    case 'neon':
      return generateNeonCss(params.neonColor ?? '#ff00ff', params.neonGlow ?? 10, params.neonFlicker ?? true)
    case 'gradient':
      return generateGradientCss(params.gradientColor1 ?? '#ff6b6b', params.gradientColor2 ?? '#4ecdc4', params.gradientSpeed ?? 4, params.gradientAngle ?? 135)
    case 'flicker':
      return generateFlickerCss(params.flickerIntensity ?? 5, params.flickerColor ?? '#ff8c42')
    case 'flip':
      return generateFlipCss(params.flipAngle ?? 180, params.flipSpeed ?? 2, params.flipAxis ?? 'X')
    case 'liquid':
      return generateLiquidCss(params.liquidIntensity ?? 10, params.liquidSpeed ?? 3, params.liquidScale ?? 150)
    case 'hologram':
      return generateHologramCss(params.hologramColor ?? '#4dc9f6', params.hologramAngle ?? 135, params.hologramDistance ?? 6)
    case 'chromatic':
      return generateChromaticCss(params.chromaticOffset ?? 5, params.chromaticAngle ?? 0)
    case 'cube':
      return generateCubeCss(params.cubeSize ?? 200, params.cubeSpeed ?? 5, params.cubePerspective ?? 500)
    case 'scanline':
      return generateScanlineCss(params.scanlineDensity ?? 10, params.scanlineSpeed ?? 3, params.scanlineColor ?? '#4dff4d')
    case 'metal':
      return generateMetalCss(params.metalColor ?? '#d4af37', params.metalAngle ?? 135, params.metalShine ?? 5)
    case 'glass':
      return generateGlassCss(params.glassBlur ?? 4, params.glassOpacity ?? 0.5, params.glassTint ?? '#ffffff')
    case 'fire':
      return generateFireCss(params.fireIntensity ?? 5, params.fireSpeed ?? 2)
    case 'ice':
      return generateIceCss(params.iceSparkle ?? 5, params.iceColor ?? '#88ccff', params.iceSpeed ?? 2)
    case 'ink':
      return generateInkCss(params.inkSpread ?? 5, params.inkColor ?? '#ffffff', params.inkSpeed ?? 2)
    case 'shake':
      return generateShakeCss(params.shakeIntensity ?? 5, params.shakeSpeed ?? 5)
    case 'pulse':
      return generatePulseCss(params.pulseScale ?? 1.2, params.pulseSpeed ?? 1.5)
    case 'skew':
      return generateSkewCss(params.skewAngle ?? 15, params.skewSpeed ?? 2)
    case 'roll':
      return generateRollCss(params.rollDistance ?? 300, params.rollSpeed ?? 2, params.rollDirection ?? 'right')
    case 'rave':
      return generateRaveCss(params.raveSpeed ?? 2, params.raveColor1 ?? '#ff0088', params.raveColor2 ?? '#00ffff')
    case 'phosphor':
      return generatePhosphorCss(params.phosphorTrail ?? 5, params.phosphorSpeed ?? 2)
    case 'prism':
      return generatePrismCss(params.prismIntensity ?? 5, params.prismAngle ?? 0)
    case 'aurora':
      return generateAuroraCss(params.auroraSpeed ?? 2, params.auroraWidth ?? 5)
    case 'warp':
      return generateWarpCss(params.warpIntensity ?? 10, params.warpRadius ?? 150)
    case 'glowpulse':
      return generateGlowpulseCss(params.glowpulseSize ?? 40, params.glowpulseSpeed ?? 2, params.glowpulseColor ?? '#ff88cc')
    case 'twist':
      return generateTwistCss(params.twistAngle ?? 60, params.twistSpeed ?? 2)
    case 'sparkle':
      return generateSparkleCss(params.sparkleCount ?? 15, params.sparkleSpeed ?? 2)
    case 'drip':
      return generateDripCss(params.dripCount ?? 5, params.dripLength ?? 40, params.dripSpeed ?? 2)
    case 'gradientorb':
      return generateOrbCss(params.orbCount ?? 4, params.orbSpeed ?? 2, params.orbBlur ?? 60)
    case 'skeletonwave':
      return generateSkelCss(params.waveSpeed2 ?? 2, params.waveColor2 ?? '#b8a0d4')

    // Canvas 效果 → JS 代码
    case 'particles':
    case 'matrixrain':
    case 'noise':
      return generateCanvasJs(state)

    // 交互效果 → JS + CSS
    case 'magnet':
    case 'parallaxtilt':
    case 'morphing':
    case 'pagetransition':
      return generateInteractionJs(state)

    // JS 依赖效果 → 返回 JS 代码
    case 'wave':
    case 'typewriter':
    case 'spotlight':
    case 'bounce':
    case 'stagger':
    case 'blast':
    case 'float':
      return generateJsCode(state)

    default:
      return '/* 请选择一种动效 */'
  }
}

/** 生成 JS 动画代码 */
function generateJsCode(state: AnimationState): string {
  const { text, effect, params } = state

  switch (effect) {
    case 'wave':
      return `// GSAP 波浪动画
import gsap from 'gsap'

const container = document.querySelector('.wave-text')
const sourceText = '${text}'
// 拆分字符为独立 span，每个字符单独控制
const chars = Array.from(sourceText).map((char) => {
  const span = document.createElement('span')
  span.textContent = char
  span.style.display = 'inline-block'
  container.appendChild(span)
  return span
})

gsap.to(chars, {
  y: ${params.waveAmplitude ?? 10},
  duration: ${params.waveSpeed ?? 1.5},
  ease: 'sine.inOut',
  yoyo: true,
  repeat: -1,
  stagger: { each: ${(params.waveFrequency ?? 2) * 0.1}, repeat: -1, yoyo: true },
})`

    case 'typewriter':
      return `// 打字机效果
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
      return `// 聚光灯效果 — 配合 CSS 使用
const textEl = document.querySelector('.spotlight-text')
document.addEventListener('mousemove', (e) => {
  textEl.style.setProperty('--spot-x', e.clientX + 'px')
  textEl.style.setProperty('--spot-y', e.clientY + 'px')
})

/* 对应的 CSS：
.spotlight-text {
  background-image: radial-gradient(
    circle ${params.spotlightSize ?? 150}px at var(--spot-x, 50%) var(--spot-y, 50%),
    ${params.spotlightColor ?? '#ffffff'} 0%,
    #f0c060 30%,
    transparent 70%
  );
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
} */`

    case 'bounce':
      return `// GSAP 弹跳动画
import gsap from 'gsap'

const container = document.querySelector('.bounce-text')
const sourceText = '${text}'
const chars = Array.from(sourceText).map((char) => {
  const span = document.createElement('span')
  span.textContent = char
  span.style.display = 'inline-block'
  container.appendChild(span)
  return span
})

gsap.to(chars, {
  y: ${-Math.abs(params.bounceHeight ?? 20)},  // 向上弹跳
  duration: ${params.bounceSpeed ?? 1},
  ease: 'bounce.out',
  yoyo: true,
  repeat: -1,
  stagger: ${(params.bounceStagger ?? 60) / 1000},  // ms 转 s
})`

    case 'stagger':
      const dirMap: Record<string, string> = { left: '-', right: '+', top: '-', bottom: '+' }
      const axis = (params.staggerDirection ?? 'left') === 'left' || (params.staggerDirection ?? 'left') === 'right' ? 'x' : 'y'
      const sign = dirMap[params.staggerDirection ?? 'left'] ?? '-'
      const dist = params.staggerDistance ?? 50
      return `// GSAP 交错飞入动画
import gsap from 'gsap'

const container = document.querySelector('.stagger-text')
const sourceText = '${text}'
const chars = Array.from(sourceText).map((char) => {
  const span = document.createElement('span')
  span.textContent = char
  span.style.display = 'inline-block'
  container.appendChild(span)
  return span
})

const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 })
tl.set(chars, { opacity: 0, ${axis}: ${sign}${dist} })
tl.to(chars, {
  opacity: 1,
  ${axis}: 0,
  duration: 0.4,
  ease: 'back.out(1.7)',
  stagger: ${(params.staggerDelay ?? 80) / 1000},
})`

    case 'blast':
      return `// GSAP 爆破动画
import gsap from 'gsap'

const container = document.querySelector('.blast-text')
const sourceText = '${text}'
const chars = Array.from(sourceText).map((char) => {
  const span = document.createElement('span')
  span.textContent = char
  span.style.display = 'inline-block'
  container.appendChild(span)
  return span
})

const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 })
tl.set(chars, { opacity: 1, x: 0, y: 0 })
chars.forEach((span) => {
  const angle = Math.random() * Math.PI * 2
  const dist = ${params.blastDistance ?? 150} * (0.5 + Math.random() * 0.5)
  tl.to(span, {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist,
    rotation: (Math.random() - 0.5) * 720,
    opacity: 0,
    duration: ${params.blastSpeed ?? 1},
    ease: 'power3.out',
  }, 0)
})
tl.to(chars, {
  x: 0, y: 0, rotation: 0, opacity: 1,
  duration: ${(params.blastSpeed ?? 1) * 1.2},
  ease: 'back.out(1.5)',
})`

    case 'float':
      return `// GSAP 漂浮动画
import gsap from 'gsap'

const el = document.querySelector('.float-text')
const tl = gsap.timeline({ repeat: -1, yoyo: true })
tl.to(el, { y: ${-Math.abs(params.floatHeight ?? 20)}, duration: ${params.floatSpeed ?? 2}, ease: 'sine.inOut' }, 0)
tl.to(el, { x: ${Math.round((params.floatHeight ?? 20) * 0.3)}, duration: ${(params.floatSpeed ?? 2) * 1.3}, ease: 'sine.inOut' }, 0)
tl.to(el, { rotation: ${Math.round((params.floatHeight ?? 20) * 0.1)}, duration: ${(params.floatSpeed ?? 2) * 1.7}, ease: 'sine.inOut' }, 0)`

    default:
      return '/* 暂不支持 */'
  }
}

/* ============================================
   CSS 动效生成函数
   ============================================ */

function generateGlitchCss(text: string, intensity: number, speed: number): string {
  const offset = Math.round(intensity * 0.4)
  const duration = Math.max(0.3, 2 / speed).toFixed(2)

  return `/* Glitch 故障效果 — 纯 CSS */
.glitch-text {
  position: relative; display: inline-block;
  color: #fff; font-size: 3rem; font-weight: bold;
  text-shadow: 2px 2px 0 rgba(255,0,0,0.6), -2px -2px 0 rgba(0,255,255,0.6);
  animation: glitch-skew ${duration}s infinite linear alternate-reverse;
}
.glitch-text::before, .glitch-text::after {
  content: '${text}'; position: absolute; top: 0; left: 0;
  width: 100%; height: 100%;
}
.glitch-text::before {
  left: ${-offset}px; color: #f00;
  animation: glitch-before ${duration}s infinite linear alternate-reverse;
  clip-path: inset(0 0 50% 0);
}
.glitch-text::after {
  left: ${offset}px; color: #0ff;
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
}`
}

function generateNeonCss(color: string, glow: number, flicker: boolean): string {
  const layers = 5
  const parts: string[] = []
  for (let i = 1; i <= layers; i++) {
    const blur = i * glow * 1.2
    const a = Math.max(0, 1 - i * 0.18)
    parts.push(`0 0 ${blur.toFixed(1)}px ${color}${decimalToHex(a)}`)
  }

  return `/* Neon 霓虹效果 — 纯 CSS */
.neon-text {
  color: #fff; font-size: 3rem; font-weight: bold;
  text-shadow: ${parts.join(', ')};
  ${flicker ? 'animation: neon-flicker 1.5s infinite alternate;' : ''}
}
${flicker ? `@keyframes neon-flicker {
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { text-shadow: ${parts.join(', ')}; }
  20%, 24%, 55% { text-shadow: none; }
}` : ''}`
}

function generateGradientCss(color1: string, color2: string, speed: number, angle: number): string {
  return `/* 流动渐变 — 纯 CSS */
.gradient-text {
  font-size: 3rem; font-weight: bold;
  background-image: linear-gradient(${angle}deg, ${color1}, ${color2}, ${color1});
  background-size: 200% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  animation: gradient-flow ${speed}s linear infinite;
}
@keyframes gradient-flow {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}`
}

function generateFlickerCss(intensity: number, color: string): string {
  const minOpacity = Math.max(0.3, 1 - intensity * 0.07).toFixed(2)
  const glowLayers = [
    `0 0 ${4 + intensity * 2}px ${color}`,
    `0 0 ${8 + intensity * 3}px ${color}`,
    `0 0 ${12 + intensity * 4}px ${color}99`,
    `0 0 ${20 + intensity * 5}px ${color}66`,
    `0 0 ${30 + intensity * 6}px ${color}33`,
  ].join(', ')

  return `/* 烛光闪烁 — 纯 CSS */
.flicker-text {
  font-size: 3rem; font-weight: bold; color: #ffe8c0;
  text-shadow: ${glowLayers};
  animation: flicker-flame 0.15s infinite alternate;
}
@keyframes flicker-flame {
  0%   { opacity: 1; transform: scale(1); }
  15%  { opacity: ${minOpacity}; transform: scale(0.98); }
  30%  { opacity: 0.95; transform: scale(1.01); }
  45%  { opacity: ${Math.min(0.95, parseFloat(minOpacity) + 0.05).toFixed(2)}; transform: scale(0.97); }
  60%  { opacity: 1; transform: scale(1.02); }
  75%  { opacity: ${minOpacity}; transform: scale(0.99); }
  90%  { opacity: 0.9; transform: scale(1); }
  100% { opacity: 1; transform: scale(1.01); }
}`
}

function generateFlipCss(angle: number, speed: number, axis: 'X' | 'Y'): string {
  const name = `flip-${axis}`
  return `/* 3D 翻转 — 纯 CSS */
.flip-text span {
  display: inline-block;
  animation: ${name} ${speed}s ease-in-out infinite;
}
/* 每个字符的 animation-delay 由 JS 动态设置 */
@keyframes ${name} {
  0%   { transform: perspective(400px) rotate${axis}(0deg); }
  50%  { transform: perspective(400px) rotate${axis}(${angle}deg); }
  100% { transform: perspective(400px) rotate${axis}(0deg); }
}`
}

function generateLiquidCss(intensity: number, speed: number, scale: number): string {
  const baseFreq = (scale / 10000).toFixed(4)
  const altFreq = (scale / 5000).toFixed(4)
  const dur = Math.max(0.5, 6 / speed).toFixed(1)

  return `/* 液体扭曲 — SVG 滤镜 + CSS */
.liquid-text {
  font-size: 3rem; font-weight: bold; color: #4dc9f6;
  filter: url(#liquid-filter);
}

<!-- 在 HTML 中添加隐藏的 SVG 滤镜 -->
<svg width="0" height="0" style="position:absolute">
  <filter id="liquid-filter">
    <feTurbulence type="fractalNoise" baseFrequency="${baseFreq}" numOctaves="3" result="noise">
      <animate attributeName="baseFrequency"
        values="${baseFreq} ${baseFreq};${altFreq} ${altFreq};${baseFreq} ${baseFreq}"
        dur="${dur}s" repeatCount="indefinite"/>
    </feTurbulence>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="${intensity}"
      xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</svg>`
}

function generateHologramCss(color: string, angle: number, distance: number): string {
  const rad = (angle * Math.PI) / 180
  const dx = Math.round(Math.cos(rad) * distance)
  const dy = Math.round(Math.sin(rad) * distance)

  return `/* 全息投影 — 纯 CSS 多层叠影 + 渐变扫光 */
.hologram-container {
  position: relative; display: inline-block;
  font-size: 3rem; font-weight: bold;
}
/* 叠影层 */
.hologram-layer { position: absolute; top: 0; left: 0; }
.hologram-container .l1 { color: ${color}; opacity: 0.4; transform: translate(${dx}px, ${dy}px); }
.hologram-container .l2 { color: ${color}; opacity: 0.25; transform: translate(${-Math.round(dx*0.7)}px, ${-Math.round(dy*0.7)}px); }
/* 主体扫光层 */
.hologram-main {
  position: relative;
  background: linear-gradient(${angle}deg, ${color}, #fff, ${color});
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 10px ${color}80, 0 0 20px ${color}40;
  animation: holo-sweep 2s linear infinite;
}
@keyframes holo-sweep {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}`
}

function generateChromaticCss(offset: number, angle: number): string {
  const rad = (angle * Math.PI) / 180
  const dx = Math.round(Math.cos(rad) * offset)
  const dy = Math.round(Math.sin(rad) * offset)

  return `/* 色差效果 — 纯 CSS RGB 通道分离 */
.chromatic-container {
  position: relative; display: inline-block;
  font-size: 3rem; font-weight: bold;
}
.chromatic-r { color: #ff4444; transform: translate(${dx}px, ${dy}px); }
.chromatic-g { color: #44ff44; }
.chromatic-b { color: #4488ff; transform: translate(${-dx}px, ${-dy}px); }
/* 三通道使用 mix-blend-mode: screen 混合 */
.chromatic-r, .chromatic-g, .chromatic-b {
  position: absolute; top: 0; left: 0; white-space: nowrap;
  mix-blend-mode: screen;
}`
}

function generateCubeCss(size: number, speed: number, perspective: number): string {
  const half = Math.round(size / 2)

  return `/* 3D 立方体 — 纯 CSS 3D */
.cube-scene {
  width: ${size}px; height: ${size}px;
  perspective: ${perspective}px;
}
.cube-rotator {
  width: 100%; height: 100%; position: relative;
  transform-style: preserve-3d;
  animation: cube-spin ${speed}s linear infinite;
}
.cube-front {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: #1a1a2e; border: 2px solid #b8a0d4;
  transform: translateZ(${half}px);
  font-weight: bold; color: #f0c060;
}
@keyframes cube-spin {
  0%   { transform: rotateX(-10deg) rotateY(0deg); }
  100% { transform: rotateX(-10deg) rotateY(360deg); }
}`
}

function generateScanlineCss(density: number, speed: number, color: string): string {
  const stripeH = Math.max(1, Math.round(22 - density))

  return `/* CRT 扫描线 — 纯 CSS */
.scanline-text {
  font-size: 3rem; font-weight: bold;
  position: relative; display: inline-block;
}
/* 底层：荧光辉光 */
.scanline-glow {
  color: #e8ffe8;
  text-shadow:
    0 0 2px ${color},
    0 0 5px ${color},
    0 0 10px ${color},
    0 0 20px ${color}aa,
    0 0 35px ${color}66,
    2px 0 2px ${color}44,
    -1px 0 2px ${color}44;
}
/* 扫描线遮罩层 */
.scanline-overlay {
  position: absolute; inset: 0;
  color: transparent;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent ${Math.max(1, stripeH - 2)}px,
    ${color}55 ${stripeH - 1}px,
    ${color}88 ${stripeH}px
  );
  -webkit-background-clip: text;
  background-clip: text;
  animation: scan-move ${speed}s linear infinite;
}
@keyframes scan-move {
  0%   { background-position: 0 0; }
  100% { background-position: 0 ${stripeH * 2}px; }
}`
}

function generateMetalCss(color: string, angle: number, shine: number): string {
  return `/* 金属质感 — 纯 CSS */
.metal-text {
  font-size: 3rem; font-weight: bold;
  background: linear-gradient(${angle}deg,
    ${color}88, ${color}, ${color}66, ${color}, ${color}88);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: ${1 + shine * 0.8}px ${1 + shine * 0.8}px ${shine * 2}px rgba(255,255,255,0.15);
  filter: drop-shadow(0 ${shine}px ${shine}px rgba(0,0,0,0.5));
}`
}

function generateGlassCss(blur: number, opacity: number, tint: string): string {
  return `/* 毛玻璃 — 纯 CSS */
.glass-text {
  font-size: 3rem; font-weight: bold;
  color: ${tint};
  opacity: ${opacity.toFixed(1)};
  text-shadow:
    0 0 ${blur}px rgba(255,255,255,0.4),
    0 0 ${blur * 2}px ${tint}44,
    1px 1px ${blur * 0.5}px rgba(255,255,255,0.3),
    0 2px ${blur}px rgba(255,255,255,0.2);
  filter: blur(${blur * 0.1}px);
}`
}

function generateFireCss(intensity: number, speed: number): string {
  const dur = Math.max(0.3, 2 / speed).toFixed(2)
  return `/* 火焰效果 — 纯 CSS */
.fire-text {
  font-size: 3rem; font-weight: bold; color: #fff;
  text-shadow:
    0 0 ${4 + intensity}px #fff,
    0 0 ${7 + intensity * 2}px #ff0,
    0 0 ${12 + intensity * 3}px #f80,
    0 0 ${18 + intensity * 4}px #f40,
    0 ${Math.round(intensity * 1.5)}px ${20 + intensity * 5}px #c008;
  animation: fire-flicker ${dur}s infinite alternate;
}
@keyframes fire-flicker {
  0%   { text-shadow: ...; transform: scale(1, 1); }
  25%  { transform: scale(1.02, 0.98); }
  50%  { transform: scale(0.99, 1.01); }
  75%  { transform: scale(1.01, 0.99); }
  100% { text-shadow: ...; transform: scale(1, 1); }
}`
}

function generateIceCss(sparkle: number, color: string, speed: number): string {
  const dur = Math.max(1, 5 / speed).toFixed(2)
  return `/* 冰霜效果 — 纯 CSS */
.ice-text {
  font-size: 3rem; font-weight: bold; color: #e8f4ff;
  text-shadow:
    0 0 ${2 + sparkle}px #fff,
    0 0 ${4 + sparkle * 2}px ${color},
    0 0 ${8 + sparkle * 3}px ${color}cc,
    0 0 ${14 + sparkle * 4}px ${color}88;
  animation: ice-shine ${dur}s ease-in-out infinite;
}
@keyframes ice-shine {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}`
}

function generateInkCss(spread: number, color: string, speed: number): string {
  const dur = Math.max(1, 5 / speed).toFixed(2)
  return `/* 墨迹效果 — SVG 滤镜 + CSS */
.ink-text {
  font-size: 3rem; font-weight: bold; color: ${color};
  filter: url(#ink-filter);
  animation: ink-bleed ${dur}s ease-out infinite alternate;
}

<!-- HTML 中添加 SVG 滤镜 -->
<svg width="0" height="0" style="position:absolute">
  <filter id="ink-filter">
    <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="${spread}" xChannelSelector="R" yChannelSelector="G"/>
    <feGaussianBlur stdDeviation="${spread * 0.3}"/>
  </filter>
</svg>
@keyframes ink-bleed {
  0% { filter: url(#ink-filter) blur(${spread}px); opacity: 0.3; }
  100% { filter: url(#ink-filter) blur(0px); opacity: 1; }
}`
}

function generateShakeCss(intensity: number, speed: number): string {
  const dur = Math.max(0.2, 1.5 / speed).toFixed(2)
  // 生成简化版的震动关键帧
  const frames: string[] = []
  for (let i = 0; i <= 10; i++) {
    const pct = i * 10
    const x = (Math.sin(i * 1.3) * intensity * 1.2).toFixed(1)
    const y = (Math.cos(i * 1.7) * intensity * 0.9).toFixed(1)
    frames.push(`  ${pct}% { transform: translate(${x}px, ${y}px); }`)
  }
  return `/* 震动效果 — 纯 CSS */
.shake-text {
  font-size: 3rem; font-weight: bold; color: #fff;
  animation: shake ${dur}s infinite;
}
@keyframes shake {
${frames.join('\n')}
}`
}

function generatePulseCss(scale: number, speed: number): string {
  return `/* 脉冲效果 — 纯 CSS */
.pulse-text {
  font-size: 3rem; font-weight: bold; color: #ff6b6b;
  text-shadow: 0 0 10px rgba(255,107,107,0.4);
  animation: pulse ${speed}s ease-in-out infinite;
}
@keyframes pulse {
  0%   { transform: scale(1); }
  8%   { transform: scale(${scale}); }
  16%  { transform: scale(1); }
  24%  { transform: scale(${scale * 0.7}); }
  32%  { transform: scale(1); }
  40%  { transform: scale(${scale * 0.85}); }
  48%  { transform: scale(1); }
  100% { transform: scale(1); }
}`
}

function generateSkewCss(angle: number, speed: number): string {
  return `/* 倾斜效果 — 纯 CSS */
.skew-text {
  font-size: 3rem; font-weight: bold; color: #f0c060;
  animation: skew ${speed}s ease-in-out infinite;
}
@keyframes skew {
  0%   { transform: skewX(0deg); }
  25%  { transform: skewX(${angle}deg); }
  50%  { transform: skewX(0deg); }
  75%  { transform: skewX(${-angle}deg); }
  100% { transform: skewX(0deg); }
}`
}

function generateRollCss(distance: number, speed: number, direction: 'left' | 'right'): string {
  const sign = direction === 'left' ? -1 : 1
  const rotations = Math.round((distance / 50) * 360)
  return `/* 滚动效果 — 纯 CSS */
.roll-text {
  font-size: 3rem; font-weight: bold; color: #f0c060;
  white-space: nowrap;
  animation: roll ${speed}s ease-out infinite;
}
@keyframes roll {
  0%   { transform: translateX(${sign * distance}px) rotate(${sign * rotations}deg); opacity: 0; }
  60%  { opacity: 1; }
  100% { transform: translateX(0) rotate(0deg); opacity: 1; }
}`
}

function generateRaveCss(speed: number, color1: string, color2: string): string {
  return `/* 激光雨 — 纯 CSS */
.rave-text { position: relative; display: inline-block; overflow: hidden; }
/* 多道激光束，交替颜色和延迟 */
.rave-beam-1 {
  position: absolute; height: 300%; left: 20%; width: 2px;
  background: linear-gradient(180deg, transparent, ${color1}, transparent);
  animation: rave-beam ${speed}s linear infinite; animation-delay: 0s;
}
.rave-beam-2 {
  position: absolute; height: 300%; left: 50%; width: 1.5px;
  background: linear-gradient(180deg, transparent, ${color2}, transparent);
  animation: rave-beam ${speed}s linear infinite; animation-delay: 0.3s;
}
.rave-beam-3 {
  position: absolute; height: 300%; left: 75%; width: 2.5px;
  background: linear-gradient(180deg, transparent, ${color1}, transparent);
  animation: rave-beam ${speed}s linear infinite; animation-delay: 0.6s;
}
@keyframes rave-beam {
  0%   { transform: translateY(-100%); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateY(400%); opacity: 0; }
}`
}

function generatePhosphorCss(trail: number, speed: number): string {
  const dur = Math.max(0.5, 3 / speed).toFixed(2)
  const shadows: string[] = []
  for (let i = 1; i <= trail; i++) {
    shadows.push(`${i * 3}px 0 ${i * 2}px rgba(255,${Math.round(180-180*i/(trail+1))},255,${(1-i/(trail+1)).toFixed(2)})`)
  }
  return `/* 磷光拖尾 — 纯 CSS */
.phosphor-text {
  font-size: 3rem; font-weight: bold; color: #fff;
  text-shadow: ${shadows.join(', ')};
  animation: phosphor-move ${dur}s ease-in-out infinite;
}
@keyframes phosphor-move {
  0%, 100% { transform: translateX(-30px); }
  50% { transform: translateX(30px); }
}`
}

function generatePrismCss(intensity: number, angle: number): string {
  const spectrum = ['#ff0000','#ff4400','#ff8800','#ffcc00','#88ff00','#00ff44','#00ffcc','#0088ff','#4400ff','#8800ff']
  const rad = (angle * Math.PI) / 180
  const shadows = spectrum.map((c, i) => {
    const off = (i - spectrum.length / 2) * intensity * 0.5
    return `${(Math.cos(rad)*off).toFixed(1)}px ${(Math.sin(rad)*off).toFixed(1)}px ${intensity*0.5}px ${c}`
  }).join(', ')
  return `/* 棱镜色散 — 纯 CSS */
.prism-text {
  font-size: 3rem; font-weight: bold; color: #fff;
  text-shadow: ${shadows};
}`
}

function generateAuroraCss(speed: number, width: number): string {
  const bw = width * 30
  return `/* 极光效果 — 纯 CSS */
.aurora-text {
  font-size: 3rem; font-weight: bold;
  background: linear-gradient(90deg, #00ff88, #00e5ff, #4488ff, #aa44ff, #00ff88);
  background-size: ${bw * 2}px 100%;
  -webkit-background-clip: text; background-clip: text;
  color: transparent; filter: brightness(1.2);
  text-shadow: 0 0 20px rgba(0,255,136,0.3);
  animation: aurora-flow ${speed}s linear infinite;
}
@keyframes aurora-flow {
  0%   { background-position: 0% 50%; }
  100% { background-position: ${bw * 2}px 50%; }
}`
}

function generateWarpCss(intensity: number, _radius: number): string {
  return `/* 扭曲效果 — SVG 滤镜 */
.warp-text {
  font-size: 3rem; font-weight: bold; color: #fff;
  filter: url(#warp-filter);
}

<svg width="0" height="0" style="position:absolute">
  <filter id="warp-filter" x="-50%" y="-50%" width="200%" height="200%">
    <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="${intensity * 3}" xChannelSelector="R" yChannelSelector="G" result="warped"/>
    <feDisplacementMap in="warped" in2="noise" scale="${intensity * 1.5}" xChannelSelector="G" yChannelSelector="B"/>
  </filter>
</svg>`
}

function generateGlowpulseCss(size: number, speed: number, color: string): string {
  const layers = 3
  const parts: string[] = []
  for (let i = 0; i < layers; i++) {
    const r = size * (0.4 + i * 0.3)
    const a = (1 - i * 0.25).toFixed(2)
    const h = Math.round(parseFloat(a) * 255).toString(16).padStart(2, '0')
    parts.push(`0 0 ${r.toFixed(0)}px ${color}${h}`)
  }
  const shadows = parts.join(', ')
  return `/* 光晕脉冲 — 纯 CSS */
.glowpulse-text {
  font-size: 3rem; font-weight: bold; color: #fff;
  text-shadow: ${shadows};
  animation: glowpulse ${speed}s ease-in-out infinite;
}
@keyframes glowpulse {
  0%, 100% { transform: scale(1); text-shadow: ${shadows}; }
  15%  { transform: scale(1.03); text-shadow: ${parts.map((_, i) => {
    const r = size * (0.4 + i * 0.3) * 1.5
    const a = (1 - i * 0.25).toFixed(2)
    const h = Math.round(parseFloat(a) * 255).toString(16).padStart(2, '0')
    return `0 0 ${r.toFixed(0)}px ${color}${h}`
  }).join(', ')}; }
  30%  { transform: scale(1); text-shadow: ${shadows}; }
  45%  { transform: scale(1.02); text-shadow: ${parts.map((_, i) => {
    const r = size * (0.4 + i * 0.3) * 1.3
    const a = (1 - i * 0.25).toFixed(2)
    const h = Math.round(parseFloat(a) * 255).toString(16).padStart(2, '0')
    return `0 0 ${r.toFixed(0)}px ${color}${h}`
  }).join(', ')}; }
  60%  { transform: scale(1); text-shadow: ${shadows}; }
}`
}

function generateTwistCss(angle: number, speed: number): string {
  const dur = Math.max(0.5, 3 / speed).toFixed(2)
  return `/* 扭转效果 — 纯 CSS 3D */
.twist-char {
  display: inline-block;
  animation: twist ${dur}s ease-in-out infinite;
}
@keyframes twist {
  0%, 100% { transform: rotateY(0deg); }
  50% { transform: rotateY(${angle}deg); }
}`
}

function generateSparkleCss(count: number, speed: number): string {
  const dur = Math.max(0.5, 3 / speed).toFixed(2)
  // 生成随机分布的星点 HTML
  const dots: string[] = []
  for (let i = 0; i < count; i++) {
    const x = (i * 37 + 13) % 90 + 5
    const y = (i * 53 + 7) % 80 + 5
    const sz = (i % 3) + 2
    const delay = ((i * 0.43) % 2).toFixed(2)
    dots.push(`  <span class="sparkle-dot" style="left:${x}%;top:${y}%;width:${sz}px;height:${sz}px;animation-delay:${delay}s"></span>`)
  }
  return `/* 星光效果 — 纯 CSS + HTML */
.sparkle-text { position: relative; display: inline-block; }
.sparkle-dot {
  position: absolute; border-radius: 50%; background: #fff;
  box-shadow: 0 0 4px #fff, 0 0 8px #ffe8a0;
  animation: sparkle-twinkle ${dur}s ease-in-out infinite alternate;
}
@keyframes sparkle-twinkle {
  0%, 30% { opacity: 0; transform: scale(0.3); }
  50% { opacity: 1; transform: scale(1.2); }
  70%, 100% { opacity: 0; transform: scale(0.3); }
}

<!-- 在 .sparkle-text 内放置 ${count} 个星点元素 -->
${dots.join('\n')}`
}

function generateDripCss(count: number, length: number, speed: number): string {
  const dur = Math.max(0.3, 2 / speed).toFixed(2)
  // 生成多个墨滴位置
  const drips = Array.from({ length: count }, (_, i) =>
    `  <span class="drip-drop" style="left:${((i * 37 + 15) % 80) + 10}%;animation-delay:${((i * 0.7) % 3).toFixed(1)}s"></span>`
  ).join('\n')
  return `/* 滴落效果 — CSS + HTML */
.drip-text { position: relative; display: inline-block; }
.drip-drop {
  position: absolute; top: 100%; width: 4px; height: ${length}px;
  background: linear-gradient(180deg, #334, transparent);
  border-radius: 0 0 50% 50%;
  animation: drip-fall ${dur}s ease-in infinite;
  transform-origin: top center;
}
@keyframes drip-fall {
  0%   { transform: scaleY(0); opacity: 0; }
  15%  { transform: scaleY(1); opacity: 0.7; }
  40%  { transform: translateY(${length}px) scaleY(0.3); opacity: 0.5; }
  100% { transform: translateY(${length + 40}px) scaleY(0); opacity: 0; }
}
<!-- 在 .drip-text 内放置 ${count} 个墨滴元素，不同位置和延迟 -->
${drips}`
}

function generateCanvasJs(state: AnimationState): string {
  const { effect } = state
  const names: Record<string, string> = { particles: '粒子场', matrixrain: '代码雨', noise: '噪点' }
  return `// ${names[effect] ?? effect} — Canvas 实现
// 核心：requestAnimationFrame + Canvas 2D 绘制
// 此类效果依赖 Canvas API，建议在 React 中使用 useEffect 管理动画循环`
}

function generateInteractionJs(state: AnimationState): string {
  const { effect, params } = state
  switch (effect) {
    case 'magnet':
      return `// 磁吸按钮 — CSS + JS
const btn = document.querySelector('.magnet-btn')
const strength = ${params.magnetStrength ?? 5}
const mode = '${params.magnetMode ?? 'attract'}'
const sign = mode === 'attract' ? 1 : -1
btn.addEventListener('mousemove', (e) => {
  const rect = btn.getBoundingClientRect()
  const dx = (e.clientX - rect.left - rect.width/2) * sign * strength * 0.5
  const dy = (e.clientY - rect.top - rect.height/2) * sign * strength * 0.5
  btn.style.transform = \`translate(\${dx}px, \${dy}px)\`
})
btn.addEventListener('mouseleave', () => { btn.style.transform = 'translate(0,0)' })`
    case 'parallaxtilt':
      return `// 倾斜视差 — CSS 3D + JS
const card = document.querySelector('.tilt-card')
const angle = ${params.tiltAngle ?? 20}
card.addEventListener('mousemove', (e) => {
  const rect = card.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width - 0.5) * angle * 2
  const y = ((e.clientY - rect.top) / rect.height - 0.5) * -angle * 2
  card.style.transform = \`perspective(${params.tiltPerspective ?? 600}px) rotateX(\${y}deg) rotateY(\${x}deg)\`
})
card.addEventListener('mouseleave', () => { card.style.transform = 'none' })`
    case 'morphing':
      return `// 几何变形加载 — CSS opacity 叠化
// 三个图形分别绘制，通过 @keyframes 控制各图形 opacity 交叉淡入淡出
const dur = ${Math.max(0.6, (params.morphSpeed ?? 1) * 1.5).toFixed(2)}s
const paths = {
  circle: 'M 100 20 A 40 40 0 1 1 99.9 20 Z',
  square: 'M 65 25 L 135 25 L 135 95 L 65 95 Z',
  triangle: 'M 100 15 L 145 95 L 55 95 Z',
}

/* CSS 关键帧：
@keyframes morph-0 {
  0%, 0%   { opacity: 0; transform: scale(0.7); }
  16%      { opacity: 1; transform: scale(1); }
  33%,100% { opacity: 0; transform: scale(0.7); }
}
@keyframes morph-1 { ... 33%→66% ... }
@keyframes morph-2 { ... 66%→100% ... }
*/
// <path d="\${paths.circle}" style="animation: morph-0 \${dur}s infinite" />
// <path d="\${paths.square}" style="animation: morph-1 \${dur}s infinite" />
// <path d="\${paths.triangle}" style="animation: morph-2 \${dur}s infinite" />`
    case 'pagetransition':
      return `// 页面过渡 — CSS + JS
const container = document.querySelector('.transition-container')
const overlay = document.querySelector('.transition-overlay')
container.addEventListener('click', () => {
  overlay.style.transform = 'none'  // 遮罩滑入
  setTimeout(() => {
    // 切换内容...
    overlay.style.transform = '${params.transitionDir === 'left' ? 'translateX(100%)' : params.transitionDir === 'right' ? 'translateX(-100%)' : params.transitionDir === 'up' ? 'translateY(100%)' : params.transitionDir === 'down' ? 'translateY(-100%)' : 'scaleX(0)'}'
  }, ${(params.transitionSpeed ?? 1) * 600})
})
/* CSS: .transition-overlay { transition: transform ${params.transitionSpeed ?? 1}s ease-in-out; } */`
    default: return '/* 暂不支持 */'
  }
}

function generateOrbCss(_count: number, speed: number, blur: number): string {
  return `/* 渐变光球 — 纯 CSS */
.orb { position: absolute; border-radius: 50%; filter: blur(${blur}px); opacity: 0.5;
  animation: orb-float ${Math.max(2, 8/speed).toFixed(1)}s ease-in-out infinite alternate; }
@keyframes orb-float {
  0%,100% { transform: translate(0,0) scale(1); }
  25% { transform: translate(30px,-20px) scale(1.15); }
  50% { transform: translate(-10px,25px) scale(0.95); }
  75% { transform: translate(-25px,-10px) scale(1.1); }
}`
}

function generateSkelCss(speed: number, color: string): string {
  return `/* 骨架波浪 — 纯 CSS */
.skel-line {
  background: linear-gradient(90deg, #1a1a2e 0%, ${color}44 50%, #1a1a2e 100%);
  background-size: 200% 100%; border-radius: 4px;
  animation: skel-wave ${Math.max(1, 5/speed).toFixed(1)}s linear infinite;
}
@keyframes skel-wave { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`
}

/** 0~1 转两位 hex */
function decimalToHex(d: number): string {
  const hex = Math.round(Math.max(0, Math.min(1, d)) * 255).toString(16)
  return hex.length === 1 ? '0' + hex : hex
}
