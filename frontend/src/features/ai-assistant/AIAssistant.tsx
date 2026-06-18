import { useState, useRef, useEffect } from 'react'
import { I } from '../../components/ui/Icon'

const SEED_CHAT = [
  { role: 'ai', text: "Hi Jordan — I have access to your sprints, notes, calendar and pack data. What would you like to do?" },
  { role: 'user', text: "What sprints am I supposed to ship this week?" },
  { role: 'ai', text: "You have 3 sprints with ETAs in the next 7 days:\n\n• Bulk export tool (Photocut, Web) — ETA May 27\n• Background remover v2 (LightX, iOS/Android) — ETA May 28\n• Highlight reels (StorYZ, iOS) — ETA May 30\n\nOne flagged blocker: video codec issue on iOS 17 in Highlight reels. Want me to draft a status update for the team?" },
]

export function AIAssistant() {
  const [msgs, setMsgs] = useState(SEED_CHAT)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const streamRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: 'smooth' })
  }, [msgs, typing])

  const send = () => {
    const txt = input.trim()
    if (!txt) return
    setMsgs(m => [...m, { role: 'user', text: txt }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      const responses = [
        "I'll cross-reference your notes and the active sprint board. One option: pull the Q3 OKR doc, drop a status table at the top, and link to the JIRA tickets I find. Want me to draft that?",
        "Based on your Notes and recent sprints, here are 3 angles worth exploring — happy to expand any of them:\n\n1. Tighten the QA → ship handoff (avg 1.8 days right now)\n2. Cut paywall A/B variants from 4 to 2\n3. Pre-localize Korean and Japanese strings before kickoff\n\nWhich one should I dig into?",
        "Done. I pulled the relevant info from your sprint tracker and 2 notes. Let me know if you'd like a longer write-up or want this dropped into a new note.",
      ]
      setMsgs(m => [...m, { role: 'ai', text: responses[Math.floor(Math.random() * responses.length)] }])
      setTyping(false)
    }, 1200)
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="content no-pad" style={{padding: 0}}>
      <div className="chat-shell">
        <div className="chat-stream" ref={streamRef}>
          <div style={{maxWidth: 760, margin: '0 auto 8px', display: 'flex', gap: 12, alignItems: 'center', padding: '10px 14px', background: 'var(--blue-soft)', borderRadius: 10, border: '1px solid rgba(55,138,221,0.2)'}}>
            <I.Sparkle size={18} style={{color: 'var(--blue)'}}/>
            <div style={{flex: 1}}>
              <div style={{fontSize: 13, fontWeight: 500}}>AI has context from your workspace</div>
              <div style={{fontSize: 11.5, color: 'var(--text-muted)'}}>5 notes · 12 sprints · upcoming calendar events</div>
            </div>
            <button className="btn ghost sm">Manage</button>
          </div>

          {msgs.map((m, i) => (
            <div key={i} className={`chat-row ${m.role}`}>
              <div className="chat-avatar">{m.role === 'ai' ? 'AI' : 'JS'}</div>
              <div>
                <div className="chat-bubble" style={{whiteSpace: 'pre-wrap'}}>{m.text}</div>
                {m.role === 'ai' && (
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
          <div style={{maxWidth: 760, margin: '0 auto 8px', display: 'flex', gap: 6, justifyContent: 'center'}}>
            {["Summarize this week's sprints", 'Draft a release note for paywall A/B', "What's blocking the team?"].map(s => (
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
          <div style={{textAlign: 'center', fontSize: 10.5, color: 'var(--text-subtle)', marginTop: 6}}>
            AI Assistant can make mistakes. Verify important decisions before sharing.
          </div>
        </div>
      </div>
    </div>
  )
}
