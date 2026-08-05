import { create } from 'zustand'

export interface Link {
  id: string
  name: string
  url: string
  cat: string
}

export const SAMPLE_LINKS: Link[] = [
  { id: 'l1',  name: 'Product Roadmap (Master)',    url: 'docs.example.com/p/roadmap-master', cat: 'Docs'    },
  { id: 'l2',  name: 'Q3 Planning Sheet',           url: 'sheets.example.com/q3-plan',        cat: 'Sheets'  },
  { id: 'l3',  name: 'JIRA — Active Sprint',        url: 'jira.example.com/sprint/active',    cat: 'JIRA'    },
  { id: 'l12', name: 'Incident postmortems',        url: 'docs.example.com/postmortems',      cat: 'Other'   },
]

const API = '/api/links'

interface LinksState {
  links: Link[]
  loading: boolean
  fetchLinks: () => Promise<void>
  saveLink: (link: Partial<Link> & { name: string; url: string; cat: string }) => Promise<void>
  deleteLink: (id: string) => Promise<void>
}

export const useLinksStore = create<LinksState>((set) => ({
  links: [],
  loading: false,

  fetchLinks: async () => {
    set({ loading: true })
    try {
      const res = await fetch(API)
      const links: Link[] = await res.json()
      set({ links, loading: false })
    } catch { set({ loading: false }) }
  },

  saveLink: async (link) => {
    if (link.id) {
      set(s => ({ links: s.links.map(x => x.id === link.id ? { ...x, ...link } as Link : x) }))
      try {
        await fetch(`${API}/${link.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(link),
        })
      } catch {}
    } else {
      const optimistic: Link = { ...link, id: 'l' + Date.now() } as Link
      set(s => ({ links: [optimistic, ...s.links] }))
      try {
        const res = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(link),
        })
        const saved: Link = await res.json()
        set(s => ({ links: s.links.map(x => x.id === optimistic.id ? saved : x) }))
      } catch {}
    }
  },

  deleteLink: async (id) => {
    set(s => ({ links: s.links.filter(l => l.id !== id) }))
    try { await fetch(`${API}/${id}`, { method: 'DELETE' }) } catch {}
  },
}))
