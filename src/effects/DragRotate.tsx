import { useRef, useCallback, useState } from 'react'

interface Props {
  text: string; speed: number; axis: 'xy' | 'x' | 'y'
}

/** Drag to Rotate — CSS 3D + JS 拖拽旋转 */
export default function DragRotate({ text, speed, axis }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rot, setRot] = useState({ x: -15, y: 20 })
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })

  const handleDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true; last.current = { x: e.clientX, y: e.clientY }
  }, [])
  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return
    const dx = (e.clientX - last.current.x) * speed * 0.3
    const dy = (e.clientY - last.current.y) * speed * 0.3
    last.current = { x: e.clientX, y: e.clientY }
    setRot((r) => ({
      x: axis !== 'y' ? r.x + dy : r.x,
      y: axis !== 'x' ? r.y + dx : r.y,
    }))
  }, [speed, axis])
  const handleUp = useCallback(() => { dragging.current = false }, [])

  return (
    <div className="select-none cursor-grab active:cursor-grabbing"
         onMouseDown={handleDown} onMouseMove={handleMove} onMouseUp={handleUp} onMouseLeave={handleUp}>
      <div ref={cardRef} className="px-12 py-8 rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#2a2a4a]
        border-2 border-[#b8a0d4] shadow-xl shadow-[#b8a0d4]/20"
        style={{ transform: `perspective(600px) rotateX(${rot.x}deg) rotateY(${rot.y}deg)`, transformStyle: 'preserve-3d' }}>
        <div className="text-2xl font-bold text-[#f0c060]" style={{ transform: 'translateZ(40px)' }}>
          {text || '拖拽旋转'}
        </div>
        <div className="text-xs text-[#8888aa] mt-2" style={{ transform: 'translateZ(20px)' }}>
          按住鼠标拖拽旋转 3D 物体
        </div>
      </div>
    </div>
  )
}
