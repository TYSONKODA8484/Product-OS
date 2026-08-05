import React, { useState, useMemo, useEffect } from 'react'
import { usePackStore, TAG_DEFS, SHEETS } from '../../store/packStore'
import type { PackRow } from '../../store/packStore'
import { useToast } from '../../components/ui/Toast'
import { I } from '../../components/ui/Icon'

const TAG_MAP = Object.fromEntries(TAG_DEFS.map(t => [t.id, t]))

function InlineText({ value, onSave, placeholder = '', tag }: {
  value: string; onSave: (v: string) => void; placeholder?: string; tag: { bg: string; border: string } | null
}) {
  const [edit, setEdit] = useState(false)
  const [v, setV] = useState(value)
  const commit = (e?: React.SyntheticEvent) => {
    e?.stopPropagation()
    setEdit(false)
    if (v !== value) onSave(v)
  }
  if (edit) {
    return (
      <input autoFocus value={v}
             onClick={e => e.stopPropagation()}
             onChange={e => setV(e.target.value)}
             onBlur={commit}
             onKeyDown={e => { if (e.key === 'Enter') commit(e); if (e.key === 'Escape') { setEdit(false); setV(value) } }}
             className="sheet-input"/>
    )
  }
  return (
    <div className="sheet-textval" onClick={e => { e.stopPropagation(); setEdit(true) }}
         style={{color: value ? '' : 'var(--text-subtle)', textDecoration: tag ? 'underline' : 'none', textDecorationColor: 'rgba(0,0,0,0.18)', textDecorationThickness: '1px'}}>
      {value || placeholder || ' '}
    </div>
  )
}

function InlineNum({ value, onSave }: { value: number | null; onSave: (v: number | null) => void }) {
  const [edit, setEdit] = useState(false)
  const [v, setV] = useState<string>(value != null ? String(value) : '')
  const commit = (e?: React.SyntheticEvent) => {
    e?.stopPropagation()
    setEdit(false)
    const n = v === '' ? null : Number(v)
    if (n !== value) onSave(n)
  }
  if (edit) {
    return (
      <input autoFocus type="number" value={v}
             onClick={e => e.stopPropagation()}
             onChange={e => setV(e.target.value)}
             onBlur={commit}
             onKeyDown={e => { if (e.key === 'Enter') commit(e); if (e.key === 'Escape') setEdit(false) }}
             className="sheet-input num"/>
    )
  }
  return (
    <div className="sheet-textval center" onClick={e => { e.stopPropagation(); setEdit(true) }}
         style={{color: value == null ? 'var(--text-subtle)' : ''}}>
      {value == null ? '—' : value}
    </div>
  )
}

function LiveSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const cls = value === 'Yes' ? 'live-yes' : value === 'No' ? 'live-no' : value === 'Pending' ? 'live-pending' : 'live-empty'
  return (
    <select className={`live-pill ${cls}`} value={value} onClick={e => e.stopPropagation()}
            onChange={e => onChange(e.target.value)}>
      <option value="">—</option>
      <option value="Yes">Yes</option>
      <option value="No">No</option>
      <option value="Pending">Pending</option>
    </select>
  )
}

function CellCheckbox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <span className="cellchk" onClick={e => { e.stopPropagation(); onChange(!checked) }}>
      <span className={`box ${checked ? 'on' : ''}`}>
        {checked && <I.Check size={11}/>}
      </span>
    </span>
  )
}

