import { describe, expect, it } from 'vitest'
import type { Todo } from '../types'
import { toISODate } from './date'
import { getStats, sanitizeTodos, selectVisibleTodos } from './select'

function makeTodo(
  overrides: Partial<Todo> & { id: string; title: string },
): Todo {
  return {
    completed: false,
    priority: 'medium',
    dueDate: null,
    createdAt: 0,
    ...overrides,
  }
}

function isoOffset(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return toISODate(date)
}

const defaults = { filter: 'all', query: '', sort: 'created' } as const

describe('sanitizeTodos', () => {
  it('returns an empty array for non-array input', () => {
    expect(sanitizeTodos(null)).toEqual([])
    expect(sanitizeTodos('nope')).toEqual([])
    expect(sanitizeTodos({})).toEqual([])
  })

  it('drops entries without a usable title', () => {
    const result = sanitizeTodos([
      { title: '   ' },
      { title: 42 },
      null,
      'string',
      { title: 'Keep me' },
    ])

    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Keep me')
  })

  it('repairs missing or invalid fields', () => {
    const [todo] = sanitizeTodos([{ title: 'Fix me', priority: 'urgent' }])

    expect(todo.priority).toBe('medium')
    expect(todo.completed).toBe(false)
    expect(todo.dueDate).toBeNull()
    expect(typeof todo.id).toBe('string')
    expect(todo.id.length).toBeGreaterThan(0)
    expect(Number.isFinite(todo.createdAt)).toBe(true)
  })

  it('preserves valid records', () => {
    const input = makeTodo({
      id: 'a1',
      title: 'Ship it',
      completed: true,
      priority: 'high',
      dueDate: '2026-03-01',
      createdAt: 123,
    })

    expect(sanitizeTodos([input])).toEqual([input])
  })

  it('does not mutate the input array', () => {
    const input = [makeTodo({ id: 'a', title: 'A' })]
    const snapshot = [...input]

    sanitizeTodos(input)

    expect(input).toEqual(snapshot)
  })
})

describe('selectVisibleTodos - filtering', () => {
  const todos = [
    makeTodo({ id: '1', title: 'Active task' }),
    makeTodo({ id: '2', title: 'Done task', completed: true }),
  ]

  it('returns everything for the "all" filter', () => {
    expect(selectVisibleTodos(todos, defaults)).toHaveLength(2)
  })

  it('returns only incomplete tasks for "active"', () => {
    const result = selectVisibleTodos(todos, { ...defaults, filter: 'active' })

    expect(result.map((todo) => todo.id)).toEqual(['1'])
  })

  it('returns only complete tasks for "completed"', () => {
    const result = selectVisibleTodos(todos, {
      ...defaults,
      filter: 'completed',
    })

    expect(result.map((todo) => todo.id)).toEqual(['2'])
  })
})

describe('selectVisibleTodos - searching', () => {
  const todos = [
    makeTodo({ id: '1', title: 'Write the README' }),
    makeTodo({ id: '2', title: 'Buy milk' }),
  ]

  it('matches case-insensitively on a substring', () => {
    const result = selectVisibleTodos(todos, { ...defaults, query: 'readme' })

    expect(result.map((todo) => todo.id)).toEqual(['1'])
  })

  it('ignores surrounding whitespace', () => {
    const result = selectVisibleTodos(todos, { ...defaults, query: '  MILK ' })

    expect(result.map((todo) => todo.id)).toEqual(['2'])
  })

  it('returns nothing when there is no match', () => {
    expect(selectVisibleTodos(todos, { ...defaults, query: 'zzz' })).toEqual([])
  })
})

describe('selectVisibleTodos - sorting', () => {
  it('sorts newest first by creation time', () => {
    const todos = [
      makeTodo({ id: 'old', title: 'Old', createdAt: 1 }),
      makeTodo({ id: 'new', title: 'New', createdAt: 3 }),
      makeTodo({ id: 'mid', title: 'Mid', createdAt: 2 }),
    ]

    const result = selectVisibleTodos(todos, { ...defaults, sort: 'created' })

    expect(result.map((todo) => todo.id)).toEqual(['new', 'mid', 'old'])
  })

  it('puts high priority first, then falls back to newest', () => {
    const todos = [
      makeTodo({ id: 'low', title: 'Low', priority: 'low', createdAt: 9 }),
      makeTodo({
        id: 'high-old',
        title: 'High old',
        priority: 'high',
        createdAt: 1,
      }),
      makeTodo({
        id: 'high-new',
        title: 'High new',
        priority: 'high',
        createdAt: 5,
      }),
      makeTodo({ id: 'med', title: 'Med', priority: 'medium', createdAt: 2 }),
    ]

    const result = selectVisibleTodos(todos, { ...defaults, sort: 'priority' })

    expect(result.map((todo) => todo.id)).toEqual([
      'high-new',
      'high-old',
      'med',
      'low',
    ])
  })

  it('sorts by due date and sinks undated tasks to the bottom', () => {
    const todos = [
      makeTodo({ id: 'none', title: 'No date' }),
      makeTodo({ id: 'late', title: 'Later', dueDate: '2026-06-01' }),
      makeTodo({ id: 'soon', title: 'Sooner', dueDate: '2026-05-01' }),
    ]

    const result = selectVisibleTodos(todos, { ...defaults, sort: 'due' })

    expect(result.map((todo) => todo.id)).toEqual(['soon', 'late', 'none'])
  })

  it('sorts alphabetically, case-insensitively', () => {
    const todos = [
      makeTodo({ id: 'b', title: 'banana' }),
      makeTodo({ id: 'a', title: 'Apple' }),
      makeTodo({ id: 'c', title: 'cherry' }),
    ]

    const result = selectVisibleTodos(todos, { ...defaults, sort: 'alpha' })

    expect(result.map((todo) => todo.id)).toEqual(['a', 'b', 'c'])
  })

  it('does not reorder the source array', () => {
    const todos = [
      makeTodo({ id: '2', title: 'B', createdAt: 1 }),
      makeTodo({ id: '1', title: 'A', createdAt: 2 }),
    ]
    const snapshot = [...todos]

    selectVisibleTodos(todos, { ...defaults, sort: 'created' })

    expect(todos).toEqual(snapshot)
  })
})

describe('getStats', () => {
  it('handles an empty list', () => {
    expect(getStats([])).toEqual({
      total: 0,
      active: 0,
      completed: 0,
      overdue: 0,
      percentComplete: 0,
    })
  })

  it('counts totals and rounds the completion percentage', () => {
    const stats = getStats([
      makeTodo({ id: '1', title: 'A', completed: true }),
      makeTodo({ id: '2', title: 'B', completed: true }),
      makeTodo({ id: '3', title: 'C' }),
    ])

    expect(stats.total).toBe(3)
    expect(stats.active).toBe(1)
    expect(stats.completed).toBe(2)
    expect(stats.percentComplete).toBe(67)
  })

  it('counts only incomplete tasks with a past due date as overdue', () => {
    const stats = getStats([
      makeTodo({ id: '1', title: 'Late', dueDate: isoOffset(-1) }),
      makeTodo({
        id: '2',
        title: 'Late but done',
        dueDate: isoOffset(-1),
        completed: true,
      }),
      makeTodo({ id: '3', title: 'Future', dueDate: isoOffset(2) }),
      makeTodo({ id: '4', title: 'Undated' }),
    ])

    expect(stats.overdue).toBe(1)
  })
})

