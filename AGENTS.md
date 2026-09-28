# AGENTS.md

Guidance for AI coding agents (and humans) working in this repository. Keep it
current: if you change a convention, boundary, or command, update this file in the
same commit.

---

## 1. What this is

**TaskFlow** — a single-page, fully client-side to-do list. There is **no backend**;
all state lives in `localStorage`. It builds to static files and is deployed to
Vercel.

| Concern    | Choice                                                     |
| ---------- | ---------------------------------------------------------- |
| UI         | React 19 (function components + hooks only)                 |
| Language   | TypeScript 6, `strict`, `noEmit`                            |
| Build      | Vite 8 (`@vitejs/plugin-react`)                             |
| Styling    | Tailwind CSS **v4** via `@tailwindcss/vite`                 |
| Tests      | Vitest 5 + Testing Library, `jsdom`                          |
| Deployment | Vercel (static, `vercel.json`)                               |
| Linting    | **None configured** — `typecheck` + `test` are the only gates |

### Live URLs

- Production: <https://hng15-todo-list.vercel.app>
- Repo: <https://github.com/edaferigho/hng15-todo-list>

---

## 2. Commands — the contract

```bash
npm install          # once
npm run dev          # dev server, http://localhost:5173
npm run typecheck    # tsc --noEmit            <- must pass
npm test             # vitest run (44 tests)   <- must pass
npm run build        # tsc && vite build       <- must pass
npm run preview      # serve dist/ locally
```

**Never commit code where any of the three "must pass" commands fails.** There is
no linter, so `typecheck` is the only thing standing between you and a whole class
of mistakes — do not skip it and do not "fix" it by loosening `tsconfig.json`.

> **Windows note:** `npm test` and `npm run build` can exceed a 30-second shell
> timeout on this machine. Run them via `Start-Process` redirecting to a log file
> and poll the log rather than assuming failure. Each shell invocation is a fresh
> process, so background jobs from a previous command do not survive.

---

## 3. Project map

```
index.html                  Vite entry; includes the pre-paint theme script
vercel.json                 Deployment config (framework/build/output/SPA rewrite)
vite.config.ts              react + tailwindcss plugins
vitest.config.ts            Test config (deliberately separate — see §5)
tsconfig.json               One strict config covering src + both vite configs

src/
├── main.tsx                Mounts <App /> into #root. Not a test target.
├── App.tsx                 Composition root: owns filter/query state, wires
│                           hooks to components. Keep it thin.
├── index.css               Tailwind entry + `@custom-variant dark` + base layer
├── types.ts                Shared domain types (Todo, Priority, Filter, …)
├── lib/                    PURE, framework-free logic. No React imports.
│   ├── constants.ts        STORAGE_KEYS — the single source of storage key truth
│   ├── date.ts             Local-timezone due-date maths (see §5)
│   ├── priority.ts         Priority metadata + the Tailwind class literals
│   ├── samples.ts          Demo tasks for the empty state
│   ├── select.ts           sanitizeTodos / selectVisibleTodos / getStats
│   └── storage.ts          Defensive localStorage wrapper
├── hooks/                  Stateful React glue
│   ├── useLocalStorage.ts  useState + persistence + optional `normalize`
│   ├── useTheme.ts         light/dark, applies `html.dark`
│   └── useTodos.ts         The todo collection + every mutation
├── components/             Presentation + local interaction state
└── test/setup.ts           jest-dom matchers, matchMedia stub, per-test reset
```

### Layering rules — respect the direction of imports

```
components  →  hooks  →  lib
     └──────────┴────────┴──→  types
```

- `lib/**` must **never** import React, hooks, or components. It stays pure and
  synchronous so it stays trivially testable.
- `hooks/**` may import `lib` and `types`, never `components`.
- `components/**` may import all of the above. Prefer passing data down as props
  over having components reach into storage or business logic themselves.
- Shared types live only in `src/types.ts`. Do not redeclare a `Todo` elsewhere.
- Storage keys live only in `lib/constants.ts`. Never inline a `'taskflow.*'`
  string anywhere else.

---

## 4. Load-bearing conventions

These are not style preferences. Breaking them causes real bugs or build failures.

### 4.1 TypeScript — `tsconfig.json` is strict on purpose

| Flag                    | What it forces you to do                                              |
| ----------------------- | --------------------------------------------------------------------- |
| `verbatimModuleSyntax`  | Type-only imports **must** use `import type { X }`. Use `import { x }` only for runtime values. |
| `erasableSyntaxOnly`    | **No** `enum`, `namespace`, or constructor parameter properties. Use unions + `as const` objects (see `lib/priority.ts`). |
| `noUnusedLocals` / `noUnusedParameters` | Delete unused imports and params — they are hard errors. |
| `noFallthroughCasesInSwitch` | Every non-empty `case` must `return`/`break`. `lib/select.ts#compare` is the reference. |
| `strict`                | No implicit `any`; handle `null` explicitly (`Todo.dueDate` is `string \| null`). |

