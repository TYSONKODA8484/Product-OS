# ProductOS Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the ProductOS design prototype into a real `frontend/` React+Vite app: Zustand stores (persisted to localStorage) replace prop-drilled `useState`, `react-router-dom` replaces the page-switch, CSS is ported verbatim, all modules ship at full fidelity except Localization (placeholder).

**Architecture:** Vite + React 18 + TypeScript SPA. One Zustand store per domain (sprints, pack, notes, links, calendar, notifications, ui). One route per nav item. Shared UI primitives (icons, toast, badges) in `components/ui`. Each feature module in its own `features/<name>/` folder reading its own store(s) directly — no prop drilling from `App`.

**Tech stack:** React 18, TypeScript, Vite, react-router-dom v6, zustand (with `persist` middleware), Vitest + @testing-library/react.

**Reference source:** `docs/superpowers/design-reference/product-os/project/` — the original prototype files. Every task below cites exact files/line ranges there. **Confirmed dead code: `modules-data.jsx`'s `Sprint`/`Pack`/`SprintDrawer`/`PackDrawer` are superseded by `sprint.jsx`/`pack.jsx` (loaded later in `ProductOS.html`, redeclaring the same global function names) — do not port anything from `modules-data.jsx`.**

---

## File Structure

```
frontend/
  index.html
  vite.config.ts
  vitest.config.ts (or merged into vite.config.ts)
  package.json
  src/
    main.tsx
    App.tsx
    store/
      sprintsStore.ts        (+ sprintsStore.test.ts)
      packStore.ts            (+ packStore.test.ts)
      notesStore.ts            (+ notesStore.test.ts)
      linksStore.ts            (+ linksStore.test.ts)
      calendarStore.ts        (+ calendarStore.test.ts)
      notificationsStore.ts   (+ notificationsStore.test.ts)
      uiStore.ts               (+ uiStore.test.ts)
    components/ui/
      Icon.tsx
      Spinner.tsx
      StatusBadge.tsx
      AppLogo.tsx
      Toast.tsx
      Sidebar.tsx
      Topbar.tsx
    features/
      dashboard/Dashboard.tsx
      calendar/Calendar.tsx
      sprint/Sprint.tsx (+ SprintRow, FilterMenu, SprintDrawer, StatusGlyph, PriorityFlag in same file or split — keep as sprint.jsx already groups them, port 1:1)
      pack/Pack.tsx (+ InlineText, InlineNum, LiveSelect, CellCheckbox, PackEditDrawer)
      notes/Notes.tsx
      ai-assistant/AIAssistant.tsx
      links/Links.tsx (+ LinkModal)
      settings/Settings.tsx
      localization/Localization.tsx (placeholder only)
    styles/
      global.css   (ported from styles.css)
```

---

### Task 1: Scaffold Vite + React + TypeScript project

**Files:**
- Create: `frontend/` (via Vite scaffold)

- [ ] **Step 1: Scaffold the project**

Run from `d:\Tools\productOS`:
```bash
npm create vite@latest frontend -- --template react-ts
```

- [ ] **Step 2: Install dependencies**

```bash
cd frontend
npm install
npm install react-router-dom zustand
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @testing-library/user-event
```

- [ ] **Step 3: Add a test script to `frontend/package.json`**

In the `"scripts"` block, add:
```json
"test": "vitest run"
```

- [ ] **Step 4: Configure Vitest in `frontend/vite.config.ts`**

Replace the file contents with:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
  },
})
```

- [ ] **Step 5: Create `frontend/src/setupTests.ts`**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Verify the scaffold runs**

Run: `npm run dev` (then Ctrl+C once it starts cleanly) and `npm run build`
Expected: both succeed with the default Vite counter page.

- [ ] **Step 7: Commit**

```bash
git add frontend
git commit -m "chore: scaffold frontend Vite+React+TS project"
```

(If `d:\Tools\productOS` is not yet a git repo, run `git init` first and ask the user before doing so if not already confirmed.)

---

### Task 2: Port global styles

**Files:**
- Create: `frontend/src/styles/global.css`
- Modify: `frontend/index.html`
- Modify: `frontend/src/main.tsx`
- Delete: `frontend/src/App.css`, `frontend/src/index.css` (default Vite styles, superseded)

- [ ] **Step 1: Copy the prototype's CSS verbatim**

Copy `docs/superpowers/design-reference/product-os/project/styles.css` to `frontend/src/styles/global.css` unmodified (it already uses `:root` variables and a `[data-theme="dark"]` override block — verify this by checking the file contains `[data-theme="dark"]`).

```bash
cp "docs/superpowers/design-reference/product-os/project/styles.css" "frontend/src/styles/global.css"
```

- [ ] **Step 2: Update `frontend/index.html` head**

Replace the `<head>` contents (keep `<meta charset>` and viewport tags Vite generated) by adding the Google Fonts link, matching the prototype:
```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"/>
```//
Also add this inline style block (the prototype's spinner keyframe — only needed if not already in global.css; check first, skip if `@keyframes spin` already exists in global.css):
```html
<style>
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
```

- [ ] **Step 3: Remove default Vite styling and import global.css**

Delete `frontend/src/App.css` and `frontend/src/index.css`. In `frontend/src/main.tsx`, replace the CSS import line with:
```ts
import './styles/global.css'
```

- [ ] **Step 4: Verify**

Run `npm run dev`, confirm no console errors about missing CSS files.

- [ ] **Step 5: Commit**

```bash
git add frontend
git commit -m "feat: port global styles and fonts from prototype"
```

---

### Task 3: Shared UI primitives (Icon set, Spinner, StatusBadge, AppLogo, Toast)

**Files:**
- Create: `frontend/src/components/ui/Icon.tsx`
- Create: `frontend/src/components/ui/Spinner.tsx`
- Create: `frontend/src/components/ui/StatusBadge.tsx`
- Create: `frontend/src/components/ui/AppLogo.tsx`
- Create: `frontend/src/components/ui/Toast.tsx`

Source: `docs/superpowers/design-reference/product-os/project/components.jsx` (full file, 123 lines).

- [ ] **Step 1: Port the icon set to `Icon.tsx`**

Take lines 4–51 of `components.jsx` (the `Icon` component + the `I` object of icon definitions) verbatim, converting to TSX:
```tsx
import React from 'react'

interface IconProps {
  d?: string
  size?: number
  fill?: string
  stroke?: string
  sw?: number
  children?: React.ReactNode
}

const IconBase = ({ d, size = 16, fill = 'none', stroke = 'currentColor', sw = 1.75, children }: IconProps) => (
  <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill={fill}
       stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {d ? <path d={d}/> : children}
  </svg>
)

