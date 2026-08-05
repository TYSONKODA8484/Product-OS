import { useState, useEffect } from 'react'
import { useGAStore, GA_APPS, GA_PLATFORMS, GA_SCREENS } from '../../store/gaStore'
import type { GAEvent, GAParam } from '../../store/gaStore'
import { useToast } from '../../components/ui/Toast'
import { I } from '../../components/ui/Icon'

const SCREEN_COLOR: Record<string, string> = {
  Onboarding:    '#9B5DE5',
  Homepage:      '#3B82F6',
  'Entry Points':'#1D9E75',
  Generation:    '#E15D7E',
  Paywall:       '#BA7517',
}

// Inline editable cell — looks like plain text, highlights on focus
function EC({ val, onSave, mono, color, placeholder, dim, bold }: {
  val: string
  onSave: (v: string) => void
  mono?: boolean
  color?: string
  placeholder?: string
  dim?: boolean
  bold?: boolean
}) {
  const [v, setV] = useState(val)
  useEffect(() => { setV(val) }, [val])
  return (
    <input
      value={v}
      placeholder={placeholder || ''}
      onChange={e => setV(e.target.value)}
      onBlur={e => {
        e.target.style.borderBottomColor = 'transparent'
        e.target.style.background = 'transparent'
        if (v !== val) onSave(v)
      }}
      onFocus={e => {
        e.target.style.borderBottomColor = '#3B82F6'
        e.target.style.background = 'rgba(59,130,246,0.05)'
      }}
      style={{
        background: 'transparent',
        border: 'none',
        borderBottom: '1px solid transparent',
        width: '100%',
        fontFamily: mono ? 'var(--mono)' : 'inherit',
        fontSize: 'inherit',
        fontWeight: bold ? 700 : 'inherit',
        color: color || (dim ? 'var(--text-subtle)' : 'var(--text-muted)'),
        padding: '1px 2px',
        outline: 'none',
        cursor: 'text',
        minWidth: 40,
      }}
    />
  )
}

