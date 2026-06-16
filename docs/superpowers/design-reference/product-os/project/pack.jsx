// Pack Dashboard v2 — spreadsheet-style, grouped categories, color tags

// Color pattern legend (matches the sheet's color coding)
const TAG_DEFS = [
  { id: "yellow", label: "Working / In scope", bg: "#FFF8C5", border: "#FACC15" },
  { id: "blue", label: "High priority", bg: "#DBE9F7", border: "#5B9BD5" },
  { id: "cyan", label: "Change / addition / redo", bg: "#CDEEEE", border: "#5BC0BE" },
  { id: "orange", label: "Prompts to review", bg: "#FCE4CB", border: "#F4A36C" },
  { id: "red", label: "Error — change ASAP", bg: "#FCD3D3", border: "#E26A6A" },
];
const TAG_MAP = Object.fromEntries(TAG_DEFS.map(t => [t.id, t]));

// Sheet structure: tabs across the bottom of the user's sheet
const SHEETS = [
  { id: "imp", label: "IMP Links", count: 0, kind: "links" },
  { id: "product", label: "Product", count: 224 },
  { id: "tryon", label: "Try on", count: 330 },
  { id: "mockup", label: "Mockup", count: 331 },
  { id: "solo_current", label: "Solo (Current)", count: 218 },
  { id: "solo_new", label: "SOLO (!NEW)", count: 36 },
  { id: "duo_current", label: "Duo (Current)", count: 142 },
  { id: "duo_new", label: "DUO (!NEW)", count: 22 },
  { id: "space", label: "Space Design", count: 38 },
];