export const I = {
  Home: (p: IconProps) => <IconBase {...p}><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></IconBase>,
  Calendar: (p: IconProps) => <IconBase {...p}><rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 2.5v4"/><path d="M16 2.5v4"/></IconBase>,
  Check: (p: IconProps) => <IconBase {...p}><path d="M9 11l3 3 8-8"/><path d="M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></IconBase>,
  Package: (p: IconProps) => <IconBase {...p}><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></IconBase>,
  Globe: (p: IconProps) => <IconBase {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z"/></IconBase>,
  Note: (p: IconProps) => <IconBase {...p}><path d="M5 3h11l4 4v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M15 3v5h5"/><path d="M8 13h7"/><path d="M8 17h5"/></IconBase>,
  Chat: (p: IconProps) => <IconBase {...p}><path d="M4 5h16v11H7l-3 4V5z"/></IconBase>,
  Link: (p: IconProps) => <IconBase {...p}><path d="M10 14a4 4 0 0 1 0-6l3-3a4 4 0 0 1 6 6l-1.5 1.5"/><path d="M14 10a4 4 0 0 1 0 6l-3 3a4 4 0 0 1-6-6l1.5-1.5"/></IconBase>,
  Gear: (p: IconProps) => <IconBase {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></IconBase>,
  Logout: (p: IconProps) => <IconBase {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></IconBase>,
  Search: (p: IconProps) => <IconBase {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></IconBase>,
  Bell: (p: IconProps) => <IconBase {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></IconBase>,
  Sun: (p: IconProps) => <IconBase {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></IconBase>,
  Moon: (p: IconProps) => <IconBase {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></IconBase>,
  Plus: (p: IconProps) => <IconBase {...p}><path d="M12 5v14M5 12h14"/></IconBase>,
  X: (p: IconProps) => <IconBase {...p}><path d="M6 6l12 12M18 6L6 18"/></IconBase>,
  ChevL: (p: IconProps) => <IconBase {...p}><path d="M15 6l-6 6 6 6"/></IconBase>,
  ChevR: (p: IconProps) => <IconBase {...p}><path d="M9 6l6 6-6 6"/></IconBase>,
  ChevD: (p: IconProps) => <IconBase {...p}><path d="M6 9l6 6 6-6"/></IconBase>,
  Filter: (p: IconProps) => <IconBase {...p}><path d="M3 5h18l-7 8v6l-4 2v-8L3 5z"/></IconBase>,
  Pencil: (p: IconProps) => <IconBase {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></IconBase>,
  Trash: (p: IconProps) => <IconBase {...p}><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></IconBase>,
  Copy: (p: IconProps) => <IconBase {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></IconBase>,
  Refresh: (p: IconProps) => <IconBase {...p}><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></IconBase>,
  Send: (p: IconProps) => <IconBase {...p}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></IconBase>,
  Download: (p: IconProps) => <IconBase {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></IconBase>,
  Upload: (p: IconProps) => <IconBase {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></IconBase>,
  Doc: (p: IconProps) => <IconBase {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></IconBase>,
  Sheet: (p: IconProps) => <IconBase {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></IconBase>,
  Jira: (p: IconProps) => <IconBase {...p}><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></IconBase>,
  Design: (p: IconProps) => <IconBase {...p}><path d="M12 19l7-7-3-3-9 9v3h3l2-2z"/><circle cx="6" cy="6" r="3"/></IconBase>,
  Video: (p: IconProps) => <IconBase {...p}><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/></IconBase>,
  Menu: (p: IconProps) => <IconBase {...p}><path d="M3 6h18M3 12h18M3 18h18"/></IconBase>,
  Lock: (p: IconProps) => <IconBase {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></IconBase>,
  Mail: (p: IconProps) => <IconBase {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></IconBase>,
  External: (p: IconProps) => <IconBase {...p}><path d="M14 3h7v7"/><path d="M21 3l-9 9"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></IconBase>,
  Alert: (p: IconProps) => <IconBase {...p}><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0z"/></IconBase>,
  Sparkle: (p: IconProps) => <IconBase {...p}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M19 16l.7 2 2 .7-2 .7L19 22l-.7-1.6-2-.7 2-.7L19 16z"/></IconBase>,
  Paperclip: (p: IconProps) => <IconBase {...p}><path d="M21 12.5l-8.5 8.5a5 5 0 0 1-7-7l8.5-8.5a3.5 3.5 0 0 1 5 5L10.5 19a2 2 0 0 1-3-3l8-8"/></IconBase>,
}

export { IconBase as Icon }
```
Use the exact path data above — every `d` attribute is copied verbatim from `components.jsx`.

- [ ] **Step 2: Port `Spinner.tsx`**

From `components.jsx` lines 54-59:
```tsx
interface SpinnerProps { size?: number }

export const Spinner = ({ size = 14 }: SpinnerProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ animation: 'spin 0.8s linear infinite' }}>
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
    <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)
```

- [ ] **Step 3: Port `StatusBadge.tsx`**

From `components.jsx` lines 62-77, same map and JSX, typed:
```tsx
interface StatusBadgeProps { status: string }

const STATUS_MAP: Record<string, { c: string; lbl: string }> = {
  Current: { c: 'blue', lbl: 'Current' },
  Next: { c: 'amber', lbl: 'Next' },
  Done: { c: 'gray', lbl: 'Done' },
  Live: { c: 'teal', lbl: 'Live' },
  Pending: { c: 'amber', lbl: 'Pending' },
  Inactive: { c: 'gray', lbl: 'Inactive' },
  QA: { c: 'amber', lbl: 'QA' },
  Dev: { c: 'blue', lbl: 'Dev' },
  Design: { c: 'gray', lbl: 'Design' },
  Product: { c: 'teal', lbl: 'Product' },
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const m = STATUS_MAP[status] || { c: 'gray', lbl: status }
  return <span className={`badge ${m.c}`}><span className="dot"/>{m.lbl}</span>
}
```

- [ ] **Step 4: Port `AppLogo.tsx`**

From `components.jsx` lines 80-96, same color map and initials logic:
```tsx
interface AppLogoProps { name: string }

const APP_COLORS: Record<string, [string, string]> = {
  LightX: ['#378ADD', '#185FA5'],
  'AI Leap': ['#1D9E75', '#176A51'],
  Photocut: ['#BA7517', '#8C5810'],
  StyleOn: ['#9B5DE5', '#6D3CB3'],
  StorYZ: ['#E15D7E', '#B43A5C'],
  Photoshoot: ['#378ADD', '#185FA5'],
}

export const AppLogo = ({ name }: AppLogoProps) => {
  const [a, b] = APP_COLORS[name] || ['#444441', '#222220']
  const initials = name.split(/[\s-]/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="applogo" style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}>
      {initials}
    </div>
  )
}
```

- [ ] **Step 5: Port `Toast.tsx`**

From `components.jsx` lines 99-120, same context/provider pattern, typed:
```tsx
import React, { createContext, useContext, useState } from 'react'
import { I } from './Icon'

interface Toast { id: string; msg: string }
type PushToast = (msg: string) => void

const ToastCtx = createContext<PushToast | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push: PushToast = (msg) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(t => [...t, { id, msg }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2400)
  }
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-stack">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            <span className="ok"><I.Check size={14}/></span>{t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
```

- [ ] **Step 6: Verify it compiles**

Run: `npm run build` in `frontend/`
Expected: no TypeScript errors from these new files (other files may still fail until later tasks — if so, temporarily comment out unrelated default `App.tsx` content, or ignore failures from files not yet touched).

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/ui
git commit -m "feat: port shared UI primitives (icons, spinner, badges, toast)"
```

---

### Task 4: Zustand stores

Source data: `docs/superpowers/design-reference/product-os/project/data.jsx` (full file — `SAMPLE_NOTES`, `APPS`, `SPRINTS`, `PACK_DATA` is superseded by `pack.jsx`'s `PRODUCT_ROWS`/`TAG_DEFS`/`SHEETS` — use `pack.jsx` lines 4-76 for pack data, not `data.jsx`'s `PACK_DATA`/`PACK_CATEGORIES`, which are the older shape and unused by the final Pack UI; `SAMPLE_LINKS`, `SAMPLE_EVENTS`).

**Files:**
- Create: `frontend/src/store/sprintsStore.ts` + `sprintsStore.test.ts`
- Create: `frontend/src/store/packStore.ts` + `packStore.test.ts`
- Create: `frontend/src/store/notesStore.ts` + `notesStore.test.ts`
- Create: `frontend/src/store/linksStore.ts` + `linksStore.test.ts`
- Create: `frontend/src/store/calendarStore.ts` + `calendarStore.test.ts`
- Create: `frontend/src/store/notificationsStore.ts` + `notificationsStore.test.ts`
- Create: `frontend/src/store/uiStore.ts` + `uiStore.test.ts`

- [ ] **Step 1: Write failing test for `sprintsStore`**

`frontend/src/store/sprintsStore.test.ts`:
```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- sprintsStore` in `frontend/`
Expected: FAIL — `Cannot find module './sprintsStore'`

- [ ] **Step 3: Implement `sprintsStore.ts`**

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Sprint {
  id: string
  feature: string
  app: string
  platforms: string[]
  stage: 'Design' | 'Product' | 'Dev' | 'QA' | 'Done'
  status: 'Current' | 'Next' | 'Done'
  eta: string
  blocker: string
  jira: string
  review: string
  prd: string
}

// Copied verbatim from data.jsx lines 13-26
const SPRINTS: Sprint[] = [
  { id: 's1', feature: 'Background remover v2', app: 'LightX', platforms: ['iOS', 'Android'], stage: 'Dev', status: 'Current', eta: 'May 28', blocker: '', jira: 'PROJ-2841', review: 'PROJ-2841-R', prd: 'doc/prd-bg-v2' },
  { id: 's2', feature: 'Onboarding redesign', app: 'AI Leap', platforms: ['iOS'], stage: 'Design', status: 'Current', eta: 'May 24', blocker: 'Waiting on illustrations', jira: 'PROJ-2812', review: '', prd: 'doc/onboard-r2' },
  { id: 's3', feature: 'Subscription paywall A/B', app: 'Photocut', platforms: ['iOS', 'Android', 'Web'], stage: 'QA', status: 'Current', eta: 'May 22', blocker: '', jira: 'PROJ-2855', review: 'PROJ-2855-R', prd: 'doc/paywall-ab' },
  { id: 's4', feature: 'AI try-on engine', app: 'StyleOn', platforms: ['iOS'], stage: 'Product', status: 'Next', eta: 'Jun 5', blocker: 'API contract pending', jira: 'PROJ-2901', review: '', prd: 'doc/tryon-engine' },
  { id: 's5', feature: 'Story templates pack', app: 'StorYZ', platforms: ['iOS', 'Android'], stage: 'Dev', status: 'Next', eta: 'Jun 9', blocker: '', jira: 'PROJ-2920', review: '', prd: 'doc/story-templates' },
  { id: 's6', feature: 'Push notif scheduler', app: 'LightX', platforms: ['Android'], stage: 'Dev', status: 'Next', eta: 'Jun 12', blocker: '', jira: 'PROJ-2933', review: '', prd: 'doc/push-sched' },
  { id: 's7', feature: 'Photo enhancer 4x', app: 'Photocut', platforms: ['iOS'], stage: 'Done', status: 'Done', eta: 'May 8', blocker: '', jira: 'PROJ-2701', review: 'PROJ-2701-R', prd: 'doc/enhancer-4x' },
  { id: 's8', feature: 'Localization for KR/JP', app: 'AI Leap', platforms: ['iOS', 'Android'], stage: 'Done', status: 'Done', eta: 'May 14', blocker: '', jira: 'PROJ-2780', review: 'PROJ-2780-R', prd: 'doc/loc-krjp' },
  { id: 's9', feature: 'Camera UI refresh', app: 'LightX', platforms: ['iOS'], stage: 'Design', status: 'Next', eta: 'Jun 18', blocker: 'Pending design review', jira: 'PROJ-2960', review: '', prd: 'doc/camera-ui' },
  { id: 's10', feature: 'Outfit recommender', app: 'StyleOn', platforms: ['iOS', 'Android'], stage: 'Product', status: 'Next', eta: 'Jun 22', blocker: '', jira: 'PROJ-2981', review: '', prd: 'doc/outfit-rec' },
  { id: 's11', feature: 'Bulk export tool', app: 'Photocut', platforms: ['Web'], stage: 'QA', status: 'Current', eta: 'May 27', blocker: '', jira: 'PROJ-2890', review: 'PROJ-2890-R', prd: 'doc/bulk-export' },
  { id: 's12', feature: 'Highlight reels', app: 'StorYZ', platforms: ['iOS'], stage: 'Dev', status: 'Current', eta: 'May 30', blocker: 'Video codec issue on iOS 17', jira: 'PROJ-2845', review: '', prd: 'doc/highlight-reels' },
]

export const APPS = ['LightX', 'AI Leap', 'Photocut', 'StyleOn', 'StorYZ']

const STATUS_ORDER: Sprint['status'][] = ['Current', 'Next', 'Done']

interface SprintsState {
  sprints: Sprint[]
  cycleStatus: (id: string) => void
  updateSprint: (id: string, patch: Partial<Sprint>) => void
}

export const useSprintsStore = create<SprintsState>()(
  persist(
    (set) => ({
      sprints: SPRINTS,
      cycleStatus: (id) => set((s) => ({
        sprints: s.sprints.map(sp => sp.id === id
          ? { ...sp, status: STATUS_ORDER[(STATUS_ORDER.indexOf(sp.status) + 1) % 3] }
          : sp),
      })),
      updateSprint: (id, patch) => set((s) => ({
        sprints: s.sprints.map(sp => sp.id === id ? { ...sp, ...patch } : sp),
      })),
    }),
    { name: 'productos-sprints' }
  )
)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- sprintsStore`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/store/sprintsStore.ts frontend/src/store/sprintsStore.test.ts
git commit -m "feat: add sprintsStore with persisted status-cycle logic"
```

- [ ] **Step 6: Write failing test for `packStore`**

`frontend/src/store/packStore.test.ts`:
```ts
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
```

- [ ] **Step 7: Run test to verify it fails**

Run: `npm run test -- packStore`
Expected: FAIL — `Cannot find module './packStore'`

- [ ] **Step 8: Implement `packStore.ts`**

Port `TAG_DEFS`, `SHEETS`, `PRODUCT_ROWS` verbatim from `pack.jsx` lines 4-76:
```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PackRow {
  id: string
  cat: string
  catTotal: number
  name: string
  mid: number | null
  live: string
  photo: boolean
  video: boolean
  link: string
  comment: string
  tag: string | null
}

export interface TagDef { id: string; label: string; bg: string; border: string }

export const TAG_DEFS: TagDef[] = [
  { id: 'yellow', label: 'Working / In scope', bg: '#FFF8C5', border: '#FACC15' },
  { id: 'blue', label: 'High priority', bg: '#DBE9F7', border: '#5B9BD5' },
  { id: 'cyan', label: 'Change / addition / redo', bg: '#CDEEEE', border: '#5BC0BE' },
  { id: 'orange', label: 'Prompts to review', bg: '#FCE4CB', border: '#F4A36C' },
  { id: 'red', label: 'Error — change ASAP', bg: '#FCD3D3', border: '#E26A6A' },
]

export const SHEETS = [
  { id: 'imp', label: 'IMP Links', count: 0 },
  { id: 'product', label: 'Product', count: 224 },
  { id: 'tryon', label: 'Try on', count: 330 },
  { id: 'mockup', label: 'Mockup', count: 331 },
  { id: 'solo_current', label: 'Solo (Current)', count: 218 },
  { id: 'solo_new', label: 'SOLO (!NEW)', count: 36 },
  { id: 'duo_current', label: 'Duo (Current)', count: 142 },
  { id: 'duo_new', label: 'DUO (!NEW)', count: 22 },
  { id: 'space', label: 'Space Design', count: 38 },
]

const PRODUCT_ROWS: PackRow[] = [
  { id: 'MDL-J01', cat: 'Jewelry & Watches', catTotal: 316, name: 'Earring', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-J02', cat: 'Jewelry & Watches', catTotal: 316, name: 'Necklace', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-J03', cat: 'Jewelry & Watches', catTotal: 316, name: 'Ring', mid: 68, live: 'Yes', photo: true, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-J04', cat: 'Jewelry & Watches', catTotal: 316, name: 'Diamond Bracelet', mid: 68, live: 'Yes', photo: true, video: false, link: '', comment: 'Photo refresh next sprint', tag: 'yellow' },
  { id: 'MDL-J05', cat: 'Jewelry & Watches', catTotal: 316, name: 'Bangle', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-J06', cat: 'Jewelry & Watches', catTotal: 316, name: 'Anklet', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-J07', cat: 'Jewelry & Watches', catTotal: 316, name: 'Chain', mid: null, live: 'No', photo: false, video: false, link: '', comment: '', tag: null },
  { id: 'MDL-J08', cat: 'Jewelry & Watches', catTotal: 316, name: 'Gold Pendant', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-J09', cat: 'Jewelry & Watches', catTotal: 316, name: 'Pearl Jewelry Set', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-J10', cat: 'Jewelry & Watches', catTotal: 316, name: 'Silver Jewelry', mid: 68, live: '', photo: false, video: false, link: '', comment: '', tag: null },
  { id: 'MDL-J11', cat: 'Jewelry & Watches', catTotal: 316, name: 'Jhumka', mid: 68, live: '', photo: false, video: false, link: '', comment: '', tag: null },
  { id: 'MDL-J12', cat: 'Jewelry & Watches', catTotal: 316, name: 'Luxury Watch', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: 'High Priority', tag: 'blue' },
  { id: 'MDL-J13', cat: 'Jewelry & Watches', catTotal: 316, name: 'Kundan Necklace', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-W01', cat: 'Watch', catTotal: 42, name: 'Luxury Watch', mid: null, live: '', photo: false, video: false, link: '', comment: '', tag: null },
  { id: 'MDL-W02', cat: 'Watch', catTotal: 42, name: 'Smart Watch', mid: null, live: '', photo: false, video: false, link: '', comment: '', tag: null },
  { id: 'MDL-W03', cat: 'Watch', catTotal: 42, name: 'Kids Watch', mid: null, live: '', photo: false, video: false, link: '', comment: '', tag: null },
  { id: 'MDL-W04', cat: 'Watch', catTotal: 42, name: 'Sports Watch', mid: null, live: '', photo: false, video: false, link: '', comment: '', tag: null },
  { id: 'MDL-W05', cat: 'Watch', catTotal: 42, name: 'Casual Watch', mid: null, live: '', photo: false, video: false, link: '', comment: '', tag: null },
  { id: 'MDL-S01', cat: 'Skincare', catTotal: 88, name: 'Serum', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: 'Satyam prompts', tag: 'orange' },
  { id: 'MDL-S02', cat: 'Skincare', catTotal: 88, name: 'Moisturizer', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-S03', cat: 'Skincare', catTotal: 88, name: 'Face Cleanser', mid: 68, live: 'Yes', photo: false, video: false, link: 'https://docs.example.com/face-cleanser', comment: 'Announcement: product change', tag: 'cyan' },
  { id: 'MDL-S04', cat: 'Skincare', catTotal: 88, name: 'Toner', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-S05', cat: 'Skincare', catTotal: 88, name: 'Eye Cream', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-S06', cat: 'Skincare', catTotal: 88, name: 'Sunscreen SPF50', mid: 68, live: 'No', photo: false, video: false, link: '', comment: 'Error — fix tag overlap', tag: 'red' },
  { id: 'MDL-S07', cat: 'Skincare', catTotal: 88, name: 'Face Mask', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-A01', cat: 'Apparel', catTotal: 124, name: 'T-shirt Crew', mid: 68, live: 'Yes', photo: true, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-A02', cat: 'Apparel', catTotal: 124, name: 'Hoodie Streetwear', mid: 68, live: 'Yes', photo: true, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-A03', cat: 'Apparel', catTotal: 124, name: 'Denim Jacket', mid: 68, live: 'Yes', photo: true, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-A04', cat: 'Apparel', catTotal: 124, name: 'Summer Dress', mid: 68, live: 'Pending', photo: false, video: false, link: '', comment: 'High priority for JP launch', tag: 'blue' },
  { id: 'MDL-A05', cat: 'Apparel', catTotal: 124, name: 'Blazer Formal', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-A06', cat: 'Apparel', catTotal: 124, name: 'Sneakers', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-A07', cat: 'Apparel', catTotal: 124, name: 'Heels Pumps', mid: 68, live: '', photo: false, video: false, link: '', comment: '', tag: null },
  { id: 'MDL-A08', cat: 'Apparel', catTotal: 124, name: 'Handbag Tote', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-H01', cat: 'Home & Living', catTotal: 54, name: 'Candle Pillar', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-H02', cat: 'Home & Living', catTotal: 54, name: 'Vase Ceramic', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-H03', cat: 'Home & Living', catTotal: 54, name: 'Throw Blanket', mid: 68, live: 'Pending', photo: false, video: false, link: '', comment: 'Redo on white BG', tag: 'cyan' },
  { id: 'MDL-H04', cat: 'Home & Living', catTotal: 54, name: 'Mug Coffee', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
]

interface PackState {
  rows: PackRow[]
  updateRow: (id: string, patch: Partial<PackRow>) => void
}

export const usePackStore = create<PackState>()(
  persist(
    (set) => ({
      rows: PRODUCT_ROWS,
      updateRow: (id, patch) => set((s) => ({
        rows: s.rows.map(r => r.id === id ? { ...r, ...patch } : r),
      })),
    }),
    { name: 'productos-pack' }
  )
)
```

- [ ] **Step 9: Run test to verify it passes**

Run: `npm run test -- packStore`
Expected: PASS

- [ ] **Step 10: Commit**

```bash
git add frontend/src/store/packStore.ts frontend/src/store/packStore.test.ts
git commit -m "feat: add packStore"
```

- [ ] **Step 11: Write failing test for `notesStore`'s title-derivation**

`frontend/src/store/notesStore.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { useNotesStore } from './notesStore'

describe('notesStore', () => {
  it('derives title from the first line of the body on update', () => {
    const note = useNotesStore.getState().notes[0]
    useNotesStore.getState().updateNote(note.id, 'My New Title\nSecond line')
    const updated = useNotesStore.getState().notes.find(n => n.id === note.id)
    expect(updated?.title).toBe('My New Title')
    expect(updated?.body).toBe('My New Title\nSecond line')
  })

  it('newNote prepends an Untitled note and returns its id', () => {
    const before = useNotesStore.getState().notes.length
    const id = useNotesStore.getState().newNote()
    const notes = useNotesStore.getState().notes
    expect(notes.length).toBe(before + 1)
    expect(notes[0].id).toBe(id)
    expect(notes[0].title).toBe('Untitled')
  })

  it('deleteNote removes the note by id', () => {
    const id = useNotesStore.getState().newNote()
    useNotesStore.getState().deleteNote(id)
    expect(useNotesStore.getState().notes.find(n => n.id === id)).toBeUndefined()
  })
})
```

- [ ] **Step 12: Run test to verify it fails**

Run: `npm run test -- notesStore`
Expected: FAIL — module not found

- [ ] **Step 13: Implement `notesStore.ts`**

Port `SAMPLE_NOTES` verbatim from `data.jsx` lines 3-9, and the `updateNote`/`newNote`/`deleteNote` logic from `modules-tools.jsx` lines 12-34 (moved from component state into the store):
```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Note {
  id: string
  title: string
  body: string
  updated: number
}

const SAMPLE_NOTES: Note[] = [
  { id: 'n1', title: 'Q3 OKRs draft', body: 'Q3 OKRs draft\n\nObjective 1: Improve onboarding completion rate to 65%\n- KR1: Reduce signup-to-first-action time by 30%\n- KR2: Add interactive walkthrough to mobile flow\n- KR3: A/B test new welcome screen variants\n\nObjective 2: Ship localization to 6 new markets\n- Brazil, Mexico, Japan, Korea, Germany, France\n- Partner with regional marketing leads', updated: Date.now() - 1000 * 60 * 30 },
  { id: 'n2', title: 'Sprint 24 retro notes', body: 'Sprint 24 retro notes\n\nWhat went well:\n- Faster code review turnaround (avg 4h vs 9h)\n- Design QA caught 12 issues before staging\n- New feature flag system shipped on time\n\nWhat to improve:\n- Need clearer acceptance criteria on PRDs\n- Backend integration delayed iOS launch by 2 days\n\nAction items:\n- Schedule PRD walkthrough sessions every Tuesday\n- Set up async daily standups in Slack', updated: Date.now() - 1000 * 60 * 60 * 3 },
  { id: 'n3', title: 'User interview - Maya R.', body: 'User interview - Maya R.\nDesigner at fitness startup, age 31\n\nKey pain points:\n- Loses context switching between Figma and Notion\n- Wants AI to summarize Slack threads daily\n- Wishes she could @ mention specs from anywhere\n\nQuotes:\n"I have 14 tabs open right now and I\'m only on my 2nd coffee."\n"Why doesn\'t anything talk to anything else?"', updated: Date.now() - 1000 * 60 * 60 * 22 },
  { id: 'n4', title: 'Pricing experiment ideas', body: 'Pricing experiment ideas\n\n1. Annual-only on landing — push monthly to second step\n2. Show team-tier upgrade prompts when 3+ collabs added\n3. Free tier: cap at 5 projects vs current 3 — see if conversion improves\n4. Currency localization (we lose ~12% on USD-only in EU)', updated: Date.now() - 1000 * 60 * 60 * 24 * 2 },
  { id: 'n5', title: 'Competitive teardown', body: 'Competitive teardown\n\nTool A: strong workflow editor, weak mobile\nTool B: great mobile, no AI features yet\nTool C: dominant in enterprise, slow on shipping\n\nOur wedge: AI-native + cross-platform parity from day 1.', updated: Date.now() - 1000 * 60 * 60 * 24 * 5 },
]

interface NotesState {
  notes: Note[]
  updateNote: (id: string, body: string) => void
  newNote: () => string
  deleteNote: (id: string) => void
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: SAMPLE_NOTES,
      updateNote: (id, body) => set((s) => ({
        notes: s.notes.map(n => {
          if (n.id !== id) return n
          const firstLine = body.split('\n')[0].trim() || 'Untitled'
          return { ...n, body, title: firstLine.slice(0, 60), updated: Date.now() }
        }),
      })),
      newNote: () => {
        const id = 'n' + Date.now()
        set((s) => ({ notes: [{ id, title: 'Untitled', body: '', updated: Date.now() }, ...s.notes] }))
        return id
      },
      deleteNote: (id) => set((s) => ({ notes: s.notes.filter(n => n.id !== id) })),
    }),
    { name: 'productos-notes' }
  )
)
```

- [ ] **Step 14: Run test to verify it passes**

Run: `npm run test -- notesStore`
Expected: PASS (3 tests)

- [ ] **Step 15: Commit**

```bash
git add frontend/src/store/notesStore.ts frontend/src/store/notesStore.test.ts
git commit -m "feat: add notesStore with title-derivation logic"
```

- [ ] **Step 16: Write failing test for `linksStore`**

`frontend/src/store/linksStore.test.ts`:
```ts
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
```

- [ ] **Step 17: Run test to verify it fails**

Run: `npm run test -- linksStore`
Expected: FAIL — module not found

- [ ] **Step 18: Implement `linksStore.ts`**

Port `SAMPLE_LINKS` verbatim from `data.jsx` lines 95-108, and `save`/`del` logic from `modules-tools.jsx` lines 231-238:
```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Link {
  id: string
  name: string
  url: string
  cat: string
}

const SAMPLE_LINKS: Link[] = [
  { id: 'l1', name: 'Product Roadmap (Master)', url: 'docs.example.com/p/roadmap-master', cat: 'Docs' },
  { id: 'l2', name: 'Q3 Planning Sheet', url: 'sheets.example.com/q3-plan', cat: 'Sheets' },
  { id: 'l3', name: 'JIRA — Active Sprint', url: 'jira.example.com/sprint/active', cat: 'JIRA' },
  { id: 'l4', name: 'Design System v3', url: 'figma.example.com/ds-v3', cat: 'Designs' },
  { id: 'l5', name: 'Onboarding Walkthrough Demo', url: 'vid.example.com/onboard-demo', cat: 'Videos' },
  { id: 'l6', name: 'Engineering Standards', url: 'docs.example.com/eng-standards', cat: 'Docs' },
  { id: 'l7', name: 'Localization Tracker', url: 'sheets.example.com/loc-tracker', cat: 'Sheets' },
  { id: 'l8', name: 'JIRA — Backlog', url: 'jira.example.com/backlog', cat: 'JIRA' },
  { id: 'l9', name: 'User Research Library', url: 'notes.example.com/research', cat: 'Docs' },
  { id: 'l10', name: 'Brand Asset Library', url: 'figma.example.com/brand', cat: 'Designs' },
  { id: 'l11', name: 'All-hands recordings', url: 'vid.example.com/all-hands', cat: 'Videos' },
  { id: 'l12', name: 'Incident postmortems', url: 'docs.example.com/postmortems', cat: 'Other' },
]

interface LinksState {
  links: Link[]
  saveLink: (link: Partial<Link> & { name: string; url: string; cat: string }) => void
  deleteLink: (id: string) => void
}

export const useLinksStore = create<LinksState>()(
  persist(
    (set) => ({
      links: SAMPLE_LINKS,
      saveLink: (link) => set((s) => ({
        links: link.id
          ? s.links.map(x => x.id === link.id ? { ...x, ...link } as Link : x)
          : [{ ...link, id: 'l' + Date.now() } as Link, ...s.links],
      })),
      deleteLink: (id) => set((s) => ({ links: s.links.filter(l => l.id !== id) })),
    }),
    { name: 'productos-links' }
  )
)
```

- [ ] **Step 19: Run test to verify it passes**

Run: `npm run test -- linksStore`
Expected: PASS (3 tests)

- [ ] **Step 20: Commit**

```bash
git add frontend/src/store/linksStore.ts frontend/src/store/linksStore.test.ts
git commit -m "feat: add linksStore"
```

- [ ] **Step 21: Write failing test for `calendarStore`**

`frontend/src/store/calendarStore.test.ts`:
```ts
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
```

- [ ] **Step 22: Run test to verify it fails**

Run: `npm run test -- calendarStore`
Expected: FAIL — module not found

- [ ] **Step 23: Implement `calendarStore.ts`**

Port `SAMPLE_EVENTS` verbatim from `data.jsx` lines 111-125:
```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CalendarEvent {
  id: string
  date: string
  title: string
  type: 'sprint' | 'global' | 'manual'
}

const SAMPLE_EVENTS: CalendarEvent[] = [
  { id: 'e1', date: '2026-05-22', title: 'Paywall A/B ships', type: 'sprint' },
  { id: 'e2', date: '2026-05-24', title: 'Onboarding redesign', type: 'sprint' },
  { id: 'e3', date: '2026-05-26', title: 'Memorial Day (US)', type: 'global' },
  { id: 'e4', date: '2026-05-28', title: 'BG remover v2 ETA', type: 'sprint' },
  { id: 'e5', date: '2026-05-27', title: 'Bulk export QA', type: 'sprint' },
  { id: 'e6', date: '2026-05-30', title: 'Highlight reels release', type: 'sprint' },
  { id: 'e7', date: '2026-05-19', title: 'All-hands review', type: 'manual' },
  { id: 'e8', date: '2026-05-21', title: '1:1 with design lead', type: 'manual' },
  { id: 'e9', date: '2026-06-05', title: 'Try-on engine kickoff', type: 'sprint' },
  { id: 'e10', date: '2026-06-09', title: 'Story templates ship', type: 'sprint' },
  { id: 'e11', date: '2026-06-15', title: "Father's Day (US)", type: 'global' },
  { id: 'e12', date: '2026-06-19', title: 'Juneteenth (US)', type: 'global' },
  { id: 'e13', date: '2026-05-20', title: 'Quarterly OKR review', type: 'manual' },
]

interface CalendarState {
  events: CalendarEvent[]
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set) => ({
      events: SAMPLE_EVENTS,
      addEvent: (event) => set((s) => ({
        events: [...s.events, { ...event, id: 'e' + Date.now() }],
      })),
    }),
    { name: 'productos-calendar' }
  )
)
```

- [ ] **Step 24: Run test to verify it passes**

Run: `npm run test -- calendarStore`
Expected: PASS

- [ ] **Step 25: Commit**

```bash
git add frontend/src/store/calendarStore.ts frontend/src/store/calendarStore.test.ts
git commit -m "feat: add calendarStore"
```

- [ ] **Step 26: Write failing test for `notificationsStore`**

`frontend/src/store/notificationsStore.test.ts`:
```ts
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
```

- [ ] **Step 27: Run test to verify it fails**

Run: `npm run test -- notificationsStore`
Expected: FAIL — module not found

- [ ] **Step 28: Implement `notificationsStore.ts`**

Port seed data + `dismissNotif` logic from `app.jsx` lines 15-21 and 47-50:
```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Notification {
  id: string
  title: string
  date: string
  type: 'sprint' | 'global' | 'manual'
  read: boolean
}

const SEED: Notification[] = [
  { id: 'nt1', title: 'Paywall A/B ships in 3 days', date: 'May 22', type: 'sprint', read: false },
  { id: 'nt2', title: 'Memorial Day (US)', date: 'May 26', type: 'global', read: false },
  { id: 'nt3', title: 'Onboarding redesign ETA', date: 'May 24', type: 'sprint', read: false },
  { id: 'nt4', title: 'Quarterly OKR review', date: 'May 20', type: 'manual', read: false },
  { id: 'nt5', title: 'Bulk export QA pass', date: 'May 27', type: 'sprint', read: true },
]

interface NotificationsState {
  notifications: Notification[]
  dismiss: (id: string) => void
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      notifications: SEED,
      dismiss: (id) => set((s) => ({
        notifications: id === 'all'
          ? s.notifications.map(n => ({ ...n, read: true }))
          : s.notifications.filter(n => n.id !== id),
      })),
    }),
    { name: 'productos-notifications' }
  )
)
```

- [ ] **Step 29: Run test to verify it passes**

Run: `npm run test -- notificationsStore`
Expected: PASS

- [ ] **Step 30: Commit**

```bash
git add frontend/src/store/notificationsStore.ts frontend/src/store/notificationsStore.test.ts
git commit -m "feat: add notificationsStore"
```

- [ ] **Step 31: Write failing test for `uiStore`**

`frontend/src/store/uiStore.test.ts`:
```ts
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
```

- [ ] **Step 32: Run test to verify it fails**

Run: `npm run test -- uiStore`
Expected: FAIL — module not found

- [ ] **Step 33: Implement `uiStore.ts`**

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UiState {
  theme: 'light' | 'dark'
  sidebarCollapsed: boolean
  toggleTheme: () => void
  toggleSidebar: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarCollapsed: false,
      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    { name: 'productos-ui' }
  )
)
```

- [ ] **Step 34: Run test to verify it passes**

Run: `npm run test -- uiStore`
Expected: PASS

- [ ] **Step 35: Commit**

```bash
git add frontend/src/store/uiStore.ts frontend/src/store/uiStore.test.ts
git commit -m "feat: add uiStore for theme and sidebar state"
```

---

### Task 5: Sidebar + Topbar

**Files:**
- Create: `frontend/src/components/ui/Sidebar.tsx`
- Create: `frontend/src/components/ui/Topbar.tsx`

Source: `docs/superpowers/design-reference/product-os/project/shell.jsx` lines 3-141 (skip `LoginScreen`, lines 143-193 — out of scope per the design spec).

- [ ] **Step 1: Port `Sidebar.tsx`**

From `shell.jsx` lines 3-48. Replace `active`/`onNav`/`onLogout` props with `react-router-dom`'s `useLocation`/`useNavigate`, and `collapsed`/`onToggle` with `useUiStore`:
```tsx
import { useLocation, useNavigate } from 'react-router-dom'
import { I } from './Icon'
import { useUiStore } from '../../store/uiStore'

const NAV_ITEMS = [
  { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: I.Home },
  { id: 'calendar', path: '/calendar', label: 'Calendar', icon: I.Calendar, badge: 4 },
  { id: 'sprint', path: '/sprint', label: 'Sprint Tracker', icon: I.Check },
  { id: 'pack', path: '/pack', label: 'Pack Dashboard', icon: I.Package },
  { id: 'localization', path: '/localization', label: 'Localization', icon: I.Globe },
  { id: 'notes', path: '/notes', label: 'Notes', icon: I.Note },
  { id: 'ai', path: '/ai', label: 'AI Assistant', icon: I.Chat },
  { id: 'links', path: '/links', label: 'Important Links', icon: I.Link },
]

export function Sidebar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { sidebarCollapsed, toggleSidebar } = useUiStore()

  return (
    <aside className="sidebar">
      <button className="sidebar-toggle" onClick={toggleSidebar} title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
        {sidebarCollapsed ? <I.ChevR size={12}/> : <I.ChevL size={12}/>}
      </button>
      <div className="sidebar-brand">
        <div className="brand-mark">P</div>
        <div className="brand-text">Product<span className="dot">OS</span></div>
      </div>
      {!sidebarCollapsed && <div className="sidebar-section-label">Workspace</div>}
      {NAV_ITEMS.map(it => {
        const Ic = it.icon
        const active = pathname.startsWith(it.path)
        return (
          <div key={it.id}
               className={`nav-item ${active ? 'active' : ''}`}
               onClick={() => navigate(it.path)}
               title={sidebarCollapsed ? it.label : ''}>
            <Ic/>
            <span>{it.label}</span>
            {it.badge ? <span className="badge">{it.badge}</span> : null}
          </div>
        )
      })}
      <div className="sidebar-spacer"/>
      <div className="sidebar-footer">
        <div className={`nav-item ${pathname.startsWith('/settings') ? 'active' : ''}`} onClick={() => navigate('/settings')} title={sidebarCollapsed ? 'Settings' : ''}>
          <I.Gear/><span>Settings</span>
        </div>
      </div>
    </aside>
  )
}
```
(The prototype's "Sign out" nav item is dropped — login/logout is out of scope per the design spec.)

- [ ] **Step 2: Port `Topbar.tsx`**

From `shell.jsx` lines 62-141. Replace `active` prop with route-derived label, `theme`/`onTheme` with `useUiStore`, `notifications`/`onDismissNotif` with `useNotificationsStore`:
```tsx
import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { I } from './Icon'
import { useUiStore } from '../../store/uiStore'
import { useNotificationsStore } from '../../store/notificationsStore'

const PAGE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard', calendar: 'Calendar', sprint: 'Sprint Tracker',
  pack: 'Pack Dashboard', localization: 'Localization', notes: 'Notes',
  ai: 'AI Assistant', links: 'Important Links', settings: 'Settings',
}

export function Topbar() {
  const { pathname } = useLocation()
  const activeKey = pathname.split('/')[1] || 'dashboard'
  const { theme, toggleTheme } = useUiStore()
  const { notifications, dismiss } = useNotificationsStore()
  const [notifOpen, setNotifOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) { setNotifOpen(false); setMenuOpen(false) }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const unread = notifications.filter(n => !n.read).length

  return (
    <header className="topbar" ref={wrap}>
      <div className="crumb">
        <span>Workspace</span>
        <span className="sep">/</span>
        <span className="current">{PAGE_LABELS[activeKey] || 'Dashboard'}</span>
      </div>
      <div className="topbar-spacer"/>
      <div className="search-box">
        <I.Search size={14}/>
        <input placeholder="Search sprints, notes, links…"/>
        <span className="kbd">⌘K</span>
      </div>
      <button className={`icon-btn ${notifOpen ? 'active' : ''}`} onClick={() => { setNotifOpen(o => !o); setMenuOpen(false) }} title="Notifications">
        <I.Bell/>
        {unread > 0 && <span className="dot"/>}
      </button>
      <button className="icon-btn" onClick={toggleTheme} title={theme === 'light' ? 'Dark mode' : 'Light mode'}>
        {theme === 'light' ? <I.Moon/> : <I.Sun/>}
      </button>
      <div className="avatar" onClick={() => { setMenuOpen(m => !m); setNotifOpen(false) }}>JS</div>

      {notifOpen && (
        <div className="popover" style={{ right: 80, minWidth: 380 }}>
          <div className="popover-head">
            <h4>Notifications</h4>
            <button className="btn ghost sm" onClick={() => dismiss('all')}>Mark all read</button>
          </div>
          <div style={{ maxHeight: 380, overflow: 'auto' }}>
            {notifications.length === 0 ? (
              <div className="empty"><I.Bell size={28}/><div className="e-title">All caught up</div><div className="e-sub">No new events</div></div>
            ) : notifications.map(n => (
              <div key={n.id} className="popover-item" style={{ opacity: n.read ? 0.6 : 1 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 6,
                  background: n.type === 'sprint' ? 'var(--blue)' : n.type === 'global' ? 'var(--amber)' : 'var(--gray-400)',
                }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{n.title}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                    {n.date} · <span style={{ textTransform: 'capitalize' }}>{n.type}</span>
                  </div>
                </div>
                <button className="icon-btn" style={{ width: 22, height: 22 }} onClick={() => dismiss(n.id)}>
                  <I.X size={12}/>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="popover" style={{ right: 16, minWidth: 200 }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Jordan Singh</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>jordan@productos.app</div>
          </div>
          <div className="popover-item" onClick={() => setMenuOpen(false)}><I.Gear size={14}/> <span style={{ fontSize: 13 }}>Account settings</span></div>
        </div>
      )}
    </header>
  )
}
```
(The "Sign out" actions in both popovers are dropped — out of scope.)

- [ ] **Step 3: Verify it compiles**

Run: `npm run build` — expect errors only from files not yet created (App.tsx wiring comes in Task 6).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/ui/Sidebar.tsx frontend/src/components/ui/Topbar.tsx
git commit -m "feat: port Sidebar and Topbar with router + store wiring"
```

---

### Task 6: App shell + router

**Files:**
- Modify: `frontend/src/main.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Wire up the router in `main.tsx`**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
```

- [ ] **Step 2: Replace `App.tsx` with the route-based shell**

```tsx
import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from './components/ui/Sidebar'
import { Topbar } from './components/ui/Topbar'
import { ToastProvider } from './components/ui/Toast'
import { useUiStore } from './store/uiStore'
import { Dashboard } from './features/dashboard/Dashboard'
import { Calendar } from './features/calendar/Calendar'
import { Sprint } from './features/sprint/Sprint'
import { Pack } from './features/pack/Pack'
import { Localization } from './features/localization/Localization'
import { Notes } from './features/notes/Notes'
import { AIAssistant } from './features/ai-assistant/AIAssistant'
import { Links } from './features/links/Links'
import { Settings } from './features/settings/Settings'

export default function App() {
  const { theme, sidebarCollapsed } = useUiStore()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        document.querySelector<HTMLInputElement>('.topbar input')?.focus()
      }
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  return (
    <ToastProvider>
      <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Sidebar/>
        <div className="main-col">
          <Topbar/>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
            <Route path="/dashboard" element={<Dashboard/>}/>
            <Route path="/calendar" element={<Calendar/>}/>
            <Route path="/sprint" element={<Sprint/>}/>
            <Route path="/pack" element={<Pack/>}/>
            <Route path="/localization" element={<Localization/>}/>
            <Route path="/notes" element={<Notes/>}/>
            <Route path="/ai" element={<AIAssistant/>}/>
            <Route path="/links" element={<Links/>}/>
            <Route path="/settings" element={<Settings/>}/>
          </Routes>
        </div>
      </div>
    </ToastProvider>
  )
}
```

This task will not compile until Task 7 creates the feature files — that's expected; proceed to Task 7 immediately, don't try to verify/commit yet. Commit both tasks together at the end of Task 7's last step.

---

### Task 7: Feature modules

For each module below: read the cited reference file, write the component(s) reading from the listed store(s) instead of props, then verify and commit. Markup (JSX return blocks, the table/grid/card structure, all `className` strings) carries over **unchanged** — only the state/props plumbing changes (store hooks replace `useState`/prop-drilling for shared data; purely local UI state like `open`/`hover`/`q` stays as local `useState`).

**Files:**
- Create: `frontend/src/features/dashboard/Dashboard.tsx`
- Create: `frontend/src/features/calendar/Calendar.tsx`
- Create: `frontend/src/features/sprint/Sprint.tsx`
- Create: `frontend/src/features/pack/Pack.tsx`
- Create: `frontend/src/features/notes/Notes.tsx`
- Create: `frontend/src/features/ai-assistant/AIAssistant.tsx`
- Create: `frontend/src/features/links/Links.tsx`
- Create: `frontend/src/features/settings/Settings.tsx`
- Create: `frontend/src/features/localization/Localization.tsx`

- [ ] **Step 1: `Dashboard.tsx`**

Source: `modules-overview.jsx` lines 3-134. Replace the `goTo` prop with `useNavigate()` (`goTo('sprint')` → `navigate('/sprint')`). Replace `SPRINTS`/`SAMPLE_EVENTS` globals with `useSprintsStore().sprints` / `useCalendarStore().events`. Keep all JSX (KPI row, panels, bar chart) unchanged. Import `AppLogo`, `StatusBadge`, `I` from `../../components/ui/*`.

- [ ] **Step 2: Verify and commit**

Run `npm run dev`, navigate to `/dashboard`, confirm KPI row, sprints-in-motion list, this-week events, bar chart, and blockers render with the seeded data.
```bash
git add frontend/src/App.tsx frontend/src/main.tsx frontend/src/features/dashboard
git commit -m "feat: wire router/App shell and port Dashboard"
```

- [ ] **Step 3: `Calendar.tsx`**

Source: `modules-overview.jsx` lines 140-297 (`pad`, `isoDate` helpers + `Calendar` component). Replace `events`/`setEvents` props with `useCalendarStore()` (`events`, `addEvent`). The `saveEvent` local function changes from `setEvents(es => [...es, {...}])` to `addEvent({ date, title, type })`. Keep the 6-week grid logic, modal, and legend unchanged.

- [ ] **Step 4: Verify and commit**

Run the app, navigate to `/calendar`, confirm the May 2026 grid renders with today highlighted, click a day, add an event, confirm it appears on the grid.
```bash
git add frontend/src/features/calendar
git commit -m "feat: port Calendar module"
```

- [ ] **Step 5: `Sprint.tsx`**

Source: `sprint.jsx` (full file, 372 lines — `STATUS_CONFIG`, `STAGE_DOT`, `StatusGlyph`, `PriorityFlag`, `appColor`, `Sprint`, `SprintRow`, `FilterMenu`, `SprintDrawer`). Replace `sprints`/`setSprints` props with `useSprintsStore()` (`sprints`, `cycleStatus`, `updateSprint`). The `cycleStatus(id, e)` local function becomes a thin wrapper: `(id, e) => { e.stopPropagation(); cycleStatus(id); toast('Status updated') }`. The `update(id, patch)` local function is replaced by calling `updateSprint` directly. Replace the `APPS` global import with `import { APPS } from '../../store/sprintsStore'`. All filter/grouping/search local state stays as component `useState`.

- [ ] **Step 6: Verify and commit**

Run the app, navigate to `/sprint`, confirm grouped sections render, click a status glyph to cycle it, open the drawer and edit a field, confirm it persists (reload the page, edit should still be there via localStorage).
```bash
git add frontend/src/features/sprint
git commit -m "feat: port Sprint Tracker module"
```

- [ ] **Step 7: `Pack.tsx`**

Source: `pack.jsx` (full file, 411 lines). Replace the internal `rows`/`setRows` `useState(PRODUCT_ROWS)` with `usePackStore()` (`rows`, `updateRow`). Import `TAG_DEFS`, `SHEETS` from `../../store/packStore` instead of redefining them locally. The `update(id, patch)` local function is replaced by `updateRow`. Keep `sheetId`, `q`, `tagFilter`, `editId` as local `useState`. Keep `InlineText`, `InlineNum`, `LiveSelect`, `CellCheckbox`, `PackEditDrawer` as-is (same file or split into separate files under `features/pack/` — your call, keeping `Pack.tsx` under ~400 lines is reasonable so splitting `PackEditDrawer` into `PackEditDrawer.tsx` is fine).

- [ ] **Step 8: Verify and commit**

Run the app, navigate to `/pack`, confirm sheet tabs, grouped category column with merged cells, and color-tagged rows render. Click a cell to inline-edit, confirm it saves. Click a row to open the edit drawer.
```bash
git add frontend/src/features/pack
git commit -m "feat: port Pack Dashboard module"
```

- [ ] **Step 9: `Notes.tsx`**

Source: `modules-tools.jsx` lines 3-106. Replace `notes`/`setNotes` props with `useNotesStore()` (`notes`, `updateNote`, `newNote`, `deleteNote`). The component's local `updateNote`/`newNote`/`deleteNote` wrapper functions are removed — call the store actions directly. Keep `selId`, `q`, `savedAt`, `saveTimer` as local state/refs, and the debounce `setTimeout` in the `onChange` handler (call `updateNote(sel.id, e.target.value)` directly instead of through a local wrapper, then debounce only the `savedAt` toast timestamp as in the original).

- [ ] **Step 10: Verify and commit**

Run the app, navigate to `/notes`, confirm the two-column layout, click a note, edit it, confirm the first line becomes the title and the list re-sorts/updates.
```bash
git add frontend/src/features/notes
git commit -m "feat: port Notes module"
```

- [ ] **Step 11: `AIAssistant.tsx`**

Source: `modules-tools.jsx` lines 109-206 (`SEED_CHAT` + `AIAssistant`). Port unchanged — this module has no shared store (its `msgs`/`input`/`typing` state is local-only and already self-contained, no real API call to wire).

- [ ] **Step 12: Verify and commit**

Run the app, navigate to `/ai`, send a message, confirm a typing indicator appears then a mock reply.
```bash
git add frontend/src/features/ai-assistant
git commit -m "feat: port AI Assistant module"
```

- [ ] **Step 13: `Links.tsx`**

Source: `modules-tools.jsx` lines 209-343 (`CAT_ICONS`, `CAT_COLORS`, `Links`, `LinkModal`). Replace `links`/`setLinks` props with `useLinksStore()` (`links`, `saveLink`, `deleteLink`). The local `save`/`del` wrapper functions are removed — call store actions directly (still show the toast after `saveLink`/`deleteLink` succeed, same as original).

- [ ] **Step 14: Verify and commit**

Run the app, navigate to `/links`, confirm category-colored cards render, filter by category, add a new link via the modal, confirm it appears.
```bash
git add frontend/src/features/links
git commit -m "feat: port Important Links module"
```

- [ ] **Step 15: `Settings.tsx`**

Source: `app.jsx` lines 93-165 (`Settings`, `ToggleSwitch`). Replace `theme`/`setTheme` props with `useUiStore()` (`theme`, `toggleTheme` — note the original `setTheme(t)` chip-click sets an explicit value; since `useUiStore` only exposes `toggleTheme`, change the chip's `onClick` to call `toggleTheme()` only when the clicked chip isn't already the active theme: `onClick={() => t !== theme && toggleTheme()}`). Keep `ToggleSwitch` and the static profile fields unchanged.

- [ ] **Step 16: Verify and commit**

Run the app, navigate to `/settings`, toggle the theme chip, confirm dark mode applies app-wide (check the sidebar/topbar too) and persists on reload.
```bash
git add frontend/src/features/settings
git commit -m "feat: port Settings module"
```

- [ ] **Step 17: `Localization.tsx` (placeholder)**

Per the design spec, this is intentionally NOT a port of `localization.jsx` — write a new minimal placeholder:
```tsx
import { I } from '../../components/ui/Icon'

export function Localization() {
  return (
    <div className="content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Localization</h1>
          <p className="page-sub">This module is being redesigned.</p>
        </div>
      </div>
      <div className="card empty" style={{ marginTop: 24 }}>
        <I.Globe size={28}/>
        <div className="e-title">Coming soon</div>
        <div className="e-sub">The localization workflow is being reworked and will land in a future update.</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 18: Verify and commit**

Run the app, navigate to `/localization`, confirm the placeholder renders with the sidebar nav item correctly highlighted.
```bash
git add frontend/src/features/localization
git commit -m "feat: add Localization placeholder screen"
```

---

### Task 8: Final integration pass

**Files:** none new — verification only.

- [ ] **Step 1: Run the full test suite**

Run: `npm run test` in `frontend/`
Expected: all store tests pass (sprintsStore, packStore, notesStore, linksStore, calendarStore, notificationsStore, uiStore).

- [ ] **Step 2: Run a production build**

Run: `npm run build` in `frontend/`
Expected: builds with no TypeScript errors.

- [ ] **Step 3: Manual smoke test**

Run `npm run dev`, open the app, and click through every sidebar nav item (Dashboard, Calendar, Sprint Tracker, Pack Dashboard, Localization, Notes, AI Assistant, Important Links, Settings). For each, confirm no console errors and the page matches the module description in the design spec. Toggle dark mode and collapse the sidebar; confirm both persist across a page reload.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: final integration pass for ProductOS frontend port"
```

---

## Out of scope (confirmed in design spec — do not implement)
- Real backend/auth/multi-user
- Localization's real input → Claude-generate → CSV flow
- Login screen
