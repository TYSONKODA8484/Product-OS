import { create } from 'zustand'

export interface Task {
  id: string
  date: string
  title: string
  note?: string
  done: boolean
  priority: 'high' | 'medium' | 'low' | null
}

const API = '/api/tasks'

interface TasksState {
  tasks: Task[]
  loading: boolean
  fetchTasks: () => Promise<void>
  addTask: (task: Omit<Task, 'id'>) => Promise<void>
  updateTask: (id: string, patch: Partial<Task>) => void
  deleteTask: (id: string) => void
}

export const useTasksStore = create<TasksState>((set) => ({
  tasks: [],
  loading: false,

  fetchTasks: async () => {
    set({ loading: true })
    try {
      const res = await fetch(API)
      const tasks: Task[] = await res.json()
      set({ tasks, loading: false })
    } catch { set({ loading: false }) }
  },

  addTask: async (task) => {
    const optimistic: Task = { ...task, id: 't' + Date.now() }
    set(s => ({ tasks: [optimistic, ...s.tasks] }))
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      })
      const saved: Task = await res.json()
      set(s => ({ tasks: s.tasks.map(t => t.id === optimistic.id ? saved : t) }))
    } catch {}
  },

  updateTask: (id, patch) => {
    set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, ...patch } : t) }))
    fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    }).catch(() => {})
  },

  deleteTask: (id) => {
    set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }))
    fetch(`${API}/${id}`, { method: 'DELETE' }).catch(() => {})
  },
}))
