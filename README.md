# TaskFlow — To-Do List

**🔗 Live demo: [hng15-todo-list.vercel.app](https://hng15-todo-list.vercel.app)**

A fast, accessible, fully client-side to-do list app built with **React 19**, **TypeScript**, **Vite** and **Tailwind CSS v4**. Every change is persisted to `localStorage`, so there is no backend to run and the app deploys as a static site.

## Features

- **Create tasks** with a name, priority (low / medium / high) and an optional due date.
- **Inline editing** — click the pencil to change a task's name, priority and due date, with <kbd>Esc</kbd> to cancel.
- **Complete / uncomplete** tasks from an accessible checkbox.
- **Delete** individual tasks, **clear all completed** in one click, or **mark all** complete/active.
- **Filter** by All / Active / Completed, each with a live count.
- **Search** across task names.
- **Sort** by newest, due date, priority or alphabetically.
- **Due-date awareness** — "Due today", "Due tomorrow", "Overdue by 2 days", colour-coded.
- **Progress dashboard** — totals for active, done and overdue, plus a progress bar.
- **Dark mode** that follows your OS by default and remembers your choice (no flash on load).
- **Empty states** for "no tasks", "no search results" and "all caught up".
- **Sample data** button so the app is never blank on a first visit.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

### Scripts

| Script              | Description                                     |
| ------------------- | ----------------------------------------------- |
| `npm run dev`       | Start the Vite dev server with HMR              |
| `npm run build`     | Type-check with `tsc` and build to `dist/`      |
| `npm run preview`   | Serve the production build locally              |
| `npm run typecheck` | Run TypeScript without emitting output          |
| `npm test`          | Run the full Vitest suite once                  |
| `npm run test:watch`| Re-run tests on change                          |

## Tests

44 tests across three files, run with [Vitest](https://vitest.dev) and
[Testing Library](https://testing-library.com) in a `jsdom` environment.

| File                  | Covers                                                       |
| --------------------- | ------------------------------------------------------------ |
| `src/lib/date.test.ts`| Local-date formatting, parsing, day maths and due-date labels |
| `src/lib/select.test.ts` | Filtering, search, all four sort modes, stats, sanitising |
| `src/App.test.tsx`    | Add / validate / toggle / edit / delete / filter / search / persist / theming |

```bash
npm test
```

## Project structure

```
src/
├─ components/       # Presentational + interactive UI pieces
│  ├─ EmptyState.tsx
│  ├─ ProgressSummary.tsx
│  ├─ ThemeToggle.tsx
│  ├─ TodoInput.tsx
│  ├─ TodoItem.tsx
│  ├─ Toolbar.tsx
│  └─ icons.tsx
├─ hooks/
│  ├─ useLocalStorage.ts   # useState + persistence
│  ├─ useTheme.ts          # dark/light with system default
│  └─ useTodos.ts          # todo collection + all mutations
├─ lib/
│  ├─ constants.ts         # storage keys
│  ├─ date.ts              # timezone-stable due-date helpers
│  ├─ priority.ts          # priority metadata
│  ├─ samples.ts           # demo tasks
│  ├─ select.ts            # filtering, sorting, stats, sanitising
│  └─ storage.ts           # defensive localStorage wrapper
├─ App.tsx
├─ index.css               # Tailwind entry
├─ main.tsx
└─ types.ts
```

## How data is stored

Tasks live under the key `taskflow.todos.v1` as JSON. On load they pass through
`sanitizeTodos()`, which drops malformed records and repairs missing fields, so a
corrupt or outdated payload can never crash the app. Theme is stored under
`taskflow.theme.v1` and sort order under `taskflow.sort.v1`.

Due dates are stored as plain `YYYY-MM-DD` strings and parsed into **local**
midnight, which avoids the off-by-one-day bugs you get from UTC parsing.

## Deploying to Vercel

The repo ships with a [`vercel.json`](./vercel.json) that pins the Vite
framework preset, build command and output directory, so no dashboard
configuration is required.

### Option A — Git integration (recommended)

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Vercel detects Vite automatically; accept the defaults and click **Deploy**.

Every push to `main` then produces a production deployment, and pull requests get
preview URLs.

### Option B — Vercel CLI

```bash
npm install -g vercel
vercel          # preview deployment
vercel --prod   # production deployment
```

## Accessibility

- A real `<ul>`/`<li>` list with `role="checkbox"` toggles that expose `aria-checked`.
- Every icon-only button has an `aria-label`; the search, sort, priority and date
  fields have associated `<label>`s (visually hidden where the design calls for it).
- Visible focus rings via `:focus-visible`, `role="progressbar"` with ARIA values,
  and `role="alert"` for validation errors.
- Full keyboard support: <kbd>Enter</kbd> to save, <kbd>Esc</kbd> to cancel an edit.

## Browser support

Any evergreen browser. Uses `crypto.randomUUID()` with a fallback, `localStorage`
with an in-memory fallback, and CSS `color-scheme`.
