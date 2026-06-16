// Main App: routing + state container

function App() {
  const [signedIn, setSignedIn] = React.useState(true);
  const [page, setPage] = React.useState("dashboard");
  const [theme, setTheme] = React.useState("light");
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  // App-level state (shared across modules)
  const [sprints, setSprints] = React.useState(SPRINTS);
  const [pack, setPack] = React.useState(PACK_DATA);
  const [notes, setNotes] = React.useState(SAMPLE_NOTES);
  const [links, setLinks] = React.useState(SAMPLE_LINKS);
  const [events, setEvents] = React.useState(SAMPLE_EVENTS);
  const [notifications, setNotifications] = React.useState([
    { id: "nt1", title: "Paywall A/B ships in 3 days", date: "May 22", type: "sprint", read: false },
    { id: "nt2", title: "Memorial Day (US)", date: "May 26", type: "global", read: false },
    { id: "nt3", title: "Onboarding redesign ETA", date: "May 24", type: "sprint", read: false },
    { id: "nt4", title: "Quarterly OKR review", date: "May 20", type: "manual", read: false },
    { id: "nt5", title: "Bulk export QA pass", date: "May 27", type: "sprint", read: true },
  ]);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Cmd-K focuses search
  React.useEffect(() => {
    const k = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.querySelector(".topbar input")?.focus();
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  if (!signedIn) {
    return (
      <ToastProvider>
        <LoginScreen onLogin={() => setSignedIn(true)}/>
      </ToastProvider>
    );
  }

  const dismissNotif = (id) => {
    if (id === "all") setNotifications(arr => arr.map(n => ({...n, read: true})));
    else setNotifications(arr => arr.filter(n => n.id !== id));
  };

  const page_el = (() => {
    switch (page) {
      case "dashboard": return <Dashboard goTo={setPage}/>;
      case "calendar": return <Calendar events={events} setEvents={setEvents}/>;
      case "sprint": return <Sprint sprints={sprints} setSprints={setSprints}/>;
      case "pack": return <Pack pack={pack} setPack={setPack}/>;
      case "loc": return <Localization/>;
      case "notes": return <Notes notes={notes} setNotes={setNotes}/>;
      case "ai": return <AIAssistant/>;
      case "links": return <Links links={links} setLinks={setLinks}/>;
      case "settings": return <Settings theme={theme} setTheme={setTheme}/>;
      default: return <Dashboard goTo={setPage}/>;
    }
  })();

  return (
    <ToastProvider>
      <div className={`app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <Sidebar
          active={page}
          onNav={setPage}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(c => !c)}
          onLogout={() => setSignedIn(false)}
        />
        <div className="main-col">
          <Topbar
            active={page}
            theme={theme}
            onTheme={() => setTheme(t => t === "light" ? "dark" : "light")}
            onLogout={() => setSignedIn(false)}
            notifications={notifications}
            onDismissNotif={dismissNotif}
          />
          {page_el}
        </div>
      </div>
    </ToastProvider>
  );
}

function Settings({ theme, setTheme }) {
  return (
    <div className="content" style={{maxWidth: 720}}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Personal preferences. All changes save automatically.</p>
        </div>
      </div>
      <div className="card" style={{padding: 0}}>
        <div style={{padding: 16, borderBottom: "1px solid var(--border)"}}>
          <div style={{fontSize: 13, fontWeight: 600, marginBottom: 12}}>Appearance</div>
          <div className="row" style={{justifyContent: "space-between"}}>
            <div>
              <div style={{fontSize: 13, fontWeight: 500}}>Theme</div>
              <div style={{fontSize: 12, color: "var(--text-muted)"}}>Use the toggle in the navbar to switch instantly.</div>
            </div>
            <div className="chip-row">
              {["light","dark"].map(t => (
                <div key={t} className={`chip ${theme === t ? "active" : ""}`} onClick={() => setTheme(t)}>
                  {t === "light" ? <I.Sun size={12}/> : <I.Moon size={12}/>} {t}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{padding: 16, borderBottom: "1px solid var(--border)"}}>
          <div style={{fontSize: 13, fontWeight: 600, marginBottom: 12}}>Profile</div>
          <div className="row gap-16">
            <div className="avatar" style={{width: 56, height: 56, fontSize: 18}}>JS</div>
            <div style={{flex: 1}}>
              <div className="field"><label className="label">Display name</label><input className="input" defaultValue="Jordan Singh"/></div>
            </div>
          </div>
          <div className="field"><label className="label">Email</label><input className="input" defaultValue="jordan@productos.app"/></div>
          <div className="field" style={{marginBottom: 0}}><label className="label">Role</label><input className="input" defaultValue="Senior Product Manager"/></div>
        </div>
        <div style={{padding: 16}}>
          <div style={{fontSize: 13, fontWeight: 600, marginBottom: 12}}>Notifications</div>
          {[
            { l: "Sprint ETA reminders", on: true },
            { l: "Global event alerts (holidays, etc.)", on: true },
            { l: "Daily digest email", on: false },
            { l: "Mention notifications", on: true },
          ].map(opt => (
            <div key={opt.l} className="row" style={{justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid var(--border)"}}>
              <span style={{fontSize: 13}}>{opt.l}</span>
              <ToggleSwitch defaultOn={opt.on}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ToggleSwitch({ defaultOn }) {
  const [on, setOn] = React.useState(defaultOn);
  return (
    <div onClick={() => setOn(!on)} style={{
      width: 34, height: 20, borderRadius: 99,
      background: on ? "var(--blue)" : "var(--gray-300)",
      position: "relative", cursor: "pointer", transition: "background 0.15s",
    }}>
      <div style={{
        position: "absolute", top: 2, left: on ? 16 : 2,
        width: 16, height: 16, borderRadius: "50%",
        background: "white", transition: "left 0.15s",
        boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
      }}/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
