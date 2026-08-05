import { useState, useEffect } from 'react'
import { useDeeplinksStore, DL_APPS, DL_STATUSES } from '../../store/deeplinksStore'
import type { Deeplink } from '../../store/deeplinksStore'
import { useToast } from '../../components/ui/Toast'
import { I } from '../../components/ui/Icon'

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Active:  { bg: 'var(--teal-soft)',  color: 'var(--teal)'  },
  Draft:   { bg: 'var(--gray-100)',   color: 'var(--text-muted)' },
  Broken:  { bg: '#FEE2E2',           color: '#DC2626'      },
}

function DeeplinkModal({ dl, onClose, onSave }: {
  dl: Partial<Deeplink> & { name: string; app: string; path: string; status: Deeplink['status']; description: string; example: string }
  onClose: () => void
  onSave: (data: typeof dl) => void
}) {
  const [d, setD] = useState(dl)
  const ch = (p: Partial<typeof dl>) => setD(x => ({ ...x, ...p }))
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{dl.id ? 'Edit Deeplink' : 'Add Deeplink'}</h3>
          <button className="icon-btn" onClick={onClose}><I.X/></button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label className="label">Name <span style={{color:'var(--amber)'}}>*</span></label>
            <input className="input" autoFocus placeholder="e.g. Open Paywall" value={d.name} onChange={e => ch({ name: e.target.value })}/>
          </div>
          <div className="row gap-12">
            <div className="field" style={{flex:1}}>
              <label className="label">App</label>
              <select className="select" value={d.app} onChange={e => ch({ app: e.target.value })}>
                {DL_APPS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div className="field" style={{flex:1}}>
              <label className="label">Status</label>
              <select className="select" value={d.status} onChange={e => ch({ status: e.target.value as Deeplink['status'] })}>
                {DL_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label className="label">Path</label>
            <input className="input" placeholder="/paywall" value={d.path} onChange={e => ch({ path: e.target.value })}/>
          </div>
          <div className="field">
            <label className="label">Example deeplink</label>
            <input className="input" placeholder="appname://path" value={d.example} onChange={e => ch({ example: e.target.value })}/>
          </div>
          <div className="field">
            <label className="label">Description</label>
            <textarea className="textarea" placeholder="What does this deeplink do?" value={d.description} onChange={e => ch({ description: e.target.value })}/>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={() => onSave(d)} disabled={!d.name.trim()}>
            {dl.id ? 'Save changes' : 'Add deeplink'}
          </button>
        </div>
      </div>
    </div>
  )
}

const BLANK = { name: '', app: DL_APPS[0], path: '', status: 'Draft' as Deeplink['status'], description: '', example: '' }

export function Deeplinks() {
  const { deeplinks, loading, fetchDeeplinks, addDeeplink, updateDeeplink, deleteDeeplink } = useDeeplinksStore()
  const toast = useToast()
  const [filterApp, setFilterApp] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<(Partial<Deeplink> & typeof BLANK) | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => { fetchDeeplinks() }, [])

  const filtered = deeplinks.filter(d =>
    (filterApp === 'All' || d.app === filterApp) &&
    (filterStatus === 'All' || d.status === filterStatus) &&
    (!q || `${d.name} ${d.app} ${d.path} ${d.example}`.toLowerCase().includes(q.toLowerCase()))
  )

  const handleSave = async (data: Partial<Deeplink> & typeof BLANK) => {
    if (data.id) {
      await updateDeeplink(data.id, data)
      toast('Deeplink updated')
    } else {
      await addDeeplink(data)
      toast('Deeplink added')
    }
    setEditing(null)
  }

  const handleDelete = async (id: string) => {
    await deleteDeeplink(id)
    toast('Deleted')
  }

  const copyExample = (example: string, id: string) => {
    navigator.clipboard.writeText(example).catch(() => {})
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  const active  = deeplinks.filter(d => d.status === 'Active').length
  const draft   = deeplinks.filter(d => d.status === 'Draft').length
  const broken  = deeplinks.filter(d => d.status === 'Broken').length

  return (
    <div className="content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Deeplinks</h1>
          <p className="page-sub">Manage app deeplinks across all products. Copy and share with engineering.</p>
        </div>
        <button className="btn primary" onClick={() => setEditing(BLANK)}>
          <I.Plus size={14}/> Add deeplink
        </button>
      </div>

      <div className="kpi-row" style={{marginBottom: 20}}>
        <div className="kpi">
          <div className="l">Total deeplinks</div>
          <div className="v">{deeplinks.length}</div>
          <div className="d">across {new Set(deeplinks.map(d => d.app)).size} apps</div>
        </div>
        <div className="kpi">
          <div className="l">Active</div>
          <div className="v" style={{color:'var(--teal)'}}>{active}</div>
          <div className="d">ready to use</div>
        </div>
        <div className="kpi">
          <div className="l">Draft</div>
          <div className="v" style={{color:'var(--text-muted)'}}>{draft}</div>
          <div className="d">in progress</div>
        </div>
        <div className="kpi">
          <div className="l">Broken</div>
          <div className="v" style={{color:'#DC2626'}}>{broken}</div>
          <div className="d">need fixing</div>
        </div>
      </div>

      <div className="row gap-12" style={{marginBottom: 16, flexWrap:'wrap'}}>
        <div className="search-box" style={{width: 260}}>
          <I.Search size={13}/>
          <input placeholder="Search deeplinks…" value={q} onChange={e => setQ(e.target.value)}/>
        </div>
        <div className="chip-row">
          {['All', ...DL_APPS].map(a => (
            <div key={a} className={`chip ${filterApp === a ? 'active' : ''}`} onClick={() => setFilterApp(a)}>{a}</div>
          ))}
        </div>
        <div className="chip-row" style={{marginLeft:'auto'}}>
          {['All', ...DL_STATUSES].map(s => (
            <div key={s} className={`chip ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>{s}</div>
          ))}
        </div>
      </div>

      <div className="card" style={{padding: 0, overflow:'hidden'}}>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>
          <thead>
            <tr style={{borderBottom:'1px solid var(--border)', background:'var(--gray-50)'}}>
              {['Name','App','Path','Status','Example','Description',''].map(h => (
                <th key={h} style={{padding:'9px 14px', textAlign:'left', fontWeight:600, fontSize:11.5, color:'var(--text-muted)', letterSpacing:'0.04em'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && deeplinks.length === 0 && (
              <tr><td colSpan={7} style={{padding:32, textAlign:'center', color:'var(--text-muted)'}}>Loading…</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={7} style={{padding:32, textAlign:'center', color:'var(--text-muted)'}}>No deeplinks match. <button className="btn ghost sm" onClick={() => setEditing(BLANK)}>Add one</button></td></tr>
            )}
            {filtered.map(d => {
              const st = STATUS_STYLE[d.status]
              return (
                <tr key={d.id} style={{borderBottom:'1px solid var(--border)'}}>
                  <td style={{padding:'10px 14px', fontWeight:500}}>{d.name}</td>
                  <td style={{padding:'10px 14px'}}>{d.app}</td>
                  <td style={{padding:'10px 14px', fontFamily:'var(--mono)', fontSize:12, color:'var(--text-muted)'}}>{d.path}</td>
                  <td style={{padding:'10px 14px'}}>
                    <span style={{...st, borderRadius:99, padding:'2px 10px', fontSize:11.5, fontWeight:600}}>{d.status}</span>
                  </td>
                  <td style={{padding:'10px 14px'}}>
                    <div className="row" style={{gap:6, alignItems:'center'}}>
                      <span style={{fontFamily:'var(--mono)', fontSize:11.5, color:'var(--text-muted)', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{d.example}</span>
                      <button className="icon-btn" style={{width:24, height:24, flexShrink:0}} title="Copy" onClick={() => copyExample(d.example, d.id)}>
                        {copied === d.id ? <I.Check size={11} style={{color:'var(--teal)'}}/> : <I.Copy size={11}/>}
                      </button>
                    </div>
                  </td>
                  <td style={{padding:'10px 14px', color:'var(--text-muted)', maxWidth:220, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{d.description || '—'}</td>
                  <td style={{padding:'10px 14px'}}>
                    <div className="row" style={{gap:4}}>
                      <button className="icon-btn" style={{width:26,height:26}} onClick={() => setEditing(d)}><I.Pencil size={12}/></button>
                      <button className="icon-btn" style={{width:26,height:26}} onClick={() => handleDelete(d.id)}><I.Trash size={12}/></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <DeeplinkModal dl={editing} onClose={() => setEditing(null)} onSave={handleSave}/>
      )}
    </div>
  )
}
