import { useState, useEffect, useMemo } from 'react'
import { useTasksStore } from '../../store/tasksStore'
import type { Task } from '../../store/tasksStore'
import { I } from '../../components/ui/Icon'

function pad(n: number) { return n < 10 ? '0' + n : '' + n }
function toISO(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }

const PRIORITY_COLOR: Record<string, string> = {
  high: 'var(--red)',
  medium: 'var(--amber)',
  low: 'var(--teal)',
}

type Filter = 'todo' | 'all' | 'done'
type AddForm = { title: string; date: string; note: string; priority: Task['priority'] }

export function Tasks() {
  const { tasks, loading, fetchTasks, addTask, updateTask, deleteTask } = useTasksStore()
  const [filter, setFilter] = useState<Filter>('todo')
  const [q, setQ] = useState('')
  const [addForm, setAddForm] = useState<AddForm | null>(null)

  useEffect(() => { fetchTasks() }, [])

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const todayISO = toISO(now)
  const tomorrowISO = toISO(new Date(todayStart + 86400000))

  const filtered = useMemo(() =>
    tasks
      .filter(t => filter === 'all' || (filter === 'todo' ? !t.done : t.done))
      .filter(t => !q || t.title.toLowerCase().includes(q.toLowerCase())),
  [tasks, filter, q])

  const groups = useMemo(() => {
    const overdue: Task[] = []
    const today: Task[] = []
    const tomorrow: Task[] = []
    const weekMap: Record<string, Task[]> = {}
    const later: Task[] = []
    const done: Task[] = []

    filtered.forEach(t => {
      if (t.done) { done.push(t); return }
      if (t.date < todayISO) { overdue.push(t); return }
      if (t.date === todayISO) { today.push(t); return }
      if (t.date === tomorrowISO) { tomorrow.push(t); return }
      const diff = Math.round((new Date(t.date + 'T12:00:00').getTime() - todayStart) / 86400000)
      if (diff <= 7) {
        weekMap[t.date] = weekMap[t.date] || []
        weekMap[t.date].push(t)
      } else {
        later.push(t)
      }
    })

    const thisWeek = Object.entries(weekMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, ts]) => ({
        date,
        label: new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        tasks: ts,
      }))

    return { overdue, today, tomorrow, thisWeek, later, done }
  }, [filtered, todayISO, tomorrowISO, todayStart])

  const openCount = tasks.filter(t => !t.done).length

  const save = () => {
    if (!addForm || !addForm.title.trim()) return
    addTask({ title: addForm.title, date: addForm.date, note: addForm.note || undefined, done: false, priority: addForm.priority })
    setAddForm(null)
  }

  const hasAny = groups.overdue.length + groups.today.length + groups.tomorrow.length +
    groups.thisWeek.reduce((s, g) => s + g.tasks.length, 0) + groups.later.length +
    (filter !== 'todo' ? groups.done.length : 0) > 0

  return (
    <div className="content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-sub">{openCount} open · plan your work day by day</p>
        </div>
        <button className="btn primary" onClick={() => setAddForm({ title: '', date: todayISO, note: '', priority: null })}>
          <I.Plus size={14}/> New task
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <div className="chip-row">
          {(['todo', 'all', 'done'] as Filter[]).map(f => (
            <div key={f} className={`chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'todo' ? 'Open' : f === 'done' ? 'Done' : 'All'}
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }}/>
        <div className="search-box" style={{ width: 240 }}>
          <I.Search size={14}/>
          <input placeholder="Search tasks…" value={q} onChange={e => setQ(e.target.value)}/>
        </div>
      </div>

      {loading && !tasks.length ? (
        <div className="empty"><div className="e-title">Loading…</div></div>
      ) : !hasAny ? (
        <div className="empty">
          <I.Task size={28}/>
          <div className="e-title">{filter === 'done' ? 'No completed tasks' : 'All clear — no open tasks'}</div>
          <div className="e-sub">Click "+ New task" to plan your day</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {groups.overdue.length > 0 && (
            <TaskSection label="Overdue" dot="var(--red)" tasks={groups.overdue}
              onToggle={(id, done) => updateTask(id, { done })} onDelete={deleteTask}/>
          )}
          {groups.today.length > 0 && (
            <TaskSection
              label={`Today · ${now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`}
              dot="var(--blue)" tasks={groups.today}
              onToggle={(id, done) => updateTask(id, { done })} onDelete={deleteTask}/>
          )}
          {groups.tomorrow.length > 0 && (
            <TaskSection label="Tomorrow" dot="var(--teal)" tasks={groups.tomorrow}
              onToggle={(id, done) => updateTask(id, { done })} onDelete={deleteTask}/>
          )}
          {groups.thisWeek.map(g => (
            <TaskSection key={g.date} label={g.label} dot="var(--gray-400)" tasks={g.tasks}
              onToggle={(id, done) => updateTask(id, { done })} onDelete={deleteTask}/>
          ))}
          {groups.later.length > 0 && (
            <TaskSection label="Later" dot="var(--gray-400)" tasks={groups.later}
              onToggle={(id, done) => updateTask(id, { done })} onDelete={deleteTask}/>
          )}
          {filter !== 'todo' && groups.done.length > 0 && (
            <TaskSection label="Completed" dot="var(--border-strong)" tasks={groups.done}
              onToggle={(id, done) => updateTask(id, { done })} onDelete={deleteTask}/>
          )}
        </div>
      )}

      {addForm && (
        <div className="modal-overlay" onClick={() => setAddForm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>New task</h3>
              <button className="icon-btn" onClick={() => setAddForm(null)}><I.X/></button>
            </div>
            <div className="modal-body">
              <div className="field">
                <label className="label">What needs to be done?</label>
                <input className="input" placeholder="Task title" autoFocus
                  value={addForm.title}
                  onChange={e => setAddForm({ ...addForm, title: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && save()}/>
              </div>
              <div className="row gap-12" style={{ alignItems: 'flex-start' }}>
                <div className="field flex-1" style={{ marginBottom: 0 }}>
                  <label className="label">Date</label>
                  <input className="input" type="date" value={addForm.date}
                    onChange={e => setAddForm({ ...addForm, date: e.target.value })}/>
                </div>
                <div className="field flex-1" style={{ marginBottom: 0 }}>
                  <label className="label">Priority</label>
                  <div className="chip-row" style={{ marginTop: 3 }}>
                    {([
                      { id: 'high' as const, color: 'var(--red)' },
                      { id: 'medium' as const, color: 'var(--amber)' },
                      { id: 'low' as const, color: 'var(--teal)' },
                    ]).map(p => (
                      <div key={p.id}
                           className={`chip ${addForm.priority === p.id ? 'active' : ''}`}
                           style={{ textTransform: 'capitalize' }}
                           onClick={() => setAddForm({ ...addForm, priority: addForm.priority === p.id ? null : p.id })}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.color, display: 'inline-block' }}/>
                        {p.id}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="field" style={{ marginTop: 14, marginBottom: 0 }}>
                <label className="label">Note <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span></label>
                <input className="input" placeholder="Context, links, details…"
                  value={addForm.note}
                  onChange={e => setAddForm({ ...addForm, note: e.target.value })}/>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn ghost" onClick={() => setAddForm(null)}>Cancel</button>
              <button className="btn primary" onClick={save} disabled={!addForm.title.trim()}>Add task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TaskSection({ label, dot, tasks, onToggle, onDelete }: {
  label: string
  dot: string
  tasks: Task[]
  onToggle: (id: string, done: boolean) => void
  onDelete: (id: string) => void
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, padding: '0 2px' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot, flexShrink: 0 }}/>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{tasks.length}</span>
      </div>
      <div className="panel">
        {tasks.map(t => <TaskRow key={t.id} task={t} onToggle={onToggle} onDelete={onDelete}/>)}
      </div>
    </div>
  )
}

function TaskRow({ task, onToggle, onDelete }: {
  task: Task
  onToggle: (id: string, done: boolean) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="task-row">
      <button className="task-check" onClick={() => onToggle(task.id, !task.done)}>
        <div className={`task-box ${task.done ? 'on' : ''}`}>
          {task.done && (
            <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 5l2.5 2.5 3.5-4"/>
            </svg>
          )}
        </div>
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13.5, fontWeight: 500,
          color: task.done ? 'var(--text-subtle)' : 'var(--text)',
          textDecoration: task.done ? 'line-through' : 'none',
          letterSpacing: '-0.005em',
        }}>
          {task.title}
        </div>
        {task.note && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {task.note}
          </div>
        )}
      </div>
      {task.priority && (
        <span title={task.priority} style={{ width: 7, height: 7, borderRadius: '50%', background: PRIORITY_COLOR[task.priority], flexShrink: 0 }}/>
      )}
      <button className="icon-btn task-del" onClick={() => onDelete(task.id)}>
        <I.Trash size={12}/>
      </button>
    </div>
  )
}
