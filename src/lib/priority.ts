import type { Priority } from '../types'

export interface PriorityMeta {
  value: Priority
  label: string
  /** Lower sorts first. */
  weight: number
  /** Complete Tailwind class strings so the JIT can detect them statically. */
  badge: string
  dot: string
}

export const PRIORITIES: readonly PriorityMeta[] = [
  {
    value: 'high',
    label: 'High',
    weight: 0,
    badge:
      'bg-rose-100 text-rose-700 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/30',
    dot: 'bg-rose-500',
  },
  {
    value: 'medium',
    label: 'Medium',
    weight: 1,
    badge:
      'bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30',
    dot: 'bg-amber-500',
  },
  {
    value: 'low',
    label: 'Low',
    weight: 2,
    badge:
      'bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30',
    dot: 'bg-emerald-500',
  },
] as const

export const PRIORITY_BY_VALUE: Record<Priority, PriorityMeta> =
  Object.fromEntries(PRIORITIES.map((meta) => [meta.value, meta])) as Record<
    Priority,
    PriorityMeta
  >

export function priorityWeight(priority: Priority): number {
  return PRIORITY_BY_VALUE[priority].weight
}

export function isPriority(value: unknown): value is Priority {
  return value === 'low' || value === 'medium' || value === 'high'
}