// Sample rows for the Product sheet — grouped by category like the sheet
const PRODUCT_ROWS = [
  // Jewelry & Watches (316)
  { id: "MDL-J01", cat: "Jewelry & Watches", catTotal: 316, name: "Earring", mid: 68, live: "Yes", photo: false, video: false, link: "", comment: "", tag: "yellow" },
  { id: "MDL-J02", cat: "Jewelry & Watches", catTotal: 316, name: "Necklace", mid: 68, live: "Yes", photo: false, video: false, link: "", comment: "", tag: "yellow" },
  { id: "MDL-J03", cat: "Jewelry & Watches", catTotal: 316, name: "Ring", mid: 68, live: "Yes", photo: true, video: false, link: "", comment: "", tag: "yellow" },
  { id: "MDL-J04", cat: "Jewelry & Watches", catTotal: 316, name: "Diamond Bracelet", mid: 68, live: "Yes", photo: true, video: false, link: "", comment: "Photo refresh next sprint", tag: "yellow" },
  { id: "MDL-J05", cat: "Jewelry & Watches", catTotal: 316, name: "Bangle", mid: 68, live: "Yes", photo: false, video: false, link: "", comment: "", tag: "yellow" },
  { id: "MDL-J06", cat: "Jewelry & Watches", catTotal: 316, name: "Anklet", mid: 68, live: "Yes", photo: false, video: false, link: "", comment: "", tag: "yellow" },
  { id: "MDL-J07", cat: "Jewelry & Watches", catTotal: 316, name: "Chain", mid: null, live: "No", photo: false, video: false, link: "", comment: "", tag: null },
  { id: "MDL-J08", cat: "Jewelry & Watches", catTotal: 316, name: "Gold Pendant", mid: 68, live: "Yes", photo: false, video: false, link: "", comment: "", tag: "yellow" },
  { id: "MDL-J09", cat: "Jewelry & Watches", catTotal: 316, name: "Pearl Jewelry Set", mid: 68, live: "Yes", photo: false, video: false, link: "", comment: "", tag: "yellow" },
  { id: "MDL-J10", cat: "Jewelry & Watches", catTotal: 316, name: "Silver Jewelry", mid: 68, live: "", photo: false, video: false, link: "", comment: "", tag: null },
  { id: "MDL-J11", cat: "Jewelry & Watches", catTotal: 316, name: "Jhumka", mid: 68, live: "", photo: false, video: false, link: "", comment: "", tag: null },
  { id: "MDL-J12", cat: "Jewelry & Watches", catTotal: 316, name: "Luxury Watch", mid: 68, live: "Yes", photo: false, video: false, link: "", comment: "High Priority", tag: "blue" },
  { id: "MDL-J13", cat: "Jewelry & Watches", catTotal: 316, name: "Kundan Necklace", mid: 68, live: "Yes", photo: false, video: false, link: "", comment: "", tag: "yellow" },

  // Watch (42)
  { id: "MDL-W01", cat: "Watch", catTotal: 42, name: "Luxury Watch", mid: null, live: "", photo: false, video: false, link: "", comment: "", tag: null },
  { id: "MDL-W02", cat: "Watch", catTotal: 42, name: "Smart Watch", mid: null, live: "", photo: false, video: false, link: "", comment: "", tag: null },
  { id: "MDL-W03", cat: "Watch", catTotal: 42, name: "Kids Watch", mid: null, live: "", photo: false, video: false, link: "", comment: "", tag: null },
  { id: "MDL-W04", cat: "Watch", catTotal: 42, name: "Sports Watch", mid: null, live: "", photo: false, video: false, link: "", comment: "", tag: null },
  { id: "MDL-W05", cat: "Watch", catTotal: 42, name: "Casual Watch", mid: null, live: "", photo: false, video: false, link: "", comment: "", tag: null },

  // Skincare (88)
  { id: "MDL-S01", cat: "Skincare", catTotal: 88, name: "Serum", mid: 68, live: "Yes", photo: false, video: false, link: "", comment: "Satyam prompts", tag: "orange" },
  { id: "MDL-S02", cat: "Skincare", catTotal: 88, name: "Moisturizer", mid: 68, live: "Yes", photo: false, video: false, link: "", comment: "", tag: "yellow" },
  { id: "MDL-S03", cat: "Skincare", catTotal: 88, name: "Face Cleanser", mid: 68, live: "Yes", photo: false, video: false, link: "https://docs.example.com/face-cleanser", comment: "Announcement: product change", tag: "cyan" },
  { id: "MDL-S04", cat: "Skincare", catTotal: 88, name: "Toner", mid: 68, live: "Yes", photo: false, video: false, link: "", comment: "", tag: "yellow" },
  { id: "MDL-S05", cat: "Skincare", catTotal: 88, name: "Eye Cream", mid: 68, live: "Yes", photo: false, video: false, link: "", comment: "", tag: "yellow" },
  { id: "MDL-S06", cat: "Skincare", catTotal: 88, name: "Sunscreen SPF50", mid: 68, live: "No", photo: false, video: false, link: "", comment: "Error — fix tag overlap", tag: "red" },
  { id: "MDL-S07", cat: "Skincare", catTotal: 88, name: "Face Mask", mid: 68, live: "Yes", photo: false, video: false, link: "", comment: "", tag: "yellow" },

  // Apparel (124)
  { id: "MDL-A01", cat: "Apparel", catTotal: 124, name: "T-shirt Crew", mid: 68, live: "Yes", photo: true, video: false, link: "", comment: "", tag: "yellow" },
  { id: "MDL-A02", cat: "Apparel", catTotal: 124, name: "Hoodie Streetwear", mid: 68, live: "Yes", photo: true, video: false, link: "", comment: "", tag: "yellow" },
  { id: "MDL-A03", cat: "Apparel", catTotal: 124, name: "Denim Jacket", mid: 68, live: "Yes", photo: true, video: false, link: "", comment: "", tag: "yellow" },
  { id: "MDL-A04", cat: "Apparel", catTotal: 124, name: "Summer Dress", mid: 68, live: "Pending", photo: false, video: false, link: "", comment: "High priority for JP launch", tag: "blue" },
  { id: "MDL-A05", cat: "Apparel", catTotal: 124, name: "Blazer Formal", mid: 68, live: "Yes", photo: false, video: false, link: "", comment: "", tag: "yellow" },
  { id: "MDL-A06", cat: "Apparel", catTotal: 124, name: "Sneakers", mid: 68, live: "Yes", photo: false, video: false, link: "", comment: "", tag: "yellow" },
  { id: "MDL-A07", cat: "Apparel", catTotal: 124, name: "Heels Pumps", mid: 68, live: "", photo: false, video: false, link: "", comment: "", tag: null },
  { id: "MDL-A08", cat: "Apparel", catTotal: 124, name: "Handbag Tote", mid: 68, live: "Yes", photo: false, video: false, link: "", comment: "", tag: "yellow" },

  // Home & Living (54)
  { id: "MDL-H01", cat: "Home & Living", catTotal: 54, name: "Candle Pillar", mid: 68, live: "Yes", photo: false, video: false, link: "", comment: "", tag: "yellow" },
  { id: "MDL-H02", cat: "Home & Living", catTotal: 54, name: "Vase Ceramic", mid: 68, live: "Yes", photo: false, video: false, link: "", comment: "", tag: "yellow" },
  { id: "MDL-H03", cat: "Home & Living", catTotal: 54, name: "Throw Blanket", mid: 68, live: "Pending", photo: false, video: false, link: "", comment: "Redo on white BG", tag: "cyan" },
  { id: "MDL-H04", cat: "Home & Living", catTotal: 54, name: "Mug Coffee", mid: 68, live: "Yes", photo: false, video: false, link: "", comment: "", tag: "yellow" },
];

