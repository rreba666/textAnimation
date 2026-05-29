import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

/**
 * 预览区容器 — 文字动效的实时展示舞台
 * 使用 React children 模式，具体的动画逻辑完全由子组件负责
 */
export default function Preview({ children }: Props) {
  return (
    <div className="w-full">
      <label className="block text-sm text-[#8888aa] mb-1.5">实时预览</label>
      <div className="min-h-[160px] bg-[#0f0f23] border border-[#2a2a4a] rounded-lg
                      flex items-center justify-center p-6 overflow-hidden relative">
        {/* 星空背景装饰 — 20 颗随机分布的星点 */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
               style={{ top: '15%', left: '10%', animationDelay: '0s' }} />
          <div className="absolute w-1 h-1 bg-[#f0c060] rounded-full animate-pulse"
               style={{ top: '25%', left: '85%', animationDelay: '0.8s' }} />
          <div className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
               style={{ top: '60%', left: '20%', animationDelay: '1.6s' }} />
          <div className="absolute w-1 h-1 bg-[#b8a0d4] rounded-full animate-pulse"
               style={{ top: '70%', left: '75%', animationDelay: '2.4s' }} />
          <div className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
               style={{ top: '40%', left: '50%', animationDelay: '3.2s' }} />
          <div className="absolute w-0.5 h-0.5 bg-[#f0c060] rounded-full animate-pulse"
               style={{ top: '85%', left: '40%', animationDelay: '0.4s' }} />
          <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
               style={{ top: '10%', left: '45%', animationDelay: '1.2s' }} />
          <div className="absolute w-0.5 h-0.5 bg-[#b8a0d4] rounded-full animate-pulse"
               style={{ top: '35%', left: '30%', animationDelay: '2.0s' }} />
        </div>
        {/* 内容区 */}
        <div className="relative z-10 flex items-center justify-center w-full min-h-[100px]">
          {children}
        </div>
      </div>
    </div>
  )
}
