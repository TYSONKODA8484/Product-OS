import { useState } from 'react'
import { useNotesStore } from '../../store/notesStore'
import { I } from '../../components/ui/Icon'

export function Notes() {
  const { notes, updateNote, newNote, deleteNote } = useNotesStore()
  const [selId, setSelId] = useState<string | null>(notes[0]?.id || null)
  const [q, setQ] = useState('')

  const filtered = notes.filter(n => !q || n.title.toLowerCase().includes(q.toLowerCase()) || n.body.toLowerCase().includes(q.toLowerCase()))
  const sel = notes.find(n => n.id === selId)

  const handleUpdate = (id: string, body: string) => {
    updateNote(id, body)
  }

  const handleNew = () => {
    const id = newNote()
    setSelId(id)
  }

  const handleDelete = (id: string) => {
    const rest = notes.filter(n => n.id !== id)
    if (id === selId) setSelId(rest[0]?.id || null)
    deleteNote(id)
  }

  const relTime = (ts: number) => {
    const diff = Date.now() - ts
    if (diff < 60_000) return 'just now'
    if (diff < 3600_000) return Math.floor(diff/60_000) + 'm ago'
    if (diff < 86400_000) return Math.floor(diff/3600_000) + 'h ago'
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="content no-pad" style={{padding: 0}}>
      <div className="notes-shell">
        <aside className="notes-left">
          <button className="btn primary" onClick={handleNew} style={{justifyContent: 'center'}}>
            <I.Plus size={14}/> New note
          </button>
          <div className="search-box" style={{width: '100%'}}>
            <I.Search size={13}/>
            <input placeholder="Search notes…" value={q} onChange={e => setQ(e.target.value)}/>
          </div>
          <div className="notes-list">
            {filtered.length === 0 && (
              <div className="empty" style={{padding: '30px 16px'}}>
                <I.Note size={26}/>
                <div className="e-title">No notes</div>
                <div className="e-sub">Click "New note" to start</div>
              </div>
            )}
            {filtered.map(n => (
              <div key={n.id} className={`note-item ${selId === n.id ? 'active' : ''}`} onClick={() => setSelId(n.id)}>
                <div className="ntitle">{n.title || 'Untitled'}</div>
                <div className="npreview">{(n.body.split('\n')[1] || '').trim() || 'No additional text'}</div>
                <div className="ndate">{relTime(n.updated)}</div>
                <div className="ndel" onClick={e => { e.stopPropagation(); handleDelete(n.id) }}>
                  <I.X size={11}/>
                </div>
              </div>
            ))}
          </div>
        </aside>
        <section className="notes-right">
          {sel ? (
            <>
              <div className="note-editor-head">
                <div>
                  <div style={{fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em'}}>{sel.title || 'Untitled'}</div>
                  <div style={{fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2}}>Last edited {relTime(sel.updated)}</div>
                </div>
                <div className="row">
                  <span className="note-saved-tag">
                    <I.Check size={12} style={{color: 'var(--teal)'}}/> Saved
                  </span>
                  <button className="icon-btn"><I.Copy size={14}/></button>
                  <button className="icon-btn" onClick={() => handleDelete(sel.id)}><I.Trash size={14}/></button>
                </div>
              </div>
              <div className="note-editor-body">
                <textarea value={sel.body} placeholder="Start typing your note…" onChange={e => handleUpdate(sel.id, e.target.value)}/>
              </div>
            </>
          ) : (
            <div className="empty" style={{margin: 'auto'}}>
              <I.Note size={36}/>
              <div className="e-title">No note selected</div>
              <div className="e-sub">Pick a note from the sidebar or create a new one.</div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
