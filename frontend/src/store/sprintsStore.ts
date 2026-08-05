import { create } from 'zustand'

export interface Sprint {
  id: string
  feature: string
  app: string
  platforms: string[]
  stage: 'Design' | 'Product' | 'Dev' | 'QA' | 'Done'
  status: 'Current' | 'Next' | 'Done'
  eta: string
  blocker: string
  jira: string
  review: string
  prd: string
}

export const APPS = ['LightX', 'AI Leap', 'Photocut', 'StyleOn', 'StorYZ', 'Photoshoot']

// Kept for test resets
export const SPRINTS: Sprint[] = [
  { id: 's1', feature: 'Background remover v2', app: 'LightX', platforms: ['iOS', 'Android'], stage: 'Dev', status: 'Current', eta: 'May 28', blocker: '', jira: 'PROJ-2841', review: 'PROJ-2841-R', prd: 'doc/prd-bg-v2' },
  { id: 's2', feature: 'Onboarding redesign', app: 'AI Leap', platforms: ['iOS'], stage: 'Design', status: 'Current', eta: 'May 24', blocker: 'Waiting on illustrations', jira: 'PROJ-2812', review: '', prd: 'doc/onboard-r2' },
  { id: 's3', feature: 'Subscription paywall A/B', app: 'Photocut', platforms: ['iOS', 'Android', 'Web'], stage: 'QA', status: 'Current', eta: 'May 22', blocker: '', jira: 'PROJ-2855', review: 'PROJ-2855-R', prd: 'doc/paywall-ab' },
  { id: 's4', feature: 'AI try-on engine', app: 'StyleOn', platforms: ['iOS'], stage: 'Product', status: 'Next', eta: 'Jun 5', blocker: 'API contract pending', jira: 'PROJ-2901', review: '', prd: 'doc/tryon-engine' },
  { id: 's5', feature: 'Story templates pack', app: 'StorYZ', platforms: ['iOS', 'Android'], stage: 'Dev', status: 'Next', eta: 'Jun 9', blocker: '', jira: 'PROJ-2920', review: '', prd: 'doc/story-templates' },
  { id: 's6', feature: 'Push notif scheduler', app: 'LightX', platforms: ['Android'], stage: 'Dev', status: 'Next', eta: 'Jun 12', blocker: '', jira: 'PROJ-2933', review: '', prd: 'doc/push-sched' },
  { id: 's7', feature: 'Photo enhancer 4x', app: 'Photocut', platforms: ['iOS'], stage: 'Done', status: 'Done', eta: 'May 8', blocker: '', jira: 'PROJ-2701', review: 'PROJ-2701-R', prd: 'doc/enhancer-4x' },
  { id: 's8', feature: 'Localization for KR/JP', app: 'AI Leap', platforms: ['iOS', 'Android'], stage: 'Done', status: 'Done', eta: 'May 14', blocker: '', jira: 'PROJ-2780', review: 'PROJ-2780-R', prd: 'doc/loc-krjp' },
  { id: 's9', feature: 'Camera UI refresh', app: 'LightX', platforms: ['iOS'], stage: 'Design', status: 'Next', eta: 'Jun 18', blocker: 'Pending design review', jira: 'PROJ-2960', review: '', prd: 'doc/camera-ui' },
  { id: 's10', feature: 'Outfit recommender', app: 'StyleOn', platforms: ['iOS', 'Android'], stage: 'Product', status: 'Next', eta: 'Jun 22', blocker: '', jira: 'PROJ-2981', review: '', prd: 'doc/outfit-rec' },
  { id: 's11', feature: 'Bulk export tool', app: 'Photocut', platforms: ['Web'], stage: 'QA', status: 'Current', eta: 'May 27', blocker: '', jira: 'PROJ-2890', review: 'PROJ-2890-R', prd: 'doc/bulk-export' },
  { id: 's12', feature: 'Highlight reels', app: 'StorYZ', platforms: ['iOS'], stage: 'Dev', status: 'Current', eta: 'May 30', blocker: 'Video codec issue on iOS 17', jira: 'PROJ-2845', review: '', prd: 'doc/highlight-reels' },
]

const STATUS_ORDER: Sprint['status'][] = ['Current', 'Next', 'Done']
const API = '/api/sprints'

interface SprintsState {
  sprints: Sprint[]
  loading: boolean
  fetchSprints: () => Promise<void>
  cycleStatus: (id: string) => Promise<void>
  updateSprint: (id: string, patch: Partial<Sprint>) => Promise<void>
  addSprint: (data: Omit<Sprint, 'id'>) => Promise<Sprint>
  deleteSprint: (id: string) => Promise<void>
}

export const useSprintsStore = create<SprintsState>((set, get) => ({
  sprints: [],
  loading: false,

  fetchSprints: async () => {
    set({ loading: true })
    try {
      const res = await fetch(API)
      const sprints: Sprint[] = await res.json()
      set({ sprints, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  cycleStatus: async (id) => {
    const sprint = get().sprints.find(s => s.id === id)
    if (!sprint) return
    const nextStatus = STATUS_ORDER[(STATUS_ORDER.indexOf(sprint.status) + 1) % 3]
    set(s => ({ sprints: s.sprints.map(sp => sp.id === id ? { ...sp, status: nextStatus } : sp) }))
    try {
      await fetch(`${API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
    } catch {}
  },

  updateSprint: async (id, patch) => {
    set(s => ({ sprints: s.sprints.map(sp => sp.id === id ? { ...sp, ...patch } : sp) }))
    try {
      await fetch(`${API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
    } catch {}
  },

  addSprint: async (data) => {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const sprint: Sprint = await res.json()
    set(s => ({ sprints: [sprint, ...s.sprints] }))
    return sprint
  },

  deleteSprint: async (id) => {
    set(s => ({ sprints: s.sprints.filter(sp => sp.id !== id) }))
    try {
      await fetch(`${API}/${id}`, { method: 'DELETE' })
    } catch {}
  },
}))
