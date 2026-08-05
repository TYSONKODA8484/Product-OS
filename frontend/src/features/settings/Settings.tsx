import { useState, useEffect } from 'react'
import { useUiStore } from '../../store/uiStore'
import { useSettingsStore } from '../../store/settingsStore'
import { I } from '../../components/ui/Icon'

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'
}

function ToggleSwitch({ defaultOn }: { defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div onClick={() => setOn(!on)} style={{
      width: 34, height: 20, borderRadius: 99,
      background: on ? 'var(--blue)' : 'var(--gray-300)',
      position: 'relative', cursor: 'pointer', transition: 'background 0.15s',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: on ? 16 : 2,
        width: 16, height: 16, borderRadius: '50%',
        background: 'white', transition: 'left 0.15s',
        boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
      }}/>
    </div>
  )
}

export function Settings() {
  const { theme, toggleTheme } = useUiStore()
  const { profile, fetchSettings, updateSettings } = useSettingsStore()
  useEffect(() => { fetchSettings() }, [])
  return (
    <div className="content" style={{maxWidth: 720}}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Personal preferences. All changes save automatically.</p>
        </div>
      </div>
      <div className="card" style={{padding: 0}}>
        <div style={{padding: 16, borderBottom: '1px solid var(--border)'}}>
          <div style={{fontSize: 13, fontWeight: 600, marginBottom: 12}}>Appearance</div>
          <div className="row" style={{justifyContent: 'space-between'}}>
            <div>
              <div style={{fontSize: 13, fontWeight: 500}}>Theme</div>
              <div style={{fontSize: 12, color: 'var(--text-muted)'}}>Use the toggle in the navbar to switch instantly.</div>
            </div>
            <div className="chip-row">
              {(['light', 'dark'] as const).map(t => (
                <div key={t} className={`chip ${theme === t ? 'active' : ''}`} onClick={() => t !== theme && toggleTheme()}>
                  {t === 'light' ? <I.Sun size={12}/> : <I.Moon size={12}/>} {t}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{padding: 16, borderBottom: '1px solid var(--border)'}}>
          <div style={{fontSize: 13, fontWeight: 600, marginBottom: 12}}>Profile</div>
          <div className="row gap-16">
            <div className="avatar" style={{width: 56, height: 56, fontSize: 18}}>{initials(profile.name)}</div>
            <div style={{flex: 1}}>
              <div className="field">
                <label className="label">Display name</label>
                <input className="input" value={profile.name}
                       onChange={e => updateSettings({ name: e.target.value })}/>
              </div>
            </div>
          </div>
          <div className="field">
            <label className="label">Email</label>
            <input className="input" value={profile.email}
                   onChange={e => updateSettings({ email: e.target.value })}/>
          </div>
          <div className="field" style={{marginBottom: 0}}>
            <label className="label">Role</label>
            <input className="input" value={profile.role}
                   onChange={e => updateSettings({ role: e.target.value })}/>
          </div>
        </div>
        <div style={{padding: 16}}>
          <div style={{fontSize: 13, fontWeight: 600, marginBottom: 12}}>Notifications</div>
          {[
            { l: 'Sprint ETA reminders', on: true },
            { l: 'Global event alerts (holidays, etc.)', on: true },
            { l: 'Daily digest email', on: false },
            { l: 'Mention notifications', on: true },
          ].map(opt => (
            <div key={opt.l} className="row" style={{justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid var(--border)'}}>
              <span style={{fontSize: 13}}>{opt.l}</span>
              <ToggleSwitch defaultOn={opt.on}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
