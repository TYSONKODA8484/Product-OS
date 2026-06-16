// Dashboard + Calendar modules

function Dashboard({ goTo }) {
  const current = SPRINTS.filter(s => s.status === "Current");
  const blockers = SPRINTS.filter(s => s.blocker);

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
          <div className="v" style={{color: "var(--amber)"}}>3</div>
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
            <button className="btn ghost sm" onClick={() => goTo("sprint")}>View all <I.ChevR size={12}/></button>
          </div>
          <div className="panel-body">
            {current.map(s => (
              <div key={s.id} className="row-item" onClick={() => goTo("sprint")} style={{cursor: "pointer"}}>
                <AppLogo name={s.app}/>
                <div style={{flex: 1, minWidth: 0}}>
                  <div className="t">{s.feature}</div>
                  <div className="s">{s.app} · {s.platforms.join(", ")} · ETA {s.eta}</div>
                </div>
                <StatusBadge status={s.stage}/>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><h3>This week</h3><span className="muted" style={{fontSize: 11.5}}>Next 7 days</span></div>
          <div className="panel-body">
            {SAMPLE_EVENTS.slice(0, 6).map(e => (
              <div key={e.id} className="row-item">
                <div style={{
                  width: 32, height: 32, borderRadius: 6,
                  background: e.type === "sprint" ? "var(--blue-soft)" : e.type === "global" ? "var(--amber-soft)" : "var(--gray-100)",
                  color: e.type === "sprint" ? "var(--blue-dark)" : e.type === "global" ? "var(--amber)" : "var(--text-muted)",
                  display: "grid", placeItems: "center", flexShrink: 0,
                  fontSize: 11, fontWeight: 600,
                }}>
                  {new Date(e.date).getDate()}
                </div>
                <div style={{flex: 1, minWidth: 0}}>
                  <div className="t">{e.title}</div>
                  <div className="s">{new Date(e.date).toLocaleDateString("en-US", {weekday: "short", month: "short", day: "numeric"})}</div>
                </div>
                <span className={`badge ${e.type === "sprint" ? "blue" : e.type === "global" ? "amber" : "gray"}`}>
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
              <div className="bar"><i style={{width: "42%"}}/></div>
              <div className="num">5</div>
            </div>
            <div className="bar-row teal">
              <div className="muted">QA</div>
              <div className="bar"><i style={{width: "25%"}}/></div>
              <div className="num">3</div>
            </div>
            <div className="bar-row amber">
              <div className="muted">Design</div>
              <div className="bar"><i style={{width: "17%"}}/></div>
              <div className="num">2</div>
            </div>
            <div className="bar-row">
              <div className="muted">Product</div>
              <div className="bar"><i style={{width: "17%", background: "var(--gray-400)"}}/></div>
              <div className="num">2</div>
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><h3>Needs your attention</h3></div>
          <div className="panel-body">
            {blockers.map(s => (
              <div key={s.id} className="row-item">
                <div style={{color: "var(--amber)"}}><I.Alert/></div>
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
  );
}

// =================== Calendar ===================
function pad(n) { return n < 10 ? "0" + n : "" + n; }
function isoDate(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}`; }

function Calendar({ events, setEvents }) {
  // Anchor on May 2026 to match sample data
  const [cursor, setCursor] = React.useState(new Date(2026, 4, 1));
  const [adding, setAdding] = React.useState(null);
  const [hover, setHover] = React.useState(null);
  const today = new Date(2026, 4, 19); // simulated "today"

  const y = cursor.getFullYear();
  const m = cursor.getMonth();
  const monthName = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Build 6-week grid, Mon-Sun
  const first = new Date(y, m, 1);
  const startOffset = (first.getDay() + 6) % 7; // monday start
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const dt = new Date(y, m, 1 - startOffset + i);
    cells.push(dt);
  }

  const eventsByDate = React.useMemo(() => {
    const map = {};
    events.forEach(e => { (map[e.date] = map[e.date] || []).push(e); });
    return map;
  }, [events]);

  const move = (delta) => {
    const next = new Date(cursor); next.setMonth(next.getMonth() + delta);
    setCursor(next);
  };

  const onCellClick = (dt) => {
    setAdding({ date: isoDate(dt.getFullYear(), dt.getMonth(), dt.getDate()), title: "", type: "manual" });
  };

  const saveEvent = () => {
    if (!adding.title.trim()) return;
    setEvents(es => [...es, { ...adding, id: "e" + Date.now() }]);
    setAdding(null);
  };

  return (
    <div className="content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-sub">Sprint deadlines, global events, and team milestones in one place.</p>
        </div>
        <div className="row">
          <div className="cal-legend">
            <div className="item"><div className="dot" style={{background: "var(--blue)"}}/> Sprint</div>
            <div className="item"><div className="dot" style={{background: "var(--gray-400)"}}/> Manual</div>
            <div className="item"><div className="dot" style={{background: "var(--amber)"}}/> Global</div>
          </div>
          <button className="btn primary" onClick={() => setAdding({ date: isoDate(today.getFullYear(), today.getMonth(), today.getDate()), title: "", type: "manual" })}>
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
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
          <div key={d} className="cal-head-cell">{d}</div>
        ))}
        {cells.map((dt, i) => {
          const inMonth = dt.getMonth() === m;
          const iso = isoDate(dt.getFullYear(), dt.getMonth(), dt.getDate());
          const isToday = dt.toDateString() === today.toDateString();
          const evs = eventsByDate[iso] || [];
          return (
            <div key={i}
                 className={`cal-cell ${inMonth ? "" : "outside"} ${isToday ? "today" : ""}`}
                 onClick={() => onCellClick(dt)}
                 onMouseEnter={() => evs.length && setHover({ iso, evs, x: 0, y: 0 })}
                 onMouseLeave={() => setHover(null)}>
              <div className="daynum">{dt.getDate()}</div>
              {evs.slice(0, 3).map(e => (
                <div key={e.id} className={`cal-event ${e.type}`}>
                  <span className="dot" style={{background: e.type === "sprint" ? "var(--blue)" : e.type === "global" ? "var(--amber)" : "var(--gray-400)"}}/>
                  {e.title}
                </div>
              ))}
              {evs.length > 3 && <div className="cal-event" style={{color: "var(--text-subtle)", background: "transparent", paddingLeft: 0}}>+{evs.length - 3} more</div>}
            </div>
          );
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
                  <input className="input" type="date"
                         value={adding.date}
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
                  {[
                    { id: "sprint", label: "Sprint end", color: "var(--blue)" },
                    { id: "global", label: "Global event", color: "var(--amber)" },
                    { id: "manual", label: "Manual", color: "var(--gray-400)" },
                  ].map(c => (
                    <div key={c.id}
                         className={`chip ${adding.type === c.id ? "active" : ""}`}
                         onClick={() => setAdding({...adding, type: c.id})}>
                      <span className="dot" style={{width: 8, height: 8, borderRadius: "50%", background: c.color}}/>
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
  );
}

Object.assign(window, { Dashboard, Calendar });
