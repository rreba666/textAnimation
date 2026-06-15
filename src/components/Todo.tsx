// 待办事项卡片 —— 含进度统计 + dnd-kit 拖拽排序

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ClipboardList, Plus, Trash2, Check, X, GripVertical, Bell, BellRing, TrashIcon } from 'lucide-react'
import { format as formatDate } from 'date-fns'
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

const DATE_TABS: { key: FilterType; label: string }[] = [
  { key: 'today', label: '今日' },
  { key: 'tomorrow', label: '明日' },
  { key: 'future', label: '未来' },
]

const STATUS_TABS: { key: FilterType | 'all'; label: string }[] = [
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
  isSelected,
  onSelect,
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
  isSelected: boolean
  onSelect: () => void
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
      className={`group flex items-center gap-2 px-2 py-2 rounded-xl transition-colors cursor-pointer ${
        isSelected
          ? 'bg-[rgb(var(--accent-primary)/0.12)] ring-1 ring-[rgb(var(--accent-primary)/0.3)]'
          : 'hover:bg-notebook-bg/60 dark:hover:bg-white/5'
      }`}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return
        onSelect()
      }}
    >
      <span
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 cursor-grab active:cursor-grabbing text-text-light hover:text-text-secondary touch-none"
      >
        <GripVertical size={14} />
      </span>

      <button
        onClick={onToggle}
        className={`flex items-center justify-center w-5 h-5 rounded-md border-2 shrink-0 transition-all duration-200 ${
          todo.completed ? 'bg-warm-orange border-warm-orange' : 'border-[rgb(var(--check-undone))] hover:border-warm-orange'
        }`}
      >
        {todo.completed && <Check size={12} className="text-white" />}
      </button>

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
          className={`flex-1 text-sm cursor-pointer select-none truncate whitespace-nowrap ${todo.completed ? 'line-through text-text-light' : 'text-text-primary'}`}
          onDoubleClick={onDoubleClick}
          title="双击编辑"
        >
          {todo.text}
          {todo.dueDate && !todo.completed && (
            <span className={`ml-1.5 text-[10px] px-1 py-0.5 rounded whitespace-nowrap ${
              todo.dueDate < formatDate(new Date(), 'yyyy-MM-dd') ? 'text-red-400 bg-red-50 dark:bg-red-900/20' : 'text-text-light bg-notebook-bg'
            }`}>
              {formatDate(new Date(todo.dueDate), 'M/d')}
            </span>
          )}
        </span>
      )}

      {!isEditing && (
        <>
          {!todo.completed && (
            <div className="relative">
              <button
                onClick={(e) => {
                  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
                  onReminderClick()
                  requestAnimationFrame(() => {
                    const popup = document.getElementById('reminder-popup-portal')
                    if (popup) {
                      popup.style.left = r.left + 'px'
                      popup.style.top = (r.bottom + 4) + 'px'
                    }
                  })
                }}
                className={`p-1 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
                  todo.reminderAt ? 'text-warm-orange hover:bg-warm-orange/10' : 'text-text-light hover:text-warm-orange hover:bg-warm-orange/10'
                }`}
                title={todo.reminderAt ? `提醒：${todo.reminderAt}` : '设置提醒'}
              >
                {todo.reminderAt ? <BellRing size={14} /> : <Bell size={14} />}
              </button>
            </div>
          )}
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
  const clearCompletedTodos = useDashboardStore((s) => s.clearCompletedTodos)

  const [dateFilter, setDateFilter] = useState<FilterType>('today')
  const [statusFilter, setStatusFilter] = useState<FilterType | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [showTrend, setShowTrend] = useState(false)
  const [reminderId, setReminderId] = useState<string | null>(null)
  const [reminderTime, setReminderTime] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dueDate, setDueDate] = useState(() => formatDate(new Date(), 'yyyy-MM-dd'))

  const todayStr = formatDate(new Date(), 'yyyy-MM-dd')
  const tomorrowStr = formatDate(new Date(Date.now() + 86400000), 'yyyy-MM-dd')

  const handleDateFilter = (key: FilterType) => {
    setDateFilter(key)
    setStatusFilter(null)
    if (key === 'today') setDueDate(todayStr)
    else if (key === 'tomorrow') setDueDate(tomorrowStr)
  }

  const handleStatusFilter = (key: string) => {
    if (key === 'all') { setStatusFilter(null); setDateFilter('all'); return }
    setStatusFilter(statusFilter === key ? null : key as FilterType)
  }

  const filtered = todos.filter((t) => {
    if (statusFilter === 'active') return !t.completed
    if (statusFilter === 'completed') return t.completed
    if (dateFilter === 'today') return !t.completed && t.dueDate === todayStr
    if (dateFilter === 'tomorrow') return !t.completed && t.dueDate === tomorrowStr
    if (dateFilter === 'future') return !t.completed && t.dueDate && t.dueDate > tomorrowStr
    return true
  })

  const filteredIds = useMemo(() => filtered.map((t) => t.id), [filtered])

  const stats = useMemo(() => {
    const done = todos.filter((t) => t.completed).length
    const total = todos.length
    return { done, total, percent: total > 0 ? Math.round((done / total) * 100) : 0 }
  }, [todos])

  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map())
  const cardRef = useRef<HTMLDivElement>(null)
  const prevTodosLength = useRef(todos.length)
  const todoInputRef = useRef<HTMLInputElement>(null)

  // 点击卡片外取消选中
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setSelectedId(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // 入场动画
  useEffect(() => {
    if (todos.length > prevTodosLength.current) {
      const newCount = todos.length - prevTodosLength.current
      const newTodos = todos.slice(0, newCount)
      requestAnimationFrame(() => {
        newTodos.forEach((todo) => {
          const el = itemRefs.current.get(todo.id)
          if (el) gsap.from(el, { opacity: 0, x: -20, duration: 0.35, ease: 'power2.out' })
        })
      })
    }
    prevTodosLength.current = todos.length
  }, [todos])

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

  const deletingIds = useRef<Set<string>>(new Set())
  const handleDelete = (id: string) => {
    if (deletingIds.current.has(id)) return
    const todo = todos.find((t) => t.id === id); if (!todo) return
    deletingIds.current.add(id)
    const el = itemRefs.current.get(id)
    const snapshot = { text: todo.text, completed: todo.completed, dueDate: todo.dueDate }
    const doRemove = () => {
      deleteTodo(id); deletingIds.current.delete(id)
      showToast({
        message: `已删除「${snapshot.text.slice(0, 10)}${snapshot.text.length > 10 ? '...' : ''}」`,
        showUndo: true,
        onUndo: () => {
          const store = useDashboardStore.getState()
          store.addTodo(snapshot.text, snapshot.dueDate)
          if (snapshot.completed) {
            const r = store.todos[store.todos.length - 1]
            if (r) store.toggleTodo(r.id)
          }
        },
      })
    }
    if (el) { el.style.overflow = 'hidden'; gsap.to(el, { opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0, duration: 0.3, ease: 'power2.in', onComplete: doRemove }) }
    else doRemove()
  }

  // Delete 键删除选中
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Del') return
      if (editingId) return
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      if (selectedId) { handleDelete(selectedId); setSelectedId(null) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedId, editingId])

  const handleAdd = () => {
    if (!inputValue.trim()) return
    addTodo(inputValue.trim(), dueDate || undefined)
    setInputValue('')
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    reorderTodos(active.id as string, over.id as string)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = itemRefs.current.get(active.id as string)
        if (el) gsap.fromTo(el, { scale: 1.03 }, { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.3)' })
      })
    })
  }

  return (
    <div ref={cardRef} className="card p-5 h-full flex flex-col">
      {/* 标题栏：待办事项 + 操作按钮 + 状态标签 */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="flex items-center gap-1.5 text-lg font-semibold text-text-primary shrink-0">
          <ClipboardList size={20} className="text-warm-orange" />待办事项
        </h2>
        <div className="flex items-center gap-1">
          <div className="flex bg-notebook-bg rounded-lg p-0.5 mr-1">
            {STATUS_TABS.map((tab) => (
              <button key={tab.key} onClick={() => handleStatusFilter(tab.key)}
                className={`px-2 py-0.5 text-[11px] rounded-md transition-colors whitespace-nowrap ${
                  (tab.key === 'all' && !statusFilter) || statusFilter === tab.key
                    ? 'bg-[rgb(var(--bg-card))] text-warm-orange shadow-sm font-medium'
                    : 'text-text-secondary hover:text-text-primary'
                }`}>{tab.label}</button>
            ))}
          </div>
          <button onClick={() => setShowTrend(true)} className="p-1.5 rounded-lg hover:bg-notebook-bg dark:hover:bg-white/8 text-text-secondary hover:text-warm-orange transition-colors" title="月度趋势">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="4" strokeWidth="1.5" /><polyline points="7,15 10,10 13,13 17,7" />
            </svg>
          </button>
          {todos.some((t) => t.completed) && (
            <button
              onClick={() => {
                const count = todos.filter((t) => t.completed).length
                clearCompletedTodos()
                showToast({ message: `已清空 ${count} 条已完成待办` })
              }}
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-text-light hover:text-red-400 transition-colors"
              title="清空已完成"
            >
              <TrashIcon size={14} />
            </button>
          )}
        </div>
      </div>
      {/* 日期筛选标签 */}
      <div className="flex bg-notebook-bg rounded-lg p-0.5 mb-3 w-fit">
        {DATE_TABS.map((tab) => (
          <button key={tab.key} onClick={() => handleDateFilter(tab.key)} className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap ${dateFilter === tab.key && !statusFilter ? 'bg-[rgb(var(--bg-card))] text-warm-orange shadow-sm font-medium' : 'text-text-secondary hover:text-text-primary'}`}>{tab.label}</button>
        ))}
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

      {/* 日期选择 + 输入 + 添加 */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
          className="w-[120px] px-2 py-1.5 text-xs border border-border-light rounded-lg outline-none focus:border-warm-orange bg-notebook-bg/50 text-text-primary"
          style={{ colorScheme: 'var(--color-scheme, auto)' }} />
      </div>
      <div className="flex items-center gap-1.5 mb-3">
        <input id="todo-input" ref={todoInputRef} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="添加待办..." className="flex-1 min-w-0 px-2.5 py-1.5 text-sm border border-border-light rounded-xl outline-none focus:border-warm-orange bg-notebook-bg/50 text-text-primary placeholder-text-light" />
        <button onClick={handleAdd} className="flex items-center justify-center w-8 h-8 bg-warm-orange text-white rounded-xl hover:opacity-90 transition-opacity shrink-0" title="添加"><Plus size={16} /></button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filteredIds} strategy={rectSortingStrategy}>
          <div className="max-h-[260px] overflow-y-auto custom-scrollbar -mx-1 px-1">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-text-light">
                <CheckCirclePlaceholder />
                <span className="text-sm mt-3">
                  {statusFilter === 'completed' ? (
                    '还没有完成的事项'
                  ) : dateFilter === 'today' ? (
                    <>
                      <span className="block">歇一歇，也是待办的一种。</span>
                      <span className="text-xs mt-1 opacity-60">今日已完成：好好休息</span>
                    </>
                  ) : dateFilter === 'tomorrow' ? (
                    <>
                      <span className="block">明天还空着，可以到时候再说。</span>
                      <span className="text-xs mt-1 opacity-60">未雨绸缪很好，但不急也很好</span>
                    </>
                  ) : (
                    '还没有待办，点击添加开始吧'
                  )}
                </span>
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
                    isSelected={selectedId === todo.id}
                    onSelect={() => setSelectedId(selectedId === todo.id ? null : todo.id)}
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

      {reminderId && createPortal(
        <div className="fixed inset-0 z-[79]" onClick={() => setReminderId(null)} />,
        document.body
      )}
      {reminderId && createPortal(
        <div id="reminder-popup-portal" className="fixed p-2 rounded-xl border shadow-lg z-[80] flex items-center gap-1.5 bg-white dark:bg-[rgb(var(--bg-card))]"
          style={{ borderColor: 'rgb(var(--border-light))' }}
          onClick={(e) => e.stopPropagation()}>
          <input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)}
            className="w-24 px-2 py-1 text-xs border rounded-lg outline-none focus:border-warm-orange bg-notebook-bg/50 text-text-primary"
            style={{ borderColor: 'rgb(var(--border-light))' }} />
          <button onClick={() => { setTodoReminder(reminderId, reminderTime || null); setReminderId(null) }}
            className="px-2 py-1 text-xs bg-warm-orange text-white rounded-lg hover:opacity-90">确定</button>
          <button onClick={() => { setTodoReminder(reminderId, null); setReminderId(null) }}
            className="p-1 text-text-light hover:text-red-400 rounded"><X size={12} /></button>
        </div>,
        document.body
      )}

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
