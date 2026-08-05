# ProductOS

ProductOS is a local product-management operating system for tracking product work across multiple apps, launches, assets, notes, links, analytics tasks, deeplinks, and team settings. It combines a React dashboard-style frontend with a small Express API that stores data as JSON files.

## What It Includes

- Dashboard with active sprint KPIs, blockers, upcoming events, and stage mix.
- Sprint tracker for product features, platforms, status, stage, ETAs, PRDs, Jira links, and review links.
- Calendar for sprint, global, manual, and task events.
- Pack dashboard for production/link tracking with inline row updates and tag states.
- Notes workspace with rich editing support.
- Important links library grouped by category.
- GA implementation tracker and deeplink tracker.
- Tasks module for lightweight execution tracking.
- AI assistant screen with seeded/mock chat behavior.
- Settings for profile and product workspace preferences.

## Tech Stack

- Frontend: React, TypeScript, Vite, React Router, Zustand, TipTap.
- Backend: Node.js, Express, CORS.
- Storage: JSON files under `backend/data/` during local development.
- Tests: Vitest and React Testing Library for frontend store/module logic.

## Project Structure

```text
.
+-- backend/
|   +-- server.js          # Express API and static frontend host
|   +-- package.json
|   +-- data/              # Local JSON data files, ignored by git
+-- frontend/
|   +-- src/
|   |   +-- components/ui/ # Shared shell, topbar, icons, badges, toast UI
|   |   +-- features/      # ProductOS modules and screens
|   |   +-- store/         # Zustand domain stores
|   |   +-- styles/
|   |   +-- App.tsx
|   |   +-- main.tsx
|   +-- package.json
|   +-- vite.config.ts
+-- docs/                  # Design references, specs, and planning notes
+-- package.json           # Root scripts for setup, build, start, and dev
+-- README.md
```

## Getting Started

Install dependencies from the repo root:

```bash
npm run setup
```

Run the backend API:

```bash
npm run dev:backend
```

Run the frontend dev server in another terminal:

```bash
npm run dev:frontend
```

The Vite app will run on the port printed by Vite, usually `http://localhost:5173`. API calls are made to `/api/*`; in production-style usage, the Express server can serve the built frontend from `frontend/dist`.

## Production Build

Build the frontend:

```bash
npm run build
```

Start the Express server:

```bash
npm start
```

The backend listens on `http://localhost:3001` and serves `frontend/dist` when that folder exists.

## Useful Scripts

Root scripts:

```bash
npm run setup         # Install backend and frontend dependencies
npm run build         # Build the frontend
npm start             # Start backend/server.js
npm run dev:backend   # Run backend with Node watch mode
npm run dev:frontend  # Run Vite frontend dev server
```

Frontend scripts:

```bash
npm run lint --prefix frontend
npm run test --prefix frontend
npm run preview --prefix frontend
```

## API Overview

The backend exposes JSON CRUD endpoints for the main ProductOS domains:

```text
GET/POST       /api/sprints
GET/PUT/DELETE /api/sprints/:id
GET/POST       /api/calendar
GET/PUT/DELETE /api/calendar/:id
GET/POST       /api/tasks
GET/PUT/DELETE /api/tasks/:id
GET/POST       /api/notes
GET/PUT/DELETE /api/notes/:id
GET/POST       /api/links
GET/PUT/DELETE /api/links/:id
GET/POST       /api/ga
GET/PUT/DELETE /api/ga/:id
GET/POST       /api/deeplinks
GET/PUT/DELETE /api/deeplinks/:id
GET/POST       /api/pack
GET/PUT/DELETE /api/pack/:id
GET/PUT        /api/settings
```

Data is stored in `backend/data/*.json`. That directory is ignored by git, so local data stays local.

## Notes

- `backend/data/` is intentionally ignored because it contains local mutable workspace data.
- `frontend/dist/` and `node_modules/` are ignored and should be generated locally.
- The AI assistant is currently a mock/seeded experience, not a live AI API integration.
- The localization module is present in navigation, with deeper generation workflows intended for later implementation.
