import { useNavigate } from 'react-router-dom'
import { useSprintsStore } from '../../store/sprintsStore'
import { useCalendarStore } from '../../store/calendarStore'
import { AppLogo } from '../../components/ui/AppLogo'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { I } from '../../components/ui/Icon'

export function Dashboard() {
  const navigate = useNavigate()
  const sprints = useSprintsStore(s => s.sprints)
  const events = useCalendarStore(s => s.events)
  const current = sprints.filter(s => s.status === 'Current')
  const blockers = sprints.filter(s => s.blocker)

  return (
    <div className="content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Good afternoon, Jordan</h1>
          <p className="page-sub">Tuesday, May 19 · 4 active sprints · 12 strings need translation</p>
        </div>
        <div className="row">
          <button className="btn"><I.Plus size={14}/> Quick add</button>
          <button className="btn primary"><I.Sparkle size={14}/> Ask AI</button>
        </div>
      </div>

      <div className="kpi-row">
        <div className="kpi">
          <div className="l">Active sprints</div>
          <div className="v">4</div>
          <div className="d"><span className="up">▲ 1</span> vs last week</div>
        </div>
        <div className="kpi">
          <div className="l">Shipping this week</div>
          <div className="v">3</div>
          <div className="d">Paywall, Bulk export, BG remover</div>
        </div>
        <div className="kpi">
          <div className="l">Blockers</div>
          <div className="v" style={{color: 'var(--amber)'}}>{blockers.length}</div>
          <div className="d"><span className="down">▼</span> down from 5</div>
        </div>
        <div className="kpi">
          <div className="l">Pack items live</div>
          <div className="v">142</div>
          <div className="d">+12 this month</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="panel">
          <div className="panel-head">
            <h3>Sprints in motion</h3>
            <button className="btn ghost sm" onClick={() => navigate('/sprint')}>View all <I.ChevR size={12}/></button>
          </div>
          <div className="panel-body">
            {current.map(s => (
              <div key={s.id} className="row-item" onClick={() => navigate('/sprint')} style={{cursor: 'pointer'}}>
                <AppLogo name={s.app}/>
                <div style={{flex: 1, minWidth: 0}}>
                  <div className="t">{s.feature}</div>
                  <div className="s">{s.app} · {s.platforms.join(', ')} · ETA {s.eta}</div>
                </div>
                <StatusBadge status={s.stage}/>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><h3>This week</h3><span className="muted" style={{fontSize: 11.5}}>Next 7 days</span></div>
          <div className="panel-body">
            {events.slice(0, 6).map(e => (
              <div key={e.id} className="row-item">
                <div style={{
                  width: 32, height: 32, borderRadius: 6,
                  background: e.type === 'sprint' ? 'var(--blue-soft)' : e.type === 'global' ? 'var(--amber-soft)' : 'var(--gray-100)',
                  color: e.type === 'sprint' ? 'var(--blue-dark)' : e.type === 'global' ? 'var(--amber)' : 'var(--text-muted)',
                  display: 'grid', placeItems: 'center', flexShrink: 0,
                  fontSize: 11, fontWeight: 600,
                }}>
                  {new Date(e.date).getDate()}
                </div>
                <div style={{flex: 1, minWidth: 0}}>
                  <div className="t">{e.title}</div>
                  <div className="s">{new Date(e.date).toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'})}</div>
                </div>
                <span className={`badge ${e.type === 'sprint' ? 'blue' : e.type === 'global' ? 'amber' : 'gray'}`}>
                  {e.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dash-grid" style={{marginTop: 14}}>
        <div className="panel">
          <div className="panel-head"><h3>Sprint mix by stage</h3></div>
          <div className="bar-chart">
            <div className="bar-row">
              <div className="muted">Dev</div>
              <div className="bar"><i style={{width: '42%'}}/></div>
              <div className="num">5</div>
            </div>
            <div className="bar-row teal">
              <div className="muted">QA</div>
              <div className="bar"><i style={{width: '25%'}}/></div>
              <div className="num">3</div>
            </div>
            <div className="bar-row amber">
              <div className="muted">Design</div>
              <div className="bar"><i style={{width: '17%'}}/></div>
              <div className="num">2</div>
            </div>
            <div className="bar-row">
              <div className="muted">Product</div>
              <div className="bar"><i style={{width: '17%', background: 'var(--gray-400)'}}/></div>
              <div className="num">2</div>
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><h3>Needs your attention</h3></div>
          <div className="panel-body">
            {blockers.map(s => (
              <div key={s.id} className="row-item">
                <div style={{color: 'var(--amber)'}}><I.Alert/></div>
                <div style={{flex: 1, minWidth: 0}}>
                  <div className="t">{s.feature}</div>
                  <div className="s">{s.blocker}</div>
                </div>
                <button className="btn sm">Open</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
