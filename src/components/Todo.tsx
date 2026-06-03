// 待办事项卡片 —— 含进度统计 + dnd-kit 拖拽排序

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { ClipboardList, Plus, Trash2, Check, X, GripVertical, Bell, BellRing } from 'lucide-react'
import gsap from 'gsap'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable'
import { useDashboardStore } from '../store/useDashboardStore'
import { showToast } from './Toast'
import MonthlyTrend from './MonthlyTrend'
import AnimatedNumber from './AnimatedNumber'
import type { FilterType, Todo as TodoType } from '../types'

const FILTER_TABS: { key: FilterType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '未完成' },
  { key: 'completed', label: '已完成' },
]

// ---- 可排序待办项 ----
function SortableItem({
  todo,
  isEditing,
  editingText,
  onToggle,
  onDoubleClick,
  onEditChange,
  onEditKeyDown,
  onEditConfirm,
  onEditCancel,
  onDelete,
  reminderId,
  reminderTime,
  onReminderClick,
  onReminderConfirm,
  onReminderCancel,
  onReminderTimeChange,
  itemRefs,
}: {
  todo: TodoType
  isEditing: boolean
  editingText: string
  onToggle: () => void
  onDoubleClick: () => void
  onEditChange: (v: string) => void
  onEditKeyDown: (e: React.KeyboardEvent) => void
  onEditConfirm: () => void
  onEditCancel: () => void
  onDelete: () => void
  reminderId: string | null
  reminderTime: string
  onReminderClick: () => void
  onReminderConfirm: () => void
  onReminderCancel: () => void
  onReminderTimeChange: (v: string) => void
  itemRefs: React.MutableRefObject<Map<string, HTMLLIElement>>
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: todo.id })

  const style: React.CSSProperties = {
    // 只取 translate，忽略 scaleX/scaleY 避免挤压变形
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.3 : todo.completed ? 0.6 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <li
      ref={(el) => {
        setNodeRef(el)
        if (el) itemRefs.current.set(todo.id, el)
      }}
      style={style}
      className="group flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-notebook-bg/60 dark:hover:bg-white/5 transition-colors"
    >
      {/* 拖拽手柄 */}
      <span
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 cursor-grab active:cursor-grabbing text-text-light hover:text-text-secondary touch-none"
      >
        <GripVertical size={14} />
      </span>

      {/* 复选框 */}
      <button
        onClick={onToggle}
        className={`flex items-center justify-center w-5 h-5 rounded-md border-2 shrink-0 transition-all duration-200 ${
          todo.completed ? 'bg-warm-orange border-warm-orange' : 'border-[rgb(var(--check-undone))] hover:border-warm-orange'
        }`}
      >
        {todo.completed && <Check size={12} className="text-white" />}
      </button>

      {/* 编辑 / 显示 */}
      {isEditing ? (
        <div className="flex items-center gap-1 flex-1">
          <input
            type="text" value={editingText}
            onChange={(e) => onEditChange(e.target.value)}
            onKeyDown={onEditKeyDown}
            className="flex-1 px-2 py-0.5 text-sm border border-warm-orange rounded-lg outline-none bg-white text-text-primary"
            autoFocus
          />
          <button onClick={onEditConfirm} className="p-1 text-warm-green hover:bg-green-50 dark:hover:bg-green-900/20 rounded"><Check size={14} /></button>
          <button onClick={onEditCancel} className="p-1 text-text-light hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><X size={14} /></button>
        </div>
      ) : (
        <span
          className={`flex-1 text-sm cursor-pointer select-none ${todo.completed ? 'line-through text-text-light' : 'text-text-primary'}`}
          onDoubleClick={onDoubleClick}
          title="双击编辑"
        >
          {todo.text}
        </span>
      )}

      {/* 操作按钮 */}
      {!isEditing && (
        <>
          {/* 提醒 */}
          {!todo.completed && (
            <div className="relative">
              <button
                onClick={onReminderClick}
                className={`p-1 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
                  todo.reminderAt ? 'text-warm-orange hover:bg-warm-orange/10' : 'text-text-light hover:text-warm-orange hover:bg-warm-orange/10'
                }`}
                title={todo.reminderAt ? `提醒：${todo.reminderAt}` : '设置提醒'}
              >
                {todo.reminderAt ? <BellRing size={14} /> : <Bell size={14} />}
              </button>
              {reminderId === todo.id && (
                <div className="absolute right-0 top-full mt-1 p-2 rounded-xl border shadow-lg z-20 flex items-center gap-1.5 bg-white dark:bg-[rgb(var(--bg-card))]"
                  style={{ borderColor: 'rgb(var(--border-light))' }}
                  onClick={(e) => e.stopPropagation()}>
                  <input type="time" value={reminderTime} onChange={(e) => onReminderTimeChange(e.target.value)}
                    className="w-24 px-2 py-1 text-xs border rounded-lg outline-none focus:border-warm-orange bg-notebook-bg/50 text-text-primary"
                    style={{ borderColor: 'rgb(var(--border-light))' }} />
                  <button onClick={onReminderConfirm} className="px-2 py-1 text-xs bg-warm-orange text-white rounded-lg hover:opacity-90">确定</button>
                  <button onClick={onReminderCancel} className="p-1 text-text-light hover:text-red-400 rounded"><X size={12} /></button>
                </div>
              )}
            </div>
          )}
          {/* 删除 */}
          <button onClick={onDelete} className="p-1 rounded-lg text-text-light hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all">
            <Trash2 size={14} />
          </button>
        </>
      )}
    </li>
  )
}