function NewEventModal({ onClose, onSave, defaultApp, defaultPlatform }: {
  onClose: () => void
  onSave: (d: Omit<GAEvent, 'id'>) => void
  defaultApp: string
  defaultPlatform: string
}) {
  const [d, setD] = useState<Omit<GAEvent, 'id'>>({
    screen: GA_SCREENS[0], trigger: '', event: '', params: [],
    app: defaultApp, platform: defaultPlatform, status: 'Pending', notes: '',
  })
  const ch = (p: Partial<typeof d>) => setD(x => ({ ...x, ...p }))
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Add GA Event</h3>
          <button className="icon-btn" onClick={onClose}><I.X/></button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label className="label">Event name <span style={{color: 'var(--amber)'}}>*</span></label>
            <input className="input" autoFocus placeholder="e.g. ActionCreation" value={d.event} onChange={e => ch({ event: e.target.value })}/>
          </div>
          <div className="row gap-12">
            <div className="field" style={{flex: 1}}>
              <label className="label">Screen</label>
              <select className="select" value={d.screen} onChange={e => ch({ screen: e.target.value })}>
                {GA_SCREENS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="field" style={{flex: 1}}>
              <label className="label">App</label>
              <select className="select" value={d.app} onChange={e => ch({ app: e.target.value })}>
                {GA_APPS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label className="label">When does it fire?</label>
            <textarea className="textarea" placeholder="e.g. User taps Get Pro button" value={d.trigger}
                      onChange={e => ch({ trigger: e.target.value })}/>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={() => { if (d.event.trim()) onSave(d) }} disabled={!d.event.trim()}>
            Add event
          </button>
        </div>
      </div>
    </div>
  )
}

export function GAImplementation() {
  const { events, loading, fetchEvents, addEvent, updateEvent, deleteEvent } = useGAStore()
  const toast = useToast()
  const [local, setLocal] = useState<GAEvent[]>([])
  const [appFilter, setAppFilter] = useState('LightX')
  const [platformFilter, setPlatformFilter] = useState('iOS')
  const [screenFilter, setScreenFilter] = useState('All')
  const [q, setQ] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => { fetchEvents() }, [])
  useEffect(() => { setLocal(events) }, [events])

  const patchLocal = (id: string, patch: Partial<GAEvent>) =>
    setLocal(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e))

  const save = (id: string, patch: Partial<GAEvent>) => {
    patchLocal(id, patch)
    updateEvent(id, patch)
  }

  const saveParam = (ev: GAEvent, idx: number, field: keyof GAParam, value: string) => {
    const newParams = (ev.params || []).map((p, i) => i === idx ? { ...p, [field]: value } : p)
    save(ev.id, { params: newParams })
  }

  const addParam = (ev: GAEvent) => {
    const newParams = [...(ev.params || []), { name: '', values: '', comment: '', apiKey: '' }]
    save(ev.id, { params: newParams })
  }

  const removeParam = (ev: GAEvent, idx: number) => {
    const newParams = (ev.params || []).filter((_, i) => i !== idx)
    save(ev.id, { params: newParams })
  }

  const filtered = local.filter(e =>
    e.app === appFilter &&
    e.platform === platformFilter &&
    (screenFilter === 'All' || e.screen === screenFilter) &&
    (!q || `${e.event} ${e.trigger} ${(e.params || []).map(p => `${p.name} ${p.values}`).join(' ')}`.toLowerCase().includes(q.toLowerCase()))
  )

  const byScreen = GA_SCREENS.map(sc => ({
    screen: sc,
    items: filtered.filter(e => e.screen === sc),
  })).filter(g => g.items.length > 0)

  return (
    <div className="content">
      <div className="page-header">
        <div>
          <h1 className="page-title">GA Events</h1>
          <p className="page-sub">{filtered.length} event{filtered.length !== 1 ? 's' : ''} · Click any cell to edit</p>
        </div>
        <button className="btn primary" onClick={() => setCreating(true)}>
          <I.Plus size={14}/> Add event
        </button>
      </div>

      {/* App + Platform context selectors */}
      <div className="card" style={{padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap'}}>
        <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
          <span style={{fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase'}}>App</span>
          <div style={{display: 'flex', gap: 6, flexWrap: 'wrap'}}>
            {GA_APPS.map(a => (
              <button key={a} onClick={() => { setAppFilter(a); setScreenFilter('All') }}
                style={{
                  padding: '4px 12px', borderRadius: 99, fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
                  border: appFilter === a ? '1.5px solid var(--blue)' : '1.5px solid var(--border)',
                  background: appFilter === a ? 'var(--blue)' : 'transparent',
                  color: appFilter === a ? '#fff' : 'var(--text-muted)',
                  transition: 'all 0.15s',
                }}>
                {a}
              </button>
            ))}
          </div>
        </div>

        <div style={{width: 1, height: 36, background: 'var(--border)', flexShrink: 0}}/>

        <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
          <span style={{fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase'}}>Platform</span>
          <div style={{display: 'flex', gap: 6}}>
            {GA_PLATFORMS.filter(p => p !== 'All').map(p => (
              <button key={p} onClick={() => { setPlatformFilter(p); setScreenFilter('All') }}
                style={{
                  padding: '4px 12px', borderRadius: 99, fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
                  border: platformFilter === p ? '1.5px solid var(--teal)' : '1.5px solid var(--border)',
                  background: platformFilter === p ? 'var(--teal)' : 'transparent',
                  color: platformFilter === p ? '#fff' : 'var(--text-muted)',
                  transition: 'all 0.15s',
                }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Screen + search filters */}
      <div className="row gap-12" style={{marginBottom: 16, alignItems: 'center', flexWrap: 'wrap'}}>
        <div className="search-box" style={{width: 240}}>
          <I.Search size={13}/>
          <input placeholder="Search events, params…" value={q} onChange={e => setQ(e.target.value)}/>
        </div>
        <div className="chip-row">
          {['All', ...GA_SCREENS].map(s => (
            <div key={s} className={`chip ${screenFilter === s ? 'active' : ''}`}
                 onClick={() => setScreenFilter(s)}>
              {s !== 'All' && (
                <span style={{width: 7, height: 7, borderRadius: '50%', background: SCREEN_COLOR[s],
                              display: 'inline-block', marginRight: 5, flexShrink: 0}}/>
              )}
              {s}
            </div>
          ))}
        </div>
      </div>

      {loading && local.length === 0 && (
        <div className="card empty" style={{color: 'var(--text-muted)', fontSize: 13}}>Loading…</div>
      )}

      {!loading && byScreen.length === 0 && (
        <div className="card empty">
          <I.Sheet size={28}/>
          <div className="e-title">No events for {appFilter} · {platformFilter}</div>
          <div className="e-sub">Add the first event or switch app / platform above.</div>
        </div>
      )}

      {byScreen.map(group => (
        <div key={group.screen} style={{marginBottom: 28}}>
          {/* Screen section header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
            paddingBottom: 8, borderBottom: `2px solid ${SCREEN_COLOR[group.screen]}30`,
          }}>
            <div style={{width: 9, height: 9, borderRadius: '50%', background: SCREEN_COLOR[group.screen]}}/>
            <span style={{fontSize: 13, fontWeight: 700, color: SCREEN_COLOR[group.screen]}}>{group.screen}</span>
            <span style={{fontSize: 12, color: 'var(--text-muted)'}}>
              {group.items.length} event{group.items.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Event cards */}
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            {group.items.map(ev => (
              <div key={ev.id} className="card" style={{padding: 0, overflow: 'hidden'}}>

                {/* Event header row */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 14px',
                  background: `${SCREEN_COLOR[group.screen]}0a`,
                  borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{flex: '0 0 auto', minWidth: 160, maxWidth: 260}}>
                    <EC
                      val={ev.event}
                      bold mono
                      color="var(--text)"
                      placeholder="event_name"
                      onSave={v => save(ev.id, { event: v })}
                    />
                  </div>
                  <span style={{color: 'var(--border)', flexShrink: 0, fontSize: 14}}>·</span>
                  <div style={{flex: 1}}>
                    <EC
                      val={ev.trigger}
                      placeholder="When does this event fire?"
                      color="var(--text-muted)"
                      onSave={v => save(ev.id, { trigger: v })}
                    />
                  </div>
                  <button
                    className="icon-btn"
                    style={{flexShrink: 0, opacity: 0.35, width: 26, height: 26}}
                    title="Delete event"
                    onClick={() => {
                      if (window.confirm(`Delete "${ev.event}"?`)) {
                        deleteEvent(ev.id)
                        toast('Deleted')
                      }
                    }}>
                    <I.Trash size={12}/>
                  </button>
                </div>

                {/* Params table */}
                {(ev.params || []).length === 0 ? (
                  <div style={{padding: '10px 14px', fontSize: 12.5, color: 'var(--text-subtle)', fontStyle: 'italic'}}>
                    No parameters defined
                  </div>
                ) : (
                  <table style={{width: '100%', borderCollapse: 'collapse', fontSize: 12.5}}>
                    <thead>
                      <tr>
                        {[
                          { label: 'PARAMETER', w: 160 },
                          { label: 'VALUES',    w: 210 },
                          { label: 'COMMENT',   w: undefined },
                          { label: 'API KEY',   w: 130 },
                          { label: '',          w: 34  },
                        ].map(h => (
                          <th key={h.label} style={{
                            padding: '6px 12px', textAlign: 'left', fontSize: 10, fontWeight: 600,
                            color: 'var(--text-subtle)', letterSpacing: '0.07em', textTransform: 'uppercase',
                            borderBottom: '1px solid var(--border)', background: 'var(--gray-50)',
                            width: h.w,
                          }}>{h.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(ev.params || []).map((p, i) => (
                        <tr key={i} style={{borderBottom: '1px solid var(--gray-100)'}}>
                          <td style={{padding: '7px 12px'}}>
                            <EC val={p.name} mono color="var(--blue)" placeholder="param_name"
                              onSave={v => saveParam(ev, i, 'name', v)}/>
                          </td>
                          <td style={{padding: '7px 12px'}}>
                            <EC val={p.values} placeholder="value1, value2…"
                              onSave={v => saveParam(ev, i, 'values', v)}/>
                          </td>
                          <td style={{padding: '7px 12px'}}>
                            <EC val={p.comment} placeholder="—" dim
                              onSave={v => saveParam(ev, i, 'comment', v)}/>
                          </td>
                          <td style={{padding: '7px 12px'}}>
                            <EC val={p.apiKey} mono color="var(--teal)" placeholder="—"
                              onSave={v => saveParam(ev, i, 'apiKey', v)}/>
                          </td>
                          <td style={{padding: '7px 8px', textAlign: 'center'}}>
                            <button className="icon-btn" style={{width: 22, height: 22, opacity: 0.3}}
                                    onClick={() => removeParam(ev, i)} title="Remove parameter">
                              <I.X size={10}/>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Add parameter */}
                <div style={{padding: '6px 12px', borderTop: '1px solid var(--border)'}}>
                  <button
                    onClick={() => addParam(ev)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      fontSize: 11.5, color: 'var(--text-muted)', background: 'none',
                      border: 'none', cursor: 'pointer', padding: '2px 0',
                    }}>
                    <I.Plus size={11}/> Add parameter
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {creating && (
        <NewEventModal
          defaultApp={appFilter}
          defaultPlatform={platformFilter}
          onClose={() => setCreating(false)}
          onSave={async d => { await addEvent(d); toast('Event added'); setCreating(false) }}
        />
      )}
    </div>
  )
}
