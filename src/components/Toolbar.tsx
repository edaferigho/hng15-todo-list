import type { Filter, SortMode } from '../types'
import { SearchIcon, TrashIcon, XIcon } from './icons'

interface ToolbarProps {
  filter: Filter
  onFilterChange: (filter: Filter) => void
  query: string
  onQueryChange: (query: string) => void
  sort: SortMode
  onSortChange: (sort: SortMode) => void
  counts: { all: number; active: number; completed: number }
  allCompleted: boolean
  hasCompleted: boolean
  onToggleAll: (completed: boolean) => void
  onClearCompleted: () => void
}

const SORT_LABELS: Record<SortMode, string> = {
  created: 'Newest first',
  due: 'Due date',
  priority: 'Priority',
  alpha: 'A → Z',
}

const FILTER_LABELS: Record<Filter, string> = {
  all: 'All',
  active: 'Active',
  completed: 'Completed',
}

const FILTERS: Filter[] = ['all', 'active', 'completed']

export function Toolbar({
  filter,
  onFilterChange,
  query,
  onQueryChange,
  sort,
  onSortChange,
  counts,
  allCompleted,
  hasCompleted,
  onToggleAll,
  onClearCompleted,
}: ToolbarProps) {
  return (
    <section
      aria-label="Task controls"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="tablist"
          aria-label="Filter tasks"
          className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
        >
          {FILTERS.map((value) => {
            const isActive = filter === value
            return (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onFilterChange(value)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                {FILTER_LABELS[value]}
                <span className="tabular-nums text-xs opacity-70">
                  {counts[value]}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <label htmlFor="todo-search" className="sr-only">
              Search tasks
            </label>
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="todo-search"
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search tasks…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-9 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none sm:w-56 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            {query ? (
              <button
                type="button"
                onClick={() => onQueryChange('')}
                aria-label="Clear search"
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="todo-sort"
              className="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
            >
              Sort
            </label>
            <select
              id="todo-sort"
              value={sort}
              onChange={(event) => onSortChange(event.target.value as SortMode)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              {(Object.keys(SORT_LABELS) as SortMode[]).map((value) => (
                <option key={value} value={value}>
                  {SORT_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        <button
          type="button"
          onClick={() => onToggleAll(!allCompleted)}
          disabled={counts.all === 0}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {allCompleted ? 'Mark all active' : 'Mark all complete'}
        </button>

        <button
          type="button"
          onClick={onClearCompleted}
          disabled={!hasCompleted}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
        >
          <TrashIcon className="h-4 w-4" />
          Clear completed
        </button>
      </div>
    </section>
  )
}
