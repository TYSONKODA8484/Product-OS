// Notes + AI Assistant + Important Links

function Notes({ notes, setNotes }) {
  const [selId, setSelId] = React.useState(notes[0]?.id || null);
  const [q, setQ] = React.useState("");
  const [savedAt, setSavedAt] = React.useState(null);
  const saveTimer = React.useRef(null);

  const filtered = notes.filter(n => !q || n.title.toLowerCase().includes(q.toLowerCase()) || n.body.toLowerCase().includes(q.toLowerCase()));
  const sel = notes.find(n => n.id === selId);

  const updateNote = (id, body) => {
    setNotes(arr => arr.map(n => {
      if (n.id !== id) return n;
      const firstLine = body.split("\n")[0].trim() || "Untitled";
      return { ...n, body, title: firstLine.slice(0, 60), updated: Date.now() };
    }));
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSavedAt(Date.now()), 500);
  };

  const newNote = () => {
    const id = "n" + Date.now();
    setNotes(arr => [{ id, title: "Untitled", body: "", updated: Date.now() }, ...arr]);
    setSelId(id);
  };

  const deleteNote = (id) => {
    setNotes(arr => {
      const rest = arr.filter(n => n.id !== id);
      if (id === selId) setSelId(rest[0]?.id || null);
      return rest;
    });
  };

  const relTime = (ts) => {
    const diff = Date.now() - ts;
    if (diff < 60_000) return "just now";
    if (diff < 3600_000) return Math.floor(diff/60_000) + "m ago";
    if (diff < 86400_000) return Math.floor(diff/3600_000) + "h ago";
    return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="content no-pad" style={{padding: 0}}>
      <div className="notes-shell">
        <aside className="notes-left">
          <button className="btn primary" onClick={newNote} style={{justifyContent: "center"}}>
            <I.Plus size={14}/> New note
          </button>
          <div className="search-box" style={{width: "100%"}}>
            <I.Search size={13}/>
            <input placeholder="Search notes…" value={q} onChange={e => setQ(e.target.value)}/>
          </div>
          <div className="notes-list">
            {filtered.length === 0 && (
              <div className="empty" style={{padding: "30px 16px"}}>
                <I.Note size={26}/>
                <div className="e-title">No notes</div>
                <div className="e-sub">Click "New note" to start</div>
              </div>
            )}
            {filtered.map(n => (
              <div key={n.id} className={`note-item ${selId === n.id ? "active" : ""}`} onClick={() => setSelId(n.id)}>
                <div className="ntitle">{n.title || "Untitled"}</div>
                <div className="npreview">{(n.body.split("\n")[1] || "").trim() || "No additional text"}</div>
                <div className="ndate">{relTime(n.updated)}</div>
                <div className="ndel" onClick={(e) => { e.stopPropagation(); deleteNote(n.id); }}>
                  <I.X size={11}/>
                </div>
              </div>
            ))}
          </div>
        </aside>
        <section className="notes-right">
          {sel ? (
            <>
              <div className="note-editor-head">
                <div>
                  <div style={{fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em"}}>{sel.title || "Untitled"}</div>
                  <div style={{fontSize: 11.5, color: "var(--text-muted)", marginTop: 2}}>Last edited {relTime(sel.updated)}</div>
                </div>
                <div className="row">
                  <span className="note-saved-tag">
                    <I.Check size={12} style={{color: "var(--teal)"}}/> Saved
                  </span>
                  <button className="icon-btn"><I.Copy size={14}/></button>
                  <button className="icon-btn" onClick={() => deleteNote(sel.id)}><I.Trash size={14}/></button>
                </div>
              </div>
              <div className="note-editor-body">
                <textarea value={sel.body} placeholder="Start typing your note…" onChange={e => updateNote(sel.id, e.target.value)}/>
              </div>
            </>
          ) : (
            <div className="empty" style={{margin: "auto"}}>
              <I.Note size={36}/>
              <div className="e-title">No note selected</div>
              <div className="e-sub">Pick a note from the sidebar or create a new one.</div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// =================== AI Assistant ===================
const SEED_CHAT = [
  { role: "ai", text: "Hi Jordan — I have access to your sprints, notes, calendar and pack data. What would you like to do?" },
  { role: "user", text: "What sprints am I supposed to ship this week?" },
  { role: "ai", text: "You have 3 sprints with ETAs in the next 7 days:\n\n• Bulk export tool (Photocut, Web) — ETA May 27\n• Background remover v2 (LightX, iOS/Android) — ETA May 28\n• Highlight reels (StorYZ, iOS) — ETA May 30\n\nOne flagged blocker: video codec issue on iOS 17 in Highlight reels. Want me to draft a status update for the team?" },
];

function AIAssistant() {
  const [msgs, setMsgs] = React.useState(SEED_CHAT);
  const [input, setInput] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const streamRef = React.useRef(null);

  React.useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  const send = () => {
    const txt = input.trim();
    if (!txt) return;
    setMsgs(m => [...m, { role: "user", text: txt }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const responses = [
        "I'll cross-reference your notes and the active sprint board. One option: pull the Q3 OKR doc, drop a status table at the top, and link to the JIRA tickets I find. Want me to draft that?",
        "Based on your Notes and recent sprints, here are 3 angles worth exploring — happy to expand any of them:\n\n1. Tighten the QA → ship handoff (avg 1.8 days right now)\n2. Cut paywall A/B variants from 4 to 2\n3. Pre-localize Korean and Japanese strings before kickoff\n\nWhich one should I dig into?",
        "Done. I pulled the relevant info from your sprint tracker and 2 notes. Let me know if you'd like a longer write-up or want this dropped into a new note.",
      ];
      const reply = responses[Math.floor(Math.random() * responses.length)];
      setMsgs(m => [...m, { role: "ai", text: reply }]);
      setTyping(false);
    }, 1200);
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="content no-pad" style={{padding: 0}}>
      <div className="chat-shell">
        <div className="chat-stream" ref={streamRef}>
          <div style={{maxWidth: 760, margin: "0 auto 8px", display: "flex", gap: 12, alignItems: "center", padding: "10px 14px", background: "var(--blue-soft)", borderRadius: 10, border: "1px solid rgba(55,138,221,0.2)"}}>
            <I.Sparkle size={18} style={{color: "var(--blue)"}}/>
            <div style={{flex: 1}}>
              <div style={{fontSize: 13, fontWeight: 500}}>AI has context from your workspace</div>
              <div style={{fontSize: 11.5, color: "var(--text-muted)"}}>5 notes · 12 sprints · upcoming calendar events</div>
            </div>
            <button className="btn ghost sm">Manage</button>
          </div>

          {msgs.map((m, i) => (
            <div key={i} className={`chat-row ${m.role}`}>
              <div className="chat-avatar">{m.role === "ai" ? "AI" : "JS"}</div>
              <div>
                <div className="chat-bubble" style={{whiteSpace: "pre-wrap"}}>{m.text}</div>
                {m.role === "ai" && (
                  <div className="chat-actions">
                    <button className="icon-btn" title="Copy"><I.Copy size={12}/></button>
                    <button className="icon-btn" title="Regenerate"><I.Refresh size={12}/></button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {typing && (
            <div className="chat-row ai">
              <div className="chat-avatar">AI</div>
              <div className="chat-bubble">
                <div className="typing"><span/><span/><span/></div>
              </div>
            </div>
          )}
        </div>

        <div className="chat-composer">
          <div style={{maxWidth: 760, margin: "0 auto 8px", display: "flex", gap: 6, justifyContent: "center"}}>
            {["Summarize this week's sprints", "Draft a release note for paywall A/B", "What's blocking the team?"].map(s => (
              <div key={s} className="chip" onClick={() => setInput(s)}>{s}</div>
            ))}
          </div>
          <div className="composer-inner">
            <button className="icon-btn" title="Attach note"><I.Paperclip size={14}/></button>
            <textarea rows={1} placeholder="Ask anything about your ProductOS workspace…"
                      value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey}/>
            <button className="send-btn" onClick={send} disabled={!input.trim()}>
              <I.Send size={14}/>
            </button>
          </div>
          <div style={{textAlign: "center", fontSize: 10.5, color: "var(--text-subtle)", marginTop: 6}}>
            AI Assistant can make mistakes. Verify important decisions before sharing.
          </div>
        </div>
      </div>
    </div>
  );
}

// =================== Important Links ===================
const CAT_ICONS = { Docs: I.Doc, Sheets: I.Sheet, JIRA: I.Jira, Designs: I.Design, Videos: I.Video, Other: I.Link };
const CAT_COLORS = {
  Docs: ["var(--blue-soft)", "var(--blue-dark)"],
  Sheets: ["var(--teal-soft)", "var(--teal)"],
  JIRA: ["var(--blue-soft)", "var(--blue)"],
  Designs: ["#F3E8FF", "#7C3AED"],
  Videos: ["var(--amber-soft)", "var(--amber)"],
  Other: ["var(--gray-100)", "var(--text-muted)"],
};

function Links({ links, setLinks }) {
  const [cat, setCat] = React.useState("All");
  const [q, setQ] = React.useState("");
  const [editing, setEditing] = React.useState(null);
  const toast = useToast();

  const cats = ["All", "Docs", "Sheets", "JIRA", "Designs", "Videos", "Other"];
  const filtered = links.filter(l =>
    (cat === "All" || l.cat === cat) &&
    (!q || l.name.toLowerCase().includes(q.toLowerCase()) || l.url.toLowerCase().includes(q.toLowerCase()))
  );

  const save = (l) => {
    if (l.id) setLinks(arr => arr.map(x => x.id === l.id ? l : x));
    else setLinks(arr => [{...l, id: "l" + Date.now()}, ...arr]);
    setEditing(null);
    toast("Saved");
  };

  const del = (id) => setLinks(arr => arr.filter(l => l.id !== id));

  return (
    <div className="content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Important Links</h1>
          <p className="page-sub">{filtered.length} of {links.length} links · One place for docs, sheets, JIRA queries, designs and videos.</p>
        </div>
        <button className="btn primary" onClick={() => setEditing({ name: "", url: "", cat: "Docs" })}>
          <I.Plus size={14}/> Add link
        </button>
      </div>

      <div className="row gap-16 mb-20" style={{justifyContent: "space-between"}}>
        <div className="chip-row">
          {cats.map(c => (
            <div key={c} className={`chip ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>
              {c}
              {c !== "All" && <span style={{marginLeft: 4, color: "var(--text-subtle)", fontSize: 10.5}}>{links.filter(l => l.cat === c).length}</span>}
            </div>
          ))}
        </div>
        <div className="search-box" style={{width: 280}}>
          <I.Search size={14}/>
          <input placeholder="Search links…" value={q} onChange={e => setQ(e.target.value)}/>
        </div>
      </div>

      <div className="links-grid">
        {filtered.map(l => {
          const Ic = CAT_ICONS[l.cat] || I.Link;
          const [bg, fg] = CAT_COLORS[l.cat] || CAT_COLORS.Other;
          return (
            <div key={l.id} className="link-card">
              <div className="link-icon" style={{background: bg, color: fg}}>
                <Ic size={18}/>
              </div>
              <div className="link-meta">
                <div className="link-title">{l.name}</div>
                <div className="link-url">{l.url}</div>
                <div style={{marginTop: 8, display: "flex", gap: 6, alignItems: "center"}}>
                  <span className="badge gray">{l.cat}</span>
                  <a className="btn ghost sm" style={{padding: "2px 6px"}}>Open <I.External size={11}/></a>
                </div>
              </div>
              <div className="link-actions">
                <button className="icon-btn" style={{width: 26, height: 26}} onClick={() => setEditing(l)}><I.Pencil size={12}/></button>
                <button className="icon-btn" style={{width: 26, height: 26}} onClick={() => del(l.id)}><I.Trash size={12}/></button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="card empty" style={{gridColumn: "1 / -1"}}>
            <I.Link size={28}/>
            <div className="e-title">No links found</div>
            <div className="e-sub">Try a different category or search term.</div>
          </div>
        )}
      </div>

      {editing && (
        <LinkModal link={editing} onClose={() => setEditing(null)} onSave={save}/>
      )}
    </div>
  );
}

function LinkModal({ link, onClose, onSave }) {
  const [l, setL] = React.useState(link);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{link.id ? "Edit link" : "Add link"}</h3>
          <button className="icon-btn" onClick={onClose}><I.X/></button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label className="label">Link name</label>
            <input className="input" autoFocus placeholder="e.g. Q3 Planning Sheet" value={l.name} onChange={e => setL({...l, name: e.target.value})}/>
          </div>
          <div className="field">
            <label className="label">URL</label>
            <input className="input" placeholder="https://…" value={l.url} onChange={e => setL({...l, url: e.target.value})}/>
          </div>
          <div className="field">
            <label className="label">Category</label>
            <div className="chip-row">
              {["Docs","Sheets","JIRA","Designs","Videos","Other"].map(c => (
                <div key={c} className={`chip ${l.cat === c ? "active" : ""}`} onClick={() => setL({...l, cat: c})}>{c}</div>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={() => onSave(l)} disabled={!l.name.trim() || !l.url.trim()}>
            {link.id ? "Save changes" : "Add link"}
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Notes, AIAssistant, Links });
