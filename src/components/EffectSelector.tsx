import type { EffectType, EffectMeta } from '../types'

interface Props {
  current: EffectType
  onChange: (effect: EffectType) => void
}

/** 十种动效元数据 — 组件外部常量 */
const EFFECTS: EffectMeta[] = [
  { key: 'glitch', name: '故障 Glitch', description: '信号干扰般的抖动错位', iconChar: 'g' },
  { key: 'wave', name: '波浪 Wave', description: '逐字起伏的弹性波浪', iconChar: 'w' },
  { key: 'neon', name: '霓虹 Neon', description: '多层辉光的灯管效果', iconChar: 'n' },
  { key: 'typewriter', name: '打字机 Typewriter', description: '逐字敲入的复古感', iconChar: 't' },
  { key: 'spotlight', name: '聚光灯 Spotlight', description: '鼠标跟随的光斑探照', iconChar: 's' },
  { key: 'bounce', name: '弹跳 Bounce', description: '字符上下弹跳的物理感', iconChar: 'b' },
  { key: 'gradient', name: '流动渐变 Gradient', description: '渐变色彩在文字中流动', iconChar: 'd' },
  { key: 'flicker', name: '烛光 Flicker', description: '模拟烛火不规则明暗闪烁', iconChar: 'f' },
  { key: 'stagger', name: '交错 Stagger', description: '字符从指定方向逐一飞入', iconChar: 'r' },
  { key: 'flip', name: '3D翻转 Flip', description: '三维空间逐字翻转', iconChar: 'p' },
  { key: 'liquid', name: '液体 Liquid', description: 'SVG 滤镜有机液体扭曲', iconChar: 'l' },
  { key: 'hologram', name: '全息 Hologram', description: '多层叠影渐变扫光全息投影', iconChar: 'h' },
  { key: 'chromatic', name: '色差 Chromatic', description: 'RGB 通道分离的镜头色散', iconChar: 'c' },
  { key: 'cube', name: '立方体 Cube', description: 'CSS 3D 旋转立方体', iconChar: '3' },
  { key: 'scanline', name: '扫描线 Scanline', description: 'CRT 显示器的复古扫描线', iconChar: 'n' },
  { key: 'metal', name: '金属 Metal', description: '拉丝金属光泽质感', iconChar: 'm' },
  { key: 'glass', name: '毛玻璃 Glass', description: '磨砂半透明玻璃效果', iconChar: 'g' },
  { key: 'fire', name: '火焰 Fire', description: '燃烧跃动的火焰文字', iconChar: 'f' },
  { key: 'ice', name: '冰霜 Ice', description: '冷蓝冰晶闪烁效果', iconChar: 'i' },
  { key: 'ink', name: '墨迹 Ink', description: '毛笔书写墨迹扩散', iconChar: 'k' },
  { key: 'shake', name: '震动 Shake', description: '随机抖动的地震感', iconChar: 's' },
  { key: 'pulse', name: '脉冲 Pulse', description: '心跳般的缩放律动', iconChar: 'u' },
  { key: 'skew', name: '倾斜 Skew', description: '左右摇摆的倾斜变形', iconChar: 'e' },
  { key: 'roll', name: '滚动 Roll', description: '像轮子一样旋转滚入', iconChar: 'r' },
  { key: 'blast', name: '爆破 Blast', description: '炸开成碎片四散飞出', iconChar: 'x' },
  { key: 'rave', name: '激光雨 Rave', description: '彩色激光束交替扫过', iconChar: 'l' },
  { key: 'phosphor', name: '磷光 Phosphor', description: '移动后留下彩色拖尾', iconChar: 'p' },
  { key: 'prism', name: '棱镜 Prism', description: '彩虹色散光谱折射', iconChar: 'p' },
  { key: 'aurora', name: '极光 Aurora', description: '青绿蓝紫极光流淌', iconChar: 'a' },
  { key: 'warp', name: '扭曲 Warp', description: '黑洞引力扭曲拉伸', iconChar: 'w' },
  { key: 'glowpulse', name: '光晕脉冲 GlowPulse', description: '光晕像心跳扩散收缩', iconChar: 'g' },
  { key: 'twist', name: '扭转 Twist', description: '3D 麻花扭转旋转', iconChar: 't' },
  { key: 'sparkle', name: '星光 Sparkle', description: '表面随机闪烁星光', iconChar: 's' },
  { key: 'float', name: '漂浮 Float', description: '羽毛般轻轻上下浮动', iconChar: 'f' },
  { key: 'drip', name: '滴落 Drip', description: '墨水从底部滴落', iconChar: 'd' },
]

