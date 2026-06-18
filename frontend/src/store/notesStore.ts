import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Note {
  id: string
  title: string
  body: string
  updated: number
}

const SAMPLE_NOTES: Note[] = [
  { id: 'n1', title: 'Q3 OKRs draft', body: 'Q3 OKRs draft\n\nObjective 1: Improve onboarding completion rate to 65%\n- KR1: Reduce signup-to-first-action time by 30%\n- KR2: Add interactive walkthrough to mobile flow\n- KR3: A/B test new welcome screen variants\n\nObjective 2: Ship localization to 6 new markets\n- Brazil, Mexico, Japan, Korea, Germany, France\n- Partner with regional marketing leads', updated: Date.now() - 1000 * 60 * 30 },
  { id: 'n2', title: 'Sprint 24 retro notes', body: 'Sprint 24 retro notes\n\nWhat went well:\n- Faster code review turnaround (avg 4h vs 9h)\n- Design QA caught 12 issues before staging\n- New feature flag system shipped on time\n\nWhat to improve:\n- Need clearer acceptance criteria on PRDs\n- Backend integration delayed iOS launch by 2 days\n\nAction items:\n- Schedule PRD walkthrough sessions every Tuesday\n- Set up async daily standups in Slack', updated: Date.now() - 1000 * 60 * 60 * 3 },
  { id: 'n3', title: 'User interview - Maya R.', body: 'User interview - Maya R.\nDesigner at fitness startup, age 31\n\nKey pain points:\n- Loses context switching between Figma and Notion\n- Wants AI to summarize Slack threads daily\n- Wishes she could @ mention specs from anywhere\n\nQuotes:\n"I have 14 tabs open right now and I\'m only on my 2nd coffee."\n"Why doesn\'t anything talk to anything else?"', updated: Date.now() - 1000 * 60 * 60 * 22 },
  { id: 'n4', title: 'Pricing experiment ideas', body: 'Pricing experiment ideas\n\n1. Annual-only on landing — push monthly to second step\n2. Show team-tier upgrade prompts when 3+ collabs added\n3. Free tier: cap at 5 projects vs current 3 — see if conversion improves\n4. Currency localization (we lose ~12% on USD-only in EU)', updated: Date.now() - 1000 * 60 * 60 * 24 * 2 },
  { id: 'n5', title: 'Competitive teardown', body: 'Competitive teardown\n\nTool A: strong workflow editor, weak mobile\nTool B: great mobile, no AI features yet\nTool C: dominant in enterprise, slow on shipping\n\nOur wedge: AI-native + cross-platform parity from day 1.', updated: Date.now() - 1000 * 60 * 60 * 24 * 5 },
]

interface NotesState {
  notes: Note[]
  updateNote: (id: string, body: string) => void
  newNote: () => string
  deleteNote: (id: string) => void
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set) => ({
      notes: SAMPLE_NOTES,
      updateNote: (id, body) => set((s) => ({
        notes: s.notes.map(n => {
          if (n.id !== id) return n
          const firstLine = body.split('\n')[0].trim() || 'Untitled'
          return { ...n, body, title: firstLine.slice(0, 60), updated: Date.now() }
        }),
      })),
      newNote: () => {
        const id = 'n' + Date.now()
        set((s) => ({ notes: [{ id, title: 'Untitled', body: '', updated: Date.now() }, ...s.notes] }))
        return id
      },
      deleteNote: (id) => set((s) => ({ notes: s.notes.filter(n => n.id !== id) })),
    }),
    { name: 'productos-notes' }
  )
)
