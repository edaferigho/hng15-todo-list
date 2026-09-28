import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Priority } from '../types'
import type { TodoDraft } from '../hooks/useTodos'
import { PRIORITIES } from '../lib/priority'
import { todayISO } from '../lib/date'
import { CalendarIcon, PlusIcon, XIcon } from './icons'

interface TodoInputProps {
  onAdd: (draft: TodoDraft) => void
}

export function TodoInput({ onAdd }: TodoInputProps) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!title.trim()) {
      setError('Give your task a name before adding it.')
      return
    }

    onAdd({ title, priority, dueDate: dueDate || null })

    setTitle('')
    setPriority('medium')
    setDueDate('')
    setError(null)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="todo-title" className="sr-only">
            Task name
          </label>
          <input
            id="todo-title"
            type="text"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value)
              if (error) setError(null)
            }}
            placeholder="What needs to be done?"
            autoComplete="off"
            aria-invalid={error !== null}
            aria-describedby={error ? 'todo-title-error' : undefined}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-950"
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
        >
          <PlusIcon className="h-4 w-4" />
          Add task
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <label
            htmlFor="todo-priority"
            className="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
          >
            Priority
          </label>
          <select
            id="todo-priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value as Priority)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            {PRIORITIES.map((meta) => (
              <option key={meta.value} value={meta.value}>
                {meta.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="todo-due"
            className="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
          >
            Due
          </label>
          <div className="relative">
            <CalendarIcon className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="todo-due"
              type="date"
              value={dueDate}
              min={todayISO()}
              onChange={(event) => setDueDate(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm text-slate-700 transition focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            />
          </div>
          {dueDate ? (
            <button
              type="button"
              onClick={() => setDueDate('')}
              className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Clear due date"
            >
              <XIcon className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {error ? (
        <p
          id="todo-title-error"
          role="alert"
          className="mt-3 text-sm text-rose-600 dark:text-rose-400"
        >
          {error}
        </p>
      ) : null}
    </form>
  )
}
