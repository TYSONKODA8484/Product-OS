import { useState, useMemo, useEffect } from 'react'
import { useCalendarStore } from '../../store/calendarStore'
import { useSprintsStore } from '../../store/sprintsStore'
import { useTasksStore } from '../../store/tasksStore'
import { I } from '../../components/ui/Icon'

function pad(n: number) { return n < 10 ? '0' + n : '' + n }
function isoDate(y: number, m: number, d: number) { return `${y}-${pad(m + 1)}-${pad(d)}` }

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  january: 0, february: 1, march: 2, april: 3, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
}

function etaToIso(eta: string): string | null {
  if (!eta) return null
  const s = eta.toLowerCase().trim().replace(/-/g, ' ')
  const year = new Date().getFullYear()
  const a = s.match(/^(\d{1,2})\s+([a-z]+)/)
  if (a && MONTHS[a[2]] !== undefined) return `${year}-${pad(MONTHS[a[2]] + 1)}-${pad(+a[1])}`
  const b = s.match(/^([a-z]+)\s+(\d{1,2})/)
  if (b && MONTHS[b[1]] !== undefined) return `${year}-${pad(MONTHS[b[1]] + 1)}-${pad(+b[2])}`
  return null
}

type AddForm = { date: string; title: string; type: 'global' | 'manual'; note: string }
type DayPopup = { label: string; iso: string }

type SprintEvent = { id: string; date: string; title: string; type: 'sprint'; app: string; deletable: false }
type ManualEvent = { id: string; date: string; title: string; type: 'sprint' | 'global' | 'manual' | 'task'; note?: string; deletable: true }
type AnyEvent = SprintEvent | ManualEvent

