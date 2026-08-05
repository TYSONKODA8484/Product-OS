import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSprintsStore } from '../../store/sprintsStore'
import { usePackStore } from '../../store/packStore'
import { useSettingsStore } from '../../store/settingsStore'
import { useCalendarStore } from '../../store/calendarStore'
import { AppLogo } from '../../components/ui/AppLogo'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { I } from '../../components/ui/Icon'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}

function parseETA(eta: string): Date | null {
  if (!eta) return null
  const months: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    january: 0, february: 1, march: 2, april: 3, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
  }
  const s = eta.toLowerCase().trim()
  // "19 june" / "19 jun"
  const a = s.match(/^(\d{1,2})\s+([a-z]+)/)
  if (a && months[a[2]] !== undefined) {
    const d = new Date(); d.setMonth(months[a[2]]); d.setDate(+a[1]); d.setHours(0, 0, 0, 0); return d
  }
  // "june 19" / "may 28"
  const b = s.match(/^([a-z]+)\s+(\d{1,2})/)
  if (b && months[b[1]] !== undefined) {
    const d = new Date(); d.setMonth(months[b[1]]); d.setDate(+b[2]); d.setHours(0, 0, 0, 0); return d
  }
  return null
}

const STAGES = ['Dev', 'QA', 'Design', 'Product'] as const
const STAGE_COLOR: Record<string, string> = {
  Dev: 'var(--blue)', QA: '#0d9488', Design: 'var(--amber)', Product: 'var(--gray-400)',
}

const EVENT_DOT: Record<string, string> = {
  sprint: 'var(--blue)',
  global: 'var(--amber)',
  manual: 'var(--text-subtle)',
}

