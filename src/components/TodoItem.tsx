import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import type { Priority, Todo } from '../types'
import type { TodoPatch } from '../hooks/useTodos'
import { PRIORITIES, PRIORITY_BY_VALUE } from '../lib/priority'
import { formatDueDate, getDueStatus } from '../lib/date'
import type { DueStatus } from '../lib/date'
import {
  CalendarIcon,
  CheckIcon,
  PencilIcon,
  TrashIcon,
  XIcon,
} from './icons'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onUpdate: (id: string, patch: TodoPatch) => void
  onDelete: (id: string) => void
}

const DUE_CLASSES: Record<DueStatus, string> = {
  none: '',
  overdue: 'text-rose-600 dark:text-rose-400 font-medium',
  today: 'text-amber-600 dark:text-amber-400 font-medium',
  tomorrow: 'text-sky-600 dark:text-sky-400',
  upcoming: 'text-slate-500 dark:text-slate-400',
}

export function TodoItem({ todo, onToggle, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(todo.title)
  const [draftPriority, setDraftPriority] = useState<Priority>(todo.priority)
  const [draftDueDate, setDraftDueDate] = useState(todo.dueDate ?? '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  function startEditing() {
    setDraftTitle(todo.title)
    setDraftPriority(todo.priority)
    setDraftDueDate(todo.dueDate ?? '')
    setIsEditing(true)
  }

  function cancelEditing() {
    setIsEditing(false)
  }

  function commitEditing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!draftTitle.trim()) {
      return
    }

    onUpdate(todo.id, {
      title: draftTitle,
      priority: draftPriority,
      dueDate: draftDueDate || null,
    })
    setIsEditing(false)
  }

  function handleFieldKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      cancelEditing()
    }
  }

  const dueStatus = getDueStatus(todo.dueDate)
  const priorityMeta = PRIORITY_BY_VALUE[todo.priority]

  if (isEditing) {
    return (
      <li className="rounded-2xl border border-indigo-300 bg-white p-4 shadow-sm dark:border-indigo-500/50 dark:bg-slate-900">
        <form onSubmit={commitEditing} className="flex flex-col gap-3">
          <label htmlFor={`edit-title-${todo.id}`} className="sr-only">
            Edit task name
          </label>
          <input
            id={`edit-title-${todo.id}`}
            ref={inputRef}
            type="text"
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            onKeyDown={handleFieldKeyDown}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-base text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />

          <div className="flex flex-wrap items-center gap-3">
            <select
              aria-label="Priority"
              value={draftPriority}
              onChange={(event) =>
                setDraftPriority(event.target.value as Priority)
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              {PRIORITIES.map((meta) => (
                <option key={meta.value} value={meta.value}>
                  {meta.label}
                </option>
              ))}
            </select>

            <input
              type="date"
              aria-label="Due date"
              value={draftDueDate}
              onChange={(event) => setDraftDueDate(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            />

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={cancelEditing}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <XIcon className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                <CheckIcon className="h-4 w-4" />
                Save
              </button>
            </div>
          </div>
        </form>
      </li>
    )
  }
  return (
    <li className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <div className="flex items-start gap-3">
        <button
          type="button"
          role="checkbox"
          aria-checked={todo.completed}
          onClick={() => onToggle(todo.id)}
          aria-label={
            todo.completed
              ? `Mark "${todo.title}" as active`
              : `Mark "${todo.title}" as complete`
          }
          className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            todo.completed
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-slate-300 text-transparent hover:border-indigo-500 dark:border-slate-600'
          }`}
        >
          <CheckIcon className="h-3.5 w-3.5" />
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={`text-base break-words ${
              todo.completed
                ? 'text-slate-400 line-through dark:text-slate-500'
                : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {todo.title}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${priorityMeta.badge}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${priorityMeta.dot}`} />
              {priorityMeta.label}
            </span>

            {todo.dueDate ? (
              <span
                className={`inline-flex items-center gap-1 text-xs ${DUE_CLASSES[dueStatus]}`}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                {formatDueDate(todo.dueDate)}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={startEditing}
            aria-label={`Edit "${todo.title}"`}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(todo.id)}
            aria-label={`Delete "${todo.title}"`}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </li>
  )
}

