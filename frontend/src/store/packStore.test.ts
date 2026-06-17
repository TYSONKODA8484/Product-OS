import { describe, it, expect } from 'vitest'
import { usePackStore } from './packStore'

describe('packStore', () => {
  it('updateRow patches a single row and persists to localStorage', () => {
    const id = usePackStore.getState().rows[0].id
    usePackStore.getState().updateRow(id, { name: 'New Name' })
    expect(usePackStore.getState().rows.find(r => r.id === id)?.name).toBe('New Name')
    const stored = JSON.parse(localStorage.getItem('productos-pack') || '{}')
    expect(stored.state.rows.find((r: any) => r.id === id).name).toBe('New Name')
  })
})