function PackEditDrawer({ row, onClose, onUpdate }: { row: PackRow; onClose: () => void; onUpdate: (patch: Partial<PackRow>) => void }) {
  const toast = useToast()
  const update = (patch: Partial<PackRow>) => { onUpdate(patch) }
  return (
    <>
      <div className="drawer-overlay" onClick={onClose}/>
      <div className="drawer">
        <div className="modal-head">
          <div>
            <h3>{row.name}</h3>
            <div style={{fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2}}>
              <span className="mono">{row.id}</span> · {row.cat}
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><I.X/></button>
        </div>
        <div style={{padding: '20px 22px', flex: 1, overflow: 'auto'}}>
          <div className="field">
            <label className="label">Product name</label>
            <input className="input" value={row.name} onChange={e => update({ name: e.target.value })}/>
          </div>
          <div className="row gap-12">
            <div className="field" style={{flex: 1}}>
              <label className="label">Model ID</label>
              <input className="input" type="number" value={row.mid ?? ''} onChange={e => update({ mid: e.target.value === '' ? null : Number(e.target.value) })}/>
            </div>
            <div className="field" style={{flex: 1}}>
              <label className="label">Live</label>
              <select className="select" value={row.live} onChange={e => update({ live: e.target.value })}>
                <option value="">—</option>
                <option>Yes</option><option>No</option><option>Pending</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label className="label">Status tag</label>
            <div className="row" style={{gap: 6, flexWrap: 'wrap'}}>
              <button className="tag-swatch sm" onClick={() => update({ tag: null })}
                      style={{background: 'var(--bg)', borderStyle: 'dashed'}}
                      title="No tag"/>
              {TAG_DEFS.map(t => (
                <button key={t.id}
                        onClick={() => update({ tag: t.id })}
                        title={t.label}
                        className="tag-swatch sm"
                        style={{background: t.bg, borderColor: row.tag === t.id ? 'var(--text)' : t.border, borderWidth: row.tag === t.id ? 2 : 1}}/>
              ))}
            </div>
          </div>
          <div className="row gap-12">
            <div className="field" style={{flex: 1}}>
              <label className="checkbox"><input type="checkbox" checked={row.photo} onChange={e => update({ photo: e.target.checked })}/> Photo ready</label>
            </div>
            <div className="field" style={{flex: 1}}>
              <label className="checkbox"><input type="checkbox" checked={row.video} onChange={e => update({ video: e.target.checked })}/> Video ready</label>
            </div>
          </div>
          <div className="field">
            <label className="label">Link</label>
            <input className="input" placeholder="https://…" value={row.link} onChange={e => update({ link: e.target.value })}/>
          </div>
          <div className="field">
            <label className="label">Comment</label>
            <textarea className="textarea" value={row.comment} onChange={e => update({ comment: e.target.value })} placeholder="Optional note…"/>
          </div>
        </div>
        <div className="modal-foot">
          <div style={{flex: 1, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)'}}>
            <I.Check size={12} style={{color: 'var(--teal)'}}/> Auto-saving
          </div>
          <button className="btn primary" onClick={() => { toast('Saved'); onClose() }}>Done</button>
        </div>
      </div>
    </>
  )
}

export function Pack() {
  const { rows, updateRow, fetchRows } = usePackStore()
  const toast = useToast()
  const [sheetId, setSheetId] = useState('product')

  useEffect(() => { fetchRows() }, [])
  const [q, setQ] = useState('')
  const [tagFilter, setTagFilter] = useState<string[]>([])
  const [editId, setEditId] = useState<string | null>(null)

  const filtered = rows.filter(r => {
    if (q && !`${r.name} ${r.cat} ${r.id} ${r.comment}`.toLowerCase().includes(q.toLowerCase())) return false
    if (tagFilter.length && !tagFilter.includes(r.tag ?? '')) return false
    return true
  })

  const groups = useMemo(() => {
    const m: Array<{ cat: string; catTotal: number; items: PackRow[] }> = []
    let last: { cat: string; catTotal: number; items: PackRow[] } | null = null
    filtered.forEach(r => {
      if (!last || last.cat !== r.cat) {
        last = { cat: r.cat, catTotal: r.catTotal, items: [r] }
        m.push(last)
      } else {
        last.items.push(r)
      }
    })
    return m
  }, [filtered])

  const totalLive = rows.filter(r => r.live === 'Yes').length
  const totalTagged = rows.filter(r => r.tag).length

  return (
    <div className="content" style={{padding: '12px 24px 24px'}}>
      <div className="row" style={{justifyContent: 'space-between', marginBottom: 10}}>
        <div className="row gap-12">
          <h1 style={{fontSize: 18, fontWeight: 600, margin: 0, letterSpacing: '-0.01em'}}>Pack Dashboard</h1>
          <span style={{fontSize: 12, color: 'var(--text-muted)'}}>
            {filtered.length} of {rows.length} · {totalLive} live · {totalTagged} tagged
          </span>
        </div>
        <div className="row" style={{gap: 6}}>
          <button className="btn ghost sm"><I.Download size={13}/> Export</button>
          <button className="btn primary sm"><I.Plus size={13}/> Add row</button>
        </div>
      </div>

      <div className="sheet-tabs">
        {SHEETS.map(s => (
          <button key={s.id}
                  className={`sheet-tab ${sheetId === s.id ? 'active' : ''}`}
                  onClick={() => { setSheetId(s.id); toast(`Opened "${s.label}"`) }}>
            {s.label}
            {s.count > 0 && <span className="sheet-count">{s.count}</span>}
          </button>
        ))}
      </div>

      <div className="sheet-toolbar">
        <div className="search-box" style={{width: 280, padding: '4px 9px'}}>
          <I.Search size={13}/>
          <input placeholder="Search category, product, model id…" value={q} onChange={e => setQ(e.target.value)}/>
        </div>
        <div className="tb-divider"/>
        <span style={{fontSize: 11, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600}}>Filter by tag</span>
        <div className="row" style={{gap: 4}}>
          {TAG_DEFS.map(t => {
            const on = tagFilter.includes(t.id)
            return (
              <button key={t.id}
                      onClick={() => setTagFilter(arr => on ? arr.filter(x => x !== t.id) : [...arr, t.id])}
                      title={t.label}
                      className="tag-swatch"
                      style={{
                        background: t.bg,
                        borderColor: on ? 'var(--text)' : t.border,
                        opacity: tagFilter.length === 0 || on ? 1 : 0.4,
                      }}/>
            )
          })}
          {tagFilter.length > 0 && <button className="btn ghost sm" onClick={() => setTagFilter([])} style={{padding: '2px 6px'}}>Clear</button>}
        </div>
        <div style={{flex: 1}}/>
        <span style={{fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5}}>
          <I.Check size={12} style={{color: 'var(--teal)'}}/> Auto-saving
        </span>
      </div>

      <div className="sheet-wrap">
        <table className="sheet-table">
          <thead>
            <tr>
              <th style={{width: 44}} className="rownum"/>
              <th style={{width: 170}}>Category</th>
              <th style={{width: 240}}>Product</th>
              <th style={{width: 80}}>Model ID</th>
              <th style={{width: 90}}>Live</th>
              <th style={{width: 60}} className="center">Photo</th>
              <th style={{width: 60}} className="center">Video</th>
              <th style={{width: 60}} className="center">Link</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g, gi) => (
              <React.Fragment key={g.cat + gi}>
                {g.items.map((r, ri) => {
                  const tag = r.tag ? TAG_MAP[r.tag] : null
                  const rowBg = tag ? tag.bg : 'transparent'
                  const overallIdx = groups.slice(0, gi).reduce((sum, gg) => sum + gg.items.length, 0) + ri + 1
                  return (
                    <tr key={r.id} className="sheet-row" onClick={() => setEditId(r.id)}
                        style={{background: rowBg}}>
                      <td className="rownum">{overallIdx}</td>
                      {ri === 0 ? (
                        <td className="cat-cell" rowSpan={g.items.length}>
                          <div className="cat-name">{g.cat}</div>
                          <div className="cat-total">({g.catTotal})</div>
                        </td>
                      ) : null}
                      <td className="prod-cell">
                        <InlineText value={r.name}
                                    onSave={v => { updateRow(r.id, { name: v }); toast('Saved') }}
                                    tag={tag}/>
                      </td>
                      <td className="mono mid-cell">
                        <InlineNum value={r.mid} onSave={v => { updateRow(r.id, { mid: v }); toast('Saved') }}/>
                      </td>
                      <td>
                        <LiveSelect value={r.live} onChange={v => { updateRow(r.id, { live: v }); toast('Updated') }}/>
                      </td>
                      <td className="center">
                        <CellCheckbox checked={r.photo} onChange={v => updateRow(r.id, { photo: v })}/>
                      </td>
                      <td className="center">
                        <CellCheckbox checked={r.video} onChange={v => updateRow(r.id, { video: v })}/>
                      </td>
                      <td className="center">
                        {r.link
                          ? <a href="#" onClick={e => e.stopPropagation()} className="link-icon-cell" title={r.link}><I.External size={13}/></a>
                          : <span style={{color: 'var(--text-subtle)', fontSize: 14, opacity: 0.4}}>—</span>}
                      </td>
                      <td className="comment-cell">
                        <InlineText value={r.comment} placeholder=""
                                    onSave={v => { updateRow(r.id, { comment: v }); toast('Saved') }}
                                    tag={null}/>
                      </td>
                    </tr>
                  )
                })}
              </React.Fragment>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9}>
                <div className="empty"><I.Search size={28}/><div className="e-title">Nothing matches</div><div className="e-sub">Clear filters or change your search.</div></div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="tag-legend">
        <span style={{fontSize: 11, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginRight: 4}}>Color pattern</span>
        {TAG_DEFS.map(t => (
          <span key={t.id} className="tag-legend-item">
            <span className="tag-swatch sm" style={{background: t.bg, borderColor: t.border}}/>
            {t.label}
          </span>
        ))}
      </div>

      {editId && rows.find(r => r.id === editId) && (
        <PackEditDrawer
          row={rows.find(r => r.id === editId) ?? rows[0]}
          onClose={() => setEditId(null)}
          onUpdate={patch => updateRow(editId, patch)}
        />
      )}
    </div>
  )
}

