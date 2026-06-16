# ProductOS Frontend — Design Spec

Date: 2026-06-16

## Source

This implements the handoff bundle exported from Claude Design (`claude.ai/design`), fetched from the user-provided design link. Bundle contents reviewed in full:
- `README.md` (handoff instructions)
- `chats/chat1.md` (design conversation — captures intent/iteration history)
- `project/ProductOS.html` + `project/*.jsx` + `project/styles.css` (the prototype: login, shell, dashboard, calendar, sprint tracker, pack dashboard, localization, notes, AI assistant, links, settings)

The prototype is a single static HTML page using React 18 + Babel-in-browser (no build step), with all state held in one `useState` blob in `App()` and no backend, no persistence, no real auth.

## Goal

Recreate the prototype pixel-for-pixel as a real, production-structured React app, in a `frontend/` folder at the project root. Match visual output; don't carry over the prototype's flat single-file structure.

## Decisions (confirmed with user)

1. **Stack**: React + Vite SPA. No backend in this pass. State persists to `localStorage` (matches the prototype's "edits persist as you navigate" behavior, just durable across reloads now).
2. **Scope**: All modules, full interaction fidelity — except Localization (see below).
3. **Localization module**: Nav item present, but the screen is a "coming soon" placeholder. The real input → Claude-generate → CSV flow is intentionally excluded because the design is being reworked next and the original flow can't safely ship an API key from a pure SPA. Do not stub a fake API call.
4. **Login**: Skipped entirely for this pass. The app loads straight into `/dashboard`. (The prototype's `LoginScreen` and `signedIn` gate are not ported.)
5. **AI Assistant**: Ported as-is — it's a seeded/mock chat in the prototype already (no real API call to replace).

## Architecture

### State management
One **Zustand store per domain**, each with `persist` middleware to `localStorage`:
- `useSprintsStore` — sprint cards (replaces `SPRINTS`/`sprints` state)
- `usePackStore` — pack dashboard rows (`PACK_DATA`/`pack`)
- `useNotesStore` — notes (`SAMPLE_NOTES`/`notes`)
- `useLinksStore` — important links (`SAMPLE_LINKS`/`links`)
- `useCalendarStore` — calendar events (`SAMPLE_EVENTS`/`events`)
- `useNotificationsStore` — topbar notifications
- `useUiStore` — theme (`light`/`dark`), sidebar collapsed state

This replaces prop-drilling from `App()`; each feature reads its own store(s) directly. Dashboard reads from `useSprintsStore` and `useCalendarStore` directly instead of receiving them as props.

### Routing
`react-router-dom`, one route per nav item, replacing the prototype's `page` string + switch statement:
`/dashboard`, `/calendar`, `/sprint`, `/pack`, `/localization` (placeholder), `/notes`, `/ai`, `/links`, `/settings`. `/` redirects to `/dashboard`. Sidebar/topbar active-state derives from the current route instead of a `page` prop.

### Folder structure
```
frontend/
  src/
    app/              App.tsx (router + layout shell), main.tsx
    store/            sprintsStore.ts, packStore.ts, notesStore.ts, linksStore.ts,
                       calendarStore.ts, notificationsStore.ts, uiStore.ts
    components/ui/     Icon.tsx (the I.* icon set), Spinner.tsx, StatusBadge.tsx,
                       AppLogo.tsx, Toast.tsx (ToastProvider/useToast),
                       Sidebar.tsx, Topbar.tsx
    features/
      dashboard/
      calendar/
      sprint/
      pack/
      localization/    (placeholder screen only)
      notes/
      ai-assistant/
      links/
      settings/
    styles/            global.css (ported from styles.css), theme variables
  index.html
  vite.config.ts
  package.json
```

Each `features/<module>/` folder owns its own components and reads whichever store(s) it needs. No central "pass everything down from App" pattern.

### Styling
`styles.css` (~40KB) is ported into `src/styles/global.css` largely verbatim — it already uses CSS variables for `data-theme="dark"` theming and is well-organized. This is the fastest path to pixel-accurate output and avoids introducing a CSS-in-JS or utility-class rewrite that risks visual drift. Google Fonts (Inter, JetBrains Mono) loaded the same way as the prototype.

The hand-rolled SVG icon set (`I.Home`, `I.Calendar`, etc. from `components.jsx`) is ported as-is into `components/ui/Icon.tsx` — no new icon library dependency.

### Modules — fidelity notes
All ported with full interaction behavior from the prototype and chat transcript:
- **Shell**: collapsible Claude.ai-style sidebar (full ↔ icon-only, hover handle, tooltips when collapsed), sticky topbar (search w/ ⌘K focus, notifications popover with read/dismiss, theme toggle, profile menu)
- **Dashboard**: KPI row, sprints-in-motion, this-week events, sprint mix chart, blockers needing attention
- **Calendar**: month grid, today highlight, color-coded event types, click-to-add event modal
- **Sprint Tracker**: dense Linear-style rows, status-cycle click, grouped/collapsible sections (status/stage/app), filter popovers, detail drawer with auto-save
- **Pack Dashboard**: sheet-tab style, grouped category column, inline cell edit, status dropdown pills, tag color legend, detail drawer
- **Notes**: two-column, debounced auto-save, first-line-as-title, delete-on-hover
- **AI Assistant**: chat stream, seeded conversation, typing indicator, suggested prompts, copy/regenerate (mock — no real API)
- **Important Links**: category-colored cards, search + category tabs, add/edit modal
- **Settings**: theme switcher, profile fields, notification toggles
- **Localization**: nav item + "coming soon" placeholder only
- Toast system + dark mode (`data-theme="dark"`) throughout

## Error handling
This is a local-only SPA with no network calls (Localization's API call is explicitly excluded). The only failure surface is `localStorage` (e.g., quota exceeded, disabled in private mode) — wrap store `persist` hydration in a try/catch that falls back to in-memory state and shows a toast, rather than crashing the app.

## Testing
Vitest + React Testing Library. Focus on store logic and module behaviors with real logic branches, not UI snapshots:
- Sprint status-cycle (Current → Next → Done → Current)
- Pack inline-edit-and-persist round trip through `localStorage`
- Notes debounce/auto-save and first-line-as-title derivation
- Sidebar collapsed/expanded state persistence
- Theme toggle persistence and `data-theme` attribute sync

## Out of scope (this pass)
- Real backend/auth/multi-user
- Localization's real input → Claude-generate → CSV flow
- Login screen
