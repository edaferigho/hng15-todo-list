import type { TodoStats } from '../lib/select'

interface ProgressSummaryProps {
  stats: TodoStats
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${accent}`}>
        {value}
      </p>
    </div>
  )
}

export function ProgressSummary({ stats }: ProgressSummaryProps) {
  return (
    <section aria-label="Task progress" className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total"
          value={stats.total}
          accent="text-slate-900 dark:text-slate-100"
        />
        <StatCard
          label="Active"
          value={stats.active}
          accent="text-indigo-600 dark:text-indigo-400"
        />
        <StatCard
          label="Done"
          value={stats.completed}
          accent="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          accent="text-rose-600 dark:text-rose-400"
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-600 dark:text-slate-300">
            Progress
          </span>
          <span className="tabular-nums text-slate-500 dark:text-slate-400">
            {stats.percentComplete}%
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={stats.percentComplete}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Percentage of tasks completed"
          className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-[width] duration-500 ease-out"
            style={{ width: `${stats.percentComplete}%` }}
          />
        </div>
      </div>
    </section>
  )
}
