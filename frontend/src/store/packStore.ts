import { create } from 'zustand'

export interface PackRow {
  id: string
  cat: string
  catTotal: number
  name: string
  mid: number | null
  live: string
  photo: boolean
  video: boolean
  link: string
  comment: string
  tag: string | null
}

export interface TagDef { id: string; label: string; bg: string; border: string }

export const TAG_DEFS: TagDef[] = [
  { id: 'yellow', label: 'Working / In scope', bg: '#FFF8C5', border: '#FACC15' },
  { id: 'blue', label: 'High priority', bg: '#DBE9F7', border: '#5B9BD5' },
  { id: 'cyan', label: 'Change / addition / redo', bg: '#CDEEEE', border: '#5BC0BE' },
  { id: 'orange', label: 'Prompts to review', bg: '#FCE4CB', border: '#F4A36C' },
  { id: 'red', label: 'Error — change ASAP', bg: '#FCD3D3', border: '#E26A6A' },
]

export const SHEETS = [
  { id: 'imp', label: 'IMP Links', count: 0 },
  { id: 'product', label: 'Product', count: 224 },
  { id: 'tryon', label: 'Try on', count: 330 },
  { id: 'mockup', label: 'Mockup', count: 331 },
  { id: 'solo_current', label: 'Solo (Current)', count: 218 },
  { id: 'solo_new', label: 'SOLO (!NEW)', count: 36 },
  { id: 'duo_current', label: 'Duo (Current)', count: 142 },
  { id: 'duo_new', label: 'DUO (!NEW)', count: 22 },
  { id: 'space', label: 'Space Design', count: 38 },
]

const API = '/api/pack'

interface PackState {
  rows: PackRow[]
  loading: boolean
  fetchRows: () => Promise<void>
  updateRow: (id: string, patch: Partial<PackRow>) => void
}

export const usePackStore = create<PackState>((set) => ({
  rows: [],
  loading: false,

  fetchRows: async () => {
    set({ loading: true })
    try {
      const res = await fetch(API)
      const rows: PackRow[] = await res.json()
      set({ rows, loading: false })
    } catch { set({ loading: false }) }
  },

  updateRow: (id, patch) => {
    set(s => ({ rows: s.rows.map(r => r.id === id ? { ...r, ...patch } : r) }))
    fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    }).catch(() => {})
  },
}))
