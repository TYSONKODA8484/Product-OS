import { useState } from 'react'
import { useLinksStore } from '../../store/linksStore'
import type { Link } from '../../store/linksStore'
import { useToast } from '../../components/ui/Toast'
import { I } from '../../components/ui/Icon'

const CAT_ICONS: Record<string, React.ComponentType<{size?: number}>> = {
  Docs: I.Doc, Sheets: I.Sheet, JIRA: I.Jira, Designs: I.Design, Videos: I.Video, Other: I.Link
}
const CAT_COLORS: Record<string, [string, string]> = {
  Docs: ['var(--blue-soft)', 'var(--blue-dark)'],
  Sheets: ['var(--teal-soft)', 'var(--teal)'],
  JIRA: ['var(--blue-soft)', 'var(--blue)'],
  Designs: ['#F3E8FF', '#7C3AED'],
  Videos: ['var(--amber-soft)', 'var(--amber)'],
  Other: ['var(--gray-100)', 'var(--text-muted)'],
}

function LinkModal({ link, onClose, onSave }: { link: Partial<Link> & { name: string; url: string; cat: string }; onClose: () => void; onSave: (l: typeof link) => void }) {
  const [l, setL] = useState(link)
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{link.id ? 'Edit link' : 'Add link'}</h3>
          <button className="icon-btn" onClick={onClose}><I.X/></button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label className="label">Link name</label>
            <input className="input" autoFocus placeholder="e.g. Q3 Planning Sheet" value={l.name} onChange={e => setL({...l, name: e.target.value})}/>
          </div>
          <div className="field">
            <label className="label">URL</label>
            <input className="input" placeholder="https://…" value={l.url} onChange={e => setL({...l, url: e.target.value})}/>
          </div>
          <div className="field">
            <label className="label">Category</label>
            <div className="chip-row">
              {['Docs','Sheets','JIRA','Designs','Videos','Other'].map(c => (
                <div key={c} className={`chip ${l.cat === c ? 'active' : ''}`} onClick={() => setL({...l, cat: c})}>{c}</div>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={() => onSave(l)} disabled={!l.name.trim() || !l.url.trim()}>
            {link.id ? 'Save changes' : 'Add link'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function Links() {
  const { links, saveLink, deleteLink } = useLinksStore()
  const toast = useToast()
  const [cat, setCat] = useState('All')
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<Partial<Link> & { name: string; url: string; cat: string } | null>(null)

  const cats = ['All', 'Docs', 'Sheets', 'JIRA', 'Designs', 'Videos', 'Other']
  const filtered = links.filter(l =>
    (cat === 'All' || l.cat === cat) &&
    (!q || l.name.toLowerCase().includes(q.toLowerCase()) || l.url.toLowerCase().includes(q.toLowerCase()))
  )

  const handleSave = (l: Partial<Link> & { name: string; url: string; cat: string }) => {
    saveLink(l)
    setEditing(null)
    toast('Saved')
  }

  return (
    <div className="content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Important Links</h1>
          <p className="page-sub">{filtered.length} of {links.length} links · One place for docs, sheets, JIRA queries, designs and videos.</p>
        </div>
        <button className="btn primary" onClick={() => setEditing({ name: '', url: '', cat: 'Docs' })}>
          <I.Plus size={14}/> Add link
        </button>
      </div>

      <div className="row gap-16 mb-20" style={{justifyContent: 'space-between'}}>
        <div className="chip-row">
          {cats.map(c => (
            <div key={c} className={`chip ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>
              {c}
              {c !== 'All' && <span style={{marginLeft: 4, color: 'var(--text-subtle)', fontSize: 10.5}}>{links.filter(l => l.cat === c).length}</span>}
            </div>
          ))}
        </div>
        <div className="search-box" style={{width: 280}}>
          <I.Search size={14}/>
          <input placeholder="Search links…" value={q} onChange={e => setQ(e.target.value)}/>
        </div>
      </div>

      <div className="links-grid">
        {filtered.map(l => {
          const Ic = CAT_ICONS[l.cat] || I.Link
          const [bg, fg] = CAT_COLORS[l.cat] || CAT_COLORS.Other
          return (
            <div key={l.id} className="link-card">
              <div className="link-icon" style={{background: bg, color: fg}}>
                <Ic size={18}/>
              </div>
              <div className="link-meta">
                <div className="link-title">{l.name}</div>
                <div className="link-url">{l.url}</div>
                <div style={{marginTop: 8, display: 'flex', gap: 6, alignItems: 'center'}}>
                  <span className="badge gray">{l.cat}</span>
                  <a className="btn ghost sm" href={l.url} target="_blank" rel="noreferrer" style={{padding: '2px 6px'}}>Open <I.External size={11}/></a>
                </div>
              </div>
              <div className="link-actions">
                <button className="icon-btn" style={{width: 26, height: 26}} onClick={() => setEditing(l)}><I.Pencil size={12}/></button>
                <button className="icon-btn" style={{width: 26, height: 26}} onClick={() => { deleteLink(l.id); toast('Deleted') }}><I.Trash size={12}/></button>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="card empty" style={{gridColumn: '1 / -1'}}>
            <I.Link size={28}/>
            <div className="e-title">No links found</div>
            <div className="e-sub">Try a different category or search term.</div>
          </div>
        )}
      </div>

      {editing && (
        <LinkModal link={editing} onClose={() => setEditing(null)} onSave={handleSave}/>
      )}
    </div>
  )
}