const SHEET_DATA = { product: PRODUCT_ROWS };

function Pack() {
  const [sheetId, setSheetId] = React.useState("product");
  const [rows, setRows] = React.useState(PRODUCT_ROWS);
  const [q, setQ] = React.useState("");
  const [tagFilter, setTagFilter] = React.useState([]);
  const [editId, setEditId] = React.useState(null);
  const toast = useToast();

  const filtered = rows.filter(r => {
    if (q && !`${r.name} ${r.cat} ${r.id} ${r.comment}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (tagFilter.length && !tagFilter.includes(r.tag)) return false;
    return true;
  });

  // Group rows by category for the merged first column
  const groups = React.useMemo(() => {
    const m = [];
    let last = null;
    filtered.forEach(r => {
      if (!last || last.cat !== r.cat) {
        last = { cat: r.cat, catTotal: r.catTotal, items: [r] };
        m.push(last);
      } else {
        last.items.push(r);
      }
    });
    return m;
  }, [filtered]);

  const update = (id, patch) => setRows(arr => arr.map(r => r.id === id ? { ...r, ...patch } : r));

  const totalLive = rows.filter(r => r.live === "Yes").length;
  const totalTagged = rows.filter(r => r.tag).length;

  return (
    <div className="content" style={{padding: "12px 24px 24px"}}>
      {/* Page row */}
      <div className="row" style={{justifyContent: "space-between", marginBottom: 10}}>
        <div className="row gap-12">
          <h1 style={{fontSize: 18, fontWeight: 600, margin: 0, letterSpacing: "-0.01em"}}>Pack Dashboard</h1>
          <span style={{fontSize: 12, color: "var(--text-muted)"}}>
            {filtered.length} of {rows.length} · {totalLive} live · {totalTagged} tagged
          </span>
        </div>
        <div className="row" style={{gap: 6}}>
          <button className="btn ghost sm"><I.Download size={13}/> Export</button>
          <button className="btn primary sm"><I.Plus size={13}/> Add row</button>
        </div>
      </div>

      {/* Sheet tabs */}
      <div className="sheet-tabs">
        {SHEETS.map(s => (
          <button key={s.id}
                  className={`sheet-tab ${sheetId === s.id ? "active" : ""}`}
                  onClick={() => { setSheetId(s.id); toast(`Opened "${s.label}"`); }}>
            {s.label}
            {s.count > 0 && <span className="sheet-count">{s.count}</span>}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="sheet-toolbar">
        <div className="search-box" style={{width: 280, padding: "4px 9px"}}>
          <I.Search size={13}/>
          <input placeholder="Search category, product, model id…" value={q} onChange={e => setQ(e.target.value)}/>
        </div>
        <div className="tb-divider"/>
        <span style={{fontSize: 11, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600}}>Filter by tag</span>
        <div className="row" style={{gap: 4}}>
          {TAG_DEFS.map(t => {
            const on = tagFilter.includes(t.id);
            return (
              <button key={t.id}
                      onClick={() => setTagFilter(arr => on ? arr.filter(x => x !== t.id) : [...arr, t.id])}
                      title={t.label}
                      className="tag-swatch"
                      style={{
                        background: t.bg,
                        borderColor: on ? "var(--text)" : t.border,
                        opacity: tagFilter.length === 0 || on ? 1 : 0.4,
                      }}/>
            );
          })}
          {tagFilter.length > 0 && <button className="btn ghost sm" onClick={() => setTagFilter([])} style={{padding: "2px 6px"}}>Clear</button>}
        </div>
        <div style={{flex: 1}}/>
        <span style={{fontSize: 11.5, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5}}>
          <I.Check size={12} style={{color: "var(--teal)"}}/> Auto-saving
        </span>
      </div>

      {/* The sheet */}
      <div className="sheet-wrap">
        <table className="sheet-table">
          <thead>
            <tr>
              <th style={{width: 44}} className="rownum"/>
              <th style={{width: 170}}>Category</th>
              <th style={{width: 240}}>Product</th>
              <th style={{width: 80}}>Model ID</th>
              <th style={{width: 90}}>Live</th>
              <th style={{width: 60}} className="center">Photo</th>
              <th style={{width: 60}} className="center">Video</th>
              <th style={{width: 60}} className="center">Link</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g, gi) => (
              <React.Fragment key={g.cat + gi}>
                {g.items.map((r, ri) => {
                  const tag = r.tag ? TAG_MAP[r.tag] : null;
                  const rowBg = tag ? tag.bg : "transparent";
                  const overallIdx = groups.slice(0, gi).reduce((sum, gg) => sum + gg.items.length, 0) + ri + 1;
                  return (
                    <tr key={r.id} className="sheet-row" onClick={() => setEditId(r.id)}
                        style={{background: rowBg}}>
                      <td className="rownum">{overallIdx}</td>
                      {ri === 0 ? (
                        <td className="cat-cell" rowSpan={g.items.length}>
                          <div className="cat-name">{g.cat}</div>
                          <div className="cat-total">({g.catTotal})</div>
                        </td>
                      ) : null}
                      <td className="prod-cell">
                        <InlineText value={r.name}
                                    onSave={v => { update(r.id, { name: v }); toast("Saved"); }}
                                    tag={tag}/>
                      </td>
                      <td className="mono mid-cell">
                        <InlineNum value={r.mid} onSave={v => { update(r.id, { mid: v }); toast("Saved"); }}/>
                      </td>
                      <td>
                        <LiveSelect value={r.live} onChange={v => { update(r.id, { live: v }); toast("Updated"); }}/>
                      </td>
                      <td className="center">
                        <CellCheckbox checked={r.photo} onChange={v => update(r.id, { photo: v })}/>
                      </td>
                      <td className="center">
                        <CellCheckbox checked={r.video} onChange={v => update(r.id, { video: v })}/>
                      </td>
                      <td className="center">
                        {r.link
                          ? <a href="#" onClick={(e) => e.stopPropagation()} className="link-icon-cell" title={r.link}><I.External size={13}/></a>
                          : <span style={{color: "var(--text-subtle)", fontSize: 14, opacity: 0.4}}>—</span>}
                      </td>
                      <td className="comment-cell">
                        <InlineText value={r.comment} placeholder=""
                                    onSave={v => { update(r.id, { comment: v }); toast("Saved"); }}/>
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9}>
                <div className="empty"><I.Search size={28}/><div className="e-title">Nothing matches</div><div className="e-sub">Clear filters or change your search.</div></div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="tag-legend">
        <span style={{fontSize: 11, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginRight: 4}}>Color pattern</span>
        {TAG_DEFS.map(t => (
          <span key={t.id} className="tag-legend-item">
            <span className="tag-swatch sm" style={{background: t.bg, borderColor: t.border}}/>
            {t.label}
          </span>
        ))}
      </div>

      {editId && (
        <PackEditDrawer
          row={rows.find(r => r.id === editId)}
          onClose={() => setEditId(null)}
          onUpdate={(patch) => { update(editId, patch); toast("Saved"); }}
        />
      )}
    </div>
  );
}

function InlineText({ value, onSave, placeholder = "", tag }) {
  const [edit, setEdit] = React.useState(false);
  const [v, setV] = React.useState(value);
  React.useEffect(() => setV(value), [value]);
  const commit = (e) => { e?.stopPropagation(); setEdit(false); if (v !== value) onSave(v); };
  if (edit) {
    return (
      <input autoFocus value={v}
             onClick={(e) => e.stopPropagation()}
             onChange={e => setV(e.target.value)}
             onBlur={commit}
             onKeyDown={e => { if (e.key === "Enter") commit(e); if (e.key === "Escape") { setEdit(false); setV(value); } }}
             className="sheet-input"/>
    );
  }
  return (
    <div className="sheet-textval" onClick={(e) => { e.stopPropagation(); setEdit(true); }}
         style={{color: value ? "" : "var(--text-subtle)", textDecoration: tag ? "underline" : "none", textDecorationColor: "rgba(0,0,0,0.18)", textDecorationThickness: "1px"}}>
      {value || placeholder || "\u00A0"}
    </div>
  );
}

function InlineNum({ value, onSave }) {
  const [edit, setEdit] = React.useState(false);
  const [v, setV] = React.useState(value ?? "");
  React.useEffect(() => setV(value ?? ""), [value]);
  const commit = (e) => { e?.stopPropagation(); setEdit(false); const n = v === "" ? null : Number(v); if (n !== value) onSave(n); };
  if (edit) {
    return (
      <input autoFocus type="number" value={v ?? ""}
             onClick={(e) => e.stopPropagation()}
             onChange={e => setV(e.target.value)}
             onBlur={commit}
             onKeyDown={e => { if (e.key === "Enter") commit(e); if (e.key === "Escape") setEdit(false); }}
             className="sheet-input num"/>
    );
  }
  return (
    <div className="sheet-textval center" onClick={(e) => { e.stopPropagation(); setEdit(true); }}
         style={{color: value == null ? "var(--text-subtle)" : ""}}>
      {value == null ? "—" : value}
    </div>
  );
}

function LiveSelect({ value, onChange }) {
  const cls = value === "Yes" ? "live-yes" : value === "No" ? "live-no" : value === "Pending" ? "live-pending" : "live-empty";
  return (
    <select className={`live-pill ${cls}`} value={value} onClick={(e) => e.stopPropagation()}
            onChange={e => onChange(e.target.value)}>
      <option value="">—</option>
      <option value="Yes">Yes</option>
      <option value="No">No</option>
      <option value="Pending">Pending</option>
    </select>
  );
}

function CellCheckbox({ checked, onChange }) {
  return (
    <span className="cellchk" onClick={(e) => { e.stopPropagation(); onChange(!checked); }}>
      <span className={`box ${checked ? "on" : ""}`}>
        {checked && <I.Check size={11}/>}
      </span>
    </span>
  );
}

function PackEditDrawer({ row, onClose, onUpdate }) {
  return (
    <>
      <div className="drawer-overlay" onClick={onClose}/>
      <div className="drawer">
        <div className="modal-head">
          <div>
            <h3>{row.name}</h3>
            <div style={{fontSize: 11.5, color: "var(--text-muted)", marginTop: 2}}>
              <span className="mono">{row.id}</span> · {row.cat}
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><I.X/></button>
        </div>
        <div style={{padding: "20px 22px", flex: 1, overflow: "auto"}}>
          <div className="field">
            <label className="label">Product name</label>
            <input className="input" value={row.name} onChange={e => onUpdate({ name: e.target.value })}/>
          </div>
          <div className="row gap-12">
            <div className="field" style={{flex: 1}}>
              <label className="label">Model ID</label>
              <input className="input" type="number" value={row.mid ?? ""} onChange={e => onUpdate({ mid: e.target.value === "" ? null : Number(e.target.value) })}/>
            </div>
            <div className="field" style={{flex: 1}}>
              <label className="label">Live</label>
              <select className="select" value={row.live} onChange={e => onUpdate({ live: e.target.value })}>
                <option value="">—</option>
                <option>Yes</option><option>No</option><option>Pending</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label className="label">Status tag</label>
            <div className="row" style={{gap: 6, flexWrap: "wrap"}}>
              <button className="tag-swatch sm" onClick={() => onUpdate({ tag: null })}
                      style={{background: "var(--bg)", borderStyle: "dashed"}}
                      title="No tag"/>
              {TAG_DEFS.map(t => (
                <button key={t.id}
                        onClick={() => onUpdate({ tag: t.id })}
                        title={t.label}
                        className="tag-swatch sm"
                        style={{background: t.bg, borderColor: row.tag === t.id ? "var(--text)" : t.border, borderWidth: row.tag === t.id ? 2 : 1}}/>
              ))}
            </div>
          </div>
          <div className="row gap-12">
            <div className="field" style={{flex: 1}}>
              <label className="checkbox"><input type="checkbox" checked={row.photo} onChange={e => onUpdate({ photo: e.target.checked })}/> Photo ready</label>
            </div>
            <div className="field" style={{flex: 1}}>
              <label className="checkbox"><input type="checkbox" checked={row.video} onChange={e => onUpdate({ video: e.target.checked })}/> Video ready</label>
            </div>
          </div>
          <div className="field">
            <label className="label">Link</label>
            <input className="input" placeholder="https://…" value={row.link} onChange={e => onUpdate({ link: e.target.value })}/>
          </div>
          <div className="field">
            <label className="label">Comment</label>
            <textarea className="textarea" value={row.comment} onChange={e => onUpdate({ comment: e.target.value })} placeholder="Optional note…"/>
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

Object.assign(window, { Pack });
