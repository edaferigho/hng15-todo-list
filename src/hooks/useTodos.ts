import { useCallback } from 'react'
import type { Priority, Todo } from '../types'
import { STORAGE_KEYS } from '../lib/constants'
import { sanitizeTodos } from '../lib/select'
import { useLocalStorage } from './useLocalStorage'

export interface TodoDraft {
  title: string
  priority: Priority
  dueDate: string | null
}

export interface TodoPatch {
  title?: string
  priority?: Priority
  dueDate?: string | null
  completed?: boolean
}

export type TodoAction =
  | { type: 'add'; draft: TodoDraft }
  | { type: 'update'; id: string; patch: TodoPatch }
  | { type: 'toggle'; id: string }
  | { type: 'remove'; id: string }

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function makeTodo(draft: TodoDraft): Todo {
  return {
    id: createId(),
    title: draft.title.trim(),
    completed: false,
    priority: draft.priority,
    dueDate: draft.dueDate,
    createdAt: Date.now(),
  }
}

function applyPatch(todo: Todo, patch: TodoPatch): Todo {
  const next: Todo = { ...todo }

  if (patch.title !== undefined) {
    const title = patch.title.trim()
    if (title) next.title = title
  }

  if (patch.priority !== undefined) next.priority = patch.priority
  if (patch.dueDate !== undefined) next.dueDate = patch.dueDate
  if (patch.completed !== undefined) next.completed = patch.completed

  return next
}

/**
 * Owns the todo collection and keeps it in sync with `localStorage`.
 * All mutations go through `setTodos` updater functions so they stay correct
 * even when several happen in the same tick.
 */
export function useTodos() {
  const [todos, setTodos] = useLocalStorage<Todo[]>(
    STORAGE_KEYS.todos,
    [],
    sanitizeTodos,
  )

  const addTodo = useCallback(
    (draft: TodoDraft) => {
      const title = draft.title.trim()
      if (!title) return

      setTodos((prev) => [makeTodo({ ...draft, title }), ...prev])
    },
    [setTodos],
  )

  const updateTodo = useCallback(
    (id: string, patch: TodoPatch) => {
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? applyPatch(todo, patch) : todo)),
      )
    },
    [setTodos],
  )

  const toggleTodo = useCallback(
    (id: string) => {
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo,
        ),
      )
    },
    [setTodos],
  )

  const deleteTodo = useCallback(
    (id: string) => {
      setTodos((prev) => prev.filter((todo) => todo.id !== id))
    },
    [setTodos],
  )

  const setAllCompleted = useCallback(
    (completed: boolean) => {
      setTodos((prev) => prev.map((todo) => ({ ...todo, completed })))
    },
    [setTodos],
  )

  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((todo) => !todo.completed))
  }, [setTodos])

  const clearAll = useCallback(() => {
    setTodos([])
  }, [setTodos])

  const replaceAll = useCallback(
    (next: Todo[]) => {
      setTodos(sanitizeTodos(next))
    },
    [setTodos],
  )

  return {
    todos,
    addTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    setAllCompleted,
    clearCompleted,
    clearAll,
    replaceAll,
  } as const
}
