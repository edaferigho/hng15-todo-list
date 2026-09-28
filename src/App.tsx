import { useMemo, useState } from 'react'
import type { Filter, SortMode } from './types'
import { STORAGE_KEYS } from './lib/constants'
import { getStats, selectVisibleTodos } from './lib/select'
import { createSampleTodos } from './lib/samples'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useTheme } from './hooks/useTheme'
import { useTodos } from './hooks/useTodos'
import { ThemeToggle } from './components/ThemeToggle'
import { TodoInput } from './components/TodoInput'
import { TodoItem } from './components/TodoItem'
import { Toolbar } from './components/Toolbar'
import { ProgressSummary } from './components/ProgressSummary'
import { EmptyState } from './components/EmptyState'
import { SparklesIcon } from './components/icons'

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const {
    todos,
    addTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    setAllCompleted,
    clearCompleted,
    replaceAll,
  } = useTodos()

  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useLocalStorage<SortMode>(
    STORAGE_KEYS.sort,
    'created',
  )

  const visibleTodos = useMemo(
    () => selectVisibleTodos(todos, { filter, query, sort }),
    [todos, filter, query, sort],
  )

  const stats = useMemo(() => getStats(todos), [todos])

  const counts = useMemo(
    () => ({ all: stats.total, active: stats.active, completed: stats.completed }),
    [stats],
  )

  const allCompleted = stats.total > 0 && stats.completed === stats.total
  const isEmptyState = todos.length === 0
  const emptyVariant = isEmptyState
    ? 'empty'
    : query.trim()
      ? 'no-results'
      : 'all-done'

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            TaskFlow
          </h1>
          <p className="mt-1 text-sm text-slate-500 sm:text-base dark:text-slate-400">
            A focused to-do list. Everything is saved in your browser.
          </p>
        </div>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>

      <TodoInput onAdd={addTodo} />

      {isEmptyState ? (
        <div className="flex flex-col items-center gap-4">
          <EmptyState variant="empty" />
          <button
            type="button"
            onClick={() => replaceAll(createSampleTodos())}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <SparklesIcon className="h-4 w-4" />
            Load sample tasks
          </button>
        </div>
      ) : (
        <>
          <ProgressSummary stats={stats} />

          <Toolbar
            filter={filter}
            onFilterChange={setFilter}
            query={query}
            onQueryChange={setQuery}
            sort={sort}
            onSortChange={setSort}
            counts={counts}
            allCompleted={allCompleted}
            hasCompleted={stats.completed > 0}
            onToggleAll={setAllCompleted}
            onClearCompleted={clearCompleted}
          />

          {visibleTodos.length === 0 ? (
            <EmptyState variant={emptyVariant} />
          ) : (
            <ul className="flex flex-col gap-3">
              {visibleTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleTodo}
                  onUpdate={updateTodo}
                  onDelete={deleteTodo}
                />
              ))}
            </ul>
          )}
        </>
      )}

      <footer className="mt-auto pt-4 text-center text-xs text-slate-400 dark:text-slate-500">
        Built with React, TypeScript, Vite &amp; Tailwind CSS.
      </footer>
    </div>
  )
}
