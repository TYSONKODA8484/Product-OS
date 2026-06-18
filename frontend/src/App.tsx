import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from './components/ui/Sidebar'
import { Topbar } from './components/ui/Topbar'
import { ToastProvider } from './components/ui/Toast'
import { useUiStore } from './store/uiStore'
import { Dashboard } from './features/dashboard/Dashboard'
import { Calendar } from './features/calendar/Calendar'
import { Sprint } from './features/sprint/Sprint'
import { Pack } from './features/pack/Pack'
import { Localization } from './features/localization/Localization'
import { Notes } from './features/notes/Notes'
import { AIAssistant } from './features/ai-assistant/AIAssistant'
import { Links } from './features/links/Links'
import { Settings } from './features/settings/Settings'

export default function App() {
  const { theme, sidebarCollapsed } = useUiStore()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        document.querySelector<HTMLInputElement>('.topbar input')?.focus()
      }
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  return (
    <ToastProvider>
      <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Sidebar/>
        <div className="main-col">
          <Topbar/>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
            <Route path="/dashboard" element={<Dashboard/>}/>
            <Route path="/calendar" element={<Calendar/>}/>
            <Route path="/sprint" element={<Sprint/>}/>
            <Route path="/pack" element={<Pack/>}/>
            <Route path="/localization" element={<Localization/>}/>
            <Route path="/notes" element={<Notes/>}/>
            <Route path="/ai" element={<AIAssistant/>}/>
            <Route path="/links" element={<Links/>}/>
            <Route path="/settings" element={<Settings/>}/>
          </Routes>
        </div>
      </div>
    </ToastProvider>
  )
}