export function Calendar() {
  const { events, addEvent, deleteEvent, fetchEvents } = useCalendarStore()
  const { sprints, fetchSprints } = useSprintsStore()
  const { tasks, fetchTasks, updateTask } = useTasksStore()

  useEffect(() => { fetchEvents(); fetchSprints(); fetchTasks() }, [])

  const [cursor, setCursor] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1) })
  const [dayPopup, setDayPopup] = useState<DayPopup | null>(null)
  const [addForm, setAddForm] = useState<AddForm | null>(null)
  const [standalone, setStandalone] = useState(false)
  const today = new Date()

  const y = cursor.getFullYear()
  const m = cursor.getMonth()
  const monthName = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const first = new Date(y, m, 1)
  const startOffset = (first.getDay() + 6) % 7
  const cells: Date[] = []
  for (let i = 0; i < 42; i++) cells.push(new Date(y, m, 1 - startOffset + i))

  const sprintEvents = useMemo<SprintEvent[]>(() =>
    sprints.flatMap(s => {
      const iso = etaToIso(s.eta)
      if (!iso) return []
      return [{ id: `sprint-eta-${s.id}`, date: iso, title: s.feature, type: 'sprint' as const, app: s.app, deletable: false as const }]
    }),
  [sprints])

  const manualEvents = useMemo<ManualEvent[]>(() =>
    events.map(e => ({ ...e, deletable: true as const })),
  [events])

  const allByDate = useMemo(() => {
    const map: Record<string, AnyEvent[]> = {}
    ;[...sprintEvents, ...manualEvents].forEach(e => { (map[e.date] = map[e.date] || []).push(e) })
    return map
  }, [sprintEvents, manualEvents])

  const move = (delta: number) => { const n = new Date(cursor); n.setMonth(n.getMonth() + delta); setCursor(n) }

  const openDay = (dt: Date) => {
    setDayPopup({
      label: dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
      iso: isoDate(dt.getFullYear(), dt.getMonth(), dt.getDate()),
    })
    setAddForm(null)
    setStandalone(false)
  }

  const openStandalone = () => {
    const iso = isoDate(today.getFullYear(), today.getMonth(), today.getDate())
    setAddForm({ date: iso, title: '', type: 'manual', note: '' })
    setDayPopup(null)
    setStandalone(true)
  }

  const saveEvent = () => {
    if (!addForm || !addForm.title.trim()) return
    addEvent({ date: addForm.date, title: addForm.title, type: addForm.type, note: addForm.note || undefined })
    if (standalone) {
      setAddForm(null)
      setStandalone(false)
    } else {
      setAddForm(null)
    }
  }

  const closeAll = () => { setDayPopup(null); setAddForm(null); setStandalone(false) }

  const dotColor = (type: string) =>
    type === 'sprint' ? 'var(--blue)' : type === 'global' ? 'var(--amber)' : type === 'task' ? 'var(--teal)' : 'var(--gray-400)'

  return (
    <div className="content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-sub">Sprint deadlines, global events, and team milestones in one place.</p>
        </div>
        <div className="row">
          <div className="cal-legend">
            <div className="item"><div className="dot" style={{background: 'var(--blue)'}}/> Sprint ETA</div>
            <div className="item"><div className="dot" style={{background: 'var(--amber)'}}/> Global</div>
            <div className="item"><div className="dot" style={{background: 'var(--gray-400)'}}/> Manual</div>
            <div className="item"><div className="dot" style={{background: 'var(--teal)'}}/> Task</div>
          </div>
          <button className="btn primary" onClick={openStandalone}>
            <I.Plus size={14}/> Add event
          </button>
        </div>
      </div>

      <div className="cal-toolbar">
        <div className="cal-month">
          <button className="icon-btn" onClick={() => move(-1)}><I.ChevL/></button>
          {monthName}
          <button className="icon-btn" onClick={() => move(1)}><I.ChevR/></button>
        </div>
        <div className="row">
          <button className="btn sm" onClick={() => setCursor(new Date(today))}>Today</button>
        </div>
      </div>

      <div className="cal-grid">
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
          <div key={d} className="cal-head-cell">{d}</div>
        ))}
        {cells.map((dt, i) => {
          const inMonth = dt.getMonth() === m
          const iso = isoDate(dt.getFullYear(), dt.getMonth(), dt.getDate())
          const isToday = dt.toDateString() === today.toDateString()
          const evs = allByDate[iso] || []
          return (
            <div key={i}
                 className={`cal-cell ${inMonth ? '' : 'outside'} ${isToday ? 'today' : ''}`}
                 onClick={() => openDay(dt)}>
              <div className="daynum">{dt.getDate()}</div>
              {evs.slice(0, 3).map(e => (
                <div key={e.id} className={`cal-event ${e.type}`}>
                  <span className="dot" style={{background: dotColor(e.type)}}/>
                  {e.type === 'sprint' ? `${(e as SprintEvent).app} · ETA` : e.title}
                </div>
              ))}
              {evs.length > 3 && (
                <div className="cal-event" style={{color: 'var(--text-subtle)', background: 'transparent', paddingLeft: 0}}>
                  +{evs.length - 3} more
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Day detail popup */}
      {dayPopup && (
        <div className="modal-overlay" onClick={closeAll}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3 style={{fontSize: 15}}>{dayPopup.label}</h3>
              <button className="icon-btn" onClick={closeAll}><I.X/></button>
            </div>
            <div className="modal-body">
              {(allByDate[dayPopup.iso] || []).length === 0 && !addForm && (
                <p style={{fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 8px'}}>No events on this day.</p>
              )}
              {(allByDate[dayPopup.iso] || []).map(e => (
                <div key={e.id} style={{display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)'}}>
                  <span style={{width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: dotColor(e.type), marginTop: 4}}/>
                  <div style={{flex: 1, minWidth: 0}}>
                    <div style={{fontSize: 13, fontWeight: 500}}>{e.title}</div>
                    <div style={{fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1}}>
                      {e.type === 'sprint' ? `Sprint ETA · ${(e as SprintEvent).app}` : e.type === 'global' ? 'Global event' : e.type === 'task' ? 'Task' : 'Manual'}
                    </div>
                    {(e as ManualEvent).note && (
                      <div style={{fontSize: 12, color: 'var(--text-muted)', marginTop: 4, padding: '4px 8px', background: 'var(--bg-sidebar)', borderRadius: 5, borderLeft: '2px solid var(--border-strong)'}}>
                        {(e as ManualEvent).note}
                      </div>
                    )}
                  </div>
                  {e.deletable ? (
                    <button className="icon-btn" title="Remove event" onClick={() => deleteEvent(e.id)}><I.Trash size={13}/></button>
                  ) : (
                    <span style={{fontSize: 11, color: 'var(--text-subtle)', whiteSpace: 'nowrap'}}>Sprint Tracker</span>
                  )}
                </div>
              ))}

              {(() => {
                const dayTasks = tasks.filter(t => t.date === dayPopup.iso)
                if (!dayTasks.length) return null
                return (
                  <div style={{marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12}}>
                    <div style={{fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6}}>
                      <span style={{width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)', display: 'inline-block'}}/>
                      Tasks · {dayTasks.length}
                    </div>
                    {dayTasks.map(t => (
                      <div key={t.id} style={{display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0'}}>
                        <button style={{background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0}}
                                onClick={() => updateTask(t.id, { done: !t.done })}>
                          <div style={{
                            width: 15, height: 15, borderRadius: 4,
                            border: `1.5px solid ${t.done ? 'var(--blue-dark)' : 'var(--border-strong)'}`,
                            background: t.done ? 'var(--blue)' : 'var(--bg-input)',
                            display: 'grid', placeItems: 'center',
                          }}>
                            {t.done && <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5l2.5 2.5 3.5-4"/></svg>}
                          </div>
                        </button>
                        <span style={{fontSize: 12.5, color: t.done ? 'var(--text-subtle)' : 'var(--text)', textDecoration: t.done ? 'line-through' : 'none', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                          {t.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              })()}

              {addForm ? (
                <div style={{marginTop: 14}}>
                  <div className="field">
                    <label className="label">Title</label>
                    <input className="input" placeholder="e.g. PRD review" autoFocus
                           value={addForm.title}
                           onChange={e => setAddForm({...addForm, title: e.target.value})}
                           onKeyDown={e => e.key === 'Enter' && saveEvent()}/>
                  </div>
                  <div className="field">
                    <label className="label">Note <span style={{fontWeight: 400, opacity: 0.6}}>(optional)</span></label>
                    <input className="input" placeholder="Any extra info…"
                           value={addForm.note}
                           onChange={e => setAddForm({...addForm, note: e.target.value})}/>
                  </div>
                  <div className="field" style={{marginBottom: 0}}>
                    <label className="label">Category</label>
                    <div className="chip-row">
                      {([
                        { id: 'global' as const, label: 'Global', color: 'var(--amber)' },
                        { id: 'manual' as const, label: 'Manual', color: 'var(--gray-400)' },
                      ]).map(c => (
                        <div key={c.id} className={`chip ${addForm.type === c.id ? 'active' : ''}`}
                             onClick={() => setAddForm({...addForm, type: c.id})}>
                          <span style={{width: 8, height: 8, borderRadius: '50%', background: c.color, display: 'inline-block'}}/>
                          {c.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <button className="btn ghost sm" style={{marginTop: 10}}
                        onClick={() => setAddForm({ date: dayPopup.iso, title: '', type: 'manual', note: '' })}>
                  <I.Plus size={12}/> Add event on this day
                </button>
              )}
            </div>
            <div className="modal-foot">
              {addForm ? (
                <>
                  <button className="btn ghost" onClick={() => setAddForm(null)}>Cancel</button>
                  <button className="btn primary" onClick={saveEvent} disabled={!addForm.title.trim()}>Add event</button>
                </>
              ) : (
                <button className="btn ghost" onClick={closeAll}>Close</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Standalone add event modal (top button, picks any date) */}
      {standalone && addForm && (
        <div className="modal-overlay" onClick={closeAll}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Add event</h3>
              <button className="icon-btn" onClick={closeAll}><I.X/></button>
            </div>
            <div className="modal-body">
              <div className="field">
                <label className="label">Title</label>
                <input className="input" placeholder="e.g. PRD review with eng" autoFocus
                       value={addForm.title}
                       onChange={e => setAddForm({...addForm, title: e.target.value})}
                       onKeyDown={e => e.key === 'Enter' && saveEvent()}/>
              </div>
              <div className="field">
                <label className="label">Date</label>
                <input className="input" type="date" value={addForm.date}
                       onChange={e => setAddForm({...addForm, date: e.target.value})}/>
              </div>
              <div className="field">
                <label className="label">Note <span style={{fontWeight: 400, opacity: 0.6}}>(optional)</span></label>
                <input className="input" placeholder="Any extra info, links, context…"
                       value={addForm.note}
                       onChange={e => setAddForm({...addForm, note: e.target.value})}/>
              </div>
              <div className="field" style={{marginBottom: 0}}>
                <label className="label">Category</label>
                <div className="chip-row">
                  {([
                    { id: 'global' as const, label: 'Global event', color: 'var(--amber)' },
                    { id: 'manual' as const, label: 'Manual', color: 'var(--gray-400)' },
                  ]).map(c => (
                    <div key={c.id} className={`chip ${addForm.type === c.id ? 'active' : ''}`}
                         onClick={() => setAddForm({...addForm, type: c.id})}>
                      <span style={{width: 8, height: 8, borderRadius: '50%', background: c.color, display: 'inline-block'}}/>
                      {c.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn ghost" onClick={closeAll}>Cancel</button>
              <button className="btn primary" onClick={saveEvent} disabled={!addForm.title.trim()}>Add to calendar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
