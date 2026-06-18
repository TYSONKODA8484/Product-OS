import { describe, it, expect } from 'vitest'
import { useNotificationsStore } from './notificationsStore'

describe('notificationsStore', () => {
  it('dismiss("all") marks every notification read', () => {
    useNotificationsStore.getState().dismiss('all')
    expect(useNotificationsStore.getState().notifications.every(n => n.read)).toBe(true)
  })

  it('dismiss(id) removes a single notification', () => {
    const id = useNotificationsStore.getState().notifications[0].id
    useNotificationsStore.getState().dismiss(id)
    expect(useNotificationsStore.getState().notifications.find(n => n.id === id)).toBeUndefined()
  })
})
