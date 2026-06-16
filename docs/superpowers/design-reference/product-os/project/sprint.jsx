// Sprint Tracker v2 — Linear-style: dense, grouped, fast

// Status order + visual config
const STATUS_CONFIG = {
  Current: { label: "In progress", color: "#378ADD", order: 0 },
  Next: { label: "Up next", color: "#BA7517", order: 1 },
  Done: { label: "Shipped", color: "#1D9E75", order: 2 },
};

const STAGE_DOT = {
  Design: "#9B5DE5",
  Product: "#1D9E75",
  Dev: "#378ADD",
  QA: "#BA7517",
  Done: "#6B6B66",
};

// Open/closed circle icon for status
function StatusGlyph({ status }) {
  const c = STATUS_CONFIG[status]?.color || "#9C9A8F";
  if (status === "Done") {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="7" fill={c}/>
        <path d="M5 8.2l2 2 4-4.4" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  if (status === "Current") {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="6.5" fill="none" stroke={c} strokeWidth="1.6"/>
        <circle cx="8" cy="8" r="3.2" fill={c}/>
      </svg>
    );
  }
  // Next / dashed
  return (
    <svg width="14" height="14" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="6.5" fill="none" stroke={c} strokeWidth="1.6" strokeDasharray="2.2 2"/>
    </svg>
  );
}

function PriorityFlag({ blocker }) {
  if (!blocker) return <span style={{ width: 14, display: "inline-block" }}/>;
  return (
    <span title={blocker} style={{ color: "var(--amber)", display: "inline-flex" }}>
      <I.Alert size={13}/>
    </span>
  );
}

function appColor(name) {
  const colors = {
    LightX:  "#378ADD",
    "AI Leap": "#1D9E75",
    Photocut: "#BA7517",
    StyleOn: "#9B5DE5",
    StorYZ: "#E15D7E",
  };
  return colors[name] || "#444441";
}

