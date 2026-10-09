import type { ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'
import { Select } from '../ui/Input'
import { cn } from '../../utils/cn'

export interface FilterDef {
  key: string
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}

/**
 * Filter toolbar used by teacher / institution / admin analytics pages.
 * All controls are real selects bound to caller state.
 */
export function FilterBar({
  filters,
  onReset,
  right,
  className,
}: {
  filters: FilterDef[]
  onReset?: () => void
  right?: ReactNode
  className?: string
}) {
  const dirty = onReset && filters.some((f) => f.value !== '')

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-line bg-panel px-4 py-3.5 shadow-card sm:flex-row sm:flex-wrap sm:items-end',
        className,
      )}
    >
      <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {filters.map((f) => (
          <Select
            key={f.key}
            label={f.label}
            value={f.value}
            onChange={(e) => f.onChange(e.target.value)}
            options={f.options}
            placeholder="All"
          />
        ))}
      </div>

      <div className="flex items-center gap-2 sm:pb-0.5">
        {right}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            disabled={!dirty}
            className={cn(
              'inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 text-[13px] font-medium transition-colors',
              dirty
                ? 'text-ink-muted hover:bg-panel-muted'
                : 'cursor-not-allowed text-ink-faint opacity-60',
            )}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Reset
          </button>
        )}
      </div>
    </div>
  )
}

/** Small helper to build option lists from string arrays. */
export function toOptions(values: string[]): { value: string; label: string }[] {
  return values.map((v) => ({ value: v, label: v }))
}
