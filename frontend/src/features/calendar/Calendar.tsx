import { useState, useMemo } from 'react'
import { useCalendarStore } from '../../store/calendarStore'
import { I } from '../../components/ui/Icon'

function pad(n: number) { return n < 10 ? '0' + n : '' + n }
function isoDate(y: number, m: number, d: number) { return `${y}-${pad(m + 1)}-${pad(d)}` }

type AddingState = { date: string; title: string; type: 'sprint' | 'global' | 'manual' }

export function Calendar() {
  const { events, addEvent } = useCalendarStore()
  const [cursor, setCursor] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1) })
  const [adding, setAdding] = useState<AddingState | null>(null)
  const today = new Date()

  const y = cursor.getFullYear()
  const m = cursor.getMonth()
  const monthName = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const first = new Date(y, m, 1)
  const startOffset = (first.getDay() + 6) % 7
  const cells: Date[] = []
  for (let i = 0; i < 42; i++) {
    cells.push(new Date(y, m, 1 - startOffset + i))
  }

  const eventsByDate = useMemo(() => {
    const map: Record<string, typeof events> = {}
    events.forEach(e => { (map[e.date] = map[e.date] || []).push(e) })
    return map
  }, [events])

  const move = (delta: number) => {
    const next = new Date(cursor); next.setMonth(next.getMonth() + delta); setCursor(next)
  }

  const onCellClick = (dt: Date) => {
    setAdding({ date: isoDate(dt.getFullYear(), dt.getMonth(), dt.getDate()), title: '', type: 'manual' })
  }

  const saveEvent = () => {
    if (!adding || !adding.title.trim()) return
    addEvent({ date: adding.date, title: adding.title, type: adding.type })
    setAdding(null)
  }

  return (
    <div className="content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-sub">Sprint deadlines, global events, and team milestones in one place.</p>
        </div>
        <div className="row">
          <div className="cal-legend">
            <div className="item"><div className="dot" style={{background: 'var(--blue)'}}/> Sprint</div>
            <div className="item"><div className="dot" style={{background: 'var(--gray-400)'}}/> Manual</div>
            <div className="item"><div className="dot" style={{background: 'var(--amber)'}}/> Global</div>
          </div>
          <button className="btn primary" onClick={() => setAdding({ date: isoDate(today.getFullYear(), today.getMonth(), today.getDate()), title: '', type: 'manual' })}>
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
          <div className="chip-row">
            <div className="chip active">Month</div>
            <div className="chip">Week</div>
            <div className="chip">Agenda</div>
          </div>
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
          const evs = eventsByDate[iso] || []
          return (
            <div key={i}
                 className={`cal-cell ${inMonth ? '' : 'outside'} ${isToday ? 'today' : ''}`}
                 onClick={() => onCellClick(dt)}>
              <div className="daynum">{dt.getDate()}</div>
              {evs.slice(0, 3).map(e => (
                <div key={e.id} className={`cal-event ${e.type}`}>
                  <span className="dot" style={{background: e.type === 'sprint' ? 'var(--blue)' : e.type === 'global' ? 'var(--amber)' : 'var(--gray-400)'}}/>
                  {e.title}
                </div>
              ))}
              {evs.length > 3 && <div className="cal-event" style={{color: 'var(--text-subtle)', background: 'transparent', paddingLeft: 0}}>+{evs.length - 3} more</div>}
            </div>
          )
        })}
      </div>

      {adding && (
        <div className="modal-overlay" onClick={() => setAdding(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Add event</h3>
              <button className="icon-btn" onClick={() => setAdding(null)}><I.X/></button>
            </div>
            <div className="modal-body">
              <div className="field">
                <label className="label">Title</label>
                <input className="input" placeholder="e.g. PRD review with eng"
                       value={adding.title} autoFocus
                       onChange={e => setAdding({...adding, title: e.target.value})}/>
              </div>
              <div className="row gap-12">
                <div className="field" style={{flex: 1, marginBottom: 0}}>
                  <label className="label">Date</label>
                  <input className="input" type="date" value={adding.date}
                         onChange={e => setAdding({...adding, date: e.target.value})}/>
                </div>
                <div className="field" style={{flex: 1, marginBottom: 0}}>
                  <label className="label">Time (optional)</label>
                  <input className="input" type="time" defaultValue="14:00"/>
                </div>
              </div>
              <div className="field" style={{marginTop: 14}}>
                <label className="label">Category</label>
                <div className="chip-row">
                  {([
                    { id: 'sprint' as const, label: 'Sprint end', color: 'var(--blue)' },
                    { id: 'global' as const, label: 'Global event', color: 'var(--amber)' },
                    { id: 'manual' as const, label: 'Manual', color: 'var(--gray-400)' },
                  ]).map(c => (
                    <div key={c.id}
                         className={`chip ${adding.type === c.id ? 'active' : ''}`}
                         onClick={() => setAdding({...adding, type: c.id})}>
                      <span className="dot" style={{width: 8, height: 8, borderRadius: '50%', background: c.color}}/>
                      {c.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn ghost" onClick={() => setAdding(null)}>Cancel</button>
              <button className="btn primary" onClick={saveEvent}>Add to calendar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
