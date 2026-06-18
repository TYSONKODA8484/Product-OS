import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Link {
  id: string
  name: string
  url: string
  cat: string
}

const SAMPLE_LINKS: Link[] = [
  { id: 'l1', name: 'Product Roadmap (Master)', url: 'docs.example.com/p/roadmap-master', cat: 'Docs' },
  { id: 'l2', name: 'Q3 Planning Sheet', url: 'sheets.example.com/q3-plan', cat: 'Sheets' },
  { id: 'l3', name: 'JIRA — Active Sprint', url: 'jira.example.com/sprint/active', cat: 'JIRA' },
  { id: 'l4', name: 'Design System v3', url: 'figma.example.com/ds-v3', cat: 'Designs' },
  { id: 'l5', name: 'Onboarding Walkthrough Demo', url: 'vid.example.com/onboard-demo', cat: 'Videos' },
  { id: 'l6', name: 'Engineering Standards', url: 'docs.example.com/eng-standards', cat: 'Docs' },
  { id: 'l7', name: 'Localization Tracker', url: 'sheets.example.com/loc-tracker', cat: 'Sheets' },
  { id: 'l8', name: 'JIRA — Backlog', url: 'jira.example.com/backlog', cat: 'JIRA' },
  { id: 'l9', name: 'User Research Library', url: 'notes.example.com/research', cat: 'Docs' },
  { id: 'l10', name: 'Brand Asset Library', url: 'figma.example.com/brand', cat: 'Designs' },
  { id: 'l11', name: 'All-hands recordings', url: 'vid.example.com/all-hands', cat: 'Videos' },
  { id: 'l12', name: 'Incident postmortems', url: 'docs.example.com/postmortems', cat: 'Other' },
]

interface LinksState {
  links: Link[]
  saveLink: (link: Partial<Link> & { name: string; url: string; cat: string }) => void
  deleteLink: (id: string) => void
}

export const useLinksStore = create<LinksState>()(
  persist(
    (set) => ({
      links: SAMPLE_LINKS,
      saveLink: (link) => set((s) => ({
        links: link.id
          ? s.links.map(x => x.id === link.id ? { ...x, ...link } as Link : x)
          : [{ ...link, id: 'l' + Date.now() } as Link, ...s.links],
      })),
      deleteLink: (id) => set((s) => ({ links: s.links.filter(l => l.id !== id) })),
    }),
    { name: 'productos-links' }
  )
)
