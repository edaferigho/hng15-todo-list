import { ClipboardListIcon, SearchIcon } from './icons'

interface EmptyStateProps {
  variant: 'empty' | 'no-results' | 'all-done'
}

const CONTENT: Record<EmptyStateProps['variant'], { title: string; body: string }> =
  {
    empty: {
      title: 'Nothing here yet',
      body: 'Add your first task above and it will show up right here.',
    },
    'no-results': {
      title: 'No matching tasks',
      body: 'Try a different search term or switch back to the "All" filter.',
    },
    'all-done': {
      title: 'All caught up!',
      body: 'Every task in this view is complete. Enjoy the moment.',
    },
  }

export function EmptyState({ variant }: EmptyStateProps) {
  const { title, body } = CONTENT[variant]
  const Icon = variant === 'no-results' ? SearchIcon : ClipboardListIcon

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900/40">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        {body}
      </p>
    </div>
  )
}
