import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { I } from './Icon'
import { useUiStore } from '../../store/uiStore'
import { useNotificationsStore } from '../../store/notificationsStore'

const PAGE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard', calendar: 'Calendar', sprint: 'Sprint Tracker',
  pack: 'Pack Dashboard', localization: 'Localization', notes: 'Notes',
  ai: 'AI Assistant', links: 'Important Links', settings: 'Settings',
  ga: 'GA Implementation', deeplinks: 'Deeplinks',
}

export function Topbar() {
  const { pathname } = useLocation()
  const activeKey = pathname.split('/')[1] || 'dashboard'
  const { theme, toggleTheme } = useUiStore()
  const { notifications, dismiss } = useNotificationsStore()
  const [notifOpen, setNotifOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) { setNotifOpen(false); setMenuOpen(false) }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const unread = notifications.filter(n => !n.read).length

  return (
    <header className="topbar" ref={wrap}>
      <div className="crumb">
        <span>Workspace</span>
        <span className="sep">/</span>
        <span className="current">{PAGE_LABELS[activeKey] || 'Dashboard'}</span>
      </div>
      <div className="topbar-spacer"/>
      <div className="search-box">
        <I.Search size={14}/>
        <input placeholder="Search sprints, notes, links…"/>
        <span className="kbd">⌘K</span>
      </div>
      <button className={`icon-btn ${notifOpen ? 'active' : ''}`} onClick={() => { setNotifOpen(o => !o); setMenuOpen(false) }} title="Notifications">
        <I.Bell/>
        {unread > 0 && <span className="dot"/>}
      </button>
      <button className="icon-btn" onClick={toggleTheme} title={theme === 'light' ? 'Dark mode' : 'Light mode'}>
        {theme === 'light' ? <I.Moon/> : <I.Sun/>}
      </button>
      <div className="avatar" onClick={() => { setMenuOpen(m => !m); setNotifOpen(false) }}>JS</div>

      {notifOpen && (
        <div className="popover" style={{ right: 80, minWidth: 380 }}>
          <div className="popover-head">
            <h4>Notifications</h4>
            <button className="btn ghost sm" onClick={() => dismiss('all')}>Mark all read</button>
          </div>
          <div style={{ maxHeight: 380, overflow: 'auto' }}>
            {notifications.length === 0 ? (
              <div className="empty"><I.Bell size={28}/><div className="e-title">All caught up</div><div className="e-sub">No new events</div></div>
            ) : notifications.map(n => (
              <div key={n.id} className="popover-item" style={{ opacity: n.read ? 0.6 : 1 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 6,
                  background: n.type === 'sprint' ? 'var(--blue)' : n.type === 'global' ? 'var(--amber)' : 'var(--gray-400)',
                }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{n.title}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                    {n.date} · <span style={{ textTransform: 'capitalize' }}>{n.type}</span>
                  </div>
                </div>
                <button className="icon-btn" style={{ width: 22, height: 22 }} onClick={() => dismiss(n.id)}>
                  <I.X size={12}/>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="popover" style={{ right: 16, minWidth: 200 }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Jordan Singh</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>jordan@productos.app</div>
          </div>
          <div className="popover-item" onClick={() => setMenuOpen(false)}><I.Gear size={14}/> <span style={{ fontSize: 13 }}>Account settings</span></div>
        </div>
      )}
    </header>
  )
}