function fmtEventDate(dateStr: string, now: Date): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const diff = Math.round((d.setHours(0,0,0,0) - new Date(now).setHours(0,0,0,0)) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff <= 6) return d.toLocaleDateString('en-US', { weekday: 'short' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function Dashboard() {
  const navigate = useNavigate()
  const { sprints, fetchSprints } = useSprintsStore()
  const { rows, fetchRows } = usePackStore()
  const { profile, fetchSettings } = useSettingsStore()
  const { events, fetchEvents } = useCalendarStore()
  const [quickOpen, setQuickOpen] = useState(false)
  const quickRef = useRef<HTMLDivElement>(null)

  useEffect(() => { fetchSprints(); fetchRows(); fetchSettings(); fetchEvents() }, [])

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (!quickRef.current?.contains(e.target as Node)) setQuickOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const now = new Date()
  const weekOut = new Date(now); weekOut.setDate(weekOut.getDate() + 7)

  const current = sprints.filter(s => s.status === 'Current')
  const blockers = sprints.filter(s => s.blocker)
  const packLive = rows.filter(r => r.live === 'Yes').length

  const shippingThisWeek = sprints.filter(s => {
    const d = parseETA(s.eta)
    return d && d >= now && d <= weekOut
  })
  const shippingDisplay = shippingThisWeek.length > 0 ? shippingThisWeek : current

  const stageCounts = STAGES.map(st => ({ st, n: sprints.filter(s => s.stage === st).length }))
  const maxStage = Math.max(1, ...stageCounts.map(x => x.n))

  const upcoming = events
    .filter(e => { const d = new Date(e.date); return !isNaN(d.getTime()) && d >= now })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 6)

  const todayStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting()}{profile.name ? `, ${profile.name.split(' ')[0]}` : ''}</h1>
          <p className="page-sub">{todayStr} · {current.length} active sprint{current.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <div ref={quickRef} style={{ position: 'relative' }}>
            <button className="btn" onClick={() => setQuickOpen(o => !o)}>
              <I.Plus size={14}/> Quick add
            </button>
            {quickOpen && (
              <div className="popover" style={{ right: 0, top: 'calc(100% + 6px)', minWidth: 180 }}>
                <div className="popover-item" onClick={() => { navigate('/sprint'); setQuickOpen(false) }}>
                  <I.Package size={14}/><span>New sprint</span>
                </div>
                <div className="popover-item" onClick={() => { navigate('/notes'); setQuickOpen(false) }}>
                  <I.Note size={14}/><span>New note</span>
                </div>
                <div className="popover-item" onClick={() => { navigate('/calendar'); setQuickOpen(false) }}>
                  <I.Calendar size={14}/><span>New event</span>
                </div>
              </div>
            )}
          </div>
          <button className="btn primary" onClick={() => navigate('/ai')}>
            <I.Sparkle size={14}/> Ask AI
          </button>
        </div>
      </div>

      <div className="kpi-row">
        <div className="kpi">
          <div className="l">Active sprints</div>
          <div className="v">{current.length}</div>
        </div>
        <div className="kpi">
          <div className="l">Shipping this week</div>
          <div className="v">{shippingDisplay.length}</div>
        </div>
        <div className="kpi">
          <div className="l">Blockers</div>
          <div className="v" style={{ color: 'var(--amber)' }}>{blockers.length}</div>
        </div>
        <div className="kpi">
          <div className="l">Pack items live</div>
          <div className="v">{packLive}</div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 14 }}>
        <div className="panel-head">
          <h3>Sprints in motion</h3>
          <button className="btn ghost sm" onClick={() => navigate('/sprint')}>View all <I.ChevR size={12}/></button>
        </div>
        <div className="panel-body">
          {current.length === 0 ? (
            <div className="empty" style={{ padding: '24px 0' }}>
              <I.Package size={24}/>
              <div className="e-title">No active sprints</div>
              <div className="e-sub">Add sprints in the Sprint Tracker</div>
            </div>
          ) : current.map(s => (
            <div key={s.id} className="row-item" onClick={() => navigate('/sprint')} style={{ cursor: 'pointer' }}>
              <AppLogo name={s.app}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="t">{s.feature}</div>
                <div className="s">{s.app} · {s.platforms.join(', ')} · ETA {s.eta}</div>
              </div>
              <StatusBadge status={s.stage}/>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-grid" style={{ marginTop: 14 }}>
        <div className="panel">
          <div className="panel-head"><h3>Sprint mix by stage</h3></div>
          <div className="bar-chart">
            {stageCounts.map(({ st, n }) => (
              <div key={st} className={`bar-row${st === 'QA' ? ' teal' : st === 'Design' ? ' amber' : ''}`}>
                <div className="muted">{st}</div>
                <div className="bar"><i style={{ width: `${(n / maxStage) * 100}%`, background: STAGE_COLOR[st] }}/></div>
                <div className="num">{n}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><h3>Needs your attention</h3></div>
          <div className="panel-body">
            {blockers.length === 0 ? (
              <div className="empty" style={{ padding: '24px 0' }}>
                <I.Check size={24}/>
                <div className="e-title">All clear</div>
                <div className="e-sub">No blockers right now</div>
              </div>
            ) : blockers.map(s => (
              <div key={s.id} className="row-item">
                <div style={{ color: 'var(--amber)' }}><I.Alert/></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="t">{s.feature}</div>
                  <div className="s">{s.blocker}</div>
                </div>
                <button className="btn sm" onClick={() => navigate('/sprint')}>Open</button>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Upcoming</h3>
            <button className="btn ghost sm" onClick={() => navigate('/calendar')}>View <I.ChevR size={12}/></button>
          </div>
          <div className="panel-body">
            {upcoming.length === 0 ? (
              <div className="empty" style={{ padding: '24px 0' }}>
                <I.Calendar size={24}/>
                <div className="e-title">Nothing coming up</div>
                <div className="e-sub">Add events in Calendar</div>
              </div>
            ) : upcoming.map(e => (
              <div key={e.id} className="row-item" onClick={() => navigate('/calendar')} style={{ cursor: 'pointer' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: EVENT_DOT[e.type] || 'var(--text-subtle)', flexShrink: 0 }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="t" style={{ fontSize: 12.5 }}>{e.title}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                  {fmtEventDate(e.date, now)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
