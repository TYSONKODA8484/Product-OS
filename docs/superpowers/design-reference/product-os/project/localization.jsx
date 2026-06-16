// Localization v2 — input → generate → download

// Platform-specific language sets (iOS uses Apple's locale codes; Android uses BCP-47 with region tags)
const LANGS_IOS = [
  { code: "en", name: "English", lproj: "en" },
  { code: "es", name: "Spanish", lproj: "es" },
  { code: "fr", name: "French", lproj: "fr" },
  { code: "de", name: "German", lproj: "de" },
  { code: "it", name: "Italian", lproj: "it" },
  { code: "pt-PT", name: "Portuguese (Portugal)", lproj: "pt-PT" },
  { code: "pt-BR", name: "Portuguese (Brazil)", lproj: "pt-BR" },
  { code: "nl", name: "Dutch", lproj: "nl" },
  { code: "sv", name: "Swedish", lproj: "sv" },
  { code: "da", name: "Danish", lproj: "da" },
  { code: "no", name: "Norwegian", lproj: "nb" },
  { code: "fi", name: "Finnish", lproj: "fi" },
  { code: "pl", name: "Polish", lproj: "pl" },
  { code: "ru", name: "Russian", lproj: "ru" },
  { code: "uk", name: "Ukrainian", lproj: "uk" },
  { code: "tr", name: "Turkish", lproj: "tr" },
  { code: "ar", name: "Arabic", lproj: "ar" },
  { code: "he", name: "Hebrew", lproj: "he" },
  { code: "hi", name: "Hindi", lproj: "hi" },
  { code: "id", name: "Indonesian", lproj: "id" },
  { code: "ja", name: "Japanese", lproj: "ja" },
  { code: "ko", name: "Korean", lproj: "ko" },
  { code: "th", name: "Thai", lproj: "th" },
  { code: "vi", name: "Vietnamese", lproj: "vi" },
  { code: "zh-Hans", name: "Chinese (Simplified)", lproj: "zh-Hans" },
  { code: "zh-Hant", name: "Chinese (Traditional)", lproj: "zh-Hant" },
];

const LANGS_ANDROID = [
  { code: "en", name: "English", folder: "values" },
  { code: "es", name: "Spanish", folder: "values-es" },
  { code: "fr", name: "French", folder: "values-fr" },
  { code: "de", name: "German", folder: "values-de" },
  { code: "it", name: "Italian", folder: "values-it" },
  { code: "pt", name: "Portuguese", folder: "values-pt" },
  { code: "pt-BR", name: "Portuguese (Brazil)", folder: "values-pt-rBR" },
  { code: "nl", name: "Dutch", folder: "values-nl" },
  { code: "pl", name: "Polish", folder: "values-pl" },
  { code: "ru", name: "Russian", folder: "values-ru" },
  { code: "tr", name: "Turkish", folder: "values-tr" },
  { code: "ar", name: "Arabic", folder: "values-ar" },
  { code: "hi", name: "Hindi", folder: "values-hi" },
  { code: "bn", name: "Bengali", folder: "values-bn" },
  { code: "id", name: "Indonesian", folder: "values-in" },
  { code: "ms", name: "Malay", folder: "values-ms" },
  { code: "ja", name: "Japanese", folder: "values-ja" },
  { code: "ko", name: "Korean", folder: "values-ko" },
  { code: "th", name: "Thai", folder: "values-th" },
  { code: "vi", name: "Vietnamese", folder: "values-vi" },
  { code: "zh-CN", name: "Chinese (Simplified)", folder: "values-zh-rCN" },
  { code: "zh-TW", name: "Chinese (Traditional)", folder: "values-zh-rTW" },
];

