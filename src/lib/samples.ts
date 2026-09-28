import type { Todo } from '../types'
import { toISODate } from './date'

function shiftDays(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return toISODate(date)
}

/** A tiny starter set so the app never feels empty on first visit. */
export function createSampleTodos(): Todo[] {
  const now = Date.now()

  return [
    {
      id: 'sample-1',
      title: 'Review the HNG Stage 1 requirements',
      completed: true,
      priority: 'high',
      dueDate: shiftDays(-1),
      createdAt: now - 3,
    },
    {
      id: 'sample-2',
      title: 'Ship the to-do list app to Vercel',
      completed: false,
      priority: 'high',
      dueDate: shiftDays(0),
      createdAt: now - 2,
    },
    {
      id: 'sample-3',
      title: 'Write the project README',
      completed: false,
      priority: 'medium',
      dueDate: shiftDays(2),
      createdAt: now - 1,
    },
    {
      id: 'sample-4',
      title: 'Tidy up the codebase',
      completed: false,
      priority: 'low',
      dueDate: null,
      createdAt: now,
    },
  ]
}