`moduleDetection: force` means every file is a module — no global scripts in `src/`.

**Imports are extensionless**: `from '../types'`, `from './date'`. Keep it that way.

### 4.2 Tailwind CSS v4 — different from v3

- Styles enter through `@import 'tailwindcss'` in `src/index.css`. There is
  **no `tailwind.config.js` and no `postcss.config.js`** — do not create them.
  Theme tokens go in the `@theme { … }` block; base styles go in `@layer base`.
- Dark mode is **class-based**, enabled by
  `@custom-variant dark (&:where(.dark, .dark *))`. The `.dark` class is applied to
  `<html>` by `useTheme` (and by the inline script in `index.html` to avoid a flash
  of light mode). Never use `darkMode: 'media'`.
- **Never build class names dynamically.** Tailwind scans source text, so
  `` `bg-${color}-500` `` produces no CSS. Always store **complete literal class
  strings** in lookup objects. See `lib/priority.ts` (`PRIORITIES`) and
  `DUE_CLASSES` in `components/TodoItem.tsx` for the pattern to copy.
- Every element that changes appearance in dark mode needs both a light class and
  its `dark:` counterpart.

### 4.3 Dates — never use `Date` UTC parsing for due dates

Due dates are plain `YYYY-MM-DD` strings. Build and read them **only** through
`lib/date.ts` (`toISODate`, `todayISO`, `parseISODate`, `daysUntil`,
`getDueStatus`, `formatDueDate`). Constructing them via
`new Date('2026-01-05')` parses as UTC and shifts the day in negative-offset
timezones — that class of bug was deliberately engineered out. Don't reintroduce it.

### 4.4 Persistence

All reads/writes go through `lib/storage.ts` (`readJSON` / `writeJSON`), which
tolerates storage being unavailable, throwing, or full. Never call
`localStorage` directly.

- Hydrating persisted state through `useLocalStorage(key, initial, normalize)`
  is the pattern. `useTodos` passes `sanitizeTodos` as `normalize`, which runs
  **once on hydration** and repairs or drops malformed records. Any new persisted
  shape must be validated the same way — assume the stored payload is hostile.
- Bumping a stored shape's contract means bumping the key version
  (`taskflow.todos.v1` → `.v2`) in `lib/constants.ts`.

### 4.5 Accessibility is a requirement, not a nice-to-have

- Every icon-only `<button>` needs an `aria-label`.
- Every input needs a real `<label htmlFor>` (use `sr-only` to hide it visually).
- Status must be conveyed in text, not colour alone (due dates include
  "Overdue by 2 days", not just red text).
- Use the correct roles: `role="checkbox"` + `aria-checked` for the toggle,
  `role="progressbar"` + `aria-valuenow` for the bar, `role="alert"` for errors,
  `role="tab"` + `aria-selected` for the filters.
- Preserve keyboard behaviour: <kbd>Enter</kbd> submits, <kbd>Esc</kbd> cancels an
  edit. `:focus-visible` styling is defined globally in `index.css` — do not
  remove focus outlines.

### 4.6 Style

- 2-space indent, single quotes, **no semicolons**, trailing commas. Match the
  surrounding file exactly.
- Components are named exports (`export function TodoItem`); only `App.tsx` uses a
  default export (it is the one file imported by `main.tsx`).
- Files are `PascalCase.tsx` for components, `camelCase.ts` for modules, and
  `useThing.ts` for hooks.
- Prefer `function` declarations for components and top-level helpers; arrow
  functions for callbacks.
- Keep `App.tsx` thin. If a component exceeds ~150 lines, split it.

---

## 5. Testing

Colocated, named `*.test.ts(x)`, picked up by `include: ['src/**/*.test.{ts,tsx}']`.

- `vitest.config.ts` is **deliberately separate** from `vite.config.ts` so tests
  skip the Tailwind plugin and set `css: false`. Don't merge them.
- `globals: false` — import `describe/it/expect` explicitly from `'vitest'`.
- `src/test/setup.ts` stubs `window.matchMedia` (jsdom lacks it) and, after every
  test, unmounts, clears `localStorage`, and removes the `dark` class. Do not
  remove that reset — cross-test leakage is otherwise silent.
- Pure logic → unit tests in `lib/*.test.ts`. Behaviour through the UI →
  integration tests in `App.test.tsx` via `user-event`.

**Query discipline** (`App.test.tsx` was bitten by this): query by role or label,
and scope with `within()` before falling back to `getByText`. A bare
`getByText('High')` matches both the `<option>` and the badge and fails.

Add tests in the same commit as the behaviour.

---

## 6. How to structure a change

Work in this order. It keeps logic testable and prevents "logic buried in JSX".