// Parse input: support both raw lines and "key = Value" / "key: Value" / "key,Value" formats
function parseInput(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  return lines.map((line, i) => {
    let key, val;
    const m1 = line.match(/^([a-zA-Z0-9_.]+)\s*[=:|]\s*(.+)$/);
    if (m1) { key = m1[1]; val = m1[2].trim(); }
    else { val = line; key = "string_" + (i + 1); }
    // strip surrounding quotes
    val = val.replace(/^["']|["']$/g, "");
    return { key, en: val };
  });
}

function escapeCsv(s) {
  if (s == null) return "";
  s = String(s);
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function buildCsv(rows, languages, platform) {
  const colKey = platform === "iOS" ? "lproj" : "folder";
  const header = ["key", "en (source)", ...languages.filter(l => l.code !== "en").map(l => `${l.code} — ${l[colKey]}`)];
  const out = [header.map(escapeCsv).join(",")];
  rows.forEach(r => {
    const line = [r.key, r.en];
    languages.forEach(l => {
      if (l.code === "en") return;
      line.push(r[l.code] || "");
    });
    out.push(line.map(escapeCsv).join(","));
  });
  return out.join("\n");
}

function downloadCsv(filename, content) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);
}

const SAMPLE_INPUT = `btn_get_started = Get started
btn_continue = Continue
title_welcome = Welcome to your studio
label_email = Email address
label_password = Password
btn_save = Save
btn_share = Share
btn_remove_bg = Remove background
title_upgrade = Go Pro
msg_processing = Processing your photo, this may take a moment`;

function Localization() {
  const [platform, setPlatform] = React.useState("iOS");
  const [input, setInput] = React.useState(SAMPLE_INPUT);
  const [rows, setRows] = React.useState(null);
  const [generating, setGenerating] = React.useState(false);
  const [progress, setProgress] = React.useState({ done: 0, total: 0 });
  const [q, setQ] = React.useState("");
  const toast = useToast();

  const languages = platform === "iOS" ? LANGS_IOS : LANGS_ANDROID;
  const sourceCount = parseInput(input).length;

  const generate = async () => {
    const parsed = parseInput(input);
    if (parsed.length === 0) { toast("Add at least one string to localize"); return; }
    setGenerating(true);
    setRows(parsed.map(r => ({ ...r })));
    const targets = languages.filter(l => l.code !== "en");
    setProgress({ done: 0, total: targets.length });

    for (let i = 0; i < targets.length; i++) {
      const lang = targets[i];
      try {
        const list = parsed.map(r => `${r.key}: ${r.en}`).join("\n");
        const prompt = `Translate these short UI strings into ${lang.name} (${lang.code}). Keep them concise and natural for mobile UI. Return ONLY a JSON object mapping each key to its translation — no commentary, no markdown.\n\nInput:\n${list}\n\nReturn JSON like: {"key1":"translation1","key2":"translation2"}`;
        const txt = await window.claude.complete(prompt);
        let parsedResp = {};
        try {
          const m = txt.match(/\{[\s\S]*\}/);
          parsedResp = m ? JSON.parse(m[0]) : {};
        } catch { parsedResp = {}; }
        setRows(prev => prev.map(r => ({ ...r, [lang.code]: parsedResp[r.key] || "" })));
      } catch (e) {
        // skip on failure
      }
      setProgress({ done: i + 1, total: targets.length });
    }
    setGenerating(false);
    toast(`Localized into ${targets.length} languages`);
  };

  const download = () => {
    if (!rows) return;
    const csv = buildCsv(rows, languages, platform);
    const filename = `localization-${platform.toLowerCase()}-${new Date().toISOString().slice(0,10)}.csv`;
    downloadCsv(filename, csv);
    toast(`Downloaded ${filename}`);
  };

  const copyCsv = async () => {
    if (!rows) return;
    const csv = buildCsv(rows, languages, platform);
    try { await navigator.clipboard.writeText(csv); toast("CSV copied to clipboard"); }
    catch { toast("Copy failed"); }
  };

  const reset = () => { setRows(null); setProgress({ done: 0, total: 0 }); };

  const filtered = rows ? rows.filter(r => !q || r.key.toLowerCase().includes(q.toLowerCase()) || r.en.toLowerCase().includes(q.toLowerCase())) : [];

  return (
    <div className="content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Localization</h1>
          <p className="page-sub">
            {rows
              ? `Generated ${rows.length} strings × ${languages.length - 1} target languages for ${platform}.`
              : `Paste your source strings, pick a platform, and we'll localize everything in one shot.`}
          </p>
        </div>
        <div className="row">
          {rows && <button className="btn" onClick={reset}><I.ChevL size={14}/> Back to input</button>}
          {rows && <button className="btn" onClick={copyCsv}><I.Copy size={14}/> Copy CSV</button>}
          {rows && <button className="btn primary" onClick={download}><I.Download size={14}/> Download CSV</button>}
        </div>
      </div>

      {!rows && (
        <LocInput
          input={input} setInput={setInput}
          platform={platform} setPlatform={setPlatform}
          sourceCount={sourceCount}
          languages={languages}
          generate={generate}
          generating={generating}
          progress={progress}
        />
      )}

      {rows && (
        <LocResults
          rows={filtered}
          allRows={rows}
          languages={languages}
          platform={platform}
          q={q} setQ={setQ}
          generating={generating}
          progress={progress}
          onEdit={(key, lang, val) => setRows(arr => arr.map(r => r.key === key ? { ...r, [lang]: val } : r))}
        />
      )}
    </div>
  );
}

function LocInput({ input, setInput, platform, setPlatform, sourceCount, languages, generate, generating, progress }) {
  return (
    <div style={{display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, alignItems: "start"}}>
      <div className="card" style={{padding: 0, display: "flex", flexDirection: "column"}}>
        <div style={{padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
          <div>
            <div style={{fontSize: 13, fontWeight: 600}}>Source strings (English)</div>
            <div style={{fontSize: 11.5, color: "var(--text-muted)", marginTop: 2}}>
              Format: <span className="mono">key = value</span> per line. Or paste plain text — we'll auto-key it.
            </div>
          </div>
          <span className="badge gray">{sourceCount} strings</span>
        </div>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          spellCheck={false}
          placeholder={`btn_save = Save\ntitle_welcome = Welcome\nmsg_loading = Please wait…`}
          style={{
            width: "100%", minHeight: 380, resize: "vertical",
            padding: "14px 16px", border: "none", outline: "none",
            background: "transparent", color: "var(--text)",
            fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.55,
          }}/>
        <div style={{padding: "10px 16px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-sidebar)"}}>
          <span style={{fontSize: 11.5, color: "var(--text-muted)"}}>
            <I.Sparkle size={12} style={{verticalAlign: "-2px", marginRight: 4, color: "var(--blue)"}}/>
            Tip: keep strings short for natural mobile UI translations.
          </span>
          <button className="btn ghost sm" onClick={() => setInput(SAMPLE_INPUT)}>Load sample</button>
        </div>
      </div>

      <div className="card" style={{padding: 0}}>
        <div style={{padding: "12px 16px", borderBottom: "1px solid var(--border)"}}>
          <div style={{fontSize: 13, fontWeight: 600}}>Target platform</div>
          <div style={{fontSize: 11.5, color: "var(--text-muted)", marginTop: 2}}>
            iOS and Android use different locale codes and folder layouts.
          </div>
        </div>
        <div style={{padding: 16}}>
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16}}>
            {["iOS", "Android"].map(p => (
              <div key={p}
                   onClick={() => setPlatform(p)}
                   style={{
                     padding: "16px 14px", borderRadius: 8,
                     border: `1.5px solid ${platform === p ? "var(--blue)" : "var(--border-strong)"}`,
                     background: platform === p ? "var(--blue-soft)" : "var(--bg-input)",
                     cursor: "pointer", transition: "all 0.1s",
                   }}>
                <div style={{fontSize: 13, fontWeight: 600, color: platform === p ? "var(--blue-dark)" : "var(--text)"}}>{p}</div>
                <div style={{fontSize: 11, color: "var(--text-muted)", marginTop: 4}}>
                  {p === "iOS" ? `${LANGS_IOS.length} locales · .lproj` : `${LANGS_ANDROID.length} locales · values-*`}
                </div>
              </div>
            ))}
          </div>

          <div style={{fontSize: 11.5, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: 6}}>
            Target languages ({languages.length})
          </div>
          <div style={{display: "flex", flexWrap: "wrap", gap: 4, maxHeight: 130, overflow: "auto", marginBottom: 16}}>
            {languages.map(l => (
              <span key={l.code} className="app-tag" title={l.name} style={{margin: 0}}>
                {l.code}
              </span>
            ))}
          </div>

          {generating ? (
            <div style={{padding: 14, background: "var(--blue-soft)", borderRadius: 7, marginBottom: 10}}>
              <div className="row" style={{justifyContent: "space-between", marginBottom: 8}}>
                <div className="row" style={{gap: 8, fontSize: 13, fontWeight: 500, color: "var(--blue-dark)"}}>
                  <Spinner size={14}/> Localizing…
                </div>
                <span className="mono" style={{fontSize: 12, color: "var(--blue-dark)"}}>{progress.done} / {progress.total}</span>
              </div>
              <div style={{height: 5, background: "rgba(55,138,221,0.2)", borderRadius: 99, overflow: "hidden"}}>
                <div style={{width: `${(progress.done / Math.max(progress.total, 1)) * 100}%`, height: "100%", background: "var(--blue)", transition: "width 0.2s"}}/>
              </div>
            </div>
          ) : (
            <button className="btn primary" onClick={generate} disabled={sourceCount === 0} style={{width: "100%", justifyContent: "center", padding: "10px 14px"}}>
              <I.Sparkle size={14}/> Localize {sourceCount} string{sourceCount === 1 ? "" : "s"} into {languages.length - 1} languages
            </button>
          )}
          <div style={{fontSize: 11, color: "var(--text-subtle)", marginTop: 8, textAlign: "center"}}>
            Powered by Claude. Output downloads as a {platform}-formatted CSV.
          </div>
        </div>
      </div>
    </div>
  );
}

function LocResults({ rows, allRows, languages, platform, q, setQ, generating, progress, onEdit }) {
  const colKey = platform === "iOS" ? "lproj" : "folder";
  return (
    <>
      <div className="row gap-16 mb-20" style={{justifyContent: "space-between"}}>
        <div className="row gap-12">
          <span className="badge blue"><I.Check size={11}/>{platform}</span>
          <span style={{fontSize: 12.5, color: "var(--text-muted)"}}>
            {allRows.length} strings · {languages.length - 1} languages · {platform === "iOS" ? "Apple locale codes" : "Android resource folders"}
          </span>
        </div>
        <div className="row gap-12">
          {generating && (
            <span className="row" style={{gap: 6, fontSize: 12, color: "var(--blue-dark)"}}>
              <Spinner size={12}/> Translating {progress.done}/{progress.total}
            </span>
          )}
          <div className="search-box" style={{width: 240}}>
            <I.Search size={14}/>
            <input placeholder="Filter strings…" value={q} onChange={e => setQ(e.target.value)}/>
          </div>
        </div>
      </div>

      <div className="loc-grid-wrap">
        <table className="loc">
          <thead>
            <tr>
              <th className="key-col">String key</th>
              {languages.map(l => (
                <th key={l.code} title={l.name + " — " + l[colKey]}>
                  <div style={{display: "flex", alignItems: "center", gap: 6}}>
                    <span style={{fontWeight: 700}}>{l.code}</span>
                    <span style={{color: "var(--text-subtle)", fontWeight: 400, textTransform: "none", letterSpacing: 0, fontFamily: "var(--font-mono)", fontSize: 10}}>
                      {l[colKey]}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(s => (
              <tr key={s.key}>
                <td className="key-col">{s.key}</td>
                {languages.map(l => {
                  const val = s[l.code] || (l.code === "en" ? s.en : "");
                  const max = Math.max(1, s.en.length) * 1.4;
                  const warn = val.length > max && l.code !== "en";
                  const pending = generating && !val && l.code !== "en";
                  return (
                    <td key={l.code} className={`loc-cell ${warn ? "warn" : ""}`} style={pending ? {background: "var(--bg-sidebar)"} : {}}>
                      {pending ? (
                        <div style={{padding: "2px 0", color: "var(--text-subtle)", fontSize: 11}}>
                          <span style={{display: "inline-block", width: "60%", height: 8, background: "var(--gray-100)", borderRadius: 99}}/>
                        </div>
                      ) : (
                        <input value={val} onChange={e => onEdit(s.key, l.code, e.target.value)}/>
                      )}
                      <div className="charcount">{val.length}</div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

Object.assign(window, { Localization, LANGS_IOS, LANGS_ANDROID });
