export type Priority = 'low' | 'medium' | 'high'

export type Filter = 'all' | 'active' | 'completed'

export type SortMode = 'created' | 'due' | 'priority' | 'alpha'

export interface Todo {
  id: string
  title: string
  completed: boolean
  priority: Priority
  /** ISO date string (`YYYY-MM-DD`) or `null` when no due date is set. */
  dueDate: string | null
  createdAt: number
}
