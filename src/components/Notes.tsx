// 快速笔记卡片 —— Markdown 编辑 + 实时预览

import { useState, useEffect, useRef, useCallback } from 'react'
import { FileText, Plus, Trash2, Eye, PenLine, Clock } from 'lucide-react'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useDashboardStore } from '../store/useDashboardStore'

export default function Notes() {
  const notes = useDashboardStore((s) => s.notes)
  const selectedNoteId = useDashboardStore((s) => s.selectedNoteId)
  const addNote = useDashboardStore((s) => s.addNote)
  const deleteNote = useDashboardStore((s) => s.deleteNote)
  const updateNote = useDashboardStore((s) => s.updateNote)
  const selectNote = useDashboardStore((s) => s.selectNote)

  const [previewMode, setPreviewMode] = useState(false)
  const [localTitle, setLocalTitle] = useState('')
  const [localContent, setLocalContent] = useState('')
  const saveTimer = useRef<ReturnType<typeof setTimeout>>()

  const selectedNote = notes.find((n) => n.id === selectedNoteId) || null

  // 选中笔记变化时重置本地状态
  useEffect(() => {
    if (selectedNote) { setLocalTitle(selectedNote.title); setLocalContent(selectedNote.content) }
    else { setLocalTitle(''); setLocalContent('') }
    setPreviewMode(false)
  }, [selectedNote?.id])

  // 自动保存（1 秒防抖）
  const autoSave = useCallback((noteId: string, title: string, content: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => { updateNote(noteId, { title, content }) }, 1000)
  }, [updateNote])

  useEffect(() => { return () => { if (saveTimer.current) clearTimeout(saveTimer.current) } }, [])

  const formatTime = (isoStr: string) => {
    const d = new Date(isoStr)
    return d.toDateString() === new Date().toDateString() ? format(d, 'HH:mm') : format(d, 'M月d日')
  }

  return (
    <div className="card p-5 h-full flex flex-col">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
          <FileText size={20} className="text-warm-orange" />
          快速笔记
        </h2>
        <button onClick={addNote} className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-warm-orange text-white rounded-xl hover:opacity-90 transition-opacity">
          <Plus size={14} /><span className="hidden sm:inline">新建</span>
        </button>
      </div>

      {/* 主内容区：左侧列表 + 右侧编辑 */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* 左侧：笔记列表 */}
        <div className="w-32 sm:w-44 shrink-0 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-text-light">
              <FileText size={28} className="mb-1 opacity-30" />
              <span className="text-xs">写下今天的灵感吧</span>
            </div>
          ) : (
            notes.map((note) => (
              <button key={note.id} onClick={() => selectNote(note.id)}
                className={`text-left p-2.5 rounded-xl transition-all duration-200 ${
                  selectedNoteId === note.id ? 'bg-warm-orange/10 border border-warm-orange/20' : 'hover:bg-notebook-bg dark:hover:bg-white/8 border border-transparent'
                }`}>
                <div className="text-xs font-medium text-text-primary truncate">{note.title || '无标题'}</div>
                <div className="flex items-center gap-1 mt-1 text-xs text-text-light">
                  <Clock size={10} /><span>{formatTime(note.updatedAt)}</span>
                </div>
                {note.content && <div className="text-xs text-text-light truncate mt-0.5">{note.content.slice(0, 25)}{note.content.length > 25 && '...'}</div>}
              </button>
            ))
          )}
        </div>

        {/* 右侧：编辑器 */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedNote ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <input type="text" value={localTitle} onChange={(e) => { setLocalTitle(e.target.value); autoSave(selectedNote.id, e.target.value, localContent) }}
                  placeholder="笔记标题"
                  className="flex-1 px-2 py-1 text-sm font-medium border border-transparent rounded-lg outline-none focus:border-border-light bg-transparent text-text-primary placeholder-text-light" />
                <div className="flex items-center gap-1 ml-2">
                  <button onClick={() => setPreviewMode(false)} className={`p-1.5 rounded-lg transition-colors ${!previewMode ? 'bg-warm-orange/10 text-warm-orange' : 'text-text-secondary hover:text-text-primary'}`} title="编辑"><PenLine size={16} /></button>
                  <button onClick={() => setPreviewMode(true)} className={`p-1.5 rounded-lg transition-colors ${previewMode ? 'bg-warm-orange/10 text-warm-orange' : 'text-text-secondary hover:text-text-primary'}`} title="预览"><Eye size={16} /></button>
                  <button onClick={(e) => { e.stopPropagation(); deleteNote(selectedNote.id) }} className="p-1.5 rounded-lg text-text-secondary hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
                {previewMode ? (
                  <div className="markdown-body p-1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{localContent || '*暂无内容*'}</ReactMarkdown>
                  </div>
                ) : (
                  <textarea value={localContent} onChange={(e) => { setLocalContent(e.target.value); autoSave(selectedNote.id, localTitle, e.target.value) }}
                    placeholder="在这里写 Markdown...&#10;&#10;## 标题&#10;- 列表项&#10;**加粗文字**"
                    className="w-full h-full resize-none px-2 py-1 text-sm border-0 outline-none bg-transparent text-text-primary placeholder-text-light leading-relaxed font-mono" />
                )}
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-light text-xs text-text-light">
                <span>支持 Markdown 语法</span>
                <span>{previewMode ? '预览模式' : '编辑中（自动保存）'}</span>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-text-light">
              <div className="text-center">
                <FileText size={40} className="mx-auto mb-2 opacity-30" />
                <span className="text-sm">选择或新建一篇笔记</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
