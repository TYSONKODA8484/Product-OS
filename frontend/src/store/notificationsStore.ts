import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Notification {
  id: string
  title: string
  date: string
  type: 'sprint' | 'global' | 'manual'
  read: boolean
}

const SEED: Notification[] = [
  { id: 'nt1', title: 'Paywall A/B ships in 3 days', date: 'May 22', type: 'sprint', read: false },
  { id: 'nt2', title: 'Memorial Day (US)', date: 'May 26', type: 'global', read: false },
  { id: 'nt3', title: 'Onboarding redesign ETA', date: 'May 24', type: 'sprint', read: false },
  { id: 'nt4', title: 'Quarterly OKR review', date: 'May 20', type: 'manual', read: false },
  { id: 'nt5', title: 'Bulk export QA pass', date: 'May 27', type: 'sprint', read: true },
]

interface NotificationsState {
  notifications: Notification[]
  dismiss: (id: string) => void
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      notifications: SEED,
      dismiss: (id) => set((s) => ({
        notifications: id === 'all'
          ? s.notifications.map(n => ({ ...n, read: true }))
          : s.notifications.filter(n => n.id !== id),
      })),
    }),
    { name: 'productos-notifications' }
  )
)
