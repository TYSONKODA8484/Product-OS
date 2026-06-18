import { describe, it, expect } from 'vitest'
import { useLinksStore } from './linksStore'

describe('linksStore', () => {
  it('saveLink adds a new link with a generated id when no id given', () => {
    const before = useLinksStore.getState().links.length
    useLinksStore.getState().saveLink({ name: 'Test', url: 'https://test.com', cat: 'Docs' })
    expect(useLinksStore.getState().links.length).toBe(before + 1)
    expect(useLinksStore.getState().links[0].name).toBe('Test')
  })

  it('saveLink updates an existing link when id given', () => {
    const existing = useLinksStore.getState().links[0]
    useLinksStore.getState().saveLink({ ...existing, name: 'Renamed' })
    expect(useLinksStore.getState().links.find(l => l.id === existing.id)?.name).toBe('Renamed')
  })

  it('deleteLink removes by id', () => {
    const id = useLinksStore.getState().links[0].id
    useLinksStore.getState().deleteLink(id)
    expect(useLinksStore.getState().links.find(l => l.id === id)).toBeUndefined()
  })
})
