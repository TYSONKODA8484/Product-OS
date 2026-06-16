// Sprint Tracker + Pack Dashboard + Localization

function Sprint({ sprints, setSprints }) {
  const [filters, setFilters] = React.useState({
    platform: [], apps: [], stage: [], status: [], week: "all"
  });
  const [open, setOpen] = React.useState(null);
  const [sort, setSort] = React.useState({ key: "status", dir: 1 });
  const toast = useToast();

  const toggle = (group, val) => {
    setFilters(f => ({
      ...f,
      [group]: f[group].includes(val) ? f[group].filter(x => x !== val) : [...f[group], val]
    }));
  };

  const active = Object.values(filters).some(v => Array.isArray(v) ? v.length : v !== "all");
  const clearAll = () => setFilters({ platform: [], apps: [], stage: [], status: [], week: "all" });

  const filtered = sprints.filter(s => {
    if (filters.platform.length && !s.platforms.some(p => filters.platform.includes(p))) return false;
    if (filters.apps.length && !filters.apps.includes(s.app)) return false;
    if (filters.stage.length && !filters.stage.includes(s.stage)) return false;
    if (filters.status.length && !filters.status.includes(s.status)) return false;
    return true;
  });

  const cycleStatus = (id) => {
    const order = ["Current", "Next", "Done"];
    setSprints(ss => ss.map(s => s.id === id ? { ...s, status: order[(order.indexOf(s.status) + 1) % 3] } : s));
    toast("Status updated");
  };

  const update = (id, patch) => {
    setSprints(ss => ss.map(s => s.id === id ? { ...s, ...patch } : s));
  };

  return (
    <div className="content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sprint Tracker</h1>
          <p className="page-sub">{filtered.length} of {sprints.length} sprints · Click any card to edit details. Status updates in real time.</p>
        </div>
        <div className="row">
          <button className="btn"><I.Download size={14}/> Export</button>
          <button className="btn primary"><I.Plus size={14}/> New sprint</button>
        </div>
      </div>

      <div className="sprint-filterbar">
        <div className="fbar-group">
          <span className="label">Platform</span>
          {["iOS","Android","Web"].map(p => (
            <div key={p} className={`chip ${filters.platform.includes(p) ? "active" : ""}`} onClick={() => toggle("platform", p)}>{p}</div>
          ))}
        </div>
        <div className="fbar-group">
          <span className="label">Stage</span>
          {["Design","Product","Dev","QA"].map(s => (
            <div key={s} className={`chip ${filters.stage.includes(s) ? "active" : ""}`} onClick={() => toggle("stage", s)}>{s}</div>
          ))}
        </div>
        <div className="fbar-group">
          <span className="label">Status</span>
          {["Current","Next","Done"].map(s => (
            <div key={s} className={`chip ${filters.status.includes(s) ? "active" : ""}`} onClick={() => toggle("status", s)}>{s}</div>
          ))}
        </div>
        <div className="fbar-group">
          <span className="label">App</span>
          <select className="select" style={{width: 130, padding: "5px 8px", fontSize: 12}}
                  value={filters.apps[0] || ""}
                  onChange={e => setFilters(f => ({...f, apps: e.target.value ? [e.target.value] : []}))}>
            <option value="">All apps</option>
            {APPS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div style={{flex: 1}}/>
        {active && <button className="btn ghost sm" onClick={clearAll}><I.X size={12}/> Clear filters</button>}
      </div>

      <div style={{display: "grid", gridTemplateColumns: "32px 1.7fr 1fr 100px 110px 1.2fr 28px", gap: 14, padding: "6px 16px 8px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: 600, alignItems: "center"}}>
        <div/>
        <div onClick={() => setSort({key: "feature", dir: -sort.dir})} style={{cursor: "pointer"}}>Feature</div>
        <div>Platform · App</div>
        <div onClick={() => setSort({key: "stage", dir: -sort.dir})} style={{cursor: "pointer"}}>Stage</div>
        <div onClick={() => setSort({key: "status", dir: -sort.dir})} style={{cursor: "pointer"}}>Status / ETA</div>
        <div>Blocker / Notes</div>
        <div/>
      </div>

      {filtered.length === 0 && (
        <div className="card empty">
          <I.Search size={28}/>
          <div className="e-title">No sprints match your filters</div>
          <div className="e-sub">Try clearing some filters or adjust the date range.</div>
        </div>
      )}

      {filtered.map(s => (
        <div key={s.id} className="sprint-card" onClick={() => setOpen(s.id)}>
          <AppLogo name={s.app}/>
          <div>
            <div className="feat">{s.feature}</div>
            <div className="meta">{s.app}</div>
          </div>
          <div className="stage">
            {s.platforms.map(p => <span key={p} className="app-tag">{p}</span>)}
          </div>
          <div><StatusBadge status={s.stage}/></div>
          <div>
            <div onClick={(e) => { e.stopPropagation(); cycleStatus(s.id); }}>
              <StatusBadge status={s.status}/>
            </div>
            <div className="meta" style={{marginTop: 2, fontSize: 11.5}}>ETA {s.eta}</div>
          </div>
          <div className={`blocker ${s.blocker ? "warn" : ""}`}>
            {s.blocker ? (<><I.Alert size={12} style={{verticalAlign: "-2px", marginRight: 4}}/>{s.blocker}</>) : <span style={{color: "var(--text-subtle)"}}>No blockers</span>}
          </div>
          <div style={{color: "var(--text-subtle)"}}><I.ChevR/></div>
        </div>
      ))}

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

function SprintDrawer({ sprint, onClose, onUpdate }) {
  const toast = useToast();
  const change = (patch) => { onUpdate(patch); toast("Saved"); };

  return (
    <>
      <div className="drawer-overlay" onClick={onClose}/>
      <div className="drawer">
        <div className="modal-head">
          <div className="row">
            <AppLogo name={sprint.app}/>
            <div>
              <h3>{sprint.feature}</h3>
              <div style={{fontSize: 11.5, color: "var(--text-muted)", marginTop: 2, fontFamily: "var(--font-mono)"}}>{sprint.jira}</div>
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

// =================== Pack Dashboard ===================
function Pack({ pack, setPack }) {
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState("");
  const [status, setStatus] = React.useState([]);
  const [editId, setEditId] = React.useState(null);
  const toast = useToast();

  const toggleStatus = (s) => setStatus(arr => arr.includes(s) ? arr.filter(x => x !== s) : [...arr, s]);

  const filtered = pack.filter(p => {
    if (q && !(`${p.id} ${p.name} ${p.cat} ${p.sub}`.toLowerCase().includes(q.toLowerCase()))) return false;
    if (cat && p.cat !== cat) return false;
    if (status.length && !status.includes(p.status)) return false;
    return true;
  });

  const updateCell = (id, key, val) => {
    setPack(arr => arr.map(p => p.id === id ? { ...p, [key]: val } : p));
  };

  return (
    <div className="content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pack Dashboard</h1>
          <p className="page-sub">{filtered.length} of {pack.length} models · Click any cell to edit inline.</p>
        </div>
        <button className="btn primary"><I.Plus size={14}/> Add model</button>
      </div>

      <div className="pack-toolbar">
        <div className="search-box" style={{width: 380}}>
          <I.Search size={14}/>
          <input placeholder="Search by name, model ID, category…" value={q} onChange={e => setQ(e.target.value)}/>
        </div>
        <select className="select" style={{width: 220}} value={cat} onChange={e => setCat(e.target.value)}>
          <option value="">All categories</option>
          {PACK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="chip-row">
          {["Live","Pending","Inactive"].map(s => (
            <div key={s} className={`chip ${status.includes(s) ? "active" : ""}`} onClick={() => toggleStatus(s)}>{s}</div>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table className="dt">
          <thead>
            <tr>
              <th>Category</th>
              <th>Sub</th>
              <th>Product</th>
              <th style={{width: 100}}>Model ID</th>
              <th style={{width: 100}}>Status</th>
              <th style={{width: 180}}>App context</th>
              <th>Comments</th>
              <th style={{width: 40}}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td>
                  <div style={{fontWeight: 500}}>{p.cat.split(" - ")[0]}</div>
                  <div style={{fontSize: 11.5, color: "var(--text-muted)"}}>{p.cat.split(" - ")[1]}</div>
                </td>
                <td className="cell-edit"><EditableCell value={p.sub} onSave={v => { updateCell(p.id, "sub", v); toast("Saved"); }}/></td>
                <td className="cell-edit"><EditableCell value={p.name} onSave={v => { updateCell(p.id, "name", v); toast("Saved"); }} bold/></td>
                <td className="mono" style={{color: "var(--text-muted)", fontSize: 11.5}}>{p.id}</td>
                <td>
                  <select className="select" value={p.status} style={{padding: "3px 6px", fontSize: 11.5, fontWeight: 600, width: "auto", color: p.status === "Live" ? "var(--teal)" : p.status === "Pending" ? "var(--amber)" : "var(--text-muted)"}}
                          onChange={e => { updateCell(p.id, "status", e.target.value); toast("Status updated"); }}>
                    <option>Live</option><option>Pending</option><option>Inactive</option>
                  </select>
                </td>
                <td>
                  {p.apps.map(a => <span key={a} className="app-tag">{a}</span>)}
                </td>
                <td className="cell-edit" style={{color: "var(--text-muted)"}}>
                  <EditableCell value={p.comments} placeholder="Add note…" onSave={v => { updateCell(p.id, "comments", v); toast("Saved"); }}/>
                </td>
                <td>
                  <button className="icon-btn" onClick={() => setEditId(p.id)} style={{width: 26, height: 26}}><I.Pencil size={13}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{padding: "10px 16px", fontSize: 11.5, color: "var(--text-muted)", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between"}}>
          <span>Showing {filtered.length} of {pack.length} products</span>
          <span>Page 1</span>
        </div>
      </div>

      {editId && (
        <PackDrawer item={pack.find(p => p.id === editId)} onClose={() => setEditId(null)}
                    onUpdate={patch => { setPack(arr => arr.map(p => p.id === editId ? {...p, ...patch} : p)); toast("Saved"); }}/>
      )}
    </div>
  );
}

function EditableCell({ value, onSave, placeholder, bold }) {
  const [edit, setEdit] = React.useState(false);
  const [v, setV] = React.useState(value);
  React.useEffect(() => setV(value), [value]);
  const commit = () => { setEdit(false); if (v !== value) onSave(v); };
  if (edit) {
    return <input autoFocus value={v} onChange={e => setV(e.target.value)} onBlur={commit}
                  onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setEdit(false); setV(value); } }}/>;
  }
  return (
    <div onClick={() => setEdit(true)} style={{minHeight: 18, fontWeight: bold ? 500 : 400, color: value ? "" : "var(--text-subtle)", fontStyle: value ? "normal" : "italic"}}>
      {value || placeholder || "—"}
    </div>
  );
}

function PackDrawer({ item, onClose, onUpdate }) {
  return (
    <>
      <div className="drawer-overlay" onClick={onClose}/>
      <div className="drawer">
        <div className="modal-head">
          <div>
            <h3>Edit model</h3>
            <div style={{fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--text-muted)", marginTop: 2}}>{item.id}</div>
          </div>
          <button className="icon-btn" onClick={onClose}><I.X/></button>
        </div>
        <div style={{padding: "20px 22px", flex: 1, overflow: "auto"}}>
          <div className="field">
            <label className="label">Category</label>
            <select className="select" value={item.cat} onChange={e => onUpdate({ cat: e.target.value })}>
              {PACK_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label">Subcategory</label>
            <input className="input" value={item.sub} onChange={e => onUpdate({ sub: e.target.value })}/>
          </div>
          <div className="field">
            <label className="label">Product name</label>
            <input className="input" value={item.name} onChange={e => onUpdate({ name: e.target.value })}/>
          </div>
          <div className="field">
            <label className="label">Live status</label>
            <select className="select" value={item.status} onChange={e => onUpdate({ status: e.target.value })}>
              <option>Live</option><option>Pending</option><option>Inactive</option>
            </select>
          </div>
          <div className="field">
            <label className="label">App context</label>
            <div className="chip-row">
              {["LX","PC","iOS","Android","AILeap","StorYZ","StyleOn"].map(a => (
                <div key={a} className={`chip ${item.apps.includes(a) ? "active" : ""}`}
                     onClick={() => onUpdate({ apps: item.apps.includes(a) ? item.apps.filter(x => x !== a) : [...item.apps, a] })}>
                  {a}
                </div>
              ))}
            </div>
          </div>
          <div className="field">
            <label className="label">Comments</label>
            <textarea className="textarea" value={item.comments} onChange={e => onUpdate({ comments: e.target.value })}/>
          </div>
        </div>
        <div className="modal-foot">
          <div style={{flex: 1, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)"}}>
            <I.Check size={12} style={{color: "var(--teal)"}}/> Auto-saving
          </div>
          <button className="btn primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </>
  );
}

// =================== Localization moved to localization.jsx ===================

Object.assign(window, { Sprint, Pack });
