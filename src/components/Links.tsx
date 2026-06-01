// 快捷链接卡片

import { useState } from 'react'
import { Link2, Plus, Trash2, ExternalLink, Globe } from 'lucide-react'
import { useDashboardStore } from '../store/useDashboardStore'

function getFaviconUrl(url: string): string {
  try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64` } catch { return '' }
}

function getDomain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
}

export default function Links() {
  const links = useDashboardStore((s) => s.links)
  const addLink = useDashboardStore((s) => s.addLink)
  const deleteLink = useDashboardStore((s) => s.deleteLink)

  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [faviconErrors, setFaviconErrors] = useState<Set<string>>(new Set())

  const handleAdd = () => {
    if (!newName.trim() || !newUrl.trim()) return
    addLink(newName, newUrl)
    setNewName(''); setNewUrl('')
    setShowAddForm(false)
  }

  return (
    <div className="card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
          <Link2 size={20} className="text-warm-pink" />
          快捷链接
        </h2>
        <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-warm-pink text-white rounded-xl hover:opacity-90 transition-opacity">
          <Plus size={14} /><span>添加</span>
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4 p-3.5 bg-notebook-bg rounded-2xl space-y-2.5 animate-[fade-in-up_0.25s_ease-out]">
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdd()} placeholder="网站名称" autoFocus
            className="w-full px-3 py-2 text-sm border border-border-light rounded-xl outline-none focus:border-warm-pink bg-notebook-card text-text-primary placeholder-text-light" />
          <input type="text" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdd()} placeholder="网址（如 github.com）"
            className="w-full px-3 py-2 text-sm border border-border-light rounded-xl outline-none focus:border-warm-pink bg-notebook-card text-text-primary placeholder-text-light" />
          <div className="flex gap-2 pt-0.5">
            <button onClick={handleAdd} className="px-4 py-1.5 text-xs bg-warm-pink text-white rounded-xl hover:opacity-90">确认</button>
            <button onClick={() => setShowAddForm(false)} className="px-4 py-1.5 text-xs text-text-secondary hover:text-text-primary rounded-xl">取消</button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar -mx-1 px-1">
        {links.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-text-light">
            <ExternalLink size={40} strokeWidth={1.5} className="mb-3 opacity-30" />
            <span className="text-sm">添加常用链接，快速访问</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {links.map((link) => {
              const domain = getDomain(link.url)
              const faviconUrl = getFaviconUrl(link.url)
              const showFallback = !faviconUrl || faviconErrors.has(link.url)

              return (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="group flex items-center gap-3 p-3 rounded-2xl bg-notebook-bg/50 hover:bg-notebook-bg dark:hover:bg-white/8 hover:shadow-sm transition-all duration-200 hover:-translate-y-0.5 relative"
                  title={`${link.name}\n${domain}`}>
                  <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center bg-notebook-card overflow-hidden">
                    {showFallback ? <Globe size={18} className="text-text-light" /> :
                      <img src={faviconUrl} alt="" width={24} height={24} className="w-6 h-6" onError={() => setFaviconErrors((p) => new Set(p).add(link.url))} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary leading-tight break-words">{link.name}</div>
                    <div className="text-xs text-text-light mt-0.5 truncate">{domain}</div>
                  </div>
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteLink(link.id) }}
                    className="absolute top-1.5 right-1.5 p-1 rounded-lg text-text-light hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={13} />
                  </button>
                </a>
              )
            })}
          </div>
        )}
      </div>
      {links.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border-light text-xs text-text-secondary">共 {links.length} 个链接</div>
      )}
    </div>
  )
}