1. **Locate the layer.** Ask *what kind of thing am I adding?*

   | The change is…                          | It goes in…                                  |
   | --------------------------------------- | -------------------------------------------- |
   | A pure rule (sort, filter, format, validate) | `src/lib/*.ts` + a unit test            |
   | A new persisted field                    | `src/types.ts`, `lib/constants.ts` (version bump), `sanitizeTodos` in `lib/select.ts` |
   | Shared mutable state or a mutation       | `src/hooks/useTodos.ts`                      |
   | Markup, styling, local form state        | `src/components/*.tsx`                       |
   | Wiring between hook state and components | `src/App.tsx` (keep minimal)                 |

2. **Types first.** Add/extend the type in `src/types.ts`. Let `tsc` tell you every
   place that must now handle it — that is the point of `strict`.

3. **Write the pure logic in `lib/` with a test**, before touching any component.
   If you cannot express the rule as a pure function, the design is wrong.

4. **Expose it through a hook** (`useTodos` for collection state) so components stay
   presentational. New mutations must use the `setTodos(prev => …)` updater form.

5. **Render it** in a component. Reuse `PRIORITIES` / `DUE_CLASSES` style lookup
   objects for any conditional styling; never template class names.

6. **Close the loop** with an integration test in `App.test.tsx` for anything a user
   can actually click.

### Worked example — adding a "tags" feature

```
src/types.ts           Todo gains `tags: string[]`
src/lib/constants.ts   storage key → taskflow.todos.v2
src/lib/select.ts      sanitizeTodos coerces tags to string[]; add tag filtering
src/lib/select.test.ts tests for sanitising + filtering by tag
src/hooks/useTodos.ts  TodoDraft/TodoPatch accept tags
src/components/TagInput.tsx   new component
src/components/TodoItem.tsx   render the tags
src/App.test.tsx       "filters tasks by tag"
```

Note the version bump — old payloads without `tags` must still load.

---

## 7. Definition of done

A change is complete only when **all** of these hold:

- [ ] `npm run typecheck` passes
- [ ] `npm test` passes, with new tests for new behaviour
- [ ] `npm run build` passes
- [ ] Logic lives in `lib/`, not in JSX
- [ ] New persisted state is validated in `sanitizeTodos`
- [ ] New icon buttons have `aria-label`s; new inputs have labels
- [ ] Dark-mode classes added for anything newly styled
- [ ] No hardcoded storage keys, dates via `lib/date.ts` only
- [ ] `AGENTS.md` / `README.md` updated if a convention or command changed

---

## 8. Commits & branches

- Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- Subject in the imperative mood, ≤ 72 chars.
- One logical change per commit; include the test in the same commit.
- Default branch is `main` and it is the deploy branch — keep it green.
- This machine has git at `C:\Program Files\Git\cmd\git.exe` (not on `PATH`), and
  the repo-local identity is `Edaferigho <edaferigho@users.noreply.github.com>`.

---

## 9. Deployment

Vercel, static output from `dist/`. `vercel.json` pins framework, install, build,
and output, plus an SPA rewrite so unknown paths serve `index.html`. Assets are
excluded from the rewrite.

```bash
vercel --prod        # production
vercel               # preview
```

**⚠️ Auto-deploy on push is not wired up.** The Vercel CLI reported
`Failed to link edaferigho/hng15-todo-list — you need to add a Login Connection to
your GitHub account first (400)`. Until someone completes
**Vercel → Account Settings → Login Connections → GitHub** and imports the repo,
pushing to `main` will **not** trigger a deployment; use `vercel --prod` manually.

---

## 10. Known gaps

Deliberately out of scope so far — do not assume they exist:

- **No ESLint or Prettier.** Match existing style by eye; `typecheck` is the gate.
- **No E2E/browser tests.** jsdom only.
- **No CI.** Nothing runs the tests automatically on push.
- **No dark-mode E2E assertion** beyond the class toggle.
- **No i18n.** All copy is hardcoded English.
- **No backend, auth, or sync.** Single-browser `localStorage` only — this is a
  product decision, not a missing piece.

---

## 11. Environment gotchas

Hard-won on this machine; they cost real debugging time.

- **Scaffolding lies.** `npm create vite . -- --template react-typescript`
  previously produced the **vanilla TS** template (no React, no `vite.config.ts`).
  Always verify `package.json` actually lists `react` before building on top.
- **Tailwind v4 ≠ v3.** The installed major version decides the setup. v4 is
  plugin-in-CSS; a `tailwind.config.js` will be silently ignored.
- **Shell editing corrupts files.** `echo {} > file.js` wrote UTF-16 with a BOM on
  PowerShell, which then failed to parse. Use the editor tool for file writes.
- **`&&` is not a statement separator** in this PowerShell version — use `;`.
- **Git and Vercel CLIs misbehave under PowerShell arg-passing.** Long commands with
  nested quotes get mangled; write a `.ps1` to `%TEMP%` and run it with
  `-File` instead. Also note these CLIs write normal progress to **stderr**, which
  PowerShell surfaces as a scary red error even on success — check `$LASTEXITCODE`
  rather than trusting the colour.
