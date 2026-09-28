/**
 * Date helpers. Due dates are stored as plain `YYYY-MM-DD` strings so that they
 * are timezone-stable — we never round-trip them through `Date` UTC parsing.
 */

const MS_PER_DAY = 86_400_000

function pad(value: number): string {
  return value.toString().padStart(2, '0')
}

/** Format a `Date` to a local `YYYY-MM-DD` string. */
export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Today's date as a local `YYYY-MM-DD` string. */
export function todayISO(): string {
  return toISODate(new Date())
}

/** Parse a `YYYY-MM-DD` string into a local-midnight `Date`. */
export function parseISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) {
    return null
  }

  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))

  return Number.isNaN(date.getTime()) ? null : date
}

/** Whole days from today until `dueDate`. Negative means the date has passed. */
export function daysUntil(dueDate: string): number | null {
  const due = parseISODate(dueDate)

  if (!due) {
    return null
  }

  const today = new Date()
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  )

  return Math.round((due.getTime() - startOfToday.getTime()) / MS_PER_DAY)
}

export type DueStatus = 'none' | 'overdue' | 'today' | 'tomorrow' | 'upcoming'

export function getDueStatus(dueDate: string | null): DueStatus {
  if (!dueDate) {
    return 'none'
  }

  const diff = daysUntil(dueDate)

  if (diff === null) {
    return 'none'
  }

  if (diff < 0) {
    return 'overdue'
  }

  if (diff === 0) {
    return 'today'
  }

  if (diff === 1) {
    return 'tomorrow'
  }

  return 'upcoming'
}

/** Short, human-friendly label for a due date (e.g. "Today", "Overdue by 2 days"). */
export function formatDueDate(dueDate: string): string {
  const date = parseISODate(dueDate)

  if (!date) {
    return dueDate
  }

  const diff = daysUntil(dueDate) ?? 0

  if (diff < 0) {
    const late = Math.abs(diff)
    return late === 1 ? 'Overdue by 1 day' : `Overdue by ${late} days`
  }

  if (diff === 0) return 'Due today'
  if (diff === 1) return 'Due tomorrow'

  if (diff <= 6) {
    return `Due ${date.toLocaleDateString(undefined, { weekday: 'long' })}`
  }

  return `Due ${date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year:
      date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  })}`
}
