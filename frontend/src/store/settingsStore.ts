import { create } from 'zustand'

export interface UserProfile {
  name: string
  email: string
  role: string
}

const API = '/api/settings'

interface SettingsState {
  profile: UserProfile
  loading: boolean
  fetchSettings: () => Promise<void>
  updateSettings: (patch: Partial<UserProfile>) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  profile: { name: '', email: '', role: '' },
  loading: false,

  fetchSettings: async () => {
    set({ loading: true })
    try {
      const res = await fetch(API)
      const profile: UserProfile = await res.json()
      set({ profile, loading: false })
    } catch { set({ loading: false }) }
  },

  updateSettings: (patch) => {
    set(s => ({ profile: { ...s.profile, ...patch } }))
    fetch(API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    }).catch(() => {})
  },
}))
