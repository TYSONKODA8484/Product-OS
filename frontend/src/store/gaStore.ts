import { create } from 'zustand'

export interface GAParam {
  name: string
  values: string
  comment: string
  apiKey: string
}

export interface GAEvent {
  id: string
  screen: string
  trigger: string
  event: string
  params: GAParam[]
  app: string
  platform: string
  status: 'Implemented' | 'Pending' | 'Broken'
  notes: string
}

export const GA_APPS = ['LightX', 'AI Leap', 'Photocut', 'StyleOn', 'StorYZ', 'Photoshoot']
export const GA_PLATFORMS = ['iOS', 'Android', 'Web', 'All']
export const GA_STATUSES: GAEvent['status'][] = ['Implemented', 'Pending', 'Broken']
export const GA_SCREENS = ['Onboarding', 'Homepage', 'Entry Points', 'Generation', 'Paywall']

const API = '/api/ga'

interface GAState {
  events: GAEvent[]
  loading: boolean
  fetchEvents: () => Promise<void>
  addEvent: (data: Omit<GAEvent, 'id'>) => Promise<void>
  updateEvent: (id: string, patch: Partial<GAEvent>) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
}

export const useGAStore = create<GAState>((set) => ({
  events: [],
  loading: false,

  fetchEvents: async () => {
    set({ loading: true })
    try {
      const res = await fetch(API)
      const events: GAEvent[] = await res.json()
      set({ events, loading: false })
    } catch { set({ loading: false }) }
  },

  addEvent: async (data) => {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const saved: GAEvent = await res.json()
    set(s => ({ events: [saved, ...s.events] }))
  },

  updateEvent: async (id, patch) => {
    set(s => ({ events: s.events.map(e => e.id === id ? { ...e, ...patch } : e) }))
    try {
      await fetch(`${API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
    } catch {}
  },

  deleteEvent: async (id) => {
    set(s => ({ events: s.events.filter(e => e.id !== id) }))
    try { await fetch(`${API}/${id}`, { method: 'DELETE' }) } catch {}
  },
}))
