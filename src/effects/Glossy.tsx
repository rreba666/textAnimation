interface Props {
  text: string
  /** 倒影模糊 1~10 */
  blur: number
  /** 倒影距离 5~50 px */
  distance: number
  /** 倒影透明度 0.1~0.9 */
  opacity: number
}

/**
 * Glossy 镜面反射 — 纯 CSS
 * 文字下方有镜像倒影，线性渐变淡出，模拟水面反射
 */
export default function Glossy({ text, blur, distance, opacity: reflectOpacity }: Props) {
  const displayText = text || '镜面反射'

  return (
    <div className="flex flex-col items-center select-none">
      {/* 主文字 */}
      <span className="text-4xl font-bold" style={{ color: '#f0c060' }}>
        {displayText}
      </span>
      {/* 倒影 — scaleY(-1) 垂直翻转 + 渐变遮罩淡出 */}
      <div className="relative" style={{ height: 60 }}>
        <span
          className="absolute left-1/2 top-0 -translate-x-1/2 text-4xl font-bold whitespace-nowrap"
          style={{
            color: '#f0c060',
            transform: `scaleY(-1) translateY(${distance}px)`,
            opacity: reflectOpacity,
            filter: `blur(${blur * 0.3}px)`,
            // 渐变遮罩从半透明到全透明
            maskImage: 'linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.3) 40%, #000 100%)',
            WebkitMaskImage: 'linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.3) 40%, #000 100%)',
          }}
        >
          {displayText}
        </span>
      </div>
    </div>
  )
}
