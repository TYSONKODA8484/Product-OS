import { describe, it, expect, beforeEach } from 'vitest'
import { useLinksStore, SAMPLE_LINKS } from './linksStore'

describe('linksStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useLinksStore.setState({ links: SAMPLE_LINKS })
  })

  it('saveLink adds a new link with a generated id when no id given', () => {
    const before = useLinksStore.getState().links.length
    useLinksStore.getState().saveLink({ name: 'Test', url: 'https://test.com', cat: 'Docs' })
    expect(useLinksStore.getState().links.length).toBe(before + 1)
    expect(useLinksStore.getState().links[0].name).toBe('Test')
  })

  it('saveLink updates an existing link when id given', () => {
    const existing = useLinksStore.getState().links.find(l => l.id === 'l1')!
    useLinksStore.getState().saveLink({ ...existing, name: 'Renamed' })
    expect(useLinksStore.getState().links.find(l => l.id === 'l1')?.name).toBe('Renamed')
  })

  it('deleteLink removes by id', () => {
    useLinksStore.getState().deleteLink('l2')
    expect(useLinksStore.getState().links.find(l => l.id === 'l2')).toBeUndefined()
  })
})