function Sprint({ sprints, setSprints }) {
  const [filters, setFilters] = React.useState({
    platform: [], apps: [], stage: [], status: []
  });
  const [grouping, setGrouping] = React.useState("status");
  const [open, setOpen] = React.useState(null);
  const [collapsed, setCollapsed] = React.useState({});
  const [q, setQ] = React.useState("");
  const toast = useToast();

  const toggle = (group, val) => setFilters(f => ({
    ...f,
    [group]: f[group].includes(val) ? f[group].filter(x => x !== val) : [...f[group], val]
  }));

  const active = Object.values(filters).some(v => v.length) || q;
  const clearAll = () => { setFilters({ platform: [], apps: [], stage: [], status: [] }); setQ(""); };

  const filtered = sprints.filter(s => {
    if (q && !`${s.feature} ${s.app} ${s.jira}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (filters.platform.length && !s.platforms.some(p => filters.platform.includes(p))) return false;
    if (filters.apps.length && !filters.apps.includes(s.app)) return false;
    if (filters.stage.length && !filters.stage.includes(s.stage)) return false;
    if (filters.status.length && !filters.status.includes(s.status)) return false;
    return true;
  });

  // Group
  const groups = React.useMemo(() => {
    const m = {};
    filtered.forEach(s => {
      const key = grouping === "status" ? s.status : grouping === "app" ? s.app : s.stage;
      (m[key] = m[key] || []).push(s);
    });
    if (grouping === "status") {
      return ["Current", "Next", "Done"].filter(k => m[k]?.length).map(k => ({ key: k, items: m[k] }));
    }
    return Object.keys(m).sort().map(k => ({ key: k, items: m[k] }));
  }, [filtered, grouping]);

  const cycleStatus = (id, e) => {
    e.stopPropagation();
    const order = ["Current", "Next", "Done"];
    setSprints(ss => ss.map(s => s.id === id ? { ...s, status: order[(order.indexOf(s.status) + 1) % 3] } : s));
    toast("Status updated");
  };

  const update = (id, patch) => setSprints(ss => ss.map(s => s.id === id ? { ...s, ...patch } : s));

  return (
    <div className="content" style={{padding: "16px 24px"}}>
      {/* Compact page header */}
      <div className="row" style={{justifyContent: "space-between", marginBottom: 12}}>
        <div className="row gap-12">
          <h1 style={{fontSize: 18, fontWeight: 600, margin: 0, letterSpacing: "-0.01em"}}>Sprint Tracker</h1>
          <span style={{fontSize: 12, color: "var(--text-muted)"}}>{filtered.length} of {sprints.length}</span>
        </div>
        <div className="row" style={{gap: 6}}>
          <button className="btn ghost sm"><I.Download size={13}/> Export</button>
          <button className="btn primary sm"><I.Plus size={13}/> New sprint</button>
        </div>
      </div>

      {/* Compact toolbar */}
      <div className="sprint-toolbar">
        <div className="search-box" style={{width: 220, padding: "4px 9px"}}>
          <I.Search size={13}/>
          <input placeholder="Search…" value={q} onChange={e => setQ(e.target.value)}/>
        </div>
        <div className="tb-divider"/>
        <FilterMenu label="Status" icon={<StatusGlyph status="Current"/>}
                    options={["Current","Next","Done"]} selected={filters.status}
                    onToggle={(v) => toggle("status", v)}/>
        <FilterMenu label="Stage" icon={<I.Filter size={12}/>}
                    options={["Design","Product","Dev","QA"]} selected={filters.stage}
                    onToggle={(v) => toggle("stage", v)}/>
        <FilterMenu label="Platform" icon={<I.Package size={12}/>}
                    options={["iOS","Android","Web"]} selected={filters.platform}
                    onToggle={(v) => toggle("platform", v)}/>
        <FilterMenu label="App" icon={<I.Globe size={12}/>}
                    options={APPS} selected={filters.apps}
                    onToggle={(v) => toggle("apps", v)}/>
        {active && <button className="btn ghost sm" onClick={clearAll}>Clear</button>}

        <div style={{flex: 1}}/>

        <div className="row" style={{gap: 4, fontSize: 11.5, color: "var(--text-muted)"}}>
          <span>Group by</span>
          <select className="select" value={grouping} onChange={e => setGrouping(e.target.value)}
                  style={{width: "auto", padding: "3px 6px", fontSize: 12}}>
            <option value="status">Status</option>
            <option value="stage">Stage</option>
            <option value="app">App</option>
          </select>
        </div>
      </div>

      {/* Group sections */}
      <div className="sprint-list">
        {groups.length === 0 && (
          <div className="card empty"><I.Search size={28}/><div className="e-title">No sprints match</div><div className="e-sub">Clear filters or adjust your search.</div></div>
        )}
        {groups.map(g => {
          const isCollapsed = collapsed[g.key];
          const statusConf = STATUS_CONFIG[g.key];
          const label = statusConf?.label || g.key;
          return (
            <section key={g.key} className="sprint-group">
              <header className="sprint-group-head" onClick={() => setCollapsed(c => ({...c, [g.key]: !isCollapsed}))}>
                <span className="row" style={{gap: 8}}>
                  <span style={{
                    display: "inline-block", transform: `rotate(${isCollapsed ? -90 : 0}deg)`,
                    transition: "transform 0.1s", color: "var(--text-muted)", lineHeight: 0,
                  }}>
                    <I.ChevD size={12}/>
                  </span>
                  {statusConf && <StatusGlyph status={g.key}/>}
                  <span style={{fontWeight: 600, fontSize: 12.5}}>{label}</span>
                  <span style={{fontSize: 11.5, color: "var(--text-subtle)"}}>{g.items.length}</span>
                </span>
                <button className="btn ghost sm" onClick={(e) => e.stopPropagation()} style={{padding: "2px 6px"}}>
                  <I.Plus size={12}/>
                </button>
              </header>
              {!isCollapsed && (
                <div className="sprint-rows">
                  {g.items.map(s => (
                    <SprintRow key={s.id} s={s} onOpen={() => setOpen(s.id)} cycleStatus={cycleStatus}/>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {open && (
        <SprintDrawer
          sprint={sprints.find(s => s.id === open)}
          onClose={() => setOpen(null)}
          onUpdate={(patch) => update(open, patch)}
        />
      )}
    </div>
  );
}

function SprintRow({ s, onOpen, cycleStatus }) {
  return (
    <div className="sprint-row" onClick={onOpen}>
      <button className="sprint-status-btn" onClick={(e) => cycleStatus(s.id, e)} title={`Status: ${s.status} (click to cycle)`}>
        <StatusGlyph status={s.status}/>
      </button>
      <span className="sprint-id mono">{s.jira}</span>
      <span className="sprint-app-dot" style={{background: appColor(s.app)}} title={s.app}/>
      <span className="sprint-feat">{s.feature}</span>
      <div className="sprint-row-spacer"/>
      <PriorityFlag blocker={s.blocker}/>
      <span className="sprint-plats">
        {s.platforms.map(p => <span key={p} className="plat-pill">{p}</span>)}
      </span>
      <span className="sprint-stage">
        <span className="stage-dot" style={{background: STAGE_DOT[s.stage]}}/>
        {s.stage}
      </span>
      <span className="sprint-eta mono">{s.eta}</span>
    </div>
  );
}

function FilterMenu({ label, icon, options, selected, onToggle }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const f = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", f);
    return () => document.removeEventListener("mousedown", f);
  }, []);
  const cnt = selected.length;
  return (
    <div className="filter-menu" ref={ref}>
      <button className={`btn sm ${cnt ? "primary" : "ghost"}`} onClick={() => setOpen(o => !o)} style={cnt ? {background: "var(--blue-soft)", color: "var(--blue-dark)", borderColor: "transparent"} : {}}>
        {icon}
        <span>{label}</span>
        {cnt > 0 && <span className="mono" style={{fontSize: 11, opacity: 0.8}}>· {cnt}</span>}
        <I.ChevD size={11} style={{opacity: 0.6}}/>
      </button>
      {open && (
        <div className="filter-pop">
          {options.map(o => (
            <label key={o} className="filter-opt">
              <input type="checkbox" checked={selected.includes(o)} onChange={() => onToggle(o)}/>
              <span>{o}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// SprintDrawer is defined in modules-data.jsx — we reuse it.
// But to be safe, re-declare it here in case of load-order issues:
function SprintDrawer({ sprint, onClose, onUpdate }) {
  const toast = useToast();
  const change = (patch) => { onUpdate(patch); toast("Saved"); };

  return (
    <>
      <div className="drawer-overlay" onClick={onClose}/>
      <div className="drawer">
        <div className="modal-head">
          <div className="row" style={{gap: 10}}>
            <StatusGlyph status={sprint.status}/>
            <div>
              <h3 style={{display: "flex", alignItems: "center", gap: 8}}>
                <span className="mono" style={{fontSize: 11.5, color: "var(--text-subtle)", fontWeight: 500}}>{sprint.jira}</span>
                {sprint.feature}
              </h3>
              <div style={{fontSize: 11.5, color: "var(--text-muted)", marginTop: 2}}>
                {sprint.app} · {sprint.platforms.join(", ")}
              </div>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><I.X/></button>
        </div>
        <div style={{padding: "20px 22px", flex: 1, overflow: "auto"}}>
          <div className="field">
            <label className="label">Feature name</label>
            <input className="input" value={sprint.feature} onChange={e => change({ feature: e.target.value })}/>
          </div>
          <div className="row gap-12">
            <div className="field" style={{flex: 1}}>
              <label className="label">App</label>
              <select className="select" value={sprint.app} onChange={e => change({ app: e.target.value })}>
                {APPS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div className="field" style={{flex: 1}}>
              <label className="label">Stage</label>
              <select className="select" value={sprint.stage} onChange={e => change({ stage: e.target.value })}>
                {["Design","Product","Dev","QA","Done"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label className="label">Platform</label>
            <div className="chip-row">
              {["iOS","Android","Web"].map(p => (
                <div key={p} className={`chip ${sprint.platforms.includes(p) ? "active" : ""}`}
                     onClick={() => change({ platforms: sprint.platforms.includes(p) ? sprint.platforms.filter(x => x !== p) : [...sprint.platforms, p] })}>
                  {p}
                </div>
              ))}
            </div>
          </div>
          <div className="row gap-12">
            <div className="field" style={{flex: 1}}>
              <label className="label">Status</label>
              <select className="select" value={sprint.status} onChange={e => change({ status: e.target.value })}>
                {["Current","Next","Done"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="field" style={{flex: 1}}>
              <label className="label">ETA</label>
              <input className="input" value={sprint.eta} onChange={e => change({ eta: e.target.value })}/>
            </div>
          </div>
          <div className="field">
            <label className="label">Blocker / Notes</label>
            <textarea className="textarea" placeholder="No blockers right now…"
                      value={sprint.blocker} onChange={e => change({ blocker: e.target.value })}/>
          </div>
          <div className="field">
            <label className="label">JIRA Sprint link</label>
            <div className="row" style={{gap: 6}}>
              <input className="input" value={sprint.jira} onChange={e => change({ jira: e.target.value })}/>
              <button className="icon-btn"><I.External size={14}/></button>
            </div>
          </div>
          <div className="field">
            <label className="label">Product Review link</label>
            <div className="row" style={{gap: 6}}>
              <input className="input" value={sprint.review} placeholder="paste JIRA review link" onChange={e => change({ review: e.target.value })}/>
              <button className="icon-btn"><I.External size={14}/></button>
            </div>
          </div>
          <div className="field">
            <label className="label">PRD link</label>
            <div className="row" style={{gap: 6}}>
              <input className="input" value={sprint.prd} onChange={e => change({ prd: e.target.value })}/>
              <button className="icon-btn"><I.External size={14}/></button>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <div style={{flex: 1, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)"}}>
            <I.Check size={12} style={{color: "var(--teal)"}}/> Auto-saving
          </div>
          <button className="btn danger"><I.Trash size={13}/> Archive</button>
          <button className="btn primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { Sprint });
