const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = 3001
const DATA_DIR = path.join(__dirname, 'data')
const DIST = path.join(__dirname, '..', 'frontend', 'dist')

app.use(cors())
app.use(express.json())

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR)

// ── Generic CRUD factory ────────────────────────────────────────────────────
function crud(route, filename, idPrefix) {
  const file = path.join(DATA_DIR, filename)

  const read = () => JSON.parse(fs.readFileSync(file, 'utf8'))
  const write = (d) => fs.writeFileSync(file, JSON.stringify(d, null, 2))

  app.get(`/api/${route}`, (_, res) => res.json(read()))

  app.post(`/api/${route}`, (req, res) => {
    const items = read()
    const item = { ...req.body, id: req.body.id || idPrefix + Date.now() }
    const idx = items.findIndex(i => i.id === item.id)
    if (idx !== -1) items[idx] = item
    else items.unshift(item)
    write(items)
    res.status(201).json(item)
  })

  app.put(`/api/${route}/:id`, (req, res) => {
    const items = read()
    const idx = items.findIndex(i => i.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Not found' })
    items[idx] = { ...items[idx], ...req.body, id: req.params.id }
    write(items)
    res.json(items[idx])
  })

  app.delete(`/api/${route}/:id`, (req, res) => {
    write(read().filter(i => i.id !== req.params.id))
    res.status(204).end()
  })
}

// ── Sprints (kept explicit for legacy seed logic) ───────────────────────────
const SPRINT_FILE = path.join(DATA_DIR, 'sprints.json')
const SPRINT_SEED = [
  { id: 's1', feature: 'Background remover v2', app: 'LightX', platforms: ['iOS','Android'], stage: 'Dev', status: 'Current', eta: 'May 28', blocker: '', jira: 'PROJ-2841', review: 'PROJ-2841-R', prd: 'doc/prd-bg-v2' },
  { id: 's2', feature: 'Onboarding redesign', app: 'AI Leap', platforms: ['iOS'], stage: 'Design', status: 'Current', eta: 'May 24', blocker: 'Waiting on illustrations', jira: 'PROJ-2812', review: '', prd: 'doc/onboard-r2' },
  { id: 's3', feature: 'Subscription paywall A/B', app: 'Photocut', platforms: ['iOS','Android','Web'], stage: 'QA', status: 'Current', eta: 'May 22', blocker: '', jira: 'PROJ-2855', review: 'PROJ-2855-R', prd: 'doc/paywall-ab' },
  { id: 's4', feature: 'AI try-on engine', app: 'StyleOn', platforms: ['iOS'], stage: 'Product', status: 'Next', eta: 'Jun 5', blocker: 'API contract pending', jira: 'PROJ-2901', review: '', prd: 'doc/tryon-engine' },
  { id: 's5', feature: 'Story templates pack', app: 'StorYZ', platforms: ['iOS','Android'], stage: 'Dev', status: 'Next', eta: 'Jun 9', blocker: '', jira: 'PROJ-2920', review: '', prd: 'doc/story-templates' },
  { id: 's6', feature: 'Push notif scheduler', app: 'LightX', platforms: ['Android'], stage: 'Dev', status: 'Next', eta: 'Jun 12', blocker: '', jira: 'PROJ-2933', review: '', prd: 'doc/push-sched' },
  { id: 's7', feature: 'Photo enhancer 4x', app: 'Photocut', platforms: ['iOS'], stage: 'Done', status: 'Done', eta: 'May 8', blocker: '', jira: 'PROJ-2701', review: 'PROJ-2701-R', prd: 'doc/enhancer-4x' },
  { id: 's8', feature: 'Localization for KR/JP', app: 'AI Leap', platforms: ['iOS','Android'], stage: 'Done', status: 'Done', eta: 'May 14', blocker: '', jira: 'PROJ-2780', review: 'PROJ-2780-R', prd: 'doc/loc-krjp' },
  { id: 's9', feature: 'Camera UI refresh', app: 'LightX', platforms: ['iOS'], stage: 'Design', status: 'Next', eta: 'Jun 18', blocker: 'Pending design review', jira: 'PROJ-2960', review: '', prd: 'doc/camera-ui' },
  { id: 's10', feature: 'Outfit recommender', app: 'StyleOn', platforms: ['iOS','Android'], stage: 'Product', status: 'Next', eta: 'Jun 22', blocker: '', jira: 'PROJ-2981', review: '', prd: 'doc/outfit-rec' },
  { id: 's11', feature: 'Bulk export tool', app: 'Photocut', platforms: ['Web'], stage: 'QA', status: 'Current', eta: 'May 27', blocker: '', jira: 'PROJ-2890', review: 'PROJ-2890-R', prd: 'doc/bulk-export' },
  { id: 's12', feature: 'Highlight reels', app: 'StorYZ', platforms: ['iOS'], stage: 'Dev', status: 'Current', eta: 'May 30', blocker: 'Video codec issue on iOS 17', jira: 'PROJ-2845', review: '', prd: 'doc/highlight-reels' },
]
if (!fs.existsSync(SPRINT_FILE)) fs.writeFileSync(SPRINT_FILE, JSON.stringify(SPRINT_SEED, null, 2))
crud('sprints', 'sprints.json', 's')

// ── Settings (single document, not a collection) ────────────────────────────
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json')
const SETTINGS_DEFAULT = { name: 'Jordan Singh', email: 'jordan@productos.app', role: 'Senior Product Manager' }
if (!fs.existsSync(SETTINGS_FILE)) fs.writeFileSync(SETTINGS_FILE, JSON.stringify(SETTINGS_DEFAULT, null, 2))
app.get('/api/settings', (_, res) => res.json(JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'))))
app.put('/api/settings', (req, res) => {
  const updated = { ...JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')), ...req.body }
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2))
  res.json(updated)
})

// ── All other entities ──────────────────────────────────────────────────────
crud('calendar', 'calendar.json', 'e')
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json')
if (!fs.existsSync(TASKS_FILE)) fs.writeFileSync(TASKS_FILE, '[]')
crud('tasks', 'tasks.json', 't')
crud('notes', 'notes.json', 'n')
crud('links', 'links.json', 'l')
crud('ga', 'ga.json', 'g')
crud('deeplinks', 'deeplinks.json', 'd')
crud('pack', 'pack.json', 'p')

// ── Serve built frontend ────────────────────────────────────────────────────
if (fs.existsSync(DIST)) app.use(express.static(DIST))

app.get('*', (_, res) => {
  const index = path.join(DIST, 'index.html')
  fs.existsSync(index)
    ? res.sendFile(index)
    : res.status(503).send('Run: npm run build')
})

app.listen(PORT, () => console.log(`ProductOS → http://localhost:${PORT}`))
