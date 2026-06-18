import { describe, it, expect } from 'vitest'
import { useUiStore } from './uiStore'

describe('uiStore', () => {
  it('toggleTheme flips between light and dark', () => {
    useUiStore.setState({ theme: 'light' })
    useUiStore.getState().toggleTheme()
    expect(useUiStore.getState().theme).toBe('dark')
    useUiStore.getState().toggleTheme()
    expect(useUiStore.getState().theme).toBe('light')
  })

  it('toggleSidebar flips collapsed state', () => {
    useUiStore.setState({ sidebarCollapsed: false })
    useUiStore.getState().toggleSidebar()
    expect(useUiStore.getState().sidebarCollapsed).toBe(true)
  })
})
