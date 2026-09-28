import { describe, expect, it } from 'vitest'
import {
  daysUntil,
  formatDueDate,
  getDueStatus,
  parseISODate,
  toISODate,
} from './date'

function isoOffset(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return toISODate(date)
}

describe('toISODate', () => {
  it('formats using local date parts, not UTC', () => {
    expect(toISODate(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(toISODate(new Date(2026, 11, 31))).toBe('2026-12-31')
  })

  it('pads single-digit months and days', () => {
    expect(toISODate(new Date(2026, 8, 9))).toBe('2026-09-09')
  })
})

describe('parseISODate', () => {
  it('parses into local midnight', () => {
    const parsed = parseISODate('2026-01-05')

    expect(parsed).not.toBeNull()
    expect(parsed?.getFullYear()).toBe(2026)
    expect(parsed?.getMonth()).toBe(0)
    expect(parsed?.getDate()).toBe(5)
    expect(parsed?.getHours()).toBe(0)
  })

  it('returns null for malformed input', () => {
    expect(parseISODate('05/01/2026')).toBeNull()
    expect(parseISODate('2026-1-5')).toBeNull()
    expect(parseISODate('')).toBeNull()
  })
})

describe('daysUntil', () => {
  it('counts whole days relative to today', () => {
    expect(daysUntil(isoOffset(0))).toBe(0)
    expect(daysUntil(isoOffset(3))).toBe(3)
    expect(daysUntil(isoOffset(-2))).toBe(-2)
  })

  it('returns null for an unparseable date', () => {
    expect(daysUntil('not-a-date')).toBeNull()
  })
})

describe('getDueStatus', () => {
  it('classifies each bucket', () => {
    expect(getDueStatus(null)).toBe('none')
    expect(getDueStatus(isoOffset(-5))).toBe('overdue')
    expect(getDueStatus(isoOffset(0))).toBe('today')
    expect(getDueStatus(isoOffset(1))).toBe('tomorrow')
    expect(getDueStatus(isoOffset(4))).toBe('upcoming')
  })

  it('treats an invalid date as having no due date', () => {
    expect(getDueStatus('nonsense')).toBe('none')
  })
})

describe('formatDueDate', () => {
  it('uses relative labels for near dates', () => {
    expect(formatDueDate(isoOffset(0))).toBe('Due today')
    expect(formatDueDate(isoOffset(1))).toBe('Due tomorrow')
  })

  it('reports how late an overdue task is', () => {
    expect(formatDueDate(isoOffset(-1))).toBe('Overdue by 1 day')
    expect(formatDueDate(isoOffset(-3))).toBe('Overdue by 3 days')
  })

  it('falls back to the raw value when unparseable', () => {
    expect(formatDueDate('nonsense')).toBe('nonsense')
  })
})
