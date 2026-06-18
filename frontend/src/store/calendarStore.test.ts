import { describe, it, expect } from 'vitest'
import { useCalendarStore } from './calendarStore'

describe('calendarStore', () => {
  it('addEvent appends an event with a generated id', () => {
    const before = useCalendarStore.getState().events.length
    useCalendarStore.getState().addEvent({ date: '2026-07-01', title: 'Test event', type: 'manual' })
    const events = useCalendarStore.getState().events
    expect(events.length).toBe(before + 1)
    expect(events[events.length - 1].title).toBe('Test event')
  })
})
