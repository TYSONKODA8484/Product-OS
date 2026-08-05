import { create } from 'zustand'

export interface Note {
  id: string
  title: string
  body: string
  updated: number
}

const API = '/api/notes'

interface NotesState {
  notes: Note[]
  loading: boolean
  fetchNotes: () => Promise<void>
  updateNote: (id: string, body: string) => Promise<void>
  newNote: () => Promise<string>
  deleteNote: (id: string) => Promise<void>
}

export const SAMPLE_NOTES: Note[] = [
  { id: 'n1', title: 'Q3 OKRs draft', body: 'Q3 OKRs draft\n\nObjective 1: Improve onboarding', updated: Date.now() - 1800000 },
  { id: 'n2', title: 'Sprint 24 retro', body: 'Sprint 24 retro\n\nWhat went well', updated: Date.now() - 10800000 },
]

export const useNotesStore = create<NotesState>((set) => ({
  notes: [],
  loading: false,

  fetchNotes: async () => {
    set({ loading: true })
    try {
      const res = await fetch(API)
      const notes: Note[] = await res.json()
      set({ notes, loading: false })
    } catch { set({ loading: false }) }
  },

  updateNote: async (id, body) => {
    const h1 = body.match(/<h1[^>]*>(.*?)<\/h1>/i)
    const title = h1
      ? (h1[1].replace(/<[^>]+>/g, '').trim().slice(0, 60) || 'Untitled')
      : 'Untitled'
    const patch = { body, title, updated: Date.now() }
    set(s => ({ notes: s.notes.map(n => n.id === id ? { ...n, ...patch } : n) }))
    try {
      await fetch(`${API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
    } catch {}
  },

  newNote: async () => {
    const note: Note = { id: 'n' + Date.now(), title: 'Untitled', body: '', updated: Date.now() }
    set(s => ({ notes: [note, ...s.notes] }))
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      })
      const saved: Note = await res.json()
      set(s => ({ notes: s.notes.map(n => n.id === note.id ? saved : n) }))
      return saved.id
    } catch { return note.id }
  },

  deleteNote: async (id) => {
    set(s => ({ notes: s.notes.filter(n => n.id !== id) }))
    try { await fetch(`${API}/${id}`, { method: 'DELETE' }) } catch {}
  },
}))
