import { create } from 'zustand'

export interface CalendarEvent {
  id: string
  date: string
  title: string
  type: 'sprint' | 'global' | 'manual' | 'task'
  note?: string
}

const API = '/api/calendar'

interface CalendarState {
  events: CalendarEvent[]
  loading: boolean
  fetchEvents: () => Promise<void>
  addEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
}

export const useCalendarStore = create<CalendarState>((set) => ({
  events: [],
  loading: false,

  fetchEvents: async () => {
    set({ loading: true })
    try {
      const res = await fetch(API)
      const events: CalendarEvent[] = await res.json()
      set({ events, loading: false })
    } catch { set({ loading: false }) }
  },

  addEvent: async (event) => {
    const optimistic: CalendarEvent = { ...event, id: 'e' + Date.now() }
    set(s => ({ events: [...s.events, optimistic] }))
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      })
      const saved: CalendarEvent = await res.json()
      set(s => ({ events: s.events.map(e => e.id === optimistic.id ? saved : e) }))
    } catch {}
  },

  deleteEvent: async (id) => {
    set(s => ({ events: s.events.filter(e => e.id !== id) }))
    try { await fetch(`${API}/${id}`, { method: 'DELETE' }) } catch {}
  },
}))
