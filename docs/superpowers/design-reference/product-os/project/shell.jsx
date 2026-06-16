// Sidebar + Topbar + Login

function Sidebar({ active, onNav, collapsed, onToggle, onLogout }) {
  const items = [
    { id: "dashboard", label: "Dashboard", icon: I.Home },
    { id: "calendar", label: "Calendar", icon: I.Calendar, badge: 4 },
    { id: "sprint", label: "Sprint Tracker", icon: I.Check },
    { id: "pack", label: "Pack Dashboard", icon: I.Package },
    { id: "loc", label: "Localization", icon: I.Globe },
    { id: "notes", label: "Notes", icon: I.Note },
    { id: "ai", label: "AI Assistant", icon: I.Chat },
    { id: "links", label: "Important Links", icon: I.Link },
  ];
  return (
    <aside className="sidebar">
      <button className="sidebar-toggle" onClick={onToggle} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
        {collapsed ? <I.ChevR size={12}/> : <I.ChevL size={12}/>}
      </button>
      <div className="sidebar-brand">
        <div className="brand-mark">P</div>
        <div className="brand-text">Product<span className="dot">OS</span></div>
      </div>
      {!collapsed && <div className="sidebar-section-label">Workspace</div>}
      {items.map(it => {
        const Ic = it.icon;
        return (
          <div key={it.id}
               className={`nav-item ${active === it.id ? "active" : ""}`}
               onClick={() => onNav(it.id)}
               title={collapsed ? it.label : ""}>
            <Ic/>
            <span>{it.label}</span>
            {it.badge ? <span className="badge">{it.badge}</span> : null}
          </div>
        );
      })}
      <div className="sidebar-spacer"/>
      <div className="sidebar-footer">
        <div className={`nav-item ${active === "settings" ? "active" : ""}`} onClick={() => onNav("settings")} title={collapsed ? "Settings" : ""}>
          <I.Gear/><span>Settings</span>
        </div>
        <div className="nav-item" onClick={onLogout} title={collapsed ? "Sign out" : ""}>
          <I.Logout/><span>Sign out</span>
        </div>
      </div>
    </aside>
  );
}

const PAGE_LABELS = {
  dashboard: "Dashboard",
  calendar: "Calendar",
  sprint: "Sprint Tracker",
  pack: "Pack Dashboard",
  loc: "Localization",
  notes: "Notes",
  ai: "AI Assistant",
  links: "Important Links",
  settings: "Settings",
};

function Topbar({ active, theme, onTheme, onLogout, notifications, onDismissNotif }) {
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const wrap = React.useRef(null);

  React.useEffect(() => {
    const onClick = (e) => {
      if (!wrap.current?.contains(e.target)) { setNotifOpen(false); setMenuOpen(false); }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const unread = notifications.filter(n => !n.read).length;

  return (
    <header className="topbar" ref={wrap}>
      <div className="crumb">
        <span>Workspace</span>
        <span className="sep">/</span>
        <span className="current">{PAGE_LABELS[active] || "Dashboard"}</span>
      </div>
      <div className="topbar-spacer"/>
      <div className="search-box">
        <I.Search size={14}/>
        <input placeholder="Search sprints, notes, links…"/>
        <span className="kbd">⌘K</span>
      </div>
      <button className={`icon-btn ${notifOpen ? "active" : ""}`} onClick={() => { setNotifOpen(o => !o); setMenuOpen(false); }} title="Notifications">
        <I.Bell/>
        {unread > 0 && <span className="dot"/>}
      </button>
      <button className="icon-btn" onClick={onTheme} title={theme === "light" ? "Dark mode" : "Light mode"}>
        {theme === "light" ? <I.Moon/> : <I.Sun/>}
      </button>
      <div className="avatar" onClick={() => { setMenuOpen(m => !m); setNotifOpen(false); }}>JS</div>

      {notifOpen && (
        <div className="popover" style={{ right: 80, minWidth: 380 }}>
          <div className="popover-head">
            <h4>Notifications</h4>
            <button className="btn ghost sm" onClick={() => onDismissNotif("all")}>Mark all read</button>
          </div>
          <div style={{ maxHeight: 380, overflow: "auto" }}>
            {notifications.length === 0 ? (
              <div className="empty"><I.Bell size={28}/><div className="e-title">All caught up</div><div className="e-sub">No new events</div></div>
            ) : notifications.map(n => (
              <div key={n.id} className="popover-item" style={{opacity: n.read ? 0.6 : 1}}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 6,
                  background: n.type === "sprint" ? "var(--blue)" : n.type === "global" ? "var(--amber)" : "var(--gray-400)"
                }}/>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{fontSize: 13, fontWeight: 500}}>{n.title}</div>
                  <div style={{fontSize: 11.5, color: "var(--text-muted)", marginTop: 2}}>
                    {n.date} · <span style={{textTransform: "capitalize"}}>{n.type}</span>
                  </div>
                </div>
                <button className="icon-btn" style={{width: 22, height: 22}} onClick={() => onDismissNotif(n.id)}>
                  <I.X size={12}/>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="popover" style={{ right: 16, minWidth: 200 }}>
          <div style={{padding: "12px 14px", borderBottom: "1px solid var(--border)"}}>
            <div style={{fontSize: 13, fontWeight: 600}}>Jordan Singh</div>
            <div style={{fontSize: 11.5, color: "var(--text-muted)"}}>jordan@productos.app</div>
          </div>
          <div className="popover-item" onClick={() => { setMenuOpen(false); }}><I.Gear size={14}/> <span style={{fontSize: 13}}>Account settings</span></div>
          <div className="popover-item" onClick={() => { setMenuOpen(false); onLogout(); }}><I.Logout size={14}/> <span style={{fontSize: 13}}>Sign out</span></div>
        </div>
      )}
    </header>
  );
}

function LoginScreen({ onLogin }) {
  const [email, setEmail] = React.useState("jordan@productos.app");
  const [pw, setPw] = React.useState("••••••••");
  const [loading, setLoading] = React.useState(false);
  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 600);
  };
  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={submit}>
        <div className="login-brand">
          <div className="brand-mark mark">P</div>
          <div>
            <div className="name">Product<span style={{color:"var(--blue)"}}>OS</span></div>
            <div style={{fontSize: 11.5, color: "var(--text-muted)", marginTop: -2}}>An operating system for PMs</div>
          </div>
        </div>
        <div>
          <h1 className="login-title">Sign in</h1>
          <p className="login-sub">Welcome back — enter your credentials to continue.</p>
        </div>
        <div className="login-form">
          <div className="field">
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="your email"
                   value={email} onChange={e => setEmail(e.target.value)} autoFocus/>
          </div>
          <div className="field">
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
              <label className="label">Password</label>
              <a className="login-link" style={{fontSize: 12}}>Forgot?</a>
            </div>
            <input className="input" type="password" placeholder="password"
                   value={pw} onChange={e => setPw(e.target.value)}/>
          </div>
          <div className="login-meta" style={{marginBottom: 14}}>
            <label className="checkbox"><input type="checkbox" defaultChecked/> Keep me signed in</label>
          </div>
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? <><Spinner/> Signing in…</> : "Sign in"}
          </button>
        </div>
        <div className="login-foot">
          New to ProductOS? <span className="login-link">Request an invite</span>
        </div>
      </form>
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar, LoginScreen, PAGE_LABELS });
