import { create } from 'zustand'

export interface Deeplink {
  id: string
  name: string
  app: string
  path: string
  status: 'Active' | 'Draft' | 'Broken'
  description: string
  example: string
}

export const DL_APPS = ['LightX', 'AI Leap', 'Photocut', 'StyleOn', 'StorYZ', 'Photoshoot']
export const DL_STATUSES: Deeplink['status'][] = ['Active', 'Draft', 'Broken']

const API = '/api/deeplinks'

interface DeeplinksState {
  deeplinks: Deeplink[]
  loading: boolean
  fetchDeeplinks: () => Promise<void>
  addDeeplink: (data: Omit<Deeplink, 'id'>) => Promise<void>
  updateDeeplink: (id: string, patch: Partial<Deeplink>) => Promise<void>
  deleteDeeplink: (id: string) => Promise<void>
}

export const useDeeplinksStore = create<DeeplinksState>((set) => ({
  deeplinks: [],
  loading: false,

  fetchDeeplinks: async () => {
    set({ loading: true })
    try {
      const res = await fetch(API)
      const deeplinks: Deeplink[] = await res.json()
      set({ deeplinks, loading: false })
    } catch { set({ loading: false }) }
  },

  addDeeplink: async (data) => {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const saved: Deeplink = await res.json()
    set(s => ({ deeplinks: [saved, ...s.deeplinks] }))
  },

  updateDeeplink: async (id, patch) => {
    set(s => ({ deeplinks: s.deeplinks.map(d => d.id === id ? { ...d, ...patch } : d) }))
    try {
      await fetch(`${API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
    } catch {}
  },

  deleteDeeplink: async (id) => {
    set(s => ({ deeplinks: s.deeplinks.filter(d => d.id !== id) }))
    try { await fetch(`${API}/${id}`, { method: 'DELETE' }) } catch {}
  },
}))
