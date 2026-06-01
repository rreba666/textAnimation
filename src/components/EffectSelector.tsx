import { useState, useEffect } from 'react'
import type { EffectType, EffectMeta, EffectCategory } from '../types'
import { canSelectEffect } from '../data/conflicts'

interface Props {
  selected: EffectType[]
  onToggle: (effect: EffectType) => void
}

const ALL: EffectMeta[] = [
  // ===== 文字动效 =====
  { key: 'glitch', name: 'Glitch 故障', description: '信号干扰抖动错位', category: 'text', iconChar: 'g' },
  { key: 'wave', name: 'Wave 波浪', description: '逐字起伏弹性波浪', category: 'text', iconChar: 'w' },
  { key: 'neon', name: 'Neon 霓虹', description: '多层辉光灯管效果', category: 'text', iconChar: 'n' },
  { key: 'typewriter', name: 'Typewriter 打字机', description: '逐字敲入复古感', category: 'text', iconChar: 't' },
  { key: 'spotlight', name: 'Spotlight 聚光灯', description: '鼠标跟随光斑探照', category: 'text', iconChar: 's' },
  { key: 'bounce', name: 'Bounce 弹跳', description: '字符上下弹跳物理感', category: 'text', iconChar: 'b' },
  { key: 'gradient', name: 'Gradient 流动渐变', description: '渐变色彩文字中流动', category: 'text', iconChar: 'd' },
  { key: 'flicker', name: 'Flicker 烛光', description: '烛火不规则闪烁', category: 'text', iconChar: 'f' },
  { key: 'stagger', name: 'Stagger 交错', description: '字符逐一飞入', category: 'text', iconChar: 'r' },
  { key: 'flip', name: 'Flip 3D翻转', description: '三维空间逐字翻转', category: 'text', iconChar: 'p' },
  { key: 'liquid', name: 'Liquid 液体', description: 'SVG滤镜有机扭曲', category: 'text', iconChar: 'l' },
  { key: 'hologram', name: 'Hologram 全息', description: '多层叠影全息投影', category: 'text', iconChar: 'h' },
  { key: 'chromatic', name: 'Chromatic 色差', description: 'RGB通道镜头色散', category: 'text', iconChar: 'c' },
  { key: 'cube', name: 'Cube 立方体', description: 'CSS 3D旋转立方体', category: 'text', iconChar: '3' },
  { key: 'scanline', name: 'Scanline 扫描线', description: 'CRT显示器扫描线', category: 'text', iconChar: 'n' },
  { key: 'metal', name: 'Metal 金属', description: '拉丝金属光泽质感', category: 'text', iconChar: 'm' },
  { key: 'glass', name: 'Glass 毛玻璃', description: '磨砂半透明玻璃', category: 'text', iconChar: 'g' },
  { key: 'fire', name: 'Fire 火焰', description: '燃烧跃动的火焰', category: 'text', iconChar: 'f' },
  { key: 'ice', name: 'Ice 冰霜', description: '冷蓝冰晶闪烁', category: 'text', iconChar: 'i' },
  { key: 'ink', name: 'Ink 墨迹', description: '毛笔书写墨迹扩散', category: 'text', iconChar: 'k' },
  { key: 'shake', name: 'Shake 震动', description: '随机抖动地震感', category: 'text', iconChar: 's' },
  { key: 'pulse', name: 'Pulse 脉冲', description: '心跳般缩放律动', category: 'text', iconChar: 'u' },
  { key: 'skew', name: 'Skew 倾斜', description: '左右摇摆倾斜变形', category: 'text', iconChar: 'e' },
  { key: 'roll', name: 'Roll 滚动', description: '像轮子旋转滚入', category: 'text', iconChar: 'r' },
  { key: 'blast', name: 'Blast 爆破', description: '炸开碎片四散飞出', category: 'text', iconChar: 'x' },
  { key: 'rave', name: 'Rave 激光雨', description: '彩色激光束扫过', category: 'text', iconChar: 'l' },
  { key: 'phosphor', name: 'Phosphor 磷光', description: '移动留下彩色拖尾', category: 'text', iconChar: 'p' },
  { key: 'prism', name: 'Prism 棱镜', description: '彩虹色散光谱折射', category: 'text', iconChar: 'p' },
  { key: 'aurora', name: 'Aurora 极光', description: '青绿蓝紫流淌', category: 'text', iconChar: 'a' },
  { key: 'warp', name: 'Warp 扭曲', description: '黑洞引力拉伸', category: 'text', iconChar: 'w' },
  { key: 'glowpulse', name: 'GlowPulse 光晕脉冲', description: '光晕心跳扩散收缩', category: 'text', iconChar: 'g' },
  { key: 'twist', name: 'Twist 扭转', description: '3D麻花扭转旋转', category: 'text', iconChar: 't' },
  { key: 'sparkle', name: 'Sparkle 星光', description: '表面随机闪烁星光', category: 'text', iconChar: 's' },
  { key: 'float', name: 'Float 漂浮', description: '羽毛般浮动', category: 'text', iconChar: 'f' },
  { key: 'drip', name: 'Drip 滴落', description: '墨水从底边滴落', category: 'text', iconChar: 'd' },
  // ===== 背景特效 =====
  { key: 'particles', name: 'Particle 粒子场', description: '数百粒子飘浮+鼠标交互', category: 'background', iconChar: 'a' },
  { key: 'gradientorb', name: 'GradientOrb 渐变光球', description: '彩色光球缓慢融合', category: 'background', iconChar: 'b' },
  { key: 'matrixrain', name: 'MatrixRain 代码雨', description: '黑客帝国数字雨', category: 'background', iconChar: 'm' },
  { key: 'noise', name: 'Noise 噪点', description: '老电视雪花噪点', category: 'background', iconChar: 'z' },
  // ===== 鼠标交互 =====
  { key: 'magnet', name: 'Magnetic 磁吸', description: '按钮被鼠标吸引/排斥', category: 'interaction', iconChar: 'g' },
  { key: 'parallaxtilt', name: 'ParallaxTilt 视差', description: '元素随鼠标3D倾斜', category: 'interaction', iconChar: 'p' },
  // ===== 加载/转场 =====
  { key: 'morphing', name: 'Morphing 变形加载', description: '几何图形平滑变形', category: 'transition', iconChar: 'o' },
  { key: 'pagetransition', name: 'Transition 页面过渡', description: '页面切换动画转场', category: 'transition', iconChar: 't' },
  { key: 'skeletonwave', name: 'Skeleton 骨架波浪', description: '加载骨架屏波浪光效', category: 'transition', iconChar: 'w' },
  // ===== 3D 空间 =====
  { key: 'floatcube', name: 'FloatCube 漂浮立方体', description: '3D立方体缓慢旋转漂浮', category: '3d', iconChar: 'c' },
  { key: 'depthcards', name: 'DepthCards 深度卡片', description: '多层卡片景深视差', category: '3d', iconChar: 'd' },
  { key: 'spiralgalaxy', name: 'SpiralGalaxy 螺旋星系', description: '粒子螺旋旋转银河', category: '3d', iconChar: 'g' },
  // ===== 光影/反射 =====
  { key: 'glossy', name: 'Glossy 镜面反射', description: '文字水面倒影反射', category: 'light', iconChar: 'r' },
  { key: 'lensflare', name: 'LensFlare 镜头光晕', description: '相机镜头反光效果', category: 'light', iconChar: 'l' },
  { key: 'caustics', name: 'Caustics 焦散', description: '水底光斑游动', category: 'light', iconChar: 'w' },
  // ===== 扭曲/变形 =====
  { key: 'flagwave', name: 'FlagWave 旗帜飘动', description: '旗帜般波浪飘动', category: 'distort', iconChar: 'f' },
  { key: 'melt', name: 'Melt 融化', description: '蜡烛融化滴落效果', category: 'distort', iconChar: 'm' },
  // ===== 创意/趣味 =====
  { key: 'confetti', name: 'Confetti 彩带爆裂', description: '点击彩带星星爆裂', category: 'creative', iconChar: 'x' },
  // ===== 鼠标交互（扩展） =====
  { key: 'ripplebg', name: 'RippleBg 背景水波', description: '点击产生水波扩散', category: 'interaction', iconChar: 'w' },
  { key: 'customcursor', name: 'CustomCursor 自定义光标', description: '自定义带拖尾的光标', category: 'interaction', iconChar: 'c' },
  { key: 'hoverglow', name: 'HoverGlow 悬停光晕', description: '鼠标悬停跟随光晕', category: 'interaction', iconChar: 'g' },
  { key: 'dragrotate', name: 'DragRotate 拖拽旋转', description: '拖拽旋转3D物体', category: 'interaction', iconChar: 'd' },
  // ===== 加载/进度 =====
  { key: 'circularprogress', name: 'Circular 环形进度', description: '环形进度条动画', category: 'transition', iconChar: 'p' },
  // ===== 数字/滚动 =====
  { key: 'countup', name: 'CountUp 数字滚动', description: '数字计数滚动动画', category: 'scroll', iconChar: 'n' },
  { key: 'marquee', name: 'Marquee 跑马灯', description: '文字无限横向滚动', category: 'scroll', iconChar: 'm' },
  // ===== 背景/装饰 =====
  { key: 'animatedborder', name: 'AnimBorder 动态边框', description: '流动渐变边框', category: 'decor', iconChar: 'b' },
  { key: 'blob', name: 'Blob 变形气泡', description: '史莱姆变形融合', category: 'decor', iconChar: 'b' },
]

