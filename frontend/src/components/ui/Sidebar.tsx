import { useLocation, useNavigate } from 'react-router-dom'
import { I } from './Icon'
import { useUiStore } from '../../store/uiStore'

const NAV_ITEMS = [
  { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: I.Home },
  { id: 'calendar', path: '/calendar', label: 'Calendar', icon: I.Calendar, badge: 4 },
  { id: 'sprint', path: '/sprint', label: 'Sprint Tracker', icon: I.Check },
  { id: 'pack', path: '/pack', label: 'Pack Dashboard', icon: I.Package },
  { id: 'localization', path: '/localization', label: 'Localization', icon: I.Globe },
  { id: 'notes', path: '/notes', label: 'Notes', icon: I.Note },
  { id: 'ai', path: '/ai', label: 'AI Assistant', icon: I.Chat },
  { id: 'links', path: '/links', label: 'Important Links', icon: I.Link },
]

export function Sidebar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { sidebarCollapsed, toggleSidebar } = useUiStore()

  return (
    <aside className="sidebar">
      <button className="sidebar-toggle" onClick={toggleSidebar} title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
        {sidebarCollapsed ? <I.ChevR size={12}/> : <I.ChevL size={12}/>}
      </button>
      <div className="sidebar-brand">
        <div className="brand-mark">P</div>
        <div className="brand-text">Product<span className="dot">OS</span></div>
      </div>
      {!sidebarCollapsed && <div className="sidebar-section-label">Workspace</div>}
      {NAV_ITEMS.map(it => {
        const Ic = it.icon
        const active = pathname.startsWith(it.path)
        return (
          <div key={it.id}
               className={`nav-item ${active ? 'active' : ''}`}
               onClick={() => navigate(it.path)}
               title={sidebarCollapsed ? it.label : ''}>
            <Ic/>
            <span>{it.label}</span>
            {it.badge ? <span className="badge">{it.badge}</span> : null}
          </div>
        )
      })}
      <div className="sidebar-spacer"/>
      <div className="sidebar-footer">
        <div className={`nav-item ${pathname.startsWith('/settings') ? 'active' : ''}`} onClick={() => navigate('/settings')} title={sidebarCollapsed ? 'Settings' : ''}>
          <I.Gear/><span>Settings</span>
        </div>
      </div>
    </aside>
  )
}
