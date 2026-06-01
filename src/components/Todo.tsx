// 待办事项卡片 —— 含进度统计

import { useState, useMemo } from 'react'
import { ClipboardList, Plus, Trash2, Check, X } from 'lucide-react'
import { useDashboardStore } from '../store/useDashboardStore'
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

  const [filter, setFilter] = useState<FilterType>('all')
  const [inputValue, setInputValue] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')

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
                className={`group flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-notebook-bg/60 transition-colors ${
                  todo.completed ? 'opacity-60' : ''
                }`}
              >
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
                    <button onClick={() => { editTodo(todo.id, editingText); setEditingId(null) }} className="p-1 text-warm-green hover:bg-green-50 rounded"><Check size={14} /></button>
                    <button onClick={() => setEditingId(null)} className="p-1 text-text-light hover:bg-red-50 rounded"><X size={14} /></button>
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
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-1 rounded-lg text-text-light hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
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
