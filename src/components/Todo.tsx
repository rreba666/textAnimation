// 待办事项卡片 —— 含进度统计

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { ClipboardList, Plus, Trash2, Check, X, GripVertical, Bell, BellRing } from 'lucide-react'
import gsap from 'gsap'
import { useDashboardStore } from '../store/useDashboardStore'
import { showToast } from './Toast'
import MonthlyTrend from './MonthlyTrend'
import type { FilterType } from '../types'

const FILTER_TABS: { key: FilterType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '未完成' },
  { key: 'completed', label: '已完成' },
]

export default function Todo() {
  const todos = useDashboardStore((s) => s.todos)
  const addTodo = useDashboardStore((s) => s.addTodo)
  const toggleTodo = useDashboardStore((s) => s.toggleTodo)
  const deleteTodo = useDashboardStore((s) => s.deleteTodo)
  const editTodo = useDashboardStore((s) => s.editTodo)
  const reorderTodos = useDashboardStore((s) => s.reorderTodos)
  const setTodoReminder = useDashboardStore((s) => s.setTodoReminder)

  const [filter, setFilter] = useState<FilterType>('all')
  const [inputValue, setInputValue] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [showTrend, setShowTrend] = useState(false)
  const [reminderId, setReminderId] = useState<string | null>(null)
  const [reminderTime, setReminderTime] = useState('')

  const filtered = todos.filter((t) => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  // 统计数据
  const stats = useMemo(() => {
    const done = todos.filter((t) => t.completed).length
    const total = todos.length
    return { done, total, percent: total > 0 ? Math.round((done / total) * 100) : 0 }
  }, [todos])

  // GSAP 入场动画：追踪待办数量变化，为新项添加滑入淡入效果
  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map())
  const prevTodosLength = useRef(todos.length)
  const todoInputRef = useRef<HTMLInputElement>(null)

  // 监听待办数量变化，为新增项播放 GSAP 入场动画
  useEffect(() => {
    if (todos.length > prevTodosLength.current) {
      const newCount = todos.length - prevTodosLength.current
      const newTodos = todos.slice(todos.length - newCount)
      // 等待下一帧确保 DOM 已渲染
      requestAnimationFrame(() => {
        newTodos.forEach((todo) => {
          const el = itemRefs.current.get(todo.id)
          if (el) {
            gsap.from(el, { opacity: 0, x: -20, duration: 0.35, ease: 'power2.out' })
          }
        })
      })
    }
    prevTodosLength.current = todos.length
  }, [todos])

  // GSAP 脉冲动画辅助函数：用于快捷键视觉反馈
  const pulseElement = useCallback((el: HTMLElement) => {
    gsap.fromTo(el,
      { scale: 1, boxShadow: '0 0 0 0 rgba(212,165,165,0)' },
      { scale: 1.03, boxShadow: '0 0 0 6px rgba(212,165,165,0.3)', duration: 0.2, ease: 'power2.out', yoyo: true, repeat: 1 }
    )
  }, [])

  // 键盘快捷键监听：T 聚焦输入框，E 编辑第一个未完成待办
  useEffect(() => {
    const handleShortcut = (e: Event) => {
      const { type } = e as CustomEvent
      if (type === 'shortcut:focus-todo') {
        todoInputRef.current?.focus()
        if (todoInputRef.current) pulseElement(todoInputRef.current)
      } else if (type === 'shortcut:edit-todo') {
        const firstActive = todos.find((t) => !t.completed)
        if (firstActive) {
          setEditingId(firstActive.id)
          setEditingText(firstActive.text)
        }
      }
    }
    window.addEventListener('shortcut:focus-todo', handleShortcut)
    window.addEventListener('shortcut:edit-todo', handleShortcut)
    return () => {
      window.removeEventListener('shortcut:focus-todo', handleShortcut)
      window.removeEventListener('shortcut:edit-todo', handleShortcut)
    }
  }, [todos, pulseElement])

  // 防止重复点击删除
  const deletingIds = useRef<Set<string>>(new Set())

  // 删除待办：GSAP 收缩淡出动画 → 移除 → 显示 Toast 撤销提示
  const handleDelete = (id: string) => {
    if (deletingIds.current.has(id)) return // 防止重复触发
    const todo = todos.find((t) => t.id === id)
    if (!todo) return

    deletingIds.current.add(id)
    const el = itemRefs.current.get(id)

    // 备份待办数据，供撤销时恢复
    const snapshot = { text: todo.text, completed: todo.completed }

    const doRemove = () => {
      deleteTodo(id)
      deletingIds.current.delete(id)
      showToast({
        message: `已删除「${snapshot.text.slice(0, 10)}${snapshot.text.length > 10 ? '...' : ''}」`,
        showUndo: true,
        onUndo: () => {
          // 撤销：重新添加到 store 并恢复完成状态
          const store = useDashboardStore.getState()
          store.addTodo(snapshot.text)
          if (snapshot.completed) {
            const restored = store.todos[store.todos.length - 1]
            if (restored) store.toggleTodo(restored.id)
          }
        },
      })
    }

    if (el) {
      // GSAP 收缩淡出动画
      el.style.overflow = 'hidden'
      gsap.to(el, {
        opacity: 0,
        height: 0,
        paddingTop: 0,
        paddingBottom: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: doRemove,
      })
    } else {
      doRemove()
    }
  }

  // --- 拖拽排序状态 ---
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  // 拖拽开始：记录被拖拽的待办 ID
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDragId(id)
    e.dataTransfer.effectAllowed = 'move'
    // 设置拖拽时的半透明预览
    const el = e.currentTarget as HTMLElement
    requestAnimationFrame(() => { el.style.opacity = '0.4' })
  }

  // 拖拽经过：标记当前悬停目标
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (id !== dragId) setDragOverId(id)
  }

  // 拖拽离开：清除悬停标记
  const handleDragLeave = () => {
    setDragOverId(null)
  }

  // 放置：交换两个待办的位置 + GSAP 落地动画
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (dragId && dragId !== targetId) {
      reorderTodos(dragId, targetId)
      // 等待 React 重渲染后对移动项播放落地脉冲
      requestAnimationFrame(() => {
        const el = itemRefs.current.get(dragId)
        if (el) {
          gsap.fromTo(el,
            { scale: 1.04, boxShadow: '0 0 0 0 rgba(212,165,165,0)' },
            { scale: 1, boxShadow: '0 0 0 10px rgba(212,165,165,0)', duration: 0.3, ease: 'power2.out' }
          )
        }
      })
    }
    setDragId(null)
    setDragOverId(null)
  }

  // 拖拽结束（未放置或取消）：恢复透明度
  const handleDragEnd = (e: React.DragEvent) => {
    const el = e.currentTarget as HTMLElement
    el.style.opacity = '1'
    setDragId(null)
    setDragOverId(null)
  }

  const handleAdd = () => {
    if (!inputValue.trim()) return
    addTodo(inputValue)
    setInputValue('')
  }

  return (
    <div className="card p-5 h-full flex flex-col">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
          <ClipboardList size={20} className="text-warm-orange" />
          待办事项
        </h2>
        <div className="flex items-center gap-2">
          {/* 月度趋势图标按钮 */}
          <button
            onClick={() => setShowTrend(true)}
            className="p-1.5 rounded-lg hover:bg-notebook-bg dark:hover:bg-white/8 text-text-secondary hover:text-warm-orange transition-colors"
            title="月度趋势"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="4" strokeWidth="1.5" />
              <polyline points="7,15 10,10 13,13 17,7" />
            </svg>
          </button>
          {/* 筛选标签 */}
          <div className="flex bg-notebook-bg rounded-lg p-0.5">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  filter === tab.key
                    ? 'bg-white text-warm-orange shadow-sm font-medium'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 进度统计 */}
      {todos.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-text-secondary mb-1.5">
            <span>已完成 {stats.done}/{stats.total} 项</span>
            <span className="font-medium text-warm-green">{stats.percent}%</span>
          </div>
          <div className="h-1.5 bg-[rgb(var(--check-undone))] rounded-full overflow-hidden">
            <div
              className="h-full bg-warm-green rounded-full transition-all duration-500 ease-out"
              style={{ width: `${stats.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* 添加输入 */}
      <div className="flex items-center gap-2 mb-3">
        <input
          id="todo-input"
          ref={todoInputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="添加新的待办..."
          className="flex-1 px-3 py-2 text-sm border border-border-light rounded-xl outline-none focus:border-warm-orange bg-notebook-bg/50 text-text-primary placeholder-text-light"
        />
        <button
          onClick={handleAdd}
          className="flex items-center justify-center w-9 h-9 bg-warm-orange text-white rounded-xl hover:opacity-90 transition-opacity shrink-0"
          title="添加"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* 列表 —— 超过 5 条出现滚动条 */}
      <div className="max-h-[260px] overflow-y-auto custom-scrollbar -mx-1 px-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-text-light">
            <CheckCirclePlaceholder />
            <span className="text-sm mt-3">
              {filter === 'completed' ? '还没有完成的事项' : '今天没有什么待办，休息一下吧'}
            </span>
          </div>
        ) : (
          <ul className="space-y-1">
            {filtered.map((todo) => (
              <li
                key={todo.id}
                ref={(el) => { if (el) itemRefs.current.set(todo.id, el) }}
                draggable={editingId !== todo.id}
                onDragStart={(e) => handleDragStart(e, todo.id)}
                onDragOver={(e) => handleDragOver(e, todo.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, todo.id)}
                onDragEnd={handleDragEnd}
                className={`group flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-notebook-bg/60 dark:hover:bg-white/5 transition-colors cursor-grab active:cursor-grabbing ${
                  dragOverId === todo.id ? 'border-t-2 border-[rgb(var(--accent-primary))] -mt-[2px]' : 'border-t-2 border-transparent'
                } ${
                  dragId === todo.id ? 'opacity-40' : todo.completed ? 'opacity-60' : ''
                }`}
              >
                {/* 拖拽手柄：hover 时显示 */}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 cursor-grab text-text-light hover:text-text-secondary">
                  <GripVertical size={14} />
                </span>
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`flex items-center justify-center w-5 h-5 rounded-md border-2 shrink-0 transition-all duration-200 ${
                    todo.completed
                      ? 'bg-warm-orange border-warm-orange'
                      : 'border-[rgb(var(--check-undone))] hover:border-warm-orange'
                  }`}
                >
                  {todo.completed && <Check size={12} className="text-white" />}
                </button>

                {editingId === todo.id ? (
                  <div className="flex items-center gap-1 flex-1">
                    <input
                      type="text" value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') editTodo(todo.id, editingText); setEditingId(null); if (e.key === 'Escape') setEditingId(null) }}
                      className="flex-1 px-2 py-0.5 text-sm border border-warm-orange rounded-lg outline-none bg-white text-text-primary"
                      autoFocus
                    />
                    <button onClick={() => { editTodo(todo.id, editingText); setEditingId(null) }} className="p-1 text-warm-green hover:bg-green-50 dark:hover:bg-green-900/20 rounded"><Check size={14} /></button>
                    <button onClick={() => setEditingId(null)} className="p-1 text-text-light hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><X size={14} /></button>
                  </div>
                ) : (
                  <span
                    className={`flex-1 text-sm cursor-pointer select-none ${todo.completed ? 'line-through text-text-light' : 'text-text-primary'}`}
                    onDoubleClick={() => { setEditingId(todo.id); setEditingText(todo.text) }}
                    title="双击编辑"
                  >
                    {todo.text}
                  </span>
                )}

                {editingId !== todo.id && (
                  <>
                    {/* 提醒按钮 */}
                    {!todo.completed && (
                      <div className="relative">
                        <button
                          onClick={() => {
                            if (reminderId === todo.id) { setReminderId(null); return }
                            setReminderId(todo.id)
                            setReminderTime(todo.reminderAt || '')
                          }}
                          className={`p-1 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
                            todo.reminderAt
                              ? 'text-warm-orange hover:bg-warm-orange/10'
                              : 'text-text-light hover:text-warm-orange hover:bg-warm-orange/10'
                          }`}
                          title={todo.reminderAt ? `提醒：${todo.reminderAt}` : '设置提醒'}
                        >
                          {todo.reminderAt ? <BellRing size={14} /> : <Bell size={14} />}
                        </button>

                        {/* 时间选择器 */}
                        {reminderId === todo.id && (
                          <div
                            className="absolute right-0 top-full mt-1 p-2 rounded-xl border shadow-lg z-20 flex items-center gap-1.5 bg-white dark:bg-[rgb(var(--bg-card))]"
                            style={{ borderColor: 'rgb(var(--border-light))' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="time"
                              value={reminderTime}
                              onChange={(e) => setReminderTime(e.target.value)}
                              className="w-24 px-2 py-1 text-xs border rounded-lg outline-none focus:border-warm-orange bg-notebook-bg/50 text-text-primary"
                              style={{ borderColor: 'rgb(var(--border-light))' }}
                            />
                            <button
                              onClick={() => {
                                setTodoReminder(todo.id, reminderTime || null)
                                setReminderId(null)
                              }}
                              className="px-2 py-1 text-xs bg-warm-orange text-white rounded-lg hover:opacity-90"
                            >
                              确定
                            </button>
                            <button
                              onClick={() => {
                                setTodoReminder(todo.id, null)
                                setReminderId(null)
                              }}
                              className="p-1 text-text-light hover:text-red-400 rounded"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 删除按钮 */}
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="p-1 rounded-lg text-text-light hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 月度趋势弹窗 */}
      <MonthlyTrend open={showTrend} onClose={() => setShowTrend(false)} />
    </div>
  )
}

/** 空状态占位图标 */
function CheckCirclePlaceholder() {
  return (
    <svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-40">
      <circle cx="24" cy="24" r="20" />
      <path d="M16 24c0 0 4 6 8 6s8-10 8-10" />
    </svg>
  )
}