/** 分类定义：key、标签、SVG 图标、颜色标识 */
const CATEGORIES: { key: EffectCategory; label: string; count: number; color: string }[] = [
  { key: 'text', label: '文字动效', count: 35, color: '#f0c060' },
  { key: 'background', label: '背景特效', count: 4, color: '#4ecdc4' },
  { key: 'interaction', label: '鼠标交互', count: 7, color: '#ff6b6b' },
  { key: 'transition', label: '加载/进度', count: 4, color: '#a55eea' },
  { key: '3d', label: '3D 空间', count: 3, color: '#45b7d1' },
  { key: 'light', label: '光影/反射', count: 3, color: '#ffe66d' },
  { key: 'distort', label: '扭曲/变形', count: 2, color: '#ff9a76' },
  { key: 'creative', label: '创意/趣味', count: 1, color: '#ff88cc' },
  { key: 'scroll', label: '数字/滚动', count: 2, color: '#45b7d1' },
  { key: 'decor', label: '背景/装饰', count: 2, color: '#ffe66d' },
]

export default function EffectSelector({ selected, onToggle }: Props) {
  // 根据最后一个选中效果自动定位分类
  const currentMeta = ALL.find((e) => e.key === selected[selected.length - 1])
  const defaultCat = currentMeta?.category ?? 'text'
  const [activeCat, setActiveCat] = useState<EffectCategory>(defaultCat)

  // 选中效果变化时，自动切换到新效果的分类
  useEffect(() => {
    if (currentMeta) setActiveCat(currentMeta.category)
  }, [selected]) // eslint-disable-line react-hooks/exhaustive-deps

  const items = ALL.filter((e) => e.category === activeCat)

  return (
    <div className="w-full space-y-3">
      {/* 分类标签行 — 美观的胶囊按钮 */}
      <div className="flex flex-wrap gap-1">
        {CATEGORIES.map((cat) => {
          const isActive = activeCat === cat.key
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCat(cat.key)}
              className={`relative px-2.5 py-1 rounded-full text-[11px] font-medium
                transition-all duration-200 border
                ${isActive
                  ? 'border-current text-white shadow-md'
                  : 'bg-transparent border-[#2a2a4a] text-[#666] hover:border-[#555] hover:text-[#999]'
                }`}
              style={isActive ? { backgroundColor: `${cat.color}22`, borderColor: `${cat.color}88`, color: cat.color } : {}}
            >
              {/* 小圆点指示器 */}
              <span className="inline-block w-1.5 h-1.5 rounded-full mr-1 align-[-1px]"
                    style={{ backgroundColor: isActive ? cat.color : '#666' }} />
              {cat.label}
              <span className="ml-0.5 text-[10px] opacity-60">{cat.count}</span>
            </button>
          )
        })}
      </div>

      {/* 效果列表 — 仅显示当前分类 */}
      <div className="flex flex-wrap gap-1 min-h-[32px]">
        {items.map((eff) => {
          const isActive = selected.includes(eff.key)
          const canSelect = canSelectEffect(eff.key, selected)
          return (
            <button
              key={eff.key}
              onClick={() => canSelect && onToggle(eff.key)}
              disabled={!canSelect}
              title={canSelect ? eff.description : `${eff.description}（冲突：同组已选中其他效果）`}
              className={`flex items-center gap-0.5 px-1.5 py-1 rounded text-[11px] font-medium
                transition-all duration-150 leading-tight
                ${isActive
                  ? 'bg-[#b8a0d4] text-white shadow-md shadow-[#b8a0d4]/30 scale-105'
                  : !canSelect
                    ? 'bg-[#1a1a2e] text-[#444] border border-[#2a2a4a] opacity-40 cursor-not-allowed'
                    : 'bg-[#1a1a2e] text-[#777] border border-[#2a2a4a] hover:border-[#b8a0d4] hover:text-[#bbb]'
                }`}
            >
              <EffIcon type={eff.key} />
              {eff.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** 小图标 */
function EffIcon({ type }: { type: EffectType }) {
  const cls = 'w-3 h-3 shrink-0'
  const shapes: Record<string, React.JSX.Element> = {
    glitch: <svg className={cls} viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.2"/><line x1="4" y1="1" x2="4" y2="15" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2"/></svg>,
    wave: <svg className={cls} viewBox="0 0 16 16" fill="none"><path d="M1 12 Q4 4 8 8 Q12 12 15 4" stroke="currentColor" strokeWidth="1.3" fill="none"/></svg>,
    neon: <svg className={cls} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.2"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="0.6" opacity="0.5"/></svg>,
    typewriter: <svg className={cls} viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="10" height="5" rx="1" stroke="currentColor" strokeWidth="1"/><line x1="10" y1="5.5" x2="10" y2="8" stroke="currentColor" strokeWidth="1.5"/></svg>,
    spotlight: <svg className={cls} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1"/><circle cx="8" cy="8" r="2" fill="currentColor" opacity="0.4"/></svg>,
    bounce: <svg className={cls} viewBox="0 0 16 16" fill="none"><circle cx="5" cy="6" r="1.5" fill="currentColor"/><circle cx="11" cy="10" r="1.5" fill="currentColor"/><line x1="2" y1="14" x2="14" y2="14" stroke="currentColor" strokeWidth="0.8"/></svg>,
    gradient: <svg className={cls} viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1"/><line x1="4" y1="5" x2="12" y2="11" stroke="currentColor" strokeWidth="1.2" opacity="0.6"/></svg>,
    flicker: <svg className={cls} viewBox="0 0 16 16" fill="none"><path d="M8 2 Q10 7 8 9 Q6 11 8 14" stroke="currentColor" strokeWidth="1.3" fill="none"/></svg>,
    stagger: <svg className={cls} viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="2" height="8" rx="0.5" fill="currentColor"/><rect x="7" y="2" width="2" height="8" rx="0.5" fill="currentColor" opacity="0.6"/><rect x="12" y="6" width="2" height="8" rx="0.5" fill="currentColor" opacity="0.3"/></svg>,
    flip: <svg className={cls} viewBox="0 0 16 16" fill="none"><rect x="3" y="4" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1"/><path d="M8 4 L8 2M6 2 Q8 0.5 10 2" stroke="currentColor" strokeWidth="0.7" fill="none"/></svg>,
    liquid: <svg className={cls} viewBox="0 0 16 16" fill="none"><path d="M2 10 Q5 3 8 8 Q11 13 14 6" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>,
    hologram: <svg className={cls} viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="8" height="10" rx="1" stroke="currentColor" strokeWidth="1"/><rect x="3" y="3" width="8" height="10" rx="1" stroke="currentColor" strokeWidth="0.6" opacity="0.4"/></svg>,
    chromatic: <svg className={cls} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="4" r="2.5" fill="#f44" opacity="0.5"/><circle cx="8" cy="8" r="2.5" fill="#4f4" opacity="0.5"/><circle cx="8" cy="12" r="2.5" fill="#48f" opacity="0.5"/></svg>,
    cube: <svg className={cls} viewBox="0 0 16 16" fill="none"><path d="M2 3 L8 1 L14 3 L14 11 L8 13 L2 11 Z" stroke="currentColor" strokeWidth="1"/></svg>,
    scanline: <svg className={cls} viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1"/><line x1="2" y1="5" x2="14" y2="5" stroke="currentColor" strokeWidth="0.4" opacity="0.5"/><line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="0.4"/><line x1="2" y1="11" x2="14" y2="11" stroke="currentColor" strokeWidth="0.4" opacity="0.5"/></svg>,
    metal: <svg className={cls} viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1"/><line x1="2" y1="6" x2="14" y2="6" stroke="currentColor" strokeWidth="0.5"/><line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="0.7"/></svg>,
    glass: <svg className={cls} viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1" opacity="0.5"/></svg>,
    fire: <svg className={cls} viewBox="0 0 16 16" fill="none"><path d="M8 14 Q5 10 6 7 Q7 4 8 2 Q9 5 10 7 Q11 10 8 14Z" stroke="currentColor" strokeWidth="1" fill="none"/></svg>,
    ice: <svg className={cls} viewBox="0 0 16 16" fill="none"><polygon points="8,1 10,5 14,5 11,8 12.5,12 8,9.5 3.5,12 5,8 2,5 6,5" stroke="currentColor" strokeWidth="0.8" fill="none"/></svg>,
    ink: <svg className={cls} viewBox="0 0 16 16" fill="none"><path d="M3 8 Q5 3 8 5 Q11 7 13 3" stroke="currentColor" strokeWidth="1.2" fill="none"/><circle cx="8" cy="7" r="1.5" fill="currentColor" opacity="0.3"/></svg>,
    shake: <svg className={cls} viewBox="0 0 16 16" fill="none"><path d="M2 8 L5 5 L7 8 L9 4 L11 9 L14 5" stroke="currentColor" strokeWidth="1" fill="none"/></svg>,
    pulse: <svg className={cls} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1"/><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/></svg>,
    skew: <svg className={cls} viewBox="0 0 16 16" fill="none"><rect x="3" y="4" width="10" height="8" stroke="currentColor" strokeWidth="1"/><line x1="3" y1="12" x2="13" y2="4" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 1"/></svg>,
    roll: <svg className={cls} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1"/><path d="M4 8 Q6 3 8 5 Q10 7 12 4" stroke="currentColor" strokeWidth="0.7" fill="none"/></svg>,
    blast: <svg className={cls} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2" fill="currentColor" opacity="0.5"/><line x1="8" y1="4" x2="8" y2="1" stroke="currentColor" strokeWidth="0.7"/><line x1="4" y1="5" x2="2" y2="3" stroke="currentColor" strokeWidth="0.5"/><line x1="12" y1="5" x2="14" y2="3" stroke="currentColor" strokeWidth="0.5"/></svg>,
    rave: <svg className={cls} viewBox="0 0 16 16" fill="none"><line x1="4" y1="2" x2="4" y2="14" stroke="currentColor" strokeWidth="1"/><line x1="8" y1="2" x2="8" y2="14" stroke="currentColor" strokeWidth="0.7" opacity="0.6"/><line x1="12" y1="2" x2="12" y2="14" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/></svg>,
    phosphor: <svg className={cls} viewBox="0 0 16 16" fill="none"><circle cx="4" cy="8" r="2" fill="currentColor" opacity="0.8"/><circle cx="7" cy="8" r="1.5" fill="currentColor" opacity="0.4"/></svg>,
    prism: <svg className={cls} viewBox="0 0 16 16" fill="none"><polygon points="4,2 12,2 6,14 2,14" stroke="currentColor" strokeWidth="1" fill="none"/></svg>,
    aurora: <svg className={cls} viewBox="0 0 16 16" fill="none"><path d="M1 12 Q4 3 8 8 Q12 13 15 4" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>,
    warp: <svg className={cls} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1"/><ellipse cx="8" cy="8" rx="1.5" ry="3" fill="currentColor" opacity="0.4"/></svg>,
    glowpulse: <svg className={cls} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2" fill="currentColor" opacity="0.7"/><circle cx="8" cy="8" r="4.5" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/></svg>,
    twist: <svg className={cls} viewBox="0 0 16 16" fill="none"><path d="M4 3 Q8 8 4 13" stroke="currentColor" strokeWidth="1" fill="none"/><path d="M12 3 Q8 8 12 13" stroke="currentColor" strokeWidth="1" fill="none"/></svg>,
    sparkle: <svg className={cls} viewBox="0 0 16 16" fill="none"><polygon points="8,1 9.5,5.5 14,6 10.5,9 11.5,13.5 8,11 4.5,13.5 5.5,9 2,6 6.5,5.5" stroke="currentColor" strokeWidth="0.7" fill="none"/></svg>,
    float: <svg className={cls} viewBox="0 0 16 16" fill="none"><path d="M4 12 Q8 4 12 12" stroke="currentColor" strokeWidth="1" fill="none"/></svg>,
    drip: <svg className={cls} viewBox="0 0 16 16" fill="none"><rect x="6" y="2" width="4" height="8" rx="2" stroke="currentColor" strokeWidth="1"/><path d="M8 10 Q8 15 8 14" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>,
    particles: <svg className={cls} viewBox="0 0 16 16" fill="none"><circle cx="4" cy="4" r="1" fill="currentColor"/><circle cx="10" cy="6" r="0.7" fill="currentColor" opacity="0.6"/><circle cx="6" cy="11" r="0.8" fill="currentColor" opacity="0.5"/><circle cx="13" cy="10" r="0.6" fill="currentColor" opacity="0.4"/></svg>,
    gradientorb: <svg className={cls} viewBox="0 0 16 16" fill="none"><circle cx="6" cy="7" r="4" fill="currentColor" opacity="0.3"/><circle cx="10" cy="9" r="3" fill="currentColor" opacity="0.2"/></svg>,
    matrixrain: <svg className={cls} viewBox="0 0 16 16" fill="none"><text x="1" y="12" fontSize="14" fontWeight="bold" fill="currentColor">010</text></svg>,
    noise: <svg className={cls} viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1"/><text x="3" y="12" fontSize="8" fill="currentColor" opacity="0.5">/////</text></svg>,
    magnet: <svg className={cls} viewBox="0 0 16 16" fill="none"><path d="M4 2 H8 A4 4 0 0 1 12 6 V12 A2 2 0 0 1 8 12 V6 A1 1 0 0 0 6 6 V12 A2 2 0 0 1 2 12 V6 A4 4 0 0 1 4 2Z" stroke="currentColor" strokeWidth="1" fill="none"/></svg>,
    parallaxtilt: <svg className={cls} viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1"/><line x1="2" y1="5" x2="14" y2="3" stroke="currentColor" strokeWidth="0.5"/></svg>,
    morphing: <svg className={cls} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1"/><rect x="4" y="4" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/></svg>,
    pagetransition: <svg className={cls} viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="12" rx="0.5" stroke="currentColor" strokeWidth="1"/><polygon points="9,5 14,8 9,11" fill="currentColor" opacity="0.6"/></svg>,
    skeletonwave: <svg className={cls} viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="2.5" rx="1" fill="currentColor" opacity="0.3"/><rect x="2" y="7" width="8" height="2.5" rx="1" fill="currentColor" opacity="0.3"/><rect x="2" y="11" width="10" height="2.5" rx="1" fill="currentColor" opacity="0.3"/></svg>,
    floatcube: <svg className={cls} viewBox="0 0 16 16" fill="none"><path d="M2 3 L8 1 L14 3 L14 11 L8 13 L2 11 Z" stroke="currentColor" strokeWidth="1" fill="none"/></svg>,
    depthcards: <svg className={cls} viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="14" rx="1.5" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/><rect x="3" y="3" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/><rect x="5" y="5" width="6" height="6" rx="0.8" stroke="currentColor" strokeWidth="1.2"/></svg>,
    spiralgalaxy: <svg className={cls} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="1" fill="currentColor"/><path d="M8 2 A6 6 0 1 1 2 8" stroke="currentColor" strokeWidth="0.8" fill="none" strokeDasharray="0.5 2"/></svg>,
    glossy: <svg className={cls} viewBox="0 0 16 16" fill="none"><rect x="3" y="2" width="10" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="3" y="8" width="10" height="5" rx="1" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/></svg>,
    lensflare: <svg className={cls} viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" fill="currentColor" opacity="0.5"/><circle cx="10" cy="9" r="1.5" fill="currentColor" opacity="0.3"/><circle cx="12" cy="11" r="1" fill="currentColor" opacity="0.2"/></svg>,
    caustics: <svg className={cls} viewBox="0 0 16 16" fill="none"><path d="M2 10 Q5 4 8 8 Q11 12 14 5" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.6"/></svg>,
    flagwave: <svg className={cls} viewBox="0 0 16 16" fill="none"><path d="M2 3 L14 6 L2 9 L14 12" stroke="currentColor" strokeWidth="1.2" fill="none"/><line x1="2" y1="1" x2="2" y2="14" stroke="currentColor" strokeWidth="1"/></svg>,
    melt: <svg className={cls} viewBox="0 0 16 16" fill="none"><rect x="5" y="2" width="6" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M5 8 Q4 12 6 13 Q8 14 10 13 Q12 12 11 8" stroke="currentColor" strokeWidth="1" fill="none"/></svg>,
    confetti: <svg className={cls} viewBox="0 0 16 16" fill="none"><rect x="3" y="5" width="2" height="1" rx="0.3" fill="currentColor" opacity="0.7"/><rect x="8" y="3" width="3" height="1.5" rx="0.4" fill="currentColor" opacity="0.5"/><rect x="6" y="10" width="2" height="1" rx="0.3" fill="currentColor" opacity="0.6"/><rect x="11" y="8" width="2.5" height="1" rx="0.3" fill="currentColor" opacity="0.4"/></svg>,
    ripplebg: <svg className={cls} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2" fill="currentColor" opacity="0.6"/><circle cx="8" cy="8" r="4.5" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="0.4" opacity="0.2"/></svg>,
    customcursor: <svg className={cls} viewBox="0 0 16 16" fill="none"><path d="M3 3 L10 8 L7 9 L11 14" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    hoverglow: <svg className={cls} viewBox="0 0 16 16" fill="none"><circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="1"/><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/></svg>,
    dragrotate: <svg className={cls} viewBox="0 0 16 16" fill="none"><path d="M2 8 Q8 2 14 8 Q8 14 2 8" stroke="currentColor" strokeWidth="1" fill="none"/><polygon points="13,5 13,11 7,8" fill="currentColor" opacity="0.5"/></svg>,
    circularprogress: <svg className={cls} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" opacity="0.2"/><path d="M8 2 A6 6 0 0 1 14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    countup: <svg className={cls} viewBox="0 0 16 16" fill="none"><text x="2" y="13" fontSize="12" fontWeight="bold" fill="currentColor">123</text></svg>,
    marquee: <svg className={cls} viewBox="0 0 16 16" fill="none"><line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.2"/><polygon points="12,5 14,8 12,11" fill="currentColor"/></svg>,
    animatedborder: <svg className={cls} viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none"/><rect x="3" y="3" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="0.6" opacity="0.4"/></svg>,
    blob: <svg className={cls} viewBox="0 0 16 16" fill="none"><ellipse cx="6" cy="7" rx="3.5" ry="4" stroke="currentColor" strokeWidth="1"/><ellipse cx="10" cy="9" rx="2.5" ry="3" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/></svg>,
  }
  return shapes[type] ?? <span className="w-3 h-3 inline-block rounded-sm bg-current opacity-40" />
}