// ---- 主组件 ----
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

  const filteredIds = useMemo(() => filtered.map((t) => t.id), [filtered])

  const stats = useMemo(() => {
    const done = todos.filter((t) => t.completed).length
    const total = todos.length
    return { done, total, percent: total > 0 ? Math.round((done / total) * 100) : 0 }
  }, [todos])

  // GSAP 入场动画
  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map())
  const prevTodosLength = useRef(todos.length)
  const todoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (todos.length > prevTodosLength.current) {
      const newCount = todos.length - prevTodosLength.current
      const newTodos = todos.slice(todos.length - newCount)
      requestAnimationFrame(() => {
        newTodos.forEach((todo) => {
          const el = itemRefs.current.get(todo.id)
          if (el) gsap.from(el, { opacity: 0, x: -20, duration: 0.35, ease: 'power2.out' })
        })
      })
    }
    prevTodosLength.current = todos.length
  }, [todos])

  // 快捷键脉冲
  const pulseElement = useCallback((el: HTMLElement) => {
    gsap.fromTo(el,
      { scale: 1, boxShadow: '0 0 0 0 rgba(212,165,165,0)' },
      { scale: 1.03, boxShadow: '0 0 0 6px rgba(212,165,165,0.3)', duration: 0.2, ease: 'power2.out', yoyo: true, repeat: 1 }
    )
  }, [])

  useEffect(() => {
    const handleShortcut = (e: Event) => {
      const { type } = e as CustomEvent
      if (type === 'shortcut:focus-todo') { todoInputRef.current?.focus(); if (todoInputRef.current) pulseElement(todoInputRef.current) }
      else if (type === 'shortcut:edit-todo') {
        const first = todos.find((t) => !t.completed); if (first) { setEditingId(first.id); setEditingText(first.text) }
      }
    }
    window.addEventListener('shortcut:focus-todo', handleShortcut)
    window.addEventListener('shortcut:edit-todo', handleShortcut)
    return () => { window.removeEventListener('shortcut:focus-todo', handleShortcut); window.removeEventListener('shortcut:edit-todo', handleShortcut) }
  }, [todos, pulseElement])

  // 删除
  const deletingIds = useRef<Set<string>>(new Set())
  const handleDelete = (id: string) => {
    if (deletingIds.current.has(id)) return
    const todo = todos.find((t) => t.id === id); if (!todo) return
    deletingIds.current.add(id)
    const el = itemRefs.current.get(id)
    const snapshot = { text: todo.text, completed: todo.completed }
    const doRemove = () => {
      deleteTodo(id); deletingIds.current.delete(id)
      showToast({
        message: `已删除「${snapshot.text.slice(0, 10)}${snapshot.text.length > 10 ? '...' : ''}」`,
        showUndo: true,
        onUndo: () => {
          const store = useDashboardStore.getState(); store.addTodo(snapshot.text)
          if (snapshot.completed) { const r = store.todos[store.todos.length - 1]; if (r) store.toggleTodo(r.id) }
        },
      })
    }
    if (el) { el.style.overflow = 'hidden'; gsap.to(el, { opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0, duration: 0.3, ease: 'power2.in', onComplete: doRemove }) }
    else doRemove()
  }

  const handleAdd = () => { if (!inputValue.trim()) return; addTodo(inputValue); setInputValue('') }

  // dnd-kit 传感器
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    reorderTodos(active.id as string, over.id as string)
    // GSAP 落地回弹
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = itemRefs.current.get(active.id as string)
        if (el) gsap.fromTo(el, { scale: 1.03 }, { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.3)' })
      })
    })
  }

  return (
    <div className="card p-5 h-full flex flex-col">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
          <ClipboardList size={20} className="text-warm-orange" />待办事项
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowTrend(true)} className="p-1.5 rounded-lg hover:bg-notebook-bg dark:hover:bg-white/8 text-text-secondary hover:text-warm-orange transition-colors" title="月度趋势">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="4" strokeWidth="1.5" /><polyline points="7,15 10,10 13,13 17,7" />
            </svg>
          </button>
          <div className="flex bg-notebook-bg rounded-lg p-0.5">
            {FILTER_TABS.map((tab) => (
              <button key={tab.key} onClick={() => setFilter(tab.key)} className={`px-2.5 py-1 text-xs rounded-md transition-colors ${filter === tab.key ? 'bg-white text-warm-orange shadow-sm font-medium' : 'text-text-secondary hover:text-text-primary'}`}>{tab.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* 进度统计 */}
      {todos.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-text-secondary mb-1.5">
            <span>已完成 <AnimatedNumber value={stats.done} />/<AnimatedNumber value={stats.total} /> 项</span>
            <span className="font-medium text-warm-green">{stats.percent}%</span>
          </div>
          <div className="h-1.5 bg-[rgb(var(--check-undone))] rounded-full overflow-hidden">
            <div className="h-full bg-warm-green rounded-full transition-all duration-500 ease-out" style={{ width: `${stats.percent}%` }} />
          </div>
        </div>
      )}

      {/* 添加输入 */}
      <div className="flex items-center gap-2 mb-3">
        <input id="todo-input" ref={todoInputRef} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="添加新的待办..." className="flex-1 px-3 py-2 text-sm border border-border-light rounded-xl outline-none focus:border-warm-orange bg-notebook-bg/50 text-text-primary placeholder-text-light" />
        <button onClick={handleAdd} className="flex items-center justify-center w-9 h-9 bg-warm-orange text-white rounded-xl hover:opacity-90 transition-opacity shrink-0" title="添加"><Plus size={18} /></button>
      </div>

      {/* 列表：DndContext 包裹滚动容器，无 DragOverlay（避免滚动坐标系错位） */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filteredIds} strategy={rectSortingStrategy}>
          <div className="max-h-[260px] overflow-y-auto custom-scrollbar -mx-1 px-1">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-text-light">
                <CheckCirclePlaceholder />
                <span className="text-sm mt-3">{filter === 'completed' ? '还没有完成的事项' : '今天没有什么待办，休息一下吧'}</span>
              </div>
            ) : (
              <ul className="space-y-1">
                {filtered.map((todo) => (
                  <SortableItem
                    key={todo.id}
                    todo={todo}
                    isEditing={editingId === todo.id}
                    editingText={editingText}
                    onToggle={() => toggleTodo(todo.id)}
                    onDoubleClick={() => { setEditingId(todo.id); setEditingText(todo.text) }}
                    onEditChange={setEditingText}
                    onEditKeyDown={(e) => { if (e.key === 'Enter') { editTodo(todo.id, editingText); setEditingId(null) } if (e.key === 'Escape') setEditingId(null) }}
                    onEditConfirm={() => { editTodo(todo.id, editingText); setEditingId(null) }}
                    onEditCancel={() => setEditingId(null)}
                    onDelete={() => handleDelete(todo.id)}
                    reminderId={reminderId}
                    reminderTime={reminderTime}
                    onReminderClick={() => { if (reminderId === todo.id) { setReminderId(null); return } setReminderId(todo.id); setReminderTime(todo.reminderAt || '') }}
                    onReminderConfirm={() => { setTodoReminder(todo.id, reminderTime || null); setReminderId(null) }}
                    onReminderCancel={() => { setTodoReminder(todo.id, null); setReminderId(null) }}
                    onReminderTimeChange={setReminderTime}
                    itemRefs={itemRefs}
                  />
                ))}
              </ul>
            )}
          </div>
        </SortableContext>
      </DndContext>

      <MonthlyTrend open={showTrend} onClose={() => setShowTrend(false)} />
    </div>
  )
}

function CheckCirclePlaceholder() {
  return (
    <svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-40">
      <circle cx="24" cy="24" r="20" /><path d="M16 24c0 0 4 6 8 6s8-10 8-10" />
    </svg>
  )
}
