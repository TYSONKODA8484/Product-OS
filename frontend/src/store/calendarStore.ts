import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CalendarEvent {
  id: string
  date: string
  title: string
  type: 'sprint' | 'global' | 'manual'
}

const SAMPLE_EVENTS: CalendarEvent[] = [
  { id: 'e1', date: '2026-05-22', title: 'Paywall A/B ships', type: 'sprint' },
  { id: 'e2', date: '2026-05-24', title: 'Onboarding redesign', type: 'sprint' },
  { id: 'e3', date: '2026-05-26', title: 'Memorial Day (US)', type: 'global' },
  { id: 'e4', date: '2026-05-28', title: 'BG remover v2 ETA', type: 'sprint' },
  { id: 'e5', date: '2026-05-27', title: 'Bulk export QA', type: 'sprint' },
  { id: 'e6', date: '2026-05-30', title: 'Highlight reels release', type: 'sprint' },
  { id: 'e7', date: '2026-05-19', title: 'All-hands review', type: 'manual' },
  { id: 'e8', date: '2026-05-21', title: '1:1 with design lead', type: 'manual' },
  { id: 'e9', date: '2026-06-05', title: 'Try-on engine kickoff', type: 'sprint' },
  { id: 'e10', date: '2026-06-09', title: 'Story templates ship', type: 'sprint' },
  { id: 'e11', date: '2026-06-15', title: "Father's Day (US)", type: 'global' },
  { id: 'e12', date: '2026-06-19', title: 'Juneteenth (US)', type: 'global' },
  { id: 'e13', date: '2026-05-20', title: 'Quarterly OKR review', type: 'manual' },
]

interface CalendarState {
  events: CalendarEvent[]
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set) => ({
      events: SAMPLE_EVENTS,
      addEvent: (event) => set((s) => ({
        events: [...s.events, { ...event, id: 'e' + Date.now() }],
      })),
    }),
    { name: 'productos-calendar' }
  )
)
