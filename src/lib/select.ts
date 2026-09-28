import type { Filter, Priority, SortMode, Todo } from '../types'
import { isPriority, priorityWeight } from './priority'
import { daysUntil } from './date'

export interface TodoStats {
  total: number
  active: number
  completed: number
  overdue: number
  /** 0–100, rounded. */
  percentComplete: number
}

export interface SelectOptions {
  filter: Filter
  query: string
  sort: SortMode
}

/**
 * Coerce unknown persisted data into well-formed `Todo` records. Anything
 * malformed is dropped rather than crashing the app.
 */
export function sanitizeTodos(raw: unknown): Todo[] {
  if (!Array.isArray(raw)) {
    return []
  }

  const todos: Todo[] = []

  for (const item of raw) {
    if (typeof item !== 'object' || item === null) {
      continue
    }

    const candidate = item as Record<string, unknown>
    const title = typeof candidate.title === 'string' ? candidate.title.trim() : ''

    if (!title) {
      continue
    }

    const priority: Priority = isPriority(candidate.priority)
      ? candidate.priority
      : 'medium'

    todos.push({
      id:
        typeof candidate.id === 'string' && candidate.id
          ? candidate.id
          : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
      title,
      completed: candidate.completed === true,
      priority,
      dueDate: typeof candidate.dueDate === 'string' ? candidate.dueDate : null,
      createdAt:
        typeof candidate.createdAt === 'number' && Number.isFinite(candidate.createdAt)
          ? candidate.createdAt
          : Date.now(),
    })
  }

  return todos
}

function matchesFilter(todo: Todo, filter: Filter): boolean {
  if (filter === 'active') return !todo.completed
  if (filter === 'completed') return todo.completed
  return true
}

function matchesQuery(todo: Todo, query: string): boolean {
  if (!query) return true
  return todo.title.toLowerCase().includes(query.toLowerCase())
}

function compare(a: Todo, b: Todo, sort: SortMode): number {
  switch (sort) {
    case 'due': {
      // Soonest first; tasks without a due date sink to the bottom.
      if (a.dueDate === null && b.dueDate === null) return b.createdAt - a.createdAt
      if (a.dueDate === null) return 1
      if (b.dueDate === null) return -1
      return a.dueDate.localeCompare(b.dueDate)
    }
    case 'priority': {
      const delta = priorityWeight(a.priority) - priorityWeight(b.priority)
      return delta !== 0 ? delta : b.createdAt - a.createdAt
    }
    case 'alpha':
      return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
    case 'created':
    default:
      return b.createdAt - a.createdAt
  }
}

export function selectVisibleTodos(todos: Todo[], options: SelectOptions): Todo[] {
  const { filter, query, sort } = options
  const trimmed = query.trim()

  return todos
    .filter((todo) => matchesFilter(todo, filter) && matchesQuery(todo, trimmed))
    .sort((a, b) => compare(a, b, sort))
}

export function getStats(todos: Todo[]): TodoStats {
  const total = todos.length
  const completed = todos.filter((todo) => todo.completed).length
  const active = total - completed
  const overdue = todos.filter((todo) => {
    if (todo.completed || !todo.dueDate) return false
    const diff = daysUntil(todo.dueDate)
    return diff !== null && diff < 0
  }).length

  return {
    total,
    active,
    completed,
    overdue,
    percentComplete: total === 0 ? 0 : Math.round((completed / total) * 100),
  }
}