/**
 * 效果选择器 — 双行网格按钮组
 * 10 个动效分两行排列，每行 5 个
 */
export default function EffectSelector({ current, onChange }: Props) {
  return (
    <div className="w-full">
      <label className="block text-sm text-[#8888aa] mb-1.5">选择动效（共 {EFFECTS.length} 种）</label>
      <div className="grid grid-cols-5 gap-1.5">
        {EFFECTS.map((eff) => {
          const isActive = current === eff.key
          return (
            <button
              key={eff.key}
              onClick={() => onChange(eff.key)}
              title={eff.description}
              className={`flex flex-col items-center gap-0.5 px-1.5 py-2 rounded-lg text-xs font-medium
                transition-all duration-200
                ${isActive
                  ? 'bg-[#b8a0d4] text-white shadow-lg shadow-[#b8a0d4]/30 scale-105'
                  : 'bg-[#1a1a2e] text-[#8888aa] border border-[#2a2a4a] hover:border-[#b8a0d4] hover:text-[#ccc]'
                }`}
            >
              {getEffectIcon(eff.key)}
              <span className="leading-tight">{eff.name.split(' ')[0]}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** 根据效果 key 返回对应的 SVG 图标 */
function getEffectIcon(key: EffectType) {
  const cls = 'w-4 h-4'
  switch (key) {
    case 'glitch':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <rect x="1" y="3" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.2"/>
          <line x1="4" y1="1" x2="4" y2="15" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
          <line x1="12" y1="1" x2="12" y2="15" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" strokeDashoffset="0.5"/>
        </svg>
      )
    case 'wave':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <path d="M1 12 Q4 4 8 8 Q12 12 15 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </svg>
      )
    case 'neon':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.2"/>
          <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
          <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeWidth="0.4" opacity="0.3"/>
        </svg>
      )
    case 'typewriter':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <rect x="2" y="4" width="10" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
          <rect x="5" y="10" width="6" height="0.8" rx="0.4" fill="currentColor" opacity="0.6"/>
          <line x1="10" y1="5.5" x2="10" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    case 'spotlight':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M8 2 L8 1M8 14 L8 15M2 8 L1 8M14 8 L15 8" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          <circle cx="8" cy="8" r="2" fill="currentColor" opacity="0.5"/>
        </svg>
      )
    case 'bounce':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <circle cx="5" cy="6" r="1.5" fill="currentColor"/>
          <circle cx="11" cy="10" r="1.5" fill="currentColor"/>
          <path d="M5 14 L5 7.5M11 14 L11 11.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 1"/>
          <line x1="2" y1="14" x2="14" y2="14" stroke="currentColor" strokeWidth="1"/>
        </svg>
      )
    case 'gradient':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/>
          <line x1="4" y1="5" x2="12" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
          <line x1="4" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
        </svg>
      )
    case 'flicker':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <path d="M8 2 Q10 7 8 9 Q6 11 8 14" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <path d="M6 2 Q8 7 6 9 Q4 11 6 14" stroke="currentColor" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.5"/>
        </svg>
      )
    case 'stagger':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <rect x="2" y="4" width="2.5" height="8" rx="0.5" fill="currentColor"/>
          <rect x="6.5" y="2" width="2.5" height="8" rx="0.5" fill="currentColor" opacity="0.7"/>
          <rect x="11" y="6" width="2.5" height="8" rx="0.5" fill="currentColor" opacity="0.4"/>
        </svg>
      )
    case 'flip':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <rect x="3" y="4" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M3 8 L1 8M13 8 L15 8" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          <path d="M8 4 L8 2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          <path d="M6 2 Q8 0.5 10 2" stroke="currentColor" strokeWidth="0.8" fill="none"/>
        </svg>
      )
    case 'liquid':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <path d="M2 10 Q5 3 8 8 Q11 13 14 6" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
          <circle cx="5" cy="5" r="1" fill="currentColor" opacity="0.6"/>
          <circle cx="11" cy="9" r="0.8" fill="currentColor" opacity="0.4"/>
        </svg>
      )
    case 'hologram':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <rect x="1" y="3" width="8" height="10" rx="1" stroke="currentColor" strokeWidth="1.2"/>
          <rect x="3" y="3" width="8" height="10" rx="1" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
          <rect x="5" y="3" width="8" height="10" rx="1" stroke="currentColor" strokeWidth="0.4" opacity="0.3"/>
        </svg>
      )
    case 'chromatic':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="4" r="2.5" fill="#ff4444" opacity="0.6"/>
          <circle cx="8" cy="8" r="2.5" fill="#44ff44" opacity="0.6"/>
          <circle cx="8" cy="12" r="2.5" fill="#4488ff" opacity="0.6"/>
        </svg>
      )
    case 'cube':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <path d="M2 3 L8 1 L14 3 L14 11 L8 13 L2 11 Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          <line x1="8" y1="1" x2="8" y2="13" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
          <line x1="2" y1="3" x2="8" y2="1" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
        </svg>
      )
    case 'scanline':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
          <line x1="2" y1="5" x2="14" y2="5" stroke="currentColor" strokeWidth="0.5" opacity="0.6"/>
          <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="0.5" opacity="0.6"/>
          <line x1="2" y1="11" x2="14" y2="11" stroke="currentColor" strokeWidth="0.5" opacity="0.6"/>
        </svg>
      )
    case 'metal':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.2"/>
          <line x1="2" y1="6" x2="14" y2="6" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
          <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="0.8" opacity="0.7"/>
          <line x1="2" y1="10" x2="14" y2="10" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
        </svg>
      )
    case 'glass':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.6"/>
          <path d="M4 4 L8 2 L12 4" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
          <circle cx="6" cy="7" r="0.8" fill="currentColor" opacity="0.5"/>
          <circle cx="10" cy="9" r="0.6" fill="currentColor" opacity="0.3"/>
        </svg>
      )
    case 'fire':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <path d="M8 14 Q5 10 6 7 Q7 4 8 2 Q9 5 10 7 Q11 10 8 14Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          <path d="M7.5 11 Q6.5 9 7 7.5" stroke="currentColor" strokeWidth="0.7" fill="none" opacity="0.5"/>
        </svg>
      )
    case 'ice':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <polygon points="8,1 10,5 14,5 11,8 12.5,12 8,9.5 3.5,12 5,8 2,5 6,5" stroke="currentColor" strokeWidth="1" fill="none"/>
          <circle cx="8" cy="5" r="0.6" fill="currentColor" opacity="0.6"/>
        </svg>
      )
    case 'ink':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <path d="M3 8 Q5 3 8 5 Q11 7 13 3" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
          <circle cx="8" cy="7" r="3" fill="currentColor" opacity="0.2"/>
          <circle cx="8" cy="7" r="1" fill="currentColor" opacity="0.5"/>
        </svg>
      )
    case 'shake':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <path d="M2 8 L5 5 L7 8 L9 4 L11 9 L14 5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="8" y1="2" x2="8" y2="14" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1.5 1.5" opacity="0.4"/>
        </svg>
      )
    case 'pulse':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2"/>
          <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="0.8" opacity="0.6"/>
          <circle cx="8" cy="8" r="1" fill="currentColor" opacity="0.5"/>
        </svg>
      )
    case 'skew':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <rect x="3" y="4" width="10" height="8" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          <line x1="3" y1="12" x2="13" y2="4" stroke="currentColor" strokeWidth="0.6" strokeDasharray="1 1" opacity="0.5"/>
        </svg>
      )
    case 'roll':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M4 8 Q6 3 8 5 Q10 7 12 4" stroke="currentColor" strokeWidth="0.8" fill="none"/>
          <circle cx="6" cy="5" r="0.7" fill="currentColor" opacity="0.5"/>
        </svg>
      )
    case 'blast':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="2" fill="currentColor" opacity="0.6"/>
          <line x1="8" y1="4" x2="8" y2="1" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
          <line x1="4" y1="5" x2="2" y2="3" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round"/>
          <line x1="12" y1="5" x2="14" y2="3" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round"/>
          <line x1="5" y1="11" x2="3" y2="13" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round"/>
          <line x1="11" y1="11" x2="13" y2="13" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round"/>
        </svg>
      )
    case 'rave':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <line x1="4" y1="2" x2="4" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="8" y1="2" x2="8" y2="14" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.7"/>
          <line x1="12" y1="2" x2="12" y2="14" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" opacity="0.4"/>
        </svg>
      )
    case 'phosphor':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <circle cx="4" cy="8" r="2" fill="currentColor" opacity="0.9"/>
          <circle cx="7" cy="8" r="1.5" fill="currentColor" opacity="0.5"/>
          <circle cx="9.5" cy="8" r="1" fill="currentColor" opacity="0.25"/>
          <line x1="6" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 1" opacity="0.3"/>
        </svg>
      )
    case 'prism':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <polygon points="4,2 12,2 6,14 2,14" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          <line x1="13" y1="3" x2="13" y2="6" stroke="#ff4444" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
          <line x1="13.5" y1="6" x2="13.5" y2="8" stroke="#ff8800" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          <line x1="14" y1="8" x2="14" y2="10" stroke="#44ff44" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
          <line x1="14" y1="10" x2="14" y2="12" stroke="#4488ff" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
        </svg>
      )
    case 'aurora':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <path d="M1 12 Q4 3 8 8 Q12 13 15 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8"/>
          <path d="M1 10 Q4 5 8 10 Q12 15 15 6" stroke="currentColor" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.4"/>
        </svg>
      )
    case 'warp':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2"/>
          <ellipse cx="8" cy="8" rx="1.5" ry="3" fill="currentColor" opacity="0.5"/>
          <path d="M3 3 Q8 1 13 3" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.4"/>
          <path d="M3 13 Q8 15 13 13" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.4"/>
        </svg>
      )
    case 'glowpulse':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="2" fill="currentColor" opacity="0.8"/>
          <circle cx="8" cy="8" r="4" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="0.6" opacity="0.25"/>
          <circle cx="8" cy="8" r="1" fill="currentColor" opacity="0.4"/>
        </svg>
      )
    case 'twist':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <path d="M4 3 Q8 8 4 13" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          <path d="M12 3 Q8 8 12 13" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          <line x1="8" y1="3" x2="8" y2="13" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1 1" opacity="0.4"/>
        </svg>
      )
    case 'sparkle':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <polygon points="8,1 9.5,5.5 14,6 10.5,9 11.5,13.5 8,11 4.5,13.5 5.5,9 2,6 6.5,5.5" stroke="currentColor" strokeWidth="0.8" fill="none"/>
          <circle cx="8" cy="7" r="0.8" fill="currentColor" opacity="0.6"/>
        </svg>
      )
    case 'float':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <path d="M4 12 Q8 4 12 12" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          <line x1="4" y1="14" x2="4" y2="12" stroke="currentColor" strokeWidth="0.6" opacity="0.3"/>
          <line x1="12" y1="14" x2="12" y2="12" stroke="currentColor" strokeWidth="0.6" opacity="0.3"/>
        </svg>
      )
    case 'drip':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none">
          <rect x="6" y="2" width="4" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          <path d="M8 10 Q8 15 8 14" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <circle cx="5" cy="14" r="0.5" fill="currentColor" opacity="0.4"/>
          <circle cx="11" cy="13" r="0.4" fill="currentColor" opacity="0.3"/>
        </svg>
      )
  }
}
