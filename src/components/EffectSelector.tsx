import type { EffectType, EffectMeta, EffectCategory } from '../types'

interface Props {
  current: EffectType
  onChange: (effect: EffectType) => void
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
]

const CATEGORIES: { key: EffectCategory; label: string }[] = [
  { key: 'text', label: '文字动效 (35)' },
  { key: 'background', label: '背景特效 (4)' },
  { key: 'interaction', label: '鼠标交互 (2)' },
  { key: 'transition', label: '加载/转场 (3)' },
]

export default function EffectSelector({ current, onChange }: Props) {
  return (
    <div className="w-full space-y-3">
      <label className="block text-sm text-[#8888aa]">选择动效（共 {ALL.length} 种）</label>
      {CATEGORIES.map((cat) => {
        const items = ALL.filter((e) => e.category === cat.key)
        return (
          <div key={cat.key}>
            <div className="text-xs text-[#555577] font-medium mb-1 border-b border-[#1a1a2e] pb-0.5">
              {cat.label}
            </div>
            <div className="flex flex-wrap gap-1">
              {items.map((eff) => {
                const isActive = current === eff.key
                return (
                  <button
                    key={eff.key}
                    onClick={() => onChange(eff.key)}
                    title={eff.description}
                    className={`flex items-center gap-0.5 px-1.5 py-1 rounded text-[11px] font-medium
                      transition-all duration-150 leading-tight
                      ${isActive
                        ? 'bg-[#b8a0d4] text-white shadow-md shadow-[#b8a0d4]/30 scale-105'
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
      })}
    </div>
  )
}

/** 小图标方便快速识别效果类别 */
function EffIcon({ type }: { type: EffectType }) {
  const cls = 'w-3 h-3 shrink-0'
  // 简化的通用图标映射
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
  }
  return shapes[type] ?? <span className="w-3 h-3 inline-block rounded-sm bg-current opacity-40" />
}
