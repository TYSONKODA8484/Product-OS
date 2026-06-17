import { describe, it, expect, beforeEach } from 'vitest'
import { useSprintsStore } from './sprintsStore'

describe('sprintsStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useSprintsStore.setState({ sprints: useSprintsStore.getState().sprints })
  })

  it('cycles status Current -> Next -> Done -> Current', () => {
    const id = useSprintsStore.getState().sprints[0].id
    useSprintsStore.getState().cycleStatus(id)
    expect(useSprintsStore.getState().sprints.find(s => s.id === id)?.status).toBe('Next')
    useSprintsStore.getState().cycleStatus(id)
    expect(useSprintsStore.getState().sprints.find(s => s.id === id)?.status).toBe('Done')
    useSprintsStore.getState().cycleStatus(id)
    expect(useSprintsStore.getState().sprints.find(s => s.id === id)?.status).toBe('Current')
  })

  it('updateSprint patches fields without touching others', () => {
    const id = useSprintsStore.getState().sprints[0].id
    useSprintsStore.getState().updateSprint(id, { eta: 'Jun 1' })
    const s = useSprintsStore.getState().sprints.find(x => x.id === id)
    expect(s?.eta).toBe('Jun 1')
    expect(s?.feature).toBe('Background remover v2')
  })
})
